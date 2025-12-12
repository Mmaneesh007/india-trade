import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get user's watchlist
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// Add stock to watchlist
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { symbol } = req.body;

        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const { data, error } = await supabase
            .from('watchlist')
            .insert([{ user_id: userId, symbol }])
            .select();

        if (error) {
            // Handle unique constraint violation (already in watchlist)
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Stock already in watchlist' });
            }
            throw error;
        }

        res.json(data[0]);
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

// Remove stock from watchlist
router.delete('/:userId/:symbol', async (req, res) => {
    try {
        const { userId, symbol } = req.params;

        const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('symbol', symbol);

        if (error) throw error;

        res.json({ success: true, message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

export default router;
