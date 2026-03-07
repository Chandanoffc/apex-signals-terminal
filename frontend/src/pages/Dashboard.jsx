import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import SignalTable from '../components/SignalTable';
import ConfidenceMeter from '../components/ConfidenceMeter';

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    Promise.all([api.getSignals(), api.getHealth()])
      .then(([data, h]) => {
        setSignals(data.signals || []);
        setHealth(h);
      })
      .catch(() => setSignals([]))
      .finally(() => setLoading(false));
  }, []);

  const topSignals = (signals || []).slice(0, 5);
  const highConfidence = (signals || []).filter((s) => s.confidence >= 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-apex-muted mt-1">Crypto derivatives intelligence at a glance</p>
      </div>

      {health && (
        <div className="flex items-center gap-2 text-apex-muted text-sm">
          <span className="w-2 h-2 rounded-full bg-apex-long animate-pulse" />
          API {health.status}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Active Signals</div>
          <div className="text-2xl font-bold font-mono mt-1">{signals?.length ?? 0}</div>
          <Link to="/signals" className="text-apex-accent text-sm mt-2 inline-block hover:underline">
            View all →
          </Link>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">High confidence (≥8)</div>
          <div className="text-2xl font-bold font-mono mt-1 text-apex-long">{highConfidence.length}</div>
          <p className="text-apex-muted text-xs mt-2">Alert-worthy</p>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Threshold</div>
          <div className="text-2xl font-bold font-mono mt-1">≥6</div>
          <p className="text-apex-muted text-xs mt-2">Min score to trigger</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Top signals</h2>
        <SignalTable signals={topSignals} loading={loading} />
        {!loading && topSignals.length > 0 && (
          <div className="mt-3 text-center">
            <Link to="/signals" className="text-apex-accent hover:underline">
              Open Signal Scanner →
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
        <h3 className="font-semibold mb-2">Alerts</h3>
        <p className="text-apex-muted text-sm mb-2">
          Alerts fire when signal confidence ≥ 8. Configure in backend: <code className="bg-apex-border/50 px-1 rounded">TELEGRAM_BOT_TOKEN</code>, <code className="bg-apex-border/50 px-1 rounded">TELEGRAM_CHAT_ID</code>, or <code className="bg-apex-border/50 px-1 rounded">DISCORD_WEBHOOK_URL</code>.
        </p>
      </div>

      <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
        <h3 className="font-semibold mb-2">Quick links</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/market" className="px-3 py-1.5 rounded bg-apex-border/50 text-sm hover:bg-apex-border">
            Market Overview
          </Link>
          <Link to="/whales" className="px-3 py-1.5 rounded bg-apex-border/50 text-sm hover:bg-apex-border">
            Whale Activity
          </Link>
          <Link to="/liquidations" className="px-3 py-1.5 rounded bg-apex-border/50 text-sm hover:bg-apex-border">
            Liquidation Heatmap
          </Link>
          <Link to="/liquidity" className="px-3 py-1.5 rounded bg-apex-border/50 text-sm hover:bg-apex-border">
            Liquidity Map
          </Link>
          <Link to="/backtest" className="px-3 py-1.5 rounded bg-apex-border/50 text-sm hover:bg-apex-border">
            Backtesting
          </Link>
        </div>
      </div>
    </div>
  );
}
