import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'hasta-dosyalari';

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

/* POST — Hastayı sistemden tamamen sil.
   Yalnızca giriş yapan sahibin işletmelerine ait, verilen telefona bağlı TÜM kayıtları siler:
   randevu talepleri + hasta notu + işlem/tedavi geçmişi + dosyalar (storage dahil).
   Telefon normalize edilerek (yalnız rakamlar) eşleştirilir. Geri alınamaz. */
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await sessionClient(request).auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });

    const b = await request.json();
    const normTel = String(b.tel || '').replace(/\D/g, '');
    if (normTel.length < 10) return NextResponse.json({ error: 'Geçersiz telefon' }, { status: 400 });

    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);
    if (!ids.length) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });

    const sonuc = { randevu: 0, islem: 0, dosya: 0, not: 0 };

    // 1) Randevu talepleri — tel formatlı olabilir; sahip işletmelerinden çek, normalize edip filtrele, id ile sil
    try {
      const { data: talepler } = await (admin as any).from('randevu_talepleri')
        .select('id, tel, entity_id').in('entity_id', ids);
      const silIds = (talepler as any[] || [])
        .filter(t => String(t.tel || '').replace(/\D/g, '') === normTel)
        .map(t => t.id);
      if (silIds.length) {
        const { error } = await (admin as any).from('randevu_talepleri').delete().in('id', silIds);
        if (!error) sonuc.randevu = silIds.length;
      }
    } catch { /* tablo yoksa geç */ }

    // 2) Dosyalar — önce storage'dan sil, sonra kayıtları
    try {
      const { data: dosyalar } = await (admin as any).from('hasta_dosyalari')
        .select('id, yol, tel, entity_id').in('entity_id', ids);
      const hedef = (dosyalar as any[] || []).filter(d => String(d.tel || '').replace(/\D/g, '') === normTel);
      if (hedef.length) {
        const yollar = hedef.map(d => d.yol).filter(Boolean);
        if (yollar.length) { try { await admin.storage.from(BUCKET).remove(yollar); } catch { /* geç */ } }
        const { error } = await (admin as any).from('hasta_dosyalari').delete().in('id', hedef.map(d => d.id));
        if (!error) sonuc.dosya = hedef.length;
      }
    } catch { /* tablo yoksa geç */ }

    // 3) İşlem / tedavi geçmişi
    try {
      const { data: islemler } = await (admin as any).from('hasta_islemleri')
        .select('id, tel, entity_id').in('entity_id', ids);
      const hedef = (islemler as any[] || []).filter(x => String(x.tel || '').replace(/\D/g, '') === normTel);
      if (hedef.length) {
        const { error } = await (admin as any).from('hasta_islemleri').delete().in('id', hedef.map(x => x.id));
        if (!error) sonuc.islem = hedef.length;
      }
    } catch { /* tablo yoksa geç */ }

    // 4) Hasta notu / etiket kartı
    try {
      const { data: notlar } = await (admin as any).from('hastalar')
        .select('id, tel, entity_id').in('entity_id', ids);
      const hedef = (notlar as any[] || []).filter(n => String(n.tel || '').replace(/\D/g, '') === normTel);
      if (hedef.length) {
        const { error } = await (admin as any).from('hastalar').delete().in('id', hedef.map(n => n.id));
        if (!error) sonuc.not = hedef.length;
      }
    } catch { /* tablo yoksa geç */ }

    return NextResponse.json({ ok: true, ...sonuc });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
