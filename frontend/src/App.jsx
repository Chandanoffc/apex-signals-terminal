import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SignalScanner from './pages/SignalScanner';
import MarketOverview from './pages/MarketOverview';
import AssetAnalysis from './pages/AssetAnalysis';
import WhaleActivity from './pages/WhaleActivity';
import LiquidationHeatmap from './pages/LiquidationHeatmap';
import LiquidityMap from './pages/LiquidityMap';
import Backtesting from './pages/Backtesting';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signals" element={<SignalScanner />} />
        <Route path="/market" element={<MarketOverview />} />
        <Route path="/analysis/:symbol" element={<AssetAnalysis />} />
        <Route path="/whales" element={<WhaleActivity />} />
        <Route path="/liquidations" element={<LiquidationHeatmap />} />
        <Route path="/liquidity" element={<LiquidityMap />} />
        <Route path="/backtest" element={<Backtesting />} />
      </Routes>
    </Layout>
  );
}
