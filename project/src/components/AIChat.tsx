import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Settings,
  TrendingUp,
  Shield,
  BookOpen,
  X,
  Minimize2,
  BarChart3,
  Brain,
  AlertCircle,
  CheckCircle,
  Loader,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { enhancedMistralAI as mistralAI, ChatMessage, DashboardContext } from '../services/MistralAI';

interface AIChatProps {
  dashboardContext: DashboardContext;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  dashboardContext,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing configuration
    const currentConfig = mistralAI.getConfiguration();
    setIsConfigured(mistralAI.isReady());
    setApiKey(currentConfig.apiKey || '');

    // Update AI with dashboard context
    mistralAI.updateDashboardContext(dashboardContext);

    // Load chat history
    const stored = localStorage.getItem('ai-chat-history');
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    } else {
      // Add welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hello! I'm NEXUS AI, your intelligent trading assistant. I have access to all your dashboard data including market conditions, positions, strategies, and risk metrics.

I can help you with:
🔍 **Market Analysis** - Analyze current market conditions and trends
📊 **Strategy Optimization** - Review and improve your trading strategies
⚖️ **Risk Assessment** - Evaluate your risk profile and exposure
📖 **Trading Journal Review** - Analyze your trading performance and patterns
🎯 **Trade Ideas** - Suggest potential trading opportunities
📚 **Education** - Explain trading concepts and techniques

What would you like to analyze today?`,
        timestamp: Date.now()
      }]);
    }
  }, [dashboardContext]);

  useEffect(() => {
    // Save chat history
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConfigured) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await mistralAI.sendMessage(inputMessage.trim(), { useHistory: true });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration and try again.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    try {
      let response = '';
      switch (action) {
        case 'market-analysis':
          const marketAnalysis = await mistralAI.analyzeMarketConditions();
          response = marketAnalysis.analysis;
          break;
        case 'strategy-performance':
          const strategyAnalysis = await mistralAI.analyzeStrategyPerformance();
          response = strategyAnalysis.analysis;
          break;
        case 'risk-assessment':
          const riskAnalysis = await mistralAI.analyzeRiskProfile();
          response = riskAnalysis.analysis;
          break;
        case 'journal-review':
          const journalAnalysis = await mistralAI.analyzeTradingJournal();
          response = journalAnalysis.analysis;
          break;
        default:
          response = 'Unknown action requested.';
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Quick action error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I encountered an error while performing this analysis: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSave = () => {
    if (apiKey.trim()) {
      try {
        const success = mistralAI.configure({ apiKey: apiKey.trim() });
        setIsConfigured(success);

        if (success) {
          setShowConfig(false);
          const configMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '✅ Mistral AI has been configured successfully! I\'m now ready to help you with advanced trading analysis.',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, configMessage]);
        } else {
          // Show error message
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '❌ Failed to configure Mistral AI. Please check your API key and try again.',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Configuration error:', error);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai-chat-history');
  };

  const testConnection = async () => {
    if (!isConfigured) return;

    setIsLoading(true);
    try {
      const testResult = await mistralAI.testConnection();
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: testResult
          ? '✅ Connection test successful! AI is ready to assist you.'
          : '❌ Connection test failed. Please check your API key and try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, message]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        >
          <Bot className="w-5 h-5" />
          <span>NEXUS AI</span>
          {!isConfigured && <AlertCircle className="w-4 h-4 text-yellow-400" />}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-900/20 rounded-lg">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">NEXUS AI</h3>
            <div className="flex items-center space-x-2">
              {isConfigured ? (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Ready</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Setup Required</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfig(true)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="AI Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMinimize}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {isConfigured && (
        <div className="p-3 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickAction('market-analysis')}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>Market Analysis</span>
            </button>
            <button
              onClick={() => handleQuickAction('strategy-performance')}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Strategy Review</span>
            </button>
            <button
              onClick={() => handleQuickAction('risk-assessment')}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Risk Assessment</span>
            </button>
            <button
              onClick={() => handleQuickAction('journal-review')}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Journal Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`p-2 rounded-full ${
                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-400" />
                )}
              </div>

              <div className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Good response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Poor response"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-800 rounded-full">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-400">Analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isConfigured ? "Ask me anything about your trading..." : "Configure API key first..."}
            disabled={!isConfigured || isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !isConfigured}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">AI Configuration</h3>
              <button
                onClick={() => setShowConfig(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mistral AI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Mistral AI API key..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">console.mistral.ai</a>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Clear Chat
                </button>
                {isConfigured && (
                  <button
                    onClick={testConnection}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
                  >
                    Test
                  </button>
                )}
                <button
                  onClick={handleConfigSave}
                  disabled={!apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};