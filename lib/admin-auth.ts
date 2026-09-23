import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

/**
 * Admin oturumunu Supabase Auth SUNUCUSUNDA doğrular.
 *
 * Neden getSession() değil: sunucu tarafında getSession() çerezdeki JWT'yi
 * imzasını doğrulamadan okur; e-postası ADMIN_EMAIL olan elle üretilmiş bir
 * çerez tüm service-role rotalarını açardı. getUser() token'ı Auth sunucusuna
 * götürüp doğrulatır — sahte/iptal edilmiş oturum geçmez.
 *
 * Tüm app/api/admin/* rotaları bunu kullanır.
 */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  try {
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } },
    );
    const { data: { user }, error } = await sb.auth.getUser();
    return !error && !!user && user.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}
