import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const VALID_TYPES = ['klinik', 'hastane', 'doktor', 'eczane'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity_type, entity_id, entity_name, ad_soyad, tel, email, tercih, mesaj } = body || {};

    if (!VALID_TYPES.includes(entity_type) || !entity_id || !entity_name) {
      return NextResponse.json({ error: 'Geçersiz işletme bilgisi.' }, { status: 400 });
    }
    if (!ad_soyad || String(ad_soyad).trim().length < 3) {
      return NextResponse.json({ error: 'Ad soyad gerekli.' }, { status: 400 });
    }
    const telDigits = String(tel || '').replace(/\D/g, '');
    if (telDigits.length < 10) {
      return NextResponse.json({ error: 'Geçerli bir telefon numarası girin.' }, { status: 400 });
    }

    const admin = adminClient();
    const { error } = await (admin as any).from('randevu_talepleri').insert({
      entity_type,
      entity_id: String(entity_id),
      entity_name: String(entity_name).slice(0, 200),
      ad_soyad: String(ad_soyad).trim().slice(0, 100),
      tel: telDigits.slice(0, 15),
      email: email ? String(email).trim().slice(0, 150) : null,
      tercih: tercih ? String(tercih).trim().slice(0, 200) : null,
      mesaj: mesaj ? String(mesaj).trim().slice(0, 1000) : null,
    });

    if (error) {
      console.error('randevu-talebi insert error:', error.message);
      // Tablo yoksa da kullanıcıya teknik detay sızdırma
      return NextResponse.json({ error: 'Talep kaydedilemedi. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
