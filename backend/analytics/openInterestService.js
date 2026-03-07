import { get, set } from '../utils/cache.js';

const oiHistory = new Map();
const OI_HISTORY_KEY = (s) => `oi_history_${s}`;
const OI_HISTORY_TTL = 5 * 60 * 1000;

export function recordOpenInterest(symbol, openInterest) {
  const key = OI_HISTORY_KEY(symbol);
  let arr = get(key) || oiHistory.get(key);
  if (!arr) arr = [];
  arr.push({ ts: Date.now(), openInterest });
  if (arr.length > 100) arr = arr.slice(-100);
  set(key, arr, OI_HISTORY_TTL);
  oiHistory.set(key, arr);
  return arr;
}

export function getOIPercentChange(symbol, currentOI) {
  const key = OI_HISTORY_KEY(symbol);
  const arr = get(key) || oiHistory.get(key) || [];
  if (arr.length < 2 || !currentOI) return null;
  const prev = arr[arr.length - 2];
  if (!prev?.openInterest) return null;
  const pct = ((currentOI - prev.openInterest) / prev.openInterest) * 100;
  return Math.round(pct * 10) / 10;
}

export function interpretOIAndPrice(priceChange, oiChangePct) {
  if (oiChangePct == null) return 'unknown';
  const priceUp = priceChange > 0;
  const oiUp = oiChangePct > 0;
  if (priceUp && oiUp) return 'bullish momentum';
  if (priceUp && !oiUp) return 'short squeeze';
  if (!priceUp && oiUp) return 'bearish momentum';
  return 'long liquidation';
}
