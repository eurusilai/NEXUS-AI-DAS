import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { BrokerConnection } from '../types/trading';

interface Props {
  onClose: () => void;
  onAdd: (connection: BrokerConnection) => void;
}

export const AddConnectionModal: React.FC<Props> = ({ onClose, onAdd }) => {
  const [form, setForm] = useState<Omit<BrokerConnection, 'id' | 'status' | 'lastSync'>>({
    name: '',
    type: 'SIERRA_CHART',
    account: '',
    endpoint: ''
  } as any);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newConn: BrokerConnection = {
      id: `conn-${Date.now()}`,
      status: 'DISCONNECTED',
      lastSync: Date.now(),
      ...form
    } as BrokerConnection;
    onAdd(newConn);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Connection</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Platform</label>
            <select value={form.type} onChange={e=>setForm({...form, type:e.target.value as any})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
              <option value="SIERRA_CHART">Sierra Chart</option>
              <option value="NINJA_TRADER">NinjaTrader</option>
              <option value="RITHMIC">Rithmic</option>
              <option value="INTERACTIVE_BROKERS">Interactive Brokers</option>
              <option value="TD_AMERITRADE">TD Ameritrade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Account</label>
            <input value={form.account} onChange={e=>setForm({...form, account:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Endpoint / API Key</label>
            <input value={form.endpoint || ''} onChange={e=>setForm({...form, endpoint:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Connection</span>
          </button>
        </form>
      </div>
    </div>
  );
}; 