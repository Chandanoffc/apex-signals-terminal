import {
    getPremiumIndex,
    getOpenInterest,
    getTicker24h,
    getLiquidationOrders,
    getOrderBookDepth,
    getKlines
  } from "../services/binanceService.js";
  
  export async function runAnalysis(pair){
  
    const ticker = await getTicker24h(pair);
  
    const lastPrice = Number(ticker?.lastPrice || 0);
    const change = Number(ticker?.priceChangePercent || 0);
    const volume = Number(ticker?.quoteVolume || 0);
  
    const oi = await getOpenInterest(pair);
    const funding = await getPremiumIndex(pair);
  
    return {
  
      symbol:pair,
      price:lastPrice,
      change24h:change,
      volume24h:volume,
  
      openInterest:oi?.openInterest || 0,
  
      fundingRate:funding?.fundingRate || 0,
  
      timestamp:new Date().toUTCString()
  
    };
  
  }