import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Award, AlertCircle } from 'lucide-react';
import { MQScore6D } from '../types/trading';

interface MQScoreAnalyticsProps {
  mqScore: MQScore6D | null;
}

export const MQScoreAnalytics: React.FC<MQScoreAnalyticsProps> = ({ mqScore }) => {
  if (!mqScore) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-400 bg-green-900/20';
      case 'B+':
      case 'B':
        return 'text-blue-400 bg-blue-900/20';
      case 'C+':
      case 'C':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'D':
      case 'F':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-green-400';
      case 'GOOD':
        return 'text-blue-400';
      case 'FAIR':
        return 'text-yellow-400';
      case 'POOR':
        return 'text-orange-400';
      case 'CRITICAL':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'DETERIORATING':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const dimensions = Object.values(mqScore.dimensions);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-900/20 rounded-full">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">MQSCORE 6D Analytics</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getGradeColor(mqScore.grade)}`}>
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Grade {mqScore.grade}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(mqScore.trend)}
            <span className="text-sm text-gray-400">{mqScore.trend}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">OVERALL</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {mqScore.overallScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">MQ Score</div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${mqScore.overallScore}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">LIQUIDITY</span>
          </div>
          <div className="text-xl font-bold text-white">
            {mqScore.dimensions.liquidity.score.toFixed(1)}
          </div>
          <div className={`text-sm ${getStatusColor(mqScore.dimensions.liquidity.status)}`}>
            {mqScore.dimensions.liquidity.status}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">EFFICIENCY</span>
          </div>
          <div className="text-xl font-bold text-white">
            {mqScore.dimensions.efficiency.score.toFixed(1)}
          </div>
          <div className={`text-sm ${getStatusColor(mqScore.dimensions.efficiency.status)}`}>
            {mqScore.dimensions.efficiency.status}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">RISK ADJ</span>
          </div>
          <div className="text-xl font-bold text-white">
            {mqScore.riskAdjustment.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Adjustment</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dimension Analysis</h3>
          <div className="space-y-4">
            {dimensions.map((dimension, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-white font-medium capitalize">
                      {dimension.name}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(dimension.status)} bg-gray-700`}>
                      {dimension.status}
                    </div>
                  </div>
                  <div className="text-white font-bold">
                    {dimension.score.toFixed(1)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-400">Weight: {(dimension.weight * 100).toFixed(1)}%</span>
                  <span className="text-gray-400">Raw: {dimension.rawValue.toFixed(2)}</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dimension.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      dimension.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      dimension.score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${dimension.score}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-400">
                  {dimension.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Market Quality Radar</h3>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="relative w-full h-64 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border border-gray-600 rounded-full relative">
                  {/* Radar chart visualization */}
                  <div className="absolute inset-4 border border-gray-700 rounded-full"></div>
                  <div className="absolute inset-8 border border-gray-700 rounded-full"></div>
                  <div className="absolute inset-12 border border-gray-700 rounded-full"></div>
                  
                  {/* Dimension labels */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                    Liquidity
                  </div>
                  <div className="absolute top-1/4 -right-8 text-xs text-gray-400">
                    Efficiency
                  </div>
                  <div className="absolute bottom-1/4 -right-8 text-xs text-gray-400">
                    Volatility
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                    Momentum
                  </div>
                  <div className="absolute bottom-1/4 -left-12 text-xs text-gray-400">
                    Microstructure
                  </div>
                  <div className="absolute top-1/4 -left-8 text-xs text-gray-400">
                    Stability
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {mqScore.overallScore.toFixed(0)}
                  </div>
                  <div className={`text-sm font-medium ${getGradeColor(mqScore.grade).split(' ')[0]}`}>
                    Grade {mqScore.grade}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-3">Quality Insights</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Regime:</span>
                <span className="text-white">
                  {mqScore.overallScore >= 80 ? 'Optimal' :
                   mqScore.overallScore >= 60 ? 'Good' :
                   mqScore.overallScore >= 40 ? 'Moderate' : 'Poor'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Conditions:</span>
                <span className={`${
                  mqScore.overallScore >= 70 ? 'text-green-400' :
                  mqScore.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {mqScore.overallScore >= 70 ? 'Favorable' :
                   mqScore.overallScore >= 50 ? 'Neutral' : 'Challenging'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Update:</span>
                <span className="text-white">
                  {new Date(mqScore.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};