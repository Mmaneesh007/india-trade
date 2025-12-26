import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import IPODetail from './pages/IPODetail';
import MarketMovers from './pages/MarketMovers';
import TradePage from './pages/TradePage';
import MutualFunds from './pages/MutualFunds';
import BrokerConnect from './pages/BrokerConnect';

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/broker" element={<BrokerConnect />} />
          <Route path="/ipo/:ipoId" element={<IPODetail />} />
          <Route path="/market-movers" element={<MarketMovers />} />
          <Route path="/mutual-funds" element={<MutualFunds />} />
          <Route path="/trade/:symbol" element={<TradePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

