# Indian Stock Market (Fintech Edition)

A production-ready, premium stock market dashboard for Indian Equities (NSE).

## Features

- **Real-time Logic**: Uses WebSockets to stream price updates.
- **Premium UI**: Glassmorphism, Dark Mode, and Interactive Charts (TradingView).
- **Data Source**: Yahoo Finance (Simulation/Delayed) - *Switchable to Zerodha/Upstox*.

## Quick Start

### 1. Start Backend

The backend handles data fetching and WebSockets.

```bash
cd backend
npm install
npm run dev
```

*Runs on `http://localhost:4000`*

### 2. Start Frontend

The frontend is the user interface.

```bash
cd frontend
npm install
npm run dev
```

*Runs on `http://localhost:5173`*

## Architecture

- **Frontend**: React + Vite + TailwindCSS + Framer Motion.
- **Backend**: Node.js + Express + Socket.io + Yahoo Finance2.
