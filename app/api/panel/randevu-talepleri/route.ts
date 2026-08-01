import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role — RLS'yi bypass eder (yalnızca server-side)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );
}

// Kullanıcının onaylı olarak sahiplendiği işletmelerin entity_id listesi.
async function ownedEntityIds(admin: ReturnType<typeof adminClient>, email: string): Promise<string[]> {
  const { data } = await (admin as any).from('claim_requests')
    .select('entity_id').eq('email', email).eq('status', 'approved').not('entity_id', 'is', null);
  return Array.from(new Set(((data as { entity_id: string }[]) || []).map(c => String(c.entity_id))));
}

/**
 * GET — Giriş yapmış kullanıcının, sahiplendiği (onaylı) işletmelere gelen
 * randevu taleplerini döndürür. E-posta SESSION'dan alınır; sahiplik
 * onaylı claim üzerinden doğrulanır. Service-role ile okunur (RLS bypass).
 */
export async function GET(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.length) return NextResponse.json({ talepler: [] });

    const { data, error } = await (admin as any).from('randevu_talepleri')
      .select('*').in('entity_id', ids).order('created_at', { ascending: false });
    if (error) {
      // Tablo henüz yoksa boş dön (özellik pasif)
      return NextResponse.json({ talepler: [] });
    }
    return NextResponse.json({ talepler: data || [] });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}

const VALID_STATUS = ['yeni', 'arandi', 'tamamlandi', 'iptal'];

/**
 * POST — Sahip, kendi işletmesine gelen bir randevu talebinin durumunu
 * günceller. Talebin entity_id'si kullanıcının sahiplendiği işletmelerden
 * biri değilse reddedilir (yetki kontrolü).
 */
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    const { id, status } = await request.json();
    if (!id || !VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);

    // Talep gerçekten bu kullanıcının işletmesine mi ait?
    const { data: talep } = await (admin as any).from('randevu_talepleri')
      .select('entity_id').eq('id', id).maybeSingle();
    if (!talep || !ids.includes(String(talep.entity_id))) {
      return NextResponse.json({ error: 'Bu talep üzerinde yetkiniz yok' }, { status: 403 });
    }

    const { error } = await (admin as any).from('randevu_talepleri')
      .update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
