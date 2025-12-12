import React from 'react';
import { BarChart2, PieChart, Activity, DollarSign, ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';
import StockChart from './StockChart';
import api from '../api';
import {
    SectorPerformance,
    GlobalMarkets,
    FIIDIIStats,
    MarketHeatmap,
    IPOWatch,
    EventsCalendar,
    LearningCard,
    MarketMovers
} from './ProFeatures';

export default function MarketOverview({ niftyData, niftyCandles, news }) {
    // Real Market Statistics
    const [stats, setStats] = React.useState({
        traded: '-',
        advances: '-',
        declines: '-',
        unchanged: '-',
        high52: '-',
        low52: '-'
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/market/breadth');
                if (res.data.traded) setStats(res.data);
            } catch (e) {
                console.error("Stats fetch failed", e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 mb-8 text-gray-800">

            {/* SECTION 1: MAIN DASHBOARD GRID (Bento Style) */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* COL 1 & 2: MAIN CHART (Wide) */}
                <div className="xl:col-span-2 groww-card p-0 overflow-hidden flex flex-col h-[400px]">
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

                {/* COL 3: SECTOR PERFORMANCE */}
                <div className="xl:col-span-1">
                    <SectorPerformance />
                </div>

                {/* COL 4: GLOBAL MARKETS */}
                <div className="xl:col-span-1">
                    <GlobalMarkets />
                </div>
            </div>

            {/* SECTION 2: DENSITY ROW ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Market Stats Strip */}
                <div className="groww-card flex flex-col justify-between">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" /> Market Breadth
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-xl font-bold text-green-600">{stats.advances}</div>
                            <div className="text-xs text-gray-500">Advances</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                            <div className="text-xl font-bold text-red-500">{stats.declines}</div>
                            <div className="text-xs text-gray-500">Declines</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xl font-bold text-gray-600">{stats.unchanged}</div>
                            <div className="text-xs text-gray-500">Unchanged</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-xl font-bold text-blue-600">{stats.high52}</div>
                            <div className="text-xs text-gray-500">52W High</div>
                        </div>
                    </div>
                </div>

                <FIIDIIStats />

                <MarketHeatmap />

                {/* MOVED NEWS OUT OF HERE, REPLACING WITH MARKET MOVERS TO FILL GAP */}
                <MarketMovers />
            </div>

            {/* News Section Removed - Moved to dedicated "Stocks News" Tab */}

            {/* SECTION 4: BOTTOM ROW (IPO, Events, Learn) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IPOWatch />
                <EventsCalendar />
                <LearningCard />
            </div>

        </div>
    );
}

function NewsCard({ title, link, publisher, time, thumbnail }) {
    const date = new Date(time * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const imgUrl = thumbnail?.resolutions?.[0]?.url;

    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="group bg-white flex flex-col h-full rounded-xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            {/* Image Section */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                        <TrendingUp size={40} />
                    </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-800 rounded-sm">
                    Stocks & Bonds
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3 font-serif line-clamp-3 group-hover:text-groww-primary transition-colors">
                    {title}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 bg-white">
                    <span className="font-bold text-gray-700 uppercase tracking-wide">{publisher}</span>
                    <span>{date}</span>
                </div>
            </div>
        </a>
    )
}
