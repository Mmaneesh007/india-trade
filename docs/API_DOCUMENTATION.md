# API Documentation

> Complete API Reference for IndiaTrades Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Base URLs](#base-urls)
3. [Authentication](#authentication)
4. [REST Endpoints](#rest-endpoints)
5. [WebSocket Events](#websocket-events)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Overview

The IndiaTrades API provides access to real-time Indian stock market data, portfolio management, and trading capabilities. The API uses a hybrid approach:

- **REST API** - For CRUD operations and data retrieval
- **WebSocket** - For real-time price streaming

### API Features

| Feature | Type | Description |
|---------|------|-------------|
| Stock Quotes | REST + WS | Real-time and historical price data |
| Market Movers | REST | Top gainers, losers, volume shockers |
| Watchlist | REST | User watchlist management |
| Transactions | REST | Trading history and P&L |
| IPO Data | REST | IPO listings and details |
| Mutual Funds | REST | Fund NAVs and performance |

---

## Base URLs

| Environment | URL |
|-------------|-----|
| **Production** | `https://india-trades-backend.onrender.com` |
| **Development** | `http://localhost:4000` |

---

## Authentication

### Supabase JWT Authentication

The API uses Supabase for authentication. Protected endpoints require a valid JWT token.

#### Headers

```http
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

#### Getting a Token

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123'
});

// Use the token
const token = data.session.access_token;
```

---

## REST Endpoints

### Quotes API

#### Get Stock Quote

Retrieves real-time quote for a stock symbol.

```http
GET /api/quotes/:symbol
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Stock symbol (e.g., RELIANCE, TCS) |

**Response:**

```json
{
    "symbol": "RELIANCE",
    "price": 2456.75,
    "change": 23.45,
    "changePercent": 0.96,
    "open": 2440.00,
    "high": 2470.50,
    "low": 2435.25,
    "prevClose": 2433.30,
    "volume": 5234567,
    "timestamp": "2024-12-26T10:30:00.000Z",
    "source": "yahoo"
}
```

---

#### Get Historical Candles

Retrieves historical OHLC candlestick data.

```http
GET /api/quotes/:symbol/candles
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Stock symbol |
| `interval` | string | No | Time interval (default: `1d`) |

**Interval Options:** `1d`, `1wk`, `1mo`

**Response:**

```json
[
    {
        "time": "2024-01-15",
        "open": 2400.00,
        "high": 2425.50,
        "low": 2395.00,
        "close": 2420.75,
        "volume": 4500000
    },
    {
        "time": "2024-01-16",
        "open": 2420.75,
        "high": 2445.00,
        "low": 2410.25,
        "close": 2438.50,
        "volume": 5200000
    }
]
```

---

### Search API

#### Search Stocks

Search for stocks by name or symbol.

```http
GET /api/search?q=:query
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (min 2 chars) |

**Response:**

```json
[
    {
        "symbol": "RELIANCE.NS",
        "name": "Reliance Industries Limited",
        "exchange": "NSE",
        "type": "EQUITY"
    },
    {
        "symbol": "RELIANCEPP.NS",
        "name": "Reliance Industries PP",
        "exchange": "NSE",
        "type": "EQUITY"
    }
]
```

---

### Market Movers API

#### Get Top Gainers

```http
GET /api/movers/gainers
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `count` | number | No | Number of results (default: 20) |
| `index` | string | No | Filter by index: `nifty50`, `nifty100`, `all` |

**Response:**

```json
[
    {
        "symbol": "ADANIENT.NS",
        "name": "Adani Enterprises Ltd",
        "price": 2890.50,
        "change": 145.25,
        "changePercent": 5.29,
        "volume": 8500000,
        "week52High": 3200.00,
        "week52Low": 1800.00,
        "marketCap": "325000 Cr"
    }
]
```

---

#### Get Top Losers

```http
GET /api/movers/losers
```

**Query Parameters:** Same as gainers

**Response:** Same structure as gainers (negative change values)

---

#### Get Volume Shockers

Stocks with unusually high trading volume.

```http
GET /api/movers/volume-shockers
```

**Query Parameters:** Same as gainers

**Response:**

```json
[
    {
        "symbol": "TATASTEEL.NS",
        "name": "Tata Steel Ltd",
        "price": 142.50,
        "change": 2.35,
        "changePercent": 1.68,
        "volume": 45000000,
        "avgVolume": 15000000,
        "volumeRatio": 3.0
    }
]
```

---

#### Get Price Shockers

Stocks with significant intraday price movement.

```http
GET /api/movers/price_shockers
```

**Response:**

```json
[
    {
        "symbol": "SUZLON.NS",
        "name": "Suzlon Energy Ltd",
        "close": 45.80,
        "changePercent": 8.45,
        "high": 48.20,
        "low": 41.50,
        "open": 42.30,
        "volume": 125000000
    }
]
```

---

#### Get 52-Week Highs

```http
GET /api/movers/52-week-high
```

---

#### Get 52-Week Lows

```http
GET /api/movers/52-week-low
```

---

#### Get Trending Stocks (Real-Time API)

Fetches live trending stocks from RapidAPI.

```http
GET /api/movers/trending
```

**Response:**

```json
{
    "gainers": [...],
    "losers": [...],
    "timestamp": "2024-12-26T10:30:00.000Z",
    "source": "rapidapi"
}
```

---

### Market Overview API

#### Get Market Summary

```http
GET /api/market/summary
```

**Response:**

```json
{
    "nifty50": {
        "value": 24180.50,
        "change": 125.30,
        "changePercent": 0.52
    },
    "sensex": {
        "value": 80250.75,
        "change": 420.50,
        "changePercent": 0.53
    },
    "indiaVix": {
        "value": 13.25,
        "change": -0.45
    }
}
```

---

### Market Turnover API

#### Get Market Turnover

```http
GET /api/turnover
```

**Response:**

```json
{
    "totalTurnover": 125000,
    "nseTurnover": 85000,
    "bseTurnover": 40000,
    "fiiNet": 2500,
    "diiNet": -1800,
    "timestamp": "2024-12-26T15:30:00.000Z"
}
```

---

### IPO API

#### Get IPO List

```http
GET /api/ipo/list
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter: `open`, `upcoming`, `listed`, `closed` |

**Response:**

```json
[
    {
        "id": "tata-tech-ipo",
        "name": "Tata Technologies Limited",
        "symbol": "TATATECH.NS",
        "issuePrice": { "min": 475, "max": 500 },
        "gmp": 450,
        "status": "listed",
        "dates": {
            "open": "2023-11-22",
            "close": "2023-11-24",
            "allotment": "2023-11-29",
            "listing": "2023-11-30"
        },
        "listingGain": "+140%",
        "subscriptionTimes": 69.43,
        "sector": "Technology & Engineering"
    }
]
```

---

#### Get IPO Details

```http
GET /api/ipo/:ipoId
```

**Response:**

```json
{
    "id": "tata-tech-ipo",
    "name": "Tata Technologies Limited",
    "symbol": "TATATECH.NS",
    "logo": "https://...",
    "issuePrice": { "min": 475, "max": 500 },
    "lotSize": 30,
    "gmp": 450,
    "subscriptionTimes": {
        "total": 69.43,
        "retail": 9.95,
        "qib": 200.47,
        "nii": 44.03
    },
    "status": "listed",
    "dates": {...},
    "listingPrice": 1200,
    "currentPrice": 1050,
    "listingGain": "+140%",
    "category": "Mainboard",
    "sector": "Technology & Engineering",
    "exchange": "NSE, BSE",
    "issueSize": "₹3,042 Cr",
    "description": "...",
    "keyMetrics": {
        "pe": 42.5,
        "eps": 24.7,
        "marketCap": "₹42,500 Cr"
    }
}
```

---

#### Get IPO Statistics

```http
GET /api/ipo/stats/overview
```

**Response:**

```json
{
    "open": 2,
    "upcoming": 5,
    "listed": 12,
    "closed": 3,
    "totalThisYear": 22,
    "avgListingGain": "+42%"
}
```

---

### Watchlist API

#### Get User Watchlist

```http
GET /api/watchlist/:userId
```

**Headers Required:** `Authorization: Bearer <token>`

**Response:**

```json
[
    {
        "id": "uuid-here",
        "user_id": "user-uuid",
        "symbol": "RELIANCE",
        "added_at": "2024-12-20T10:00:00.000Z"
    },
    {
        "id": "uuid-here",
        "user_id": "user-uuid",
        "symbol": "TCS",
        "added_at": "2024-12-21T14:30:00.000Z"
    }
]
```

---

#### Add to Watchlist

```http
POST /api/watchlist/:userId
```

**Request Body:**

```json
{
    "symbol": "INFY"
}
```

**Response:**

```json
{
    "id": "uuid-here",
    "user_id": "user-uuid",
    "symbol": "INFY",
    "added_at": "2024-12-26T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `SYMBOL_REQUIRED` | Symbol not provided |
| 409 | `ALREADY_EXISTS` | Stock already in watchlist |

---

#### Remove from Watchlist

```http
DELETE /api/watchlist/:userId/:symbol
```

**Response:**

```json
{
    "success": true,
    "message": "Removed from watchlist"
}
```

---

### Transactions API

#### Get User Transactions

```http
GET /api/transactions/:userId
```

**Response:**

```json
[
    {
        "id": "uuid-here",
        "user_id": "user-uuid",
        "symbol": "RELIANCE",
        "type": "BUY",
        "quantity": 10,
        "price": 2450.00,
        "timestamp": "2024-12-25T10:30:00.000Z"
    },
    {
        "id": "uuid-here",
        "user_id": "user-uuid",
        "symbol": "RELIANCE",
        "type": "SELL",
        "quantity": 5,
        "price": 2480.00,
        "timestamp": "2024-12-26T11:00:00.000Z"
    }
]
```

---

#### Get P&L Summary

```http
GET /api/transactions/:userId/summary
```

**Response:**

```json
[
    {
        "symbol": "RELIANCE",
        "totalBought": 24500.00,
        "totalSold": 12400.00,
        "avgBuyPrice": 2450.00,
        "avgSellPrice": 2480.00,
        "quantity": 5,
        "realizedPnL": 150.00,
        "buyCount": 1,
        "sellCount": 1
    }
]
```

---

### Mutual Funds API

#### Get All Mutual Funds

```http
GET /api/mutual_funds
```

**Response:**

```json
{
    "Equity": {
        "Large Cap": [
            {
                "fund_name": "SBI Bluechip Fund",
                "latest_nav": 45.67,
                "percentage_change": 0.45,
                "asset_size": 25000,
                "return_1y": 12.5,
                "return_3y": 40.2,
                "return_5y": 70.5,
                "star_rating": 4
            }
        ],
        "Mid Cap": [...],
        "Small Cap": [...]
    },
    "Debt": {
        "Liquid": [...],
        "Corporate Bond": [...]
    },
    "Hybrid": {
        "Balanced Advantage": [...],
        "Aggressive Hybrid": [...]
    }
}
```

---

## WebSocket Events

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
    transports: ['websocket']
});

socket.on('connect', () => {
    console.log('Connected:', socket.id);
});
```

### Events Reference

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe` | `string` (symbol) | Subscribe to price updates |
| `unsubscribe` | `string` (symbol) | Unsubscribe from symbol |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `price_update` | `QuoteData` | Real-time price update |
| `connect` | - | Connection established |
| `disconnect` | - | Connection lost |

### Usage Example

```javascript
// Subscribe to a stock
socket.emit('subscribe', 'RELIANCE');

// Listen for updates
socket.on('price_update', (data) => {
    console.log('Price update:', data);
    // {
    //     symbol: "RELIANCE",
    //     price: 2456.75,
    //     change: 23.45,
    //     changePercent: 0.96,
    //     timestamp: "2024-12-26T10:30:00.000Z"
    // }
});

// Unsubscribe
socket.emit('unsubscribe', 'RELIANCE');

// Disconnect
socket.disconnect();
```

### Price Update Interval

- **Immediate**: First update on subscription
- **Polling**: Every 5 seconds for active subscriptions

---

## Error Handling

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Error Response Format

```json
{
    "error": "Error message description",
    "code": "ERROR_CODE",
    "details": {}
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `SYMBOL_NOT_FOUND` | Stock symbol doesn't exist |
| `INVALID_SYMBOL` | Malformed symbol format |
| `ALREADY_EXISTS` | Resource already exists |
| `UNAUTHORIZED` | Authentication required |
| `RATE_LIMITED` | Too many requests |

---

## Rate Limiting

### Current Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Quotes API | 100 requests | 1 minute |
| Search API | 30 requests | 1 minute |
| Movers API | 60 requests | 1 minute |
| Watchlist API | 50 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703580000
```

### Handling Rate Limits

```javascript
try {
    const response = await api.get('/api/quotes/RELIANCE');
} catch (error) {
    if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        await sleep(retryAfter * 1000);
        // Retry request
    }
}
```

---

## SDK Usage

### JavaScript/React

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://india-trades-backend.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Get stock quote
const quote = await api.get('/api/quotes/RELIANCE');

// Get market movers
const gainers = await api.get('/api/movers/gainers', {
    params: { count: 10, index: 'nifty50' }
});
```

### cURL Examples

```bash
# Get stock quote
curl -X GET "https://india-trades-backend.onrender.com/api/quotes/RELIANCE"

# Get top gainers
curl -X GET "https://india-trades-backend.onrender.com/api/movers/gainers?count=10"

# Add to watchlist
curl -X POST "https://india-trades-backend.onrender.com/api/watchlist/user123" \
    -H "Content-Type: application/json" \
    -d '{"symbol": "TCS"}'
```

---

<div align="center">

**[← Architecture](./ARCHITECTURE.md)** | **[Database Schema →](./DATABASE_SCHEMA.md)**

</div>
