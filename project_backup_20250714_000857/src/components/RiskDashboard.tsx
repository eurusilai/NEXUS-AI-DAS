import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, Activity, Settings, Zap, Target } from 'lucide-react';
import { RiskMetrics } from '../types/trading';
import { ConfigModal } from './ConfigModal';
import { dataTranslator, UniversalDataFormat } from '../services/DataTranslator';

interface RiskDashboardProps {
  riskMetrics: RiskMetrics | null;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ riskMetrics }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [translatedData, setTranslatedData] = useState<UniversalDataFormat | null>(null);
  const [riskAlerts, setRiskAlerts] = useState<string[]>([]);

  useEffect(() => {
    const handleDataTranslated = (event: CustomEvent) => {
      setTranslatedData(event.detail.data);
      checkRiskAlerts(event.detail.data);
    };

    window.addEventListener('dataTranslated', handleDataTranslated as EventListener);

    return () => {
      window.removeEventListener('dataTranslated', handleDataTranslated as EventListener);
    };
  }, []);

  const checkRiskAlerts = (data: UniversalDataFormat) => {
    const alerts: string[] = [];
    
    // Check position size risk
    if (Math.abs(data.position.quantity) > 5) {
      alerts.push('Large position size detected');
    }
    
    // Check P&L risk
    const pnlPercent = Math.abs(data.position.unrealizedPnL / data.account.equity) * 100;
    if (pnlPercent > 5) {
      alerts.push('High P&L exposure');
    }
    
    // Check margin usage
    const marginUsage = (data.account.margin / data.account.equity) * 100;
    if (marginUsage > 80) {
      alerts.push('High margin usage');
    }
    
    setRiskAlerts(alerts);
  };

  const handleConfigSave = (settings: any) => {
    console.log('Risk Dashboard settings saved:', settings);
  };

  // Use translated data if available
  const displayMetrics = translatedData ? {
    dailyPnl: translatedData.position.realizedPnL,
    maxDrawdown: -Math.abs(translatedData.position.unrealizedPnL) * 1.5, // Estimated
    portfolioHeat: Math.abs(translatedData.position.unrealizedPnL / translatedData.account.equity) * 100,
    sharpeRatio: 1.2, // Mock data
    winRate: 65, // Mock data
    profitFactor: 1.8, // Mock data
    totalTrades: 25, // Mock data
    riskPerTrade: 2.0
  } : riskMetrics;

  if (!displayMetrics) return null;

  const getRiskLevel = (heat: number) => {
    if (heat < 30) return { color: 'text-green-400', bg: 'bg-green-900/20', level: 'LOW' };
    if (heat < 70) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', level: 'MEDIUM' };
    return { color: 'text-red-400', bg: 'bg-red-900/20', level: 'HIGH' };
  };

  const riskLevel = getRiskLevel(displayMetrics.portfolioHeat);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Risk Management</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${riskLevel.bg}`}>
            <Shield className={`w-4 h-4 ${riskLevel.color}`} />
            <span className={`text-sm font-medium ${riskLevel.color}`}>{riskLevel.level}</span>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configure Risk Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-medium">Risk Alerts</span>
          </div>
          <ul className="text-sm text-red-300 space-y-1">
            {riskAlerts.map((alert, index) => (
              <li key={index}>• {alert}</li>
            ))}
          </ul>
        </div>
      )}

      {translatedData && (
        <div className="mb-4 p-3 bg-orange-900/20 border border-orange-800 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400">
                Real-time risk monitoring from {translatedData.source}
              </span>
            </div>
            <div className="text-gray-400">
              Equity: ${translatedData.account.equity.toFixed(0)}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">TODAY</span>
          </div>
          <div className={`text-xl font-bold ${displayMetrics.dailyPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {displayMetrics.dailyPnl >= 0 ? '+' : ''}${displayMetrics.dailyPnl.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">Daily P&L</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-xs text-gray-400">MAX</span>
          </div>
          <div className="text-xl font-bold text-red-400">
            ${displayMetrics.maxDrawdown.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">Drawdown</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">CURRENT</span>
          </div>
          <div className="text-xl font-bold text-white">
            {displayMetrics.portfolioHeat.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Portfolio Heat</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">RATIO</span>
          </div>
          <div className="text-xl font-bold text-white">
            {displayMetrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Win Rate</span>
            <span className="text-white font-medium">{displayMetrics.winRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${displayMetrics.winRate}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Portfolio Heat</span>
            <span className={`font-medium ${riskLevel.color}`}>{displayMetrics.portfolioHeat.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                displayMetrics.portfolioHeat < 30 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                displayMetrics.portfolioHeat < 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min(displayMetrics.portfolioHeat, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <div>
              <span className="text-gray-400">Profit Factor: </span>
              <span className="text-white font-medium">{displayMetrics.profitFactor.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Trades: </span>
              <span className="text-white font-medium">{displayMetrics.totalTrades}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-400">Risk/Trade: </span>
            <span className="text-white font-medium">{displayMetrics.riskPerTrade.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        componentType="risk-dashboard"
        onSave={handleConfigSave}
      />
    </div>
  );
};