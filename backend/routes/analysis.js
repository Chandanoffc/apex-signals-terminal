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
      symbol += "USDT";
    }

    const pair = symbol;

    console.log("Running analysis for:", pair);

    const ticker = await getTicker24h(pair);

    const lastPrice = ticker?.lastPrice || 0;
    const priceChangePercent = ticker?.priceChangePercent || 0;
    const volume = ticker?.quoteVolume || 0;

    const oi = await getOpenInterest(pair);
    const klines = await getKlines(pair, "15m", 120);

    if (!klines.length) {
      throw new Error("No kline data");
    }

    const depth = await getOrderBookDepth(pair);
    const liqOrders = await getLiquidationOrders(pair);

    res.json({
      symbol: pair,
      price: lastPrice
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      error: e.message
    });

  }

});

export default router;
