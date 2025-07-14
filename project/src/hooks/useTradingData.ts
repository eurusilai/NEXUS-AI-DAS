import { useState, useEffect } from 'react';
import { MarketData, Strategy, Position, RiskMetrics, MLInsights, OrderFlowData, LiquidationData, MQScore6D } from '../types/trading';

// Simulated real-time data hooks
export const useTradingData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [mlInsights, setMLInsights] = useState<MLInsights | null>(null);
  const [orderFlow, setOrderFlow] = useState<OrderFlowData | null>(null);
  const [liquidationData, setLiquidationData] = useState<LiquidationData | null>(null);
  const [mqScore, setMQScore] = useState<MQScore6D | null>(null);

  // Simulate real-time market data
  useEffect(() => {
    const generateMarketData = (): MarketData[] => {
      const symbols = ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC'];
      const basePrice = 4200;
      
      return symbols.map((symbol, index) => {
        const price = basePrice + (index * 500) + (Math.random() - 0.5) * 20;
        const change = (Math.random() - 0.5) * 10;
        
        return {
          symbol,
          price,
          change,
          changePercent: (change / price) * 100,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          bid: price - 0.25,
          ask: price + 0.25,
          spread: 0.5,
          timestamp: Date.now()
        };
      });
    };

    const generateStrategies = (): Strategy[] => {
      const strategyNames = [
        'Liquidity Absorption',
        'Iceberg Detection',
        'Delta Divergence',
        'Volume Imbalance',
        'Stop Run Anticipation',
        'HVN Rejection',
        'LVN Breakout',
        'Momentum Breakout'
      ];

      return strategyNames.map((name, index) => ({
        id: `strategy-${index}`,
        name,
        enabled: Math.random() > 0.3,
        confidence: Math.random() * 100,
        signal: ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)] as 'BUY' | 'SELL' | 'HOLD',
        pnl: (Math.random() - 0.5) * 5000,
        trades: Math.floor(Math.random() * 50) + 10,
        winRate: Math.random() * 40 + 50,
        weight: Math.random() * 0.3 + 0.1
      }));
    };

    const generatePositions = (): Position[] => {
      const symbols = ['ES', 'NQ', 'CL'];
      return symbols.map(symbol => ({
        symbol,
        side: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        size: Math.floor(Math.random() * 10) + 1,
        entryPrice: 4200 + Math.random() * 100,
        currentPrice: 4200 + Math.random() * 100,
        pnl: (Math.random() - 0.5) * 2000,
        pnlPercent: (Math.random() - 0.5) * 5,
        duration: `${Math.floor(Math.random() * 120)}m`
      }));
    };

    const generateRiskMetrics = (): RiskMetrics => ({
      dailyPnl: (Math.random() - 0.5) * 10000,
      maxDrawdown: -Math.random() * 5000,
      portfolioHeat: Math.random() * 100,
      sharpeRatio: Math.random() * 2 + 0.5,
      winRate: Math.random() * 30 + 55,
      profitFactor: Math.random() * 1.5 + 1.0,
      totalTrades: Math.floor(Math.random() * 100) + 50,
      riskPerTrade: Math.random() * 2 + 0.5
    });

    const generateMLInsights = (): MLInsights => ({
      regime: ['TRENDING', 'RANGING', 'VOLATILE'][Math.floor(Math.random() * 3)] as 'TRENDING' | 'RANGING' | 'VOLATILE',
      confidence: Math.random() * 40 + 60,
      priceDirection: ['UP', 'DOWN', 'SIDEWAYS'][Math.floor(Math.random() * 3)] as 'UP' | 'DOWN' | 'SIDEWAYS',
      volatilityForecast: Math.random() * 30 + 10,
      nextBarPrediction: (Math.random() - 0.5) * 5
    });

    const generateOrderFlow = (): OrderFlowData => ({
      cumulativeDelta: (Math.random() - 0.5) * 1000,
      bidVolume: Math.floor(Math.random() * 10000) + 1000,
      askVolume: Math.floor(Math.random() * 10000) + 1000,
      absorption: Math.random() * 100,
      imbalance: (Math.random() - 0.5) * 50,
      hvnLevels: [4195, 4205, 4215],
      lvnLevels: [4190, 4210, 4220]
    });

    const generateLiquidationData = (): LiquidationData => {
      const recentEvents = Array.from({ length: 10 }, (_, i) => ({
        price: 4200 + (Math.random() - 0.5) * 50,
        volume: Math.floor(Math.random() * 50000) + 10000,
        intensity: Math.random() * 10,
        direction: Math.random() > 0.5 ? 'LONG' : 'SHORT' as 'LONG' | 'SHORT',
        confidence: Math.random() * 40 + 60,
        timestamp: Date.now() - (i * 60000),
        reason: ['Stop Loss Triggered', 'Margin Call', 'Forced Liquidation', 'Position Size Limit'][Math.floor(Math.random() * 4)]
      }));

      const activeClusters = Array.from({ length: 3 }, (_, i) => ({
        priceLevel: 4200 + (i - 1) * 10,
        totalVolume: Math.floor(Math.random() * 200000) + 50000,
        eventCount: Math.floor(Math.random() * 20) + 5,
        averageIntensity: Math.random() * 8 + 2,
        timespan: Math.floor(Math.random() * 3600) + 300,
        active: Math.random() > 0.3,
        events: recentEvents.slice(0, 3)
      }));

      return {
        recentEvents,
        activeClusters,
        totalLiquidations24h: Math.floor(Math.random() * 5000) + 1000,
        liquidationRate: Math.random() * 20 + 5,
        dominantDirection: ['LONG', 'SHORT', 'BALANCED'][Math.floor(Math.random() * 3)] as 'LONG' | 'SHORT' | 'BALANCED',
        riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'][Math.floor(Math.random() * 4)] as 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
      };
    };

    const generateMQScore = (): MQScore6D => {
      const dimensions = {
        liquidity: {
          name: 'liquidity',
          score: Math.random() * 40 + 60,
          weight: 0.2,
          rawValue: Math.random() * 100,
          status: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
          description: 'Market depth and bid-ask spread efficiency'
        },
        efficiency: {
          name: 'efficiency',
          score: Math.random() * 40 + 60,
          weight: 0.18,
          rawValue: Math.random() * 100,
          status: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
          description: 'Price discovery and execution efficiency'
        },
        volatility: {
          name: 'volatility',
          score: Math.random() * 40 + 60,
          weight: 0.15,
          rawValue: Math.random() * 100,
          status: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
          description: 'Price stability and volatility patterns'
        },
        momentum: {
          name: 'momentum',
          score: Math.random() * 40 + 60,
          weight: 0.17,
          rawValue: Math.random() * 100,
          status: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
          description: 'Trend strength and momentum indicators'
        },
        microstructure: {
          name: 'microstructure',
          score: Math.random() * 40 + 60,
          weight: 0.16,
          rawValue: Math.random() * 100,
          status: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
          description: 'Order flow and market microstructure health'
        },
        stability: {
          name: 'stability',
          score: Math.random() * 40 + 60,
          weight: 0.14,
          rawValue: Math.random() * 100,
          status: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
          description: 'Market stability and resilience metrics'
        }
      };

      const overallScore = Object.values(dimensions).reduce((sum, dim) => sum + (dim.score * dim.weight), 0) / Object.values(dimensions).reduce((sum, dim) => sum + dim.weight, 0);
      
      const getGrade = (score: number) => {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 75) return 'C+';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
      };

      return {
        overallScore,
        grade: getGrade(overallScore) as 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F',
        dimensions,
        timestamp: Date.now(),
        trend: ['IMPROVING', 'STABLE', 'DETERIORATING'][Math.floor(Math.random() * 3)] as 'IMPROVING' | 'STABLE' | 'DETERIORATING',
        riskAdjustment: (Math.random() - 0.5) * 0.2
      };
    };

    // Initial data
    setMarketData(generateMarketData());
    setStrategies(generateStrategies());
    setPositions(generatePositions());
    setRiskMetrics(generateRiskMetrics());
    setMLInsights(generateMLInsights());
    setOrderFlow(generateOrderFlow());
    setLiquidationData(generateLiquidationData());
    setMQScore(generateMQScore());

    // Update data every 2 seconds
    const interval = setInterval(() => {
      setMarketData(generateMarketData());
      setStrategies(generateStrategies());
      setPositions(generatePositions());
      setRiskMetrics(generateRiskMetrics());
      setMLInsights(generateMLInsights());
      setOrderFlow(generateOrderFlow());
      setLiquidationData(generateLiquidationData());
      setMQScore(generateMQScore());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    marketData,
    strategies,
    positions,
    riskMetrics,
    mlInsights,
    orderFlow,
    liquidationData,
    mqScore
  };
};