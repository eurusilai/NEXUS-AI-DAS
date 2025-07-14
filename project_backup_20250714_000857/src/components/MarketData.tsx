import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Settings, Wifi, WifiOff } from 'lucide-react';
import { MarketData as MarketDataType } from '../types/trading';
import { dataTranslator, UniversalDataFormat } from '../services/DataTranslator';

interface MarketDataProps {
  data: MarketDataType[];
}

interface MarketDataSettings {
  refreshRate: number;
  showBidAsk: boolean;
  showVolume: boolean;
  showSpread: boolean;
  autoScale: boolean;
  alertThreshold: number;
  displayFormat: 'decimal' | 'fraction';
  colorScheme: 'default' | 'colorblind' | 'high-contrast';
  enableAlerts: boolean;
  enableSound: boolean;
}

export const MarketData: React.FC<MarketDataProps> = ({ data }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [translatedData, setTranslatedData] = useState<UniversalDataFormat | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [dataSource, setDataSource] = useState<string>('UNKNOWN');
  
  const [marketSettings, setMarketSettings] = useState<MarketDataSettings>({
    refreshRate: 1000,
    showBidAsk: true,
    showVolume: true,
    showSpread: true,
    autoScale: true,
    alertThreshold: 5.0,
    displayFormat: 'decimal',
    colorScheme: 'default',
    enableAlerts: true,
    enableSound: false
  });

  // Load market data settings
  useEffect(() => {
    const stored = localStorage.getItem('market-data-settings');
    if (stored) {
      try {
        setMarketSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch (error) {
        console.error('Failed to load market data settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Listen for translated data events
    const handleDataTranslated = (event: CustomEvent) => {
      setTranslatedData(event.detail.data);
      setDataSource(event.detail.source);
      setConnectionStatus('connected');
    };

    window.addEventListener('dataTranslated', handleDataTranslated as EventListener);

    // Check for existing translated data
    const lastData = dataTranslator.getLastTranslatedData();
    if (lastData) {
      setTranslatedData(lastData);
      setConnectionStatus('connected');
    }

    return () => {
      window.removeEventListener('dataTranslated', handleDataTranslated as EventListener);
    };
  }, []);

  const handleConfigSave = () => {
    // Save market data specific settings
    localStorage.setItem('market-data-settings', JSON.stringify(marketSettings));
    console.log('📊 Market Data settings saved:', marketSettings);
    setShowConfig(false);
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `Live - ${dataSource}`;
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const formatPrice = (price: number) => {
    if (marketSettings.displayFormat === 'fraction') {
      // Convert decimal to fraction (simplified for ES futures)
      const whole = Math.floor(price);
      const decimal = price - whole;
      const fraction = Math.round(decimal * 4); // ES has 1/4 point increments
      return `${whole}'${fraction.toString().padStart(2, '0')}`;
    }
    return price.toFixed(2);
  };

  const getPriceColor = (change: number) => {
    if (marketSettings.colorScheme === 'high-contrast') {
      return change >= 0 ? 'text-white bg-green-600' : 'text-white bg-red-600';
    } else if (marketSettings.colorScheme === 'colorblind') {
      return change >= 0 ? 'text-blue-400' : 'text-orange-400';
    }
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Use translated data if available, otherwise fall back to props data
  const displayData = translatedData ? [
    {
      symbol: translatedData.market.symbol,
      price: translatedData.market.price,
      change: translatedData.market.close - translatedData.market.open,
      changePercent: ((translatedData.market.close - translatedData.market.open) / translatedData.market.open) * 100,
      volume: translatedData.market.volume,
      bid: translatedData.market.bid,
      ask: translatedData.market.ask,
      spread: translatedData.market.ask - translatedData.market.bid,
      timestamp: translatedData.timestamp
    }
  ] : data;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Market Data</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span className="text-sm text-gray-400">{getConnectionText()}</span>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configure Market Data Display"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {translatedData && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-400 text-sm">
            <Activity className="w-4 h-4" />
            <span>Real-time data from {dataSource}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">
              Last update: {new Date(translatedData.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">
              Refresh: {marketSettings.refreshRate}ms
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.map((item) => (
          <div key={item.symbol} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-white">{item.symbol}</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            
            <div className="text-2xl font-bold text-white mb-1">
              {formatPrice(item.price)}
            </div>
            
            <div className={`flex items-center space-x-1 text-sm ${getPriceColor(item.change)}`}>
              {item.change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{item.change >= 0 ? '+' : ''}{formatPrice(item.change)}</span>
              <span>({item.changePercent.toFixed(2)}%)</span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              {marketSettings.showBidAsk && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Bid: {formatPrice(item.bid)}</span>
                  <span>Ask: {formatPrice(item.ask)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                {marketSettings.showVolume && (
                  <span>Volume: {(item.volume / 1000).toFixed(0)}K</span>
                )}
                {marketSettings.showSpread && (
                  <span>Spread: {formatPrice(item.spread)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Data Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Market Data Configuration</h2>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Display Settings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Refresh Rate (ms)</label>
                    <input
                      type="number"
                      value={marketSettings.refreshRate}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, refreshRate: parseInt(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      min="100"
                      max="10000"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Alert Threshold (%)</label>
                    <input
                      type="number"
                      value={marketSettings.alertThreshold}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, alertThreshold: parseFloat(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Format</label>
                    <select
                      value={marketSettings.displayFormat}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, displayFormat: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="decimal">Decimal (4325.50)</option>
                      <option value="fraction">Fraction (4325'02)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Color Scheme</label>
                    <select
                      value={marketSettings.colorScheme}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, colorScheme: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="default">Default (Green/Red)</option>
                      <option value="colorblind">Colorblind Friendly</option>
                      <option value="high-contrast">High Contrast</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketSettings.showBidAsk}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, showBidAsk: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Show Bid/Ask prices</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketSettings.showVolume}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, showVolume: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Show volume information</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketSettings.showSpread}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, showSpread: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Show bid-ask spread</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketSettings.autoScale}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, autoScale: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Auto-scale display</span>
                  </label>
                </div>
              </div>

              {/* Alert Settings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketSettings.enableAlerts}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, enableAlerts: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable price alerts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketSettings.enableSound}
                      onChange={(e) => setMarketSettings(prev => ({ ...prev, enableSound: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      disabled={!marketSettings.enableAlerts}
                    />
                    <span className={`ml-2 ${marketSettings.enableAlerts ? 'text-white' : 'text-gray-500'}`}>
                      Enable sound notifications
                    </span>
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
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};