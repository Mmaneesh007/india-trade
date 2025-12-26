/**
 * Trading Routes
 * Real order placement, modification, and portfolio management
 */

import express from 'express';
import { brokerService } from '../services/brokers/index.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Middleware to check broker connection
const requireBrokerConnection = (req, res, next) => {
    const userId = req.params.userId || req.body.userId;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    if (!brokerService.isUserConnected(userId)) {
        return res.status(401).json({
            error: 'Not connected to any broker. Please connect first.',
            code: 'BROKER_NOT_CONNECTED'
        });
    }

    req.userId = userId;
    next();
};

// ==================== Order Management ====================

/**
 * Place a new order
 */
router.post('/order/:userId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId } = req.params;
        const orderParams = req.body;

        // Validate required fields
        const requiredFields = ['symbol', 'transactionType', 'quantity'];
        for (const field of requiredFields) {
            if (!orderParams[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        const result = await brokerService.placeOrder(userId, orderParams);

        // Log order to Supabase for history
        await supabase.from('order_history').insert({
            user_id: userId,
            order_id: result.orderId,
            symbol: orderParams.symbol,
            exchange: orderParams.exchange || 'NSE',
            transaction_type: orderParams.transactionType,
            order_type: orderParams.orderType || 'MARKET',
            product_type: orderParams.productType || 'DELIVERY',
            quantity: orderParams.quantity,
            price: orderParams.price || 0,
            status: 'PLACED',
            broker: brokerService.getConnectionStatus(userId).broker,
            created_at: new Date().toISOString()
        });

        res.json(result);
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Modify an existing order
 */
router.put('/order/:userId/:orderId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId, orderId } = req.params;
        const modifyParams = req.body;

        const result = await brokerService.modifyOrder(userId, orderId, modifyParams);

        // Log modification
        await supabase.from('order_history')
            .update({
                status: 'MODIFIED',
                modified_at: new Date().toISOString(),
                modify_params: modifyParams
            })
            .eq('order_id', orderId)
            .eq('user_id', userId);

        res.json(result);
    } catch (error) {
        console.error('Modify order error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Cancel an order
 */
router.delete('/order/:userId/:orderId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId, orderId } = req.params;
        const { variety } = req.query;

        const result = await brokerService.cancelOrder(userId, orderId, variety);

        // Log cancellation
        await supabase.from('order_history')
            .update({
                status: 'CANCELLED',
                cancelled_at: new Date().toISOString()
            })
            .eq('order_id', orderId)
            .eq('user_id', userId);

        res.json(result);
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get order book
 */
router.get('/orders/:userId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await brokerService.getOrders(userId);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get specific order status
 */
router.get('/order/:userId/:orderId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId, orderId } = req.params;
        const order = await brokerService.getOrderStatus(userId, orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== Portfolio ====================

/**
 * Get positions
 */
router.get('/positions/:userId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId } = req.params;
        const positions = await brokerService.getPositions(userId);
        res.json(positions);
    } catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get holdings
 */
router.get('/holdings/:userId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId } = req.params;
        const holdings = await brokerService.getHoldings(userId);
        res.json(holdings);
    } catch (error) {
        console.error('Get holdings error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get funds/margin
 */
router.get('/funds/:userId', requireBrokerConnection, async (req, res) => {
    try {
        const { userId } = req.params;
        const funds = await brokerService.getFunds(userId);
        res.json(funds);
    } catch (error) {
        console.error('Get funds error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== Market Data ====================

/**
 * Get LTP for a symbol
 */
router.get('/ltp/:userId/:exchange/:symbol', requireBrokerConnection, async (req, res) => {
    try {
        const { userId, exchange, symbol } = req.params;
        const { symbolToken } = req.query;

        const ltp = await brokerService.getLTP(userId, exchange, symbol, symbolToken);
        res.json(ltp);
    } catch (error) {
        console.error('Get LTP error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== Paper Trading Specific ====================

/**
 * Get paper trading summary
 */
router.get('/paper/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!brokerService.isUserConnected(userId)) {
            return res.status(401).json({ error: 'Not connected' });
        }

        const status = brokerService.getConnectionStatus(userId);
        if (status.broker !== 'paper') {
            return res.status(400).json({ error: 'Not in paper trading mode' });
        }

        const adapter = brokerService.getUserAdapter(userId);
        const summary = adapter.getSummary();

        res.json(summary);
    } catch (error) {
        console.error('Get paper summary error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Reset paper trading account
 */
router.post('/paper/reset/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { initialBalance } = req.body;

        const adapter = brokerService.getUserAdapter(userId);
        adapter.reset(initialBalance || 100000);

        res.json({
            success: true,
            message: 'Paper trading account reset',
            balance: initialBalance || 100000
        });
    } catch (error) {
        console.error('Reset paper trading error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
