import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import StockChart from '../components/StockChart';
import MutualFunds from '../components/MutualFunds';
import MarketOverview from '../components/MarketOverview';
import TransactionHistory from '../components/TransactionHistory';
import Watchlist from '../components/Watchlist';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Minus, Briefcase, RefreshCw, Star } from 'lucide-react';
import api from '../api'; // Centralized API Client
import { MOCK_NIFTY, MOCK_RELIANCE, generateSmartCandles } from '../mockData';

import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stocks'); // stocks | mutual_funds | news | watchlist | portfolio
    const [symbol, setSymbol] = useState('RELIANCE.NS'); // Default to full symbol
    const [priceData, setPriceData] = useState(null);
    const [candles, setCandles] = useState(MOCK_RELIANCE.candles);
    const [portfolio, setPortfolio] = useState({ shares: 0, invested: 0 });
    const [user, setUser] = useState(null);

    // Nifty Data for Overview
    const [niftyData, setNiftyData] = useState(null);
    const [niftyCandles, setNiftyCandles] = useState([]);

    // News Data
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [newsCategory, setNewsCategory] = useState('all');

    // Watchlist
    const [watchlist, setWatchlist] = useState([]);
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
        const shuffled = [...TOP_STOCKS].sort(() => 0.5 - Math.random());
        setSimilarStocks(shuffled.slice(0, 3));
    };

    // Check Auth & Load Portfolio
    useEffect(() => {
        refreshSimilarStocks();
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUser(user);
            fetchPortfolio(user.id);
            fetchNews();
        };
        checkUser();
    }, []);

    const fetchNews = async (category = newsCategory) => {
        setLoadingNews(true);
        try {
            // Using API client handles base URL automatically
            // Add timestamp to prevent caching
            const res = await api.get('/api/news', {
                params: {
                    category: category,
                    t: Date.now()
                }
            });
            setNews(res.data);
        } catch (e) {
            console.error("Failed to fetch news", e);
            setNews([]);
        } finally {
            setLoadingNews(false);
        }
    };

    // Fetch watchlist on load
    useEffect(() => {
        if (user) {
            fetchWatchlist();
        }
    }, [user]);

    const fetchWatchlist = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/api/watchlist/${user.id}`);
            setWatchlist(res.data);
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
        }
    };

    const toggleWatchlist = async (sym) => {
        if (!user) {
            alert('Please log in to use watchlist');
            return;
        }

        const isInWatchlist = watchlist.some(item => item.symbol === sym);

        try {
            if (isInWatchlist) {
                await api.delete(`/api/watchlist/${user.id}/${sym}`);
                setWatchlist(prev => prev.filter(item => item.symbol !== sym));
            } else {
                const res = await api.post(`/api/watchlist/${user.id}`, { symbol: sym });
                setWatchlist(prev => [...prev, res.data]);
            }
        } catch (error) {
            console.error('Failed to toggle watchlist:', error);
            if (error.response?.status === 409) {
                alert('Stock already in watchlist');
            }
        }
    };

    const isInWatchlist = (sym) => {
        return watchlist.some(item => item.symbol === sym);
    };

    // Refetch news when category changes
    useEffect(() => {
        if (activeTab === 'news') {
            fetchNews(newsCategory);
        }
    }, [newsCategory, activeTab]);

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
            const snapRes = await api.get(`/api/quotes/latest/${sym}`);
            const realPrice = snapRes.data.price || 1500;
            setPriceData(snapRes.data);

            try {
                const candleRes = await api.get(`/api/quotes/candles/${sym}`);
                if (candleRes.data.candles && candleRes.data.candles.length > 0) {
                    setCandles(candleRes.data.candles);
                } else {
                    throw new Error("Empty candles");
                }
            } catch (candleErr) {
                console.warn(`Candle fetch failed for ${sym}, generating smart pattern for price ${realPrice}`);
                const smartCandles = generateSmartCandles(sym, realPrice, 100);
                setCandles(smartCandles);
            }

        } catch (e) {
            console.error("Critical fetch failed", e);
            const randomPrice = 1000 + Math.random() * 2000;
            setPriceData({
                symbol: sym,
                price: randomPrice,
                change: 15.5,
                changePercent: 1.2,
                open: randomPrice - 20,
                prevClose: randomPrice - 15
            });
            setCandles(generateSmartCandles(sym, randomPrice, 100));
        }
    };

    const fetchNiftyData = async () => {
        try {
            const [snapRes, candleRes] = await Promise.all([
                api.get(`/api/quotes/latest/^NSEI`),
                api.get(`/api/quotes/candles/^NSEI`)
            ]);
            setNiftyData(snapRes.data);
            if (candleRes.data.candles && candleRes.data.candles.length > 0) {
                setNiftyCandles(candleRes.data.candles);
            } else {
                setNiftyCandles(MOCK_NIFTY.candles);
            }
        } catch (e) {
            console.error("Nifty fetch failed, using mock", e);
            setNiftyData(MOCK_NIFTY);
            setNiftyCandles(MOCK_NIFTY.candles);
        }
    }

    const logTransaction = async (type, qty, price) => {
        if (!user) return;
        const { error } = await supabase
            .from('transactions')
            .insert([{
                user_id: user.id,
                symbol: symbol,
                type: type,
                quantity: qty,
                price: price,
                timestamp: new Date().toISOString()
            }]);
        if (error) console.error('Transaction log failed:', error);
    };

    const handleBuy = async () => {
        if (!priceData || !user) return;
        const newQty = portfolio.shares + 1;
        const newInvested = portfolio.invested + priceData.price;
        const newAvgPrice = newInvested / newQty;

        setPortfolio({ shares: newQty, invested: newInvested });

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
            logTransaction('BUY', 1, priceData.price);
            alert(`Bought 1 Qty of ${symbol} at ₹${priceData.price.toFixed(2)}`);
        }
    };

    const handleSell = async () => {
        if (!priceData || !user) return;
        if (portfolio.shares <= 0) {
            alert("You don't own any shares to sell!");
            return;
        }

        const newQty = portfolio.shares - 1;
        const avgPrice = portfolio.invested / portfolio.shares;
        const newInvested = avgPrice * newQty;

        setPortfolio({ shares: newQty, invested: newInvested });

        if (newQty > 0) {
            const { error } = await supabase
                .from('portfolio')
                .upsert({
                    user_id: user.id,
                    symbol: symbol,
                    quantity: newQty,
                    average_price: avgPrice
                }, { onConflict: 'user_id, symbol' });
            if (error) console.error('Sell update failed', error);
        } else {
            const { error } = await supabase
                .from('portfolio')
                .delete()
                .eq('user_id', user.id)
                .eq('symbol', symbol);
            if (error) console.error('Sell delete failed', error);
        }

        logTransaction('SELL', 1, priceData.price);
        const pnl = priceData.price - avgPrice;
        alert(`Sold 1 Qty of ${symbol} at ₹${priceData.price.toFixed(2)}. ${pnl >= 0 ? 'Profit' : 'Loss'}: ₹${Math.abs(pnl).toFixed(2)}`);
    };

    return (
        <div className="min-h-screen bg-groww-bg font-sans pb-20">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} setSymbol={setSymbol} />

            {/* MUTUAL FUNDS TAB */}
            {activeTab === 'mutual_funds' && <MutualFunds />}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && user && <TransactionHistory userId={user.id} />}

            {/* WATCHLIST TAB */}
            {activeTab === 'watchlist' && user && (
                <Watchlist
                    userId={user.id}
                    onStockClick={(tab, sym) => {
                        setActiveTab(tab);
                        if (sym) setSymbol(sym);
                    }}
                />
            )}

            {/* STOCKS NEWS TAB */}
            {activeTab === 'news' && (
                <main className="container mx-auto px-4 py-8 max-w-[1400px]">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8 border-b border-gray-200 pb-4 gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">
                                {newsCategory === 'all' ? 'Explore Markets News' :
                                    newsCategory === 'stocks' ? 'Company News' :
                                        newsCategory === 'economy' ? 'Economic Updates' : 'Live Markets'}
                            </h1>
                            <button
                                onClick={() => fetchNews(newsCategory)}
                                disabled={loadingNews}
                                className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-500 hover:text-groww-primary active:scale-95 disabled:opacity-50"
                                title="Refresh News"
                            >
                                <RefreshCw size={20} className={`${loadingNews ? 'animate-spin text-groww-primary' : ''}`} />
                            </button>
                        </div>

                        <div className="text-sm font-bold text-gray-500 flex gap-6 uppercase tracking-wider overflow-x-auto">
                            <button
                                onClick={() => setNewsCategory('all')}
                                className={`pb-4 cursor-pointer whitespace-nowrap transition-colors ${newsCategory === 'all' ? 'text-black border-b-2 border-black' : 'hover:text-black border-b-2 border-transparent'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setNewsCategory('live')}
                                className={`pb-4 cursor-pointer whitespace-nowrap transition-colors ${newsCategory === 'live' ? 'text-black border-b-2 border-black' : 'hover:text-black border-b-2 border-transparent'}`}
                            >
                                Live Markets
                            </button>
                            <button
                                onClick={() => setNewsCategory('stocks')}
                                className={`pb-4 cursor-pointer whitespace-nowrap transition-colors ${newsCategory === 'stocks' ? 'text-black border-b-2 border-black' : 'hover:text-black border-b-2 border-transparent'}`}
                            >
                                Stocks & Bonds
                            </button>
                            <button
                                onClick={() => setNewsCategory('economy')}
                                className={`pb-4 cursor-pointer whitespace-nowrap transition-colors ${newsCategory === 'economy' ? 'text-black border-b-2 border-black' : 'hover:text-black border-b-2 border-transparent'}`}
                            >
                                Economy
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {!loadingNews && news.length > 0 ? news.map((item, i) => (
                            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="group flex flex-col h-full bg-transparent hover:opacity-95 transition-opacity">
                                {/* Image Container */}
                                <div className="h-48 bg-gray-200 w-full mb-4 relative overflow-hidden rounded-sm">
                                    {item.thumbnail?.resolutions?.[0]?.url ? (
                                        <img src={item.thumbnail.resolutions[0].url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 italic font-serif">
                                            Market News
                                        </div>
                                    )}
                                </div>
                                {/* Content */}
                                <div className="flex flex-col flex-1">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 font-sans">MARKETS NEWS</div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-[1.3] mb-2 font-serif group-hover:text-groww-primary transition-colors line-clamp-3">{item.title}</h3>
                                    <div className="mt-auto text-xs text-gray-500 font-sans">By <span className="uppercase text-gray-800 font-bold">{item.publisher || "Staff"}</span></div>
                                </div>
                            </a>
                        )) : (
                            // Skeleton Loading State
                            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="animate-pulse flex flex-col h-full bg-transparent">
                                    <div className="h-48 bg-gray-200 w-full mb-4 rounded-sm"></div>
                                    <div className="flex-1 flex flex-col p-1">
                                        <div className="h-3 bg-gray-200 w-24 mb-3 rounded"></div>
                                        <div className="h-5 bg-gray-200 w-full mb-2 rounded"></div>
                                        <div className="h-5 bg-gray-200 w-3/4 mb-4 rounded"></div>
                                        <div className="mt-auto h-3 bg-gray-200 w-32 rounded"></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            )}

            {/* STOCKS TAB */}
            {activeTab === 'stocks' && (
                <main className="container mx-auto px-4 py-8 max-w-7xl">
                    <MarketOverview niftyData={niftyData} niftyCandles={niftyCandles} news={[]} /> {/* Force empty news for Overview */}

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
                        <button onClick={handleSell} className="btn-secondary bg-groww-red hover:bg-red-600 flex-1 md:flex-none md:w-40 flex items-center justify-center gap-2">
                            <Minus size={18} /> SELL
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 h-[500px]">
                                <StockChart data={candles} />
                            </div>

                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard label="Market Cap" value="₹12.4T" />
                                <StatCard label="P/E Ratio" value="24.5" />
                                <StatCard label="Open" value={priceData?.open} />
                                <StatCard label="Prev. Close" value={priceData?.prevClose} />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
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
