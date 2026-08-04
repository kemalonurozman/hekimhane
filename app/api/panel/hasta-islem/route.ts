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

/* GET — Sahibin işletmelerine ait tüm hasta işlemleri. */
export async function GET(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.length) return NextResponse.json({ islemler: [] });
    const { data, error } = await (admin as any).from('hasta_islemleri')
      .select('*').in('entity_id', ids).order('tarih', { ascending: false });
    if (error) return NextResponse.json({ islemler: [], migrationGerekli: true });
    return NextResponse.json({ islemler: data || [] });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* POST — Yeni işlem ekle. */
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
    const b = await request.json();
    const entityId = String(b.entityId || '').trim();
    const tel = String(b.tel || '').replace(/\D/g, '');
    if (!entityId || tel.length < 10) return NextResponse.json({ error: 'Geçersiz hasta bilgisi' }, { status: 400 });
    if (!b.islem || !String(b.islem).trim()) return NextResponse.json({ error: 'İşlem adı gerekli' }, { status: 400 });

    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.includes(entityId)) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });

    const kayit = {
      entity_id: entityId, tel,
      tarih: /^\d{4}-\d{2}-\d{2}$/.test(String(b.tarih || '')) ? b.tarih : new Date().toISOString().split('T')[0],
      islem: String(b.islem).slice(0, 200),
      notlar: b.notlar ? String(b.notlar).slice(0, 2000) : null,
      ucret: b.ucret != null && b.ucret !== '' && !isNaN(Number(b.ucret)) ? Number(b.ucret) : null,
    };
    const { data, error } = await (admin as any).from('hasta_islemleri').insert(kayit).select('*').single();
    if (error) {
      const yok = /relation .*hasta_islemleri.* does not exist|schema cache|does not exist/i.test(error.message || '');
      return NextResponse.json({ error: yok ? 'İşlem tablosu yok — add_hasta_islemleri.sql çalıştırın.' : 'Kaydedilemedi' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, islem: data });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* DELETE — İşlem sil (?id=). */
export async function DELETE(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    const { data: row } = await (admin as any).from('hasta_islemleri').select('entity_id').eq('id', id).maybeSingle();
    if (!row || !ids.includes(String(row.entity_id))) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    const { error } = await (admin as any).from('hasta_islemleri').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
