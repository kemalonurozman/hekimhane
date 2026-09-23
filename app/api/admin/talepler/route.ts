import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest } from '@/lib/admin-auth';

// Her istekte taze — yeni talepler anında görünsün
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/*
 * Admin › Randevu & Çekim sekmesi.
 * Eskiden sayfa bu iki tabloyu tarayıcıdan (anon anahtar) okuyup yazıyordu;
 * bu da tablolarda herkese açık SELECT/UPDATE politikası gerektiriyordu —
 * hasta adı/telefon/e-posta public anahtarla okunabiliyordu. Artık yalnızca
 * burada, service-role ile ve admin oturumu doğrulanarak erişilir.
 */

// randevu_talepleri.status ↔ cekim_talepleri.durum eşlemesi
const RANDEVU_TO_DURUM: Record<string, string> = {
  yeni: 'beklemede', arandi: 'iletisime_gecildi', tamamlandi: 'tamamlandi', iptal: 'iptal',
};
const DURUM_TO_RANDEVU: Record<string, string> = {
  beklemede: 'yeni', iletisime_gecildi: 'arandi', tamamlandi: 'tamamlandi', iptal: 'iptal',
};

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const tabloYok = (msg?: string) => /does not exist|could not find|relation .* not/i.test(msg || '');

// GET → çekim + randevu talepleri, tarihe göre birleşik
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const db = adminClient() as any;

    const { data: cekimData, error: cErr } = await db.from('cekim_talepleri')
      .select('*').order('created_at', { ascending: false });
    if (cErr && !tabloYok(cErr.message)) {
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }
    const cekim = (cekimData || []).map((t: any) => ({ ...t, _source: 'cekim' }));

    // Randevu talepleri (tablo henüz oluşturulmadıysa sessizce atla)
    let randevu: any[] = [];
    const { data: rData, error: rErr } = await db.from('randevu_talepleri')
      .select('*').order('created_at', { ascending: false });
    if (rErr && !tabloYok(rErr.message)) {
      return NextResponse.json({ error: rErr.message }, { status: 500 });
    }
    if (rData) {
      randevu = rData.map((r: any) => ({
        id: r.id,
        isletme_adi: r.entity_name,
        isletme_turu: `randevu-${r.entity_type}`,
        il: null, ilce: null,
        ad_soyad: r.ad_soyad,
        tel: r.tel,
        email: r.email,
        notlar: [r.tercih ? `Tercih: ${r.tercih}` : null, r.mesaj ? `Not: ${r.mesaj}` : null].filter(Boolean).join(' | ') || null,
        durum: RANDEVU_TO_DURUM[r.status] || 'beklemede',
        created_at: r.created_at,
        _source: 'randevu',
      }));
    }

    const talepler = [...cekim, ...randevu]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ talepler });
  } catch (err) {
    console.error('admin/talepler GET error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST { id, source: 'cekim'|'randevu', durum } → durumu doğru tabloya yaz
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const { id, source, durum } = await request.json();
    if (!id || !durum || !(durum in DURUM_TO_RANDEVU)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }
    const db = adminClient() as any;
    const { error } = source === 'randevu'
      ? await db.from('randevu_talepleri').update({ status: DURUM_TO_RANDEVU[durum] }).eq('id', id)
      : await db.from('cekim_talepleri').update({ durum }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin/talepler POST error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
