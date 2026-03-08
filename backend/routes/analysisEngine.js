import {
  getPremiumIndex,
  getOpenInterest,
  getTicker24h,
  getKlines
} from "../services/binanceService.js";

export async function runAnalysis(pair) {

  const ticker = await getTicker24h(pair);

  const lastPrice = Number(ticker?.lastPrice || 0);
  const change = Number(ticker?.priceChangePercent || 0);
  const volume = Number(ticker?.quoteVolume || 0);

  const high24 = Number(ticker?.highPrice || 0);
  const low24 = Number(ticker?.lowPrice || 0);

  const oi = await getOpenInterest(pair);
  const funding = await getPremiumIndex(pair);

  // Fetch candles for ATR calculation
  const candles = await getKlines(pair, "15m", 50);

  let atr = 0;

  if (candles && candles.length > 1) {

    let totalRange = 0;

    for (let i = 1; i < candles.length; i++) {

      const high = Number(candles[i][2]);
      const low = Number(candles[i][3]);

      totalRange += Math.abs(high - low);

    }

    atr = totalRange / candles.length;

  }

  const bullishProjection = lastPrice + (atr * 2);
  const bearishProjection = lastPrice - (atr * 2);

  const support = low24;
  const resistance = high24;

  return {

    symbol: pair,

    price: lastPrice,

    change24h: change,

    volume24h: volume,

    high24h: high24,

    low24h: low24,

    openInterest: oi?.openInterest || 0,

    fundingRate: funding?.fundingRate || 0,

    atr: atr,

    support: support,

    resistance: resistance,

    bullishProjection: bullishProjection,

    bearishProjection: bearishProjection,

    timestamp: new Date().toUTCString()

  };

}