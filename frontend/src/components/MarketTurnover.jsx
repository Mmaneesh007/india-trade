import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Clock, TrendingUp, Info, ChevronRight } from 'lucide-react';
import api from '../api';

// Turnover Detail Modal Component
const TurnoverDetailModal = ({ isOpen, onClose, detailedData }) => {
    if (!isOpen || !detailedData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Market Turnover</h2>
                        <p className="text-indigo-200 text-sm">As on {detailedData.date} | Value Convention: ₹ Crores | ₹ Millions</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-auto max-h-[calc(90vh-200px)]">
                    {/* Table Header */}
                    <div className="sticky top-0 bg-indigo-900 text-white">
                        <div className="grid grid-cols-12 text-xs font-bold">
                            <div className="col-span-2 px-4 py-3 border-r border-indigo-700">PRODUCTS</div>
                            <div className="col-span-5 text-center py-1 border-r border-indigo-700">
                                <div className="text-green-400 font-bold mb-1">TODAY</div>
                                <div className="grid grid-cols-5 text-[10px]">
                                    <span>VOLUME</span>
                                    <span>VALUE</span>
                                    <span>OPEN INT.</span>
                                    <span>NO. OF TRADES</span>
                                    <span>AVG TRADE</span>
                                </div>
                            </div>
                            <div className="col-span-5 text-center py-1">
                                <div className="text-orange-400 font-bold mb-1">PREVIOUS DAY ({detailedData.previousDate})</div>
                                <div className="grid grid-cols-5 text-[10px]">
                                    <span>VOLUME</span>
                                    <span>VALUE</span>
                                    <span>OPEN INT.</span>
                                    <span>NO. OF TRADES</span>
                                    <span>AVG TRADE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Rows */}
                    <div className="divide-y divide-gray-100">
                        {detailedData.categoryTotals.map((cat, catIdx) => (
                            <React.Fragment key={cat.category}>
                                {/* Category Header */}
                                <div className="bg-indigo-50 grid grid-cols-12 text-sm font-bold text-indigo-900">
                                    <div className="col-span-2 px-4 py-2">{cat.category}</div>
                                    <div className="col-span-5 grid grid-cols-5 py-2 text-right pr-2">
                                        <span>{cat.today.volume ? cat.today.volume.toLocaleString() : '-'}</span>
                                        <span>{cat.today.value ? cat.today.value.toLocaleString() : '-'}</span>
                                        <span>{cat.today.openInterest ? cat.today.openInterest.toLocaleString() : '-'}</span>
                                        <span>{cat.today.trades ? cat.today.trades.toLocaleString() : '-'}</span>
                                        <span>-</span>
                                    </div>
                                    <div className="col-span-5 grid grid-cols-5 py-2 text-right pr-2 text-indigo-700">
                                        <span>{cat.prev.volume ? cat.prev.volume.toLocaleString() : '-'}</span>
                                        <span>{cat.prev.value ? cat.prev.value.toLocaleString() : '-'}</span>
                                        <span>-</span>
                                        <span>-</span>
                                        <span>-</span>
                                    </div>
                                </div>

                                {/* Segments */}
                                {detailedData.segments
                                    .filter(s => s.category === cat.category)
                                    .map((seg, segIdx) => (
                                        <div key={`${cat.category}-${segIdx}`} className="grid grid-cols-12 text-xs hover:bg-gray-50">
                                            <div className="col-span-2 px-4 py-2 pl-8 text-gray-600">{seg.segment}</div>
                                            <div className="col-span-5 grid grid-cols-5 py-2 text-right pr-2">
                                                <span>{seg.today.volume ? seg.today.volume.toLocaleString() : '-'}</span>
                                                <span>{seg.today.value ? seg.today.value.toLocaleString() : '-'}</span>
                                                <span>{seg.today.openInterest ? seg.today.openInterest.toLocaleString() : '-'}</span>
                                                <span>{seg.today.trades ? seg.today.trades.toLocaleString() : '-'}</span>
                                                <span>{seg.today.avgTradeValue ? seg.today.avgTradeValue.toLocaleString() : '-'}</span>
                                            </div>
                                            <div className="col-span-5 grid grid-cols-5 py-2 text-right pr-2 text-gray-500">
                                                <span>{seg.prev.volume ? seg.prev.volume.toLocaleString() : '-'}</span>
                                                <span>{seg.prev.value ? seg.prev.value.toLocaleString() : '-'}</span>
                                                <span>-</span>
                                                <span>-</span>
                                                <span>-</span>
                                            </div>
                                        </div>
                                    ))}
                            </React.Fragment>
                        ))}

                        {/* Grand Total */}
                        <div className="bg-indigo-900 text-white grid grid-cols-12 text-sm font-bold">
                            <div className="col-span-2 px-4 py-3">Grand Total</div>
                            <div className="col-span-5 grid grid-cols-5 py-3 text-right pr-2">
                                <span>{detailedData.grandTotal.today.volume.toLocaleString()}</span>
                                <span>{detailedData.grandTotal.today.value.toLocaleString()}</span>
                                <span>{detailedData.grandTotal.today.openInterest.toLocaleString()}</span>
                                <span>{detailedData.grandTotal.today.trades.toLocaleString()}</span>
                                <span>-</span>
                            </div>
                            <div className="col-span-5 grid grid-cols-5 py-3 text-right pr-2 text-indigo-300">
                                <span>{detailedData.grandTotal.prev.volume.toLocaleString()}</span>
                                <span>{detailedData.grandTotal.prev.value.toLocaleString()}</span>
                                <span>-</span>
                                <span>-</span>
                                <span>-</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-yellow-50 px-6 py-4 border-t border-yellow-100">
                    <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <Info size={16} /> Notes
                    </h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                        {detailedData.notes.map((note, idx) => (
                            <li key={idx} className="leading-relaxed">{note}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Main Market Turnover Component
export default function MarketTurnover() {
    const [turnoverData, setTurnoverData] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchTurnoverData = async () => {
        try {
            const res = await api.get('/api/turnover/summary');
            setTurnoverData(res.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch turnover:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailedData = async () => {
        try {
            const res = await api.get('/api/turnover/detailed');
            setDetailedData(res.data);
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch detailed turnover:', error);
        }
    };

    useEffect(() => {
        fetchTurnoverData();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchTurnoverData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 bg-white/10 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-yellow-400" size={24} />
                        <div>
                            <h3 className="text-white font-bold text-lg">Market Turnover</h3>
                            <p className="text-indigo-200 text-xs">As on {turnoverData?.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchTurnoverData}
                            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={fetchDetailedData}
                            className="bg-yellow-500 hover:bg-yellow-400 text-indigo-900 px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1"
                        >
                            View More <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-indigo-800/50 text-xs text-indigo-200 uppercase">
                                <th className="px-4 py-3 text-left font-semibold">Products</th>
                                <th className="px-4 py-3 text-right font-semibold">Volume<br /><span className="text-[10px] normal-case">(Shares/Contracts)</span></th>
                                <th className="px-4 py-3 text-right font-semibold">Value<br /><span className="text-[10px] normal-case">(₹ Crores)</span></th>
                                <th className="px-4 py-3 text-right font-semibold">Open Interest<br /><span className="text-[10px] normal-case">(Contracts)</span></th>
                                <th className="px-4 py-3 text-right font-semibold">Updated At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {turnoverData?.products.map((product, idx) => (
                                <tr key={idx} className="text-white hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">{product.name}</td>
                                    <td className="px-4 py-3 text-right font-mono">{product.volumeFormatted}</td>
                                    <td className="px-4 py-3 text-right font-mono text-yellow-300">{product.valueFormatted}</td>
                                    <td className="px-4 py-3 text-right font-mono text-indigo-200">{product.openInterestFormatted}</td>
                                    <td className="px-4 py-3 text-right text-indigo-300 text-sm">{product.updatedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-yellow-500/90 text-indigo-900 font-bold">
                                <td className="px-4 py-3">Total</td>
                                <td className="px-4 py-3 text-right font-mono">{turnoverData?.totals.volumeFormatted}</td>
                                <td className="px-4 py-3 text-right font-mono">{turnoverData?.totals.valueFormatted}</td>
                                <td className="px-4 py-3 text-right font-mono">{turnoverData?.totals.openInterestFormatted}</td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <Clock size={14} className="inline mr-1" />
                                    {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Market Status Indicator */}
                <div className="px-6 py-3 bg-indigo-950/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${turnoverData?.isMarketOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        <span className="text-indigo-300">
                            Market {turnoverData?.isMarketOpen ? 'Open' : 'Closed'}
                        </span>
                    </div>
                    <span className="text-indigo-400">Auto-refreshes every 60s during market hours</span>
                </div>
            </div>

            {/* Detail Modal */}
            <TurnoverDetailModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                detailedData={detailedData}
            />
        </>
    );
}
