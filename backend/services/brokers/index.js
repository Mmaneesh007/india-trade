/**
 * Broker Service Manager
 * Central service to manage broker connections and route requests
 */

import { AngelOneAdapter } from './AngelOneAdapter.js';
import { PaperTradingAdapter } from './PaperTradingAdapter.js';

class BrokerServiceManager {
    constructor() {
        this.adapters = new Map();
        this.userSessions = new Map(); // userId -> {broker, adapter}
    }

    /**
     * Get available brokers
     */
    getAvailableBrokers() {
        return [
            {
                id: 'angelone',
                name: 'Angel One',
                description: 'Angel One SmartAPI integration',
                requiresApiKey: true,
                isFree: true
            },
            {
                id: 'paper',
                name: 'Paper Trading',
                description: 'Simulated trading for testing',
                requiresApiKey: false,
                isFree: true
            }
        ];
    }

    /**
     * Create adapter instance for a broker
     */
    createAdapter(brokerId, config = {}) {
        switch (brokerId) {
            case 'angelone':
                return new AngelOneAdapter(config);
            case 'paper':
                return new PaperTradingAdapter(config);
            default:
                throw new Error(`Unknown broker: ${brokerId}`);
        }
    }

    /**
     * Connect user to a broker
     */
    async connectUser(userId, brokerId, credentials) {
        const adapter = this.createAdapter(brokerId, credentials);

        if (brokerId === 'angelone') {
            // Login to Angel One
            const result = await adapter.login(
                credentials.clientId,
                credentials.password,
                credentials.totp
            );

            if (result.success) {
                this.userSessions.set(userId, {
                    broker: brokerId,
                    adapter: adapter,
                    connectedAt: new Date(),
                    tokens: result.data
                });

                return {
                    success: true,
                    broker: brokerId,
                    message: 'Connected to Angel One successfully'
                };
            }
        } else if (brokerId === 'paper') {
            this.userSessions.set(userId, {
                broker: brokerId,
                adapter: adapter,
                connectedAt: new Date()
            });

            return {
                success: true,
                broker: brokerId,
                message: 'Connected to Paper Trading'
            };
        }

        throw new Error('Connection failed');
    }

    /**
     * Restore user session from stored tokens
     */
    restoreSession(userId, brokerId, tokens) {
        const adapter = this.createAdapter(brokerId);

        if (brokerId === 'angelone' && tokens) {
            adapter.setTokens(
                tokens.jwtToken,
                tokens.refreshToken,
                tokens.feedToken,
                tokens.clientId
            );
        }

        this.userSessions.set(userId, {
            broker: brokerId,
            adapter: adapter,
            connectedAt: new Date(),
            tokens: tokens
        });

        return { success: true };
    }

    /**
     * Get user's current broker adapter
     */
    getUserAdapter(userId) {
        const session = this.userSessions.get(userId);
        if (!session) {
            throw new Error('No broker connected. Please connect to a broker first.');
        }
        return session.adapter;
    }

    /**
     * Check if user is connected to any broker
     */
    isUserConnected(userId) {
        return this.userSessions.has(userId);
    }

    /**
     * Get user's connection status
     */
    getConnectionStatus(userId) {
        const session = this.userSessions.get(userId);
        if (!session) {
            return { connected: false };
        }

        return {
            connected: true,
            broker: session.broker,
            connectedAt: session.connectedAt,
            isAuthenticated: session.adapter.isAuthenticated
        };
    }

    /**
     * Disconnect user from broker
     */
    async disconnectUser(userId) {
        const session = this.userSessions.get(userId);
        if (session) {
            try {
                await session.adapter.logout();
            } catch (error) {
                console.error('Logout error:', error);
            }
            this.userSessions.delete(userId);
        }
        return { success: true };
    }

    // ==================== Trading Proxy Methods ====================

    async placeOrder(userId, orderParams) {
        const adapter = this.getUserAdapter(userId);
        return adapter.placeOrder(orderParams);
    }

    async modifyOrder(userId, orderId, modifyParams) {
        const adapter = this.getUserAdapter(userId);
        return adapter.modifyOrder(orderId, modifyParams);
    }

    async cancelOrder(userId, orderId, variety) {
        const adapter = this.getUserAdapter(userId);
        return adapter.cancelOrder(orderId, variety);
    }

    async getOrders(userId) {
        const adapter = this.getUserAdapter(userId);
        return adapter.getOrders();
    }

    async getOrderStatus(userId, orderId) {
        const adapter = this.getUserAdapter(userId);
        return adapter.getOrderStatus(orderId);
    }

    async getPositions(userId) {
        const adapter = this.getUserAdapter(userId);
        return adapter.getPositions();
    }

    async getHoldings(userId) {
        const adapter = this.getUserAdapter(userId);
        return adapter.getHoldings();
    }

    async getFunds(userId) {
        const adapter = this.getUserAdapter(userId);
        return adapter.getFunds();
    }

    async getLTP(userId, exchange, symbol, symbolToken) {
        const adapter = this.getUserAdapter(userId);
        return adapter.getLTP(exchange, symbol, symbolToken);
    }
}

// Singleton instance
export const brokerService = new BrokerServiceManager();
export default brokerService;
