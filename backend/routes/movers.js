import express from 'express';
import axios from 'axios';

const router = express.Router();

// RapidAPI configuration
const RAPIDAPI_KEY = '2bab4cabb3msh75be9e6b1e5f20dp12f8f2jsn5b08da545c70';
const RAPIDAPI_HOST = 'indian-stock-exchange-api2.p.rapidapi.com';

// Generate realistic market mover data
const generateMoversData = (type = 'gainers', count = 20, indexFilter = 'all') => {
    const companies = [
        { symbol: 'HINDZINC.NS', name: 'Hindustan Zinc', logo: 'HZ', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'JSWENERGY.NS', name: 'JSW Energy', logo: 'JSW', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corporation', logo: 'BP', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', logo: 'HI', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'TATASTEEL.NS', name: 'Tata Steel', logo: 'TS', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'ADANIPOWER.NS', name: 'Adani Power', logo: 'AP', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'VEDL.NS', name: 'Vedanta', logo: 'VE', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'NAUKRI.NS', name: 'Info Edge (India)', logo: 'IE', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'ZOMATO.NS', name: 'Eternal (Zomato)', logo: 'ZO', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements', logo: 'AC', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'COALINDIA.NS', name: 'Coal India', logo: 'CI', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'ONGC.NS', name: 'ONGC', logo: 'ON', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'NTPC.NS', name: 'NTPC', logo: 'NT', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'POWERGRID.NS', name: 'Power Grid Corp', logo: 'PG', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries', logo: 'RI', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'TCS.NS', name: 'Tata Consultancy Services', logo: 'TC', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'INFY.NS', name: 'Infosys', logo: 'IN', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', logo: 'HB', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', logo: 'IB', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'SBIN.NS', name: 'State Bank of India', logo: 'SB', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', logo: 'BF', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'LT.NS', name: 'Larsen & Toubro', logo: 'LT', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', logo: 'MS', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'TITAN.NS', name: 'Titan Company', logo: 'TI', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', logo: 'AP', indices: ['NIFTY50', 'NIFTY100', 'NIFTY200'] },
        { symbol: 'DMART.NS', name: 'Avenue Supermarts', logo: 'DM', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'HAL.NS', name: 'Hindustan Aeronautics', logo: 'HA', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'DLF.NS', name: 'DLF Limited', logo: 'DL', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'LICI.NS', name: 'LIC India', logo: 'LI', indices: ['NIFTY100', 'NIFTY200'] },
        { symbol: 'VBL.NS', name: 'Varun Beverages', logo: 'VB', indices: ['NIFTY100', 'NIFTY200'] },
    ];

    let filteredCompanies = companies;

    // Filter by index if specified (case insensitive)
    if (indexFilter && indexFilter !== 'all') {
        const normalizedFilter = indexFilter.toUpperCase().replace(/\s+/g, '');
        filteredCompanies = companies.filter(c => c.indices.some(i => i.replace(/\s+/g, '') === normalizedFilter));
    }

    // Fallback if filter results in too few companies
    if (filteredCompanies.length < 5) filteredCompanies = companies;

    const shuffled = [...filteredCompanies].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map((company, idx) => {
        const basePrice = 100 + Math.random() * 2000;
        let changePercent, change;

        if (type === 'gainers') {
            changePercent = 2 + Math.random() * 8; // 2-10% gain
        } else if (type === 'losers') {
            changePercent = -(2 + Math.random() * 8); // 2-10% loss
        } else {
            changePercent = (Math.random() - 0.5) * 10; // -5 to +5%
        }

        change = (basePrice * changePercent / 100);
        const volume = Math.floor(1000000 + Math.random() * 50000000);

        // Generate mini chart data (24 points for intraday)
        const chartData = [];
        let chartPrice = basePrice - change;
        for (let i = 0; i < 24; i++) {
            chartPrice += (change / 24) + (Math.random() - 0.5) * (basePrice * 0.005);
            chartData.push(chartPrice);
        }

        return {
            symbol: company.symbol,
            name: company.name,
            logo: company.logo,
            price: parseFloat(basePrice.toFixed(2)),
            priceNSE: parseFloat(basePrice.toFixed(2)),
            priceBSE: parseFloat((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: volume,
            volumeFormatted: volume >= 10000000 ? (volume / 10000000).toFixed(2) + ' Cr' : (volume / 100000).toFixed(2) + ' L',
            chartData,
            inNews: Math.random() > 0.7,
            week52High: parseFloat((basePrice * 1.3).toFixed(2)),
            week52Low: parseFloat((basePrice * 0.7).toFixed(2)),
            marketCap: (Math.random() * 500000 + 10000).toFixed(0) + ' Cr',
            pe: parseFloat((10 + Math.random() * 40).toFixed(2)),
        };
    });
};

// Cache for trending data (refresh every 5 minutes)
let trendingCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch trending stocks from RapidAPI
const fetchTrendingStocks = async () => {
    const now = Date.now();

    // Return cached data if still valid
    if (trendingCache.data && (now - trendingCache.timestamp) < CACHE_DURATION) {
        return trendingCache.data;
    }

    try {
        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/trending`,
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);

        if (response.data?.trending_stocks) {
            const transformStock = (stock, isGainer) => {
                const price = parseFloat(stock.price) || 0;
                const changePercent = parseFloat(stock.percent_change) || 0;
                const volume = parseInt(stock.volume?.replace(/,/g, '')) || 0;

                // Generate mini chart based on trend
                const chartData = [];
                let chartPrice = price - (price * changePercent / 100);
                for (let i = 0; i < 24; i++) {
                    const trend = isGainer ? 1 : -1;
                    chartPrice += (price * changePercent / 100 / 24) * trend + (Math.random() - 0.5) * (price * 0.002);
                    chartData.push(Math.max(0, chartPrice));
                }

                return {
                    symbol: stock.ticker_id + '.NS',
                    name: stock.company_name,
                    logo: stock.company_name?.substring(0, 2).toUpperCase() || 'ST',
                    price: price,
                    priceNSE: price,
                    priceBSE: price + (Math.random() - 0.5) * 2,
                    change: parseFloat(stock.net_change) || 0,
                    changePercent: changePercent,
                    volume: volume,
                    volumeFormatted: volume >= 10000000 ? (volume / 10000000).toFixed(2) + ' Cr' : volume >= 100000 ? (volume / 100000).toFixed(2) + ' L' : volume.toLocaleString(),
                    chartData,
                    inNews: Math.random() > 0.6,
                    week52High: parseFloat(stock.year_high) || price * 1.3,
                    week52Low: parseFloat(stock.year_low) || price * 0.7,
                    high: parseFloat(stock.high) || 0,
                    low: parseFloat(stock.low) || 0,
                    open: parseFloat(stock.open) || 0,
                    close: parseFloat(stock.close) || 0,
                    bid: parseFloat(stock.bid) || 0,
                    ask: parseFloat(stock.ask) || 0,
                    averagePrice: parseFloat(stock.average_price) || 0,
                    averageVolume: parseInt(stock.average_volume?.replace(/,/g, '')) || 0,
                    deviation: stock.deviation || 'N/A',
                    overallRating: stock.overall_rating || 'N/A',
                    shortTermTrends: stock.short_term_trends || 'N/A',
                    longTermTrends: stock.long_term_trends || 'N/A',
                    exchangeType: stock.exchange_type || 'NSE',
                    lotSize: parseInt(stock.lot_size) || 1,
                    marketCap: 'N/A',
                    pe: 'N/A',
                    date: stock.date,
                    time: stock.time,
                };
            };

            const result = {
                gainers: (response.data.trending_stocks.top_gainers || []).map(s => transformStock(s, true)),
                losers: (response.data.trending_stocks.top_losers || []).map(s => transformStock(s, false)),
            };

            // Update cache
            trendingCache = { data: result, timestamp: now };
            return result;
        }
    } catch (error) {
        console.error('Trending API error:', error.message);
    }

    return null;
};

// Get trending stocks (both gainers and losers)
router.get('/trending', async (req, res) => {
    try {
        const trendingData = await fetchTrendingStocks();

        if (trendingData) {
            res.json({
                top_gainers: trendingData.gainers,
                top_losers: trendingData.losers,
                lastUpdated: new Date().toISOString(),
                isRealTime: true
            });
        } else {
            // Fallback to mock data
            res.json({
                top_gainers: generateMoversData('gainers', 6),
                top_losers: generateMoversData('losers', 6),
                lastUpdated: new Date().toISOString(),
                isRealTime: false
            });
        }
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending stocks' });
    }
});

// Get top gainers (uses trending API when available)
router.get('/gainers', async (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const index = req.query.index; // Get index filter from query

    // Note: Our Realtime API doesn't support index filtering easily, 
    // so we will prioritize mock data if a specific index filter is requested
    // OR if real data fetch fails.

    if (!index) {
        try {
            const trendingData = await fetchTrendingStocks();
            if (trendingData && trendingData.gainers.length > 0) {
                // Combine real data with mock data to reach requested count
                const realData = trendingData.gainers;
                const mockData = generateMoversData('gainers', Math.max(0, count - realData.length));
                const combined = [...realData, ...mockData].slice(0, count);
                return res.json(combined.sort((a, b) => b.changePercent - a.changePercent));
            }
        } catch (e) {
            console.log('Using mock gainers data');
        }
    }

    const data = generateMoversData('gainers', count, index);
    res.json(data.sort((a, b) => b.changePercent - a.changePercent));
});

// Get top losers
router.get('/losers', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const index = req.query.index;
    const data = generateMoversData('losers', count, index);
    res.json(data.sort((a, b) => a.changePercent - b.changePercent));
});

// Get volume shockers
router.get('/volume-shockers', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const index = req.query.index;
    const data = generateMoversData('volume', count, index);
    res.json(data.sort((a, b) => b.volume - a.volume));
});

// Get 52 week high
router.get('/52w-high', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const index = req.query.index;
    const data = generateMoversData('gainers', count, index).map(item => ({
        ...item,
        price: item.week52High,
        changePercent: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    }));
    res.json(data);
});

// Get 52 week low
router.get('/52w-low', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const index = req.query.index;
    const data = generateMoversData('losers', count, index).map(item => ({
        ...item,
        price: item.week52Low,
        changePercent: parseFloat((-(Math.random() * 5 + 1)).toFixed(2)),
    }));
    res.json(data);
});

// Get stock details for trading
router.get('/stock/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;

        // Try to get real data from RapidAPI
        try {
            const options = {
                method: 'GET',
                url: `https://${RAPIDAPI_HOST}/stock_data`,
                params: { stock_name: symbol.replace('.NS', '').replace('.BO', '') },
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': RAPIDAPI_HOST
                }
            };
            const response = await axios.request(options);
            if (response.data) {
                return res.json({
                    ...response.data,
                    symbol,
                    priceNSE: response.data.price || 500,
                    priceBSE: (response.data.price || 500) + (Math.random() - 0.5) * 2,
                });
            }
        } catch (apiError) {
            console.log('RapidAPI failed, using mock data');
        }

        // Fallback mock data
        const basePrice = 100 + Math.random() * 1500;
        res.json({
            symbol,
            name: symbol.replace('.NS', '').replace('.BO', ''),
            priceNSE: parseFloat(basePrice.toFixed(2)),
            priceBSE: parseFloat((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
            change: parseFloat(((Math.random() - 0.5) * 50).toFixed(2)),
            changePercent: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),
            volume: Math.floor(Math.random() * 10000000),
            week52High: parseFloat((basePrice * 1.3).toFixed(2)),
            week52Low: parseFloat((basePrice * 0.7).toFixed(2)),
            marketCap: (Math.random() * 500000 + 10000).toFixed(0) + ' Cr',
            pe: parseFloat((10 + Math.random() * 40).toFixed(2)),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

export default router;
