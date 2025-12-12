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
import mutualfundsRouter from './routes/mutualfunds.js';
import moversRouter from './routes/movers.js';

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
app.use('/api/mutualfunds', mutualfundsRouter);
app.use('/api/movers', moversRouter);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
