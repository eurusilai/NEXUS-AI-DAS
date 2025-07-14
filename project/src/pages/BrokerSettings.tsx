import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Edit3,
  Key,
  Server,
  Database,
  Activity,
  Zap
} from 'lucide-react';
import { BrokerConnection } from '../types/trading';
import { AddConnectionModal } from '../components/AddConnectionModal';
import { BrokerConnectionManager } from '../components/BrokerConnectionManager';

export const BrokerSettings: React.FC = () => {
  const [connections, setConnections] = useState<BrokerConnection[]>([
    {
      id: 'ninja-1',
      name: 'NinjaTrader 8 - Main',
      type: 'NINJA_TRADER',
      status: 'DISCONNECTED',
      lastSync: Date.now() - 3600000,
      account: 'SIM101',
      endpoint: 'localhost:8080'
    },
    {
      id: 'sierra-1',
      name: 'Sierra Chart - Live',
      type: 'SIERRA_CHART',
      status: 'DISCONNECTED',
      lastSync: Date.now() - 30000,
      account: 'LIVE-001',
      endpoint: 'localhost:11099'
    },
    {
      id: 'rithmic-1',
      name: 'Rithmic API',
      type: 'RITHMIC',
      status: 'DISCONNECTED',
      lastSync: Date.now() - 5000,
      account: 'LIVE-001',
      apiKey: '****-****-****-1234'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  // persist connections to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('broker-connections');
    if (stored) {
      try { setConnections(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('broker-connections', JSON.stringify(connections));
  }, [connections]);

  const handleAddConnection = (conn: BrokerConnection) => {
    setConnections(prev => [...prev, conn]);
  };

  const handleUpdateConnection = (updatedConnection: BrokerConnection) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === updatedConnection.id ? updatedConnection : conn
      )
    );
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const getStatusStats = () => {
    const connected = connections.filter(c => c.status === 'CONNECTED').length;
    const disconnected = connections.filter(c => c.status === 'DISCONNECTED').length;
    const errors = connections.filter(c => c.status === 'ERROR').length;
    return { connected, disconnected, errors };
  };

  const stats = getStatusStats();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Broker Connections</h1>
          <p className="text-gray-400">Manage your trading platform connections and real-time data feeds</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Connection</span>
        </button>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{stats.connected}</span>
          </div>
          <h3 className="text-white font-medium">Connected</h3>
          <p className="text-sm text-gray-400">Active data feeds</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <WifiOff className="w-8 h-8 text-gray-400" />
            <span className="text-2xl font-bold text-gray-400">{stats.disconnected}</span>
          </div>
          <h3 className="text-white font-medium">Disconnected</h3>
          <p className="text-sm text-gray-400">Inactive connections</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{stats.errors}</span>
          </div>
          <h3 className="text-white font-medium">Errors</h3>
          <p className="text-sm text-gray-400">Failed connections</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-blue-400">{connections.length}</span>
          </div>
          <h3 className="text-white font-medium">Total</h3>
          <p className="text-sm text-gray-400">Configured brokers</p>
        </div>
      </div>

      {/* Active Connections */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold text-white">Active Connections</h2>
        {connections.map((connection) => (
          <BrokerConnectionManager
            key={connection.id}
            connection={connection}
            onUpdate={handleUpdateConnection}
            onDelete={handleDeleteConnection}
          />
        ))}
        
        {connections.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium mb-2">No broker connections configured</h3>
            <p className="mb-4">Add your first trading platform connection to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Connection
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddConnectionModal 
          onClose={() => setShowAddForm(false)} 
          onAdd={handleAddConnection} 
        />
      )}

      {/* Integration Guides */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Integration Setup Guides</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-900/20 rounded-lg">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-white font-medium">NinjaTrader 8</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Enable NTI (NinjaTrader Interface)</p>
              <p>• Configure port 8080 for API access</p>
              <p>• Install NEXUS NT8 addon</p>
              <p>• Enable real-time data permissions</p>
            </div>
            <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
              View Setup Guide →
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-900/20 rounded-lg">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-white font-medium">Sierra Chart</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Enable ACSIL (Advanced Custom Study Interface)</p>
              <p>• Configure DTC protocol on port 11099</p>
              <p>• Install NEXUS Sierra Chart DLL</p>
              <p>• Setup market data feed</p>
            </div>
            <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
              View Setup Guide →
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-white font-medium">Rithmic API</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Obtain Rithmic API credentials</p>
              <p>• Configure R|API+ connection</p>
              <p>• Setup market data subscriptions</p>
              <p>• Enable order routing permissions</p>
            </div>
            <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
              View Setup Guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};