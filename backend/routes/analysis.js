import { Router } from "express";
import {
  getPremiumIndex,
  getOpenInterest,
  getTicker24h,
  getLiquidationOrders,
  getOrderBookDepth,
  getKlines
} from "../services/binanceService.js";

import { getIndicatorSummary } from "../analytics/indicatorsService.js";
import { getRegimeFromKlines, getRegimeStrategy } from "../analytics/marketRegimeService.js";
import { getOIPercentChange, interpretOIAndPrice, recordOpenInterest } from "../analytics/openInterestService.js";
import { clusterLiquidations } from "../analytics/liquidationClusterService.js";
import { detectLiquidityZones, scoreStopHuntProbability } from "../analytics/liquidityMapService.js";
import { analyzeOrderBook } from "../analytics/orderBookService.js";

const router = Router();

router.get("/:symbol", async (req, res) => {
  try {

    let symbol = req.params.symbol.toUpperCase().trim();

    if (!symbol.endsWith("USDT")) {
      symbol += "USDT";
    }

    const pair = symbol;

    console.log("Running analysis for:", pair);

    // -------- PRICE DATA --------

    const ticker = await getTicker24h(pair);

    const lastPrice = Number(ticker?.lastPrice || 0);
    const priceChangePercent = Number(ticker?.priceChangePercent || 0);
    const volume = Number(ticker?.quoteVolume || 0);

    // -------- MARKET DATA --------

    const oi = await getOpenInterest(pair);
    const klines = await getKlines(pair, "15m", 120);
    const depth = await getOrderBookDepth(pair);
    const liqOrders = await getLiquidationOrders(pair);

    // -------- SAFE ANALYTICS --------

    let indicators = null;
    let regime = null;
    let strategy = null;

    if (klines?.length) {
      indicators = getIndicatorSummary(klines);
      regime = getRegimeFromKlines(klines);
      strategy = getRegimeStrategy(regime);
    }

    // -------- OI ANALYSIS --------

    let oiChangePct = 0;
    let oiInterpretation = "neutral";

    if (oi?.openInterest) {
      recordOpenInterest(pair, oi.openInterest);
      oiChangePct = getOIPercentChange(pair, oi.openInterest) || 0;
      oiInterpretation = interpretOIAndPrice(priceChangePercent, oiChangePct) || "neutral";
    }

    // -------- LIQUIDATION ANALYSIS --------

    const clusters = liqOrders
      ? clusterLiquidations(liqOrders, lastPrice)
      : [];

    // -------- LIQUIDITY ZONES --------

    const liquidityZones = klines?.length
      ? detectLiquidityZones(klines, depth)
      : { resistance: [], support: [] };

    const zonesWithScore = [
      ...liquidityZones.resistance.map(z => ({
        ...z,
        stopHuntProbability: scoreStopHuntProbability(z, clusters)
      })),
      ...liquidityZones.support.map(z => ({
        ...z,
        stopHuntProbability: scoreStopHuntProbability(z, clusters)
      }))
    ];

    // -------- ORDERBOOK --------

    const orderBook = depth
      ? analyzeOrderBook(depth.bids, depth.asks)
      : null;

    // -------- SIMPLE SIGNAL ENGINE --------

    let bullScore = 0;
    let bearScore = 0;

    if (priceChangePercent > 0) bullScore++;
    if (priceChangePercent < 0) bearScore++;

    if (oiChangePct > 0) bullScore++;
    if (oiChangePct < 0) bearScore++;

    if (orderBook?.pressure === "BULLISH") bullScore++;
    if (orderBook?.pressure === "BEARISH") bearScore++;

    let bias = "neutral";

    if (bullScore > bearScore) bias = "bullish";
    if (bearScore > bullScore) bias = "bearish";

    // -------- AI STYLE SUMMARY --------

    let analysis = "Market conditions appear neutral.";

    if (bias === "bullish") {
      analysis = "Market momentum currently favors upside continuation.";
    }

    if (bias === "bearish") {
      analysis = "Market structure suggests bearish pressure.";
    }

    // -------- RESPONSE --------

    res.json({

      symbol: pair,

      currentPrice: Number(lastPrice.toFixed(2)),
      priceChange24h: Number(priceChangePercent.toFixed(2)),
      volume24h: Math.round(volume),

      openInterest: oi?.openInterest || 0,
      openInterestChangePct: oiChangePct,
      oiInterpretation,

      bullScore,
      bearScore,
      bullPct: bullScore * 20,

      bias,

      indicators: [
        [
          "PRICE TREND",
          priceChangePercent.toFixed(2) + "%",
          bias.toUpperCase(),
          bias === "bullish"
            ? "#00ff88"
            : bias === "bearish"
            ? "#ff3355"
            : "#ffcc00"
        ]
      ],

      analysis,

      timestamp: new Date().toUTCString()

    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      error: e.message
    });

  }
});

export default router;