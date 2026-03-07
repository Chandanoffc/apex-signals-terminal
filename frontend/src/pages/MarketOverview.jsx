import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

function formatVol(v) {
  if (v == null) return '—';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  return (v / 1e3).toFixed(1) + 'K';
}

function formatMc(v) {
  if (v == null) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

export default function MarketOverview() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMarket()
      .then((data) => setAssets(data.assets || []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading market data…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Overview</h1>
        <p className="text-apex-muted mt-1">Top 100 assets (CoinMarketCap)</p>
      </div>

      <div className="rounded-lg border border-apex-border bg-apex-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-apex-panel border-b border-apex-border text-left text-apex-muted">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">24h %</th>
                <th className="px-4 py-3 font-medium">Volume 24h</th>
                <th className="px-4 py-3 font-medium">Market Cap</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.symbol} className="border-b border-apex-border/50 hover:bg-apex-border/20">
                  <td className="px-4 py-3 font-mono text-apex-muted">{a.rank}</td>
                  <td className="px-4 py-3 font-mono font-medium">{a.symbol}</td>
                  <td className="px-4 py-3 font-mono">
                    {a.price >= 1 ? a.price.toFixed(2) : a.price?.toFixed(6)}
                  </td>
                  <td className={`px-4 py-3 font-mono ${a.change24h >= 0 ? 'text-apex-long' : 'text-apex-short'}`}>
                    {a.change24h != null ? `${a.change24h >= 0 ? '+' : ''}${a.change24h.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-apex-muted">{formatVol(a.volume24h)}</td>
                  <td className="px-4 py-3 font-mono text-apex-muted">{formatMc(a.marketCap)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/analysis/${a.symbol}`} className="text-apex-accent hover:underline">
                      Analyze
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
