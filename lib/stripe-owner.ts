import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/** Stripe rotalarının ortak yetki katmanı — checkout, portal ve subscription aynı kuralı kullanır. */

export const VALID_ENTITY = ['klinik', 'hastane', 'doktor', 'eczane'];

export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

function sessionClient(request: NextRequest) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } });
}

type OwnerOk = { ok: true; email: string; entity_type: string; entity_id: string };
type OwnerFail = { ok: false; error: string; status: number };

/**
 * Oturumu doğrular ve bu e-postanın işletme için **onaylı** sahiplenme talebi
 * olduğunu kontrol eder. Sahiplik = claim_requests'te status='approved' e-posta eşleşmesi
 * (projedeki diğer panel API'leriyle aynı desen).
 */
export async function verifyOwner(
  request: NextRequest,
  entity_type: unknown,
  entity_id: unknown,
): Promise<OwnerOk | OwnerFail> {
  const sess = sessionClient(request);
  const { data: { session } } = await sess.auth.getSession();
  const email = session?.user?.email;
  if (!email) return { ok: false, error: 'Giriş yapmanız gerekiyor.', status: 401 };

  if (typeof entity_type !== 'string' || !VALID_ENTITY.includes(entity_type) || !entity_id) {
    return { ok: false, error: 'Geçersiz işletme.', status: 400 };
  }

  const { data: claim } = await (adminClient() as any)
    .from('claim_requests')
    .select('id')
    .eq('email', email)
    .eq('entity_type', entity_type)
    .eq('entity_id', String(entity_id))
    .eq('status', 'approved')
    .maybeSingle();

  if (!claim) {
    return { ok: false, error: 'Bu işletmeyi yönetme yetkiniz yok (onaylı sahiplik gerekli).', status: 403 };
  }
  return { ok: true, email, entity_type, entity_id: String(entity_id) };
}
