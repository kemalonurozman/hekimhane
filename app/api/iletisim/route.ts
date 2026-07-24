import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const KONULAR: Record<string, string> = {
  isletme: 'İşletme Ekleme / Güncelleme',
  hata: 'Hata Bildirimi',
  sikayet: 'Yorum / İçerik Şikayeti',
  reklam: 'Reklam / İş Birliği',
  diger: 'Diğer',
};

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const { ad, soyad, email, tel, konu, mesaj, website } = b || {};

    // Honeypot
    if (website) return NextResponse.json({ ok: true });

    const adSoyad = `${(ad || '').trim()} ${(soyad || '').trim()}`.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (adSoyad.length < 3) return NextResponse.json({ error: 'Ad ve soyad gerekli.' }, { status: 400 });
    if (!email || !re.test(String(email))) return NextResponse.json({ error: 'Geçerli bir e-posta girin.' }, { status: 400 });
    if (!mesaj || String(mesaj).trim().length < 10) return NextResponse.json({ error: 'Mesajınız en az 10 karakter olmalı.' }, { status: 400 });

    const konuEtiket = KONULAR[konu] || 'Genel';
    const notlar = `[İLETİŞİM — ${konuEtiket}] ${String(mesaj).trim()}`.slice(0, 2000);

    const admin = adminClient();
    const { error } = await (admin as any).from('cekim_talepleri').insert({
      isletme_adi: 'İletişim Formu',
      isletme_turu: 'iletisim',
      ad_soyad: adSoyad.slice(0, 100),
      tel: String(tel || '').replace(/\D/g, '').slice(0, 15),
      email: String(email).trim().slice(0, 150),
      notlar,
      durum: 'beklemede',
    });

    if (error) {
      console.error('iletisim insert error:', error.message);
      return NextResponse.json({ error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
