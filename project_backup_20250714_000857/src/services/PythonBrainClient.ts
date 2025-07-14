export interface PythonAnalysisRequest {
  type: 'market_analysis' | 'strategy_analysis' | 'risk_analysis' | 'portfolio_optimization' | 'price_prediction' | 'pattern_detection' | 'strategy_backtest';
  data: any;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
}

export interface PythonAnalysisResult {
  analysis_type: string;
  result: any;
  timestamp: string;
  processing_time: number;
  confidence?: number;
}

export interface PythonBrainStatus {
  pythonReady: boolean;
  connectedClients: number;
  activeStreams: number;
  lastHeartbeat: number | null;
  analysisCache: number;
}

export class PythonBrainClient {
  private static instance: PythonBrainClient;
  private websocket: WebSocket | null = null;
  private baseUrl: string = 'http://localhost:5000';
  private wsUrl: string = 'ws://localhost:5000';
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectDelay: number = 2000;
  private pendingRequests: Map<string, any> = new Map();
  private subscribers: Map<string, Function[]> = new Map();
  private analysisCache: Map<string, PythonAnalysisResult> = new Map();
  private connectionRetryTimer: NodeJS.Timeout | null = null;

  static getInstance(): PythonBrainClient {
    if (!PythonBrainClient.instance) {
      PythonBrainClient.instance = new PythonBrainClient();
    }
    return PythonBrainClient.instance;
  }

  constructor() {
    // Don't auto-connect on instantiation to avoid immediate errors
    // Connection will be attempted when needed
  }

  public initialize() {
    if (!this.isConnected && this.reconnectAttempts === 0) {
      this.connect();
    }
  }

  private connect() {
    try {
      this.websocket = new WebSocket(this.wsUrl);
      
      this.websocket.onopen = () => {
        console.log('🐍 Connected to Python Brain');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitConnectionEvent('connected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('🐍 Error parsing message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('🐍 Disconnected from Python Brain');
        this.isConnected = false;
        this.emitConnectionEvent('disconnected');
        this.handleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.warn('🐍 WebSocket connection failed - Python Brain service may not be running');
        this.emitConnectionEvent('error');
      };

    } catch (error) {
      console.warn('🐍 Failed to connect to Python Brain - service may not be running');
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.warn(`🐍 Attempting to reconnect to Python Brain (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      this.connectionRetryTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.warn('🐍 Python Brain service unavailable - some features will be disabled');
      this.emitConnectionEvent('failed');
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'connection_status':
        console.log('🐍 Python Brain status:', message);
        break;
        
      case 'analysis_result':
        this.handleAnalysisResult(message);
        break;
        
      case 'analysis_complete':
        this.handleAnalysisComplete(message);
        break;
        
      case 'auto_analysis':
        this.handleAutoAnalysis(message);
        break;
        
      case 'data_update':
        this.handleDataUpdate(message);
        break;
        
      case 'python_status':
        this.emitStatusEvent(message);
        break;
        
      default:
        console.log('🐍 Unknown message type:', message.type);
    }
  }

  private handleAnalysisResult(message: any) {
    const result: PythonAnalysisResult = {
      analysis_type: message.analysis_type,
      result: message.result,
      timestamp: message.timestamp,
      processing_time: message.processing_time || 0,
      confidence: message.result.confidence
    };

    // Cache the result
    this.analysisCache.set(`${result.analysis_type}_${Date.now()}`, result);

    // Notify subscribers
    this.notifySubscribers('analysis_result', result);

    // Emit custom event
    window.dispatchEvent(new CustomEvent('pythonAnalysisResult', {
      detail: result
    }));
  }

  private handleAnalysisComplete(message: any) {
    this.notifySubscribers('analysis_complete', message);
  }

  private handleAutoAnalysis(message: any) {
    this.notifySubscribers('auto_analysis', message);
    
    // Emit custom event for auto analysis
    window.dispatchEvent(new CustomEvent('pythonAutoAnalysis', {
      detail: message
    }));
  }

  private handleDataUpdate(message: any) {
    this.notifySubscribers('data_update', message);
  }

  private notifySubscribers(eventType: string, data: any) {
    const subscribers = this.subscribers.get(eventType) || [];
    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('🐍 Error in subscriber callback:', error);
      }
    });
  }

  private emitConnectionEvent(status: string) {
    window.dispatchEvent(new CustomEvent('pythonBrainConnection', {
      detail: { status, isConnected: this.isConnected }
    }));
  }

  private emitStatusEvent(status: any) {
    window.dispatchEvent(new CustomEvent('pythonBrainStatus', {
      detail: status
    }));
  }

  // Public API Methods

  public async analyzeMarket(marketData: any): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'market_analysis',
      data: { market_data: marketData }
    });
  }

  public async analyzeStrategy(strategies: any[], performance: any): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'strategy_analysis',
      data: { strategies, performance }
    });
  }

  public async analyzeRisk(portfolio: any, positions: any[]): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'risk_analysis',
      data: { portfolio, positions }
    });
  }

  public async optimizePortfolio(positions: any[], targetReturn: number, riskTolerance: string): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'portfolio_optimization',
      data: { positions, target_return: targetReturn, risk_tolerance: riskTolerance }
    });
  }

  public async predictPrice(marketData: any[], horizon: number = 24): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'price_prediction',
      data: { market_data: marketData, horizon }
    });
  }

  public async detectPatterns(marketData: any[]): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'pattern_detection',
      data: { market_data: marketData }
    });
  }

  public async backtestStrategy(strategy: any, marketData: any[]): Promise<PythonAnalysisResult> {
    return this.requestAnalysis({
      type: 'strategy_backtest',
      data: { strategy, market_data: marketData }
    });
  }

  private async requestAnalysis(request: PythonAnalysisRequest): Promise<PythonAnalysisResult> {
    if (!this.isConnected) {
      throw new Error('Python Brain not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/analyze/${request.type.replace('_analysis', '').replace('_', '/')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.data),
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result as PythonAnalysisResult;
    } catch (error) {
      console.error('🐍 Analysis request error:', error);
      throw error;
    }
  }

  public async getStatus(): Promise<PythonBrainStatus> {
    try {
      // Check if service is available before making request
      if (!this.isConnected && this.reconnectAttempts >= this.maxReconnectAttempts) {
        throw new Error('Python Brain service is not available');
      }

      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Status request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // Return a default status instead of throwing to prevent UI errors
      console.warn('🐍 Python Brain service unavailable, returning default status');
      return {
        pythonReady: false,
        connectedClients: 0,
        activeStreams: 0,
        lastHeartbeat: null,
        analysisCache: 0
      };
    }
  }

  public subscribe(eventType: string, callback: Function): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  public subscribeToDataStream(dataTypes: string[]): void {
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify({
        type: 'subscribe',
        dataTypes: dataTypes
      }));
    }
  }

  public distributeData(data: any): void {
    fetch(`${this.baseUrl}/api/data/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('🐍 Data distribution error:', error);
    });
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getCachedAnalysis(analysisType: string): PythonAnalysisResult | null {
    // Find the most recent analysis of the specified type
    const entries = Array.from(this.analysisCache.entries());
    const filtered = entries.filter(([key]) => key.startsWith(analysisType));
    
    if (filtered.length === 0) return null;
    
    // Sort by timestamp (embedded in key) and return the most recent
    const sorted = filtered.sort(([a], [b]) => {
      const timeA = parseInt(a.split('_').pop() || '0');
      const timeB = parseInt(b.split('_').pop() || '0');
      return timeB - timeA;
    });
    
    return sorted[0][1];
  }

  public clearCache(): void {
    this.analysisCache.clear();
  }

  public disconnect(): void {
    if (this.connectionRetryTimer) {
      clearTimeout(this.connectionRetryTimer);
      this.connectionRetryTimer = null;
    }
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
export const pythonBrainClient = PythonBrainClient.getInstance();