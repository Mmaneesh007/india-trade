import express from 'express';
import axios from 'axios';

const router = express.Router();

// RapidAPI configuration
const RAPIDAPI_KEY = '2bab4cabb3msh75be9e6b1e5f20dp12f8f2jsn5b08da545c70';
const RAPIDAPI_HOST = 'indian-stock-exchange-api2.p.rapidapi.com';

// Generate realistic market mover data
const generateMoversData = (type = 'gainers', count = 20) => {
    const companies = [
        { symbol: 'HINDZINC.NS', name: 'Hindustan Zinc', logo: 'HZ' },
        { symbol: 'JSWENERGY.NS', name: 'JSW Energy', logo: 'JSW' },
        { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corporation', logo: 'BP' },
        { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', logo: 'HI' },
        { symbol: 'TATASTEEL.NS', name: 'Tata Steel', logo: 'TS' },
        { symbol: 'ADANIPOWER.NS', name: 'Adani Power', logo: 'AP' },
        { symbol: 'VEDL.NS', name: 'Vedanta', logo: 'VE' },
        { symbol: 'NAUKRI.NS', name: 'Info Edge (India)', logo: 'IE' },
        { symbol: 'ZOMATO.NS', name: 'Eternal (Zomato)', logo: 'ZO' },
        { symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements', logo: 'AC' },
        { symbol: 'COALINDIA.NS', name: 'Coal India', logo: 'CI' },
        { symbol: 'ONGC.NS', name: 'ONGC', logo: 'ON' },
        { symbol: 'NTPC.NS', name: 'NTPC', logo: 'NT' },
        { symbol: 'POWERGRID.NS', name: 'Power Grid Corp', logo: 'PG' },
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries', logo: 'RI' },
        { symbol: 'TCS.NS', name: 'Tata Consultancy Services', logo: 'TC' },
        { symbol: 'INFY.NS', name: 'Infosys', logo: 'IN' },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', logo: 'HB' },
        { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', logo: 'IB' },
        { symbol: 'SBIN.NS', name: 'State Bank of India', logo: 'SB' },
        { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', logo: 'BF' },
        { symbol: 'LT.NS', name: 'Larsen & Toubro', logo: 'LT' },
        { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', logo: 'MS' },
        { symbol: 'TITAN.NS', name: 'Titan Company', logo: 'TI' },
        { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', logo: 'AP' },
    ];

    const shuffled = [...companies].sort(() => 0.5 - Math.random());
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

// Get top gainers
router.get('/gainers', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const data = generateMoversData('gainers', count);
    res.json(data.sort((a, b) => b.changePercent - a.changePercent));
});

// Get top losers
router.get('/losers', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const data = generateMoversData('losers', count);
    res.json(data.sort((a, b) => a.changePercent - b.changePercent));
});

// Get volume shockers
router.get('/volume-shockers', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const data = generateMoversData('volume', count);
    res.json(data.sort((a, b) => b.volume - a.volume));
});

// Get 52 week high
router.get('/52w-high', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const data = generateMoversData('gainers', count).map(item => ({
        ...item,
        price: item.week52High,
        changePercent: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    }));
    res.json(data);
});

// Get 52 week low
router.get('/52w-low', (req, res) => {
    const count = parseInt(req.query.count) || 20;
    const data = generateMoversData('losers', count).map(item => ({
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
