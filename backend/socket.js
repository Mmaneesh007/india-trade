import { Server } from 'socket.io';
import { brokerService } from './services/brokers/index.js';
import { marketData } from './services/marketData.js';

let io;

export function setupSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Handle broker ticks and broadcast to room
    brokerService.setTickHandler((ticks) => {
        if (!ticks || !Array.isArray(ticks)) return;

        ticks.forEach(tick => {
            // Emitting to room 'SYMBOL'
            io.to(tick.trading_symbol).emit('price_update', {
                symbol: tick.trading_symbol,
                price: tick.last_traded_price,
                change: parseFloat(tick.change_percent),
                timestamp: tick.exchange_timestamp
            });
        });
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Subscribe to real-time data
        socket.on('subscribe', async (data) => {
            // Support both string (legacy) and object {symbol, userId}
            const symbol = (typeof data === 'string' ? data : data.symbol).toUpperCase();
            const userId = typeof data === 'object' ? data.userId : null;

            console.log(`Socket ${socket.id} subscribing to ${symbol}`);
            socket.join(symbol);

            if (userId) {
                // Subscribe via broker if user is logged in
                await brokerService.subscribe(userId, symbol);
            } else {
                // Fallback to simpler polling or simple quote fetch
                marketData.getQuote(symbol).then(data => {
                    socket.emit('price_update', data);
                }).catch(err => console.error(err.message));
            }
        });

        socket.on('unsubscribe', async (data) => {
            const symbol = (typeof data === 'string' ? data : data.symbol).toUpperCase();
            const userId = typeof data === 'object' ? data.userId : null;

            socket.leave(symbol);

            if (userId) {
                await brokerService.unsubscribe(userId, symbol);
            }
        });

        socket.on('disconnect', () => {
            // No cleanup needed for broker service here as subscriptions persist for user
            console.log('Client disconnected:', socket.id);
        });
    });
}
