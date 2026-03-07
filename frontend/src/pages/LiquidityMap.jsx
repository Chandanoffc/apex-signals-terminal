import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function LiquidityMap() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLiquidity()
      .then((data) => setZones(data.zones || []))
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading liquidity zones…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Liquidity Map</h1>
        <p className="text-apex-muted mt-1">Support/resistance and stop-hunt probability (recent highs/lows)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((item) => (
          <div key={item.symbol} className="rounded-lg border border-apex-border bg-apex-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <Link to={`/analysis/${item.symbol}`} className="font-mono font-semibold text-apex-accent hover:underline">
                {item.symbol}
              </Link>
              <span className="font-mono text-apex-muted">
                Price: ${item.currentPrice >= 1 ? item.currentPrice?.toFixed(2) : item.currentPrice?.toFixed(6)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-apex-muted text-sm mb-2">Resistance (above)</h4>
                <ul className="space-y-1 text-sm">
                  {(item.resistance || []).slice(0, 4).map((z, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-mono">${z.price?.toFixed(2)}</span>
                      <span className="text-apex-muted">{(z.stopHuntProbability * 100)?.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-apex-muted text-sm mb-2">Support (below)</h4>
                <ul className="space-y-1 text-sm">
                  {(item.support || []).slice(0, 4).map((z, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-mono">${z.price?.toFixed(2)}</span>
                      <span className="text-apex-muted">{(z.stopHuntProbability * 100)?.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
