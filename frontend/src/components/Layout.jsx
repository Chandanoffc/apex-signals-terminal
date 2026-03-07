import { Link, useLocation } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/signals', label: 'Signal Scanner' },
  { to: '/market', label: 'Market Overview' },
  { to: '/whales', label: 'Whale Activity' },
  { to: '/liquidations', label: 'Liquidation Heatmap' },
  { to: '/liquidity', label: 'Liquidity Map' },
  { to: '/backtest', label: 'Backtesting' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-apex-border bg-apex-panel/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-apex-accent font-mono">APEX</span>
            <span className="text-apex-muted text-sm hidden sm:inline">Signals Intelligence Terminal</span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition ${
                  location.pathname === to
                    ? 'bg-apex-accent/20 text-apex-accent'
                    : 'text-apex-muted hover:text-white hover:bg-apex-border/50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
