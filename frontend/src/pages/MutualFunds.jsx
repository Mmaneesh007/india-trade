import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, PieChart, Info, Star, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

const FundCard = ({ fund }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-100 hover:border-groww-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {fund.star_rating >= 4 && (
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> {fund.star_rating}.0
                                </span>
                            )}
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {fund.category || 'Equity'}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{fund.fund_name}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">3Y Returns</p>
                        <p className="text-green-600 font-bold text-lg">+{fund.return_3y}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">NAV</p>
                        <p className="font-semibold text-gray-900">₹{fund.latest_nav.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Min SIP</p>
                        <p className="font-semibold text-gray-900">₹500</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Fund Size</p>
                        <p className="font-semibold text-gray-900">₹{fund.asset_size}Cr</p>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="px-5 pb-5 bg-gray-50 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Returns History</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">1 Year</span>
                                    <span className="font-bold text-green-600">+{fund.return_1y}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">3 Years</span>
                                    <span className="font-bold text-green-600">+{fund.return_3y}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">5 Years</span>
                                    <span className="font-bold text-green-600">+{fund.return_5y}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end">
                            <button className="w-full bg-groww-primary hover:bg-green-600 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm">
                                Invest Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function MutualFunds() {
    const [activeCategory, setActiveCategory] = useState('Equity');
    const [activeSubCategory, setActiveSubCategory] = useState('Large Cap');
    const [fundsData, setFundsData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFunds();
    }, []);

    const fetchFunds = async () => {
        try {
            const res = await api.get('/api/mutual_funds');
            setFundsData(res.data);
            // Set initial subcategory if available
            if (res.data.Equity) {
                setActiveSubCategory(Object.keys(res.data.Equity)[0]);
            }
        } catch (error) {
            console.error('Failed to fetch funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Equity', 'Debt', 'Hybrid'];
    const subCategories = fundsData[activeCategory] ? Object.keys(fundsData[activeCategory]) : [];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <PieChart className="text-purple-600" />
                            Mutual Funds
                        </h1>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search funds..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex gap-8 border-b border-gray-100">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setActiveSubCategory(fundsData[cat] ? Object.keys(fundsData[cat])[0] : ''); }}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeCategory === cat ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {cat}
                                {activeCategory === cat && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Sub-category Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {subCategories.map(sub => (
                        <button
                            key={sub}
                            onClick={() => setActiveSubCategory(sub)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeSubCategory === sub ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>

                {/* Funds Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fundsData[activeCategory]?.[activeSubCategory]?.map((fund, idx) => (
                            <FundCard key={idx} fund={{ ...fund, category: activeCategory }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
