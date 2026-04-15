import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side ve server-side için tek client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin işlemleri için (sadece server-side API route'larında kullanın)
export const supabaseAdmin = () =>
  createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
