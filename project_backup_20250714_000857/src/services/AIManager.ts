import { samairaAI, TradingAnalysisResponse } from './SamairaAI';
import { EnhancedMistralAIService } from './MistralAI';

export interface AIProvider {
  name: string;
  displayName: string;
  configured: boolean;
  capabilities: string[];
  rateLimit: number;
}

export interface AIAnalysisRequest {
  type: 'market_analysis' | 'risk_assessment' | 'strategy_optimization' | 'signal_validation' | 'portfolio_review' | 'chat';
  data: any;
  provider?: 'samaira' | 'mistral' | 'auto';
  priority?: 'low' | 'medium' | 'high';
  context?: string;
}

export interface UnifiedAIResponse {
  provider: string;
  analysis: string;
  confidence: number;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  actionItems: string[];
  timestamp: number;
  processingTime: number;
  cached: boolean;
}

export class AIManager {
  private static instance: AIManager;
  private mistralService: EnhancedMistralAIService;
  private responseCache: Map<string, UnifiedAIResponse> = new Map();
  private requestQueue: AIAnalysisRequest[] = [];
  private isProcessing = false;

  static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  constructor() {
    this.mistralService = EnhancedMistralAIService.getInstance();
  }

  public getAvailableProviders(): AIProvider[] {
    const samairaStatus = samairaAI.getStatus();
    const mistralConfig = this.mistralService.getConfiguration();

    return [
      {
        name: 'samaira',
        displayName: 'Samaira AI (GPT-4)',
        configured: samairaStatus.configured,
        capabilities: ['market_analysis', 'risk_assessment', 'strategy_optimization', 'signal_validation', 'chat'],
        rateLimit: 2000 // 2 seconds
      },
      {
        name: 'mistral',
        displayName: 'Mistral AI',
        configured: !!mistralConfig.apiKey,
        capabilities: ['market_analysis', 'chat', 'general_analysis'],
        rateLimit: 1000 // 1 second
      }
    ];
  }

  public async analyzeMarket(data: any, provider: 'samaira' | 'mistral' | 'auto' = 'auto', context?: string): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    const cacheKey = `market_${provider}_${JSON.stringify(data).slice(0, 50)}`;
    
    // Check cache first
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return { ...cached, cached: true };
    }

    let selectedProvider = provider;
    if (provider === 'auto') {
      selectedProvider = this.selectBestProvider('market_analysis');
    }

    try {
      let result: UnifiedAIResponse;
      
      if (selectedProvider === 'samaira') {
        const samairaResponse = await samairaAI.analyzeMarketData(data, context);
        result = this.formatSamairaResponse(samairaResponse, startTime);
      } else {
        // Use Mistral as fallback
        const mistralResponse = await this.mistralService.sendMessage(
          `Analyze this market data: ${JSON.stringify(data, null, 2)}${context ? `\nContext: ${context}` : ''}`,
          { systemPrompt: 'You are a trading market analysis expert. Provide detailed insights.' }
        );
        result = this.formatMistralResponse(mistralResponse, startTime);
      }

      // Cache the result
      this.responseCache.set(cacheKey, result);
      return { ...result, cached: false };

    } catch (error) {
      console.error(`Market analysis failed with ${selectedProvider}:`, error);
      
      // Try fallback provider if auto mode
      if (provider === 'auto' && selectedProvider === 'samaira') {
        return this.analyzeMarket(data, 'mistral', context);
      }
      
      throw error;
    }
  }

  public async assessRisk(portfolioData: any, positions: any[], provider: 'samaira' | 'mistral' | 'auto' = 'samaira'): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    
    if (provider === 'auto' || provider === 'samaira') {
      try {
        const samairaResponse = await samairaAI.assessRisk(portfolioData, positions);
        return this.formatSamairaResponse(samairaResponse, startTime);
      } catch (error) {
        if (provider === 'samaira') throw error;
        // Fall back to Mistral
      }
    }

    // Use Mistral
    const prompt = `Assess risk for this portfolio:\nPortfolio: ${JSON.stringify(portfolioData, null, 2)}\nPositions: ${JSON.stringify(positions, null, 2)}`;
    const mistralResponse = await this.mistralService.sendMessage(prompt, {
      systemPrompt: 'You are a risk management expert. Analyze portfolio risk and provide actionable insights.'
    });
    
    return this.formatMistralResponse(mistralResponse, startTime);
  }

  public async optimizeStrategy(strategyData: any, performance: any, provider: 'samaira' | 'mistral' | 'auto' = 'samaira'): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    
    if (provider === 'auto' || provider === 'samaira') {
      try {
        const samairaResponse = await samairaAI.optimizeStrategy(strategyData, performance);
        return this.formatSamairaResponse(samairaResponse, startTime);
      } catch (error) {
        if (provider === 'samaira') throw error;
      }
    }

    // Use Mistral
    const prompt = `Optimize this strategy:\nStrategy: ${JSON.stringify(strategyData, null, 2)}\nPerformance: ${JSON.stringify(performance, null, 2)}`;
    const mistralResponse = await this.mistralService.sendMessage(prompt, {
      systemPrompt: 'You are a trading strategy optimization expert. Suggest improvements for better performance.'
    });
    
    return this.formatMistralResponse(mistralResponse, startTime);
  }

  public async validateSignal(signalData: any, marketContext: any, provider: 'samaira' | 'mistral' | 'auto' = 'samaira'): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    
    if (provider === 'auto' || provider === 'samaira') {
      try {
        const samairaResponse = await samairaAI.validateSignal(signalData, marketContext);
        return this.formatSamairaResponse(samairaResponse, startTime);
      } catch (error) {
        if (provider === 'samaira') throw error;
      }
    }

    // Use Mistral
    const prompt = `Validate this signal:\nSignal: ${JSON.stringify(signalData, null, 2)}\nMarket Context: ${JSON.stringify(marketContext, null, 2)}`;
    const mistralResponse = await this.mistralService.sendMessage(prompt, {
      systemPrompt: 'You are a trading signal validation expert. Determine signal validity and strength.'
    });
    
    return this.formatMistralResponse(mistralResponse, startTime);
  }

  public async chat(message: string, context?: any, provider: 'samaira' | 'mistral' | 'auto' = 'auto'): Promise<string> {
    let selectedProvider = provider;
    if (provider === 'auto') {
      selectedProvider = this.selectBestProvider('chat');
    }

    try {
      if (selectedProvider === 'samaira') {
        return await samairaAI.chatWithAI(message, context);
      } else {
        const response = await this.mistralService.sendMessage(message, { useHistory: true });
        return response.content;
      }
    } catch (error) {
      console.error(`Chat failed with ${selectedProvider}:`, error);
      
      // Try fallback if auto mode
      if (provider === 'auto' && selectedProvider === 'samaira') {
        const response = await this.mistralService.sendMessage(message, { useHistory: true });
        return response.content;
      }
      
      throw error;
    }
  }

  private selectBestProvider(capability: string): 'samaira' | 'mistral' {
    const providers = this.getAvailableProviders();
    
    // Prefer Samaira for specialized trading tasks
    const samaira = providers.find(p => p.name === 'samaira');
    if (samaira?.configured && samaira.capabilities.includes(capability)) {
      return 'samaira';
    }
    
    // Fall back to Mistral
    const mistral = providers.find(p => p.name === 'mistral');
    if (mistral?.configured) {
      return 'mistral';
    }
    
    // Default to Samaira even if not configured (will throw appropriate error)
    return 'samaira';
  }

  private formatSamairaResponse(response: TradingAnalysisResponse, startTime: number): UnifiedAIResponse {
    return {
      provider: 'Samaira AI (GPT-4)',
      analysis: response.analysis,
      confidence: response.confidence,
      recommendations: response.recommendations,
      risks: response.risks,
      opportunities: response.opportunities,
      actionItems: response.actionItems,
      timestamp: response.timestamp,
      processingTime: Date.now() - startTime,
      cached: false
    };
  }

  private formatMistralResponse(response: any, startTime: number): UnifiedAIResponse {
    // Parse Mistral response and extract structured data
    const content = response.content || response;
    
    return {
      provider: 'Mistral AI',
      analysis: content,
      confidence: 0.8, // Default confidence for Mistral
      recommendations: this.extractListItems(content, 'recommendation'),
      risks: this.extractListItems(content, 'risk'),
      opportunities: this.extractListItems(content, 'opportunit'),
      actionItems: this.extractListItems(content, 'action'),
      timestamp: Date.now(),
      processingTime: Date.now() - startTime,
      cached: false
    };
  }

  private extractListItems(content: string, keyword: string): string[] {
    const regex = new RegExp(`${keyword}[s]?[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      const items = match[1].match(/[\d\-\*•]\s*(.+)/g);
      if (items) {
        return items.map(item => item.replace(/^[\d\-\*•]\s*/, '').trim()).slice(0, 5);
      }
    }
    
    return [];
  }

  public async processRequestQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue.shift()!;
        await this.processRequest(request);
        
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processRequest(request: AIAnalysisRequest): Promise<UnifiedAIResponse> {
    switch (request.type) {
      case 'market_analysis':
        return await this.analyzeMarket(request.data, request.provider, request.context);
      case 'risk_assessment':
        return await this.assessRisk(request.data.portfolio, request.data.positions, request.provider);
      case 'strategy_optimization':
        return await this.optimizeStrategy(request.data.strategy, request.data.performance, request.provider);
      case 'signal_validation':
        return await this.validateSignal(request.data.signal, request.data.context, request.provider);
      case 'chat':
        const response = await this.chat(request.data.message, request.data.context, request.provider);
        return {
          provider: request.provider || 'auto',
          analysis: response,
          confidence: 0.8,
          recommendations: [],
          risks: [],
          opportunities: [],
          actionItems: [],
          timestamp: Date.now(),
          processingTime: 0,
          cached: false
        };
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  public queueRequest(request: AIAnalysisRequest): void {
    this.requestQueue.push(request);
    this.processRequestQueue(); // Start processing if not already running
  }

  public getStatus() {
    const providers = this.getAvailableProviders();
    const samairaStatus = samairaAI.getStatus();
    
    return {
      providers,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      cacheSize: this.responseCache.size,
      samairaActivity: samairaStatus.lastActivity
    };
  }

  public clearCache() {
    this.responseCache.clear();
    samairaAI.clearCache();
  }

  public configureSamairaAI(apiKey: string) {
    samairaAI.setApiKey(apiKey);
  }

  public configureMistralAI(config: any) {
    this.mistralService.configure(config);
  }
}

// Export singleton instance
export const aiManager = AIManager.getInstance();
