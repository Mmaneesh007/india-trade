import React from 'react';
import { TrendingUp, ShieldCheck, Clock, Layers } from 'lucide-react';

export default function MutualFunds() {
    const categories = [
        { icon: <TrendingUp className="text-groww-primary" />, title: 'High Return', desc: 'Small cap funds' },
        { icon: <ShieldCheck className="text-blue-500" />, title: 'Tax Saving', desc: 'ELSS funds' },
        { icon: <Clock className="text-orange-500" />, title: 'Long Term', desc: 'Be wealthy' },
        { icon: <Layers className="text-purple-500" />, title: 'Large Cap', desc: 'Safe bets' },
    ];

    const popularFunds = [
        { name: "Quant Small Cap Fund Direct Plan", return3y: "45.2%", rating: 5, risk: "Very High" },
        { name: "Nippon India Small Cap Fund", return3y: "38.1%", rating: 5, risk: "Very High" },
        { name: "Parag Parikh Flexi Cap Fund", return3y: "22.5%", rating: 5, risk: "Moderate" },
        { name: "HDFC Balaced Advantage Fund", return3y: "18.4%", rating: 4, risk: "High" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

            {/* Hero Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Collections</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                        <div key={i} className="groww-card hover:shadow-md cursor-pointer transition-shadow flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                {cat.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{cat.title}</h3>
                                <p className="text-xs text-groww-text-muted">{cat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Funds List */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Popular Funds</h2>
                    <button className="text-groww-primary font-medium hover:underline">View All</button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Fund Name</th>
                                <th className="px-6 py-4">Risk</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">3Y Returns</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {popularFunds.map((fund, i) => (
                                <tr key={i} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 text-xs">
                                                {fund.name.substring(0, 1)}
                                            </div>
                                            <span className="font-medium text-gray-900">{fund.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{fund.risk}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                                            {fund.rating} ★
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-groww-primary">
                                        {fund.return3y}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
}
