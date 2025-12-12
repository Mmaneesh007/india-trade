import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Users, Building2, ExternalLink, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../api';
import StockChart from '../components/StockChart';
import { generateSmartCandles } from '../mockData';

export default function IPODetail() {
    const { ipoId } = useParams();
    const navigate = useNavigate();
    const [ipo, setIpo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchIPO = async () => {
            try {
                const res = await api.get(`/api/ipo/${ipoId}`);
                setIpo(res.data);
            } catch (error) {
                console.error('Failed to fetch IPO:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchIPO();
    }, [ipoId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
            </div>
        );
    }

    if (!ipo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">IPO Not Found</h2>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-groww-primary font-medium">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isListed = ipo.status === 'listed';
    const isOpen = ipo.status === 'open';
    const expectedPrice = ipo.issuePrice.max + ipo.gmp;
    const chartData = isListed ? generateSmartCandles(ipo.symbol, ipo.currentPrice, 60) : [];

    const getStatusBadge = () => {
        const statusConfig = {
            open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Open Now' },
            upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
            closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' },
            listed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Listed' }
        };
        const config = statusConfig[ipo.status];
        return (
            <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-bold`}>
                {config.label}
            </span>
        );
    };

    const handleApply = () => {
        // Open broker application pages
        const brokerUrls = {
            zerodha: `https://console.zerodha.com/ipo`,
            groww: `https://groww.in/ipo`,
            angel: `https://www.angelone.in/ipo`
        };
        window.open(brokerUrls.groww, '_blank');
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
                    <div className="flex-1">
                        <h1 className="font-bold text-lg text-gray-900 truncate">{ipo.name}</h1>
                        <p className="text-sm text-gray-500">{ipo.sector}</p>
                    </div>
                    {getStatusBadge()}
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Hero Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            {ipo.logo ? (
                                <img src={ipo.logo} alt={ipo.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50 p-2" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    {ipo.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{ipo.name}</h2>
                                <p className="text-gray-500">{ipo.exchange}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{ipo.category}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{ipo.sector}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Issue Price</div>
                            <div className="text-3xl font-bold text-gray-900">
                                ₹{ipo.issuePrice.min} - ₹{ipo.issuePrice.max}
                            </div>
                            {isListed && (
                                <div className={`text-lg font-bold mt-1 ${ipo.listingGain?.includes('+') ? 'text-green-600' : 'text-red-500'}`}>
                                    {ipo.listingGain} listing gain
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <div className="text-xs text-gray-500 mb-1">Lot Size</div>
                            <div className="font-bold text-gray-900">{ipo.lotSize} shares</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <div className="text-xs text-gray-500 mb-1">Min Investment</div>
                            <div className="font-bold text-gray-900">₹{(ipo.lotSize * ipo.issuePrice.max).toLocaleString()}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                            <div className="text-xs text-green-600 mb-1">GMP</div>
                            <div className="font-bold text-green-700">+₹{ipo.gmp}</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                            <div className="text-xs text-blue-600 mb-1">Expected Price</div>
                            <div className="font-bold text-blue-700">₹{expectedPrice}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['overview', 'subscription', 'timeline', isListed && 'performance'].filter(Boolean).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                                    ? 'bg-groww-primary text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {activeTab === 'overview' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">About {ipo.name}</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">{ipo.description}</p>

                            <h4 className="font-bold text-gray-900 mb-3">Key Metrics</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-500">Issue Size</div>
                                    <div className="font-bold text-gray-900">{ipo.issueSize}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-500">P/E Ratio</div>
                                    <div className="font-bold text-gray-900">{ipo.keyMetrics.pe || 'N/A'}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-500">Market Cap</div>
                                    <div className="font-bold text-gray-900">{ipo.keyMetrics.marketCap}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Subscription Status</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Retail Individual', value: ipo.subscriptionTimes.retail, color: 'bg-blue-500' },
                                    { label: 'QIB', value: ipo.subscriptionTimes.qib, color: 'bg-purple-500' },
                                    { label: 'NII (HNI)', value: ipo.subscriptionTimes.nii, color: 'bg-indigo-500' },
                                ].map(cat => (
                                    <div key={cat.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{cat.label}</span>
                                            <span className="font-bold text-gray-900">{cat.value}x</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${cat.color} transition-all duration-500`}
                                                style={{ width: `${Math.min(cat.value * 2, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-green-800">Total Subscription</span>
                                        <span className="text-2xl font-bold text-green-700">{ipo.subscriptionTimes.total}x</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">IPO Timeline</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Open Date', date: ipo.dates.open, icon: Calendar, done: true },
                                    { label: 'Close Date', date: ipo.dates.close, icon: Clock, done: new Date(ipo.dates.close) < new Date() },
                                    { label: 'Allotment Date', date: ipo.dates.allotment, icon: Users, done: new Date(ipo.dates.allotment) < new Date() },
                                    { label: 'Listing Date', date: ipo.dates.listing, icon: TrendingUp, done: isListed },
                                ].map((step, i) => (
                                    <div key={step.label} className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {step.done ? <CheckCircle size={20} /> : <step.icon size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{step.label}</div>
                                            <div className="text-sm text-gray-500">{new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        </div>
                                        {step.done && <CheckCircle size={20} className="text-green-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && isListed && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Post-Listing Performance</h3>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <div className="text-xs text-gray-500 mb-1">Listing Price</div>
                                    <div className="font-bold text-gray-900">₹{ipo.listingPrice}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <div className="text-xs text-gray-500 mb-1">Current Price</div>
                                    <div className="font-bold text-gray-900">₹{ipo.currentPrice}</div>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${ipo.currentPrice >= ipo.listingPrice ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="text-xs text-gray-500 mb-1">Listing Gain</div>
                                    <div className={`font-bold ${ipo.currentPrice >= ipo.listingPrice ? 'text-green-700' : 'text-red-600'}`}>
                                        {ipo.listingGain}
                                    </div>
                                </div>
                            </div>
                            <div className="h-80">
                                <StockChart data={chartData} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Apply Button */}
                {(isOpen || ipo.status === 'upcoming') && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                        <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
                            <div>
                                <div className="text-sm text-gray-500">Min Investment</div>
                                <div className="font-bold text-gray-900">₹{(ipo.lotSize * ipo.issuePrice.max).toLocaleString()}</div>
                            </div>
                            <button
                                onClick={handleApply}
                                disabled={ipo.status === 'upcoming'}
                                className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${isOpen
                                        ? 'bg-groww-primary hover:bg-green-600 shadow-lg shadow-groww-primary/30'
                                        : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                {isOpen ? 'Apply Now' : 'Coming Soon'}
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
