import yahooFinance from 'yahoo-finance2';

async function test() {
    console.log("Testing News Fetch...");
    try {
        const query = 'India Stock Market';
        const results = await yahooFinance.search(query, { newsCount: 5 });
        if (results.news && results.news.length > 0) {
            console.log("First News Item:", JSON.stringify(results.news[0], null, 2));
        } else {
            console.log("No news found.");
        }
    } catch (e) {
        console.error("Test Failed:", e);
    }
}
test();
