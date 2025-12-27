import yahooFinance from 'yahoo-finance2';

import { brokerService } from './brokers/index.js';

export const marketData = {
  /**
   * Fetch quote for a symbol.
   */
  getQuote: async (symbol) => {
    try {
      let s = symbol.toUpperCase();
      if (!s.startsWith('^') && !s.endsWith('.NS') && !s.endsWith('.BO')) {
        s = `${s}.NS`;
      }
      const quote = await yahooFinance.quote(s);

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
   * Tries Angel One first if user is connected, else defaults to Yahoo Finance.
   */
  getCandles: async (symbol, interval = '1d', userId = null) => {
    // 1. Try Angel One if user is connected
    if (userId) {
      const status = brokerService.getConnectionStatus(userId);
      if (status.connected && status.broker === 'angelone') {
        try {
          const adapter = brokerService.getUserAdapter(userId);

          // Map interval
          let angelInterval = 'ONE_DAY';
          if (interval === '1m') angelInterval = 'ONE_MINUTE';
          else if (interval === '5m') angelInterval = 'FIVE_MINUTE';
          else if (interval === '15m') angelInterval = 'FIFTEEN_MINUTE';
          else if (interval === '30m') angelInterval = 'THIRTY_MINUTE';
          else if (interval === '1h') angelInterval = 'ONE_HOUR';

          // Resolve Token
          let cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
          // Indices mapping (quick fix for Nifty/BankNifty)
          if (cleanSymbol === '^NSEI' || cleanSymbol === 'NIFTY') cleanSymbol = 'Nifty 50';
          else if (cleanSymbol === '^NSEBANK' || cleanSymbol === 'BANKNIFTY') cleanSymbol = 'Nifty Bank';

          // Use search logic from adapter
          // Since searchScrip is async and we need token, we do:
          const searchResults = await adapter.searchScrip(cleanSymbol, 'NSE');
          // Prefer EQ or Index
          const match = searchResults.find(r => r.symboltoken) || searchResults[0];

          if (match) {
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 6); // 6 months

            const formatDate = (date) => {
              return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].substring(0, 5);
            }

            const params = {
              exchange: match.exchangethrough || 'NSE',
              symbolToken: match.symboltoken,
              interval: angelInterval,
              fromDate: formatDate(fromDate),
              toDate: formatDate(toDate)
            };

            const angelData = await adapter.getHistoricalData(params);

            if (angelData && Array.isArray(angelData)) {
              // Angel One format: [timestamp, open, high, low, close, volume]
              console.log(`Fetched ${angelData.length} candles from Angel One for ${cleanSymbol}`);
              return angelData.map(c => ({
                time: c[0].split('T')[0], // YYYY-MM-DD
                open: c[1],
                high: c[2],
                low: c[3],
                close: c[4],
                volume: c[5]
              }));
            }
          }
        } catch (angelError) {
          console.warn('Angel One candle fetch failed, falling back to Yahoo:', angelError.message);
          // Fallthrough to Yahoo
        }
      }
    }

    // 2. Fallback to Yahoo Finance
    try {
      let s = symbol.toUpperCase();
      if (!s.startsWith('^') && !s.endsWith('.NS') && !s.endsWith('.BO')) {
        s = `${s}.NS`;
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const queryOptions = {
        period1: startDate,
        interval: interval
      };

      console.log(`Fetching candles (Yahoo) for: ${s}`);
      const result = await yahooFinance.historical(s, queryOptions);

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
