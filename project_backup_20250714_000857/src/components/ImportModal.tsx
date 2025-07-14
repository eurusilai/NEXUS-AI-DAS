import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Database } from 'lucide-react';

export interface ImportModalProps {
  onClose: () => void;
  onImport: (data: any) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [selectedBroker, setSelectedBroker] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const brokers = [
    { id: 'mt4', name: 'MetaTrader 4' },
    { id: 'mt5', name: 'MetaTrader 5' },
    { id: 'ninjatrader', name: 'NinjaTrader 8' },
    { id: 'tradingview', name: 'TradingView' },
    { id: 'thinkorswim', name: 'ThinkOrSwim' },
    { id: 'tradestation', name: 'TradeStation' },
    { id: 'interactive', name: 'Interactive Brokers' },
    { id: 'binance', name: 'Binance' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    // Implement import logic here
    onImport({ broker: selectedBroker, file });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Import Trades</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Import Methods */}
        <div className="space-y-6">
          {/* Broker Integration */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Select Broker</h3>
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a broker...</option>
              {brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>
                  {broker.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Upload Trade History</h3>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6">
              <div className="flex flex-col items-center">
                <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-400 text-center mb-4">
                  Drag and drop your CSV file here, or click to select
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </label>
                {file && (
                  <p className="mt-2 text-sm text-gray-400">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!selectedBroker && !file}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedBroker || file
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Import Trades</span>
          </button>
        </div>
      </div>
    </div>
  );
};