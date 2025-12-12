import React from 'react';
import { ArrowUp, ArrowDown, ExternalLink, BookOpen, Calendar, Globe, TrendingUp, BarChart3, Activity } from 'lucide-react';
import api from '../api';

// --- SUB-COMPONENTS ---

// 1. Sector Performance
export const SectorPerformance = () => {
    const [sectors, setSectors] = React.useState([]);

    React.useEffect(() => {
        api.get('/api/market/sectors')
            .then(res => setSectors(res.data))
            .catch(e => console.error(e));
    }, []);

    if (sectors.length === 0) return (
        <div className="groww-card animate-pulse">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-groww-primary" /> Sector Performance
            </h3>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-6 bg-gray-100 rounded"></div>)}
            </div>
        </div>
    );

    return (
        <div className="groww-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-groww-primary" /> Sector Performance
            </h3>
            <div className="space-y-3">
                {sectors.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium truncate w-[40%]">{s.name}</span>
                        <div className="flex items-center gap-3 w-[60%] justify-end">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${s.isPos ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.abs(parseFloat(s.value)) * 20 + 20}%` }}
                                ></div>
                            </div>
                            <span className={`w-12 text-right font-bold ${s.isPos ? 'text-green-600' : 'text-red-500'}`}>
                                {s.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 2. Global Markets
export const GlobalMarkets = () => {
    const [markets, setMarkets] = React.useState([]);

    React.useEffect(() => {
        api.get('/api/market/global')
            .then(res => setMarkets(res.data))
            .catch(e => console.error(e));
    }, []);

    if (markets.length === 0) return (
        <div className="groww-card animate-pulse">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Global Indices
            </h3>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-100 rounded"></div>)}
            </div>
        </div>
    );

    return (
        <div className="groww-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Global Indices
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {markets.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors border-b border-gray-50 last:border-0">
                        <span className="font-bold text-gray-700">{m.name}</span>
                        <div className="text-right">
                            <div className="font-medium text-gray-900">{m.value}</div>
                            <div className={`text-xs ${m.isPos ? 'text-green-600' : 'text-red-500'}`}>{m.change}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. FII / DII Activity
export const FIIDIIStats = () => {
    return (
        <div className="groww-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-purple-500" /> FII / DII Activity
            </h3>
            <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">Foreign Institutions</div>
                    <div className="flex justify-between items-end">
                        <div className="font-bold text-gray-800">FII (Cash)</div>
                        <div className="font-bold text-red-500">- ₹1,240 Cr</div>
                    </div>
                    <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 w-[60%]"></div>
                    </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">Domestic Institutions</div>
                    <div className="flex justify-between items-end">
                        <div className="font-bold text-gray-800">DII (Cash)</div>
                        <div className="font-bold text-green-600">+ ₹850 Cr</div>
                    </div>
                    <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[40%]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Events Calendar
export const EventsCalendar = () => {
    const events = [
        { title: "TCS Earnings", date: "Today", type: "Result" },
        { title: "Infosys AGM", date: "Tomorrow", type: "Meeting" },
        { title: "Reliance Dividend", date: "15 Dec", type: "Dividend" },
        { title: "HDFC Bank Split", date: "20 Dec", type: "Corp Action" },
    ];
    return (
        <div className="groww-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" /> Upcoming Events
            </h3>
            <div className="space-y-3">
                {events.map((e, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex flex-col items-center justify-center text-xs font-bold leading-none shrink-0">
                            <span>{e.date.split(' ')[0]}</span>
                            <span className="text-[9px] mt-0.5">{e.date.split(' ')[1] || ''}</span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">{e.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5 px-1.5 py-0.5 bg-gray-100 inline-block rounded">{e.type}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Market Heatmap (Mini)
export const MarketHeatmap = () => {
    // Simulating a mini tree map
    const boxes = [
        { s: 'RELIANCE', v: 2.5, c: 'bg-green-600' },
        { s: 'TCS', v: 1.2, c: 'bg-green-500' },
        { s: 'INFY', v: -0.8, c: 'bg-red-400' },
        { s: 'HDFCBANK', v: -1.5, c: 'bg-red-500' },
        { s: 'ICICI', v: 1.8, c: 'bg-green-500' },
        { s: 'SBIN', v: 0.5, c: 'bg-green-400' },
        { s: 'ITC', v: -0.2, c: 'bg-red-300' },
        { s: 'LT', v: 1.1, c: 'bg-green-500' },
        { s: 'AXIS', v: -1.1, c: 'bg-red-500' },
    ];

    return (
        <div className="groww-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-teal-500" /> Heatmap (Nifty 50)
            </h3>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 h-48">
                {boxes.map((b, i) => (
                    <div key={i} className={`${b.c} rounded-sm flex items-center justify-center p-1 text-center text-white cursor-pointer hover:opacity-90 transition-opacity`}>
                        <div>
                            <div className="text-[10px] font-bold truncate w-full">{b.s}</div>
                            <div className="text-[9px]">{b.v}%</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 6. IPO Watch
export const IPOWatch = () => {
    return (
        <div className="groww-card bg-indigo-50 border-indigo-100">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" /> IPO Watch
                </h3>
                <span className="bg-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Live</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-100 mb-3 shadow-sm">
                <div className="flex justify-between mb-1">
                    <span className="font-bold text-gray-800">Tata Tech</span>
                    <span className="text-green-600 font-bold">+160%</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">Sub: 50.4x • GMP: ₹450</div>
                <button className="w-full bg-indigo-600 text-white text-xs font-bold py-1.5 rounded hover:bg-indigo-700">Apply Now</button>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm opacity-60">
                <div className="flex justify-between mb-1">
                    <span className="font-bold text-gray-800">Gandhar Oil</span>
                    <span className="text-gray-400 font-bold">Closed</span>
                </div>
                <div className="text-xs text-gray-500">Allotment Out</div>
            </div>
        </div>
    );
};

// 7. Quick Learning
export const LearningCard = () => {
    const topics = [
        { title: 'Option Greeks', desc: 'Understanding Delta, Gamma, Theta is key to mastering F&O.', url: 'https://www.investopedia.com/trading/getting-to-know-the-greeks/' },
        { title: 'RSI Indicator', desc: 'Relative Strength Index helps identify overbought or oversold stocks.', url: 'https://www.investopedia.com/terms/r/rsi.asp' },
        { title: 'P/E Ratio', desc: 'Price-to-Earnings ratio determines if a stock is overvalued.', url: 'https://www.investopedia.com/terms/p/price-earningsratio.asp' },
        { title: 'Candlestick Patterns', desc: 'Hammer, Doji, and Engulfing patterns signal market reversals.', url: 'https://www.investopedia.com/trading/candlestick-charting-what-is-it/' },
        { title: 'Support & Resistance', desc: 'Key levels where price tends to bounce or break through.', url: 'https://www.investopedia.com/trading/support-and-resistance-basics/' }
    ];

    const [index, setIndex] = React.useState(0);

    const nextTopic = () => setIndex((prev) => (prev + 1) % topics.length);

    React.useEffect(() => {
        const interval = setInterval(nextTopic, 8000); // Auto rotate every 8s
        return () => clearInterval(interval);
    }, []);

    const current = topics[index];

    return (
        <div className="groww-card bg-orange-50 border-orange-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-orange-900 flex items-center gap-2">
                        <BookOpen size={18} className="text-orange-600" /> Learn & Grow
                    </h3>
                    <button onClick={nextTopic} className="text-orange-400 hover:text-orange-700 transition-colors p-1">
                        <TrendingUp size={14} />
                    </button>
                </div>

                <div className="min-h-[60px]">
                    <h4 className="font-bold text-orange-800 text-sm mb-1">{current.title}</h4>
                    <p className="text-xs text-orange-700 leading-relaxed">
                        {current.desc}
                    </p>
                </div>
            </div>

            <button
                onClick={() => window.open(current.url, '_blank')}
                className="mt-3 text-orange-700 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all bg-white/50 w-fit px-3 py-1.5 rounded-full hover:bg-white"
            >
                Read Chapter <ExternalLink size={12} />
            </button>
        </div>
    );
};

// 8. Top Gainers/Losers Mini
export const MarketMovers = () => {
    const gainers = [
        { s: 'Adani Ent', v: '+4.5%' },
        { s: 'BPCL', v: '+3.2%' },
        { s: 'Coal India', v: '+2.8%' },
    ];
    const losers = [
        { s: 'Infosys', v: '-2.1%' },
        { s: 'Wipro', v: '-1.8%' },
    ];

    return (
        <div className="groww-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-groww-primary" /> Top Movers
            </h3>
            <div className="space-y-4">
                <div>
                    <div className="text-xs font-bold text-green-600 uppercase mb-2">Gainers</div>
                    <div className="space-y-2">
                        {gainers.map((g, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">{g.s}</span>
                                <span className="font-bold text-green-600">{g.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-xs font-bold text-red-500 uppercase mb-2">Losers</div>
                    <div className="space-y-2">
                        {losers.map((g, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">{g.s}</span>
                                <span className="font-bold text-red-500">{g.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
