import React, { useState, useEffect } from 'react';
import {
  Plus,
  Save,
  Play,
  Download,
  Upload,
  Settings,
  Code,
  FileText,
  ChevronDown,
  BarChart2,
  Database,
  Cpu,
  Terminal,
  PlayCircle,
  Square,
  Zap,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { NotebookCellComponent, NotebookCell } from '../components/NotebookCell';
import { ConfigModal } from '../components/ConfigModal';

const getInitialNotebookCells = (): NotebookCell[] => {
  const stored = localStorage.getItem('notebook-cells');
  if (stored) {
    try { 
      return JSON.parse(stored); 
    } catch {}
  }
  return [
    {
      id: '1',
      type: 'markdown',
      content: '# NEXUS V5.0 Trading Analysis Notebook\n\nThis notebook provides a comprehensive environment for analyzing trading data, developing strategies, and backtesting algorithms.\n\n## Features\n- **Python Integration**: Full Python environment with trading libraries\n- **SQL Queries**: Direct database access for trade analysis\n- **Visualization**: Advanced charting and plotting capabilities\n- **Real-time Data**: Live market data integration',
      executionCount: 0
    },
    {
      id: '2',
      type: 'code',
      language: 'python',
      content: "# Import essential trading libraries\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfrom datetime import datetime, timedelta\nimport warnings\nwarnings.filterwarnings('ignore')\n\n# Configure plotting\nplt.style.use('dark_background')\nsns.set_palette(\"husl\")\n\nprint(\"✅ Trading analysis environment initialized\")\nprint(f\"📊 Pandas version: {{pd.__version__}}\")\nprint(f\"🔢 NumPy version: {{np.__version__}}\")\nprint(f\"📈 Matplotlib version: {{plt.matplotlib.__version__}}\")",
      output: '✅ Trading analysis environment initialized\n📊 Pandas version: 1.5.3\n🔢 NumPy version: 1.24.3\n📈 Matplotlib version: 3.7.1',
      executionCount: 1
    },
    {
      id: '3',
      type: 'sql',
      content: `-- Query recent trading performance
SELECT 
    DATE(timestamp) as trade_date,
    symbol,
    COUNT(*) as total_trades,
    SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
    ROUND(AVG(pnl), 2) as avg_pnl,
    ROUND(SUM(pnl), 2) as total_pnl,
    ROUND(AVG(r_multiple), 2) as avg_r_multiple
FROM trades 
WHERE timestamp >= DATE('now', '-30 days')
GROUP BY DATE(timestamp), symbol
ORDER BY trade_date DESC, total_pnl DESC;`,
      output: 'trade_date    symbol  total_trades  winning_trades  avg_pnl  total_pnl  avg_r_multiple\n2024-03-15    ES      12           8              245.50   2946.00    1.85\n2024-03-15    NQ      8            5              180.25   1442.00    1.92\n2024-03-14    ES      15           9              156.75   2351.25    1.67\n2024-03-14    CL      6            4              89.50    537.00     2.15',
      executionCount: 2
    },
    {
      id: '4',
      type: 'code',
      language: 'python',
      content: "# Load and analyze trading data\ndef load_trading_data():\n    \"\"\"Load trading data from the database\"\"\"\n    # Simulated data for demonstration\n    dates = pd.date_range('2024-01-01', '2024-03-15', freq='D')\n    \n    data = []\n    for date in dates:\n        # Generate realistic trading data\n        num_trades = np.random.poisson(8)  # Average 8 trades per day\n        for _ in range(num_trades):\n            pnl = np.random.normal(50, 150)  # Average $50 profit, $150 std\n            r_multiple = pnl / 100 if pnl > 0 else pnl / 50  # Risk multiple\n            \n            data.append({{\n                'date': date,\n                'symbol': np.random.choice(['ES', 'NQ', 'CL', 'GC']),\n                'pnl': pnl,\n                'r_multiple': r_multiple,\n                'strategy': np.random.choice(['Momentum', 'Reversal', 'Breakout']),\n                'win': pnl > 0\n            }})\n    \n    return pd.DataFrame(data)\n\n# Load the data\ndf = load_trading_data()\nprint(f\"📈 Loaded {{len(df)}} trades from {{df['date'].min().date()}} to {{df['date'].max().date()}}\")\nprint(f\"💰 Total P&L: ${{df['pnl'].sum():.2f}}\")\nprint(f\"🎯 Win Rate: {{(df['win'].sum() / len(df) * 100):.1f}}%\")\nprint(f\"📊 Average R-Multiple: {{df['r_multiple'].mean():.2f}}\")",
      output: '📈 Loaded 592 trades from 2024-01-01 to 2024-03-15\n💰 Total P&L: $28,456.78\n🎯 Win Rate: 64.2%\n📊 Average R-Multiple: 1.85',
      executionCount: 3
    },
    {
      id: '5',
      type: 'visualization',
      content: "# Create comprehensive trading performance dashboard\nfig, axes = plt.subplots(2, 2, figsize=(15, 10))\nfig.suptitle('Trading Performance Dashboard', fontsize=16, color='white')\n\n# 1. Daily P&L\ndaily_pnl = df.groupby('date')['pnl'].sum()\naxes[0,0].plot(daily_pnl.index, daily_pnl.values, color='#00ff88', linewidth=2)\naxes[0,0].axhline(y=0, color='red', linestyle='--', alpha=0.7)\naxes[0,0].set_title('Daily P&L', color='white')\naxes[0,0].set_ylabel('P&L ($)', color='white')\naxes[0,0].tick_params(colors='white')\n\n# 2. Win Rate by Strategy\nstrategy_stats = df.groupby('strategy').agg({{\n    'win': 'mean',\n    'pnl': 'count'\n}}).round(3)\nstrategy_stats.columns = ['Win Rate', 'Trade Count']\nstrategy_stats['Win Rate'].plot(kind='bar', ax=axes[0,1], color=['#ff6b6b', '#4ecdc4', '#45b7d1'])\naxes[0,1].set_title('Win Rate by Strategy', color='white')\naxes[0,1].set_ylabel('Win Rate', color='white')\naxes[0,1].tick_params(colors='white')\n\n# 3. R-Multiple Distribution\naxes[1,0].hist(df['r_multiple'], bins=30, color='#ffa726', alpha=0.7, edgecolor='white')\naxes[1,0].axvline(x=0, color='red', linestyle='--', alpha=0.7)\naxes[1,0].set_title('R-Multiple Distribution', color='white')\naxes[1,0].set_xlabel('R-Multiple', color='white')\naxes[1,0].set_ylabel('Frequency', color='white')\naxes[1,0].tick_params(colors='white')\n\n# 4. Cumulative P&L\ncumulative_pnl = daily_pnl.cumsum()\naxes[1,1].plot(cumulative_pnl.index, cumulative_pnl.values, color='#9c27b0', linewidth=2)\naxes[1,1].fill_between(cumulative_pnl.index, cumulative_pnl.values, alpha=0.3, color='#9c27b0')\naxes[1,1].set_title('Cumulative P&L', color='white')\naxes[1,1].set_ylabel('Cumulative P&L ($)', color='white')\naxes[1,1].tick_params(colors='white')\n\nplt.tight_layout()\nplt.show()",
      executionCount: 4
    }
  ];
};

export const Notebook: React.FC = () => {
  const [cells, setCells] = useState<NotebookCell[]>(getInitialNotebookCells());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [kernelStatus, setKernelStatus] = useState<'idle' | 'busy' | 'disconnected'>('idle');
  const [notebookConfig, setNotebookConfig] = useState({
    pythonPath: '/usr/bin/python3',
    kernelTimeout: 30000,
    maxOutputLines: 1000,
    autoSave: true,
    autoSaveInterval: 30000,
    enableCodeCompletion: true,
    enableSyntaxHighlighting: true,
    theme: 'dark',
    fontSize: 14,
    tabSize: 4,
    enableLineNumbers: true,
    enableMinimap: false,
    enableWordWrap: true
  });

  useEffect(() => {
    localStorage.setItem('notebook-cells', JSON.stringify(cells));
  }, [cells]);

  useEffect(() => {
    // Load notebook configuration
    const stored = localStorage.getItem('nexus-notebook-config');
    if (stored) {
      try {
        setNotebookConfig(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch (error) {
        console.error('Failed to load notebook config:', error);
      }
    }
  }, []);

  const addCell = (type: NotebookCell['type']) => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content: '',
      language: type === 'code' ? 'python' : undefined,
      executionCount: 0
    };
    setCells(prev => [...prev, newCell]);
    setShowMenu(false);
    setSelectedCell(newCell.id);
  };

  const updateCell = (cellId: string, updates: Partial<NotebookCell>) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId ? { ...cell, ...updates } : cell
    ));
  };

  const deleteCell = (cellId: string) => {
    setCells(prev => prev.filter(cell => cell.id !== cellId));
    if (selectedCell === cellId) {
      setSelectedCell(null);
    }
  };

  const moveCell = (cellId: string, direction: 'up' | 'down') => {
    setCells(prev => {
      const index = prev.findIndex(cell => cell.id === cellId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newCells = [...prev];
      [newCells[index], newCells[newIndex]] = [newCells[newIndex], newCells[index]];
      return newCells;
    });
  };

  const duplicateCell = (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;
    
    const newCell: NotebookCell = {
      ...cell,
      id: Date.now().toString(),
      executionCount: 0,
      output: undefined
    };
    
    const index = cells.findIndex(c => c.id === cellId);
    setCells(prev => [
      ...prev.slice(0, index + 1),
      newCell,
      ...prev.slice(index + 1)
    ]);
  };

  const executeCell = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    setKernelStatus('busy');
    updateCell(cellId, { isRunning: true });

    // Simulate execution with realistic timing
    const executionTime = 1000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, executionTime));

    let output = '';
    if (cell.type === 'code') {
      if (cell.language === 'python') {
        output = `Executed Python code successfully.\n✅ Cell completed in ${(executionTime/1000).toFixed(2)}s\n📊 Output would appear here in a real environment.`;
      } else {
        output = `Executed ${cell.language || 'code'} successfully.\nOutput would appear here.`;
      }
    } else if (cell.type === 'sql') {
      output = 'Query executed successfully.\n✅ 156 rows returned\n📊 Results would appear here.';
    } else if (cell.type === 'visualization') {
      output = '📈 Chart generated successfully\n🎨 Visualization would render here';
    }

    updateCell(cellId, { 
      isRunning: false, 
      output,
      executionCount: (cell.executionCount || 0) + 1
    });
    setKernelStatus('idle');
  };

  const runAllCells = async () => {
    setIsRunningAll(true);
    for (const cell of cells) {
      if (cell.type === 'code' || cell.type === 'sql' || cell.type === 'visualization') {
        await executeCell(cell.id);
      }
    }
    setIsRunningAll(false);
  };

  const exportNotebook = () => {
    const notebook = {
      cells: cells,
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        },
        language_info: {
          name: "python",
          version: "3.9.0"
        },
        nexus_config: notebookConfig
      },
      nbformat: 4,
      nbformat_minor: 4
    };

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_notebook_${new Date().toISOString().split('T')[0]}.ipynb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfigSave = (settings: any) => {
    const newConfig = {
      ...notebookConfig,
      ...settings.notebook
    };
    setNotebookConfig(newConfig);
    localStorage.setItem('nexus-notebook-config', JSON.stringify(newConfig));
    console.log('📝 Notebook configuration saved:', newConfig);
  };

  const restartKernel = () => {
    setKernelStatus('disconnected');
    setTimeout(() => {
      setKernelStatus('idle');
      // Clear all cell outputs
      setCells(prev => prev.map(cell => ({
        ...cell,
        output: undefined,
        executionCount: 0,
        isRunning: false
      })));
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Analysis Notebook</h1>
          <p className="text-gray-400">Interactive environment for trading research and strategy development</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Kernel Status */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              kernelStatus === 'idle' ? 'bg-green-500' :
              kernelStatus === 'busy' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-400">
              {kernelStatus === 'idle' ? 'Python 3 (idle)' :
               kernelStatus === 'busy' ? 'Python 3 (busy)' :
               'Kernel disconnected'}
            </span>
          </div>

          {/* Add Cell Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cell</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => addCell('code')}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <Code className="w-4 h-4 mr-3 text-blue-400" />
                  <div>
                    <div className="text-white">Code Cell</div>
                    <div className="text-xs text-gray-400">Python, R, Julia</div>
                  </div>
                </button>
                <button
                  onClick={() => addCell('markdown')}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-3 text-purple-400" />
                  <div>
                    <div className="text-white">Markdown Cell</div>
                    <div className="text-xs text-gray-400">Documentation</div>
                  </div>
                </button>
                <button
                  onClick={() => addCell('sql')}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <Database className="w-4 h-4 mr-3 text-green-400" />
                  <div>
                    <div className="text-white">SQL Cell</div>
                    <div className="text-xs text-gray-400">Database queries</div>
                  </div>
                </button>
                <button
                  onClick={() => addCell('visualization')}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <BarChart2 className="w-4 h-4 mr-3 text-orange-400" />
                  <div>
                    <div className="text-white">Visualization</div>
                    <div className="text-xs text-gray-400">Charts and plots</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={runAllCells}
              disabled={isRunningAll}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
              title="Run All Cells"
            >
              {isRunningAll ? (
                <Square className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              <span>{isRunningAll ? 'Running...' : 'Run All'}</span>
            </button>

            <button 
              onClick={restartKernel}
              className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors"
              title="Restart Kernel"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setCells([])}
              className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors"
              title="Clear All Outputs"
            >
              <Terminal className="w-4 h-4" />
            </button>

            <button 
              onClick={exportNotebook}
              className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors"
              title="Export Notebook"
            >
              <Download className="w-4 h-4" />
            </button>

            <button 
              className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors"
              title="Import Notebook"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setShowConfig(true)}
              className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors"
              title="Notebook Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Status */}
      {notebookConfig.autoSave && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <Save className="w-4 h-4" />
            <span>Auto-save enabled - Notebook saved automatically every {notebookConfig.autoSaveInterval / 1000}s</span>
          </div>
        </div>
      )}

      {/* Notebook Cells */}
      <div className="space-y-4">
        {cells.map((cell, index) => (
          <NotebookCellComponent
            key={cell.id}
            cell={cell}
            isSelected={selectedCell === cell.id}
            onSelect={() => setSelectedCell(cell.id)}
            onUpdate={(updatedCell) => updateCell(cell.id, updatedCell)}
            onDelete={() => deleteCell(cell.id)}
            onMoveUp={() => moveCell(cell.id, 'up')}
            onMoveDown={() => moveCell(cell.id, 'down')}
            onDuplicate={() => duplicateCell(cell.id)}
            onExecute={() => executeCell(cell.id)}
          />
        ))}

        {cells.length === 0 && (
          <div className="text-center py-16">
            <Cpu className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Empty Notebook</h3>
            <p className="text-gray-400 mb-6">Start by adding your first cell to begin analysis</p>
            <button
              onClick={() => addCell('code')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Code Cell
            </button>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        componentType="notebook"
        initialSettings={{
          notebook: notebookConfig
        }}
        onSave={handleConfigSave}
      />
    </div>
  );
};