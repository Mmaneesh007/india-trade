import yahooFinance from 'yahoo-finance2';

async function test() {
    console.log("Testing Yahoo Finance...");
    try {
        // Test 1: Quote
        console.log("Fetching Quote for RELIANCE.NS...");
        const quote = await yahooFinance.quote('RELIANCE.NS');
        console.log("Quote Price:", quote.regularMarketPrice);

        // Test 2: Historical
        console.log("Fetching Historical for RELIANCE.NS...");
        const queryOptions = { period1: '2024-01-01', interval: '1d' };
        const result = await yahooFinance.historical('RELIANCE.NS', queryOptions);
        console.log("Historical Count:", result.length);
        if (result.length > 0) console.log("First Candle:", result[0]);

    } catch (e) {
        console.error("Test Failed:", e.message);
        console.error("Full Error:", e);
    }
}

test();
