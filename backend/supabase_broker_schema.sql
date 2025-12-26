-- Broker Sessions Table
-- Stores user broker connections and tokens
CREATE TABLE IF NOT EXISTS broker_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker VARCHAR(50) NOT NULL,
    tokens JSONB,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
-- Enable RLS
ALTER TABLE broker_sessions ENABLE ROW LEVEL SECURITY;
-- RLS Policy: Users can only access their own sessions
CREATE POLICY "Users can view own broker sessions" ON broker_sessions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own broker sessions" ON broker_sessions FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own broker sessions" ON broker_sessions FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own broker sessions" ON broker_sessions FOR DELETE USING (auth.uid() = user_id);
-- Index for faster lookups
CREATE INDEX idx_broker_sessions_user_id ON broker_sessions(user_id);
-----------------------------------------------------------
-- Order History Table
-- Logs all orders placed through the platform
CREATE TABLE IF NOT EXISTS order_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) DEFAULT 'NSE',
    transaction_type VARCHAR(10) NOT NULL,
    -- BUY or SELL
    order_type VARCHAR(20) DEFAULT 'MARKET',
    product_type VARCHAR(20) DEFAULT 'DELIVERY',
    quantity INTEGER NOT NULL,
    price DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PLACED',
    broker VARCHAR(50) NOT NULL,
    modify_params JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);
-- Enable RLS
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
-- RLS Policy: Users can only access their own orders
CREATE POLICY "Users can view own orders" ON order_history FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON order_history FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON order_history FOR
UPDATE USING (auth.uid() = user_id);
-- Indexes
CREATE INDEX idx_order_history_user_id ON order_history(user_id);
CREATE INDEX idx_order_history_order_id ON order_history(order_id);
CREATE INDEX idx_order_history_created_at ON order_history(created_at DESC);