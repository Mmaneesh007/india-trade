import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, TrendingDown, Plus, Minus, X } from 'lucide-react';
import api from '../api';

export default function Watchlist({ userId, onStockClick }) {
    const [watchlist, setWatchlist] = useState([]);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchWatchlist();
        }
    }, [userId]);

    const fetchWatchlist = async () => {
        try {
            const res = await api.get(`/api/watchlist/${userId}`);
            setWatchlist(res.data);

            // Fetch current prices for all watchlisted stocks
            res.data.forEach(item => {
                fetchStockPrice(item.symbol);
            });
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStockPrice = async (symbol) => {
        try {
            const res = await api.get(`/api/quotes/latest/${symbol}`);
            setStockData(prev => ({
                ...prev,
                [symbol]: res.data
            }));
        } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error);
        }
    };

    const removeFromWatchlist = async (symbol) => {
        try {
            await api.delete(`/api/watchlist/${userId}/${symbol}`);
            setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
            setStockData(prev => {
                const newData = { ...prev };
                delete newData[symbol];
                return newData;
            });
        } catch (error) {
            console.error('Failed to remove from watchlist:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center">
                    <Star size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your Watchlist is Empty</h3>
                    <p className="text-gray-500 mb-6">
                        Add stocks to your watchlist to track their performance
                    </p>
                    <button
                        onClick={() => onStockClick && onStockClick('stocks')}
                        className="btn-primary"
                    >
                        Browse Stocks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Watchlist</h2>
                <p className="text-gray-500">Tracking {watchlist.length} stocks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchlist.map((item) => {
                    const data = stockData[item.symbol];
                    const isPositive = data?.change >= 0;

                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow relative group"
                        >
                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromWatchlist(item.symbol)}
                                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from watchlist"
                            >
                                <X size={18} />
                            </button>

                            {/* Stock Info */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                        <h3 className="font-bold text-gray-900">{item.symbol}</h3>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Added {new Date(item.added_at).toLocaleDateString('en-IN')}
                                    </div>
                                </div>
                            </div>

                            {/* Price Data */}
                            {data ? (
                                <>
                                    <div className="mb-4">
                                        <div className="text-3xl font-bold text-gray-900 mb-1">
                                            ₹{data.price?.toFixed(2)}
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-groww-primary' : 'text-groww-red'}`}>
                                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            <span>{data.change?.toFixed(2)} ({data.changePercent?.toFixed(2)}%)</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onStockClick && onStockClick('stocks', item.symbol)}
                                            className="flex-1 py-2 px-3 bg-groww-primary hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Plus size={16} />
                                            Buy
                                        </button>
                                        <button
                                            onClick={() => onStockClick && onStockClick('stocks', item.symbol)}
                                            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            View
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
