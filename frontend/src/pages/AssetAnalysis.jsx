import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../api/client';

export default function AssetAnalysis() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    api
      .getAnalysis(symbol)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading analysis for {symbol}…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Failed to load. <Link to="/market" className="text-apex-accent">Back to market</Link>
      </div>
    );
  }

  const klineData = (data.klines || []).map((k, i) => ({
    time: i,
    open: k.open,
    high: k.high,
    low: k.low,
    close: k.close,
    volume: k.volume,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/market" className="text-apex-muted hover:text-white">← Market</Link>
        <h1 className="text-2xl font-bold text-white">{data.symbol} Analysis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Price</div>
          <div className="text-xl font-mono font-bold mt-1">
            {data.price >= 1 ? data.price.toFixed(2) : data.price?.toFixed(6)}
          </div>
          <div className={`text-sm font-mono ${(data.change24h ?? 0) >= 0 ? 'text-apex-long' : 'text-apex-short'}`}>
            {data.change24h != null ? `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%` : '—'} 24h
          </div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Funding Rate</div>
          <div className="text-xl font-mono font-bold mt-1">
            {data.fundingRate != null ? (data.fundingRate * 100).toFixed(4) + '%' : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <div className="text-apex-muted text-sm">Market Regime</div>
          <div className="text-lg font-semibold mt-1">{data.regime ?? '—'}</div>
          <div className="text-apex-muted text-xs mt-1">{data.strategy}</div>
        </div>
      </div>

      {klineData.length > 0 && (
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-3">Price (OHLC)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={klineData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#58a6ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#8b949e" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                <Area type="monotone" dataKey="close" stroke="#58a6ff" fill="url(#priceGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {data.indicators && (
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-3">Technical indicators</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-apex-muted">RSI (14)</span><div className="font-mono">{data.indicators.rsi?.toFixed(1) ?? '—'}</div></div>
            <div><span className="text-apex-muted">EMA 20</span><div className="font-mono">{data.indicators.ema20?.toFixed(2) ?? '—'}</div></div>
            <div><span className="text-apex-muted">EMA 50</span><div className="font-mono">{data.indicators.ema50?.toFixed(2) ?? '—'}</div></div>
            <div><span className="text-apex-muted">Alignment</span><div className="font-mono">{data.indicators.emaAlignment ?? '—'}</div></div>
            <div><span className="text-apex-muted">ATR</span><div className="font-mono">{data.indicators.atr?.toFixed(2) ?? '—'}</div></div>
            <div><span className="text-apex-muted">ADX</span><div className="font-mono">{data.indicators.adx?.toFixed(1) ?? '—'}</div></div>
            <div><span className="text-apex-muted">VWAP</span><div className="font-mono">{data.indicators.vwap?.toFixed(2) ?? '—'}</div></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-2">Open interest</h3>
          <div className="font-mono text-apex-muted">
            {data.openInterest != null ? data.openInterest.toLocaleString() : '—'}
          </div>
          <div className="text-sm mt-1">
            Change: {data.openInterestChangePct != null ? `${data.openInterestChangePct > 0 ? '+' : ''}${data.openInterestChangePct}%` : '—'}
          </div>
          <div className="text-apex-muted text-xs mt-1">{data.oiInterpretation}</div>
        </div>
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-2">Order book</h3>
          <div className="text-sm">
            Pressure: <span className={data.orderBook?.pressure === 'BUY' ? 'text-apex-long' : data.orderBook?.pressure === 'SELL' ? 'text-apex-short' : ''}>
              {data.orderBook?.pressure ?? '—'}
            </span>
          </div>
          <div className="text-apex-muted text-xs mt-1">
            Imbalance: {data.orderBook?.imbalance != null ? (data.orderBook.imbalance * 100).toFixed(1) + '%' : '—'}
          </div>
        </div>
      </div>

      {data.liquidationClusters?.length > 0 && (
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-2">Liquidation clusters</h3>
          <div className="flex flex-wrap gap-2">
            {data.liquidationClusters.slice(0, 8).map((c, i) => (
              <span key={i} className="px-2 py-1 rounded bg-apex-border/50 font-mono text-xs">
                ${c.price?.toFixed(2)} ({c.distancePct?.toFixed(2)}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {data.liquidityZones?.length > 0 && (
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-2">Liquidity zones (stop-hunt)</h3>
          <div className="space-y-2">
            {data.liquidityZones.slice(0, 6).map((z, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-mono">${z.price?.toFixed(2)}</span>
                <span className="text-apex-muted">{z.type} · {((z.stopHuntProbability ?? 0) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
        <h3 className="font-semibold mb-2">Signal context</h3>
        <p className="text-apex-muted text-sm">{data.oiInterpretation}. Regime: {data.regime} — {data.strategy}.</p>
      </div>
    </div>
  );
}
