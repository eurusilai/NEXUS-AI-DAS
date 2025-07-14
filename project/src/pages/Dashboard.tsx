import React from 'react';
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
import { PythonBrainMonitor } from '../components/PythonBrainMonitor';

export const Dashboard: React.FC = () => {
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
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <MarketData data={marketData} />
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <StrategyMonitor strategies={strategies} />
        </div>
      </div>

      {/* Middle Row: Position & Risk Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <PositionManager positions={positions} />
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <RiskDashboard riskMetrics={riskMetrics} />
        </div>
      </div>

      {/* Bottom Row: Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg lg:col-span-4">
          <MLInsights insights={mlInsights} />
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg lg:col-span-4">
          <OrderFlowAnalysis orderFlow={orderFlow} />
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg lg:col-span-4 row-span-2">
          <MQScoreAnalytics mqScore={mqScore} />
        </div>
      </div>

      {/* Full Width: Liquidation Detector */}
      <div className="mb-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <LiquidationDetector liquidationData={liquidationData} />
        </div>
      </div>

      {/* Full Width: Python Brain Monitor */}
      <div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <PythonBrainMonitor dashboardContext={dashboardContext} />
        </div>
      </div>
    </div>
  );
};