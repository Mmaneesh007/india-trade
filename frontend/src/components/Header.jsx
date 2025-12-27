import React, { useEffect, useState, useRef } from 'react';
import { Search, TrendingUp, Bell, ShoppingCart, User, LogOut, Settings, ChevronDown, X, Wallet, History, Star } from 'lucide-react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AddFundsModal from './AddFundsModal';

export default function Header({ activeTab, setActiveTab, setSymbol }) {
    const navigate = useNavigate();
    const [indices, setIndices] = useState({
        nifty: { price: 0, change: 0, changePercent: 0 },
        sensex: { price: 0, change: 0, changePercent: 0 }
    });

    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Dropdown States
    const [showNotifications, setShowNotifications] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user, setUser] = useState(null);

    // Refs for click outside detection
    const notifRef = useRef(null);
    const quickRef = useRef(null);
    const userRef = useRef(null);

    // Check user session
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
            if (quickRef.current && !quickRef.current.contains(e.target)) setShowQuickActions(false);
            if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Mock notifications
    const notifications = [
        { id: 1, title: 'RELIANCE crossed ₹2,500', time: '5 min ago', type: 'alert' },
        { id: 2, title: 'TCS dividend announced', time: '1 hour ago', type: 'news' },
        { id: 3, title: 'Your buy order executed', time: '2 hours ago', type: 'order' },
    ];

    const [showAddFunds, setShowAddFunds] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-white/40 sticky top-0 z-50 transition-all">
            <div className="w-full px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer min-w-fit" onClick={() => setActiveTab('stocks')}>
                    <div className="w-8 h-8 bg-groww-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-groww-primary/20 hover:scale-105 transition-transform">
                        <TrendingUp size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">India<span className="text-groww-primary">Trade</span></span>
                </div>

                {/* Minimal Tabs */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50 shrink-0">
                    <button
                        onClick={() => setActiveTab('stocks')}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${activeTab === 'stocks' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Stocks
                    </button>
                    <button
                        onClick={() => setActiveTab('mutual_funds')}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${activeTab === 'mutual_funds' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Mutual Funds
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${activeTab === 'news' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        News
                    </button>
                    <button
                        onClick={() => { setActiveTab('market-movers'); navigate('/market-movers'); }}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${location.pathname === '/market-movers' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Movers
                    </button>
                    <button
                        onClick={() => { setActiveTab('mutual-funds'); navigate('/mutual-funds'); }}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${location.pathname === '/mutual-funds' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Mutual Funds
                    </button>
                    <button
                        onClick={() => setActiveTab('watchlist')}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${activeTab === 'watchlist' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Watchlist
                    </button>
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${activeTab === 'portfolio' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Portfolio
                    </button>
                    <button
                        onClick={() => { setActiveTab('broker'); navigate('/broker'); }}
                        className={`text-xs lg:text-sm font-medium px-3 lg:px-4 py-1.5 rounded-full transition-all ${location.pathname === '/broker' ? 'bg-white text-gray-900 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Broker
                    </button>
                </nav>

                <div className="hidden xl:flex gap-4 text-xs border-l border-gray-200 pl-4 h-8 items-center min-w-fit">
                    <IndexTicker name="NIFTY" data={indices.nifty} />
                    <IndexTicker name="SENSEX" data={indices.sensex} />
                </div>

                {/* Search & Profile (Right) */}
                <div className="flex-1 max-w-2xl relative min-w-[200px]">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-groww-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search stocks, indices..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowResults(true)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-12 pr-4 outline-none focus:bg-white focus:border-groww-primary/50 focus:shadow-md transition-all text-base"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && results.length > 0 && (
                        <div className="absolute top-12 left-0 w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto py-2 z-50">
                            {results.map((item) => (
                                <div
                                    key={item.symbol}
                                    onClick={() => {
                                        navigate(`/trade/${item.symbol}`);
                                        setQuery('');
                                        setShowResults(false);
                                    }}
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

                <div className="flex items-center gap-4 text-gray-500">
                    <button
                        onClick={() => setShowAddFunds(true)}
                        className="hidden md:flex items-center gap-2 text-groww-primary hover:bg-green-50 px-3 py-1.5 rounded-full font-medium text-sm transition-colors"
                    >
                        <Wallet size={18} />
                        <span>Add Funds</span>
                    </button>

                    {/* Notifications Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowQuickActions(false); setShowUserMenu(false); }}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Bell size={22} className="cursor-pointer hover:text-black" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">Notifications</h3>
                                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map(n => (
                                        <div key={n.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                            <div className="font-medium text-gray-900 text-sm">{n.title}</div>
                                            <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 border-t border-gray-100">
                                    <button className="text-groww-primary text-sm font-medium hover:underline w-full text-center">
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions (Cart) */}
                    <div className="relative" ref={quickRef}>
                        <button
                            onClick={() => { setShowQuickActions(!showQuickActions); setShowNotifications(false); setShowUserMenu(false); }}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ShoppingCart size={22} className="cursor-pointer hover:text-black" />
                        </button>

                        {showQuickActions && (
                            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-sm">Quick Actions</h3>
                                </div>
                                <button
                                    onClick={() => { setActiveTab('watchlist'); setShowQuickActions(false); }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                                >
                                    <Star size={18} className="text-yellow-500" />
                                    <span className="text-sm text-gray-700">My Watchlist</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('portfolio'); setShowQuickActions(false); }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                                >
                                    <History size={18} className="text-blue-500" />
                                    <span className="text-sm text-gray-700">Order History</span>
                                </button>
                                <button
                                    onClick={() => { setShowAddFunds(true); setShowQuickActions(false); }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                                >
                                    <Wallet size={18} className="text-green-500" />
                                    <span className="text-sm text-gray-700">Add Funds</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="relative" ref={userRef}>
                        <button
                            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowQuickActions(false); }}
                            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 cursor-pointer hover:border-groww-primary transition-colors"
                        >
                            <User size={20} />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="font-bold text-gray-900">{user.email?.split('@')[0]}</div>
                                            <div className="text-xs text-gray-400 truncate">{user.email}</div>
                                        </div>
                                        <button
                                            onClick={() => { setActiveTab('portfolio'); setShowUserMenu(false); }}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                                        >
                                            <Wallet size={18} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">My Portfolio</span>
                                        </button>
                                        <button
                                            onClick={() => { alert('Settings coming soon!'); setShowUserMenu(false); }}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                                        >
                                            <Settings size={18} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">Settings</span>
                                        </button>
                                        <div className="border-t border-gray-100 mt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-left text-red-600"
                                            >
                                                <LogOut size={18} />
                                                <span className="text-sm font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-4 py-4">
                                        <p className="text-sm text-gray-600 mb-3">Sign in to access all features</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-groww-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                        >
                                            Login / Sign Up
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddFundsModal
                isOpen={showAddFunds}
                onClose={() => setShowAddFunds(false)}
                userId={user?.id}
                onSuccess={(newBal) => alert(`Funds added! New Balance: ₹${newBal}`)}
            />
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
