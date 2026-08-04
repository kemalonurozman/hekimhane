import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(n: string) { return request.cookies.get(n)?.value; }, set() {}, remove() {} } },
  );
}
async function ownedEntityIds(admin: ReturnType<typeof adminClient>, email: string): Promise<string[]> {
  const { data } = await (admin as any).from('claim_requests')
    .select('entity_id').eq('email', email).eq('status', 'approved').not('entity_id', 'is', null);
  return Array.from(new Set(((data as { entity_id: string }[]) || []).map(c => String(c.entity_id))));
}

/* GET — Sahibin işletmelerine ait tüm hasta kartlarını (kalıcı notları) döndürür. */
export async function GET(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.length) return NextResponse.json({ hastalar: [] });
    const { data, error } = await (admin as any).from('hastalar').select('*').in('entity_id', ids);
    if (error) return NextResponse.json({ hastalar: [], migrationGerekli: true });
    return NextResponse.json({ hastalar: data || [] });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* POST — Bir hastanın kalıcı notunu kaydeder/günceller (entity_id + tel tekil). */
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });

    const b = await request.json();
    const entityId = String(b.entityId || '').trim();
    const tel = String(b.tel || '').replace(/\D/g, '');
    if (!entityId || tel.length < 10) return NextResponse.json({ error: 'Geçersiz hasta bilgisi' }, { status: 400 });

    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.includes(entityId)) return NextResponse.json({ error: 'Bu işletme üzerinde yetkiniz yok' }, { status: 403 });

    const kayit = {
      entity_id: entityId, tel,
      ad: b.ad ? String(b.ad).slice(0, 120) : null,
      email: b.email ? String(b.email).slice(0, 150) : null,
      notlar: b.notlar != null ? String(b.notlar).slice(0, 4000) : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await (admin as any).from('hastalar').upsert(kayit, { onConflict: 'entity_id,tel' });
    if (error) {
      const kolonYok = /relation .*hastalar.* does not exist|schema cache|does not exist/i.test(error.message || '');
      return NextResponse.json({ error: kolonYok ? 'Hasta tablosu yok — add_hastalar.sql çalıştırın.' : 'Kaydedilemedi' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
