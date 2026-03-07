import { Router } from "express";

import {
  getPremiumIndex,
  getOpenInterest,
  getTicker24h,
  getLiquidationOrders,
  getOrderBookDepth,
  getKlines
} from "../services/binanceService.js";

import {
  getOIPercentChange,
  interpretOIAndPrice,
  recordOpenInterest
} from "../analytics/openInterestService.js";

import { clusterLiquidations } from "../analytics/liquidationClusterService.js";
import { detectLiquidityZones } from "../analytics/liquidityMapService.js";
import { analyzeOrderBook } from "../analytics/orderBookService.js";

const router = Router();

async function runAnalysis(pair) {

  try {

    const ticker = await getTicker24h(pair);

    const lastPrice = Number(ticker?.lastPrice || 0);
    const priceChangePercent = Number(ticker?.priceChangePercent || 0);
    const volume = Number(ticker?.quoteVolume || 0);

    const oi = await getOpenInterest(pair);
    const klines = await getKlines(pair,"15m",120);
    const depth = await getOrderBookDepth(pair);
    const liqOrders = await getLiquidationOrders(pair);
    const funding = await getPremiumIndex(pair);

    let fundingRate = funding?.fundingRate
      ? Number(funding.fundingRate) * 100
      : 0;

    let fundingSentiment = "NEUTRAL";

    if (fundingRate > 0.02) fundingSentiment = "OVERLONG";
    if (fundingRate < -0.02) fundingSentiment = "OVERSHORT";

    let oiChangePct = 0;
    let oiInterpretation = "neutral";

    if (oi?.openInterest) {

      recordOpenInterest(pair, oi.openInterest);

      oiChangePct =
        getOIPercentChange(pair, oi.openInterest) || 0;

      oiInterpretation =
        interpretOIAndPrice(priceChangePercent, oiChangePct) || "neutral";

    }

    const clusters =
      liqOrders
        ? clusterLiquidations(liqOrders, lastPrice)
        : [];

    const liquidityZones =
      klines?.length
        ? detectLiquidityZones(klines, depth)
        : { resistance: [], support: [] };

    const resistance =
      liquidityZones.resistance
        .slice(0,3)
        .map((z,i)=>[`R${i+1}`,Number(z.price)]);

    const support =
      liquidityZones.support
        .slice(0,3)
        .map((z,i)=>[`S${i+1}`,Number(z.price)]);

    const orderBook =
      depth
        ? analyzeOrderBook(depth.bids, depth.asks)
        : null;

    let bullScore = 0;
    let bearScore = 0;

    if(priceChangePercent>0) bullScore++;
    if(priceChangePercent<0) bearScore++;

    if(oiChangePct>0) bullScore++;
    if(oiChangePct<0) bearScore++;

    if(orderBook?.pressure==="BULLISH") bullScore++;
    if(orderBook?.pressure==="BEARISH") bearScore++;

    if(fundingSentiment==="OVERSHORT") bullScore++;
    if(fundingSentiment==="OVERLONG") bearScore++;

    let bias="neutral";

    if(bullScore>bearScore) bias="bullish";
    if(bearScore>bullScore) bias="bearish";

    const confidencePct =
      Math.min(
        100,
        Math.round((Math.max(bullScore,bearScore)/6)*100)
      );

    return {

      symbol:pair,

      currentPrice:lastPrice,
      priceChange24h:priceChangePercent,
      volume24h:volume,

      resistance,
      support,

      fundingRate,
      fundingSentiment,

      openInterest:oi?.openInterest || 0,
      openInterestChangePct:oiChangePct,
      oiInterpretation,

      bias,
      confidencePct,

      timestamp:new Date().toUTCString()

    };

  }

  catch(err){

    console.error("Analysis error:",err);
    throw err;

  }

}

router.get("/:symbol", async(req,res)=>{

  try{

    let symbol=req.params.symbol.toUpperCase();

    if(!symbol.endsWith("USDT"))
      symbol+="USDT";

    const data = await runAnalysis(symbol);

    res.json(data);

  }

  catch(err){

    res.status(500).json({
      error:"analysis_failed",
      message:err.message
    });

  }

});

export default router;