import fetch from 'node-fetch';
import { get, set } from '../utils/cache.js';

const CMC_BASE = 'https://pro-api.coinmarketcap.com/v1';
const LISTINGS_KEY = 'cmc_listings_latest';

export async function getTop100Listings() {
  const cached = get(LISTINGS_KEY);
  if (cached) return cached;

  const apiKey = process.env.CMC_KEY;
  if (!apiKey) {
    console.warn('CMC_KEY not set, returning mock data');
    return getMockListings();
  }

  try {
    const res = await fetch(
      `${CMC_BASE}/cryptocurrency/listings/latest?limit=100&convert=USD`,
      {
        headers: { 'X-CMC_PRO_API_KEY': apiKey },
      }
    );
    const data = await res.json();
    if (data.data) {
      const normalized = data.data.map((c) => ({
        symbol: c.symbol,
        name: c.name,
        price: c.quote?.USD?.price ?? 0,
        change24h: c.quote?.USD?.percent_change_24h ?? 0,
        volume24h: c.quote?.USD?.volume_24h ?? 0,
        marketCap: c.quote?.USD?.market_cap ?? 0,
        rank: c.cmc_rank ?? 0,
      }));
      set(LISTINGS_KEY, normalized);
      return normalized;
    }
    return getMockListings();
  } catch (e) {
    console.error('CMC fetch error:', e.message);
    return getMockListings();
  }
}

function getMockListings() {
  return [
    { symbol: 'BTC', name: 'Bitcoin', price: 67240, change24h: 2.5, volume24h: 35e9, marketCap: 1.3e12, rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', price: 3450, change24h: 1.8, volume24h: 18e9, marketCap: 415e9, rank: 2 },
  ];
}
