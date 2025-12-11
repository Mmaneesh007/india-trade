import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, Bell, ShoppingCart, User } from 'lucide-react';
import api from '../api';

export default function Header({ activeTab, setActiveTab }) {
    const [indices, setIndices] = useState({
        nifty: { price: 0, change: 0, changePercent: 0 },
        sensex: { price: 0, change: 0, changePercent: 0 }
    });

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

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer min-w-fit" onClick={() => setActiveTab('stocks')}>
                    <div className="w-10 h-10 bg-groww-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-groww-primary/20">
                        <TrendingUp size={24} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-gray-900">India<span className="text-groww-primary">Trade</span></span>
                </div>

                {/* Navigation Tabs (Center-Left) */}
                <nav className="hidden md:flex items-center gap-6 font-medium text-gray-500">
                    <button
                        onClick={() => setActiveTab('stocks')}
                        className={`hover:text-black transition-colors ${activeTab === 'stocks' ? 'text-black font-semibold' : ''}`}
                    >
                        Explore
                    </button>
                    <button
                        onClick={() => setActiveTab('mutual_funds')}
                        className={`hover:text-black transition-colors ${activeTab === 'mutual_funds' ? 'text-black font-semibold' : ''}`}
                    >
                        Mutual Funds
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                    <div className="flex gap-4 text-xs">
                        <IndexTicker name="NIFTY" data={indices.nifty} />
                        <IndexTicker name="SENSEX" data={indices.sensex} />
                    </div>
                </nav>

                {/* Search & Profile (Right) */}
                <div className="flex-1 max-w-md hidden lg:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-groww-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="What are you looking for today?"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:bg-white focus:border-groww-primary/50 focus:shadow-sm transition-all text-sm"
                        />
                    </div>
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
