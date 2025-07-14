import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, Settings, AlertTriangle, Target } from 'lucide-react';
import { Position } from '../types/trading';
import { ConfigModal } from './ConfigModal';
import { dataTranslator, UniversalDataFormat } from '../services/DataTranslator';

interface PositionManagerProps {
  positions: Position[];
}

export const PositionManager: React.FC<PositionManagerProps> = ({ positions }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [translatedData, setTranslatedData] = useState<UniversalDataFormat | null>(null);

  useEffect(() => {
    const handleDataTranslated = (event: CustomEvent) => {
      setTranslatedData(event.detail.data);
    };

    window.addEventListener('dataTranslated', handleDataTranslated as EventListener);

    return () => {
      window.removeEventListener('dataTranslated', handleDataTranslated as EventListener);
    };
  }, []);

  const handleConfigSave = (settings: any) => {
    console.log('Position Manager settings saved:', settings);
  };

  // Convert translated data to position format if available
  const displayPositions = translatedData && translatedData.position.quantity !== 0 ? [
    {
      symbol: translatedData.market.symbol,
      side: translatedData.position.side,
      size: Math.abs(translatedData.position.quantity),
      entryPrice: translatedData.position.averagePrice,
      currentPrice: translatedData.market.price,
      pnl: translatedData.position.unrealizedPnL,
      pnlPercent: translatedData.position.averagePrice > 0 
        ? ((translatedData.market.price - translatedData.position.averagePrice) / translatedData.position.averagePrice) * 100 * (translatedData.position.side === 'LONG' ? 1 : -1)
        : 0,
      duration: '15m' // Mock duration
    }
  ] : positions;

  const totalPnl = displayPositions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Active Positions</h2>
        <div className="flex items-center space-x-4">
          <div className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
          </div>
          <span className="text-sm text-gray-400">Total P&L</span>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configure Position Manager"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {translatedData && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-green-400">
                Live position data from {translatedData.source}
              </span>
            </div>
            <div className="text-gray-400">
              Account: ${translatedData.account.equity.toFixed(0)}
            </div>
          </div>
        </div>
      )}
      
      {displayPositions.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No active positions</p>
          {translatedData && (
            <p className="text-sm text-gray-500 mt-2">
              Connected to {translatedData.source} - Waiting for positions
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayPositions.map((position, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    position.side === 'LONG' ? 'bg-green-900/20' : 'bg-red-900/20'
                  }`}>
                    {position.side === 'LONG' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{position.symbol}</h3>
                    <p className="text-sm text-gray-400">{position.side} {position.size} contracts</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(0)}
                  </div>
                  <div className={`text-sm ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex space-x-6">
                  <div>
                    <span className="text-gray-400">Entry: </span>
                    <span className="text-white">{position.entryPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Current: </span>
                    <span className="text-white">{position.currentPrice.toFixed(2)}</span>
                  </div>
                  {translatedData && (
                    <div>
                      <span className="text-gray-400">Margin: </span>
                      <span className="text-white">${translatedData.account.margin.toFixed(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{position.duration}</span>
                </div>
              </div>
              
              {/* Risk Indicator */}
              <div className="mt-3 flex items-center justify-between">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      position.pnl >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(Math.abs(position.pnlPercent) * 10, 100)}%` }}
                  ></div>
                </div>
                {Math.abs(position.pnlPercent) > 5 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400 ml-2" title="High Risk Position" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        componentType="position-manager"
        onSave={handleConfigSave}
      />
    </div>
  );
};