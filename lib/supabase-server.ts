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

/**
 * Oturum açmış kullanıcıyı Auth SUNUCUSUNDA doğrulayıp döndürür (yoksa null).
 * getSession() kullanılmaz: sunucuda çerezdeki JWT'yi imzasını doğrulamadan
 * okur (bkz. lib/panel-oturum.ts → dogrulanmisOturum).
 */
export async function getUser() {
  try {
    const supabase = createSupabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    return !error && user ? user : null;
  } catch {
    return null;
  }
}

/** Mevcut kullanıcı profilini döndürür */
export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}
