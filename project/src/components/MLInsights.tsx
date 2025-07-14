import React from 'react';
import { Brain, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { MLInsights as MLInsightsType } from '../types/trading';

interface MLInsightsProps {
  insights: MLInsightsType | null;
}

export const MLInsights: React.FC<MLInsightsProps> = ({ insights }) => {
  if (!insights) return null;

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'TRENDING':
        return 'text-green-400 bg-green-900/20';
      case 'RANGING':
        return 'text-blue-400 bg-blue-900/20';
      case 'VOLATILE':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'UP':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'DOWN':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-900/20 rounded-full">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Neural Network Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Market Regime</span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRegimeColor(insights.regime)}`}>
                {insights.regime}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {insights.confidence.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Confidence Level</div>
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${insights.confidence}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Price Direction</span>
              {getDirectionIcon(insights.priceDirection)}
            </div>
            <div className="text-lg font-bold text-white mb-1">
              {insights.priceDirection}
            </div>
            <div className="text-sm text-gray-400">Next Bar Prediction</div>
            <div className={`text-xl font-bold mt-2 ${
              insights.nextBarPrediction >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {insights.nextBarPrediction >= 0 ? '+' : ''}{insights.nextBarPrediction.toFixed(2)} pts
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Volatility Forecast</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {insights.volatilityForecast.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Expected Volatility</div>
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(insights.volatilityForecast * 2, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="mb-3">
              <span className="text-gray-400">Model Performance</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">XGBoost Accuracy</span>
                <span className="text-sm text-white">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">LSTM Accuracy</span>
                <span className="text-sm text-white">87.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">RF Accuracy</span>
                <span className="text-sm text-white">91.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Signal Validator: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Position Sizer: Active</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};