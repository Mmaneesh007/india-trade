import yahooFinance from 'yahoo-finance2';

export const marketData = {
  /**
   * Fetch quote for a symbol.
   * Handles adding .NS suffix for NSE if missing.
   */
  getQuote: async (symbol) => {
    try {
      let s = symbol.toUpperCase();
      // Don't modify indices or fully qualified symbols
      if (!s.startsWith('^') && !s.endsWith('.NS') && !s.endsWith('.BO')) {
        s = `${s}.NS`;
      }
      const quote = await yahooFinance.quote(s);

      // Normalize data for frontend
      return {
        symbol: symbol.toUpperCase(),
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        open: quote.regularMarketOpen,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        prevClose: quote.regularMarketPreviousClose,
        volume: quote.regularMarketVolume,
        timestamp: new Date().toISOString(),
        source: 'yahoo'
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      throw error;
    }
  },

  /**
   * Fetch historical candles.
   * @param {string} symbol 
   * @param {string} interval - '1d', '1wk', etc.
   */
  getCandles: async (symbol, interval = '1d') => {
    try {
      const s = symbol.toUpperCase().endsWith('.NS') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;
      const queryOptions = { period1: '2023-01-01', interval: interval }; // Default to 1 year for now
      const result = await yahooFinance.historical(s, queryOptions);

      // Map to Lightweight Charts format
      // { time: '2019-04-11', open: 80.01, high: 96.63, low: 76.6, close: 81.89 }
      return result.map(candle => ({
        time: candle.date.toISOString().split('T')[0], // YYYY-MM-DD for daily
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error.message);
      // Return empty instead of crashing
      return [];
    }
  }
};
