import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Clock, 
  Calendar,
  DollarSign,
  Percent,
  Target
} from 'lucide-react';

export interface JournalStatsProps {
  analytics: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    averageRR: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    averageDuration: number;
    bestTrade: number;
    worstTrade: number;
    consecutiveWins: number;
    consecutiveLosses: number;
  };
}

export const JournalStats: React.FC<JournalStatsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Win Rate & Profit Factor */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Target className="w-8 h-8 text-blue-400" />
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{analytics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-gray-400">Profit Factor</div>
            <div className="text-white font-medium">{analytics.profitFactor.toFixed(2)}</div>
          </div>
          <div className="text-sm text-right">
            <div className="text-gray-400">Avg R:R</div>
            <div className="text-white font-medium">{analytics.averageRR.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Returns & Drawdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Percent className="w-8 h-8 text-green-400" />
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {analytics.totalReturn > 0 ? '+' : ''}{analytics.totalReturn.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Total Return</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-gray-400">Max Drawdown</div>
            <div className="text-white font-medium">{analytics.maxDrawdown.toFixed(1)}%</div>
          </div>
          <div className="text-sm text-right">
            <div className="text-gray-400">Sharpe Ratio</div>
            <div className="text-white font-medium">{analytics.sharpeRatio.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Best & Worst */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <BarChart2 className="w-8 h-8 text-purple-400" />
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{analytics.totalTrades}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-gray-400">Best Trade</div>
            <div className="text-green-400 font-medium">+{analytics.bestTrade.toFixed(1)}%</div>
          </div>
          <div className="text-sm text-right">
            <div className="text-gray-400">Worst Trade</div>
            <div className="text-red-400 font-medium">{analytics.worstTrade.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Streaks & Duration */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Clock className="w-8 h-8 text-orange-400" />
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{analytics.averageDuration}m</div>
            <div className="text-sm text-gray-400">Avg Duration</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-gray-400">Win Streak</div>
            <div className="text-white font-medium">{analytics.consecutiveWins}</div>
          </div>
          <div className="text-sm text-right">
            <div className="text-gray-400">Loss Streak</div>
            <div className="text-white font-medium">{analytics.consecutiveLosses}</div>
          </div>
        </div>
      </div>
    </div>
  );
};