import React from 'react';
import { BarChart2, PieChart, Activity, DollarSign, ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';
import StockChart from './StockChart';
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
                // We need to import axios or pass it, but assuming standard fetch or axios is available in scope or we import it.
                // Since this component doesn't have axios imported, let's use fetch which is native.
                const res = await fetch('https://india-trade-backend.onrender.com/api/market/breadth');
                const data = await res.json();
                if (data.traded) setStats(data);
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

            {/* SECTION 2: DENSITY ROW (Stats + FII/DII + Heatmap) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Market Stats Strip (Vertical now for better fit or Keep Horizontal block) */}
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

                {/* TOP NEWS (Replaced old static events) */}
                <div className="groww-card">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                        <TrendingUp size={16} /> Latest News
                    </h4>
                    <div className="space-y-0 divide-y divide-gray-100 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                        {news && news.length > 0 ? news.map((item, i) => (
                            <NewsItem key={i} title={item.title} link={item.link} publisher={item.publisher} time={item.providerPublishTime} thumbnail={item.thumbnail} />
                        )) : (
                            <div className="text-gray-400 text-sm">Loading market news...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECTION 3: BOTTOM ROW (IPO, Events, Learn, Movers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <IPOWatch />
                <EventsCalendar />
                <MarketMovers />
                <LearningCard />
            </div>

        </div>
    );
}

function NewsItem({ title, link, publisher, time, thumbnail }) {
    const date = new Date(time * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const imgUrl = thumbnail?.resolutions?.[0]?.url;

    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="group flex gap-5 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all px-2 cursor-pointer">
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-wider text-groww-primary uppercase bg-blue-50 px-2 py-0.5 rounded-sm">
                        Markets
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        {Math.floor(Math.random() * 5 + 2)} MIN READ
                    </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-groww-primary transition-colors font-serif tracking-tight">
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 font-medium">
                    <span className="text-gray-800 uppercase">{publisher}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{date}</span>
                </div>
            </div>

            {imgUrl ? (
                <div className="w-32 h-24 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
            ) : (
                <div className="w-32 h-24 shrink-0 rounded-md bg-gray-100 flex items-center justify-center text-gray-300">
                    <TrendingUp size={24} />
                </div>
            )}
        </a>
    )
}
