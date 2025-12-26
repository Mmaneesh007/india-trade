import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import quotesRouter from './routes/quotes.js';
import { setupSocket } from './socket.js';

import searchRouter from './routes/search.js';
import newsRouter from './routes/news.js';
import marketRouter from './routes/market.js';
import transactionsRouter from './routes/transactions.js';
import watchlistRouter from './routes/watchlist.js';
import ipoRouter from './routes/ipo.js';
import turnoverRouter from './routes/turnover.js';
import mutualFundsRouter from './routes/mutualfunds.js';
import moversRouter from './routes/movers.js';
import brokerAuthRouter from './routes/broker-auth.js';
import tradingRouter from './routes/trading.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Initialize Socket.io
setupSocket(httpServer);

app.use('/api/quotes', quotesRouter);
app.use('/api/search', searchRouter);
app.use('/api/news', newsRouter);
app.use('/api/market', marketRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/ipo', ipoRouter);
app.use('/api/turnover', turnoverRouter);
app.use('/api/mutual_funds', mutualFundsRouter);
app.use('/api/movers', moversRouter);
app.use('/api/broker', brokerAuthRouter);
app.use('/api/trading', tradingRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Backend listening on ${PORT}`));

