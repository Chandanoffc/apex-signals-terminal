import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function Backtesting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getBacktest()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading backtest metrics…
      </div>
    );
  }

  const m = data?.metrics || {};
  const recent = data?.recentSignals || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Backtesting</h1>
        <p className="text-apex-muted mt-1">Signal performance metrics (evaluated signals)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Win rate</div>
          <div className="text-2xl font-mono font-bold mt-1">{m.winRate ?? 0}%</div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Avg return</div>
          <div className="text-2xl font-mono font-bold mt-1">{m.averageReturn ?? 0}</div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Max drawdown</div>
          <div className="text-2xl font-mono font-bold mt-1 text-apex-short">{m.maxDrawdown ?? 0}</div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Expectancy</div>
          <div className="text-2xl font-mono font-bold mt-1">{m.expectancy ?? 0}</div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Profit factor</div>
          <div className="text-2xl font-mono font-bold mt-1">{m.profitFactor ?? 0}</div>
        </div>
      </div>

      <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
        <h3 className="font-semibold mb-2">Signal history</h3>
        <p className="text-apex-muted text-sm mb-3">
          Total signals: {m.totalSignals ?? 0} · Evaluated: {m.evaluatedSignals ?? 0}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-apex-muted border-b border-apex-border">
                <th className="py-2">Time</th>
                <th className="py-2">Symbol</th>
                <th className="py-2">Bias</th>
                <th className="py-2">Confidence</th>
                <th className="py-2">Entry</th>
                <th className="py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {recent.slice(0, 20).map((s, i) => (
                <tr key={i} className="border-b border-apex-border/50">
                  <td className="py-2 font-mono text-xs">{s.timestamp ? new Date(s.timestamp).toLocaleString() : '—'}</td>
                  <td className="py-2 font-mono">{s.symbol}</td>
                  <td className={`py-2 font-semibold ${s.bias === 'LONG' ? 'text-apex-long' : 'text-apex-short'}`}>{s.bias}</td>
                  <td className="py-2 font-mono">{s.confidence}</td>
                  <td className="py-2 font-mono">{s.entryPrice?.toFixed?.(2) ?? s.entryPrice}</td>
                  <td className="py-2">{s.result ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recent.length === 0 && (
          <p className="text-apex-muted text-sm mt-2">No signal history yet. Generate signals from the Signal Scanner.</p>
        )}
      </div>
    </div>
  );
}
