import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Calendar,
  Clock,
  ChevronDown,
  Layers,
  Settings
} from 'lucide-react';
import { LiquidationDetector } from '../components/LiquidationDetector';
import { OrderFlowAnalysis } from '../components/OrderFlowAnalysis';
import { OrderFlowData, LiquidationData, LiquidationEvent, LiquidationCluster } from '../types/trading';

export const TradeReplay: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showOrderFlow, setShowOrderFlow] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);

  // Mock data
  const orderFlowMock: OrderFlowData = {
    cumulativeDelta: 15800,
    bidVolume: 1200000,
    askVolume: 1135000,
    absorption: 60.2,
    imbalance: 4.8,
    hvnLevels: [ 4321.25, 4315.50, 4308.75 ],
    lvnLevels: [ 4298.25, 4286.75, 4279.50 ]
  };

  const generateLiquidationEvent = (id: number): LiquidationEvent => ({
    price: 4320 + Math.random() * 20 - 10,
    volume: 5000 + Math.random() * 20000,
    intensity: Math.random() * 10,
    direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
    confidence: Math.random() * 100,
    timestamp: Date.now() - id * 60000,
    reason: 'High leverage position wiped out'
  });

  const recentEvents = Array.from({ length: 12 }, (_, i) => generateLiquidationEvent(i));

  const clusters: LiquidationCluster[] = [
    {
      priceLevel: 4312.25,
      totalVolume: 185000,
      eventCount: 12,
      averageIntensity: 5.4,
      timespan: 45 * 60,
      active: true,
      events: recentEvents.slice(0,5)
    },
    {
      priceLevel: 4289.75,
      totalVolume: 92000,
      eventCount: 7,
      averageIntensity: 4.1,
      timespan: 30 * 60,
      active: false,
      events: recentEvents.slice(5,9)
    }
  ];

  const liquidationMock: LiquidationData = {
    recentEvents,
    activeClusters: clusters,
    totalLiquidations24h: 3200,
    liquidationRate: 2.8,
    dominantDirection: 'LONG',
    riskLevel: 'MEDIUM'
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Replay</h1>
          <p className="text-gray-400">Analyze your trades tick by tick with advanced market data</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Select Trade</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 h-[500px]">
        <div className="text-center text-gray-400">
          Chart component will be integrated here
        </div>
      </div>

      {/* Playback Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-white">09:30:45 AM</span>
            </div>
            <div className="h-4 w-px bg-gray-700" />
            <div className="text-gray-400">Time Range: 5m</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative h-2 bg-gray-800 rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
            style={{ width: `${(currentTime / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Analysis Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Order Flow Analysis</h2>
            <button
              onClick={() => setShowOrderFlow(!showOrderFlow)}
              className={`p-2 rounded-lg transition-colors ${
                showOrderFlow ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
          {showOrderFlow && <OrderFlowAnalysis orderFlow={orderFlowMock} />}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Liquidity Analysis</h2>
            <button
              onClick={() => setShowLiquidity(!showLiquidity)}
              className={`p-2 rounded-lg transition-colors ${
                showLiquidity ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
          {showLiquidity && <LiquidationDetector liquidationData={liquidationMock} />}
        </div>
      </div>
    </div>
  );
};