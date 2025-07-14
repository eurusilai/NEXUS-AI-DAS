import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trade } from '../components/TradeCard';

interface TradeContextValue {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
}

const TradeContext = createContext<TradeContextValue | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

export const TradeProvider: React.FC<Props> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Load from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem('trading-journal-trades');
    if (stored) {
      try {
        setTrades(JSON.parse(stored));
      } catch {
        /* ignore */ }
    }
  }, []);

  // Persist whenever trades change
  useEffect(() => {
    localStorage.setItem('trading-journal-trades', JSON.stringify(trades));
  }, [trades]);

  const addTrade = (trade: Trade) => setTrades(prev => [...prev, trade]);
  const updateTrade = (trade: Trade) => setTrades(prev => prev.map(t => t.id === trade.id ? trade : t));
  const deleteTrade = (id: string) => setTrades(prev => prev.filter(t => t.id !== id));

  return (
    <TradeContext.Provider value={{ trades, addTrade, updateTrade, deleteTrade }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used within TradeProvider');
  return ctx;
}; 