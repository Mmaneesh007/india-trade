import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import StockChart from '../components/StockChart';
import MutualFunds from '../components/MutualFunds';
import MarketOverview from '../components/MarketOverview';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Minus, Briefcase, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { MOCK_NIFTY, MOCK_RELIANCE } from '../mockData';

import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stocks'); // stocks | mutual_funds
    const [symbol, setSymbol] = useState('RELIANCE');
    const [priceData, setPriceData] = useState(null);
    const [candles, setCandles] = useState(MOCK_RELIANCE.candles);
    const [portfolio, setPortfolio] = useState({ shares: 0, invested: 0 });
    const [user, setUser] = useState(null);

    // Nifty Data for Overview
    const [niftyData, setNiftyData] = useState(null);
    const [niftyCandles, setNiftyCandles] = useState([]);

    // News Data
    const [news, setNews] = useState([]);
    const [similarStocks, setSimilarStocks] = useState([]);

    const TOP_STOCKS = [
        { name: "Tata Consultancy", symbol: "TCS.NS", price: "3,890.00", change: "+1.2%" },
        { name: "HDFC Bank", symbol: "HDFCBANK.NS", price: "1,650.20", change: "-0.5%" },
        { name: "Infosys", symbol: "INFY.NS", price: "1,540.00", change: "+0.8%" },
        { name: "Reliance Ind", symbol: "RELIANCE.NS", price: "2,980.00", change: "+0.4%" },
        { name: "ICICI Bank", symbol: "ICICIBANK.NS", price: "1,050.00", change: "+1.5%" },
        { name: "State Bank of India", symbol: "SBIN.NS", price: "760.00", change: "-0.2%" },
        { name: "Bharti Airtel", symbol: "BHARTIARTL.NS", price: "1,120.00", change: "+2.1%" },
        { name: "ITC Ltd", symbol: "ITC.NS", price: "430.00", change: "-0.1%" },
        { name: "Larsen & Toubro", symbol: "LT.NS", price: "3,500.00", change: "+1.0%" },
        { name: "Kotak Mahindra", symbol: "KOTAKBANK.NS", price: "1,780.00", change: "-0.8%" },
        { name: "Axis Bank", symbol: "AXISBANK.NS", price: "1,080.00", change: "+0.5%" },
        { name: "Hindustan Unilever", symbol: "HINDUNILVR.NS", price: "2,350.00", change: "-0.3%" },
        { name: "Bajaj Finance", symbol: "BAJFINANCE.NS", price: "6,900.00", change: "+1.8%" },
        { name: "Asian Paints", symbol: "ASIANPAINT.NS", price: "2,850.00", change: "-1.2%" },
        { name: "Maruti Suzuki", symbol: "MARUTI.NS", price: "11,500.00", change: "+0.6%" },
        { name: "Titan Company", symbol: "TITAN.NS", price: "3,650.00", change: "+0.9%" },
        { name: "Sun Pharma", symbol: "SUNPHARMA.NS", price: "1,550.00", change: "+1.1%" },
        { name: "Tata Motors", symbol: "TATAMOTORS.NS", price: "950.00", change: "+2.5%" },
        { name: "NTPC Ltd", symbol: "NTPC.NS", price: "340.00", change: "-0.4%" },
        { name: "Power Grid", symbol: "POWERGRID.NS", price: "280.00", change: "+0.7%" }
    ];

    const refreshSimilarStocks = () => {
        // Shuffle and pick 3
        const shuffled = [...TOP_STOCKS].sort(() => 0.5 - Math.random());
        setSimilarStocks(shuffled.slice(0, 3));
    };

    // Check Auth & Load Portfolio
    useEffect(() => {
        refreshSimilarStocks(); // Initial Random Load
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUser(user);
            fetchPortfolio(user.id);
            fetchNews(); // Load news on startup
        };
        checkUser();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await axios.get('/api/news');
            setNews(res.data);
        } catch (e) {
            console.error("Failed to fetch news", e);
        }
    };

    const fetchPortfolio = async (userId) => {
        const { data, error } = await supabase
            .from('portfolio')
            .select('*')
            .eq('user_id', userId)
            .eq('symbol', symbol)
            .single();

        if (data) {
            setPortfolio({ shares: data.quantity, invested: parseFloat(data.average_price) * data.quantity });
        }
    };

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
        socket.emit('subscribe', '^NSEI');

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

    const handleBuy = async () => {
        if (!priceData || !user) return;

        const newQty = portfolio.shares + 1;
        const newInvested = portfolio.invested + priceData.price;
        const newAvgPrice = newInvested / newQty;

        // Optimistic Update
        setPortfolio({ shares: newQty, invested: newInvested });

        // Save to Supabase
        const { error } = await supabase
            .from('portfolio')
            .upsert({
                user_id: user.id,
                symbol: symbol,
                quantity: newQty,
                average_price: newAvgPrice
            }, { onConflict: 'user_id, symbol' });

        if (error) {
            console.error('Buy failed:', error);
            alert("Trade failed to save!");
        } else {
            alert(`Bought 1 Qty of ${symbol} at ₹${priceData.price}`);
        }
    };

    return (
        <div className="min-h-screen bg-groww-bg font-sans pb-20">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} setSymbol={setSymbol} />

            {/* MUTUAL FUNDS TAB */}
            {activeTab === 'mutual_funds' && <MutualFunds />}

            {/* STOCKS TAB */}
            {activeTab === 'stocks' && (
                <main className="container mx-auto px-4 py-8 max-w-7xl">

                    {/* NSE STYLE MARKET OVERVIEW */}
                    <MarketOverview niftyData={niftyData} niftyCandles={niftyCandles} news={news} />

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
                                            Real Portfolio Active
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
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">Similar Stocks</h3>
                                    <RefreshCw
                                        size={16}
                                        className="text-gray-400 cursor-pointer hover:text-groww-primary transition-colors hover:rotate-180 duration-500"
                                        onClick={refreshSimilarStocks}
                                    />
                                </div>
                                <div className="space-y-4">
                                    {similarStocks.map((stock) => (
                                        <SimilarStock
                                            key={stock.symbol}
                                            name={stock.name}
                                            symbol={stock.symbol}
                                            price={stock.price}
                                            change={stock.change}
                                            onClick={() => setSymbol(stock.symbol)}
                                        />
                                    ))}
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

function SimilarStock({ name, symbol, price, change, onClick }) {
    const isPos = change.includes('+');
    return (
        <div
            onClick={onClick}
            className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded transition-colors"
        >
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
