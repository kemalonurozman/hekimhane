import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side veri sorguları için singleton client
// persistSession ve autoRefreshToken kapalı — birden fazla eş zamanlı
// request aynı auth lock'u için yarışmasın (lock stolen hatası önlenir)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:   false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Admin işlemleri için (sadece server-side API route'larında kullanın)
export const supabaseAdmin = () =>
  createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
