import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function WhaleActivity() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getWhales()
      .then((data) => setFeed(data.feed || []))
      .catch(() => setFeed([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading whale activity…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Whale Activity</h1>
        <p className="text-apex-muted mt-1">Volume spikes, OI jumps, order book imbalance</p>
      </div>

      <div className="rounded-lg border border-apex-border bg-apex-panel overflow-hidden">
        {feed.length === 0 ? (
          <div className="p-8 text-center text-apex-muted">No whale alerts in top assets.</div>
        ) : (
          <ul className="divide-y divide-apex-border">
            {feed.map((item, i) => (
              <li key={`${item.symbol}-${i}`} className="p-4 hover:bg-apex-border/20">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Link to={`/analysis/${item.symbol}`} className="font-mono font-semibold text-apex-accent hover:underline">
                      {item.symbol}
                    </Link>
                    <span className="font-mono text-apex-muted">
                      ${item.price >= 1 ? item.price.toFixed(2) : item.price?.toFixed(6)}
                    </span>
                    {item.oiChangePct != null && (
                      <span className={`text-sm font-mono ${item.oiChangePct >= 0 ? 'text-apex-long' : 'text-apex-short'}`}>
                        OI {item.oiChangePct > 0 ? '+' : ''}{item.oiChangePct}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.alerts?.map((a, j) => (
                    <span
                      key={j}
                      className={`px-2 py-0.5 rounded text-xs ${
                        a.severity === 'high' ? 'bg-apex-short/20 text-apex-short' : 'bg-apex-border/50 text-apex-muted'
                      }`}
                    >
                      {a.type}: {a.message}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
