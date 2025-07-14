import React from 'react';
import { AlertTriangle, Zap, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { LiquidationData } from '../types/trading';

interface LiquidationDetectorProps {
  liquidationData: LiquidationData | null;
}

export const LiquidationDetector: React.FC<LiquidationDetectorProps> = ({ liquidationData }) => {
  if (!liquidationData) return null;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-400 bg-green-900/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'HIGH':
        return 'text-orange-400 bg-orange-900/20';
      case 'EXTREME':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'LONG':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'SHORT':
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      default:
        return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-900/20 rounded-full">
            <Zap className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Liquidation Detection</h2>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getRiskLevelColor(liquidationData.riskLevel)}`}>
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{liquidationData.riskLevel} RISK</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-red-400" />
            <span className="text-xs text-gray-400">24H</span>
          </div>
          <div className="text-xl font-bold text-white">
            {liquidationData.totalLiquidations24h.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Liquidations</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">RATE</span>
          </div>
          <div className="text-xl font-bold text-white">
            {liquidationData.liquidationRate.toFixed(1)}/min
          </div>
          <div className="text-sm text-gray-400">Liquidation Rate</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            {getDirectionIcon(liquidationData.dominantDirection)}
            <span className="text-xs text-gray-400">DOMINANT</span>
          </div>
          <div className="text-xl font-bold text-white">
            {liquidationData.dominantDirection}
          </div>
          <div className="text-sm text-gray-400">Direction</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">CLUSTERS</span>
          </div>
          <div className="text-xl font-bold text-white">
            {liquidationData.activeClusters.length}
          </div>
          <div className="text-sm text-gray-400">Active Clusters</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Liquidations</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {liquidationData.recentEvents.slice(0, 8).map((event, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getDirectionIcon(event.direction)}
                    <span className={`text-sm font-medium ${
                      event.direction === 'LONG' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {event.direction} LIQUIDATION
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <div>
                      <span className="text-xs text-gray-400">Price: </span>
                      <span className="text-white text-sm">{event.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Volume: </span>
                      <span className="text-white text-sm">{(event.volume / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-400">Intensity:</div>
                    <div className="w-16 bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-1 rounded-full"
                        style={{ width: `${Math.min(event.intensity * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">{event.reason}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Active Clusters</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {liquidationData.activeClusters.map((cluster, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">
                      Price Level: {cluster.priceLevel.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {cluster.eventCount} events
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Volume: </span>
                    <span className="text-white">{(cluster.totalVolume / 1000).toFixed(1)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Intensity: </span>
                    <span className="text-white">{cluster.averageIntensity.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timespan: </span>
                    <span className="text-white">{Math.floor(cluster.timespan / 60)}m</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status: </span>
                    <span className={`${cluster.active ? 'text-orange-400' : 'text-gray-400'}`}>
                      {cluster.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(cluster.averageIntensity * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};