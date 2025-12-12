import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('gainers');
    const [selectedIndex, setSelectedIndex] = useState('nifty100');
    const [showIndexDropdown, setShowIndexDropdown] = useState(false);
    const [moversData, setMoversData] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'gainers', label: 'Top gainers' },
        { id: 'losers', label: 'Top losers' },
        { id: 'volume-shockers', label: 'Volume shockers' },
        { id: 'volume', label: 'Top by volume' },
        { id: '52w-high', label: '52W high' },
        { id: '52w-low', label: '52W low' },
    ];

    const indices = [
        { id: 'nifty100', label: 'NIFTY 100' },
        { id: 'nifty50', label: 'NIFTY 50' },
        { id: 'nifty200', label: 'NIFTY 200' },
        { id: 'nifty500', label: 'NIFTY 500' },
    ];

    useEffect(() => {
        fetchMoversData();
    }, [activeTab]);

    const fetchMoversData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'volume' ? 'volume-shockers' : activeTab;
            const res = await api.get(`/api/movers/${endpoint}?count=20`);
            setMoversData(res.data);
        } catch (error) {
            console.error('Failed to fetch movers:', error);
        }
        setLoading(false);
    };

    const handleCompanyClick = (stock) => {
        navigate(`/trade/${encodeURIComponent(stock.symbol)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
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

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between overflow-x-auto">
                    <div className="flex gap-2 flex-nowrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Index Dropdown */}
                    <div className="relative ml-4 flex-shrink-0">
                        <button
                            onClick={() => setShowIndexDropdown(!showIndexDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium"
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
            </div>

            {/* Table */}
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 bg-gray-50 grid grid-cols-12 text-xs text-gray-500 font-medium uppercase border-b border-gray-100">
                        <div className="col-span-4">Company</div>
                        <div className="col-span-4 text-center">Market Price (1D)</div>
                        <div className="col-span-4 text-right">Volume</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="px-6 py-5 animate-pulse">
                                    <div className="grid grid-cols-12 items-center gap-4">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                                <div className="h-3 bg-gray-100 rounded w-16"></div>
                                            </div>
                                        </div>
                                        <div className="col-span-4 flex justify-center">
                                            <div className="h-10 bg-gray-100 rounded w-28"></div>
                                        </div>
                                        <div className="col-span-4 text-right">
                                            <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            moversData.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => handleCompanyClick(stock)}
                                    className="px-6 py-5 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="grid grid-cols-12 items-center gap-4">
                                        {/* Company */}
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200">
                                                {stock.logo}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{stock.name}</div>
                                                {stock.inNews && (
                                                    <div className="flex items-center gap-1 text-groww-primary text-xs mt-1">
                                                        <Newspaper size={12} />
                                                        <span>In news</span>
                                                    </div>
                                                )}
                                            </div>
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
                </div>
            </div>
        </div>
    );
}
