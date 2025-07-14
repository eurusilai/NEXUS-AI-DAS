export interface SamairaAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface SamairaAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TradingAnalysisRequest {
  type: 'market_analysis' | 'risk_assessment' | 'strategy_optimization' | 'signal_validation' | 'portfolio_review';
  data: any;
  context?: string;
  timeframe?: string;
}

export interface TradingAnalysisResponse {
  analysis: string;
  confidence: number;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  actionItems: string[];
  timestamp: number;
  model: string;
}

export class SamairaAIService {
  private static instance: SamairaAIService;
  private readonly baseUrl = 'https://inference.samaira.ai/openai';
  private readonly defaultModel = 'gpt-4';
  private apiKey: string = '';
  private rateLimiter: Map<string, number> = new Map();
  private analysisCache: Map<string, TradingAnalysisResponse> = new Map();

  static getInstance(): SamairaAIService {
    if (!SamairaAIService.instance) {
      SamairaAIService.instance = new SamairaAIService();
    }
    return SamairaAIService.instance;
  }

  constructor() {
    this.loadApiKey();
  }

  private loadApiKey() {
    // Try to load from environment variables or localStorage
    this.apiKey = import.meta.env.VITE_SAMAIRA_API_KEY || localStorage.getItem('samaira_api_key') || '';
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('samaira_api_key', key);
  }

  public isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const lastCall = this.rateLimiter.get(endpoint) || 0;
    const minInterval = 2000; // 2 seconds between calls
    
    if (now - lastCall < minInterval) {
      return false;
    }
    
    this.rateLimiter.set(endpoint, now);
    return true;
  }

  private async makeRequest(request: SamairaAIRequest): Promise<SamairaAIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Samaira AI API key not configured');
    }

    if (!this.checkRateLimit('api_call')) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          model: request.model || this.defaultModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Samaira AI API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Samaira AI request failed:', error);
      throw error;
    }
  }

  public async analyzeMarketData(data: any, context?: string): Promise<TradingAnalysisResponse> {
    const cacheKey = `market_${JSON.stringify(data).slice(0, 100)}`;
    const cached = this.analysisCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached;
    }

    const prompt = this.buildMarketAnalysisPrompt(data, context);
    
    const request: SamairaAIRequest = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert trading AI assistant specialized in market analysis. Provide detailed, actionable insights based on the provided market data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    };

    try {
      const response = await this.makeRequest(request);
      const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
      
      const result: TradingAnalysisResponse = {
        ...analysis,
        timestamp: Date.now(),
        model: 'samaira-gpt-4'
      };

      this.analysisCache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Market analysis failed: ${error}`);
    }
  }

  public async assessRisk(portfolioData: any, positions: any[]): Promise<TradingAnalysisResponse> {
    const prompt = this.buildRiskAssessmentPrompt(portfolioData, positions);
    
    const request: SamairaAIRequest = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a risk management expert. Analyze the provided portfolio and position data to identify potential risks and provide mitigation strategies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1200
    };

    const response = await this.makeRequest(request);
    const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
    
    return {
      ...analysis,
      timestamp: Date.now(),
      model: 'samaira-gpt-4'
    };
  }

  public async optimizeStrategy(strategyData: any, performance: any): Promise<TradingAnalysisResponse> {
    const prompt = this.buildStrategyOptimizationPrompt(strategyData, performance);
    
    const request: SamairaAIRequest = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a trading strategy optimization expert. Analyze strategy performance and suggest improvements for better results.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1800
    };

    const response = await this.makeRequest(request);
    const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
    
    return {
      ...analysis,
      timestamp: Date.now(),
      model: 'samaira-gpt-4'
    };
  }

  public async validateSignal(signalData: any, marketContext: any): Promise<TradingAnalysisResponse> {
    const prompt = this.buildSignalValidationPrompt(signalData, marketContext);
    
    const request: SamairaAIRequest = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a trading signal validation expert. Analyze the provided signal against market context and determine its validity and potential.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    const response = await this.makeRequest(request);
    const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
    
    return {
      ...analysis,
      timestamp: Date.now(),
      model: 'samaira-gpt-4'
    };
  }

  public async chatWithAI(message: string, context?: any): Promise<string> {
    const contextPrompt = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
    
    const request: SamairaAIRequest = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are NEXUS AI, an advanced trading assistant. Provide helpful, accurate responses about trading, markets, and financial analysis.'
        },
        {
          role: 'user',
          content: message + contextPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const response = await this.makeRequest(request);
    return response.choices[0].message.content;
  }

  private buildMarketAnalysisPrompt(data: any, context?: string): string {
    return `
Analyze the following market data and provide comprehensive insights:

Market Data:
${JSON.stringify(data, null, 2)}

${context ? `Additional Context: ${context}` : ''}

Please provide:
1. Market trend analysis
2. Key support/resistance levels
3. Volume analysis
4. Momentum indicators
5. Risk factors
6. Trading opportunities
7. Specific recommendations

Format your response with clear sections and actionable insights.
`;
  }

  private buildRiskAssessmentPrompt(portfolioData: any, positions: any[]): string {
    return `
Perform a comprehensive risk assessment:

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

Current Positions:
${JSON.stringify(positions, null, 2)}

Analyze:
1. Portfolio concentration risk
2. Market exposure
3. Correlation risks
4. Liquidity risks
5. Drawdown potential
6. Position sizing adequacy
7. Risk mitigation strategies

Provide specific risk scores and actionable recommendations.
`;
  }

  private buildStrategyOptimizationPrompt(strategyData: any, performance: any): string {
    return `
Optimize the following trading strategy:

Strategy Data:
${JSON.stringify(strategyData, null, 2)}

Performance Metrics:
${JSON.stringify(performance, null, 2)}

Focus on:
1. Entry/exit optimization
2. Parameter tuning suggestions
3. Risk-adjusted returns improvement
4. Drawdown reduction
5. Consistency enhancement
6. Market adaptation strategies

Provide specific, implementable improvements.
`;
  }

  private buildSignalValidationPrompt(signalData: any, marketContext: any): string {
    return `
Validate the following trading signal:

Signal Data:
${JSON.stringify(signalData, null, 2)}

Market Context:
${JSON.stringify(marketContext, null, 2)}

Evaluate:
1. Signal strength and reliability
2. Market condition alignment
3. Risk/reward ratio
4. Timing appropriateness
5. Confidence level
6. Alternative scenarios

Provide a validation score and recommendation.
`;
  }

  private parseAnalysisResponse(content: string): Omit<TradingAnalysisResponse, 'timestamp' | 'model'> {
    // Parse the AI response and extract structured data
    const lines = content.split('\n').filter(line => line.trim());
    
    const analysis = content;
    let confidence = 0.75; // Default confidence
    const recommendations: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const actionItems: string[] = [];

    // Extract confidence if mentioned
    const confidenceMatch = content.match(/confidence[:\s]*(\d+(?:\.\d+)?)[%]?/i);
    if (confidenceMatch) {
      confidence = parseFloat(confidenceMatch[1]) / (confidenceMatch[0].includes('%') ? 100 : 1);
    }

    // Extract recommendations
    const recSection = content.match(/recommendations?[:\s]*([\s\S]*?)(?=\n\n|\nrisks?|\nopportunities?|$)/i);
    if (recSection) {
      const items = recSection[1].match(/[\d\-\*]\s*(.+)/g);
      if (items) recommendations.push(...items.map(item => item.replace(/^[\d\-\*]\s*/, '').trim()));
    }

    // Extract risks
    const riskSection = content.match(/risks?[:\s]*([\s\S]*?)(?=\n\n|\nrecommendations?|\nopportunities?|$)/i);
    if (riskSection) {
      const items = riskSection[1].match(/[\d\-\*]\s*(.+)/g);
      if (items) risks.push(...items.map(item => item.replace(/^[\d\-\*]\s*/, '').trim()));
    }

    // Extract opportunities
    const oppSection = content.match(/opportunities?[:\s]*([\s\S]*?)(?=\n\n|\nrecommendations?|\nrisks?|$)/i);
    if (oppSection) {
      const items = oppSection[1].match(/[\d\-\*]\s*(.+)/g);
      if (items) opportunities.push(...items.map(item => item.replace(/^[\d\-\*]\s*/, '').trim()));
    }

    // Extract action items
    const actionSection = content.match(/actions?[:\s]*([\s\S]*?)(?=\n\n|\nrecommendations?|\nrisks?|\nopportunities?|$)/i);
    if (actionSection) {
      const items = actionSection[1].match(/[\d\-\*]\s*(.+)/g);
      if (items) actionItems.push(...items.map(item => item.replace(/^[\d\-\*]\s*/, '').trim()));
    }

    return {
      analysis,
      confidence: Math.min(Math.max(confidence, 0), 1),
      recommendations: recommendations.slice(0, 5),
      risks: risks.slice(0, 5),
      opportunities: opportunities.slice(0, 5),
      actionItems: actionItems.slice(0, 5)
    };
  }

  public clearCache() {
    this.analysisCache.clear();
  }

  public getStatus() {
    return {
      configured: this.isConfigured(),
      cacheSize: this.analysisCache.size,
      lastActivity: Math.max(...Array.from(this.rateLimiter.values()), 0)
    };
  }
}

// Export singleton instance
export const samairaAI = SamairaAIService.getInstance();
