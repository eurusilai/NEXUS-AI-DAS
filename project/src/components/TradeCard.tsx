import React from 'react';
import { Edit3, Trash2, ExternalLink, Image, MessageSquare } from 'lucide-react';

export interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  date: string;
  result: number;
  rMultiple: number;
  strategy: string;
  setup: string;
  timeframe: string;
  tags: string[];
  notes: string;
  screenshots: string[];
  emotions: string[];
  mistakes: string[];
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface TradeCardProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

export const TradeCard: React.FC<TradeCardProps> = ({ trade, onEdit, onDelete }) => {
  const isWin = trade.result > 0;
  const isBreakEven = trade.result === 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{trade.symbol}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isWin ? 'bg-green-900/20 text-green-400' :
              isBreakEven ? 'bg-gray-800 text-gray-400' :
              'bg-red-900/20 text-red-400'
            }`}>
              {isWin ? 'Win' : isBreakEven ? 'Break Even' : 'Loss'}
            </span>
            <span className={`text-sm ${
              isWin ? 'text-green-400' :
              isBreakEven ? 'text-gray-400' :
              'text-red-400'
            }`}>
              {trade.result > 0 ? '+' : ''}{trade.result.toFixed(2)}%
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
            <span>{new Date(trade.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{trade.type}</span>
            <span>•</span>
            <span>R: {trade.rMultiple.toFixed(2)}</span>
            <span>•</span>
            <span>{trade.timeframe}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {trade.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Entry: </span>
              <span className="text-white">{trade.entry}</span>
            </div>
            <div>
              <span className="text-gray-400">Exit: </span>
              <span className="text-white">{trade.exit}</span>
            </div>
            <div>
              <span className="text-gray-400">Stop Loss: </span>
              <span className="text-white">{trade.stopLoss}</span>
            </div>
            <div>
              <span className="text-gray-400">Take Profit: </span>
              <span className="text-white">{trade.takeProfit}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit(trade)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(trade.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {(trade.notes || trade.screenshots.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          {trade.notes && (
            <p className="text-gray-300 text-sm mb-3">{trade.notes}</p>
          )}
          
          {trade.screenshots.length > 0 && (
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {trade.screenshots.length} screenshot{trade.screenshots.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};