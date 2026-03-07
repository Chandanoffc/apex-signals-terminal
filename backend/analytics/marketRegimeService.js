import { getIndicatorSummary } from './indicatorsService.js';

export const REGIMES = {
  TRENDING: 'TRENDING',
  RANGING: 'RANGING',
  HIGH_VOLATILITY: 'HIGH_VOLATILITY',
  LOW_VOLATILITY: 'LOW_VOLATILITY',
};

function getBollingerWidth(bb) {
  if (!bb || !bb.upper || !bb.lower || !bb.middle) return 0;
  const range = bb.upper - bb.lower;
  return bb.middle > 0 ? range / bb.middle : 0;
}

export function detectRegime(indicators) {
  if (!indicators) return REGIMES.RANGING;

  const { adx, atr, bollinger, ema20, ema50, price } = indicators;
  const bbWidth = bollinger ? getBollingerWidth(bollinger) : 0;
  const emaMid = ema20 != null && ema50 != null ? (ema20 + ema50) / 2 : price;
  const emaDistance = price && emaMid ? Math.abs(price - emaMid) / emaMid : 0;

  const adxThreshold = 25;
  const atrPct = price && atr ? atr / price : 0;
  const highVolThreshold = 0.02;
  const lowVolThreshold = 0.008;
  const bbWidthHigh = 0.04;
  const bbWidthLow = 0.02;

  if (adx != null && adx > adxThreshold && emaDistance > 0.01) {
    return REGIMES.TRENDING;
  }
  if (atrPct > highVolThreshold || (bollinger && bbWidth > bbWidthHigh)) {
    return REGIMES.HIGH_VOLATILITY;
  }
  if (atrPct < lowVolThreshold && bbWidth < bbWidthLow) {
    return REGIMES.LOW_VOLATILITY;
  }
  return REGIMES.RANGING;
}

export function getRegimeStrategy(regime) {
  const map = {
    [REGIMES.TRENDING]: 'momentum signals',
    [REGIMES.RANGING]: 'mean reversion signals',
    [REGIMES.HIGH_VOLATILITY]: 'breakout signals',
    [REGIMES.LOW_VOLATILITY]: 'breakout preparation',
  };
  return map[regime] || 'general signals';
}

export function getRegimeFromKlines(klines) {
  const indicators = getIndicatorSummary(klines);
  return detectRegime(indicators);
}
