import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  BookOpen, 
  Zap,
  RefreshCw,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { enhancedMistralAI as mistralAI, DashboardContext } from '../services/MistralAI';

interface AIAnalysisPanelProps {
  dashboardContext: DashboardContext;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ dashboardContext }) => {
  const [analyses, setAnalyses] = useState<{
    market?: string;
    strategy?: string;
    risk?: string;
    journal?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<{
    market: boolean;
    strategy: boolean;
    risk: boolean;
    journal: boolean;
  }>({
    market: false,
    strategy: false,
    risk: false,
    journal: false
  });
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    // Update AI context when dashboard data changes
    if (dashboardContext) {
      mistralAI.updateDashboardContext(dashboardContext);
    }
  }, [dashboardContext]);

  const runAnalysis = async (type: 'market' | 'strategy' | 'risk' | 'journal') => {
    if (!mistralAI.isReady()) return;

    setIsLoading(prev => ({ ...prev, [type]: true }));

    try {
      let result = '';
      switch (type) {
        case 'market':
          result = await mistralAI.analyzeMarketConditions();
          break;
        case 'strategy':
          result = await mistralAI.analyzeStrategyPerformance();
          break;
        case 'risk':
          result = await mistralAI.analyzeRiskProfile();
          break;
        case 'journal':
          result = await mistralAI.analyzeTradingJournal();
          break;
      }

      setAnalyses(prev => ({ ...prev, [type]: result }));
      setLastUpdate(Date.now());
    } catch (error) {
      console.error(`${type} analysis error:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const runAllAnalyses = async () => {
    if (!mistralAI.isReady()) return;

    await Promise.all([
      runAnalysis('market'),
      runAnalysis('strategy'),
      runAnalysis('risk'),
      runAnalysis('journal')
    ]);
  };

  if (!mistralAI.isReady()) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-white">AI Analysis</h2>
          </div>
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">AI analysis requires Mistral AI configuration</p>
          <p className="text-sm text-gray-500">Open the AI chat to configure your API key</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">AI Analysis</h2>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdate > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Updated {new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
          )}
          <button
            onClick={runAllAnalyses}
            disabled={Object.values(isLoading).some(loading => loading)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${Object.values(isLoading).some(loading => loading) ? 'animate-spin' : ''}`} />
            <span>Analyze All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Analysis */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-medium">Market Conditions</h3>
            </div>
            <button
              onClick={() => runAnalysis('market')}
              disabled={isLoading.market}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading.market ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-sm text-gray-300 max-h-32 overflow-y-auto">
            {isLoading.market ? (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 animate-pulse text-blue-400" />
                <span>Analyzing market conditions...</span>
              </div>
            ) : analyses.market ? (
              <p>{analyses.market.substring(0, 200)}...</p>
            ) : (
              <p className="text-gray-500">Click refresh to analyze current market conditions</p>
            )}
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-medium">Strategy Performance</h3>
            </div>
            <button
              onClick={() => runAnalysis('strategy')}
              disabled={isLoading.strategy}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading.strategy ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-sm text-gray-300 max-h-32 overflow-y-auto">
            {isLoading.strategy ? (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 animate-pulse text-blue-400" />
                <span>Analyzing strategy performance...</span>
              </div>
            ) : analyses.strategy ? (
              <p>{analyses.strategy.substring(0, 200)}...</p>
            ) : (
              <p className="text-gray-500">Click refresh to analyze strategy performance</p>
            )}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-medium">Risk Assessment</h3>
            </div>
            <button
              onClick={() => runAnalysis('risk')}
              disabled={isLoading.risk}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading.risk ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-sm text-gray-300 max-h-32 overflow-y-auto">
            {isLoading.risk ? (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 animate-pulse text-blue-400" />
                <span>Analyzing risk profile...</span>
              </div>
            ) : analyses.risk ? (
              <p>{analyses.risk.substring(0, 200)}...</p>
            ) : (
              <p className="text-gray-500">Click refresh to analyze risk profile</p>
            )}
          </div>
        </div>

        {/* Journal Review */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium">Journal Review</h3>
            </div>
            <button
              onClick={() => runAnalysis('journal')}
              disabled={isLoading.journal}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading.journal ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-sm text-gray-300 max-h-32 overflow-y-auto">
            {isLoading.journal ? (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 animate-pulse text-blue-400" />
                <span>Analyzing trading journal...</span>
              </div>
            ) : analyses.journal ? (
              <p>{analyses.journal.substring(0, 200)}...</p>
            ) : (
              <p className="text-gray-500">Click refresh to analyze trading journal</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};