import { Mistral } from '@mistralai/mistralai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  context?: any;
  metadata?: {
    model?: string;
    temperature?: number;
    tokens?: number;
    confidence?: number;
  };
}

export interface DashboardContext {
  marketData: any[];
  strategies: any[];
  positions: any[];
  riskMetrics: any;
  orderFlow: any;
  liquidationData: any;
  mqScore: any;
  trades: any[];
  performance: any;
  brokerConnections: any[];
  economicEvents?: any[];
  technicalIndicators?: any;
  sentiment?: any;
  volatility?: any;
  correlations?: any;
}

export interface AIAnalysisResult {
  analysis: string;
  confidence: number;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  keyMetrics: Record<string, any>;
  timestamp: number;
}

export interface AIConfiguration {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  safeMode: boolean;
  customInstructions?: string;
}

export class EnhancedMistralAIService {
  private static instance: EnhancedMistralAIService;
  private client: Mistral;
  private config: AIConfiguration;
  private isConfigured: boolean = false;
  private dashboardContext: DashboardContext | null = null;
  private conversationHistory: ChatMessage[] = [];
  private analysisCache: Map<string, AIAnalysisResult> = new Map();
  private rateLimiter: Map<string, number> = new Map();

  // Available AI models
  private readonly AVAILABLE_MODELS = [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'pixtral-large-latest',
    'codestral-latest'
  ];

  static getInstance(): EnhancedMistralAIService {
    if (!EnhancedMistralAIService.instance) {
      EnhancedMistralAIService.instance = new EnhancedMistralAIService();
    }
    return EnhancedMistralAIService.instance;
  }

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_MISTRAL_API_KEY || '',
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 4000,
      topP: 0.95,
      topK: 50,
      safeMode: true
    };
    
    this.initializeClient();
    this.loadConfiguration();
  }

  private initializeClient() {
    if (this.config.apiKey) {
      this.client = new Mistral({ apiKey: this.config.apiKey });
      this.isConfigured = true;
    }
  }

  private loadConfiguration() {
    try {
      const stored = localStorage.getItem('enhanced-mistral-config');
      if (stored) {
        const savedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...savedConfig };
        this.initializeClient();
      }
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
    }
  }

  private saveConfiguration() {
    try {
      localStorage.setItem('enhanced-mistral-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save AI configuration:', error);
    }
  }

  // Configuration Management
  public configure(config: Partial<AIConfiguration>): boolean {
    try {
      this.config = { ...this.config, ...config };
      
      if (config.apiKey) {
        this.client = new Mistral({ apiKey: config.apiKey });
        this.isConfigured = true;
      }
      
      this.saveConfiguration();
      return true;
    } catch (error) {
      console.error('Failed to configure AI service:', error);
      return false;
    }
  }

  public getConfiguration(): AIConfiguration {
    return { ...this.config };
  }

  public getAvailableModels(): string[] {
    return [...this.AVAILABLE_MODELS];
  }

  // Context Management
  public updateDashboardContext(context: DashboardContext) {
    this.dashboardContext = context;
    this.clearAnalysisCache(); // Clear cache when context changes
  }

  public getDashboardContext(): DashboardContext | null {
    return this.dashboardContext;
  }

  // Rate Limiting
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const lastCall = this.rateLimiter.get(endpoint) || 0;
    const minInterval = 1000; // 1 second between calls
    
    if (now - lastCall < minInterval) {
      return false;
    }
    
    this.rateLimiter.set(endpoint, now);
    return true;
  }

  // Core AI Communication
  public async sendMessage(
    message: string, 
    options: {
      useHistory?: boolean;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<ChatMessage> {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please provide an API key.');
    }

    if (!this.checkRateLimit('sendMessage')) {
      throw new Error('Rate limit exceeded. Please wait a moment.');
    }

    try {
      const systemPrompt = options.systemPrompt || this.buildAdvancedSystemPrompt();
      const contextPrompt = this.buildContextPrompt();
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: contextPrompt }
      ];

      if (options.useHistory !== false) {
        messages.push(...this.conversationHistory.slice(-20).map(msg => ({
          role: msg.role,
          content: msg.content
        })));
      }

      messages.push({ role: 'user', content: message });

      const response = await this.client.chat.complete({
        model: options.model || this.config.model,
        messages: messages as any,
        temperature: options.temperature || this.config.temperature,
        maxTokens: options.maxTokens || this.config.maxTokens,
        topP: this.config.topP,
        safeMode: this.config.safeMode,
      });

      const responseContent = response.choices[0]?.message?.content || 
        'Unable to generate response. Please try again.';

      const chatMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
        metadata: {
          model: options.model || this.config.model,
          temperature: options.temperature || this.config.temperature,
          tokens: response.usage?.totalTokens || 0,
          confidence: this.calculateConfidence(responseContent)
        }
      };

      this.conversationHistory.push(chatMessage);
      this.trimConversationHistory();

      return chatMessage;
    } catch (error) {
      console.error('AI API error:', error);
      throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
  }

  // Advanced System Prompt
  private buildAdvancedSystemPrompt(): string {
    return `You are NEXUS AI Pro, an elite trading assistant with advanced analytical capabilities integrated with the NEXUS V5.0 Professional Trading Platform.

CORE CAPABILITIES:
• Real-time market analysis and pattern recognition
• Advanced risk assessment and portfolio optimization
• Strategy backtesting and performance evaluation
• Order flow analysis and market microstructure insights
• Sentiment analysis and behavioral finance principles
• Economic calendar integration and macro analysis
• Multi-timeframe technical analysis
• Options flow and derivatives analysis
• Correlation analysis and pair trading insights
• Automated alert generation and trade signals

ANALYTICAL FRAMEWORK:
• Technical Analysis: Price action, indicators, chart patterns
• Fundamental Analysis: Economic data, earnings, sector trends
• Quantitative Analysis: Statistical models, backtesting, optimization
• Risk Management: Position sizing, stop losses, portfolio heat
• Behavioral Analysis: Market psychology, sentiment indicators
• Macro Analysis: Economic cycles, central bank policies

RESPONSE STANDARDS:
• Provide specific, actionable insights with concrete numbers
• Always include confidence levels and risk assessments
• Cite relevant data points and metrics from the dashboard
• Explain reasoning behind recommendations
• Highlight both opportunities and risks
• Use professional trading terminology appropriately
• Maintain objectivity and avoid emotional bias

RISK MANAGEMENT PRIORITY:
• Always prioritize capital preservation
• Consider risk-reward ratios in all recommendations
• Account for market conditions and volatility
• Emphasize position sizing and diversification
• Monitor correlation risks and concentration

Your responses should be professional, precise, and actionable for serious traders and institutions.`;
  }

  private buildContextPrompt(): string {
    if (!this.dashboardContext) {
      return 'No dashboard data currently available. Operating in limited mode.';
    }

    const context = this.dashboardContext;
    let prompt = '=== CURRENT MARKET CONTEXT ===\n\n';

    // Enhanced Market Data Analysis
    if (context.marketData?.length) {
      prompt += '📊 MARKET DATA:\n';
      context.marketData.forEach(market => {
        const trend = market.changePercent >= 0 ? '📈' : '📉';
        const volatility = Math.abs(market.changePercent) > 5 ? 'HIGH' : 'NORMAL';
        prompt += `${trend} ${market.symbol}: $${market.price} (${market.changePercent >= 0 ? '+' : ''}${market.changePercent.toFixed(2)}%)\n`;
        prompt += `   Volume: ${(market.volume / 1000000).toFixed(1)}M | Volatility: ${volatility}\n`;
      });
      prompt += '\n';
    }

    // Portfolio Analysis
    if (context.positions?.length) {
      prompt += '💼 PORTFOLIO POSITIONS:\n';
      let totalPnL = 0;
      let totalExposure = 0;
      
      context.positions.forEach(pos => {
        totalPnL += pos.pnl;
        totalExposure += Math.abs(pos.notionalValue || pos.size * pos.entryPrice);
        const status = pos.pnl >= 0 ? '✅' : '❌';
        prompt += `${status} ${pos.symbol} ${pos.side} ${pos.size} @ $${pos.entryPrice}\n`;
        prompt += `   P&L: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(0)} (${pos.pnlPercent.toFixed(2)}%)\n`;
      });
      
      prompt += `\n📈 Portfolio Summary: Total P&L: $${totalPnL.toFixed(0)} | Exposure: $${totalExposure.toFixed(0)}\n\n`;
    }

    // Strategy Intelligence
    if (context.strategies?.length) {
      prompt += '🤖 STRATEGY PERFORMANCE:\n';
      context.strategies.forEach(strategy => {
        const status = strategy.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE';
        const signal = this.formatSignal(strategy.signal);
        prompt += `${status} ${strategy.name}: ${signal}\n`;
        prompt += `   Confidence: ${strategy.confidence.toFixed(1)}% | P&L: ${strategy.pnl >= 0 ? '+' : ''}$${strategy.pnl.toFixed(0)}\n`;
      });
      prompt += '\n';
    }

    // Advanced Risk Metrics
    if (context.riskMetrics) {
      prompt += '⚠️ RISK ANALYSIS:\n';
      const risk = context.riskMetrics;
      prompt += `Daily P&L: ${risk.dailyPnl >= 0 ? '+' : ''}$${risk.dailyPnl.toFixed(0)}\n`;
      prompt += `Portfolio Heat: ${risk.portfolioHeat.toFixed(1)}% ${this.getRiskLevel(risk.portfolioHeat)}\n`;
      prompt += `Win Rate: ${risk.winRate.toFixed(1)}% | Sharpe: ${risk.sharpeRatio.toFixed(2)}\n`;
      prompt += `Max Drawdown: ${risk.maxDrawdown.toFixed(0)} | Recovery: ${this.getRecoveryStatus(risk)}\n\n`;
    }

    // Market Microstructure
    if (context.orderFlow) {
      prompt += '📊 ORDER FLOW ANALYSIS:\n';
      const flow = context.orderFlow;
      const delta = flow.cumulativeDelta;
      const imbalance = flow.imbalance;
      
      prompt += `Cumulative Delta: ${delta.toFixed(0)} ${delta > 0 ? '(Bullish)' : '(Bearish)'}\n`;
      prompt += `Volume Imbalance: ${imbalance.toFixed(1)}% ${Math.abs(imbalance) > 20 ? '(SIGNIFICANT)' : ''}\n`;
      prompt += `Bid/Ask Ratio: ${(flow.bidVolume / flow.askVolume).toFixed(2)}\n\n`;
    }

    // Market Quality Assessment
    if (context.mqScore) {
      prompt += '🎯 MARKET QUALITY:\n';
      const mq = context.mqScore;
      prompt += `Overall Score: ${mq.overallScore.toFixed(1)}/100 (${mq.grade})\n`;
      prompt += `Liquidity: ${mq.dimensions.liquidity.score.toFixed(1)} (${mq.dimensions.liquidity.status})\n`;
      prompt += `Efficiency: ${mq.dimensions.efficiency.score.toFixed(1)} (${mq.dimensions.efficiency.status})\n`;
      prompt += `Volatility: ${mq.dimensions.volatility.score.toFixed(1)} (${mq.dimensions.volatility.status})\n\n`;
    }

    // Trading Performance Analytics
    if (context.trades?.length) {
      const trades = context.trades.slice(-10);
      prompt += '📈 RECENT TRADING ACTIVITY:\n';
      
      const winRate = trades.filter(t => t.result > 0).length / trades.length * 100;
      const avgReturn = trades.reduce((sum, t) => sum + t.result, 0) / trades.length;
      
      prompt += `Last 10 Trades: ${winRate.toFixed(1)}% win rate | Avg: ${avgReturn.toFixed(2)}%\n`;
      trades.slice(-3).forEach(trade => {
        const result = trade.result >= 0 ? '✅' : '❌';
        prompt += `${result} ${trade.symbol} ${trade.type}: ${trade.result.toFixed(2)}% (R: ${trade.rMultiple.toFixed(2)})\n`;
      });
      prompt += '\n';
    }

    // System Status
    if (context.brokerConnections?.length) {
      prompt += '🔗 CONNECTIONS:\n';
      context.brokerConnections.forEach(conn => {
        const status = conn.status === 'connected' ? '✅' : '❌';
        prompt += `${status} ${conn.name} (${conn.type}): ${conn.status}\n`;
      });
      prompt += '\n';
    }

    return prompt;
  }

  // Comprehensive Analysis Methods
  public async analyzeMarketConditions(): Promise<AIAnalysisResult> {
    const cacheKey = 'market_conditions';
    const cached = this.getCachedAnalysis(cacheKey);
    if (cached) return cached;

    const prompt = `Provide a comprehensive market analysis including:

1. MARKET STRUCTURE ANALYSIS
   - Current trend direction and strength
   - Key support/resistance levels
   - Volume profile and liquidity analysis

2. VOLATILITY ASSESSMENT
   - Current volatility regime
   - Expected volatility vs implied volatility
   - Risk-on vs risk-off sentiment

3. MACRO ENVIRONMENT
   - Economic cycle positioning
   - Central bank policy implications
   - Sector rotation patterns

4. TECHNICAL INDICATORS
   - Multi-timeframe analysis
   - Momentum and trend indicators
   - Divergence patterns

5. TRADING OPPORTUNITIES
   - High-probability setups
   - Risk-reward assessments
   - Position sizing recommendations

Provide specific price levels, percentages, and actionable insights.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    const analysis = this.parseAnalysisResponse(response.content);
    
    this.cacheAnalysis(cacheKey, analysis);
    return analysis;
  }

  public async analyzeStrategyPerformance(): Promise<AIAnalysisResult> {
    const cacheKey = 'strategy_performance';
    const cached = this.getCachedAnalysis(cacheKey);
    if (cached) return cached;

    const prompt = `Analyze current strategy performance with focus on:

1. STRATEGY EFFECTIVENESS
   - Performance metrics and benchmarking
   - Risk-adjusted returns analysis
   - Drawdown analysis and recovery

2. SIGNAL QUALITY
   - Confidence levels and accuracy
   - False signal analysis
   - Timing and execution quality

3. OPTIMIZATION OPPORTUNITIES
   - Parameter tuning recommendations
   - Market regime adaptations
   - Portfolio allocation adjustments

4. RISK MANAGEMENT
   - Position sizing optimization
   - Stop-loss effectiveness
   - Correlation risk assessment

5. IMPLEMENTATION IMPROVEMENTS
   - Execution quality metrics
   - Slippage and cost analysis
   - Technology and infrastructure

Provide specific recommendations with expected impact metrics.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    const analysis = this.parseAnalysisResponse(response.content);
    
    this.cacheAnalysis(cacheKey, analysis);
    return analysis;
  }

  public async analyzeRiskProfile(): Promise<AIAnalysisResult> {
    const cacheKey = 'risk_profile';
    const cached = this.getCachedAnalysis(cacheKey);
    if (cached) return cached;

    const prompt = `Conduct comprehensive risk analysis covering:

1. PORTFOLIO RISK METRICS
   - Value at Risk (VaR) analysis
   - Maximum drawdown assessment
   - Sharpe ratio and risk-adjusted returns

2. CONCENTRATION RISK
   - Position sizing evaluation
   - Correlation analysis
   - Sector/geographic exposure

3. MARKET RISK FACTORS
   - Interest rate sensitivity
   - Volatility exposure
   - Liquidity risk assessment

4. OPERATIONAL RISKS
   - Technology and execution risks
   - Counterparty risk evaluation
   - Regulatory compliance

5. STRESS TESTING
   - Scenario analysis
   - Tail risk assessment
   - Crisis period performance

Provide specific risk metrics and mitigation strategies.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    const analysis = this.parseAnalysisResponse(response.content);
    
    this.cacheAnalysis(cacheKey, analysis);
    return analysis;
  }

  public async analyzeTradingJournal(): Promise<AIAnalysisResult> {
    const cacheKey = 'trading_journal';
    const cached = this.getCachedAnalysis(cacheKey);
    if (cached) return cached;

    const prompt = `Analyze trading journal data for performance insights:

1. BEHAVIORAL PATTERNS
   - Trading frequency and timing
   - Emotional decision-making patterns
   - Consistency in execution

2. PERFORMANCE ANALYTICS
   - Win/loss ratios and streaks
   - Best/worst performing setups
   - Time-based performance variations

3. PSYCHOLOGICAL INSIGHTS
   - Risk tolerance assessment
   - Discipline and patience metrics
   - Bias identification

4. IMPROVEMENT OPPORTUNITIES
   - Skill development areas
   - Process optimization
   - Mental game enhancement

5. SYSTEMATIC IMPROVEMENTS
   - Rule-based system development
   - Automation opportunities
   - Performance tracking enhancements

Provide actionable insights for skill development and performance improvement.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    const analysis = this.parseAnalysisResponse(response.content);
    
    this.cacheAnalysis(cacheKey, analysis);
    return analysis;
  }

  // Advanced Analysis Methods
  public async analyzeOptionsFlow(): Promise<AIAnalysisResult> {
    const prompt = `Analyze options flow and derivatives data:

1. UNUSUAL OPTIONS ACTIVITY
   - Large block trades and sweeps
   - Unusual volume patterns
   - Institutional flow indicators

2. VOLATILITY ANALYSIS
   - Implied volatility surface
   - Volatility skew analysis
   - Term structure evaluation

3. POSITIONING INSIGHTS
   - Put/call ratios
   - Open interest analysis
   - Gamma exposure levels

4. MARKET MAKING ACTIVITY
   - Dealer positioning
   - Flow direction analysis
   - Liquidity provision patterns

Provide specific trading opportunities and risk assessments.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    return this.parseAnalysisResponse(response.content);
  }

  public async analyzeSentiment(): Promise<AIAnalysisResult> {
    const prompt = `Analyze market sentiment and behavioral indicators:

1. SENTIMENT INDICATORS
   - Fear & Greed Index analysis
   - Put/call ratios
   - VIX and volatility metrics

2. POSITIONING DATA
   - Institutional vs retail positioning
   - Commitment of Traders (COT) data
   - Fund flow analysis

3. BEHAVIORAL PATTERNS
   - Herding behavior identification
   - Contrarian opportunities
   - Momentum vs mean reversion

4. SOCIAL SENTIMENT
   - News sentiment analysis
   - Social media indicators
   - Analyst recommendations

Provide sentiment-based trading strategies and risk warnings.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    return this.parseAnalysisResponse(response.content);
  }

  public async generateTradingPlan(): Promise<AIAnalysisResult> {
    const prompt = `Create a comprehensive trading plan based on current conditions:

1. MARKET OUTLOOK
   - Short-term and medium-term view
   - Key levels and catalysts
   - Risk scenarios

2. STRATEGY SELECTION
   - Recommended strategies
   - Market regime alignment
   - Risk-reward profiles

3. POSITION MANAGEMENT
   - Entry and exit criteria
   - Position sizing guidelines
   - Risk management rules

4. EXECUTION PLAN
   - Order types and timing
   - Slippage minimization
   - Performance tracking

5. CONTINGENCY PLANS
   - Stop-loss protocols
   - Scenario-based adjustments
   - Risk escalation procedures

Provide a detailed, actionable trading plan with specific parameters.`;

    const response = await this.sendMessage(prompt, { useHistory: false });
    return this.parseAnalysisResponse(response.content);
  }

  // Utility Methods
  private parseAnalysisResponse(content: string): AIAnalysisResult {
    // Extract key components from the AI response
    const recommendations = this.extractRecommendations(content);
    const risks = this.extractRisks(content);
    const opportunities = this.extractOpportunities(content);
    const confidence = this.calculateConfidence(content);
    const keyMetrics = this.extractKeyMetrics(content);

    return {
      analysis: content,
      confidence,
      recommendations,
      risks,
      opportunities,
      keyMetrics,
      timestamp: Date.now()
    };
  }

  private extractRecommendations(content: string): string[] {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('should') ||
          line.toLowerCase().includes('consider')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.slice(0, 10); // Limit to top 10
  }

  private extractRisks(content: string): string[] {
    const risks = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('risk') || 
          line.toLowerCase().includes('caution') ||
          line.toLowerCase().includes('warning')) {
        risks.push(line.trim());
      }
    }
    
    return risks.slice(0, 10);
  }

  private extractOpportunities(content: string): string[] {
    const opportunities = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('opportunity') || 
          line.toLowerCase().includes('potential') ||
          line.toLowerCase().includes('setup')) {
        opportunities.push(line.trim());
      }
    }
    
    return opportunities.slice(0, 10);
  }

  private extractKeyMetrics(content: string): Record<string, any> {
    const metrics = {};
    const numberRegex = /(\d+(?:\.\d+)?%?)/g;
    const matches = content.match(numberRegex);
    
    if (matches) {
      matches.forEach((match, index) => {
        metrics[`metric_${index}`] = match;
      });
    }
    
    return metrics;
  }

  private calculateConfidence(content: string): number {
    // Simple confidence calculation based on content analysis
    let confidence = 50; // Base confidence
    
    // Increase confidence for specific numbers and data
    if (content.match(/\d+\.\d+%/g)) confidence += 10;
    if (content.match(/\$\d+/g)) confidence += 10;
    if (content.length > 500) confidence += 10;
    if (content.toLowerCase().includes('strong')) confidence += 5;
    if (content.toLowerCase().includes('clear')) confidence += 5;
    
    // Decrease confidence for uncertainty
    if (content.toLowerCase().includes('uncertain')) confidence -= 10;
    if (content.toLowerCase().includes('unclear')) confidence -= 10;
    if (content.toLowerCase().includes('maybe')) confidence -= 5;
    
    return Math.max(0, Math.min(100, confidence));
  }

  // Cache Management
  private getCachedAnalysis(key: string): AIAnalysisResult | null {
    const cached = this.analysisCache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached;
    }
    return null;
  }

  private cacheAnalysis(key: string, analysis: AIAnalysisResult): void {
    this.analysisCache.set(key, analysis);
  }

  private clearAnalysisCache(): void {
    this.analysisCache.clear();
  }

  // Conversation Management
  private trimConversationHistory(): void {
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  public clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  // Utility Functions
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private formatSignal(signal: string): string {
    const signalMap = {
      'buy': '🟢 BUY',
      'sell': '🔴 SELL',
      'hold': '🟡 HOLD',
      'neutral': '⚪ NEUTRAL'
    };
    return signalMap[signal.toLowerCase()] || signal;
  }

  private getRiskLevel(heat: number): string {
    if (heat < 20) return '🟢 LOW';
    if (heat < 50) return '🟡 MEDIUM';
    if (heat < 80) return '🟠 HIGH';
    return '🔴 CRITICAL';
  }

  private getRecoveryStatus(risk: any): string {
    if (risk.recoveryFactor > 0.8) return '🟢 GOOD';
    if (risk.recoveryFactor > 0.5) return '🟡 MODERATE';
    return '🔴 POOR';
  }

  // Public Status Methods
  public isReady(): boolean {
    return this.isConfigured && !!this.client;
  }

  public getStatus(): {
    configured: boolean;
    model: string;
    contextAvailable: boolean;
    conversationLength: number;
    cacheSize: number;
  } {
    return {
      configured: this.isConfigured,
      model: this.config.model,
      contextAvailable: !!this.dashboardContext,
      conversationLength: this.conversationHistory.length,
      cacheSize: this.analysisCache.size
    };
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.sendMessage('Test connection', { useHistory: false });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const enhancedMistralAI = EnhancedMistralAIService.getInstance();