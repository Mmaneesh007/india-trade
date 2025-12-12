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
      let s = symbol.toUpperCase();

      // Fix for Indices: Don't append .NS if it starts with ^
      // Also don't append if already has .NS or .BO
      if (!s.startsWith('^') && !s.endsWith('.NS') && !s.endsWith('.BO')) {
        s = `${s}.NS`;
      }

      // Dynamic Start Date: Last 6 months (more robust than fixed year)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const queryOptions = {
        period1: startDate,
        interval: interval
      };

      console.log(`Fetching candles for: ${s} from ${startDate.toISOString()}`);

      const result = await yahooFinance.historical(s, queryOptions);

      // Map to Lightweight Charts format
      return result.map(candle => ({
        time: candle.date.toISOString().split('T')[0],
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error.message);
      return [];
    }
  }
};
