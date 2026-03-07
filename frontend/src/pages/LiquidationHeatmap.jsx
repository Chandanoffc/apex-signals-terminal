import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function LiquidationHeatmap() {
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLiquidations()
      .then((data) => setHeatmap(data.heatmap || []))
      .catch(() => setHeatmap([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading liquidation data…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Liquidation Heatmap</h1>
        <p className="text-apex-muted mt-1">Liquidation clusters by symbol (Binance Futures)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heatmap.map((item) => (
          <div key={item.symbol} className="rounded-lg border border-apex-border bg-apex-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <Link to={`/analysis/${item.symbol}`} className="font-mono font-semibold text-apex-accent hover:underline">
                {item.symbol}
              </Link>
              <span className="font-mono text-apex-muted">
                ${item.price >= 1 ? item.price?.toFixed(2) : item.price?.toFixed(6)}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(item.clusters || []).slice(0, 12).map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-mono">${c.price?.toFixed(2)}</span>
                  <span className="text-apex-muted">qty: {c.totalQty?.toLocaleString?.() ?? c.totalQty}</span>
                  <span className="text-apex-muted">{c.distancePct?.toFixed(2)}% from price</span>
                </div>
              ))}
            </div>
            {(item.clusters?.length ?? 0) === 0 && (
              <p className="text-apex-muted text-sm">No recent liquidation clusters</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
