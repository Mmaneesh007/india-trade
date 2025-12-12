import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Clock, Layers, Search, Star, AlertTriangle, ChevronRight, X } from 'lucide-react';
import api from '../api';

export default function MutualFunds() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trendingFunds, setTrendingFunds] = useState([]);
    const [categories, setCategories] = useState([]);

    const categoryIcons = {
        "MFCAT001": <ShieldCheck className="text-blue-500" />,
        "MFCAT002": <TrendingUp className="text-groww-primary" />,
        "MFCAT003": <ShieldCheck className="text-green-500" />,
        "MFCAT004": <Layers className="text-purple-500" />,
        "MFCAT005": <TrendingUp className="text-orange-500" />,
        "MFCAT006": <Clock className="text-blue-500" />,
        "MFCAT007": <Layers className="text-indigo-500" />,
    };

    // Fetch trending funds on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendingRes, catRes] = await Promise.all([
                    api.get('/api/mutualfunds/trending'),
                    api.get('/api/mutualfunds/categories')
                ]);
                setTrendingFunds(trendingRes.data);
                setCategories(catRes.data);
            } catch (error) {
                console.error('Failed to fetch MF data:', error);
            }
        };
        fetchData();
    }, []);

    // Search handler with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setLoading(true);
                try {
                    const res = await api.get(`/api/mutualfunds/search?query=${searchQuery}`);
                    setSearchResults(res.data);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search failed:', error);
                }
                setLoading(false);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const getRiskColor = (risk) => {
        const colors = {
            'Low': 'bg-green-100 text-green-700',
            'Moderate': 'bg-yellow-100 text-yellow-700',
            'High': 'bg-orange-100 text-orange-700',
            'Very High': 'bg-red-100 text-red-700'
        };
        return colors[risk] || 'bg-gray-100 text-gray-700';
    };

    const handleFundClick = (fund) => {
        alert(`Opening ${fund.schemeName || fund.name}...\nThis would navigate to the fund detail page.`);
        setShowResults(false);
        setSearchQuery('');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

            {/* Search Section */}
            <section className="relative">
                <div className="bg-gradient-to-r from-groww-primary to-green-600 rounded-2xl p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Mutual Funds</h1>
                    <p className="text-green-100 mb-6">Search from 5000+ mutual funds and start investing</p>

                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search mutual funds, AMCs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white text-gray-900 rounded-xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-white/50 text-lg"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setShowResults(false); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                        {loading && (
                            <div className="absolute right-12 top-1/2 -translate-y-1/2">
                                <div className="animate-spin w-5 h-5 border-2 border-groww-primary border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute left-8 right-8 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                            <div className="p-3 border-b border-gray-100 bg-gray-50">
                                <span className="text-sm text-gray-500">{searchResults.length} results found</span>
                            </div>
                            {searchResults.map((fund) => (
                                <div
                                    key={fund.id}
                                    onClick={() => handleFundClick(fund)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-groww-primary to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {fund.schemeName?.substring(0, 2) || 'MF'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">{fund.schemeName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                <span>{fund.schemeType}</span>
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{fund.isin}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="groww-card hover:shadow-md cursor-pointer transition-shadow flex flex-col items-center text-center gap-3 p-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                {categoryIcons[cat.id] || <Layers className="text-gray-400" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                                <p className="text-xs text-groww-text-muted mt-1">{cat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Funds */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-groww-primary" size={24} />
                        Trending Funds
                    </h2>
                    <button className="text-groww-primary font-medium hover:underline flex items-center gap-1">
                        View All <ChevronRight size={18} />
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Fund Name</th>
                                <th className="px-6 py-4">AUM</th>
                                <th className="px-6 py-4">Risk</th>
                                <th className="px-6 py-4 text-center">Rating</th>
                                <th className="px-6 py-4 text-right">1Y Returns</th>
                                <th className="px-6 py-4 text-right">3Y Returns</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {trendingFunds.map((fund) => (
                                <tr
                                    key={fund.id}
                                    onClick={() => handleFundClick(fund)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                                                {fund.schemeName?.substring(0, 2) || 'MF'}
                                            </div>
                                            <span className="font-medium text-gray-900">{fund.schemeName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{fund.aum}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskColor(fund.riskLevel)}`}>
                                            {fund.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-0.5">
                                            {[...Array(fund.rating)].map((_, i) => (
                                                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                            ))}
                                            {[...Array(5 - fund.rating)].map((_, i) => (
                                                <Star key={i} size={14} className="text-gray-200" />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-groww-primary">
                                        {fund.returns1Y}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-groww-primary">
                                        {fund.returns3Y}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Investment Tips */}
            <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Investment Tips</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Mutual fund investments are subject to market risks. Read all scheme related documents carefully.</li>
                            <li>• Past performance is not indicative of future returns.</li>
                            <li>• Consider your risk appetite and investment horizon before investing.</li>
                            <li>• SIP (Systematic Investment Plan) is recommended for long-term wealth creation.</li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>
    );
}
