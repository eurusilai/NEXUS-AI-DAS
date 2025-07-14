import React, { useState } from 'react';
import { 
  Upload,
  Calendar,
  Filter,
  Download,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Tag,
  BarChart2
} from 'lucide-react';
import { TradeForm } from '../components/TradeForm';
import { TradeCard, Trade } from '../components/TradeCard';
import { JournalStats } from '../components/JournalStats';
import { ImportModal } from '../components/ImportModal';
import { ExportModal } from '../components/ExportModal';
import { useTrades } from '../context/TradeContext';

export const TradingJournal: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNewTradeForm, setShowNewTradeForm] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | undefined>();

  const { trades, addTrade, updateTrade, deleteTrade } = useTrades();

  const handleImport = (data: any) => {
    // Implement import logic
    console.log('Importing data:', data);
    setShowImportModal(false);
  };

  const handleAddTrade = (trade: Trade) => {
    addTrade({ ...trade, id: `trade-${Date.now()}` });
    setShowNewTradeForm(false);
  };

  const handleEditTrade = (trade: Trade) => {
    updateTrade(trade);
    setSelectedTrade(undefined);
  };

  const handleDeleteTrade = (tradeId: string) => {
    deleteTrade(tradeId);
  };

  const analytics = {
    totalTrades: trades.length,
    winRate: trades.length ? (trades.filter(t => t.result > 0).length / trades.length) * 100 : 0,
    profitFactor: 2.5, // placeholder
    averageRR: 1.8, // placeholder
    totalReturn: trades.reduce((sum, t) => sum + t.result, 0),
    maxDrawdown: -15, // placeholder
    sharpeRatio: 1.2, // placeholder
    averageDuration: 45, // placeholder
    bestTrade: trades.length ? Math.max(...trades.map(t => t.result)) : 0,
    worstTrade: trades.length ? Math.min(...trades.map(t => t.result)) : 0,
    consecutiveWins: 3,
    consecutiveLosses: 1
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Journal</h1>
          <p className="text-gray-400">Track, analyze, and improve your trading performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowNewTradeForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Trade</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <JournalStats analytics={analytics} />

      {/* Filters and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select className="flex-1 bg-transparent text-white border-none focus:ring-0">
            <option value="7d">Last 7 Days</option>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="ytd">Year to Date</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
          <Tag className="w-5 h-5 text-gray-400" />
          <select className="flex-1 bg-transparent text-white border-none focus:ring-0">
            <option value="all">All Strategies</option>
            <option value="breakout">Breakout</option>
            <option value="momentum">Momentum</option>
            <option value="reversal">Reversal</option>
            <option value="swing">Swing</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
          <BarChart2 className="w-5 h-5 text-gray-400" />
          <select className="flex-1 bg-transparent text-white border-none focus:ring-0">
            <option value="all">All Symbols</option>
            <option value="forex">Forex</option>
            <option value="crypto">Crypto</option>
            <option value="stocks">Stocks</option>
            <option value="futures">Futures</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
          <Filter className="w-5 h-5 text-gray-400" />
          <select className="flex-1 bg-transparent text-white border-none focus:ring-0">
            <option value="all">All Results</option>
            <option value="win">Winners</option>
            <option value="loss">Losers</option>
            <option value="be">Break Even</option>
          </select>
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-4">
        {trades.map(trade => (
          <TradeCard
            key={trade.id}
            trade={trade}
            onEdit={(trade) => setSelectedTrade(trade)}
            onDelete={handleDeleteTrade}
          />
        ))}
        {trades.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No trades yet. Add your first trade or import existing trades.
          </div>
        )}
      </div>

      {/* Modals */}
      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
      
      {showExportModal && (
        <ExportModal 
          onClose={() => setShowExportModal(false)}
          trades={trades}
        />
      )}
      
      {(showNewTradeForm || selectedTrade) && (
        <TradeForm 
          onClose={() => {
            setShowNewTradeForm(false);
            setSelectedTrade(undefined);
          }}
          onSubmit={selectedTrade ? handleEditTrade : handleAddTrade}
          initialTrade={selectedTrade}
        />
      )}
    </div>
  );
};
