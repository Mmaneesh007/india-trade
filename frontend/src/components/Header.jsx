import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, Bell, ShoppingCart, User } from 'lucide-react';
import api from '../api';

export default function Header({ activeTab, setActiveTab, setSymbol }) {
    const [indices, setIndices] = useState({
        nifty: { price: 0, change: 0, changePercent: 0 },
        sensex: { price: 0, change: 0, changePercent: 0 }
    });

    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                const [niftyRes, sensexRes] = await Promise.all([
                    api.get('/api/quotes/latest/^NSEI'),
                    api.get('/api/quotes/latest/^BSESN')
                ]);
                setIndices({
                    nifty: niftyRes.data,
                    sensex: sensexRes.data
                });
            } catch (e) {
                console.error("Failed to fetch indices", e);
            }
        };

        fetchIndices();
        const interval = setInterval(fetchIndices, 10000);
        return () => clearInterval(interval);
    }, []);

    // Search Handler
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                try {
                    const res = await api.get(`/api/search?q=${query}`);
                    setResults(res.data);
                    setShowResults(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300); // Debounce
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (symbol) => {
        if (setSymbol) {
            setSymbol(symbol);
            setActiveTab('stocks'); // Switch to stocks tab if elsewhere
        }
        setQuery('');
        setShowResults(false);
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-white/40 sticky top-0 z-50 transition-all">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-8">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer min-w-fit" onClick={() => setActiveTab('stocks')}>
                    <div className="w-8 h-8 bg-groww-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-groww-primary/20 hover:scale-105 transition-transform">
                        <TrendingUp size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">India<span className="text-groww-primary">Trade</span></span>
                </div>

                {/* Minimal Tabs */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                    <button
                        onClick={() => setActiveTab('stocks')}
                        className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all ${activeTab === 'stocks' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Stocks
                    </button>
                    <button
                        onClick={() => setActiveTab('mutual_funds')}
                        className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all ${activeTab === 'mutual_funds' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Mutual Funds
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all ${activeTab === 'news' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Stocks News
                    </button>
                </nav>

                <div className="hidden lg:flex gap-6 text-xs border-l border-gray-200 pl-6 h-8 items-center">
                    <IndexTicker name="NIFTY" data={indices.nifty} />
                    <IndexTicker name="SENSEX" data={indices.sensex} />
                </div>

                {/* Search & Profile (Right) */}
                <div className="flex-1 max-w-md hidden lg:block relative">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-groww-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search stocks, indices..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowResults(true)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:bg-white focus:border-groww-primary/50 focus:shadow-sm transition-all text-sm"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && results.length > 0 && (
                        <div className="absolute top-12 left-0 w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto py-2 z-50">
                            {results.map((item) => (
                                <div
                                    key={item.symbol}
                                    onClick={() => handleSelect(item.symbol)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                >
                                    <div className="font-bold text-gray-900">{item.symbol}</div>
                                    <div className="text-xs text-gray-500 flex justify-between">
                                        <span>{item.shortname || item.longname}</span>
                                        <span className="bg-gray-100 px-1 rounded">{item.exchange}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-5 text-gray-500">
                    <Bell size={22} className="cursor-pointer hover:text-black" />
                    <ShoppingCart size={22} className="cursor-pointer hover:text-black" />
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 cursor-pointer">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}

function IndexTicker({ name, data }) {
    const isPos = data.change >= 0;
    return (
        <div className="flex flex-col">
            <span className="text-gray-400 font-medium ">{name}</span>
            <span className={`font-mono font-medium flex items-center gap-0.5 ${isPos ? 'text-groww-primary' : 'text-groww-red'}`}>
                {data.price ? data.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '...'}
                <span className="text-[10px]">{isPos ? '+' : ''}{data.changePercent?.toFixed(2)}%</span>
            </span>
        </div>
    )
}
