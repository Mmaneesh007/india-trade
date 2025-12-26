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

    // ==================== WebSocket Methods ====================

    async connectWebSocket(onTick, onError) {
        // WebSocket implementation using SmartAPI WebSocket
        // Will be implemented with ws library
        console.log('WebSocket connection - to be implemented');
    }

    async subscribe(symbols) {
        console.log('Subscribe to symbols:', symbols);
    }

    async unsubscribe(symbols) {
        console.log('Unsubscribe from symbols:', symbols);
    }

    async disconnectWebSocket() {
        console.log('Disconnect WebSocket');
    }
}

export default AngelOneAdapter;
