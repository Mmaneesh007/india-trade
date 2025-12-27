/**
 * Paper Trading Adapter
 * Simulates trading without real broker connection
 * Useful for testing and demo purposes
 */

import { BrokerInterface } from './BrokerInterface.js';

export class PaperTradingAdapter extends BrokerInterface {
    constructor(config = {}) {
        super(config);
        this.orders = [];
        this.positions = [];
        this.holdings = [];
        this.funds = {
            availableBalance: config.initialBalance || 100000,
            usedMargin: 0,
            totalBalance: config.initialBalance || 100000
        };
        this.orderIdCounter = 1000;
        this.isAuthenticated = true; // Always authenticated in paper mode
    }

    getName() {
        return 'paper';
    }

    getLoginUrl() {
        return null; // No login needed for paper trading
    }

    async handleCallback(authCode) {
        return { success: true };
    }

    async refreshAccessToken() {
        return { success: true };
    }

    async logout() {
        return { success: true };
    }

    // ==================== Helper Methods ====================

    _generateOrderId() {
        return `PAPER${Date.now()}${this.orderIdCounter++}`;
    }

    _getSimulatedPrice(symbol) {
        // Generate a realistic price based on symbol
        const basePrice = symbol.length * 100 + Math.random() * 500;
        return parseFloat(basePrice.toFixed(2));
    }

    // ==================== Trading Methods ====================

    async placeOrder(orderParams) {
        const orderId = this._generateOrderId();
        const price = orderParams.price || this._getSimulatedPrice(orderParams.symbol);
        const totalValue = price * orderParams.quantity;

        // Check funds for BUY orders
        if (orderParams.transactionType === 'BUY') {
            if (totalValue > this.funds.availableBalance) {
                throw new Error('Insufficient funds');
            }
            this.funds.availableBalance -= totalValue;
            this.funds.usedMargin += totalValue;
        }

        const order = {
            orderId: orderId,
            symbol: orderParams.symbol,
            exchange: orderParams.exchange || 'NSE',
            transactionType: orderParams.transactionType,
            orderType: orderParams.orderType || 'MARKET',
            productType: orderParams.productType || 'DELIVERY',
            quantity: orderParams.quantity,
            price: price,
            status: 'COMPLETE', // Paper orders execute immediately
            filledQuantity: orderParams.quantity,
            averagePrice: price,
            timestamp: new Date().toISOString(),
            message: 'Paper trade executed successfully'
        };

        this.orders.push(order);

        // Update positions
        this._updatePosition(order);

        return {
            success: true,
            orderId: orderId,
            message: 'Paper trade executed successfully',
            data: order
        };
    }

    _updatePosition(order) {
        const existingPosition = this.positions.find(
            p => p.symbol === order.symbol && p.exchange === order.exchange
        );

        if (existingPosition) {
            if (order.transactionType === 'BUY') {
                const totalQty = existingPosition.quantity + order.quantity;
                const totalValue = (existingPosition.averagePrice * existingPosition.quantity) +
                    (order.price * order.quantity);
                existingPosition.averagePrice = totalValue / totalQty;
                existingPosition.quantity = totalQty;
            } else {
                existingPosition.quantity -= order.quantity;
                if (existingPosition.quantity <= 0) {
                    // Close position
                    this.positions = this.positions.filter(p => p !== existingPosition);
                    // Return funds
                    this.funds.availableBalance += order.price * order.quantity;
                    this.funds.usedMargin -= order.price * order.quantity;
                }
            }
        } else if (order.transactionType === 'BUY') {
            this.positions.push({
                symbol: order.symbol,
                exchange: order.exchange,
                quantity: order.quantity,
                averagePrice: order.price,
                ltp: order.price,
                pnl: 0,
                productType: order.productType
            });
        }
    }

    async modifyOrder(orderId, modifyParams) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === 'COMPLETE') {
            throw new Error('Cannot modify completed order');
        }

        Object.assign(order, {
            ...modifyParams,
            modifiedAt: new Date().toISOString()
        });

        return {
            success: true,
            orderId: orderId,
            message: 'Order modified successfully'
        };
    }

    async cancelOrder(orderId, variety) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === 'COMPLETE') {
            throw new Error('Cannot cancel completed order');
        }

        order.status = 'CANCELLED';
        order.cancelledAt = new Date().toISOString();

        return {
            success: true,
            orderId: orderId,
            message: 'Order cancelled successfully'
        };
    }

    async getOrders() {
        return this.orders;
    }

    async getOrderStatus(orderId) {
        return this.orders.find(o => o.orderId === orderId) || null;
    }

    // ==================== Portfolio Methods ====================

    async getPositions() {
        // Update LTP and PnL
        return this.positions.map(p => ({
            ...p,
            ltp: this._getSimulatedPrice(p.symbol),
            pnl: parseFloat(((this._getSimulatedPrice(p.symbol) - p.averagePrice) * p.quantity).toFixed(2))
        }));
    }

    async getHoldings() {
        return this.holdings;
    }

    async getFunds() {
        return {
            availablecash: this.funds.availableBalance,
            availableintradaypayin: this.funds.availableBalance,
            availablelimitmargin: this.funds.availableBalance,
            collateral: 0,
            m2munrealized: 0,
            m2mrealized: 0,
            utiliseddebits: this.funds.usedMargin,
            utilisedspan: 0,
            utilisedoptionpremium: 0,
            utilisedholdingtrades: 0,
            utilisedexposure: 0,
            utilisedturnover: 0,
            utilisedpayout: 0
        };
    }

    // ==================== Market Data Methods ====================

    async getLTP(exchange, symbol, symbolToken) {
        const ltp = this._getSimulatedPrice(symbol);
        return {
            exchange: exchange,
            tradingsymbol: symbol,
            symboltoken: symbolToken,
            ltp: ltp,
            open: ltp * 0.99,
            high: ltp * 1.02,
            low: ltp * 0.98,
            close: ltp * 0.995
        };
    }

    async getQuote(exchange, symbol) {
        return this.getLTP(exchange, symbol);
    }

    async getHistoricalData(params) {
        // Generate mock historical data
        const data = [];
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 6);

        let currentDate = new Date(startDate);
        let price = this._getSimulatedPrice(params.symbolToken || 'TEST');

        while (currentDate <= endDate) {
            const change = (Math.random() - 0.5) * 10;
            price = Math.max(10, price + change);

            data.push({
                timestamp: currentDate.toISOString(),
                open: parseFloat((price - Math.random() * 5).toFixed(2)),
                high: parseFloat((price + Math.random() * 5).toFixed(2)),
                low: parseFloat((price - Math.random() * 5).toFixed(2)),
                close: parseFloat(price.toFixed(2)),
                volume: Math.floor(Math.random() * 1000000)
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return data;
    }

    // ==================== WebSocket Methods ====================

    async connectWebSocket(onTick, onError) {
        if (this.wsInterval) {
            clearInterval(this.wsInterval);
        }

        console.log('Paper trading WebSocket - connected');
        this.subscribedSymbols = new Set();
        this.onTickPayload = onTick;

        // Simulate ticks every second
        this.wsInterval = setInterval(() => {
            if (this.subscribedSymbols.size === 0) return;

            const ticks = [];
            for (const symbol of this.subscribedSymbols) {
                const currentPrice = this._getSimulatedPrice(symbol);
                const variation = (Math.random() - 0.5) * (currentPrice * 0.002); // 0.2% variation
                const newPrice = parseFloat((currentPrice + variation).toFixed(2));

                ticks.push({
                    symbol_token: '12345', // Mock token
                    trading_symbol: symbol,
                    last_traded_price: newPrice,
                    change_percent: (Math.random() * 2 - 1).toFixed(2),
                    exchange_timestamp: new Date().toISOString()
                });
            }

            if (ticks.length > 0 && this.onTickPayload) {
                this.onTickPayload(ticks);
            }
        }, 1000);
    }

    async subscribe(symbols) {
        if (!Array.isArray(symbols)) symbols = [symbols];
        symbols.forEach(s => this.subscribedSymbols.add(s));
        console.log('Paper trading subscribed:', symbols);
        return { success: true };
    }

    async unsubscribe(symbols) {
        if (!Array.isArray(symbols)) symbols = [symbols];
        symbols.forEach(s => this.subscribedSymbols.delete(s));
        console.log('Paper trading unsubscribed:', symbols);
        return { success: true };
    }

    async disconnectWebSocket() {
        if (this.wsInterval) {
            clearInterval(this.wsInterval);
            this.wsInterval = null;
        }
        console.log('Paper trading WebSocket disconnected');
    }

    // ==================== Paper Trading Specific ====================

    /**
     * Reset paper trading account
     */
    reset(initialBalance = 100000) {
        this.orders = [];
        this.positions = [];
        this.holdings = [];
        this.funds = {
            availableBalance: initialBalance,
            usedMargin: 0,
            totalBalance: initialBalance
        };
    }

    /**
     * Get paper trading summary
     */
    getSummary() {
        const totalPnL = this.positions.reduce((sum, p) => {
            const currentPrice = this._getSimulatedPrice(p.symbol);
            return sum + (currentPrice - p.averagePrice) * p.quantity;
        }, 0);

        return {
            totalBalance: this.funds.totalBalance,
            availableBalance: this.funds.availableBalance,
            usedMargin: this.funds.usedMargin,
            totalOrders: this.orders.length,
            openPositions: this.positions.length,
            unrealizedPnL: parseFloat(totalPnL.toFixed(2)),
            mode: 'PAPER'
        };
    }
}

export default PaperTradingAdapter;
