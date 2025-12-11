import express from 'express';
import { marketData } from '../services/marketData.js';

const router = express.Router();

// Get latest quote
router.get('/latest/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const data = await marketData.getQuote(symbol);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get historical candles
router.get('/candles/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const interval = req.query.interval || '1d';
    const candles = await marketData.getCandles(symbol, interval);
    res.json({ candles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
