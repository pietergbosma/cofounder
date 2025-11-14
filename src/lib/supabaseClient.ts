// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For development/testing without real Supabase credentials
const isDevelopment = !supabaseUrl || !supabaseAnonKey;

if (isDevelopment) {
  console.warn('⚠️ Supabase environment variables not configured. Using demo mode.');
  console.warn('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
}

// Use placeholder values if not configured (for demo purposes)
const finalUrl = supabaseUrl || 'https://demo.supabase.co';
const finalKey = supabaseAnonKey || 'demo-key';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

export const isSupabaseConfigured = !isDevelopment;
