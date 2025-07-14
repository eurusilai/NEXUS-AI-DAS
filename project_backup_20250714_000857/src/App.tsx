import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { TradingJournal } from './pages/TradingJournal';
import { Analytics } from './pages/Analytics';
import { TradeReplay } from './pages/TradeReplay';
import { Backtesting } from './pages/Backtesting';
import { Playbooks } from './pages/Playbooks';
import { Notebook } from './pages/Notebook';
import { BrokerSettings } from './pages/BrokerSettings';
import { TradeProvider } from './context/TradeContext';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <TradeProvider>
      <Router>
        <div className="min-h-screen bg-gray-950 text-white">
          <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
          
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<TradingJournal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/replay" element={<TradeReplay />} />
            <Route path="/backtesting" element={<Backtesting />} />
            <Route path="/playbooks" element={<Playbooks />} />
            <Route path="/notebook" element={<Notebook />} />
            <Route path="/brokers" element={<BrokerSettings />} />
          </Routes>
        </div>
      </Router>
    </TradeProvider>
  );
}

export default App;