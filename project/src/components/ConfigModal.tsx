import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Database, Wifi, Bell, Palette, Shield, Monitor, Server, Zap, Code, TestTube } from 'lucide-react';

interface ConfigSettings {
  // Data Source Settings
  dataSources: {
    ninjaTrader?: {
      enabled: boolean;
      endpoint: string;
      port: number;
      autoReconnect: boolean;
      heartbeatInterval: number;
      maxReconnectAttempts: number;
      dataBufferSize: number;
      compressionEnabled: boolean;
      encryptionEnabled: boolean;
      logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    };
    sierraChart?: {
      enabled: boolean;
      endpoint: string;
      port: number;
      autoReconnect: boolean;
      dtcProtocol: boolean;
      acsil: boolean;
      dataBufferSize: number;
      logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    };
    rithmic?: {
      enabled: boolean;
      apiKey: string;
      environment: 'test' | 'live';
      autoReconnect: boolean;
      encryptionEnabled: boolean;
      heartbeatInterval: number;
      maxReconnectAttempts: number;
      logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    };
    [key: string]: any;
  };
  
  // Display Settings
  display: {
    theme: 'dark' | 'light' | 'auto';
    refreshRate: number;
    showAnimations: boolean;
    compactMode: boolean;
    showTooltips: boolean;
    autoScale: boolean;
    gridLines: boolean;
  };
  
  // Alert Settings
  alerts: {
    enabled: boolean;
    soundEnabled: boolean;
    priceAlerts: boolean;
    volumeAlerts: boolean;
    positionAlerts: boolean;
    strategyAlerts: boolean;
    connectionAlerts: boolean;
    riskAlerts: boolean;
  };
  
  // Risk Settings
  risk: {
    maxPositionSize: number;
    maxDailyLoss: number;
    autoStopLoss: boolean;
    riskPerTrade: number;
    portfolioHeatLimit: number;
    marginCallThreshold: number;
  };
  
  // Strategy Settings
  strategies: {
    [key: string]: {
      enabled: boolean;
      weight: number;
      parameters: Record<string, any>;
    };
  };

  // Advanced Settings
  advanced: {
    dataRetention: number;
    performanceMode: boolean;
    debugMode: boolean;
    apiTimeout: number;
    maxConcurrentConnections: number;
  };

  // Notebook Settings
  notebook?: {
    pythonPath: string;
    kernelTimeout: number;
    maxOutputLines: number;
    autoSave: boolean;
    autoSaveInterval: number;
    enableCodeCompletion: boolean;
    enableSyntaxHighlighting: boolean;
    theme: string;
    fontSize: number;
    tabSize: number;
    enableLineNumbers: boolean;
    enableMinimap: boolean;
    enableWordWrap: boolean;
  };

  // Backtesting Settings
  backtesting?: {
    timeframe: string;
    period: string;
    startDate: string;
    endDate: string;
    riskPerTrade: number;
    stopLoss: number;
    takeProfit: number;
    maxPositionSize: number;
    marketType: string;
    volumeProfile: string;
    volatilityFilter: boolean;
    minVolume: number;
    slippage: number;
    commission: number;
    latency: number;
    walkForward: boolean;
    optimizeParameters: boolean;
    monteCarlo: boolean;
    iterations: number;
    dataSource: string;
    tickData: boolean;
    includeGaps: boolean;
    adjustForSplits: boolean;
  };
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentType: string;
  initialSettings?: Partial<ConfigSettings>;
  onSave: (settings: ConfigSettings) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  componentType,
  initialSettings,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('data-sources');
  const [settings, setSettings] = useState<ConfigSettings>({
    dataSources: {},
    display: {
      theme: 'dark',
      refreshRate: 1000,
      showAnimations: true,
      compactMode: false,
      showTooltips: true,
      autoScale: true,
      gridLines: true,
    },
    alerts: {
      enabled: true,
      soundEnabled: true,
      priceAlerts: true,
      volumeAlerts: true,
      positionAlerts: true,
      strategyAlerts: true,
      connectionAlerts: true,
      riskAlerts: true,
    },
    risk: {
      maxPositionSize: 10,
      maxDailyLoss: 1000,
      autoStopLoss: true,
      riskPerTrade: 2,
      portfolioHeatLimit: 80,
      marginCallThreshold: 25,
    },
    strategies: {
      'Momentum': { enabled: true, weight: 0.3, parameters: {} },
      'Reversal': { enabled: true, weight: 0.25, parameters: {} },
      'Breakout': { enabled: true, weight: 0.45, parameters: {} },
    },
    advanced: {
      dataRetention: 30,
      performanceMode: false,
      debugMode: false,
      apiTimeout: 5000,
      maxConcurrentConnections: 5,
    },
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({ 
        ...prev, 
        ...initialSettings,
        dataSources: { ...prev.dataSources, ...initialSettings.dataSources }
      }));
    }
  }, [initialSettings]);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem(`nexus-config-${componentType}`);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, [componentType]);

  useEffect(() => {
    // Set appropriate default tab based on component type
    if (componentType === 'notebook') {
      setActiveTab('notebook');
    } else if (componentType === 'backtesting') {
      setActiveTab('backtesting');
    } else {
      setActiveTab('data-sources');
    }
  }, [componentType]);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(`nexus-config-${componentType}`, JSON.stringify(settings));
    onSave(settings);
    onClose();
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (!isOpen) return null;

  const getBrokerIcon = (type: string) => {
    switch (type) {
      case 'ninja': return <Monitor className="w-4 h-4" />;
      case 'sierra': return <Server className="w-4 h-4" />;
      case 'rithmic': return <Zap className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getTabsForComponent = () => {
    const baseTabs = [
      { id: 'display', label: 'Display', icon: Palette },
      { id: 'alerts', label: 'Alerts', icon: Bell },
      { id: 'advanced', label: 'Advanced', icon: Wifi },
    ];

    if (componentType === 'notebook') {
      return [
        { id: 'notebook', label: 'Notebook', icon: Code },
        ...baseTabs
      ];
    } else if (componentType === 'backtesting') {
      return [
        { id: 'backtesting', label: 'Backtesting', icon: TestTube },
        { id: 'risk', label: 'Risk', icon: Shield },
        { id: 'strategies', label: 'Strategies', icon: Settings },
        ...baseTabs
      ];
    } else {
      return [
        { id: 'data-sources', label: 'Data Sources', icon: Database },
        { id: 'risk', label: 'Risk', icon: Shield },
        { id: 'strategies', label: 'Strategies', icon: Settings },
        ...baseTabs
      ];
    }
  };

  const tabs = getTabsForComponent();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              {componentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">SETTINGS</h3>
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'notebook' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Notebook Configuration</h3>
                  
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-white font-medium text-lg mb-4">Python Environment</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Python Path</label>
                          <input
                            type="text"
                            value={settings.notebook?.pythonPath || '/usr/bin/python3'}
                            onChange={(e) => updateSetting('notebook.pythonPath', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Kernel Timeout (ms)</label>
                          <input
                            type="number"
                            value={settings.notebook?.kernelTimeout || 30000}
                            onChange={(e) => updateSetting('notebook.kernelTimeout', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Max Output Lines</label>
                          <input
                            type="number"
                            value={settings.notebook?.maxOutputLines || 1000}
                            onChange={(e) => updateSetting('notebook.maxOutputLines', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Auto-save Interval (ms)</label>
                          <input
                            type="number"
                            value={settings.notebook?.autoSaveInterval || 30000}
                            onChange={(e) => updateSetting('notebook.autoSaveInterval', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Font Size</label>
                          <input
                            type="number"
                            value={settings.notebook?.fontSize || 14}
                            onChange={(e) => updateSetting('notebook.fontSize', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                            min="10"
                            max="24"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Tab Size</label>
                          <input
                            type="number"
                            value={settings.notebook?.tabSize || 4}
                            onChange={(e) => updateSetting('notebook.tabSize', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                            min="2"
                            max="8"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notebook?.autoSave ?? true}
                          onChange={(e) => updateSetting('notebook.autoSave', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Enable auto-save</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notebook?.enableCodeCompletion ?? true}
                          onChange={(e) => updateSetting('notebook.enableCodeCompletion', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Enable code completion</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notebook?.enableSyntaxHighlighting ?? true}
                          onChange={(e) => updateSetting('notebook.enableSyntaxHighlighting', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Enable syntax highlighting</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notebook?.enableLineNumbers ?? true}
                          onChange={(e) => updateSetting('notebook.enableLineNumbers', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Show line numbers</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notebook?.enableWordWrap ?? true}
                          onChange={(e) => updateSetting('notebook.enableWordWrap', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Enable word wrap</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notebook?.enableMinimap ?? false}
                          onChange={(e) => updateSetting('notebook.enableMinimap', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Show minimap</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backtesting' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Backtesting Configuration</h3>
                  
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-white font-medium text-lg mb-4">Execution Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Slippage (points)</label>
                          <input
                            type="number"
                            value={settings.backtesting?.slippage || 0.5}
                            onChange={(e) => updateSetting('backtesting.slippage', parseFloat(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Commission ($)</label>
                          <input
                            type="number"
                            value={settings.backtesting?.commission || 2.5}
                            onChange={(e) => updateSetting('backtesting.commission', parseFloat(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Latency (ms)</label>
                          <input
                            type="number"
                            value={settings.backtesting?.latency || 100}
                            onChange={(e) => updateSetting('backtesting.latency', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Data Source</label>
                          <select
                            value={settings.backtesting?.dataSource || 'historical'}
                            onChange={(e) => updateSetting('backtesting.dataSource', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          >
                            <option value="historical">Historical Data</option>
                            <option value="tick">Tick Data</option>
                            <option value="synthetic">Synthetic Data</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Monte Carlo Iterations</label>
                          <input
                            type="number"
                            value={settings.backtesting?.iterations || 1000}
                            onChange={(e) => updateSetting('backtesting.iterations', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.backtesting?.walkForward ?? false}
                          onChange={(e) => updateSetting('backtesting.walkForward', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Walk-forward analysis</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.backtesting?.optimizeParameters ?? false}
                          onChange={(e) => updateSetting('backtesting.optimizeParameters', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Optimize parameters</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.backtesting?.monteCarlo ?? false}
                          onChange={(e) => updateSetting('backtesting.monteCarlo', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Monte Carlo simulation</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.backtesting?.tickData ?? false}
                          onChange={(e) => updateSetting('backtesting.tickData', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Use tick-by-tick data</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.backtesting?.includeGaps ?? true}
                          onChange={(e) => updateSetting('backtesting.includeGaps', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Include market gaps</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.backtesting?.adjustForSplits ?? true}
                          onChange={(e) => updateSetting('backtesting.adjustForSplits', e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-white">Adjust for splits/dividends</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Include other existing tabs (data-sources, display, alerts, etc.) */}
              {activeTab === 'data-sources' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Data Source Configuration</h3>
                  {/* Existing data sources content */}
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Display Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Theme</label>
                      <select
                        value={settings.display.theme}
                        onChange={(e) => updateSetting('display.theme', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Refresh Rate (ms)</label>
                      <input
                        type="number"
                        value={settings.display.refreshRate}
                        onChange={(e) => updateSetting('display.refreshRate', parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        min="100"
                        max="10000"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.showAnimations}
                        onChange={(e) => updateSetting('display.showAnimations', e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Show Animations</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.compactMode}
                        onChange={(e) => updateSetting('display.compactMode', e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Compact Mode</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.showTooltips}
                        onChange={(e) => updateSetting('display.showTooltips', e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Show Tooltips</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.autoScale}
                        onChange={(e) => updateSetting('display.autoScale', e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Auto-scale Charts</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.gridLines}
                        onChange={(e) => updateSetting('display.gridLines', e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Show Grid Lines</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Add other existing tabs as needed */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};