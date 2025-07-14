import React, { useState } from 'react';
import { useTradingData } from '../hooks/useTradingData';
import { useAIIntegration } from '../hooks/useAIIntegration';
import { MarketData } from '../components/MarketData';
import { StrategyMonitor } from '../components/StrategyMonitor';
import { PositionManager } from '../components/PositionManager';
import { RiskDashboard } from '../components/RiskDashboard';
import { MLInsights } from '../components/MLInsights';
import { OrderFlowAnalysis } from '../components/OrderFlowAnalysis';
import { LiquidationDetector } from '../components/LiquidationDetector';
import { MQScoreAnalytics } from '../components/MQScoreAnalytics';
import { AIChat } from '../components/AIChat';
import { PythonBrainMonitor } from '../components/PythonBrainMonitor';

export const Dashboard: React.FC = () => {
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(true);
  
  const {
    marketData,
    strategies,
    positions,
    riskMetrics,
    mlInsights,
    orderFlow,
    liquidationData,
    mqScore
  } = useTradingData();

  const { dashboardContext } = useAIIntegration();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
      {/* Python Brain Monitor - Top Priority */}
      <PythonBrainMonitor dashboardContext={dashboardContext} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <MarketData data={marketData} />
          <StrategyMonitor strategies={strategies} />
          <PositionManager positions={positions} />
        </div>
        <div className="space-y-8">
          <RiskDashboard riskMetrics={riskMetrics} />
          <MLInsights insights={mlInsights} />
          <OrderFlowAnalysis orderFlow={orderFlow} />
          <LiquidationDetector liquidationData={liquidationData} />
          <MQScoreAnalytics mqScore={mqScore} />
        </div>
      </div>

      {/* AI Chat Integration */}
      <AIChat 
        dashboardContext={dashboardContext}
        isMinimized={isAIChatMinimized}
        onToggleMinimize={() => setIsAIChatMinimized(!isAIChatMinimized)}
      />
    </div>
  );
};