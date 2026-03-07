import {
  RSI,
  EMA,
  MACD,
  ATR,
  BollingerBands,
  ADX,
  SMA,
} from 'technicalindicators';

export function computeRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return [];
  return RSI.calculate({ values: closes, period });
}

export function computeEMA(values, period) {
  if (!values || values.length < period) return [];
  return EMA.calculate({ values, period });
}

export function computeSMA(values, period) {
  if (!values || values.length < period) return [];
  return SMA.calculate({ values, period });
}

export function computeMACD(closes, options = {}) {
  const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = options;
  if (!closes || closes.length < slowPeriod + signalPeriod) return null;
  const result = MACD.calculate({
    values: closes,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  return result;
}

export function computeATR(highs, lows, closes, period = 14) {
  if (!highs || highs.length < period + 1) return [];
  return ATR.calculate({ high: highs, low: lows, close: closes, period });
}

export function computeBollingerBands(closes, period = 20, stdDev = 2) {
  if (!closes || closes.length < period) return null;
  return BollingerBands.calculate({ values: closes, period, stdDev });
}

export function computeADX(highs, lows, closes, period = 14) {
  if (!highs || highs.length < period * 2) return [];
  return ADX.calculate({ high: highs, low: lows, close: closes, period });
}

export function computeVWAP(highs, lows, closes, volumes) {
  if (!closes?.length || !volumes?.length) return [];
  const typical = highs && lows
    ? highs.map((h, i) => (h + lows[i] + closes[i]) / 3)
    : closes;
  const result = [];
  let cumTPV = 0;
  let cumV = 0;
  for (let i = 0; i < closes.length; i++) {
    const v = volumes[i] || 0;
    cumTPV += typical[i] * v;
    cumV += v;
    result.push(cumV > 0 ? cumTPV / cumV : typical[i]);
  }
  return result;
}

export function getIndicatorSummary(klines) {
  if (!klines || klines.length < 50) return null;
  const closes = klines.map((k) => parseFloat(k[4]));
  const highs = klines.map((k) => parseFloat(k[2]));
  const lows = klines.map((k) => parseFloat(k[3]));
  const volumes = klines.map((k) => parseFloat(k[5]));

  const rsiArr = computeRSI(closes, 14);
  const rsi = rsiArr.length ? rsiArr[rsiArr.length - 1] : null;

  const ema20 = computeEMA(closes, 20);
  const ema50 = computeEMA(closes, 50);
  const ema20Last = ema20.length ? ema20[ema20.length - 1] : null;
  const ema50Last = ema50.length ? ema50[ema50.length - 1] : null;
  const price = closes[closes.length - 1];
  const emaAlignment = ema20Last != null && ema50Last != null
    ? (ema20Last > ema50Last ? 'BULLISH' : 'BEARISH')
    : null;

  const macd = computeMACD(closes);
  const macdLast = macd && macd.length ? macd[macd.length - 1] : null;

  const atrArr = computeATR(highs, lows, closes, 14);
  const atr = atrArr.length ? atrArr[atrArr.length - 1] : null;

  const bb = computeBollingerBands(closes, 20, 2);
  const bbLast = bb && bb.lower.length
    ? { upper: bb.upper[bb.upper.length - 1], middle: bb.middle[bb.middle.length - 1], lower: bb.lower[bb.lower.length - 1] }
    : null;

  const adxArr = computeADX(highs, lows, closes, 14);
  const adx = adxArr.length ? adxArr[adxArr.length - 1] : null;

  const volumeSMA = computeSMA(volumes, 20);
  const volumeSmaLast = volumeSMA.length ? volumeSMA[volumeSMA.length - 1] : null;
  const volumeLast = volumes[volumes.length - 1] || 0;

  const vwapArr = computeVWAP(highs, lows, closes, volumes);
  const vwap = vwapArr.length ? vwapArr[vwapArr.length - 1] : null;

  return {
    rsi,
    ema20: ema20Last,
    ema50: ema50Last,
    emaAlignment,
    macd: macdLast,
    atr,
    bollinger: bbLast,
    adx,
    volumeSma: volumeSmaLast,
    volume: volumeLast,
    vwap,
    price,
  };
}
