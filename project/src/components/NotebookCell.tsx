import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Code, 
  FileText, 
  MoreVertical, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown,
  Image,
  BarChart3,
  Download
} from 'lucide-react';

export interface NotebookCell {
  id: string;
  type: 'code' | 'markdown' | 'sql' | 'visualization';
  content: string;
  output?: string;
  language?: string;
  isRunning?: boolean;
  executionCount?: number;
  metadata?: any;
}

interface NotebookCellProps {
  cell: NotebookCell;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (cell: NotebookCell) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onExecute: () => void;
}

export const NotebookCellComponent: React.FC<NotebookCellProps> = ({
  cell,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onExecute
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cell.content.length, cell.content.length);
    }
  }, [isEditing]);

  const handleContentChange = (content: string) => {
    onUpdate({ ...cell, content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    } else if (e.ctrlKey && e.key === 'Enter') {
      onExecute();
    }
  };

  const getCellIcon = () => {
    switch (cell.type) {
      case 'code':
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'markdown':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'sql':
        return <Code className="w-4 h-4 text-green-400" />;
      case 'visualization':
        return <BarChart3 className="w-4 h-4 text-orange-400" />;
      default:
        return <Code className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLanguageLabel = () => {
    switch (cell.type) {
      case 'code':
        return cell.language || 'Python';
      case 'markdown':
        return 'Markdown';
      case 'sql':
        return 'SQL';
      case 'visualization':
        return 'Chart';
      default:
        return 'Text';
    }
  };

  const renderOutput = () => {
    if (!cell.output) return null;

    if (cell.type === 'visualization') {
      return (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="h-64 flex items-center justify-center text-gray-600">
            <BarChart3 className="w-12 h-12 mr-4" />
            <div>
              <div className="font-medium">Chart Output</div>
              <div className="text-sm">Visualization would render here</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Output [{cell.executionCount || 1}]:</span>
            {cell.type === 'code' && (
              <button className="text-xs text-gray-400 hover:text-white">
                <Download className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
          {cell.output}
        </pre>
      </div>
    );
  };

  return (
    <div
      className={`group relative bg-gray-900 border rounded-xl overflow-hidden transition-all ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-800 hover:border-gray-700'
      }`}
      onClick={onSelect}
    >
      {/* Cell Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {getCellIcon()}
          <span className="text-sm text-gray-400">{getLanguageLabel()}</span>
          {cell.executionCount && (
            <span className="text-xs text-gray-500">In [{cell.executionCount}]</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {cell.type === 'code' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExecute();
              }}
              disabled={cell.isRunning}
              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Run Cell (Ctrl+Enter)"
            >
              {cell.isRunning ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Move Up
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Move Down
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cell Content */}
      <div className="p-4">
        {isEditing || isSelected ? (
          <textarea
            ref={textareaRef}
            value={cell.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={Math.max(3, cell.content.split('\n').length)}
            placeholder={`Enter ${getLanguageLabel()} code...`}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="min-h-[60px] p-3 bg-gray-800 rounded-lg cursor-text"
          >
            {cell.content ? (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {cell.content}
              </pre>
            ) : (
              <div className="text-gray-500 text-sm">
                Click to edit {getLanguageLabel().toLowerCase()} cell...
              </div>
            )}
          </div>
        )}

        {renderOutput()}
      </div>

      {/* Execution Indicator */}
      {cell.isRunning && (
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse"></div>
      )}
    </div>
  );
};