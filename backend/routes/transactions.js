import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all transactions for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get P&L summary per stock for a user
router.get('/:userId/summary', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch all transactions
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });

        if (error) throw error;

        // Calculate P&L per stock
        const stockSummary = {};

        transactions.forEach(txn => {
            if (!stockSummary[txn.symbol]) {
                stockSummary[txn.symbol] = {
                    symbol: txn.symbol,
                    totalBought: 0,
                    totalSold: 0,
                    avgBuyPrice: 0,
                    avgSellPrice: 0,
                    quantity: 0,
                    realizedPnL: 0,
                    buyCount: 0,
                    sellCount: 0
                };
            }

            const stock = stockSummary[txn.symbol];

            if (txn.type === 'BUY') {
                stock.totalBought += txn.quantity * txn.price;
                stock.quantity += txn.quantity;
                stock.buyCount++;
                stock.avgBuyPrice = stock.totalBought / stock.quantity;
            } else if (txn.type === 'SELL') {
                stock.totalSold += txn.quantity * txn.price;
                stock.quantity -= txn.quantity;
                stock.sellCount++;
                stock.avgSellPrice = stock.totalSold / stock.sellCount;

                // Calculate realized P&L (simplified)
                stock.realizedPnL += (txn.price - stock.avgBuyPrice) * txn.quantity;
            }
        });

        const summary = Object.values(stockSummary);

        res.json(summary);
    } catch (error) {
        console.error('Error calculating P&L summary:', error);
        res.status(500).json({ error: 'Failed to calculate P&L' });
    }
});

export default router;
