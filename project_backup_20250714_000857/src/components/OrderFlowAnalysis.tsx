import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { OrderFlowData } from '../types/trading';

interface OrderFlowAnalysisProps {
  orderFlow: OrderFlowData | null;
}

export const OrderFlowAnalysis: React.FC<OrderFlowAnalysisProps> = ({ orderFlow }) => {
  if (!orderFlow) return null;

  const imbalanceRatio = (orderFlow.askVolume / (orderFlow.bidVolume + orderFlow.askVolume)) * 100;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-900/20 rounded-full">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Order Flow Analysis</h2>
        </div>
        <div className="text-sm text-gray-400">Real-time</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">CUMULATIVE</span>
          </div>
          <div className={`text-xl font-bold ${orderFlow.cumulativeDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {orderFlow.cumulativeDelta >= 0 ? '+' : ''}{orderFlow.cumulativeDelta.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">Delta</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">BID</span>
          </div>
          <div className="text-xl font-bold text-white">
            {(orderFlow.bidVolume / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-400">Volume</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-xs text-gray-400">ASK</span>
          </div>
          <div className="text-xl font-bold text-white">
            {(orderFlow.askVolume / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-400">Volume</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">ABSORPTION</span>
          </div>
          <div className="text-xl font-bold text-white">
            {orderFlow.absorption.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Strength</div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Volume Imbalance</span>
            <span className={`font-medium ${orderFlow.imbalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {orderFlow.imbalance >= 0 ? '+' : ''}{orderFlow.imbalance.toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full bg-gray-700 rounded-full h-3">
            <div className="absolute inset-0 flex">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 rounded-l-full h-full transition-all duration-300"
                style={{ width: `${Math.max(0, 50 - Math.abs(orderFlow.imbalance))}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 rounded-r-full h-full transition-all duration-300"
                style={{ width: `${Math.max(0, 50 - Math.abs(orderFlow.imbalance))}%` }}
              ></div>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-500"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Bid Pressure</span>
            <span>Ask Pressure</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Bid/Ask Ratio</span>
            <span className="text-white font-medium">
              {(orderFlow.bidVolume / orderFlow.askVolume).toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(imbalanceRatio, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">High Volume Nodes</h4>
            <div className="space-y-1">
              {orderFlow.hvnLevels.map((level, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">HVN {index + 1}</span>
                  <span className="text-green-400 font-medium">{level.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Low Volume Nodes</h4>
            <div className="space-y-1">
              {orderFlow.lvnLevels.map((level, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">LVN {index + 1}</span>
                  <span className="text-red-400 font-medium">{level.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};