import React, { useState, useEffect } from 'react';
import {
  Brain,
  Activity,
  Zap,
  Database,
  TrendingUp,
  Shield,
  Target,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { pythonBrainClient, PythonBrainStatus, PythonAnalysisResult } from '../services/PythonBrainClient';

interface PythonBrainMonitorProps {
  dashboardContext?: any;
}

export const PythonBrainMonitor: React.FC<PythonBrainMonitorProps> = ({ dashboardContext }) => {
  const [status, setStatus] = useState<PythonBrainStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recentAnalysis, setRecentAnalysis] = useState<PythonAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    // Check initial connection status
    setIsConnected(pythonBrainClient.getConnectionStatus());
    
    // Initialize connection
    pythonBrainClient.initialize();
    
    // Load status
    loadStatus();
    
    // Set up event listeners
    const handleConnection = (event: CustomEvent) => {
      setIsConnected(event.detail.isConnected);
    };

    const handleAnalysisResult = (event: CustomEvent) => {
      const result = event.detail as PythonAnalysisResult;
      setRecentAnalysis(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      setLastUpdate(Date.now());
    };

    const handleAutoAnalysis = (event: CustomEvent) => {
      console.log('🐍 Auto analysis triggered:', event.detail);
    };

    window.addEventListener('pythonBrainConnection', handleConnection as EventListener);
    window.addEventListener('pythonAnalysisResult', handleAnalysisResult as EventListener);
    window.addEventListener('pythonAutoAnalysis', handleAutoAnalysis as EventListener);

    // Subscribe to analysis results
    const unsubscribe = pythonBrainClient.subscribe('analysis_result', (result: PythonAnalysisResult) => {
      setRecentAnalysis(prev => [result, ...prev.slice(0, 9)]);
    });

    // Periodic status updates
    const statusInterval = setInterval(loadStatus, 10000); // Every 10 seconds

    return () => {
      window.removeEventListener('pythonBrainConnection', handleConnection as EventListener);
      window.removeEventListener('pythonAnalysisResult', handleAnalysisResult as EventListener);
      window.removeEventListener('pythonAutoAnalysis', handleAutoAnalysis as EventListener);
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  useEffect(() => {
    // Auto-distribute dashboard context when it changes
    if (dashboardContext && autoAnalysisEnabled && isConnected) {
      pythonBrainClient.distributeData(dashboardContext);
    }
  }, [dashboardContext, autoAnalysisEnabled, isConnected]);

  const loadStatus = async () => {
    try {
      const currentStatus = await pythonBrainClient.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.warn('Python Brain service unavailable:', error);
      // Set a default status to prevent UI errors
      setStatus({
        pythonReady: false,
        connectedClients: 0,
        activeStreams: 0,
        lastHeartbeat: null,
        analysisCache: 0
      });
    }
  };

  const runAnalysis = async (analysisType: string) => {
    if (!isConnected || !dashboardContext) return;

    setIsAnalyzing(true);
    try {
      let result: PythonAnalysisResult;

      switch (analysisType) {
        case 'market':
          result = await pythonBrainClient.analyzeMarket(dashboardContext.marketData || []);
          break;
        case 'strategy':
          result = await pythonBrainClient.analyzeStrategy(
            dashboardContext.strategies || [],
            dashboardContext.performance || {}
          );
          break;
        case 'risk':
          result = await pythonBrainClient.analyzeRisk(
            dashboardContext.riskMetrics || {},
            dashboardContext.positions || []
          );
          break;
        case 'portfolio':
          result = await pythonBrainClient.optimizePortfolio(
            dashboardContext.positions || [],
            0.12, // 12% target return
            'medium' // risk tolerance
          );
          break;
        case 'prediction':
          result = await pythonBrainClient.predictPrice(dashboardContext.marketData || [], 24);
          break;
        case 'patterns':
          result = await pythonBrainClient.detectPatterns(dashboardContext.marketData || []);
          break;
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }

      setRecentAnalysis(prev => [result, ...prev.slice(0, 9)]);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error(`Analysis error (${analysisType}):`, error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-400 bg-red-900/20';
    if (!status?.pythonReady) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-green-400 bg-green-900/20';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (!status) return 'Loading...';
    if (!status?.pythonReady) return 'Initializing';
    return 'Ready';
  };

  const getStatusIcon = () => {
    if (!isConnected) return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (!status) return <Clock className="w-5 h-5 text-gray-400" />;
    if (!status?.pythonReady) return <Clock className="w-5 h-5 text-yellow-400" />;
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const formatAnalysisType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'market_analysis': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'strategy_analysis': return <Target className="w-4 h-4 text-blue-400" />;
      case 'risk_analysis': return <Shield className="w-4 h-4 text-orange-400" />;
      case 'portfolio_optimization': return <BarChart3 className="w-4 h-4 text-purple-400" />;
      case 'price_prediction': return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'pattern_detection': return <Activity className="w-4 h-4 text-pink-400" />;
      default: return <Brain className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-900/20 rounded-full">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Python Brain</h2>
            <p className="text-sm text-gray-400">Advanced Analytics Engine</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          
          <button
            onClick={() => setAutoAnalysisEnabled(!autoAnalysisEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              autoAnalysisEnabled 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400'
            }`}
            title={`Auto Analysis: ${autoAnalysisEnabled ? 'Enabled' : 'Disabled'}`}
          >
            {autoAnalysisEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={loadStatus}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">CLIENTS</span>
            </div>
            <div className="text-xl font-bold text-white">{status.connectedClients}</div>
            <div className="text-sm text-gray-400">Connected</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">STREAMS</span>
            </div>
            <div className="text-xl font-bold text-white">{status.activeStreams}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400">CACHE</span>
            </div>
            <div className="text-xl font-bold text-white">{status.analysisCache}</div>
            <div className="text-sm text-gray-400">Cached</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-gray-400">HEARTBEAT</span>
            </div>
            <div className="text-xl font-bold text-white">
              {status.lastHeartbeat ? Math.floor((Date.now() - status.lastHeartbeat) / 1000) : '--'}s
            </div>
            <div className="text-sm text-gray-400">Ago</div>
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => runAnalysis('market')}
            disabled={!isConnected || isAnalyzing}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Market Analysis</span>
          </button>
          
          <button
            onClick={() => runAnalysis('strategy')}
            disabled={!isConnected || isAnalyzing}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Target className="w-4 h-4 text-blue-400" />
            <span>Strategy Review</span>
          </button>
          
          <button
            onClick={() => runAnalysis('risk')}
            disabled={!isConnected || isAnalyzing}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4 text-orange-400" />
            <span>Risk Analysis</span>
          </button>
          
          <button
            onClick={() => runAnalysis('portfolio')}
            disabled={!isConnected || isAnalyzing}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Portfolio Optimization</span>
          </button>
          
          <button
            onClick={() => runAnalysis('prediction')}
            disabled={!isConnected || isAnalyzing}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Price Prediction</span>
          </button>
          
          <button
            onClick={() => runAnalysis('patterns')}
            disabled={!isConnected || isAnalyzing}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Activity className="w-4 h-4 text-pink-400" />
            <span>Pattern Detection</span>
          </button>
        </div>
      </div>

      {/* Recent Analysis Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Analysis</h3>
          {lastUpdate > 0 && (
            <span className="text-sm text-gray-400">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {recentAnalysis.length === 0 ? (
            <div className="text-center py-8 text-gray-500 relative">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              {!isConnected ? (
                <>
                  <p className="text-orange-400 font-medium">Python Brain Service Unavailable</p>
                  <p className="text-sm mt-2">
                    Start the Python Brain service to enable AI analysis features
                  </p>
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg text-left">
                    <p className="text-xs text-gray-400 mb-1">To start the service:</p>
                    <code className="text-xs text-green-400">npm run python-brain</code>
                  </div>
                </>
              ) : (
                <>
                  <p>No analysis results yet</p>
                  <p className="text-sm">Run an analysis to see results here</p>
                </>
              )}
            </div>
          ) : (
            recentAnalysis.map((result, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getAnalysisIcon(result.analysis_type)}
                    <span className="text-white font-medium">
                      {formatAnalysisType(result.analysis_type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{result.processing_time}ms</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300 mb-2">
                  {result.result.error ? (
                    <span className="text-red-400">Error: {result.result.error}</span>
                  ) : (
                    <span>
                      Analysis completed successfully
                      {result.confidence && (
                        <span className="ml-2 text-blue-400">
                          (Confidence: {(result.confidence * 100).toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="flex items-center space-x-3 px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-white">Running Analysis...</span>
          </div>
        </div>
      )}
    </div>
  );
};