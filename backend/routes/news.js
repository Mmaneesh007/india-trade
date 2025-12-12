import express from 'express';
import yahooFinance from 'yahoo-finance2';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Fetch news for a general query or specific symbol
        // For "Announcements", let's fetch India business news
        const query = req.query.q || 'India Stock Market';
        const results = await yahooFinance.search(query, { newsCount: 5 });

        // yahoo-finance2 search returns { quotes: [], news: [] }
        if (results.news) {
            res.json(results.news);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error("News fetch failed", error);
        res.status(500).json({ error: "News fetch failed" });
    }
});

export default router;
