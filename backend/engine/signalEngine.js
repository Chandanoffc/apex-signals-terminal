import { getTop100Listings } from '../services/cmcService.js';
import {
  getPremiumIndex,
  getOpenInterest,
  getTicker24h,
  getLiquidationOrders,
  getOrderBookDepth,
  getKlines,
} from '../services/binanceService.js';
import { getIndicatorSummary } from '../analytics/indicatorsService.js';
import { detectRegime, getRegimeFromKlines, REGIMES } from '../analytics/marketRegimeService.js';
import { recordOpenInterest, getOIPercentChange, interpretOIAndPrice } from '../analytics/openInterestService.js';
import { isCrowdedLongs, isCrowdedShorts } from '../analytics/fundingService.js';
import { isVolumeSpike } from '../analytics/volumeService.js';
import { analyzeOrderBook } from '../analytics/orderBookService.js';
import { clusterLiquidations, getNearestCluster } from '../analytics/liquidationClusterService.js';
import { detectLiquidityZones, scoreStopHuntProbability } from '../analytics/liquidityMapService.js';
import { detectWhaleActivity } from '../analytics/whaleService.js';
import { computeRiskLevels } from './riskEngine.js';
import { recordSignal } from './signalHistory.js';
import { dispatchAlerts } from '../services/alertService.js';

const MIN_SCORE = 6;
const FACTORS = {
  MOMENTUM: 1,
  VOLUME_SPIKE: 1,
  FUNDING_IMBALANCE: 1,
  OI_SPIKE: 1,
  RSI_MOMENTUM: 1,
  EMA_ALIGNMENT: 1,
  ORDER_BOOK_IMBALANCE: 1,
  LIQUIDATION_CLUSTER: 1,
  WHALE_ACTIVITY: 1,
  LIQUIDITY_POOL: 1,
  REGIME_ALIGNMENT: 1,
};

function binanceSymbol(symbol) {
  return symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`;
}

function scoreSignal(symbol, data) {
  let score = 0;
  const reasons = [];

  const {
    priceChangePercent = 0,
    fundingRate,
    oiChangePct,
    volumeSpike,
    rsi,
    emaAlignment,
    orderBookPressure,
    liquidationCluster,
    whaleAlerts,
    liquidityZone,
    regime,
    bias,
  } = data;

  if (bias === 'LONG' && priceChangePercent > 0) {
    score += FACTORS.MOMENTUM;
    reasons.push('momentum strength');
  } else if (bias === 'SHORT' && priceChangePercent < 0) {
    score += FACTORS.MOMENTUM;
    reasons.push('momentum strength');
  }

  if (volumeSpike) {
    score += FACTORS.VOLUME_SPIKE;
    reasons.push('volume spike');
  }

  if (fundingRate != null && (isCrowdedLongs(fundingRate) || isCrowdedShorts(fundingRate))) {
    score += FACTORS.FUNDING_IMBALANCE;
    reasons.push('funding imbalance');
  }

  if (oiChangePct != null && Math.abs(oiChangePct) > 5) {
    score += FACTORS.OI_SPIKE;
    reasons.push('open interest spike');
  }

  if (rsi != null) {
    if (bias === 'LONG' && rsi > 40 && rsi < 70) {
      score += FACTORS.RSI_MOMENTUM;
      reasons.push('RSI momentum');
    } else if (bias === 'SHORT' && rsi < 60 && rsi > 30) {
      score += FACTORS.RSI_MOMENTUM;
      reasons.push('RSI momentum');
    }
  }

  if (emaAlignment && ((bias === 'LONG' && emaAlignment === 'BULLISH') || (bias === 'SHORT' && emaAlignment === 'BEARISH'))) {
    score += FACTORS.EMA_ALIGNMENT;
    reasons.push('EMA alignment');
  }

  if (orderBookPressure && ((bias === 'LONG' && orderBookPressure === 'BUY') || (bias === 'SHORT' && orderBookPressure === 'SELL'))) {
    score += FACTORS.ORDER_BOOK_IMBALANCE;
    reasons.push('order book imbalance');
  }

  if (liquidationCluster) {
    score += FACTORS.LIQUIDATION_CLUSTER;
    reasons.push('liquidation cluster proximity');
  }

  if (whaleAlerts && whaleAlerts.length > 0) {
    score += FACTORS.WHALE_ACTIVITY;
    reasons.push('whale activity');
  }

  if (liquidityZone) {
    score += FACTORS.LIQUIDITY_POOL;
    reasons.push('liquidity pool zone');
  }

  if (regime) {
    if (regime === REGIMES.TRENDING && (bias === 'LONG' || bias === 'SHORT')) {
      score += FACTORS.REGIME_ALIGNMENT;
      reasons.push('regime alignment');
    } else if (regime === REGIMES.HIGH_VOLATILITY || regime === REGIMES.RANGING) {
      score += FACTORS.REGIME_ALIGNMENT;
      reasons.push('regime alignment');
    }
  }

  return { score: Math.min(score, 11), reasons };
}

function buildExplanation(data) {
  const parts = [];
  if (data.oiInterpretation) parts.push(data.oiInterpretation);
  if (data.fundingRate != null && (data.fundingRate > 0.01 || data.fundingRate < -0.01)) {
    parts.push(data.fundingRate > 0 ? 'crowded longs' : 'crowded shorts');
  }
  if (data.liquidationCluster) parts.push('nearby liquidation cluster suggesting possible squeeze');
  if (data.emaAlignment) parts.push(`${data.emaAlignment.toLowerCase()} EMA alignment`);
  if (data.regime) parts.push(`regime: ${data.regime}`);
  const bias = data.bias || 'LONG';
  const dir = bias === 'LONG' ? 'bullish' : 'bearish';
  return parts.length
    ? `${dir.charAt(0).toUpperCase() + dir.slice(1)} momentum with ${parts.join(', ')}.`
    : `${bias} signal based on technical and on-chain factors.`;
}

export async function analyzeSymbol(symbol) {
  const pair = binanceSymbol(symbol);
  const [ticker, funding, oi, liqOrders, depth, klines] = await Promise.all([
    getTicker24h(pair),
    getPremiumIndex(pair),
    getOpenInterest(pair),
    getLiquidationOrders(pair, 50),
    getOrderBookDepth(pair, 20),
    getKlines(pair, '1h', 100),
  ]);

  if (!ticker || !klines.length) return null;

  recordOpenInterest(pair, oi?.openInterest);

  const indicators = getIndicatorSummary(klines);
  const regime = detectRegime(indicators);
  const oiChangePct = getOIPercentChange(pair, oi?.openInterest);
  const oiInterpretation = interpretOIAndPrice(ticker.priceChangePercent || 0, oiChangePct);

  const volumeSpike = indicators?.volumeSma
    ? isVolumeSpike(indicators.volume, indicators.volumeSma)
    : false;

  const ob = analyzeOrderBook(depth.bids, depth.asks);
  const clusters = clusterLiquidations(liqOrders, ticker.lastPrice);
  const nearestCluster = getNearestCluster(
    clusters,
    ticker.lastPrice,
    ticker.priceChangePercent >= 0 ? 'LONG' : 'SHORT'
  );
  const liquidityZones = detectLiquidityZones(klines, depth);
  const nearestZone = [...liquidityZones.resistance, ...liquidityZones.support][0];
  const stopHuntScore = nearestZone
    ? scoreStopHuntProbability(nearestZone, clusters)
    : 0;

  const bias = (ticker.priceChangePercent >= 0 ? 'LONG' : 'SHORT');
  const whaleAlerts = detectWhaleActivity({
    currentVolume: indicators?.volume,
    avgVolume: indicators?.volumeSma,
    oiChangePct,
    orderBookImbalance: ob.imbalance,
  });

  const scoreData = {
    priceChangePercent: ticker.priceChangePercent,
    fundingRate: funding?.fundingRate,
    oiChangePct,
    volumeSpike,
    rsi: indicators?.rsi,
    emaAlignment: indicators?.emaAlignment,
    orderBookPressure: ob.pressure,
    liquidationCluster: !!nearestCluster && Math.abs(nearestCluster.distancePct) < 2,
    whaleAlerts,
    liquidityZone: stopHuntScore > 0.6,
    regime,
    bias,
  };

  const { score, reasons } = scoreSignal(symbol, scoreData);
  if (score < MIN_SCORE) return null;

  const risk = computeRiskLevels(
    ticker.lastPrice,
    indicators?.atr || ticker.lastPrice * 0.02,
    bias
  );

  const explanation = buildExplanation({
    ...scoreData,
    oiInterpretation,
    bias,
  });

  const signal = {
    symbol,
    bias,
    confidence: score,
    price: ticker.lastPrice,
    change24h: ticker.priceChangePercent,
    volume: ticker.quoteVolume,
    fundingRate: funding?.fundingRate,
    openInterestChange: oiChangePct != null ? `${oiChangePct > 0 ? '+' : ''}${oiChangePct}%` : null,
    marketRegime: regime,
    liquidationCluster: scoreData.liquidationCluster ? 'detected' : 'none',
    liquidityZone: nearestZone
      ? (nearestZone.price > ticker.lastPrice ? 'above price' : 'below price')
      : 'none',
    explanation,
    risk,
    reasons,
  };
  recordSignal(signal);
  dispatchAlerts(signal).catch(() => {});
  return signal;
}

const BINANCE_FUTURES_SYMBOLS = new Set(['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'BCH', 'FIL', 'APT', 'ARB', 'OP', 'INJ', 'SUI', 'SEI', 'TIA', 'NEAR', 'RUNE', 'AAVE', 'MKR', 'CRV', 'STX', 'PEPE', 'WIF', 'FLOKI', 'JUP', 'RENDER', 'FET', 'GRT', 'AAVE', 'LDO']);

export async function getRankedSignals() {
  const listings = await getTop100Listings();
  const fromListings = listings.map((c) => c.symbol).filter((s) => BINANCE_FUTURES_SYMBOLS.has(s));
  const symbols = fromListings.length >= 20 ? fromListings.slice(0, 30) : [...BINANCE_FUTURES_SYMBOLS].slice(0, 30);

  const results = await Promise.allSettled(symbols.slice(0, 30).map((s) => analyzeSymbol(s)));

  const signals = results
    .filter((r) => r.status === 'fulfilled' && r.value != null)
    .map((r) => r.value)
    .sort((a, b) => b.confidence - a.confidence);

  return signals;
}
