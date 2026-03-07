import fetch from 'node-fetch';
import { get, set } from '../utils/cache.js';

const BINANCE_FUTURES = 'https://fapi.binance.com';
const BINANCE_SPOT = 'https://api.binance.com';
const CACHE_TTL = 60 * 1000;

function cacheKey(prefix, symbol = '') {
  return symbol ? `binance_${prefix}_${symbol}` : `binance_${prefix}`;
}

export async function getPremiumIndex(symbol = 'BTCUSDT') {
  const key = cacheKey('premium', symbol);
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(`${BINANCE_FUTURES}/fapi/v1/premiumIndex?symbol=${symbol}`);
    const data = await res.json();
    if (data.lastFundingRate !== undefined) {
      const out = { symbol: data.symbol, fundingRate: parseFloat(data.lastFundingRate), markPrice: parseFloat(data.markPrice || 0) };
      set(key, out, CACHE_TTL);
      return out;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function getOpenInterest(symbol = 'BTCUSDT') {
  const key = cacheKey('oi', symbol);
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(`${BINANCE_FUTURES}/fapi/v1/openInterest?symbol=${symbol}`);
    const data = await res.json();
    if (data.openInterest !== undefined) {
      const out = { symbol, openInterest: parseFloat(data.openInterest) };
      set(key, out, CACHE_TTL);
      return out;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function getTicker24h(symbol = 'BTCUSDT') {

  const key = cacheKey('ticker24', symbol);
  const cached = get(key);

  if (cached) return cached;

  try {

    const res = await fetch(`${BINANCE_FUTURES}/fapi/v1/ticker/24hr?symbol=${symbol}`);
    const data = await res.json();

    console.log("Ticker response:", data);

    if (data && data.lastPrice) {

      const out = {
        symbol: data.symbol || symbol,
        priceChange: parseFloat(data.priceChange || 0),
        priceChangePercent: parseFloat(data.priceChangePercent || 0),
        lastPrice: parseFloat(data.lastPrice || 0),
        volume: parseFloat(data.volume || 0),
        quoteVolume: parseFloat(data.quoteVolume || 0)
      };

      set(key, out, CACHE_TTL);
      return out;

    }

    return null;

  } catch (e) {

    console.error("Binance ticker error:", e);
    return null;

  }
}

export async function getLiquidationOrders(symbol = 'BTCUSDT', limit = 100) {
  const key = cacheKey('liq', symbol) + '_' + limit;
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(`${BINANCE_FUTURES}/fapi/v1/forceOrders?symbol=${symbol}&limit=${limit}`);
    const data = await res.json();
    const orders = Array.isArray(data) ? data : [];
    set(key, orders, CACHE_TTL);
    return orders;
  } catch (e) {
    return [];
  }
}

export async function getOrderBookDepth(symbol = 'BTCUSDT', limit = 20) {
  const key = cacheKey('depth', symbol);
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(`${BINANCE_SPOT}/api/v3/depth?symbol=${symbol}&limit=${limit}`);
    const data = await res.json();
    if (data.bids && data.asks) {
      set(key, data, CACHE_TTL);
      return data;
    }
    return { bids: [], asks: [] };
  } catch (e) {
    return { bids: [], asks: [] };
  }
}

export async function getKlines(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
  const key = cacheKey('klines', symbol) + '_' + interval + '_' + limit;
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(
      `${BINANCE_SPOT}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      set(key, data, CACHE_TTL);
      return data;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function getAllPremiumIndex() {
  const key = 'binance_premium_all';
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(`${BINANCE_FUTURES}/fapi/v1/premiumIndex`);
    const data = await res.json();
    const out = Array.isArray(data) ? data : [];
    set(key, out, CACHE_TTL);
    return out;
  } catch (e) {
    return [];
  }
}

export async function getAllOpenInterest() {
  const key = 'binance_oi_all';
  const cached = get(key);
  if (cached) return cached;
  try {
    const res = await fetch(`${BINANCE_FUTURES}/fapi/v1/openInterest`);
    const data = await res.json();
    if (data.openInterest !== undefined) {
      set(key, data, CACHE_TTL);
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}
