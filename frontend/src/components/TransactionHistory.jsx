import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import api from '../api';

export default function TransactionHistory({ userId }) {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, buy, sell

    useEffect(() => {
        if (userId) {
            fetchTransactions();
            fetchSummary();
        }
    }, [userId]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get(`/api/transactions/${userId}`);
            setTransactions(res.data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await api.get(`/api/transactions/${userId}/summary`);
            setSummary(res.data);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Time', 'Symbol', 'Type', 'Quantity', 'Price', 'Total'];
        const rows = transactions.map(txn => {
            const date = new Date(txn.timestamp);
            return [
                date.toLocaleDateString('en-IN'),
                date.toLocaleTimeString('en-IN'),
                txn.symbol,
                txn.type,
                txn.quantity,
                `₹${txn.price.toFixed(2)}`,
                `₹${(txn.quantity * txn.price).toFixed(2)}`
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredTransactions = transactions.filter(txn => {
        if (filter === 'all') return true;
        return txn.type.toLowerCase() === filter;
    });

    const totalPnL = summary.reduce((sum, stock) => sum + stock.realizedPnL, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total P&L</p>
                            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-groww-primary' : 'text-groww-red'}`}>
                                ₹{totalPnL.toFixed(2)}
                            </p>
                        </div>
                        {totalPnL >= 0 ? (
                            <TrendingUp className="text-groww-primary" size={32} />
                        ) : (
                            <TrendingDown className="text-groww-red" size={32} />
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Trades</p>
                            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                        </div>
                        <Calendar className="text-blue-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Stocks Traded</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.length}</p>
                        </div>
                        <DollarSign className="text-purple-500" size={32} />
                    </div>
                </div>
            </div>

            {/* P&L Summary Table */}
            {summary.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">P&L Summary by Stock</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Buy</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Sell</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trades</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {summary.map((stock, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{stock.symbol}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">₹{stock.avgBuyPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {stock.sellCount > 0 ? `₹${stock.avgSellPrice.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {stock.buyCount} / {stock.sellCount}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-semibold ${stock.realizedPnL >= 0 ? 'text-groww-primary' : 'text-groww-red'}`}>
                                            ₹{stock.realizedPnL.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-gray-900">Transaction History</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('buy')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'buy' ? 'bg-groww-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setFilter('sell')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'sell' ? 'bg-groww-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Sell
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <p>No transactions yet. Start trading to see your history here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTransactions.map((txn, idx) => {
                                    const date = new Date(txn.timestamp);
                                    const total = txn.quantity * txn.price;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{date.toLocaleDateString('en-IN')}</div>
                                                <div className="text-xs text-gray-400">{date.toLocaleTimeString('en-IN')}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.symbol}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{txn.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">₹{txn.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{total.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
