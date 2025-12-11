import React from 'react';
import { BarChart2, PieChart, Activity, DollarSign, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import StockChart from './StockChart';

export default function MarketOverview({ niftyData, niftyCandles }) {
    // Mock Data for "Market Statistics" (Simulating NSE Breadth)
    const stats = {
        traded: '3,206',
        advances: 1915,
        declines: 1173,
        unchanged: 118,
        high52: 28,
        low52: 105
    };

    const turnover = [
        { seg: 'Equity', vol: '393.58 Cr', val: '70,300.78', oi: '-' },
        { seg: 'Derivatives', vol: '7.77 Cr', val: '1,36,223.39', oi: '2.10 Cr' },
        { seg: 'Currency', vol: '3.14 L', val: '2,838.93', oi: '15.84 L' },
    ];

    return (
        <div className="space-y-6 mb-8">

            {/* Top Section: Chart + Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart (Nifty 50) */}
                <div className="lg:col-span-2 groww-card p-0 overflow-hidden flex flex-col h-[400px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-6 bg-groww-primary rounded-sm"></span>
                                NIFTY 50
                            </h3>
                            <div className="text-xs text-gray-500 mt-1">Live from NSE</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-xl text-gray-900">
                                {niftyData?.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-sm font-medium ${niftyData?.change >= 0 ? 'text-groww-primary' : 'text-groww-red'}`}>
                                {niftyData?.change >= 0 ? '+' : ''}{niftyData?.change?.toFixed(2)} ({niftyData?.changePercent?.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative">
                        <StockChart data={niftyCandles} />
                    </div>
                </div>

                {/* Market Pulse / Announcements Sidebar */}
                <div className="space-y-6">
                    <div className="groww-card bg-gradient-to-br from-[#1d1d42] to-[#121230] text-white border-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2 text-yellow-400">Market Status</h3>
                            <div className="flex items-center gap-2 text-sm mb-6">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Open • Pre-Close Session
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                    <div className="text-xs text-gray-300">VIX</div>
                                    <div className="font-mono font-bold text-red-300">13.45</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                    <div className="text-xs text-gray-300">USD/INR</div>
                                    <div className="font-mono font-bold text-green-300">83.12</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    </div>

                    {/* Corporate Actions / Events */}
                    <div className="groww-card">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Announcements</h4>
                        <div className="space-y-3">
                            <EventItem title="HDFC Bank" desc="Board Meeting on Dec 15" date="Today" />
                            <EventItem title="TCS" desc="Dividend Ex-Date" date="Tomorrow" />
                            <EventItem title="Reliance" desc="AGM Scheduled" date="20 Dec" />
                        </div>
                    </div>
                </div>
            </div>

            {/* NSE STYLE STATISTICS STRIP */}
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity size={20} className="text-groww-blue" /> Market Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBox label="Stocks Traded" value={stats.traded} color="border-l-4 border-blue-500" />
                <StatBox label="Advances" value={stats.advances} sub="(Nifty 500)" color="border-l-4 border-groww-primary" text="text-groww-primary" icon={<ArrowUp size={16} />} />
                <StatBox label="Declines" value={stats.declines} sub="(Nifty 500)" color="border-l-4 border-groww-red" text="text-groww-red" icon={<ArrowDown size={16} />} />
                <StatBox label="Unchanged" value={stats.unchanged} color="border-l-4 border-gray-400" text="text-gray-500" icon={<Minus size={16} />} />
            </div>

            {/* TURNOVER TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 groww-card p-0 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Market Turnover</h3>
                        <span className="text-xs text-gray-500">All Segments (Cr)</span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Segment</th>
                                <th className="px-6 py-3 font-medium text-right">Volume</th>
                                <th className="px-6 py-3 font-medium text-right">Value (Cr)</th>
                                <th className="px-6 py-3 font-medium text-right">Open Interest</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {turnover.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{row.seg}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{row.vol}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{row.val}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{row.oi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* High/Low Widget */}
                <div className="groww-card flex flex-col justify-center gap-4">
                    <h3 className="font-bold text-gray-800 text-center mb-2">52 Week High / Low</h3>
                    <div className="flex justify-between items-center px-4">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full border-4 border-groww-primary flex items-center justify-center text-xl font-bold text-groww-primary mb-2">
                                {stats.high52}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">New Highs</div>
                        </div>
                        <div className="h-10 w-[1px] bg-gray-200"></div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full border-4 border-groww-red flex items-center justify-center text-xl font-bold text-groww-red mb-2">
                                {stats.low52}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">New Lows</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, sub, color, text = "text-gray-900", icon }) {
    return (
        <div className={`groww-card py-4 ${color}`}>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{label}</div>
            <div className={`flex items-center gap-2 text-2xl font-bold ${text}`}>
                {icon}
                {value}
            </div>
            {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
        </div>
    )
}

function EventItem({ title, desc, date }) {
    return (
        <div className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded flex flex-col items-center justify-center text-xs font-bold leading-tight">
                <span>{date.split(' ')[0]}</span>
                <span className="text-[8px]">{date.split(' ')[1] || ''}</span>
            </div>
            <div>
                <div className="text-sm font-bold text-gray-800">{title}</div>
                <div className="text-xs text-gray-500">{desc}</div>
            </div>
        </div>
    )
}
