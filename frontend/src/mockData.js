// Helper to generate realistic looking stock candles
export const generateMockCandles = (startPrice, count = 100) => {
    let price = startPrice;
    const candles = [];
    const now = new Date();

    for (let i = count; i > 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = time.toISOString().split('T')[0];

        const open = price;
        const close = price + (Math.random() - 0.5) * (price * 0.02);
        const high = Math.max(open, close) + Math.random() * (price * 0.01);
        const low = Math.min(open, close) - Math.random() * (price * 0.01);

        candles.push({ time: dateStr, open, high, low, close });
        price = close;
    }
    return candles;
};

// Generates a random chart pattern ending at the current price
// identifying by symbol to make it consistent-ish if needed, or just random
export const generateSmartCandles = (symbol, currentPrice, count = 100) => {
    const candles = [];
    const now = new Date();

    // Work backwards from current price
    let price = currentPrice || 1000;

    for (let i = 0; i < count; i++) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = time.toISOString().split('T')[0];

        // Volatility between 1-3%
        const volatility = 0.02;
        const change = price * volatility * (Math.random() - 0.48); // Slight bias?

        const close = price;
        const open = price - change;
        const high = Math.max(open, close) + Math.random() * (price * 0.005);
        const low = Math.min(open, close) - Math.random() * (price * 0.005);

        // Prepend because we are working backwards
        candles.unshift({ time: dateStr, open, high, low, close });
        price = open; // Yesterday's close is roughly today's open
    }

    return candles;
};

export const MOCK_NIFTY = {
    price: 24500.50,
    change: 125.40,
    changePercent: 0.51,
    candles: generateMockCandles(24000, 100)
};

export const MOCK_RELIANCE = {
    price: 2450.00,
    change: -12.00,
    changePercent: -0.45,
    open: 2460,
    prevClose: 2462,
    candles: generateMockCandles(2460, 100)
};
