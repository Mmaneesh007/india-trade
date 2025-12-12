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
