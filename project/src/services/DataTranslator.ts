export interface UniversalDataFormat {
  timestamp: number;
  source: 'NINJA_TRADER' | 'SIERRA_CHART' | 'RITHMIC' | 'INTERACTIVE_BROKERS' | 'GENERIC';
  market: {
    symbol: string;
    price: number;
    volume: number;
    bid: number;
    ask: number;
    high: number;
    low: number;
    open: number;
    close: number;
  };
  orderFlow: {
    cumulativeDelta: number;
    bidVolume: number;
    askVolume: number;
    trades: number;
    vwap: number;
    poc: number; // Point of Control
  };
  position: {
    quantity: number;
    averagePrice: number;
    unrealizedPnL: number;
    realizedPnL: number;
    side: 'LONG' | 'SHORT' | 'FLAT';
  };
  account: {
    balance: number;
    equity: number;
    margin: number;
    buyingPower: number;
  };
  strategies: {
    [key: string]: {
      enabled: boolean;
      signal: 'BUY' | 'SELL' | 'HOLD';
      confidence: number;
      pnl: number;
    };
  };
}

// NinjaTrader 8 Data Format
interface NT8Data {
  timestamp: string;
  systemVersion: string;
  market: {
    currentPrice: number;
    volume: number;
    bid: number;
    ask: number;
    high?: number;
    low?: number;
    open?: number;
  };
  orderFlow: {
    cumulativeDelta: number;
    bidVolume: number;
    askVolume: number;
  };
  position: {
    quantity: number;
    averagePrice: number;
    unrealizedPnL: number;
  };
  performance: {
    dailyPnL: number;
  };
  strategies: Record<string, boolean>;
  signals: {
    activeCount: number;
    longSignals: number;
    shortSignals: number;
    totalConfidence: number;
  };
}

// Sierra Chart Data Format
interface SierraChartData {
  DateTime: string;
  Symbol: string;
  Last: number;
  Volume: number;
  Bid: number;
  Ask: number;
  High: number;
  Low: number;
  Open: number;
  BidVolume: number;
  AskVolume: number;
  NumberOfTrades: number;
  VWAP: number;
  PointOfControl: number;
  AccountBalance: number;
  Position: number;
  PositionProfitLoss: number;
  AveragePrice: number;
}

// Rithmic Data Format
interface RithmicData {
  timestamp: number;
  instrument_id: string;
  last_trade_price: number;
  last_trade_size: number;
  bid_price: number;
  ask_price: number;
  bid_size: number;
  ask_size: number;
  session_high: number;
  session_low: number;
  session_open: number;
  total_volume: number;
  account_id: string;
  net_position: number;
  average_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
  account_balance: number;
  buying_power: number;
}

export class DataTranslator {
  private static instance: DataTranslator;
  private translationRules: Map<string, any> = new Map();
  private dataCache: Map<string, UniversalDataFormat> = new Map();

  static getInstance(): DataTranslator {
    if (!DataTranslator.instance) {
      DataTranslator.instance = new DataTranslator();
    }
    return DataTranslator.instance;
  }

  constructor() {
    this.initializeTranslationRules();
  }

  private initializeTranslationRules() {
    // NinjaTrader 8 Translation Rules
    this.translationRules.set('NINJA_TRADER', {
      detectFormat: (data: any) => {
        return data.systemVersion && data.market && data.orderFlow && data.strategies;
      },
      translate: (data: NT8Data): UniversalDataFormat => {
        return {
          timestamp: new Date(data.timestamp).getTime(),
          source: 'NINJA_TRADER',
          market: {
            symbol: 'ES', // Default, should be extracted from context
            price: data.market.currentPrice,
            volume: data.market.volume,
            bid: data.market.bid,
            ask: data.market.ask,
            high: data.market.high || data.market.currentPrice,
            low: data.market.low || data.market.currentPrice,
            open: data.market.open || data.market.currentPrice,
            close: data.market.currentPrice,
          },
          orderFlow: {
            cumulativeDelta: data.orderFlow.cumulativeDelta,
            bidVolume: data.orderFlow.bidVolume,
            askVolume: data.orderFlow.askVolume,
            trades: data.signals?.activeCount || 0,
            vwap: data.market.currentPrice, // Calculated separately
            poc: data.market.currentPrice, // Calculated separately
          },
          position: {
            quantity: data.position.quantity,
            averagePrice: data.position.averagePrice,
            unrealizedPnL: data.position.unrealizedPnL,
            realizedPnL: data.performance.dailyPnL,
            side: data.position.quantity > 0 ? 'LONG' : data.position.quantity < 0 ? 'SHORT' : 'FLAT',
          },
          account: {
            balance: 100000, // Default, should be provided by NT8
            equity: 100000 + data.position.unrealizedPnL,
            margin: 0,
            buyingPower: 100000,
          },
          strategies: this.translateNT8Strategies(data.strategies, data.signals),
        };
      }
    });

    // Sierra Chart Translation Rules
    this.translationRules.set('SIERRA_CHART', {
      detectFormat: (data: any) => {
        return data.DateTime && data.Symbol && data.Last && data.BidVolume !== undefined;
      },
      translate: (data: SierraChartData): UniversalDataFormat => {
        return {
          timestamp: new Date(data.DateTime).getTime(),
          source: 'SIERRA_CHART',
          market: {
            symbol: data.Symbol,
            price: data.Last,
            volume: data.Volume,
            bid: data.Bid,
            ask: data.Ask,
            high: data.High,
            low: data.Low,
            open: data.Open,
            close: data.Last,
          },
          orderFlow: {
            cumulativeDelta: data.BidVolume - data.AskVolume,
            bidVolume: data.BidVolume,
            askVolume: data.AskVolume,
            trades: data.NumberOfTrades,
            vwap: data.VWAP,
            poc: data.PointOfControl,
          },
          position: {
            quantity: data.Position,
            averagePrice: data.AveragePrice,
            unrealizedPnL: data.PositionProfitLoss,
            realizedPnL: 0, // Not provided directly
            side: data.Position > 0 ? 'LONG' : data.Position < 0 ? 'SHORT' : 'FLAT',
          },
          account: {
            balance: data.AccountBalance,
            equity: data.AccountBalance + data.PositionProfitLoss,
            margin: 0,
            buyingPower: data.AccountBalance,
          },
          strategies: this.generateDefaultStrategies(),
        };
      }
    });

    // Rithmic Translation Rules
    this.translationRules.set('RITHMIC', {
      detectFormat: (data: any) => {
        return data.instrument_id && data.last_trade_price && data.account_id;
      },
      translate: (data: RithmicData): UniversalDataFormat => {
        return {
          timestamp: data.timestamp,
          source: 'RITHMIC',
          market: {
            symbol: data.instrument_id,
            price: data.last_trade_price,
            volume: data.total_volume,
            bid: data.bid_price,
            ask: data.ask_price,
            high: data.session_high,
            low: data.session_low,
            open: data.session_open,
            close: data.last_trade_price,
          },
          orderFlow: {
            cumulativeDelta: data.bid_size - data.ask_size,
            bidVolume: data.bid_size,
            askVolume: data.ask_size,
            trades: 0, // Not provided
            vwap: data.last_trade_price, // Calculated separately
            poc: data.last_trade_price, // Calculated separately
          },
          position: {
            quantity: data.net_position,
            averagePrice: data.average_price,
            unrealizedPnL: data.unrealized_pnl,
            realizedPnL: data.realized_pnl,
            side: data.net_position > 0 ? 'LONG' : data.net_position < 0 ? 'SHORT' : 'FLAT',
          },
          account: {
            balance: data.account_balance,
            equity: data.account_balance + data.unrealized_pnl,
            margin: 0,
            buyingPower: data.buying_power,
          },
          strategies: this.generateDefaultStrategies(),
        };
      }
    });
  }

  public translateData(rawData: any): UniversalDataFormat | null {
    try {
      // Auto-detect data format
      for (const [source, rules] of this.translationRules) {
        if (rules.detectFormat(rawData)) {
          console.log(`🔍 Detected data format: ${source}`);
          const translatedData = rules.translate(rawData);
          
          // Cache the translated data
          this.dataCache.set(source, translatedData);
          
          // Emit translation event
          this.emitTranslationEvent(source, translatedData);
          
          return translatedData;
        }
      }

      console.warn('⚠️ Unknown data format received:', rawData);
      return this.createFallbackData(rawData);
    } catch (error) {
      console.error('❌ Data translation error:', error);
      return null;
    }
  }

  private translateNT8Strategies(strategies: Record<string, boolean>, signals: any) {
    const result: any = {};
    
    Object.entries(strategies).forEach(([name, enabled]) => {
      result[name] = {
        enabled,
        signal: 'HOLD' as const,
        confidence: 0,
        pnl: 0,
      };
    });

    // Add signal data if available
    if (signals) {
      const avgConfidence = signals.totalConfidence / Math.max(signals.activeCount, 1);
      const signal = signals.longSignals > signals.shortSignals ? 'BUY' : 
                    signals.shortSignals > signals.longSignals ? 'SELL' : 'HOLD';
      
      Object.keys(result).forEach(key => {
        if (result[key].enabled) {
          result[key].signal = signal;
          result[key].confidence = avgConfidence;
        }
      });
    }

    return result;
  }

  private generateDefaultStrategies() {
    return {
      'Momentum': { enabled: true, signal: 'HOLD' as const, confidence: 0, pnl: 0 },
      'Reversal': { enabled: true, signal: 'HOLD' as const, confidence: 0, pnl: 0 },
      'Breakout': { enabled: true, signal: 'HOLD' as const, confidence: 0, pnl: 0 },
    };
  }

  private createFallbackData(rawData: any): UniversalDataFormat {
    const now = Date.now();
    return {
      timestamp: now,
      source: 'GENERIC',
      market: {
        symbol: rawData.symbol || 'UNKNOWN',
        price: rawData.price || rawData.last || 0,
        volume: rawData.volume || 0,
        bid: rawData.bid || 0,
        ask: rawData.ask || 0,
        high: rawData.high || 0,
        low: rawData.low || 0,
        open: rawData.open || 0,
        close: rawData.close || rawData.price || 0,
      },
      orderFlow: {
        cumulativeDelta: 0,
        bidVolume: 0,
        askVolume: 0,
        trades: 0,
        vwap: 0,
        poc: 0,
      },
      position: {
        quantity: 0,
        averagePrice: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        side: 'FLAT',
      },
      account: {
        balance: 0,
        equity: 0,
        margin: 0,
        buyingPower: 0,
      },
      strategies: this.generateDefaultStrategies(),
    };
  }

  private emitTranslationEvent(source: string, data: UniversalDataFormat) {
    // Emit custom event for other components to listen
    window.dispatchEvent(new CustomEvent('dataTranslated', {
      detail: { source, data }
    }));
  }

  public getLastTranslatedData(source?: string): UniversalDataFormat | null {
    if (source) {
      return this.dataCache.get(source) || null;
    }
    
    // Return the most recent data from any source
    const entries = Array.from(this.dataCache.entries());
    if (entries.length === 0) return null;
    
    return entries.sort((a, b) => b[1].timestamp - a[1].timestamp)[0][1];
  }

  public getSupportedSources(): string[] {
    return Array.from(this.translationRules.keys());
  }

  public addCustomTranslationRule(source: string, rules: any) {
    this.translationRules.set(source, rules);
  }
}

export const dataTranslator = DataTranslator.getInstance();