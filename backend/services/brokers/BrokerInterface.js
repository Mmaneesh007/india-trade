/**
 * Broker Interface - Abstract base class for all broker adapters
 * All broker implementations (Angel One, Zerodha, Upstox) must implement this interface
 */

export class BrokerInterface {
    constructor(config = {}) {
        this.config = config;
        this.isAuthenticated = false;
        this.accessToken = null;
        this.refreshToken = null;
    }

    /**
     * Get broker name
     * @returns {string} Broker identifier
     */
    getName() {
        throw new Error('getName() must be implemented');
    }

    /**
     * Generate login URL for OAuth
     * @returns {string} OAuth authorization URL
     */
    getLoginUrl() {
        throw new Error('getLoginUrl() must be implemented');
    }

    /**
     * Handle OAuth callback and get access token
     * @param {string} authCode - Authorization code from callback
     * @returns {Promise<Object>} Token response
     */
    async handleCallback(authCode) {
        throw new Error('handleCallback() must be implemented');
    }

    /**
     * Refresh access token
     * @returns {Promise<Object>} New token response
     */
    async refreshAccessToken() {
        throw new Error('refreshAccessToken() must be implemented');
    }

    /**
     * Logout and invalidate tokens
     * @returns {Promise<boolean>} Success status
     */
    async logout() {
        throw new Error('logout() must be implemented');
    }

    // ==================== Trading Methods ====================

    /**
     * Place a new order
     * @param {Object} orderParams - Order parameters
     * @param {string} orderParams.symbol - Trading symbol
     * @param {string} orderParams.exchange - NSE or BSE
     * @param {string} orderParams.transactionType - BUY or SELL
     * @param {string} orderParams.orderType - MARKET, LIMIT, SL, SL-M
     * @param {number} orderParams.quantity - Number of shares
     * @param {number} orderParams.price - Price (for LIMIT orders)
     * @param {string} orderParams.productType - DELIVERY, INTRADAY, MARGIN
     * @returns {Promise<Object>} Order response with orderId
     */
    async placeOrder(orderParams) {
        throw new Error('placeOrder() must be implemented');
    }

    /**
     * Modify an existing order
     * @param {string} orderId - Order ID to modify
     * @param {Object} modifyParams - Parameters to modify
     * @returns {Promise<Object>} Modified order response
     */
    async modifyOrder(orderId, modifyParams) {
        throw new Error('modifyOrder() must be implemented');
    }

    /**
     * Cancel an order
     * @param {string} orderId - Order ID to cancel
     * @param {string} variety - Order variety
     * @returns {Promise<Object>} Cancellation response
     */
    async cancelOrder(orderId, variety) {
        throw new Error('cancelOrder() must be implemented');
    }

    /**
     * Get order book (all orders for the day)
     * @returns {Promise<Array>} List of orders
     */
    async getOrders() {
        throw new Error('getOrders() must be implemented');
    }

    /**
     * Get specific order status
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Order details
     */
    async getOrderStatus(orderId) {
        throw new Error('getOrderStatus() must be implemented');
    }

    // ==================== Portfolio Methods ====================

    /**
     * Get current positions
     * @returns {Promise<Array>} List of positions
     */
    async getPositions() {
        throw new Error('getPositions() must be implemented');
    }

    /**
     * Get holdings (delivery stocks)
     * @returns {Promise<Array>} List of holdings
     */
    async getHoldings() {
        throw new Error('getHoldings() must be implemented');
    }

    /**
     * Get funds/margin available
     * @returns {Promise<Object>} Funds details
     */
    async getFunds() {
        throw new Error('getFunds() must be implemented');
    }

    // ==================== Market Data Methods ====================

    /**
     * Get LTP (Last Traded Price)
     * @param {string} exchange - NSE or BSE
     * @param {string} symbol - Trading symbol
     * @returns {Promise<Object>} LTP data
     */
    async getLTP(exchange, symbol) {
        throw new Error('getLTP() must be implemented');
    }

    /**
     * Get quote (full market depth)
     * @param {string} exchange - NSE or BSE
     * @param {string} symbol - Trading symbol
     * @returns {Promise<Object>} Quote data
     */
    async getQuote(exchange, symbol) {
        throw new Error('getQuote() must be implemented');
    }

    /**
     * Get historical candle data
     * @param {Object} params - Candle parameters
     * @returns {Promise<Array>} Historical candles
     */
    async getHistoricalData(params) {
        throw new Error('getHistoricalData() must be implemented');
    }

    // ==================== WebSocket Methods ====================

    /**
     * Connect to WebSocket for real-time data
     * @param {Function} onTick - Callback for price ticks
     * @param {Function} onError - Callback for errors
     * @returns {Promise<void>}
     */
    async connectWebSocket(onTick, onError) {
        throw new Error('connectWebSocket() must be implemented');
    }

    /**
     * Subscribe to symbols for WebSocket updates
     * @param {Array} symbols - List of {exchange, symbol} objects
     * @returns {Promise<void>}
     */
    async subscribe(symbols) {
        throw new Error('subscribe() must be implemented');
    }

    /**
     * Unsubscribe from symbols
     * @param {Array} symbols - List of {exchange, symbol} objects
     * @returns {Promise<void>}
     */
    async unsubscribe(symbols) {
        throw new Error('unsubscribe() must be implemented');
    }

    /**
     * Disconnect WebSocket
     * @returns {Promise<void>}
     */
    async disconnectWebSocket() {
        throw new Error('disconnectWebSocket() must be implemented');
    }
}

export default BrokerInterface;
