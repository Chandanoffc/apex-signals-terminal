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

  symbol = symbol.toUpperCase().trim();

  // If already Binance format
  if (symbol.endsWith("USDT")) {
    return symbol;
  }

  // Convert coin → pair
  return `${symbol}USDT`;

}

router.get('/:symbol', async (req, res) => {

  try {

    let symbol = req.params.symbol.toUpperCase().trim();

    if (!symbol.endsWith("USDT")) {
      symbol = symbol + "USDT";
    }

    const pair = symbol;

    const ticker = await getTicker24h(pair);
    const oi = await getOpenInterest(pair);
    const klines = await getKlines(pair, "15m", 120);
    const depth = await getOrderBookDepth(pair);
    const liqOrders = await getLiquidationOrders(pair);

    recordOpenInterest(pair, oi?.openInterest);

    const indicators = getIndicatorSummary(klines);
    const regime = getRegimeFromKlines(klines);
    const strategy = getRegimeStrategy(regime);

    const oiChangePct = getOIPercentChange(pair, oi?.openInterest);
    const oiInterpretation = interpretOIAndPrice(ticker.priceChangePercent || 0, oiChangePct);

    const clusters = clusterLiquidations(liqOrders, ticker.lastPrice);
    const liquidityZones = detectLiquidityZones(klines, depth);

    const orderBook = analyzeOrderBook(depth.bids, depth.asks);

    res.json({
      symbol,
      price: ticker.lastPrice,
      change24h: ticker.priceChangePercent,
      volume: ticker.quoteVolume,
      fundingRate: funding?.fundingRate,
      openInterest: oi?.openInterest,
      indicators,
      regime,
      strategy,
      orderBook
    });

  } catch (e) {

    console.error(e);
    res.status(500).json({ error: e.message });

  }

});

export default router;
