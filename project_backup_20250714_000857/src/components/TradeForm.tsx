import React, { useState } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { Trade } from './TradeCard';

export interface TradeFormProps {
  onClose: () => void;
  onSubmit: (trade: Trade) => void;
  initialTrade?: Trade;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onClose, onSubmit, initialTrade }) => {
  const [trade, setTrade] = useState<Partial<Trade>>(initialTrade || {
    symbol: '',
    type: 'LONG',
    entry: 0,
    exit: 0,
    stopLoss: 0,
    takeProfit: 0,
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    result: 0,
    rMultiple: 0,
    strategy: '',
    setup: '',
    timeframe: '5m',
    tags: [],
    notes: '',
    screenshots: [],
    emotions: [],
    mistakes: [],
    quality: 3
  });

  const [newTag, setNewTag] = useState('');
  const [newEmotion, setNewEmotion] = useState('');
  const [newMistake, setNewMistake] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(trade as Trade);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag && !trade.tags?.includes(newTag)) {
      setTrade(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const handleAddEmotion = () => {
    if (newEmotion && !trade.emotions?.includes(newEmotion)) {
      setTrade(prev => ({
        ...prev,
        emotions: [...(prev.emotions || []), newEmotion]
      }));
      setNewEmotion('');
    }
  };

  const handleAddMistake = () => {
    if (newMistake && !trade.mistakes?.includes(newMistake)) {
      setTrade(prev => ({
        ...prev,
        mistakes: [...(prev.mistakes || []), newMistake]
      }));
      setNewMistake('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTrade(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleRemoveEmotion = (emotion: string) => {
    setTrade(prev => ({
      ...prev,
      emotions: prev.emotions?.filter(e => e !== emotion) || []
    }));
  };

  const handleRemoveMistake = (mistake: string) => {
    setTrade(prev => ({
      ...prev,
      mistakes: prev.mistakes?.filter(m => m !== mistake) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialTrade ? 'Edit Trade' : 'New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Trade Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
              <input
                type="text"
                value={trade.symbol}
                onChange={e => setTrade(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <select
                value={trade.type}
                onChange={e => setTrade(prev => ({ ...prev, type: e.target.value as 'LONG' | 'SHORT' }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Entry</label>
              <input
                type="number"
                step="any"
                value={trade.entry}
                onChange={e => setTrade(prev => ({ ...prev, entry: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Exit</label>
              <input
                type="number"
                step="any"
                value={trade.exit}
                onChange={e => setTrade(prev => ({ ...prev, exit: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={trade.stopLoss}
                onChange={e => setTrade(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Take Profit</label>
              <input
                type="number"
                step="any"
                value={trade.takeProfit}
                onChange={e => setTrade(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={trade.date}
                onChange={e => setTrade(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Strategy</label>
              <input
                type="text"
                value={trade.strategy}
                onChange={e => setTrade(prev => ({ ...prev, strategy: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Setup</label>
              <input
                type="text"
                value={trade.setup}
                onChange={e => setTrade(prev => ({ ...prev, setup: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {trade.tags?.map(tag => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-800 text-white rounded"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Emotions</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newEmotion}
                onChange={e => setNewEmotion(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Add an emotion..."
              />
              <button
                type="button"
                onClick={handleAddEmotion}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {trade.emotions?.map(emotion => (
                <span
                  key={emotion}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-800 text-white rounded"
                >
                  <span>{emotion}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmotion(emotion)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mistakes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Mistakes</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newMistake}
                onChange={e => setNewMistake(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Add a mistake..."
              />
              <button
                type="button"
                onClick={handleAddMistake}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {trade.mistakes?.map(mistake => (
                <span
                  key={mistake}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-800 text-white rounded"
                >
                  <span>{mistake}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMistake(mistake)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={trade.notes}
              onChange={e => setTrade(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Add your trade notes..."
            />
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Trade Quality</label>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setTrade(prev => ({ ...prev, quality: rating as 1 | 2 | 3 | 4 | 5 }))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    trade.quality === rating
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{initialTrade ? 'Update' : 'Save'} Trade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};