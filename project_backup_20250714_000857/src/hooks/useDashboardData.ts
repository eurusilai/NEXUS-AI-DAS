import { useEffect, useState } from 'react';

export interface MQDimension {
  Score: number;
  Weight: number;
  Status: string;
}

export interface MQScore {
  Liquidity: MQDimension;
  Efficiency: MQDimension;
  Volatility: MQDimension;
  Momentum: MQDimension;
  Microstructure: MQDimension;
  Stability: MQDimension;
  OverallScore: number;
  Confidence: number;
  Regime: string;
  LastUpdate: string;
}

export interface DashboardData {
  timestamp: string;
  systemVersion: string;
  strategies: Record<string, boolean>;
  performance: {
    dailyPnL: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    portfolioHeat: number;
  };
  signals: {
    activeCount: number;
    longSignals: number;
    shortSignals: number;
    totalConfidence: number;
  };
  market: {
    currentPrice: number;
    cumulativeDelta: number;
    volume: number;
    volatility: number;
  };
  position: {
    quantity: number;
    averagePrice: number;
    unrealizedPnL: number;
  };
  mqscore: MQScore;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');
    ws.onmessage = evt => {
      try {
        const json = JSON.parse(evt.data);
        setData(json);
      } catch {}
    };
    return () => ws.close();
  }, []);

  return data;
}; 