import express from 'express';
import yahooFinance from 'yahoo-finance2';

const router = express.Router();

router.get('/', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    try {
        const results = await yahooFinance.search(query);
        // Filter for Indian stocks (NS/BO suffixes) or just return all
        // Users might want global, but let's prioritize Indian consistency if possible.
        // For now, raw results are fine, frontend can filter or show exchange.

        const refined = results.quotes.filter(q => q.isYahooFinance).map(q => ({
            symbol: q.symbol,
            shortname: q.shortname || q.longname,
            exchange: q.exchange,
            type: q.quoteType
        })).slice(0, 10); // Limit to 10

        res.json(refined);
    } catch (error) {
        console.error("Search failed", error);
        res.status(500).json({ error: "Search failed" });
    }
});

export default router;
