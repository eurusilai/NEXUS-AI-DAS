import React from 'react';
import { Trade } from '../components/TradeCard';
import { useTrades } from '../context/TradeContext';
import { useAIIntegration } from '../hooks/useAIIntegration';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';

export const Analytics: React.FC = () => {
  const { trades: contextTrades } = useTrades();
  const { dashboardContext } = useAIIntegration();
  
  const mockTrades: Trade[] = React.useMemo(() => {
    if (contextTrades.length) return contextTrades;
    // fallback demo data
    return Array.from({ length: 20 }, (_, i) => {
      const isWin = Math.random() > 0.4;
      const pnlPercent = isWin ? Math.random() * 3 + 0.5 : -(Math.random() * 2 + 0.3);
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - Math.floor(Math.random() * 30));
      return {
        id: `mock-${i}`,
        symbol: ['ES', 'NQ', 'CL', 'GC'][Math.floor(Math.random() * 4)],
        type: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        entry: 4300 + Math.random() * 100,
        exit: 4300 + Math.random() * 100,
        stopLoss: 4300 - Math.random() * 50,
        takeProfit: 4300 + Math.random() * 50,
        quantity: Math.floor(Math.random() * 3) + 1,
        date: entryDate.toISOString().split('T')[0],
        result: pnlPercent,
        rMultiple: pnlPercent / (Math.random() * 1.5 + 0.5),
        strategy: ['Breakout', 'Reversal', 'Momentum'][Math.floor(Math.random() * 3)],
        setup: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        timeframe: ['5m', '15m', '1h'][Math.floor(Math.random() * 3)],
        tags: [],
        notes: '',
        screenshots: [],
        emotions: [],
        mistakes: [],
        quality: 3
      };
    });
  }, [contextTrades]);

  type TF = '1d' | '1w' | '1m' | 'all';
  const [timeframe, setTimeframe] = React.useState<TF>('1w');

  const getFilteredTrades = (): Trade[] => {
    if (timeframe === 'all') return mockTrades;
    const now = new Date();
    const start = new Date(now);
    if (timeframe === '1d') start.setDate(now.getDate() - 1);
    if (timeframe === '1w') start.setDate(now.getDate() - 7);
    if (timeframe === '1m') start.setMonth(now.getMonth() - 1);
    return mockTrades.filter(t => new Date(t.date) >= start);
  };

  const filteredTrades = getFilteredTrades();
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter(t => t.result > 0).length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;
  const totalPnL = filteredTrades.reduce((sum, t) => sum + t.result, 0);
  const avgR = totalTrades ? filteredTrades.reduce((s, t) => s + t.rMultiple, 0) / totalTrades : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Analytics</h1>
          <p className="text-gray-400">AI-powered analysis of your trading performance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setTimeframe('1d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${timeframe==='1d'?'bg-blue-600':'bg-gray-800 hover:bg-gray-700'}`}
          >1D</button>
          <button
            onClick={() => setTimeframe('1w')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${timeframe==='1w'?'bg-blue-600':'bg-gray-800 hover:bg-gray-700'}`}
          >1W</button>
          <button
            onClick={() => setTimeframe('1m')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${timeframe==='1m'?'bg-blue-600':'bg-gray-800 hover:bg-gray-700'}`}
          >1M</button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${timeframe==='all'?'bg-blue-600':'bg-gray-800 hover:bg-gray-700'}`}
          >ALL</button>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="mb-8">
        <AIAnalysisPanel dashboardContext={dashboardContext} />
      </div>

      {/* Trade Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Trades</div>
          <div className="text-3xl font-bold text-white">{totalTrades}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-white">{winRate.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Total PnL %</div>
          <div className={`text-3xl font-bold ${totalPnL>=0?'text-green-400':'text-red-400'}`}>{totalPnL.toFixed(2)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Avg R</div>
          <div className="text-3xl font-bold text-white">{avgR.toFixed(2)}</div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto mb-12">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Result %</th>
              <th className="px-4 py-3">R Multiple</th>
              <th className="px-4 py-3">Strategy</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map(trade => (
              <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="px-4 py-2 text-gray-300">{new Date(trade.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-gray-300">{trade.symbol}</td>
                <td className="px-4 py-2 text-gray-300">{trade.type}</td>
                <td className={`px-4 py-2 ${trade.result>=0?'text-green-400':'text-red-400'}`}>{trade.result.toFixed(2)}</td>
                <td className="px-4 py-2 text-gray-300">{trade.rMultiple.toFixed(2)}</td>
                <td className="px-4 py-2 text-gray-300">{trade.strategy}</td>
              </tr>
            ))}
            {filteredTrades.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">No trades in selected period</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};