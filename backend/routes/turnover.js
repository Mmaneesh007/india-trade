import express from 'express';
import axios from 'axios';

const router = express.Router();

// RapidAPI configuration
const RAPIDAPI_KEY = '2bab4cabb3msh75be9e6b1e5f20dp12f8f2jsn5b08da545c70';
const RAPIDAPI_HOST = 'indian-stock-exchange-api2.p.rapidapi.com';

// Helper to format numbers
const formatNumber = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(2) + ' K';
    return num.toString();
};

const formatCrores = (num) => {
    return (num / 10000000).toFixed(2);
};

// Generate realistic market turnover data with dynamic updates
const generateTurnoverData = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isMarketHours = hours >= 9 && (hours < 15 || (hours === 15 && minutes <= 30));

    // Base values (realistic NSE data)
    const baseData = {
        equity: { volume: 42777000000, value: 8639002000000, openInterest: null },
        equityDerivatives: { volume: 1094000000, value: 14511831000000, openInterest: 219000000 },
        currencyDerivatives: { volume: 217000, value: 194038000000, openInterest: 1584000 },
        interestRateDerivatives: { volume: 15, value: 29000000, openInterest: 5681 },
        commodityDerivatives: { volume: 2016000, value: 6154000000, openInterest: 282 },
        debt: { volume: null, value: 2220078000000, openInterest: null },
        mutualFund: { volume: null, value: 134594000000, openInterest: null }
    };

    // Add random variance during market hours
    const variance = isMarketHours ? (Math.random() * 0.05 - 0.025) : 0; // ±2.5% variance
    const timeMultiplier = isMarketHours ? ((hours - 9) * 60 + minutes) / 375 : 1; // Progress through trading day

    const applyVariance = (val) => val ? Math.round(val * (1 + variance) * (isMarketHours ? timeMultiplier : 1)) : null;

    const products = [
        {
            name: 'Equity',
            volume: applyVariance(baseData.equity.volume),
            value: applyVariance(baseData.equity.value),
            openInterest: null,
            updatedAt: isMarketHours ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` : '16:00'
        },
        {
            name: 'Equity Derivatives',
            volume: applyVariance(baseData.equityDerivatives.volume),
            value: applyVariance(baseData.equityDerivatives.value),
            openInterest: applyVariance(baseData.equityDerivatives.openInterest),
            updatedAt: isMarketHours ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` : '15:30'
        },
        {
            name: 'Currency Derivatives',
            volume: applyVariance(baseData.currencyDerivatives.volume),
            value: applyVariance(baseData.currencyDerivatives.value),
            openInterest: applyVariance(baseData.currencyDerivatives.openInterest),
            updatedAt: isMarketHours ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` : '17:00'
        },
        {
            name: 'Interest Rate Derivatives',
            volume: applyVariance(baseData.interestRateDerivatives.volume),
            value: applyVariance(baseData.interestRateDerivatives.value),
            openInterest: applyVariance(baseData.interestRateDerivatives.openInterest),
            updatedAt: '12:16'
        },
        {
            name: 'Commodity Derivatives',
            volume: applyVariance(baseData.commodityDerivatives.volume),
            value: applyVariance(baseData.commodityDerivatives.value),
            openInterest: applyVariance(baseData.commodityDerivatives.openInterest),
            updatedAt: '23:55'
        },
        {
            name: 'Debt',
            volume: null,
            value: applyVariance(baseData.debt.value),
            openInterest: null,
            updatedAt: '17:02'
        },
        {
            name: 'Mutual Fund',
            volume: null,
            value: applyVariance(baseData.mutualFund.value),
            openInterest: null,
            updatedAt: '15:30'
        }
    ];

    // Calculate totals
    const totals = {
        volume: products.reduce((sum, p) => sum + (p.volume || 0), 0),
        value: products.reduce((sum, p) => sum + (p.value || 0), 0),
        openInterest: products.reduce((sum, p) => sum + (p.openInterest || 0), 0)
    };

    return {
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        isMarketOpen: isMarketHours,
        products: products.map(p => ({
            ...p,
            volumeFormatted: p.volume ? formatNumber(p.volume) : '-',
            valueFormatted: formatCrores(p.value || 0),
            openInterestFormatted: p.openInterest ? formatNumber(p.openInterest) : '-'
        })),
        totals: {
            volume: totals.volume,
            value: totals.value,
            openInterest: totals.openInterest,
            volumeFormatted: formatNumber(totals.volume),
            valueFormatted: formatCrores(totals.value),
            openInterestFormatted: formatNumber(totals.openInterest)
        }
    };
};

// Generate detailed breakdown data
const generateDetailedData = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const segments = [
        // Equity
        { category: 'Equity', segment: 'Equity', today: { volume: 4351706003017, value: 8905904, orders: 7124891934, trades: 27186498, avgTradeValue: 3198 }, prev: { volume: 1787327002883, value: 7877787, orders: null, trades: null } },
        { category: 'Equity', segment: 'SME', today: { volume: 12694320, value: 29617, orders: null, trades: 5671, avgTradeValue: null }, prev: { volume: 11721807, value: 3394, orders: null, trades: null } },
        { category: 'Equity', segment: 'Others', today: { volume: 9646904, value: 822, orders: null, trades: 1240, avgTradeValue: 663 }, prev: { volume: 1848204, value: 3284, orders: null, trades: null } },

        // Equity Derivatives
        { category: 'Equity Derivatives', segment: 'Index Futures', today: { volume: 117399, value: 2503450, orders: 316781, trades: null, avgTradeValue: 1199, openInterest: 2504992 }, prev: { volume: 117389, value: 2506472, orders: 345083, trades: null } },
        { category: 'Equity Derivatives', segment: 'Stock Futures', today: { volume: 932199, value: 4538447, orders: 1828498, trades: 846579, avgTradeValue: 6018 }, prev: { volume: 595844, value: 4620863, orders: 1282992, trades: null } },
        { category: 'Equity Derivatives', segment: 'Index Options', today: { volume: 52867294, value: 4588757, orders: 80242883, trades: 9328612, avgTradeValue: 1782 }, prev: { volume: 38446046, value: 120820, orders: 38182409, trades: null } },
        { category: 'Equity Derivatives', segment: 'Stock Options', today: { volume: 9050617, value: 346879, orders: 9647300, trades: null, avgTradeValue: 1195 }, prev: { volume: 1120210, value: 68379, orders: 1473224, trades: null } },

        // Currency Derivatives
        { category: 'Currency Derivatives', segment: 'Currency Futures', today: { volume: 121617, value: 1003426, orders: null, trades: 5458, avgTradeValue: null }, prev: { volume: 50549, value: 1035489, orders: null, trades: null } },
        { category: 'Currency Derivatives', segment: 'Currency Options', today: { volume: 3044, value: 453, orders: null, trades: 927, avgTradeValue: null }, prev: { volume: 15933, value: 1122, orders: null, trades: null } },

        // Interest Rate Derivatives
        { category: 'Interest Rate Derivatives', segment: 'Interest Rate Securities Futures', today: { volume: 14, value: 499, orders: 1, trades: 51842563, avgTradeValue: 216 }, prev: { volume: 189, value: 303, orders: 1, trades: null } },
        { category: 'Interest Rate Derivatives', segment: 'Interest Rate Securities Options', today: { volume: 1, value: null, orders: null, trades: 1, avgTradeValue: null }, prev: { volume: null, value: null, orders: null, trades: null } },

        // Commodity Derivatives
        { category: 'Commodity Derivatives', segment: 'Commodity Futures', today: { volume: 3203, value: 4442, orders: 1595, trades: 4605, openInterest: 55165 }, prev: { volume: 182, value: 1636, orders: 164, trades: null } },
        { category: 'Commodity Derivatives', segment: 'Commodity Options', today: { volume: null, value: null, orders: null, trades: null }, prev: { volume: 306, value: 8894, orders: 164, trades: null } },
        { category: 'Commodity Derivatives', segment: 'Commodity Options On Futures', today: { volume: 13495, value: 7814, orders: 1264, trades: 27810, openInterest: null }, prev: { volume: 9092, value: 2338, orders: 1474, trades: null } },

        // Debt
        { category: 'Debt', segment: 'GSEC', today: { volume: null, value: 6598610, orders: null, trades: 8279, avgTradeValue: 12513914 }, prev: { volume: 1135, value: 32831, orders: null, trades: null } },
        { category: 'Debt', segment: 'SPSL', today: { volume: null, value: 174626, orders: null, trades: 6444, avgTradeValue: 17019674 }, prev: { volume: 1183, value: 453, orders: null, trades: null } },
        { category: 'Debt', segment: 'TBI-TREPS REPO', today: { volume: null, value: 8159720, orders: null, trades: 30, avgTradeValue: 162188687 }, prev: { volume: null, value: null, orders: null, trades: null } },

        // Mutual Fund
        { category: 'Mutual Fund', segment: 'Mutual Fund', today: { volume: null, value: 134594, orders: null, trades: null, avgTradeValue: null }, prev: { volume: 4543, value: 5163, orders: null, trades: 109928 } }
    ];

    // Calculate category totals
    const categories = ['Equity', 'Equity Derivatives', 'Currency Derivatives', 'Interest Rate Derivatives', 'Commodity Derivatives', 'Debt', 'Mutual Fund'];
    const categoryTotals = categories.map(cat => {
        const catSegments = segments.filter(s => s.category === cat);
        return {
            category: cat,
            today: {
                volume: catSegments.reduce((s, seg) => s + (seg.today.volume || 0), 0),
                value: catSegments.reduce((s, seg) => s + (seg.today.value || 0), 0),
                openInterest: catSegments.reduce((s, seg) => s + (seg.today.openInterest || 0), 0),
                orders: catSegments.reduce((s, seg) => s + (seg.today.orders || 0), 0),
                trades: catSegments.reduce((s, seg) => s + (seg.today.trades || 0), 0)
            },
            prev: {
                volume: catSegments.reduce((s, seg) => s + (seg.prev.volume || 0), 0),
                value: catSegments.reduce((s, seg) => s + (seg.prev.value || 0), 0)
            }
        };
    });

    // Grand total
    const grandTotal = {
        today: {
            volume: segments.reduce((s, seg) => s + (seg.today.volume || 0), 0),
            value: segments.reduce((s, seg) => s + (seg.today.value || 0), 0),
            openInterest: segments.reduce((s, seg) => s + (seg.today.openInterest || 0), 0),
            orders: segments.reduce((s, seg) => s + (seg.today.orders || 0), 0),
            trades: segments.reduce((s, seg) => s + (seg.today.trades || 0), 0)
        },
        prev: {
            volume: segments.reduce((s, seg) => s + (seg.prev.volume || 0), 0),
            value: segments.reduce((s, seg) => s + (seg.prev.value || 0), 0)
        }
    };

    const notes = [
        "* In case of Option Contracts, 'Value' displayed is 'Premium Turnover'",
        "* In case of Currency Interest and Currency Options in India, the interest rate and premium are shown.",
        "* Currency Turnover is calculated by using latest available Reference rate. TBS.",
        "* Turnover of Mutual Fund is based on the contract Traded value by the specified on the calculation given below.",
        "  - For Mutual fund 'Turnover' USD and Category type 'Debt' of the GOLD market Category Type 'Fixed-Asset' and US Time is 0932.",
        "  - 'For the action type Trading only' in 'EFFECT' with Time is 1630.",
        "* Initial and Final Types in Equity market offer where ETF is refol of RETS AND's end-party and equity shares.",
        "* Average Trade Value = Total Traded Value / Total Number of Trades.",
        "* (Pro. of Settled) represents all under clearance including Q, Delivered semi-final, modified and confirmed trades."
    ];

    return {
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        previousDate: yesterday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        segments,
        categoryTotals,
        grandTotal,
        notes
    };
};

// Get summary turnover data
router.get('/summary', (req, res) => {
    try {
        const data = generateTurnoverData();
        res.json(data);
    } catch (error) {
        console.error('Turnover summary error:', error);
        res.status(500).json({ error: 'Failed to fetch turnover data' });
    }
});

// Get detailed turnover data
router.get('/detailed', (req, res) => {
    try {
        const data = generateDetailedData();
        res.json(data);
    } catch (error) {
        console.error('Turnover detailed error:', error);
        res.status(500).json({ error: 'Failed to fetch detailed turnover data' });
    }
});

// Fetch real stock data from RapidAPI (for reference)
router.get('/stock/:symbol', async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/corporate_actions`,
            params: { stock_name: req.params.symbol },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        res.json(response.data);
    } catch (error) {
        console.error('RapidAPI error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

export default router;
