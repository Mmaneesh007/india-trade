import axios from 'axios';
import * as cheerio from 'cheerio';

const API_KEY = 'B5XZUYSOBP48T5P1WC34TTZFBZZWMZUXRPA8TSVK5POCUOF6L3OQ9KC4EXUNGALRRFH34ROPNQFQLSV4';
const TARGET_URL = 'https://www.investopedia.com/markets-news-4427704';

async function testScrape() {
    console.log("Testing ScrapingBee with JS Rendering...");
    try {
        const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
            params: {
                'api_key': API_KEY,
                'url': TARGET_URL,
                'render_js': 'true', // KEY: Enable JS rendering
                'wait': '3000'       // Wait for content to load
            }
        });

        console.log("Status:", response.status);
        const html = response.data;
        const $ = cheerio.load(html);

        console.log("HTML Length:", html.length);
        // Debug: Print first 500 chars of body to check if we are blocked or valid
        console.log("Body snippet:", $('body').html().substring(0, 500));

        const newsItems = [];

        // STRATEGY 1: Look for specific Investopedia Card Classes
        // They often use 'mntl-card', 'card', 'card-list__item'

        // Debug: Log all classes of div elements to see patterns (limit to first 20)
        console.log("--- Debugging Classes ---");
        $('div').slice(0, 20).each((i, el) => {
            const cls = $(el).attr('class');
            if (cls && cls.includes('card')) console.log("Found card-like class:", cls);
        });

        // STRATEGY 2: Broad Search for ANY link that contains an image and text
        // This is robust against class name changes
        $('a').each((i, el) => {
            if (newsItems.length >= 10) return;

            const link = $(el).attr('href');
            // Title is often in a specific span or div inside the anchor
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
                    img, // Frontend expects 'thumbnail.resolutions[0].url' structure validation later
                    publisher: "Investopedia",
                    providerPublishTime: Math.floor(Date.now() / 1000) // Fallback time
                });
            }
        });

        console.log("Extracted Items:", newsItems.length);
        if (newsItems.length > 0) {
            console.log(JSON.stringify(newsItems.slice(0, 3), null, 2));
        } else {
            console.log("No items found. Logic needs adjustment.");
        }

    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.log(e.response.data);
    }
}

testScrape();
