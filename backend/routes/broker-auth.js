/**
 * Broker Authentication Routes
 * Handles broker connection, login, and session management
 */

import express from 'express';
import { brokerService } from '../services/brokers/index.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

/**
 * Get available brokers
 */
router.get('/brokers', (req, res) => {
    const brokers = brokerService.getAvailableBrokers();
    res.json(brokers);
});

/**
 * Get user's broker connection status
 */
router.get('/status/:userId', (req, res) => {
    const { userId } = req.params;
    const status = brokerService.getConnectionStatus(userId);
    res.json(status);
});

/**
 * Connect to Paper Trading (no credentials needed)
 */
router.post('/connect/paper/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { initialBalance } = req.body;

        const result = await brokerService.connectUser(userId, 'paper', {
            initialBalance: initialBalance || 100000
        });

        res.json(result);
    } catch (error) {
        console.error('Paper trading connect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Connect to Angel One
 * Requires: clientId, password, totp, apiKey
 */
router.post('/connect/angelone/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { clientId, password, totp, apiKey } = req.body;

        if (!clientId || !password || !totp) {
            return res.status(400).json({
                error: 'Missing required fields: clientId, password, totp'
            });
        }

        const result = await brokerService.connectUser(userId, 'angelone', {
            clientId,
            password,
            totp,
            apiKey: apiKey || process.env.ANGELONE_API_KEY
        });

        // Store tokens in Supabase for session persistence
        if (result.success) {
            await supabase
                .from('broker_sessions')
                .upsert({
                    user_id: userId,
                    broker: 'angelone',
                    tokens: result.tokens,
                    connected_at: new Date().toISOString()
                });
        }

        res.json({
            success: result.success,
            broker: result.broker,
            message: result.message
        });
    } catch (error) {
        console.error('Angel One connect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Restore session from stored tokens
 */
router.post('/restore/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get stored session from Supabase
        const { data: session, error } = await supabase
            .from('broker_sessions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !session) {
            return res.json({ success: false, message: 'No stored session found' });
        }

        const result = brokerService.restoreSession(
            userId,
            session.broker,
            session.tokens
        );

        res.json({
            success: result.success,
            broker: session.broker,
            message: 'Session restored'
        });
    } catch (error) {
        console.error('Session restore error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Disconnect from broker
 */
router.post('/disconnect/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await brokerService.disconnectUser(userId);

        // Remove stored session
        await supabase
            .from('broker_sessions')
            .delete()
            .eq('user_id', userId);

        res.json({ success: true, message: 'Disconnected successfully' });
    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Refresh tokens (for Angel One)
 */
router.post('/refresh/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const adapter = brokerService.getUserAdapter(userId);

        const result = await adapter.refreshAccessToken();

        if (result.success) {
            // Update stored tokens
            await supabase
                .from('broker_sessions')
                .update({
                    tokens: {
                        jwtToken: result.jwtToken,
                        refreshToken: result.refreshToken,
                        feedToken: result.feedToken
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
        }

        res.json(result);
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
