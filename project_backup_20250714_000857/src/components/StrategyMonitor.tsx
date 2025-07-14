import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { Strategy } from '../types/trading';
import { dataTranslator, UniversalDataFormat } from '../services/DataTranslator';

interface StrategyMonitorProps {
  strategies: Strategy[];
}

interface StrategySettings {
  enabledStrategies: Record<string, boolean>;
  strategyWeights: Record<string, number>;
  riskLimits: {
    maxPositionSize: number;
    maxDailyLoss: number;
    stopLossPercentage: number;
  };
  signalFilters: {
    minConfidence: number;
    requireVolumeConfirmation: boolean;
    enableTimeFilter: boolean;
    tradingHours: {
      start: string;
      end: string;
    };
  };
  notifications: {
    enableSignalAlerts: boolean;
    enablePerformanceAlerts: boolean;
    soundEnabled: boolean;
  };
  performance: {
    trackingPeriod: number; // days
    benchmarkSymbol: string;
    enableDrawdownTracking: boolean;
  };
}

export const StrategyMonitor: React.FC<StrategyMonitorProps> = ({ strategies }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [translatedData, setTranslatedData] = useState<UniversalDataFormat | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  
  const [strategySettings, setStrategySettings] = useState<StrategySettings>({
    enabledStrategies: {},
    strategyWeights: {},
    riskLimits: {
      maxPositionSize: 10,
      maxDailyLoss: 1000,
      stopLossPercentage: 2.0,
    },
    signalFilters: {
      minConfidence: 70,
      requireVolumeConfirmation: true,
      enableTimeFilter: true,
      tradingHours: {
        start: '09:30',
        end: '16:00',
      },
    },
    notifications: {
      enableSignalAlerts: true,
      enablePerformanceAlerts: true,
      soundEnabled: false,
    },
    performance: {
      trackingPeriod: 30,
      benchmarkSymbol: 'SPY',
      enableDrawdownTracking: true,
    },
  });

  // Load strategy settings
  useEffect(() => {
    const stored = localStorage.getItem('strategy-monitor-settings');
    if (stored) {
      try {
        setStrategySettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch (error) {
        console.error('Failed to load strategy settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleDataTranslated = (event: CustomEvent) => {
      setTranslatedData(event.detail.data);
    };

    window.addEventListener('dataTranslated', handleDataTranslated as EventListener);

    return () => {
      window.removeEventListener('dataTranslated', handleDataTranslated as EventListener);
    };
  }, []);

  const handleConfigSave = () => {
    // Save strategy-specific settings
    localStorage.setItem('strategy-monitor-settings', JSON.stringify(strategySettings));
    console.log('🎯 Strategy Monitor settings saved:', strategySettings);
    setShowConfig(false);
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-400 bg-green-900/20';
      case 'SELL':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  // Convert translated data to strategy format if available
  const displayStrategies = translatedData ? 
    Object.entries(translatedData.strategies).map(([name, strategy], index) => ({
      id: `strategy-${index}`,
      name,
      enabled: strategy.enabled && (strategySettings.enabledStrategies[name] !== false),
      confidence: strategy.confidence,
      signal: strategy.signal,
      pnl: strategy.pnl,
      trades: Math.floor(Math.random() * 50) + 10, // Mock data
      winRate: Math.random() * 40 + 50, // Mock data
      weight: strategySettings.strategyWeights[name] || (1 / Object.keys(translatedData.strategies).length)
    })) : strategies;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Strategy Monitor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2 rounded-lg transition-colors ${
              isRunning 
                ? 'text-green-400 hover:bg-green-900/20' 
                : 'text-gray-400 hover:bg-gray-800'
            }`}
            title={isRunning ? 'Pause Strategies' : 'Resume Strategies'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Reset All Strategies"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configure Strategy Monitor"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {translatedData && (
        <div className="mb-4 p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-400">
              Strategies synchronized with {translatedData.source}
            </span>
            <span className="text-gray-400">
              {Object.values(translatedData.strategies).filter(s => s.enabled).length} active
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {displayStrategies.map((strategy) => (
          <div key={strategy.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  strategy.enabled && isRunning ? 'bg-green-900/20' : 'bg-gray-700'
                }`}>
                  <Target className={`w-4 h-4 ${
                    strategy.enabled && isRunning ? 'text-green-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-white font-medium">{strategy.name}</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-400">Weight: {(strategy.weight * 100).toFixed(1)}%</p>
                    {!isRunning && (
                      <span className="text-xs px-2 py-1 bg-yellow-900/20 text-yellow-400 rounded">
                        PAUSED
                      </span>
                    )}
                    {strategy.confidence < strategySettings.signalFilters.minConfidence && (
                      <span className="text-xs px-2 py-1 bg-orange-900/20 text-orange-400 rounded">
                        LOW CONF
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalColor(strategy.signal)}`}>
                  <div className="flex items-center space-x-1">
                    {getSignalIcon(strategy.signal)}
                    <span>{strategy.signal}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {strategy.confidence.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <div>
                  <div className={`text-sm font-medium ${strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {strategy.pnl >= 0 ? '+' : ''}${strategy.pnl.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">P&L</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{strategy.trades}</div>
                  <div className="text-xs text-gray-400">Trades</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{strategy.winRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
              </div>
              
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strategy.enabled && isRunning && strategy.confidence >= strategySettings.signalFilters.minConfidence
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min(strategy.confidence, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Monitor Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Strategy Monitor Configuration</h2>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Target className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Strategy Management */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Management</h3>
                <div className="space-y-4">
                  {displayStrategies.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={strategySettings.enabledStrategies[strategy.name] !== false}
                            onChange={(e) => setStrategySettings(prev => ({
                              ...prev,
                              enabledStrategies: {
                                ...prev.enabledStrategies,
                                [strategy.name]: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-white font-medium">{strategy.name}</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Weight:</span>
                          <input
                            type="number"
                            value={strategySettings.strategyWeights[strategy.name] || strategy.weight}
                            onChange={(e) => setStrategySettings(prev => ({
                              ...prev,
                              strategyWeights: {
                                ...prev.strategyWeights,
                                [strategy.name]: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            min="0"
                            max="1"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal Filters */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Signal Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Minimum Confidence (%)</label>
                    <input
                      type="number"
                      value={strategySettings.signalFilters.minConfidence}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        signalFilters: {
                          ...prev.signalFilters,
                          minConfidence: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Trading Hours</label>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        value={strategySettings.signalFilters.tradingHours.start}
                        onChange={(e) => setStrategySettings(prev => ({
                          ...prev,
                          signalFilters: {
                            ...prev.signalFilters,
                            tradingHours: {
                              ...prev.signalFilters.tradingHours,
                              start: e.target.value
                            }
                          }
                        }))}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                      <input
                        type="time"
                        value={strategySettings.signalFilters.tradingHours.end}
                        onChange={(e) => setStrategySettings(prev => ({
                          ...prev,
                          signalFilters: {
                            ...prev.signalFilters,
                            tradingHours: {
                              ...prev.signalFilters.tradingHours,
                              end: e.target.value
                            }
                          }
                        }))}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={strategySettings.signalFilters.requireVolumeConfirmation}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        signalFilters: {
                          ...prev.signalFilters,
                          requireVolumeConfirmation: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Require volume confirmation</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={strategySettings.signalFilters.enableTimeFilter}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        signalFilters: {
                          ...prev.signalFilters,
                          enableTimeFilter: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable trading hours filter</span>
                  </label>
                </div>
              </div>

              {/* Risk Limits */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Position Size</label>
                    <input
                      type="number"
                      value={strategySettings.riskLimits.maxPositionSize}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        riskLimits: {
                          ...prev.riskLimits,
                          maxPositionSize: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Daily Loss ($)</label>
                    <input
                      type="number"
                      value={strategySettings.riskLimits.maxDailyLoss}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        riskLimits: {
                          ...prev.riskLimits,
                          maxDailyLoss: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Stop Loss (%)</label>
                    <input
                      type="number"
                      value={strategySettings.riskLimits.stopLossPercentage}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        riskLimits: {
                          ...prev.riskLimits,
                          stopLossPercentage: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={strategySettings.notifications.enableSignalAlerts}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          enableSignalAlerts: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable signal alerts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={strategySettings.notifications.enablePerformanceAlerts}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          enablePerformanceAlerts: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable performance alerts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={strategySettings.notifications.soundEnabled}
                      onChange={(e) => setStrategySettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          soundEnabled: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable sound notifications</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowConfig(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfigSave}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};