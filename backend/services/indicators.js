import { RSI, SMA } from "technicalindicators";

export function computeIndicators(prices){

  const rsi = RSI.calculate({
    values: prices,
    period: 14
  });

  const sma = SMA.calculate({
    values: prices,
    period: 20
  });

  return {
    rsi: rsi[rsi.length-1],
    sma20: sma[sma.length-1]
  };
}