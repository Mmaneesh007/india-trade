-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);
-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
-- Enable RLS (Row Level Security)
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only see their own watchlist
CREATE POLICY "Users can view own watchlist" ON watchlist FOR
SELECT USING (auth.uid() = user_id);
-- Policy: Users can add to their watchlist
CREATE POLICY "Users can insert own watchlist" ON watchlist FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Policy: Users can delete from their watchlist
CREATE POLICY "Users can delete own watchlist" ON watchlist FOR DELETE USING (auth.uid() = user_id);