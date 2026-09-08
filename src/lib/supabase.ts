import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder strings so the app doesn't crash when
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not configured.
// Replace with real credentials to enable Supabase features.
const supabaseUrl     = (import.meta.env.VITE_SUPABASE_URL     as string) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
