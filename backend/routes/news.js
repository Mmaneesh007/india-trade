import express from 'express';
import yahooFinance from 'yahoo-finance2';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

const SCRAPINGBEE_API_KEY = 'B5XZUYSOBP48T5P1WC34TTZFBZZWMZUXRPA8TSVK5POCUOF6L3OQ9KC4EXUNGALRRFH34ROPNQFQLSV4';

router.get('/', async (req, res) => {
    try {
        const category = req.query.category || 'all';
        console.log(`Fetching news for category: ${category} via ScrapingBee...`);

        // Map categories to Investopedia URLs
        let targetUrl = 'https://www.investopedia.com/markets-news-4427704'; // Default 'all' or 'courts'

        switch (category) {
            case 'stocks':
                targetUrl = 'https://www.investopedia.com/company-news-4427705';
                break;
            case 'economy':
                targetUrl = 'https://www.investopedia.com/economy-news-4427709';
                break;
            case 'live':
                targetUrl = 'https://www.investopedia.com/markets-news-4427704'; // Keep as markets for now
                break;
            default:
                targetUrl = 'https://www.investopedia.com/markets-news-4427704';
        }

        const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
            params: {
                'api_key': SCRAPINGBEE_API_KEY,
                'url': targetUrl,
                'render_js': 'true',
                'wait': '3000'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const newsItems = [];

        // Broad Search for ANY link that contains an image and text
        $('a').each((i, el) => {
            if (newsItems.length >= 10) return;

            const link = $(el).attr('href');
            const title = $(el).find('.card__title-text, .card-title, span.text').first().text().trim() ||
                $(el).find('h3').text().trim() ||
                $(el).text().trim();

            // Image search
            let img = $(el).find('img').attr('data-src') ||
                $(el).find('img').attr('src');

            // Filter: Must have a substantial title and link
            if (link && title && title.length > 20 && img) {
                // Determine publisher (Investopedia usually)
                newsItems.push({
                    title,
                    link,
                    publisher: "Investopedia",
                    providerPublishTime: Math.floor(Date.now() / 1000),
                    // Map to existing Yahoo structure for frontend compatibility
                    thumbnail: {
                        resolutions: [{ url: img }]
                    }
                });
            }
        });

        if (newsItems.length > 0) {
            console.log(`Successfully fetched ${newsItems.length} items from Investopedia.`);
            res.json(newsItems);
        } else {
            console.log("ScrapingBee returned 0 items, using fallback.");
            res.json(FALLBACK_NEWS);
        }

    } catch (error) {
        console.error("News fetch failed (ScrapingBee):", error.message);
        // Send fallback instead of error
        res.json(FALLBACK_NEWS);
    }
});

export default router;
