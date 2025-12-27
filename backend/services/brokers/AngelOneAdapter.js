/**
 * Angel One SmartAPI Adapter
 * Implements BrokerInterface for Angel One trading
 */

import { BrokerInterface } from './BrokerInterface.js';
import axios from 'axios';
import crypto from 'crypto';

// SmartAPI Base URLs
const SMARTAPI_BASE = 'https://apiconnect.angelone.in';
const SMARTAPI_LOGIN = `${SMARTAPI_BASE}/rest/auth/angelbroking/user/v1/loginByPassword`;
const SMARTAPI_GENERATE_TOKEN = `${SMARTAPI_BASE}/rest/auth/angelbroking/jwt/v1/generateTokens`;
const SMARTAPI_LOGOUT = `${SMARTAPI_BASE}/rest/secure/angelbroking/user/v1/logout`;
const SMARTAPI_PROFILE = `${SMARTAPI_BASE}/rest/secure/angelbroking/user/v1/getProfile`;
const SMARTAPI_ORDER = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/placeOrder`;
const SMARTAPI_MODIFY_ORDER = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/modifyOrder`;
const SMARTAPI_CANCEL_ORDER = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/cancelOrder`;
const SMARTAPI_ORDER_BOOK = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/getOrderBook`;
const SMARTAPI_POSITIONS = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/getPosition`;
const SMARTAPI_HOLDINGS = `${SMARTAPI_BASE}/rest/secure/angelbroking/portfolio/v1/getHolding`;
const SMARTAPI_FUNDS = `${SMARTAPI_BASE}/rest/secure/angelbroking/user/v1/getRMS`;
const SMARTAPI_LTP = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/getLtpData`;
const SMARTAPI_CANDLE = `${SMARTAPI_BASE}/rest/secure/angelbroking/historical/v1/getCandleData`;
const SMARTAPI_SEARCH = `${SMARTAPI_BASE}/rest/secure/angelbroking/order/v1/searchScrip`;

export class AngelOneAdapter extends BrokerInterface {
    constructor(config = {}) {
        super(config);
        this.apiKey = config.apiKey || process.env.ANGELONE_API_KEY;
        this.clientId = config.clientId || null;
        this.password = config.password || null;
        this.totp = config.totp || null;
        this.jwtToken = null;
        this.refreshToken = null;
        this.feedToken = null;
        this.tokenCache = new Map();
        this.tokenToSymbol = new Map();
    }

    getName() {
        return 'angelone';
    }

    /**
     * Get headers for API requests
     */
    _getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '127.0.0.1',
            'X-ClientPublicIP': '127.0.0.1',
            'X-MACAddress': '00:00:00:00:00:00',
            'X-PrivateKey': this.apiKey
        };

        if (includeAuth && this.jwtToken) {
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
        }

        return headers;
    }

    /**
     * Login with client credentials
     * Note: Angel One uses direct login, not OAuth redirect
     */
    async login(clientId, password, totp) {
        try {
            const response = await axios.post(SMARTAPI_LOGIN, {
                clientcode: clientId,
                password: password,
                totp: totp
            }, {
                headers: this._getHeaders(false)
            });

            if (response.data.status) {
                this.clientId = clientId;
                this.jwtToken = response.data.data.jwtToken;
                this.refreshToken = response.data.data.refreshToken;
                this.feedToken = response.data.data.feedToken;
                this.isAuthenticated = true;

                return {
                    success: true,
                    data: {
                        clientId: clientId,
                        jwtToken: this.jwtToken,
                        refreshToken: this.refreshToken,
                        feedToken: this.feedToken
                    }
                };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Angel One login error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Set tokens (for restoring session)
     */
    setTokens(jwtToken, refreshToken, feedToken, clientId) {
        this.jwtToken = jwtToken;
        this.refreshToken = refreshToken;
        this.feedToken = feedToken;
        this.clientId = clientId;
        this.isAuthenticated = true;
    }

    async getLoginUrl() {
        // Angel One doesn't use OAuth redirect - uses direct login
        return null;
    }

    async handleCallback(authCode) {
        // Not used for Angel One
        return null;
    }

    async refreshAccessToken() {
        try {
            const response = await axios.post(SMARTAPI_GENERATE_TOKEN, {
                refreshToken: this.refreshToken
            }, {
                headers: this._getHeaders(false)
            });

            if (response.data.status) {
                this.jwtToken = response.data.data.jwtToken;
                this.refreshToken = response.data.data.refreshToken;
                this.feedToken = response.data.data.feedToken;

                return {
                    success: true,
                    jwtToken: this.jwtToken,
                    refreshToken: this.refreshToken,
                    feedToken: this.feedToken
                };
            }
            throw new Error('Token refresh failed');
        } catch (error) {
            console.error('Token refresh error:', error.response?.data || error.message);
            throw error;
        }
    }

    async logout() {
        try {
            await axios.post(SMARTAPI_LOGOUT, {
                clientcode: this.clientId
            }, {
                headers: this._getHeaders()
            });

            this.jwtToken = null;
            this.refreshToken = null;
            this.feedToken = null;
            this.isAuthenticated = false;

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getProfile() {
        try {
            const response = await axios.get(SMARTAPI_PROFILE, {
                headers: this._getHeaders()
            });

            return response.data.data;
        } catch (error) {
            console.error('Get profile error:', error.response?.data || error.message);
            throw error;
        }
    }

    // ==================== Trading Methods ====================

    async placeOrder(orderParams) {
        try {
            const payload = {
                variety: orderParams.variety || 'NORMAL',
                tradingsymbol: orderParams.symbol,
                symboltoken: orderParams.symbolToken,
                transactiontype: orderParams.transactionType, // BUY or SELL
                exchange: orderParams.exchange || 'NSE',
                ordertype: orderParams.orderType || 'MARKET', // MARKET, LIMIT, STOPLOSS_LIMIT, STOPLOSS_MARKET
                producttype: orderParams.productType || 'DELIVERY', // DELIVERY, INTRADAY, MARGIN
                duration: orderParams.duration || 'DAY',
                price: orderParams.price || 0,
                triggerprice: orderParams.triggerPrice || 0,
                quantity: orderParams.quantity
            };

            const response = await axios.post(SMARTAPI_ORDER, payload, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return {
                    success: true,
                    orderId: response.data.data.orderid,
                    message: response.data.message
                };
            }
            throw new Error(response.data.message || 'Order placement failed');
        } catch (error) {
            console.error('Place order error:', error.response?.data || error.message);
            throw error;
        }
    }

    async modifyOrder(orderId, modifyParams) {
        try {
            const payload = {
                variety: modifyParams.variety || 'NORMAL',
                orderid: orderId,
                ordertype: modifyParams.orderType,
                producttype: modifyParams.productType,
                duration: modifyParams.duration || 'DAY',
                price: modifyParams.price || 0,
                quantity: modifyParams.quantity,
                tradingsymbol: modifyParams.symbol,
                symboltoken: modifyParams.symbolToken,
                exchange: modifyParams.exchange || 'NSE'
            };

            const response = await axios.post(SMARTAPI_MODIFY_ORDER, payload, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return {
                    success: true,
                    orderId: response.data.data.orderid,
                    message: response.data.message
                };
            }
            throw new Error(response.data.message || 'Order modification failed');
        } catch (error) {
            console.error('Modify order error:', error.response?.data || error.message);
            throw error;
        }
    }

    async cancelOrder(orderId, variety = 'NORMAL') {
        try {
            const response = await axios.post(SMARTAPI_CANCEL_ORDER, {
                variety: variety,
                orderid: orderId
            }, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return {
                    success: true,
                    orderId: response.data.data.orderid,
                    message: response.data.message
                };
            }
            throw new Error(response.data.message || 'Order cancellation failed');
        } catch (error) {
            console.error('Cancel order error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getOrders() {
        try {
            const response = await axios.get(SMARTAPI_ORDER_BOOK, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return response.data.data || [];
            }
            return [];
        } catch (error) {
            console.error('Get orders error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getOrderStatus(orderId) {
        const orders = await this.getOrders();
        return orders.find(o => o.orderid === orderId) || null;
    }

    // ==================== Portfolio Methods ====================

    async getPositions() {
        try {
            const response = await axios.get(SMARTAPI_POSITIONS, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return response.data.data || [];
            }
            return [];
        } catch (error) {
            console.error('Get positions error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getHoldings() {
        try {
            const response = await axios.get(SMARTAPI_HOLDINGS, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return response.data.data || [];
            }
            return [];
        } catch (error) {
            console.error('Get holdings error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getFunds() {
        try {
            const response = await axios.get(SMARTAPI_FUNDS, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Get funds error:', error.response?.data || error.message);
            throw error;
        }
    }

    // ==================== Market Data Methods ====================

    async getLTP(exchange, symbol, symbolToken) {
        try {
            const response = await axios.post(SMARTAPI_LTP, {
                exchange: exchange,
                tradingsymbol: symbol,
                symboltoken: symbolToken
            }, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Get LTP error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getQuote(exchange, symbol) {
        // Use getLTP for now, full quote requires WebSocket
        return this.getLTP(exchange, symbol);
    }

    async getHistoricalData(params) {
        try {
            const response = await axios.post(SMARTAPI_CANDLE, {
                exchange: params.exchange,
                symboltoken: params.symbolToken,
                interval: params.interval || 'ONE_DAY', // ONE_MINUTE, FIVE_MINUTE, FIFTEEN_MINUTE, etc.
                fromdate: params.fromDate,
                todate: params.toDate
            }, {
                headers: this._getHeaders()
            });

            if (response.data.status) {
                return response.data.data || [];
            }
            return [];
        } catch (error) {
            console.error('Get historical data error:', error.response?.data || error.message);
            throw error;
        }
    }


    async searchScrip(symbol, exchange = 'NSE') {
        try {
            const response = await axios.post(SMARTAPI_SEARCH, {
                exchange: exchange,
                searchscrip: symbol
            }, {
                headers: this._getHeaders()
            });

            if (response.data.status && response.data.data) {
                return response.data.data; // Returns array of matching scrips
            }
            return [];
        } catch (error) {
            console.error('Search scrip error:', error.response?.data || error.message);
            return [];
        }
    }

    // ==================== WebSocket Methods ====================

    async connectWebSocket(onTick, onError) {
        try {
            // Import WebSocketV2 dynamically
            // Note: Adjust import based on how smartapi-javascript exports it. 
            // CommonJS: const { WebSocketV2 } = require('smartapi-javascript');
            // ESM: import { WebSocketV2 } from 'smartapi-javascript';
            // Since we are in module, dynamic import() is best.
            const module = await import('smartapi-javascript');
            const WebSocketV2 = module.WebSocketV2 || module.default.WebSocketV2;

            if (!this.clientId || !this.feedToken || !this.apiKey) {
                throw new Error('Missing credentials for WebSocket connection');
            }

            this.ws = new WebSocketV2({
                jwttoken: this.jwtToken,
                apikey: this.apiKey,
                clientcode: this.clientId,
                feedtype: this.feedToken
            });

            this.ws.connect().then(() => {
                console.log('Angel One WebSocket V2 connected');

                // Keep the connection alive
                if (this.pingInterval) clearInterval(this.pingInterval);
                this.pingInterval = setInterval(() => {
                    if (this.ws && this.ws.connected) {
                        // this.ws.runScript();
                    }
                }, 10000);
            }).catch(err => {
                console.error('WebSocket connection failed:', err);
                if (onError) onError(err);
            });

            this.ws.on('tick', (tickData) => {
                if (onTick) {
                    // Normalize tick data
                    // SDK V2 tick might have 'last_traded_price' or 'ltp' depending on mode
                    const token = tickData.token;
                    const symbol = this.tokenToSymbol.get(token);

                    const normalizedTick = {
                        ...tickData,
                        trading_symbol: symbol || tickData.trading_symbol || tickData.token, // Fallback
                        last_traded_price: tickData.last_traded_price || tickData.ltp, // Normalize LTP
                        change_percent: tickData.change_percent || 0 // Ensure field exists
                    };

                    onTick([normalizedTick]);
                }
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                if (onError) onError(error);
            });

            this.ws.on('close', () => {
                console.log('WebSocket connection closed');
            });

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            if (onError) onError(error);
        }
    }

    async subscribe(symbols) {
        if (!this.ws) {
            console.warn('WebSocket not connected, cannot subscribe');
            return;
        }

        const tokenList = [];
        const debugSymbols = [];

        if (!Array.isArray(symbols)) symbols = [symbols];

        for (const s of symbols) {
            // If s is object with { token, exchangeType }
            if (typeof s === 'object' && s.token) {
                tokenList.push({
                    exchangeType: s.exchangeType || 1, // 1 for NSE_CM
                    tokens: [s.token]
                });
                debugSymbols.push(s.token);
            }
            // If s is string, try to lookup token
            else if (typeof s === 'string') {
                if (this.tokenCache.has(s)) {
                    tokenList.push(this.tokenCache.get(s));
                    debugSymbols.push(`${s}:${this.tokenCache.get(s).tokens[0]} (cached)`);
                    continue;
                }

                try {
                    // Try exact match first
                    const results = await this.searchScrip(s);
                    // Filter for EQ or desired series if multiple
                    const match = results.find(r => r.tradingsymbol === s && r.exchangethrough === 'NSE') || results[0];

                    if (match) {
                        const tokenData = {
                            exchangeType: 1, // Assuming NSE CM
                            tokens: [match.symboltoken]
                        };
                        this.tokenCache.set(s, tokenData);
                        this.tokenToSymbol.set(match.symboltoken, s); // Update reverse map
                        tokenList.push(tokenData);
                        debugSymbols.push(`${s}:${match.symboltoken}`);
                    } else {
                        console.warn(`Could not resolve token for symbol: ${s}`);
                    }
                } catch (err) {
                    console.error(`Error resolving token for ${s}:`, err.message);
                }
            }
        }

        if (tokenList.length > 0) {
            console.log('Subscribing to tokens:', debugSymbols);
            this.ws.subscribe("sub_1", 3, tokenList); // Mode 3: SnapQuote
        }
    }

    async unsubscribe(symbols) {
        // Implementation for unsubscribe if needed
        // this.ws.unsubscribe(...)
        console.log('Unsubscribe called');
    }

    async disconnectWebSocket() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (this.ws) {
            try {
                this.ws.close();
            } catch (e) { console.error('Error closing WS', e); }
            this.ws = null;
        }
    }
}

export default AngelOneAdapter;
