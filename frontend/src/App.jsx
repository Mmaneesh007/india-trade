import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import StockChart from './components/StockChart';
import MutualFunds from './components/MutualFunds';
import MarketOverview from './components/MarketOverview';
import { useSocket, SocketProvider } from './context/SocketContext';
import { Search, Plus, Minus, Briefcase } from 'lucide-react';
import axios from 'axios';

function Dashboard() {
  const { socket, isConnected } = useSocket();
  const [activeTab, setActiveTab] = useState('stocks'); // stocks | mutual_funds
  const [symbol, setSymbol] = useState('RELIANCE');
  const [priceData, setPriceData] = useState(null);
  const [candles, setCandles] = useState([]);
  const [portfolio, setPortfolio] = useState({ shares: 0, invested: 0 }); // Mock portfolio

  // Nifty Data for Overview
  const [niftyData, setNiftyData] = useState(null);
  const [niftyCandles, setNiftyCandles] = useState([]);

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'stocks') {
      fetchStockData(symbol);
      fetchNiftyData();
    }
  }, [symbol, activeTab]);

  // Socket listener
  useEffect(() => {
    if (!socket || activeTab !== 'stocks') return;

    socket.emit('subscribe', symbol);
    socket.emit('subscribe', '^NSEI'); // Also subscribe to Nifty

    socket.on('price_update', (data) => {
      if (data.symbol === symbol) {
        setPriceData(data);
      }
      if (data.symbol === '^NSEI') {
        setNiftyData(data);
      }
    });

    return () => {
      socket.emit('unsubscribe', symbol);
      socket.emit('unsubscribe', '^NSEI');
      socket.off('price_update');
    };
  }, [socket, symbol, activeTab]);

  const fetchStockData = async (sym) => {
    try {
      const [snapRes, candleRes] = await Promise.all([
        axios.get(`/api/quotes/latest/${sym}`),
        axios.get(`/api/quotes/candles/${sym}`)
      ]);
      setPriceData(snapRes.data);
      if (candleRes.data.candles && candleRes.data.candles.length > 0) {
        setCandles(candleRes.data.candles);
      } else {
        // Fallback if API returns empty candles (common on free Yahoo API)
        console.warn("Using Mock Candles for Stock");
        setCandles(MOCK_RELIANCE.candles);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
      setPriceData(MOCK_RELIANCE);
      setCandles(MOCK_RELIANCE.candles);
    }
  };

  const fetchNiftyData = async () => {
    try {
      const [snapRes, candleRes] = await Promise.all([
        axios.get(`/api/quotes/latest/^NSEI`),
        axios.get(`/api/quotes/candles/^NSEI`)
      ]);
      setNiftyData(snapRes.data);
      if (candleRes.data.candles && candleRes.data.candles.length > 0) {
        setNiftyCandles(candleRes.data.candles);
      } else {
        console.warn("Using Mock Candles for Nifty");
        setNiftyCandles(MOCK_NIFTY.candles);
      }
    } catch (e) {
      console.error("Nifty fetch failed, using mock", e);
      setNiftyData(MOCK_NIFTY);
      setNiftyCandles(MOCK_NIFTY.candles);
    }
  }

  const handleBuy = () => {
    if (!priceData) return;
    const currentQty = portfolio.shares;
    setPortfolio({
      shares: currentQty + 1,
      invested: portfolio.invested + priceData.price
    });
    alert(`Bought 1 Qty of ${symbol} at ₹${priceData.price}`);
  };

  return (
    <div className="min-h-screen bg-groww-bg font-sans pb-20">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MUTUAL FUNDS TAB */}
      {activeTab === 'mutual_funds' && <MutualFunds />}

      {/* STOCKS TAB */}
      {activeTab === 'stocks' && (
        <main className="container mx-auto px-4 py-8 max-w-7xl">

          {/* NSE STYLE MARKET OVERVIEW */}
          <MarketOverview niftyData={niftyData} niftyCandles={niftyCandles} />

          <div className="border-t border-gray-200 my-8"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Deep Dive: Stock Analysis</h2>

          {/* Breadcrumb / Search Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded">NSE</span>
                <span className="text-sm text-gray-500">Equity • Large Cap</span>
              </div>
            </div>

            <div className="text-right">
              {priceData ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">₹{priceData.price?.toFixed(2)}</div>
                  <div className={`text-sm font-medium ${priceData.change >= 0 ? 'text-groww-primary' : 'text-groww-red'}`}>
                    {priceData.change?.toFixed(2)} ({priceData.changePercent?.toFixed(2)}%)
                  </div>
                </>
              ) : (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button onClick={handleBuy} className="btn-primary flex-1 md:flex-none md:w-40 flex items-center justify-center gap-2">
              <Plus size={18} /> BUY
            </button>
            <button className="btn-secondary bg-groww-red hover:bg-red-600 flex-1 md:flex-none md:w-40 flex items-center justify-center gap-2">
              <Minus size={18} /> SELL
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 h-[500px]">
                <StockChart data={candles} />
              </div>

              {/* Quick Fundamentals */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Market Cap" value="₹12.4T" />
                <StatCard label="P/E Ratio" value="24.5" />
                <StatCard label="Open" value={priceData?.open} />
                <StatCard label="Prev. Close" value={priceData?.prevClose} />
              </div>
            </div>

            {/* Sidebar / Portfolio */}
            <div className="space-y-6">

              {/* Your Holdings Card */}
              <div className="groww-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Briefcase size={18} className="text-groww-primary" />
                    Your Position
                  </h3>
                </div>

                {portfolio.shares > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Qty</span>
                      <span className="font-medium">{portfolio.shares}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Invested</span>
                      <span className="font-medium">₹{portfolio.invested.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between">
                      <span className="text-gray-500">Current Value</span>
                      <span className="font-bold text-gray-900">
                        ₹{(portfolio.shares * (priceData?.price || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-center text-green-600 font-medium bg-green-50 py-1 rounded">
                      Mock Portfolio Active
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    You don't own this stock yet.
                  </div>
                )}
              </div>

              {/* Similar Stocks */}
              <div className="groww-card">
                <h3 className="font-bold text-gray-800 mb-4">Similar Stocks</h3>
                <div className="space-y-4">
                  <SimilarStock name="Tata Consultancy" price="3,890.00" change="+1.2%" />
                  <SimilarStock name="HDFC Bank" price="1,650.20" change="-0.5%" />
                  <SimilarStock name="Infosys" price="1,540.00" change="+0.8%" />
                </div>
              </div>

            </div>

          </div>
        </main>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-semibold text-gray-900">{value !== undefined ? value : '-'}</div>
    </div>
  )
}

function SimilarStock({ name, price, change }) {
  const isPos = change.includes('+');
  return (
    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded transition-colors">
      <div>
        <div className="font-medium text-gray-900 text-sm">{name}</div>
        <div className="text-xs text-gray-500">Equity</div>
      </div>
      <div className="text-right">
        <div className="font-medium text-sm">₹{price}</div>
        <div className={`text-xs ${isPos ? 'text-groww-primary' : 'text-groww-red'}`}>{change}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
}
