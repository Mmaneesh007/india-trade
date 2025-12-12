import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Mini sparkline chart component
const MiniChart = ({ data, isPositive }) => {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 100;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="flex-shrink-0">
            <polyline
                points={points}
                fill="none"
                stroke={isPositive ? '#00D09C' : '#EB5B3C'}
                strokeWidth="1.5"
            />
        </svg>
    );
};

export default function TopMovers() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('gainers');
    const [selectedIndex, setSelectedIndex] = useState('nifty100');
    const [showIndexDropdown, setShowIndexDropdown] = useState(false);
    const [moversData, setMoversData] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'gainers', label: 'Gainers' },
        { id: 'losers', label: 'Losers' },
        { id: 'volume-shockers', label: 'Volume shockers' },
    ];

    const indices = [
        { id: 'nifty100', label: 'NIFTY 100' },
        { id: 'nifty50', label: 'NIFTY 50' },
        { id: 'nifty200', label: 'NIFTY 200' },
    ];

    useEffect(() => {
        fetchMoversData();
    }, [activeTab]);

    const fetchMoversData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/movers/${activeTab}?count=6`);
            setMoversData(res.data);
        } catch (error) {
            console.error('Failed to fetch movers:', error);
        }
        setLoading(false);
    };

    const handleCompanyClick = (stock) => {
        navigate(`/trade/${stock.symbol}`);
    };

    const handleSeeMore = () => {
        navigate('/market-movers');
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Top market movers</h2>
            </div>

            {/* Tabs & Filter */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Index Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowIndexDropdown(!showIndexDropdown)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        {indices.find(i => i.id === selectedIndex)?.label}
                        <ChevronDown size={16} />
                    </button>
                    {showIndexDropdown && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 min-w-[140px]">
                            {indices.map(idx => (
                                <button
                                    key={idx.id}
                                    onClick={() => { setSelectedIndex(idx.id); setShowIndexDropdown(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedIndex === idx.id ? 'text-groww-primary font-medium' : 'text-gray-700'}`}
                                >
                                    {idx.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table Header */}
            <div className="px-6 py-3 bg-gray-50 grid grid-cols-12 text-xs text-gray-500 font-medium uppercase">
                <div className="col-span-4">Company</div>
                <div className="col-span-4 text-center">Market price (1D)</div>
                <div className="col-span-4 text-right">Volume</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="px-6 py-4 animate-pulse">
                            <div className="grid grid-cols-12 items-center gap-4">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="col-span-4 flex justify-center">
                                    <div className="h-10 bg-gray-100 rounded w-24"></div>
                                </div>
                                <div className="col-span-4 text-right">
                                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    moversData.map((stock) => (
                        <div
                            key={stock.symbol}
                            onClick={() => handleCompanyClick(stock)}
                            className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="grid grid-cols-12 items-center gap-4">
                                {/* Company */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
                                        {stock.logo}
                                    </div>
                                    <span className="font-medium text-gray-900">{stock.name}</span>
                                </div>

                                {/* Chart & Price */}
                                <div className="col-span-4 flex items-center justify-center gap-4">
                                    <MiniChart data={stock.chartData} isPositive={stock.changePercent >= 0} />
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900">₹{stock.price.toLocaleString()}</div>
                                        <div className={`text-sm font-medium ${stock.changePercent >= 0 ? 'text-groww-primary' : 'text-red-500'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="col-span-4 text-right font-medium text-gray-700">
                                    {stock.volumeFormatted}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* See More */}
            <div className="px-6 py-4 border-t border-gray-100">
                <button
                    onClick={handleSeeMore}
                    className="text-groww-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                    See more <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
