import yahooFinance from 'yahoo-finance2';

async function test() {
    console.log("Testing Indices...");
    const symbols = [
        '^NSEBANK', '^CNXIT', '^CNXAUTO', // Sectors
        '^GSPC', '^IXIC', '^FTSE', '^N225' // Global
    ];

    for (const sym of symbols) {
        try {
            const quote = await yahooFinance.quote(sym);
            console.log(`${sym}: ${quote.regularMarketPrice} (${quote.regularMarketChangePercent}%)`);
        } catch (e) {
            console.error(`${sym} Failed:`, e.message);
        }
    }
}
test();
