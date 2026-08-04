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

/* POST — İşletme sahibi takvimden elle randevu ekler (ör. telefonla gelen hasta).
   Sessiz: hastaya/otomatik mail göndermez. Çakışma kontrolü var. */
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });

    const b = await request.json();
    const entityId = String(b.entityId || '').trim();
    const entityType = String(b.entityType || '').trim();
    const entityName = String(b.entityName || '').slice(0, 200);
    const adSoyad = String(b.ad_soyad || '').trim().slice(0, 100);
    const telDigits = String(b.tel || '').replace(/\D/g, '');
    const slot = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(b.randevu_slot || '').trim()) ? String(b.randevu_slot).trim() : null;

    if (!entityId || !slot) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    if (adSoyad.length < 2) return NextResponse.json({ error: 'Ad soyad gerekli' }, { status: 400 });
    if (telDigits.length < 10) return NextResponse.json({ error: 'Geçerli telefon girin' }, { status: 400 });

    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.includes(entityId)) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });

    // Çakışma
    try {
      const { data: cak } = await (admin as any).from('randevu_talepleri')
        .select('id').eq('entity_id', entityId).eq('randevu_slot', slot).neq('status', 'iptal').limit(1).maybeSingle();
      if (cak) return NextResponse.json({ error: 'Bu saat zaten dolu.' }, { status: 409 });
    } catch { /* kolon yoksa geç */ }

    const kayit: Record<string, unknown> = {
      entity_type: entityType || 'klinik', entity_id: entityId, entity_name: entityName,
      ad_soyad: adSoyad, tel: telDigits,
      email: b.email ? String(b.email).trim().slice(0, 150) : null,
      tercih: slot, randevu_slot: slot, status: 'arandi',
      mesaj: '[Panelden elle eklendi]',
    };
    const { data, error } = await (admin as any).from('randevu_talepleri').insert(kayit).select('*').single();
    if (error) {
      const yok = /randevu_slot|column|schema cache/i.test(error.message || '');
      return NextResponse.json({ error: yok ? 'randevu_slot kolonu yok — add_randevu_takvim.sql çalıştırın.' : 'Eklenemedi' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, talep: data });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
