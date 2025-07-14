import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Trade } from './TradeCard';

export interface ExportModalProps {
  onClose: () => void;
  trades: Trade[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, trades }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeScreenshots, setIncludeScreenshots] = useState(false);

  const handleExport = () => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = [
        'Date',
        'Symbol',
        'Type',
        'Entry',
        'Exit',
        'Stop Loss',
        'Take Profit',
        'Quantity',
        'Result',
        'R-Multiple',
        'Strategy',
        'Setup',
        'Timeframe',
        'Tags',
        'Notes',
        'Emotions',
        'Mistakes',
        'Quality',
        ...(includeScreenshots ? ['Screenshots'] : [])
      ].join(',');

      const rows = trades.map(trade => [
        trade.date,
        trade.symbol,
        trade.type,
        trade.entry,
        trade.exit,
        trade.stopLoss,
        trade.takeProfit,
        trade.quantity,
        trade.result,
        trade.rMultiple,
        trade.strategy,
        trade.setup,
        trade.timeframe,
        trade.tags.join(';'),
        `"${trade.notes}"`,
        trade.emotions.join(';'),
        trade.mistakes.join(';'),
        trade.quality,
        ...(includeScreenshots ? [trade.screenshots.join(';')] : [])
      ].join(','));

      content = [headers, ...rows].join('\n');
      filename = `trades_export_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(
        trades.map(trade => ({
          ...trade,
          screenshots: includeScreenshots ? trade.screenshots : undefined
        })),
        null,
        2
      );
      filename = `trades_export_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Export Trades</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Export Format</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg border ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg border ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Options</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeScreenshots}
                onChange={(e) => setIncludeScreenshots(e.target.checked)}
                className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800"
              />
              <span className="text-white">Include Screenshots</span>
            </label>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export {trades.length} Trades</span>
          </button>
        </div>
      </div>
    </div>
  );
};