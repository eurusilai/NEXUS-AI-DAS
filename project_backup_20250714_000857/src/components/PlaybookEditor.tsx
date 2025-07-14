import React, { useState } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Target, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Tag
} from 'lucide-react';

export interface PlaybookRule {
  id: string;
  condition: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isRequired: boolean;
}

export interface PlaybookStrategy {
  id: string;
  name: string;
  description: string;
  category: 'MOMENTUM' | 'REVERSAL' | 'BREAKOUT' | 'SCALPING' | 'SWING';
  timeframes: string[];
  markets: string[];
  entryRules: PlaybookRule[];
  exitRules: PlaybookRule[];
  stopLossRules: PlaybookRule[];
  takeProfitRules: PlaybookRule[];
  riskManagement: {
    maxRiskPerTrade: number;
    maxPositionSize: number;
    maxDailyLoss: number;
    requiredRR: number;
  };
  performance: {
    winRate: number;
    profitFactor: number;
    averageRR: number;
    totalTrades: number;
    lastUpdated: string;
  };
  notes: string;
  tags: string[];
}

interface PlaybookEditorProps {
  playbook?: PlaybookStrategy;
  onSave: (playbook: PlaybookStrategy) => void;
  onClose: () => void;
}

export const PlaybookEditor: React.FC<PlaybookEditorProps> = ({ 
  playbook, 
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState<PlaybookStrategy>(
    playbook || {
      id: `playbook-${Date.now()}`,
      name: '',
      description: '',
      category: 'MOMENTUM',
      timeframes: [],
      markets: [],
      entryRules: [],
      exitRules: [],
      stopLossRules: [],
      takeProfitRules: [],
      riskManagement: {
        maxRiskPerTrade: 2,
        maxPositionSize: 10,
        maxDailyLoss: 5,
        requiredRR: 2
      },
      performance: {
        winRate: 0,
        profitFactor: 0,
        averageRR: 0,
        totalTrades: 0,
        lastUpdated: new Date().toISOString()
      },
      notes: '',
      tags: []
    }
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'risk' | 'performance'>('overview');
  const [newTag, setNewTag] = useState('');

  const addRule = (type: 'entryRules' | 'exitRules' | 'stopLossRules' | 'takeProfitRules') => {
    const newRule: PlaybookRule = {
      id: `rule-${Date.now()}`,
      condition: '',
      description: '',
      priority: 'MEDIUM',
      isRequired: false
    };

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newRule]
    }));
  };

  const updateRule = (
    type: 'entryRules' | 'exitRules' | 'stopLossRules' | 'takeProfitRules',
    ruleId: string,
    updates: Partial<PlaybookRule>
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  };

  const removeRule = (
    type: 'entryRules' | 'exitRules' | 'stopLossRules' | 'takeProfitRules',
    ruleId: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(rule => rule.id !== ruleId)
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      performance: {
        ...formData.performance,
        lastUpdated: new Date().toISOString()
      }
    });
  };

  const renderRuleSection = (
    title: string,
    type: 'entryRules' | 'exitRules' | 'stopLossRules' | 'takeProfitRules',
    icon: React.ReactNode,
    color: string
  ) => (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <button
          onClick={() => addRule(type)}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rule</span>
        </button>
      </div>

      <div className="space-y-3">
        {formData[type].map((rule, index) => (
          <div key={rule.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Rule {index + 1}</span>
                <select
                  value={rule.priority}
                  onChange={(e) => updateRule(type, rule.id, { priority: e.target.value as any })}
                  className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={rule.isRequired}
                    onChange={(e) => updateRule(type, rule.id, { isRequired: e.target.checked })}
                    className="rounded border-gray-600"
                  />
                  <span className="text-xs text-gray-400">Required</span>
                </label>
              </div>
              <button
                onClick={() => removeRule(type, rule.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Condition</label>
                <input
                  type="text"
                  value={rule.condition}
                  onChange={(e) => updateRule(type, rule.id, { condition: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="e.g., Price > 20 EMA"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={rule.description}
                  onChange={(e) => updateRule(type, rule.id, { description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  rows={2}
                  placeholder="Detailed explanation of the rule..."
                />
              </div>
            </div>
          </div>
        ))}

        {formData[type].length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rules defined. Click "Add Rule" to get started.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {playbook ? 'Edit Playbook' : 'Create New Playbook'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'rules', label: 'Trading Rules', icon: Target },
            { id: 'risk', label: 'Risk Management', icon: Shield },
            { id: 'performance', label: 'Performance', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Strategy Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="Enter strategy name..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="MOMENTUM">Momentum</option>
                    <option value="REVERSAL">Reversal</option>
                    <option value="BREAKOUT">Breakout</option>
                    <option value="SCALPING">Scalping</option>
                    <option value="SWING">Swing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  rows={4}
                  placeholder="Describe your trading strategy..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags</label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-white rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  rows={6}
                  placeholder="Additional notes, observations, and insights..."
                />
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-8">
              {renderRuleSection(
                'Entry Rules',
                'entryRules',
                <TrendingUp className="w-5 h-5" />,
                'bg-green-900/20'
              )}
              
              {renderRuleSection(
                'Exit Rules',
                'exitRules',
                <Target className="w-5 h-5" />,
                'bg-blue-900/20'
              )}
              
              {renderRuleSection(
                'Stop Loss Rules',
                'stopLossRules',
                <Shield className="w-5 h-5" />,
                'bg-red-900/20'
              )}
              
              {renderRuleSection(
                'Take Profit Rules',
                'takeProfitRules',
                <CheckCircle className="w-5 h-5" />,
                'bg-purple-900/20'
              )}
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Risk Per Trade (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.riskManagement.maxRiskPerTrade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        riskManagement: {
                          ...prev.riskManagement,
                          maxRiskPerTrade: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Position Size</label>
                    <input
                      type="number"
                      value={formData.riskManagement.maxPositionSize}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        riskManagement: {
                          ...prev.riskManagement,
                          maxPositionSize: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Daily Loss (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.riskManagement.maxDailyLoss}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        riskManagement: {
                          ...prev.riskManagement,
                          maxDailyLoss: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Required Risk/Reward</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.riskManagement.requiredRR}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        riskManagement: {
                          ...prev.riskManagement,
                          requiredRR: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Win Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.performance.winRate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        performance: {
                          ...prev.performance,
                          winRate: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Profit Factor</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.performance.profitFactor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        performance: {
                          ...prev.performance,
                          profitFactor: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Average R:R</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.performance.averageRR}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        performance: {
                          ...prev.performance,
                          averageRR: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Total Trades</label>
                    <input
                      type="number"
                      value={formData.performance.totalTrades}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        performance: {
                          ...prev.performance,
                          totalTrades: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Playbook</span>
          </button>
        </div>
      </div>
    </div>
  );
};