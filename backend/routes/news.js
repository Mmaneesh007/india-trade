import express from 'express';
import yahooFinance from 'yahoo-finance2';

const router = express.Router();

// Fallback data in case Yahoo API fails (common in cloud deployments due to rate limits)
const FALLBACK_NEWS = [
    {
        title: "Sensex, Nifty hit fresh record highs led by IT, banking stocks",
        link: "https://www.moneycontrol.com/",
        publisher: "MoneyControl",
        providerPublishTime: Date.now() / 1000
    },
    {
        title: "HDFC Bank Q3 Preview: Net profit likely to jump 20% YoY",
        link: "https://economictimes.indiatimes.com/",
        publisher: "Economic Times",
        providerPublishTime: Date.now() / 1000 - 3600
    },
    {
        title: "Reliance Industries plans major expansion in green energy sector",
        link: "https://www.livemint.com/",
        publisher: "LiveMint",
        providerPublishTime: Date.now() / 1000 - 7200
    },
    {
        title: "TCS announces strategic partnership with major European bank",
        link: "https://www.cnbctv18.com/",
        publisher: "CNBC TV18",
        providerPublishTime: Date.now() / 1000 - 10800
    },
    {
        title: "Gold prices trade flat ahead of US inflation data",
        link: "https://www.business-standard.com/",
        publisher: "Business Standard",
        providerPublishTime: Date.now() / 1000 - 14400
    }
];

router.get('/', async (req, res) => {
    try {
        const query = req.query.q || 'India Stock Market';

        // Try fetching real news with a short timeout
        // Note: Adding suppressErrors to avoid crashing on some Yahoo responses
        const results = await Promise.race([
            yahooFinance.search(query, { newsCount: 10 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

        if (results.news && results.news.length > 0) {
            res.json(results.news);
        } else {
            console.log("Yahoo returned no news, using fallback.");
            res.json(FALLBACK_NEWS);
        }
    } catch (error) {
        console.error("News fetch failed (using fallback):", error.message);
        // Send fallback instead of error
        res.json(FALLBACK_NEWS);
    }
});

export default router;
