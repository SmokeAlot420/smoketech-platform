/**
 * Supabase Client for Server-Side Operations
 * Used for persistent operation storage across hot-reloads
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase not configured. Operation store will use in-memory fallback.');
}

// Create Supabase client (server-side with service key for full access)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export const isSupabaseConfigured = !!supabase;
