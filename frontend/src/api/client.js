const API_BASE = "https://apex-signals-terminal.onrender.com";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...options });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export const api = {
  getSignals: () => request('/signals'),
  getSignalHistory: (limit = 100) => request(`/signals/history?limit=${limit}`),
  getAnalysis: (symbol) => request(`/analysis/${symbol}USDT`),
  getMarket: () => request('/market'),
  getWhales: () => request('/whales'),
  getLiquidations: () => request('/liquidations'),
  getLiquidity: () => request('/liquidity'),
  getBacktest: () => request('/backtest'),
  getHealth: () => request('/health'),
};
