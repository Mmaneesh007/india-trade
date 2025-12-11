import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import quotesRouter from './routes/quotes.js';
import { setupSocket } from './socket.js';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

// Initialize Socket.io
setupSocket(httpServer);

app.use('/api/quotes', quotesRouter);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
