import { useState, useEffect } from 'react';
import { DashboardContext } from '../services/MistralAI';
import { useTradingData } from './useTradingData';
import { useTrades } from '../context/TradeContext';

export const useAIIntegration = () => {
  const [dashboardContext, setDashboardContext] = useState<DashboardContext>({
    marketData: [],
    strategies: [],
    positions: [],
    riskMetrics: null,
    orderFlow: null,
    liquidationData: null,
    mqScore: null,
    trades: [],
    performance: null,
    brokerConnections: []
  });

  const tradingData = useTradingData();
  const { trades } = useTrades();

  useEffect(() => {
    // Update dashboard context whenever trading data changes
    const newContext: DashboardContext = {
      marketData: tradingData.marketData || [],
      strategies: tradingData.strategies || [],
      positions: tradingData.positions || [],
      riskMetrics: tradingData.riskMetrics,
      orderFlow: tradingData.orderFlow,
      liquidationData: tradingData.liquidationData,
      mqScore: tradingData.mqScore,
      trades: trades || [],
      performance: tradingData.riskMetrics ? {
        totalTrades: trades.length,
        winRate: trades.length ? (trades.filter(t => t.result > 0).length / trades.length) * 100 : 0,
        totalPnL: trades.reduce((sum, t) => sum + t.result, 0),
        avgRMultiple: trades.length ? trades.reduce((sum, t) => sum + t.rMultiple, 0) / trades.length : 0
      } : null,
      brokerConnections: [] // This would come from broker settings
    };

    setDashboardContext(newContext);
  }, [tradingData, trades]);

  return { dashboardContext };
};