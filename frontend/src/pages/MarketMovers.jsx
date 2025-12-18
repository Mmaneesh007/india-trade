import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight, Activity, ChevronDown, Zap, Newspaper, ArrowLeft } from 'lucide-react';
import api from '../api';

// Mini sparkline chart component
const MiniChart = ({ data, isPositive }) => {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 120;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height}>
            <polyline
                points={points}
                fill="none"
                stroke={isPositive ? '#00D09C' : '#EB5B3C'}
                strokeWidth="1.5"
            />
        </svg>
    );
};

export default function MarketMovers() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('price_shockers');
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [showIndexDropdown, setShowIndexDropdown] = useState(false);
    const [moversData, setMoversData] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
        { id: 'losers', label: 'Top Losers', icon: TrendingDown },
        { id: 'volume', label: 'Volume Shockers', icon: BarChart2 },
        { id: '52w-high', label: '52W High', icon: ArrowUpRight },
        { id: '52w-low', label: '52W Low', icon: ArrowDownRight },
        { id: 'price_shockers', label: 'Price Shockers', icon: Zap },
    ];

    const indices = [
        'NIFTY 50', 'NIFTY 100', 'NIFTY 200', 'NIFTY 500', 'SENSEX'
    ];

    useEffect(() => {
        fetchMoversData();
    }, [activeTab, selectedIndex]);

    const fetchMoversData = async () => {
        setLoading(true);
        try {
            // Determine endpoint based on active tab
            let endpoint = activeTab;
            if (activeTab === 'volume') endpoint = 'volume-shockers';

            // Construct query params
            const params = new URLSearchParams();
            params.append('count', '20');
            if (selectedIndex) {
                params.append('index', selectedIndex.replace(/\s+/g, ''));
            }

            const res = await api.get(`/api/movers/${endpoint}?${params.toString()}`);
            setMoversData(res.data);
        } catch (error) {
            console.error('Failed to fetch movers:', error);
            setMoversData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyClick = (symbol) => {
        navigate(`/trade/${encodeURIComponent(symbol)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="font-bold text-xl text-gray-900">Market Movers</h1>
                </div>
            </header>

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-groww-primary" />
                            Market Movers
                        </h1>

                        {/* Index Dropdown */}
                        <div className="relative w-64">
                            <button
                                onClick={() => setShowIndexDropdown(!showIndexDropdown)}
                                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors font-medium text-gray-700"
                            >
                                {selectedIndex || 'All Indices'}
                                <ChevronDown size={18} className={`transition-transform duration-200 ${showIndexDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showIndexDropdown && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                    <button
                                        onClick={() => { setSelectedIndex(null); setShowIndexDropdown(false); }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700"
                                    >
                                        All Indices
                                    </button>
                                    {indices.map(index => (
                                        <button
                                            key={index}
                                            onClick={() => { setSelectedIndex(index); setShowIndexDropdown(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700"
                                        >
                                            {index}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {moversData.map((stock, idx) => {
                            // Normalize data fields based on different API response structures
                            // Shockers API returns: ticker, company, percent_change, net_change
                            // Standard movers API returns: symbol, name, changePercent, change
                            const symbol = stock.symbol || stock.ticker || 'UNKNOWN';
                            const name = stock.name || stock.company || '';
                            const price = stock.price || 0;
                            const change = stock.change || stock.net_change || 0;
                            const changePercent = stock.changePercent || stock.percent_change || 0;
                            const volume = stock.volume || 0;

                            // For chart, if not available in shockers mode, just create empty array or reuse logic
                            const chartData = stock.chartData || [];

                            return (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-groww-primary/30 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                                    onClick={() => handleCompanyClick(symbol)}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-green-50 group-hover:text-groww-primary transition-colors">
                                                {symbol[0]}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-gray-900 group-hover:text-groww-primary transition-colors">{symbol}</h3>
                                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{price.toFixed(2)}</p>
                                            <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? 'text-groww-primary' : 'text-groww-red'} justify-end`}>
                                                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Only show chart if data exists */}
                                    {chartData.length > 0 && (
                                        <div className="mb-4 flex justify-center">
                                            <MiniChart data={chartData} isPositive={change >= 0} />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center py-3 border-t border-gray-50">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Open</p>
                                            <p className="text-xs font-bold text-gray-700">₹{(stock.open || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">High</p>
                                            <p className="text-xs font-bold text-gray-700">₹{(stock.high || stock.week52High || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Low</p>
                                            <p className="text-xs font-bold text-gray-700">₹{(stock.low || stock.week52Low || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-medium text-gray-400">Volume</span>
                                        <span className="text-xs font-bold text-gray-700">{volume.toLocaleString()}</span>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCompanyClick(symbol); }}
                                        className="w-full mt-4 bg-gray-50 hover:bg-groww-primary hover:text-white text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-all"
                                    >
                                        Trade
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
