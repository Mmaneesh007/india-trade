
import { createClient } from '@supabase/supabase-js';

// These values are safe to be public (Anon Key)
const supabaseUrl = 'https://rixmdcgbdzgdccctlfcx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeG1kY2diZHpnZGNjY3RsZmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODU1NTMsImV4cCI6MjA4MTA2MTU1M30.uBsqfUXaZYGp0mWYy38Hsb1ghFArUswxNkawEfxgNR0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
