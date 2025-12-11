import { Server } from 'socket.io';
import { marketData } from './services/marketData.js';

let io;
const activeSymbols = new Set();
const POLL_INTERVAL = 5000; // 5 seconds

export function setupSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all for dev
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Client subscribes to a stock
        socket.on('subscribe', (symbol) => {
            const s = symbol.toUpperCase();
            console.log(`Socket ${socket.id} subscribed to ${s}`);
            socket.join(s);
            activeSymbols.add(s);

            // Immediate fetch for responsiveness
            marketData.getQuote(s).then(data => {
                socket.emit('price_update', data);
            }).catch(err => console.error(err.message));
        });

        socket.on('unsubscribe', (symbol) => {
            const s = symbol.toUpperCase();
            socket.leave(s);
            // We don't remove from activeSymbols immediately to keep cache warm for others
            // In a real app, we'd count subscribers
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    // Start polling loop
    startPolling();
}

function startPolling() {
    setInterval(async () => {
        if (activeSymbols.size === 0) return;

        for (const symbol of activeSymbols) {
            // Check if anyone is actually in the room to save API calls
            const room = io.sockets.adapter.rooms.get(symbol);
            if (!room || room.size === 0) {
                // cleanup?
                continue;
            }

            try {
                const data = await marketData.getQuote(symbol);
                io.to(symbol).emit('price_update', data);
            } catch (e) {
                // silent fail on poll
            }
        }
    }, POLL_INTERVAL);
}
