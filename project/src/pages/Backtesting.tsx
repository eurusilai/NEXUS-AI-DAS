import React, { useState, useEffect } from 'react';
import { 
  Play,
  Settings,
  Calendar,
  ChevronDown,
  BarChart2,
  TrendingUp,
  DollarSign,
  Target,
  Pause,
  Square,
  RefreshCw,
  Save,
  Upload,
  Download
} from 'lucide-react';
import { StrategyMonitor } from '../components/StrategyMonitor';
import { RiskDashboard } from '../components/RiskDashboard';
import { ConfigModal } from '../components/ConfigModal';
import { Strategy, RiskMetrics } from '../types/trading';

interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  netProfit: number;
  averageRRR: number;
  successfulTrades: number;
  failedTrades: number;
}

export const Backtesting: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [progress, setProgress] = useState(0);
  const [backtestConfig, setBacktestConfig] = useState({
    // Time Settings
    timeframe: '1D',
    period: '6M',
    startDate: '2023-01-01',
    endDate: '2024-03-15',
    
    // Strategy Settings
    riskPerTrade: 2,
    stopLoss: 50,
    takeProfit: 100,
    maxPositionSize: 10,
    
    // Market Conditions
    marketType: 'all',
    volumeProfile: 'all',
    volatilityFilter: false,
    minVolume: 1000,
    
    // Execution Settings
    slippage: 0.5,
    commission: 2.5,
    latency: 100,
    
    // Advanced Settings
    walkForward: false,
    optimizeParameters: false,
    monteCarlo: false,
    iterations: 1000,
    
    // Data Settings
    dataSource: 'historical',
    tickData: false,
    includeGaps: true,
    adjustForSplits: true
  });
  
  const mockResults: BacktestResult = {
    totalTrades: 156,
    winRate: 68.5,
    profitFactor: 2.8,
    sharpeRatio: 1.92,
    maxDrawdown: 12.4,
    netProfit: 45280,
    averageRRR: 2.1,
    successfulTrades: 107,
    failedTrades: 49
  };

  const mockStrategies: Strategy[] = [
    {
      id: 'strat1',
      name: 'Breakout Momentum',
      enabled: true,
      confidence: 82,
      signal: 'BUY',
      pnl: 12450,
      trades: 56,
      winRate: 71.4,
      weight: 0.3
    },
    {
      id: 'strat2',
      name: 'Range Reversal',
      enabled: false,
      confidence: 65,
      signal: 'HOLD',
      pnl: -2450,
      trades: 42,
      winRate: 61.2,
      weight: 0.25
    },
    {
      id: 'strat3',
      name: 'Supply Demand',
      enabled: true,
      confidence: 78,
      signal: 'SELL',
      pnl: 8450,
      trades: 38,
      winRate: 68.9,
      weight: 0.45
    }
  ];

  const mockRisk: RiskMetrics = {
    dailyPnl: 2450,
    maxDrawdown: 4800,
    portfolioHeat: 48.5,
    sharpeRatio: 1.52,
    winRate: 68.5,
    profitFactor: 2.8,
    totalTrades: 156,
    riskPerTrade: 1.5
  };

  useEffect(() => {
    // Load backtesting configuration
    const stored = localStorage.getItem('nexus-backtest-config');
    if (stored) {
      try {
        setBacktestConfig(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch (error) {
        console.error('Failed to load backtest config:', error);
      }
    }
  }, []);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate backtest progress
    const totalSteps = 100;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setProgress((i / totalSteps) * 100);
    }
    
    setIsRunning(false);
    setProgress(100);
  };

  const handleStopBacktest = () => {
    setIsRunning(false);
    setProgress(0);
  };

  const handleConfigSave = (settings: any) => {
    const newConfig = {
      ...backtestConfig,
      ...settings.backtesting
    };
    setBacktestConfig(newConfig);
    localStorage.setItem('nexus-backtest-config', JSON.stringify(newConfig));
    console.log('🔬 Backtesting configuration saved:', newConfig);
  };

  const exportResults = () => {
    const results = {
      config: backtestConfig,
      results: mockResults,
      strategies: mockStrategies,
      risk: mockRisk,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backtest_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveConfiguration = () => {
    const blob = new Blob([JSON.stringify(backtestConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backtest_config_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategy Backtesting</h1>
          <p className="text-gray-400">Test and optimize your trading strategies with historical data</p>
        </div>

        <div className="flex items-center space-x-4">
          {isRunning ? (
            <button
              onClick={handleStopBacktest}
              className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop Backtest</span>
            </button>
          ) : (
            <button
              onClick={handleRunBacktest}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Run Backtest</span>
            </button>
          )}

          <button 
            onClick={saveConfiguration}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Save Configuration"
          >
            <Save className="w-4 h-4" />
            <span>Save Config</span>
          </button>

          <button 
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Load Configuration"
          >
            <Upload className="w-4 h-4" />
            <span>Load Config</span>
          </button>

          <button 
            onClick={exportResults}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Export Results"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button 
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {(isRunning || progress > 0) && (
        <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              {isRunning ? 'Running Backtest...' : 'Backtest Complete'}
            </span>
            <span className="text-gray-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {isRunning && (
            <div className="mt-2 text-sm text-gray-400">
              Processing historical data from {backtestConfig.startDate} to {backtestConfig.endDate}...
            </div>
          )}
        </div>
      )}

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Time Period</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Timeframe</label>
              <select
                value={backtestConfig.timeframe}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, timeframe: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1D">1 Day</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Period</label>
              <select
                value={backtestConfig.period}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, period: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
                <option value="2Y">2 Years</option>
                <option value="ALL">All Time</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={backtestConfig.startDate}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={backtestConfig.endDate}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Strategy Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Risk per Trade (%)</label>
              <input
                type="number"
                value={backtestConfig.riskPerTrade}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                step="0.1"
                min="0.1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Stop Loss (points)</label>
              <input
                type="number"
                value={backtestConfig.stopLoss}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, stopLoss: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Take Profit (points)</label>
              <input
                type="number"
                value={backtestConfig.takeProfit}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, takeProfit: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Position Size</label>
              <input
                type="number"
                value={backtestConfig.maxPositionSize}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, maxPositionSize: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Market Conditions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Market Type</label>
              <select 
                value={backtestConfig.marketType}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, marketType: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="all">All Markets</option>
                <option value="trending">Trending</option>
                <option value="ranging">Ranging</option>
                <option value="volatile">Volatile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Volume Profile</label>
              <select 
                value={backtestConfig.volumeProfile}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, volumeProfile: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="all">All Volumes</option>
                <option value="high">High Volume</option>
                <option value="low">Low Volume</option>
                <option value="average">Average Volume</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Volume</label>
              <input
                type="number"
                value={backtestConfig.minVolume}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, minVolume: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={backtestConfig.volatilityFilter}
                  onChange={(e) => setBacktestConfig(prev => ({ ...prev, volatilityFilter: e.target.checked }))}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-white text-sm">Volatility Filter</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart2 className="w-8 h-8 text-blue-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{mockResults.winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-gray-400">Success</div>
              <div className="text-white font-medium">{mockResults.successfulTrades}</div>
            </div>
            <div className="text-sm text-right">
              <div className="text-gray-400">Failed</div>
              <div className="text-white font-medium">{mockResults.failedTrades}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{mockResults.profitFactor}</div>
              <div className="text-sm text-gray-400">Profit Factor</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-gray-400">Sharpe</div>
              <div className="text-white font-medium">{mockResults.sharpeRatio}</div>
            </div>
            <div className="text-sm text-right">
              <div className="text-gray-400">Drawdown</div>
              <div className="text-white font-medium">{mockResults.maxDrawdown}%</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${mockResults.netProfit}</div>
              <div className="text-sm text-gray-400">Net Profit</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-gray-400">Total Trades</div>
              <div className="text-white font-medium">{mockResults.totalTrades}</div>
            </div>
            <div className="text-sm text-right">
              <div className="text-gray-400">Avg. Trade</div>
              <div className="text-white font-medium">${(mockResults.netProfit / mockResults.totalTrades).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-orange-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{mockResults.averageRRR}</div>
              <div className="text-sm text-gray-400">Average RRR</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-gray-400">Best Trade</div>
              <div className="text-white font-medium">3.8 R</div>
            </div>
            <div className="text-sm text-right">
              <div className="text-gray-400">Worst Trade</div>
              <div className="text-white font-medium">-1.2 R</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Monitor and Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrategyMonitor strategies={mockStrategies} />
        <RiskDashboard riskMetrics={mockRisk} />
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        componentType="backtesting"
        initialSettings={{
          backtesting: backtestConfig
        }}
        onSave={handleConfigSave}
      />
    </div>
  );
};