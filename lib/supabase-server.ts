import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Server Components ve Route Handlers için Supabase client
 * (oturum bilgisini cookie'den okur)
 */
export function createSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

/** Oturum açmış kullanıcıyı döndürür (yoksa null) */
export async function getSession() {
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Mevcut kullanıcı profilini döndürür */
export async function getProfile() {
  const session = await getSession();
  if (!session) return null;

  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return data;
}
