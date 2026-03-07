import { Router } from 'express';
import {
  getPremiumIndex,
  getOpenInterest,
  getTicker24h,
  getLiquidationOrders,
  getOrderBookDepth,
  getKlines,
} from '../services/binanceService.js';
import { getIndicatorSummary } from '../analytics/indicatorsService.js';
import { getRegimeFromKlines, getRegimeStrategy } from '../analytics/marketRegimeService.js';
import { getOIPercentChange, interpretOIAndPrice } from '../analytics/openInterestService.js';
import { recordOpenInterest } from '../analytics/openInterestService.js';
import { clusterLiquidations } from '../analytics/liquidationClusterService.js';
import { detectLiquidityZones, scoreStopHuntProbability } from '../analytics/liquidityMapService.js';
import { analyzeOrderBook } from '../analytics/orderBookService.js';

const router = Router();

function binanceSymbol(symbol) {
  return symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`;
}

router.get('/:symbol', async (req, res) => {
  try {
    const symbol = (req.params.symbol || 'BTC').toUpperCase();
    const pair = binanceSymbol(symbol);

    const [ticker, funding, oi, liqOrders, depth, klines] = await Promise.all([
      getTicker24h(pair),
      getPremiumIndex(pair),
      getOpenInterest(pair),
      getLiquidationOrders(pair, 100),
      getOrderBookDepth(pair, 25),
      getKlines(pair, '1h', 100),
    ]);

    if (!ticker) {
      return res.status(404).json({ error: 'Symbol not found' });
    }

    recordOpenInterest(pair, oi?.openInterest);
    const indicators = getIndicatorSummary(klines);
    const regime = getRegimeFromKlines(klines);
    const strategy = getRegimeStrategy(regime);
    const oiChangePct = getOIPercentChange(pair, oi?.openInterest);
    const oiInterpretation = interpretOIAndPrice(ticker.priceChangePercent || 0, oiChangePct);

    const clusters = clusterLiquidations(liqOrders, ticker.lastPrice);
    const liquidityZones = detectLiquidityZones(klines, depth);
    const zonesWithScore = [
      ...liquidityZones.resistance.map((z) => ({
        ...z,
        stopHuntProbability: scoreStopHuntProbability(z, clusters),
      })),
      ...liquidityZones.support.map((z) => ({
        ...z,
        stopHuntProbability: scoreStopHuntProbability(z, clusters),
      })),
    ];

    const orderBook = analyzeOrderBook(depth.bids, depth.asks);

    res.json({
      symbol,
      price: ticker.lastPrice,
      change24h: ticker.priceChangePercent,
      volume: ticker.quoteVolume,
      fundingRate: funding?.fundingRate,
      openInterest: oi?.openInterest,
      openInterestChangePct: oiChangePct,
      oiInterpretation,
      regime,
      strategy,
      indicators: indicators
        ? {
            rsi: indicators.rsi,
            ema20: indicators.ema20,
            ema50: indicators.ema50,
            emaAlignment: indicators.emaAlignment,
            atr: indicators.atr,
            adx: indicators.adx,
            vwap: indicators.vwap,
          }
        : null,
      liquidationClusters: clusters,
      liquidityZones: zonesWithScore,
      orderBook,
      klines: klines?.map((k) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
