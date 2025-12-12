import express from 'express';
import yahooFinance from 'yahoo-finance2';

const router = express.Router();

const NIFTY_50_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS",
    "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LICI.NS", "LT.NS",
    "HINDUNILVR.NS", "TATAMOTORS.NS", "AXISBANK.NS", "SUNPHARMA.NS", "NTPC.NS",
    "TITAN.NS", "BAJFINANCE.NS", "MARUTI.NS", "ULTRACEMCO.NS", "ONGC.NS",
    "POWERGRID.NS", "ADANIENT.NS", "ADANIPORTS.NS", "TATASTEEL.NS", "COALINDIA.NS",
    "HCLTECH.NS", "M&M.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "ASIANPAINT.NS",
    "SIEMENS.NS", "BAJAJ-AUTO.NS", "WIPRO.NS", "DMART.NS", "NESTLEIND.NS",
    "DLF.NS", "VARROC.NS", "IOC.NS", "GRASIM.NS", "SBILIFE.NS",
    "BEL.NS", "LTIM.NS", "TATACHEM.NS", "BPCL.NS", "BRITANNIA.NS",
    "TECHM.NS", "HINDALCO.NS", "GODREJCP.NS", "EICHERMOT.NS", "INDUSINDBK.NS"
];

router.get('/breadth', async (req, res) => {
    try {
        // Fetch quotes for all 50 stocks in one go (or in parallel)
        // yahoo-finance2 'quote' can take an array in some versions, or we Promise.all
        // To be safe and robust, we'll use Promise.all

        // Optimisation: Fetch in batches if needed, but 50 is okay for cloud usually
        const results = await Promise.all(
            NIFTY_50_SYMBOLS.map(sym => yahooFinance.quote(sym).catch(e => null))
        );

        let advances = 0;
        let declines = 0;
        let unchanged = 0;
        let high52 = 0;
        let low52 = 0;

        results.forEach(quote => {
            if (!quote) return;

            const change = quote.regularMarketChange || 0;
            if (change > 0) advances++;
            else if (change < 0) declines++;
            else unchanged++;

            // Simple 52w Logic (Near High/Low)
            const price = quote.regularMarketPrice;
            const yearHigh = quote.fiftyTwoWeekHigh;
            const yearLow = quote.fiftyTwoWeekLow;

            if (price >= yearHigh * 0.98) high52++; // Within 2% of high
            if (price <= yearLow * 1.02) low52++;   // Within 2% of low
        });

        res.json({
            traded: results.length,
            advances,
            declines,
            unchanged,
            high52,
            low52
        });

    } catch (error) {
        console.error("Market breadth fetch failed", error);
        res.status(500).json({ error: "Failed to calc breadth" });
    }
});

// ... existing breadth code ...

router.get('/sectors', async (req, res) => {
    try {
        const symbols = ['^NSEBANK', '^CNXIT', '^CNXAUTO', '^CNXPHARMA', '^CNXMETAL'];
        const results = await Promise.all(
            symbols.map(sym => yahooFinance.quote(sym).catch(e => null))
        );

        const data = results.map(q => {
            if (!q) return { name: 'Unknown', value: '-', isPos: false };
            const change = q.regularMarketChangePercent || 0;
            return {
                name: q.shortName || q.symbol,
                value: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                isPos: change >= 0
            };
        });
        res.json(data);
    } catch (e) {
        console.error("Sector fetch failed", e);
        res.status(500).json([]);
    }
});

router.get('/global', async (req, res) => {
    try {
        const symbols = [
            { s: '^GSPC', n: 'S&P 500' },
            { s: '^IXIC', n: 'NASDAQ' },
            { s: '^DJI', n: 'Dow Jones' }, // Dow might fail on some free tiers, let's see
            { s: '^N225', n: 'Nikkei 225' },
            { s: '^FTSE', n: 'FTSE 100' }
        ];

        const results = await Promise.all(
            symbols.map(obj => yahooFinance.quote(obj.s).catch(e => null))
        );

        const data = results.map((q, i) => {
            const name = symbols[i].n;
            if (!q) return { name, value: '-', change: '-', isPos: false };

            const change = q.regularMarketChangePercent || 0;
            return {
                name,
                value: q.regularMarketPrice?.toLocaleString('en-US', { maximumFractionDigits: 2 }),
                change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                isPos: change >= 0
            }
        });

        res.json(data);
    } catch (e) {
        console.error("Global fetch failed", e);
        res.status(500).json([]);
    }
});

export default router;
