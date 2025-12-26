# Developer Guide

> Complete guide for developers working on IndiaTrades

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Code Conventions](#code-conventions)
5. [Frontend Development](#frontend-development)
6. [Backend Development](#backend-development)
7. [Testing](#testing)
8. [Git Workflow](#git-workflow)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18.x+ | JavaScript runtime |
| npm | 9.x+ | Package manager |
| Git | 2.x+ | Version control |
| VS Code | Latest | Recommended IDE |

### Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/Mmaneesh007/india-trade.git
cd india-trade

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# 3. Setup frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your credentials

# 4. Start development
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Environment Variables

#### Backend (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Server Configuration
PORT=4000
NODE_ENV=development

# Optional: RapidAPI for enhanced market data
RAPIDAPI_KEY=your-rapidapi-key
```

#### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:4000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Development Environment

### IDE Setup (VS Code)

#### Recommended Extensions

```json
{
    "recommendations": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "dsznajder.es7-react-js-snippets",
        "ritwickdey.LiveServer"
    ]
}
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "tailwindCSS.experimental.classRegex": [
        ["className\\s*=\\s*\"([^\"]*)\""]
    ],
    "files.associations": {
        "*.jsx": "javascriptreact"
    }
}
```

### Development Scripts

#### Backend Scripts

```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start production server
```

#### Frontend Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Project Structure

### Complete Directory Tree

```
indian-stock-live/
├── backend/
│   ├── routes/                 # API Route Handlers
│   │   ├── quotes.js          # Stock quotes (/api/quotes)
│   │   ├── search.js          # Search (/api/search)
│   │   ├── market.js          # Market overview (/api/market)
│   │   ├── movers.js          # Gainers/Losers (/api/movers)
│   │   ├── ipo.js             # IPO data (/api/ipo)
│   │   ├── watchlist.js       # Watchlist CRUD (/api/watchlist)
│   │   ├── transactions.js    # Transactions (/api/transactions)
│   │   ├── mutualfunds.js     # Mutual funds (/api/mutual_funds)
│   │   ├── news.js            # Market news (/api/news)
│   │   └── turnover.js        # Turnover data (/api/turnover)
│   │
│   ├── services/
│   │   └── marketData.js      # Yahoo Finance integration
│   │
│   ├── server.js              # Express app entry point
│   ├── socket.js              # Socket.io configuration
│   ├── supabaseClient.js      # Supabase client setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Route Components
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── LandingPage.jsx# Home page
│   │   │   ├── Login.jsx      # Login form
│   │   │   ├── Signup.jsx     # Registration form
│   │   │   ├── MarketMovers.jsx# Market analytics
│   │   │   ├── TradePage.jsx  # Stock trading
│   │   │   ├── MutualFunds.jsx# MF explorer
│   │   │   └── IPODetail.jsx  # IPO details
│   │   │
│   │   ├── components/        # Reusable Components
│   │   │   ├── Header.jsx     # Navigation header
│   │   │   ├── StockChart.jsx # Candlestick chart
│   │   │   ├── TopMovers.jsx  # Gainers/Losers widget
│   │   │   ├── Watchlist.jsx  # Watchlist component
│   │   │   ├── MarketOverview.jsx
│   │   │   ├── MarketTurnover.jsx
│   │   │   ├── MutualFunds.jsx# MF component
│   │   │   ├── TransactionHistory.jsx
│   │   │   ├── AddFundsModal.jsx
│   │   │   ├── ProFeatures.jsx
│   │   │   └── SearchAutocomplete.jsx
│   │   │
│   │   ├── context/           # React Context
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── App.jsx            # Root component
│   │   ├── api.js             # Axios client
│   │   ├── main.jsx           # Entry point
│   │   ├── supabaseClient.js  # Supabase client
│   │   └── index.css          # Global styles
│   │
│   ├── public/                # Static assets
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json
│
├── docs/                      # Documentation
├── README.md                  # Project overview
├── DEPLOYMENT.md              # Deployment guide
└── render.yaml                # Render configuration
```

---

## Code Conventions

### JavaScript/React Style Guide

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StockChart.jsx` |
| Functions | camelCase | `fetchStockData()` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| CSS Classes | kebab-case | `stock-card-header` |
| Files (components) | PascalCase | `MarketMovers.jsx` |
| Files (utilities) | camelCase | `api.js` |

#### Component Structure

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api';

// 2. Component Definition
export default function StockCard({ symbol, onSelect }) {
    // 3. State declarations
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 4. Effects
    useEffect(() => {
        fetchData();
    }, [symbol]);
    
    // 5. Event handlers
    const handleClick = () => {
        onSelect(symbol);
    };
    
    // 6. Helper functions
    const formatPrice = (price) => {
        return `₹${price.toLocaleString('en-IN')}`;
    };
    
    // 7. Conditional rendering
    if (loading) return <div>Loading...</div>;
    
    // 8. Main render
    return (
        <motion.div 
            className="stock-card"
            onClick={handleClick}
        >
            <h3>{symbol}</h3>
            <p>{formatPrice(data.price)}</p>
        </motion.div>
    );
}
```

#### Backend Route Structure

```javascript
// routes/example.js

import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

/**
 * @route   GET /api/example/:id
 * @desc    Get example by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }
        
        // Fetch data
        const { data, error } = await supabase
            .from('examples')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
```

### File Organization Rules

1. **One component per file** - Keep components focused
2. **Co-locate related files** - Put styles with components
3. **Group by feature** - Not by file type
4. **Index exports** - Use index.js for clean imports

---

## Frontend Development

### State Management

IndiaTrades uses **React Context** for global state and **local state** for component-specific data.

#### Socket Context

```jsx
// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    
    useEffect(() => {
        const newSocket = io(API_BASE_URL);
        setSocket(newSocket);
        
        return () => newSocket.close();
    }, []);
    
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
```

#### Using the Socket

```jsx
import { useSocket } from '../context/SocketContext';

function StockTicker({ symbol }) {
    const socket = useSocket();
    const [price, setPrice] = useState(null);
    
    useEffect(() => {
        if (!socket) return;
        
        // Subscribe to updates
        socket.emit('subscribe', symbol);
        
        // Listen for updates
        socket.on('price_update', (data) => {
            if (data.symbol === symbol) {
                setPrice(data.price);
            }
        });
        
        // Cleanup
        return () => {
            socket.emit('unsubscribe', symbol);
        };
    }, [socket, symbol]);
    
    return <div>₹{price}</div>;
}
```

### Styling with Tailwind

#### Custom Theme (tailwind.config.js)

```javascript
module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#6366f1',
                secondary: '#22c55e',
                danger: '#ef4444',
                background: {
                    dark: '#0f172a',
                    card: '#1e293b'
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }
        }
    },
    plugins: []
};
```

#### Component Styling Pattern

```jsx
// Use consistent class ordering
<div className={`
    // Layout
    flex flex-col gap-4
    // Sizing
    w-full max-w-md p-6
    // Appearance
    bg-slate-800 rounded-xl
    // Interactive
    hover:bg-slate-700 transition-colors
`}>
```

### Charts Integration

We use **Lightweight Charts** for financial charting:

```jsx
import { createChart } from 'lightweight-charts';

function CandlestickChart({ data }) {
    const chartContainerRef = useRef(null);
    
    useEffect(() => {
        const chart = createChart(chartContainerRef.current, {
            width: 600,
            height: 400,
            layout: {
                background: { color: '#1e293b' },
                textColor: '#ffffff'
            },
            grid: {
                vertLines: { color: '#334155' },
                horzLines: { color: '#334155' }
            }
        });
        
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444'
        });
        
        candleSeries.setData(data);
        
        return () => chart.remove();
    }, [data]);
    
    return <div ref={chartContainerRef} />;
}
```

---

## Backend Development

### Adding a New API Route

1. **Create route file:**

```javascript
// routes/newFeature.js
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'New feature works!' });
});

export default router;
```

2. **Register in server.js:**

```javascript
import newFeatureRouter from './routes/newFeature.js';

app.use('/api/new-feature', newFeatureRouter);
```

### Yahoo Finance Integration

```javascript
// services/marketData.js
import yahooFinance from 'yahoo-finance2';

export const marketData = {
    getQuote: async (symbol) => {
        // Append .NS for NSE stocks
        const nsSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
        
        const quote = await yahooFinance.quote(nsSymbol);
        
        return {
            symbol: symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume
        };
    }
};
```

### Error Handling Pattern

```javascript
// Async route handler with error handling
router.get('/:id', async (req, res) => {
    try {
        const result = await someAsyncOperation();
        res.json(result);
    } catch (error) {
        console.error(`Error in route: ${error.message}`);
        
        // Send appropriate status code
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

---

## Testing

### Manual Testing Checklist

#### Frontend Testing

- [ ] All pages load without errors
- [ ] Navigation works correctly
- [ ] Forms validate input properly
- [ ] API calls handle loading/error states
- [ ] WebSocket connections establish
- [ ] Charts render with data

#### Backend Testing

- [ ] All endpoints return correct responses
- [ ] Error cases return proper status codes
- [ ] Database operations work correctly
- [ ] WebSocket subscriptions work

### API Testing with cURL

```bash
# Test quotes endpoint
curl http://localhost:4000/api/quotes/RELIANCE

# Test search
curl "http://localhost:4000/api/search?q=tata"

# Test gainers
curl http://localhost:4000/api/movers/gainers

# Test watchlist (with auth)
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:4000/api/watchlist/user123
```

### Frontend Testing in Browser

```javascript
// Open browser console and test API
fetch('http://localhost:4000/api/quotes/TCS')
    .then(res => res.json())
    .then(data => console.log(data));

// Test WebSocket
const socket = io('http://localhost:4000');
socket.on('connect', () => console.log('Connected'));
socket.emit('subscribe', 'RELIANCE');
socket.on('price_update', console.log);
```

---

## Git Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-portfolio-view` |
| Bugfix | `fix/description` | `fix/chart-rendering-issue` |
| Hotfix | `hotfix/description` | `hotfix/auth-token-expired` |

### Commit Messages

Follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat(dashboard): add real-time portfolio value"
git commit -m "fix(auth): handle token expiration correctly"
git commit -m "docs(api): update endpoint documentation"
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Added comments where needed
- [ ] Updated documentation
- [ ] No new warnings
```

---

## Troubleshooting

### Common Issues

#### CORS Errors

**Symptom:** `Access-Control-Allow-Origin` errors in console

**Solution:**

```javascript
// backend/server.js
app.use(cors({
    origin: true,  // Allow all origins in dev
    credentials: true
}));
```

#### WebSocket Connection Failed

**Symptom:** `WebSocket connection failed` in console

**Solution:**

1. Check backend is running: `http://localhost:4000`
2. Verify Socket.io version match (frontend/backend)
3. Check firewall settings

#### Yahoo Finance Rate Limiting

**Symptom:** `429 Too Many Requests`

**Solution:**

1. Implement caching layer
2. Use batch requests
3. Add request delays

#### Supabase RLS Blocking Access

**Symptom:** Empty arrays or 403 errors

**Solution:**

1. Check RLS policies in Supabase dashboard
2. Verify JWT token is being sent
3. Test with RLS disabled temporarily

### Debug Mode

#### Backend Debug

```javascript
// Add to server.js for request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
```

#### Frontend Debug

```javascript
// Add to api.js for response logging
api.interceptors.response.use(
    response => {
        console.log('Response:', response.data);
        return response;
    },
    error => {
        console.error('API Error:', error.response?.data);
        return Promise.reject(error);
    }
);
```

---

<div align="center">

**[← Database Schema](./DATABASE_SCHEMA.md)** | **[DevOps Guide →](./DEVOPS_GUIDE.md)**

</div>
