import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Star,
  BarChart2,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Copy,
  Play,
  Eye,
  BookOpen,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { PlaybookEditor, PlaybookStrategy } from '../components/PlaybookEditor';

export const Playbooks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<PlaybookStrategy | undefined>();
  const [playbooks, setPlaybooks] = useState<PlaybookStrategy[]>([]);

  // Load playbooks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('trading-playbooks');
    if (stored) {
      try {
        setPlaybooks(JSON.parse(stored));
      } catch {
        // Initialize with sample data if parsing fails
        initializeSamplePlaybooks();
      }
    } else {
      initializeSamplePlaybooks();
    }
  }, []);

  // Save playbooks to localStorage
  useEffect(() => {
    localStorage.setItem('trading-playbooks', JSON.stringify(playbooks));
  }, [playbooks]);

  const initializeSamplePlaybooks = () => {
    const samplePlaybooks: PlaybookStrategy[] = [
      {
        id: '1',
        name: 'Momentum Breakout Pro',
        description: 'High-probability momentum breakouts with volume confirmation and institutional order flow analysis',
        category: 'BREAKOUT',
        timeframes: ['5m', '15m', '1h'],
        markets: ['ES', 'NQ', 'YM'],
        entryRules: [
          {
            id: 'entry-1',
            condition: 'Price breaks above previous day high with volume > 150% of 20-period average',
            description: 'Confirms institutional interest and momentum',
            priority: 'HIGH',
            isRequired: true
          },
          {
            id: 'entry-2',
            condition: 'RSI(14) > 60 but < 80',
            description: 'Ensures momentum without being overbought',
            priority: 'MEDIUM',
            isRequired: false
          }
        ],
        exitRules: [
          {
            id: 'exit-1',
            condition: 'Price reaches 2R target or closes below 20 EMA',
            description: 'Take profits at predetermined level or trend change',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        stopLossRules: [
          {
            id: 'stop-1',
            condition: 'Place stop 1 ATR below breakout level',
            description: 'Risk management based on volatility',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        takeProfitRules: [
          {
            id: 'tp-1',
            condition: 'First target at 1.5R, second at 3R',
            description: 'Scale out strategy for maximum profit',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        riskManagement: {
          maxRiskPerTrade: 1.5,
          maxPositionSize: 5,
          maxDailyLoss: 3,
          requiredRR: 2
        },
        performance: {
          winRate: 72.5,
          profitFactor: 2.8,
          averageRR: 2.4,
          totalTrades: 145,
          lastUpdated: '2024-03-15'
        },
        notes: 'Works best in trending markets with high volume. Avoid during major news events.',
        tags: ['momentum', 'breakout', 'volume', 'institutional']
      },
      {
        id: '2',
        name: 'Supply & Demand Zones',
        description: 'Trading institutional supply and demand zones with precise entry and exit levels',
        category: 'REVERSAL',
        timeframes: ['15m', '1h', '4h'],
        markets: ['ES', 'CL', 'GC'],
        entryRules: [
          {
            id: 'entry-1',
            condition: 'Price reaches untested supply/demand zone',
            description: 'Fresh zones have higher probability',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        exitRules: [
          {
            id: 'exit-1',
            condition: 'Price reaches opposite zone or 3R target',
            description: 'Zone-to-zone trading strategy',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        stopLossRules: [
          {
            id: 'stop-1',
            condition: 'Stop beyond zone with 10-point buffer',
            description: 'Account for false breakouts',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        takeProfitRules: [
          {
            id: 'tp-1',
            condition: 'Target next significant zone',
            description: 'Zone-to-zone profit taking',
            priority: 'HIGH',
            isRequired: true
          }
        ],
        riskManagement: {
          maxRiskPerTrade: 2,
          maxPositionSize: 3,
          maxDailyLoss: 4,
          requiredRR: 2.5
        },
        performance: {
          winRate: 68.2,
          profitFactor: 2.1,
          averageRR: 2.5,
          totalTrades: 124,
          lastUpdated: '2024-03-10'
        },
        notes: 'Requires patience and discipline. Best results in ranging markets.',
        tags: ['supply-demand', 'zones', 'reversal', 'patience']
      }
    ];
    setPlaybooks(samplePlaybooks);
  };

  const handleSavePlaybook = (playbook: PlaybookStrategy) => {
    if (editingPlaybook) {
      setPlaybooks(prev => prev.map(p => p.id === playbook.id ? playbook : p));
    } else {
      setPlaybooks(prev => [...prev, playbook]);
    }
    setShowEditor(false);
    setEditingPlaybook(undefined);
  };

  const handleEditPlaybook = (playbook: PlaybookStrategy) => {
    setEditingPlaybook(playbook);
    setShowEditor(true);
  };

  const handleDeletePlaybook = (id: string) => {
    setPlaybooks(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicatePlaybook = (playbook: PlaybookStrategy) => {
    const duplicate: PlaybookStrategy = {
      ...playbook,
      id: `${playbook.id}-copy-${Date.now()}`,
      name: `${playbook.name} (Copy)`,
      performance: {
        ...playbook.performance,
        totalTrades: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    setPlaybooks(prev => [...prev, duplicate]);
  };

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playbook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playbook.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || playbook.category === selectedCategory;
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'high-performance' && playbook.performance.winRate > 70) ||
                         (selectedFilter === 'recent' && new Date(playbook.performance.lastUpdated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const getPerformanceColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-400';
    if (winRate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryIcon = (category: PlaybookStrategy['category']) => {
    switch (category) {
      case 'MOMENTUM': return <TrendingUp className="w-4 h-4" />;
      case 'REVERSAL': return <Target className="w-4 h-4" />;
      case 'BREAKOUT': return <BarChart2 className="w-4 h-4" />;
      case 'SCALPING': return <Clock className="w-4 h-4" />;
      case 'SWING': return <Users className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Playbooks</h1>
          <p className="text-gray-400">Manage and optimize your proven trading strategies</p>
        </div>

        <button 
          onClick={() => setShowEditor(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Playbook</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search playbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="MOMENTUM">Momentum</option>
          <option value="REVERSAL">Reversal</option>
          <option value="BREAKOUT">Breakout</option>
          <option value="SCALPING">Scalping</option>
          <option value="SWING">Swing</option>
        </select>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Playbooks</option>
          <option value="high-performance">High Performance (&gt;70%)</option>
          <option value="recent">Recently Updated</option>
        </select>

        <div className="text-sm text-gray-400 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          {filteredPlaybooks.length} of {playbooks.length} playbooks
        </div>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaybooks.map((playbook) => (
          <div key={playbook.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    {getCategoryIcon(playbook.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{playbook.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                        {playbook.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {playbook.performance.totalTrades} trades
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditPlaybook(playbook)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicatePlaybook(playbook)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlaybook(playbook.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {playbook.description}
              </p>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getPerformanceColor(playbook.performance.winRate)}`}>
                    {playbook.performance.winRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {playbook.performance.averageRR.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Avg R:R</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {playbook.performance.profitFactor.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Profit Factor</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {playbook.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {playbook.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                    +{playbook.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Risk Management */}
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-400 mb-2">Risk Management</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Max Risk: </span>
                    <span className="text-white">{playbook.riskManagement.maxRiskPerTrade}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Required R:R: </span>
                    <span className="text-white">{playbook.riskManagement.requiredRR}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Updated {new Date(playbook.performance.lastUpdated).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors">
                    <Play className="w-3 h-3" />
                    <span>Activate</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlaybooks.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No playbooks found</h3>
          <p className="text-gray-400 mb-6">
            {playbooks.length === 0 
              ? "Create your first trading playbook to get started"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          <button
            onClick={() => setShowEditor(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Create Playbook
          </button>
        </div>
      )}

      {/* Playbook Editor Modal */}
      {showEditor && (
        <PlaybookEditor
          playbook={editingPlaybook}
          onSave={handleSavePlaybook}
          onClose={() => {
            setShowEditor(false);
            setEditingPlaybook(undefined);
          }}
        />
      )}
    </div>
  );
};