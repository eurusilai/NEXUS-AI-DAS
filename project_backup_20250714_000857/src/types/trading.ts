export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export interface Strategy {
  id: string;
  name: string;
  enabled: boolean;
  confidence: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  pnl: number;
  trades: number;
  winRate: number;
  weight: number;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  duration: string;
}

export interface RiskMetrics {
  dailyPnl: number;
  maxDrawdown: number;
  portfolioHeat: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  riskPerTrade: number;
}

export interface MLInsights {
  regime: 'TRENDING' | 'RANGING' | 'VOLATILE';
  confidence: number;
  priceDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
  volatilityForecast: number;
  nextBarPrediction: number;
}

export interface OrderFlowData {
  cumulativeDelta: number;
  bidVolume: number;
  askVolume: number;
  absorption: number;
  imbalance: number;
  hvnLevels: number[];
  lvnLevels: number[];
}

// Liquidation Detection Types
export interface LiquidationEvent {
  price: number;
  volume: number;
  intensity: number;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  timestamp: number;
  reason: string;
}

export interface LiquidationCluster {
  priceLevel: number;
  totalVolume: number;
  eventCount: number;
  averageIntensity: number;
  timespan: number;
  active: boolean;
  events: LiquidationEvent[];
}

export interface LiquidationData {
  recentEvents: LiquidationEvent[];
  activeClusters: LiquidationCluster[];
  totalLiquidations24h: number;
  liquidationRate: number;
  dominantDirection: 'LONG' | 'SHORT' | 'BALANCED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

// MQSCORE 6D Analytics Types
export interface MQDimension {
  name: string;
  score: number;
  weight: number;
  rawValue: number;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  description: string;
}

export interface MQScore6D {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  dimensions: {
    liquidity: MQDimension;
    efficiency: MQDimension;
    volatility: MQDimension;
    momentum: MQDimension;
    microstructure: MQDimension;
    stability: MQDimension;
  };
  timestamp: number;
  trend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  riskAdjustment: number;
}

// Trading Journal Types
export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  commission: number;
  strategy: string;
  setup: string;
  emotion: string;
  mistakes: string[];
  notes: string;
  quality: number; // 1-5 rating
  execution: number; // 1-5 rating
  screenshots: string[];
  tags: string[];
  broker: string;
  account: string;
  status: 'OPEN' | 'CLOSED';
  duration?: number;
  rMultiple?: number;
}

export interface JournalAnalytics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  avgRMultiple: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  maxWin: number;
  maxLoss: number;
  avgDuration: number;
  bestStrategy: string;
  worstStrategy: string;
  bestSetup: string;
  worstSetup: string;
  bestTimeOfDay: string;
  worstTimeOfDay: string;
  bestDayOfWeek: string;
  worstDayOfWeek: string;
}

// Broker Integration Types
export interface BrokerConnection {
  id: string;
  name: string;
  type: 'SIERRA_CHART' | 'NINJA_TRADER' | 'RITHMIC' | 'INTERACTIVE_BROKERS' | 'TD_AMERITRADE';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync: number;
  account: string;
  apiKey?: string;
  endpoint?: string;
}

export interface BrokerTrade {
  brokerTradeId: string;
  timestamp: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  commission: number;
  account: string;
  broker: string;
}

// Playbook Types
export interface Playbook {
  id: string;
  name: string;
  description: string;
  strategy: string;
  entryRules: string[];
  exitRules: string[];
  stopLossRules: string[];
  takeProfitRules: string[];
  idealConditions: string[];
  commonPitfalls: string[];
  riskReward: number;
  winRate: number;
  trades: number;
  performance: number;
  lastUpdated: number;
}

// Notebook Types
export interface NotebookEntry {
  id: string;
  date: number;
  type: 'DAILY_REVIEW' | 'WEEKLY_REVIEW' | 'WATCHLIST' | 'TRADING_PLAN' | 'LESSON_LEARNED';
  title: string;
  content: string;
  tags: string[];
  attachments: string[];
  mood: number; // 1-5
  confidence: number; // 1-5
  marketConditions: string;
}