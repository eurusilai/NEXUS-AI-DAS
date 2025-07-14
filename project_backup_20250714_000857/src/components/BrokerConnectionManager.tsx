import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Play, 
  Square, 
  RefreshCw,
  Activity,
  Database,
  Zap,
  Monitor,
  Server,
  Shield,
  Bell
} from 'lucide-react';
import { BrokerConnection } from '../types/trading';

interface ConnectionManagerProps {
  connection: BrokerConnection;
  onUpdate: (connection: BrokerConnection) => void;
  onDelete: (id: string) => void;
}

interface ConnectionSettings {
  // Connection-specific settings
  autoReconnect: boolean;
  heartbeatInterval: number;
  maxReconnectAttempts: number;
  dataBufferSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  alertsEnabled: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  
  // NinjaTrader specific
  ntiPort?: number;
  enableMarketData?: boolean;
  enableOrderRouting?: boolean;
  enablePositionUpdates?: boolean;
  
  // Sierra Chart specific
  dtcPort?: number;
  acsil?: boolean;
  
  // Rithmic specific
  environment?: 'test' | 'live';
  apiVersion?: string;
}

export const BrokerConnectionManager: React.FC<ConnectionManagerProps> = ({ 
  connection, 
  onUpdate, 
  onDelete 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [showConnectionConfig, setShowConnectionConfig] = useState(false);
  const [dataFeed, setDataFeed] = useState({
    ticksReceived: 0,
    lastTick: null as any,
    latency: 0,
    isStreaming: false,
    dataRate: 0,
    errorCount: 0
  });

  const [connectionSettings, setConnectionSettings] = useState<ConnectionSettings>({
    autoReconnect: true,
    heartbeatInterval: 30,
    maxReconnectAttempts: 5,
    dataBufferSize: 1000,
    compressionEnabled: true,
    encryptionEnabled: false,
    alertsEnabled: true,
    logLevel: 'INFO',
    
    // Platform-specific defaults
    ...(connection.type === 'NINJA_TRADER' && {
      ntiPort: 8080,
      enableMarketData: true,
      enableOrderRouting: true,
      enablePositionUpdates: true,
    }),
    ...(connection.type === 'SIERRA_CHART' && {
      dtcPort: 11099,
      acsil: true,
    }),
    ...(connection.type === 'RITHMIC' && {
      environment: 'live' as const,
      apiVersion: '3.9.1',
    }),
  });

  // Load connection-specific settings
  useEffect(() => {
    const stored = localStorage.getItem(`connection-settings-${connection.id}`);
    if (stored) {
      try {
        setConnectionSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch (error) {
        console.error('Failed to load connection settings:', error);
      }
    }
  }, [connection.id]);

  const handleConnect = async () => {
    setIsConnecting(true);
    addLog(`Attempting to connect to ${connection.name}...`);
    
    try {
      // Simulate connection process with realistic steps
      addLog(`Resolving endpoint ${connection.endpoint}...`);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (connection.type === 'NINJA_TRADER') {
        addLog(`Connecting to NinjaTrader 8 on ${connection.endpoint}:${connectionSettings.ntiPort}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog(`Authenticating with account ${connection.account}...`);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        addLog(`Enabling NTI (NinjaTrader Interface) on port ${connectionSettings.ntiPort}...`);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        if (connectionSettings.enableMarketData) {
          addLog(`✅ Market data subscription enabled`);
        }
        if (connectionSettings.enableOrderRouting) {
          addLog(`✅ Order routing enabled`);
        }
        if (connectionSettings.enablePositionUpdates) {
          addLog(`✅ Real-time position updates enabled`);
        }
        
        addLog(`✅ Connection established successfully`);
        addLog(`📊 Data feed active - receiving market data`);
        addLog(`🔄 Auto-reconnect: ${connectionSettings.autoReconnect ? 'enabled' : 'disabled'}`);
        
        // Start simulated data feed
        setDataFeed(prev => ({ ...prev, isStreaming: true }));
        
        onUpdate({
          ...connection,
          status: 'CONNECTED',
          lastSync: Date.now()
        });
      } else if (connection.type === 'SIERRA_CHART') {
        addLog(`Connecting to Sierra Chart DTC server on ${connection.endpoint}:${connectionSettings.dtcPort}...`);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        addLog(`Establishing DTC protocol connection...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (connectionSettings.acsil) {
          addLog(`✅ ACSIL (Advanced Custom Study Interface) enabled`);
        }
        
        addLog(`✅ Sierra Chart connection established`);
        addLog(`📈 Market data subscription active`);
        
        setDataFeed(prev => ({ ...prev, isStreaming: true }));
        
        onUpdate({
          ...connection,
          status: 'CONNECTED',
          lastSync: Date.now()
        });
      } else if (connection.type === 'RITHMIC') {
        addLog(`Connecting to Rithmic R|API+ servers (${connectionSettings.environment})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog(`Authenticating with API credentials...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        addLog(`Using API version ${connectionSettings.apiVersion}`);
        
        if (connectionSettings.encryptionEnabled) {
          addLog(`🔒 Encryption enabled for secure communication`);
        }
        
        addLog(`✅ Rithmic connection established`);
        addLog(`⚡ Real-time data streaming active`);
        
        setDataFeed(prev => ({ ...prev, isStreaming: true }));
        
        onUpdate({
          ...connection,
          status: 'CONNECTED',
          lastSync: Date.now()
        });
      }
    } catch (error) {
      addLog(`❌ Connection failed: ${error}`);
      onUpdate({
        ...connection,
        status: 'ERROR',
        lastSync: Date.now()
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    addLog(`Disconnecting from ${connection.name}...`);
    setDataFeed(prev => ({ ...prev, isStreaming: false }));
    onUpdate({
      ...connection,
      status: 'DISCONNECTED',
      lastSync: Date.now()
    });
    addLog(`🔌 Disconnected successfully`);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-20)); // Keep last 20 logs
  };

  const handleConnectionConfigSave = () => {
    // Save connection-specific settings
    localStorage.setItem(`connection-settings-${connection.id}`, JSON.stringify(connectionSettings));
    addLog(`⚙️ Connection configuration updated`);
    
    // Apply settings to connection
    if (connectionSettings.autoReconnect !== undefined) {
      addLog(`Auto-reconnect ${connectionSettings.autoReconnect ? 'enabled' : 'disabled'}`);
    }
    
    if (connectionSettings.alertsEnabled !== undefined) {
      addLog(`Alerts ${connectionSettings.alertsEnabled ? 'enabled' : 'disabled'}`);
    }
    
    setShowConnectionConfig(false);
  };

  // Simulate data feed updates
  useEffect(() => {
    if (dataFeed.isStreaming && connection.status === 'CONNECTED') {
      const interval = setInterval(() => {
        setDataFeed(prev => {
          const newTicksReceived = prev.ticksReceived + Math.floor(Math.random() * 8) + 1;
          const newDataRate = Math.floor(Math.random() * 50) + 20; // Ticks per second
          
          return {
            ...prev,
            ticksReceived: newTicksReceived,
            lastTick: {
              symbol: connection.type === 'NINJA_TRADER' ? 'ES' : 
                     connection.type === 'SIERRA_CHART' ? 'NQ' : 'CL',
              price: 4320 + (Math.random() - 0.5) * 20,
              volume: Math.floor(Math.random() * 200) + 1,
              timestamp: Date.now()
            },
            latency: Math.floor(Math.random() * 15) + 1,
            dataRate: newDataRate,
            errorCount: prev.errorCount + (Math.random() < 0.02 ? 1 : 0) // 2% chance of error
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dataFeed.isStreaming, connection.status, connection.type]);

  const getStatusColor = () => {
    switch (connection.status) {
      case 'CONNECTED': return 'text-green-400 bg-green-900/20';
      case 'DISCONNECTED': return 'text-gray-400 bg-gray-900/20';
      case 'ERROR': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = () => {
    switch (connection.status) {
      case 'CONNECTED': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'DISCONNECTED': return <WifiOff className="w-5 h-5 text-gray-400" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBrokerIcon = () => {
    switch (connection.type) {
      case 'NINJA_TRADER': return <Monitor className="w-6 h-6 text-purple-400" />;
      case 'SIERRA_CHART': return <Server className="w-6 h-6 text-blue-400" />;
      case 'RITHMIC': return <Zap className="w-6 h-6 text-orange-400" />;
      case 'INTERACTIVE_BROKERS': return <Database className="w-6 h-6 text-green-400" />;
      default: return <Database className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            {getBrokerIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{connection.name}</h3>
            <div className="flex items-center space-x-3 mt-1">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm font-medium">{connection.status}</span>
              </div>
              <span className="text-sm text-gray-400">{connection.type.replace('_', ' ')}</span>
              {connection.status === 'CONNECTED' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {connection.status === 'CONNECTED' ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
          
          <button 
            onClick={() => setShowConnectionConfig(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configure This Connection"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Endpoint</label>
            <div className="text-white font-mono text-sm bg-gray-800 px-3 py-2 rounded">
              {connection.endpoint || 'Not configured'}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Account</label>
            <div className="text-white font-mono text-sm bg-gray-800 px-3 py-2 rounded">
              {connection.account || 'Not specified'}
            </div>
          </div>
          {connection.apiKey && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">API Key</label>
              <div className="text-white font-mono text-sm bg-gray-800 px-3 py-2 rounded">
                {connection.apiKey.replace(/./g, '*')}
              </div>
            </div>
          )}
        </div>
        
        {connection.status === 'CONNECTED' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Feed</span>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Streaming</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Ticks Received</span>
              <span className="text-white font-mono">{dataFeed.ticksReceived.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Rate</span>
              <span className="text-white font-mono">{dataFeed.dataRate}/sec</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Latency</span>
              <span className={`font-mono ${dataFeed.latency < 10 ? 'text-green-400' : dataFeed.latency < 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {dataFeed.latency}ms
              </span>
            </div>
            {dataFeed.lastTick && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Last Tick</span>
                <span className="text-white font-mono">
                  {dataFeed.lastTick.symbol} @ {dataFeed.lastTick.price.toFixed(2)}
                </span>
              </div>
            )}
            {dataFeed.errorCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Errors</span>
                <span className="text-red-400 font-mono">{dataFeed.errorCount}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Logs */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Connection Log</h4>
          <div className="flex items-center space-x-2">
            <select 
              value={connectionSettings.logLevel}
              onChange={(e) => setConnectionSettings(prev => ({ ...prev, logLevel: e.target.value as any }))}
              className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
            >
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
            </select>
            <button 
              onClick={() => setConnectionLogs([])}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-700 rounded"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {connectionLogs.length === 0 ? (
            <div className="text-xs text-gray-500">No connection activity</div>
          ) : (
            connectionLogs.map((log, index) => (
              <div key={index} className="text-xs text-gray-300 font-mono">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform-specific Configuration Display */}
      {connection.type === 'NINJA_TRADER' && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-white mb-4">NinjaTrader 8 Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">NTI Port:</span>
                <span className="text-white">{connectionSettings.ntiPort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Data:</span>
                <span className={connectionSettings.enableMarketData ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.enableMarketData ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Routing:</span>
                <span className={connectionSettings.enableOrderRouting ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.enableOrderRouting ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Position Updates:</span>
                <span className={connectionSettings.enablePositionUpdates ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.enablePositionUpdates ? '✓ Real-time' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Auto-reconnect:</span>
                <span className={connectionSettings.autoReconnect ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.autoReconnect ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Compression:</span>
                <span className={connectionSettings.compressionEnabled ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.compressionEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {connection.type === 'SIERRA_CHART' && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-white mb-4">Sierra Chart Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">DTC Protocol:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Port:</span>
                <span className="text-white">{connectionSettings.dtcPort}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">ACSIL:</span>
                <span className={connectionSettings.acsil ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.acsil ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buffer Size:</span>
                <span className="text-white">{connectionSettings.dataBufferSize}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {connection.type === 'RITHMIC' && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-white mb-4">Rithmic Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">R|API+ Version:</span>
                <span className="text-white">{connectionSettings.apiVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Environment:</span>
                <span className="text-white">{connectionSettings.environment}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Encryption:</span>
                <span className={connectionSettings.encryptionEnabled ? 'text-green-400' : 'text-gray-400'}>
                  {connectionSettings.encryptionEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Heartbeat:</span>
                <span className="text-white">{connectionSettings.heartbeatInterval}s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection-Specific Configuration Modal */}
      {showConnectionConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  {connection.name} Configuration
                </h2>
              </div>
              <button
                onClick={() => setShowConnectionConfig(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* General Connection Settings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Heartbeat Interval (seconds)</label>
                    <input
                      type="number"
                      value={connectionSettings.heartbeatInterval}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, heartbeatInterval: parseInt(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Reconnect Attempts</label>
                    <input
                      type="number"
                      value={connectionSettings.maxReconnectAttempts}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, maxReconnectAttempts: parseInt(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Data Buffer Size</label>
                    <input
                      type="number"
                      value={connectionSettings.dataBufferSize}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, dataBufferSize: parseInt(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Log Level</label>
                    <select
                      value={connectionSettings.logLevel}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, logLevel: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="DEBUG">Debug</option>
                      <option value="INFO">Info</option>
                      <option value="WARN">Warning</option>
                      <option value="ERROR">Error</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={connectionSettings.autoReconnect}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, autoReconnect: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable auto-reconnect</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={connectionSettings.compressionEnabled}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable data compression</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={connectionSettings.alertsEnabled}
                      onChange={(e) => setConnectionSettings(prev => ({ ...prev, alertsEnabled: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-white">Enable connection alerts</span>
                  </label>
                </div>
              </div>

              {/* Platform-Specific Settings */}
              {connection.type === 'NINJA_TRADER' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">NinjaTrader 8 Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">NTI Port</label>
                      <input
                        type="number"
                        value={connectionSettings.ntiPort || 8080}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, ntiPort: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={connectionSettings.enableMarketData}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, enableMarketData: e.target.checked }))}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Enable market data</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={connectionSettings.enableOrderRouting}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, enableOrderRouting: e.target.checked }))}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Enable order routing</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={connectionSettings.enablePositionUpdates}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, enablePositionUpdates: e.target.checked }))}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Enable real-time position updates</span>
                    </label>
                  </div>
                </div>
              )}

              {connection.type === 'SIERRA_CHART' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Sierra Chart Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">DTC Port</label>
                      <input
                        type="number"
                        value={connectionSettings.dtcPort || 11099}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, dtcPort: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={connectionSettings.acsil}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, acsil: e.target.checked }))}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Enable ACSIL (Advanced Custom Study Interface)</span>
                    </label>
                  </div>
                </div>
              )}

              {connection.type === 'RITHMIC' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Rithmic Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Environment</label>
                      <select
                        value={connectionSettings.environment || 'live'}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, environment: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="test">Test</option>
                        <option value="live">Live</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">API Version</label>
                      <input
                        type="text"
                        value={connectionSettings.apiVersion || '3.9.1'}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, apiVersion: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={connectionSettings.encryptionEnabled}
                        onChange={(e) => setConnectionSettings(prev => ({ ...prev, encryptionEnabled: e.target.checked }))}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-white">Enable encryption</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowConnectionConfig(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectionConfigSave}
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