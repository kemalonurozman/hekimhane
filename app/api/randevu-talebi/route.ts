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

// Basit IP bazlı rate limit — instance başına 10 dk'da 5 talep.
// (Serverless'ta instance'lar arası paylaşılmaz; temel spam koruması sağlar.)
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateMap = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  // Map büyümesin
  if (rateMap.size > 5000) {
    const cutoff = now - RATE_WINDOW_MS;
    Array.from(rateMap.entries()).forEach(([k, v]) => {
      if (!v.some(t => t > cutoff)) rateMap.delete(k);
    });
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla talep gönderdiniz. Lütfen biraz sonra tekrar deneyin.' }, { status: 429 });
    }

    const body = await req.json();
    const { entity_type, entity_id, entity_name, ad_soyad, tel, email, tercih, mesaj, website } = body || {};

    // Honeypot: gerçek kullanıcılar bu gizli alanı doldurmaz
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!VALID_TYPES.includes(entity_type) || !entity_id || !entity_name) {
      return NextResponse.json({ error: 'Geçersiz işletme bilgisi.' }, { status: 400 });
    }
    if (!ad_soyad || String(ad_soyad).trim().length < 3) {
      return NextResponse.json({ error: 'Ad soyad gerekli.' }, { status: 400 });
    }
    const telDigits = String(tel || '').replace(/\D/g, '');
    if (telDigits.length < 10 || telDigits.length > 15) {
      return NextResponse.json({ error: 'Geçerli bir telefon numarası girin.' }, { status: 400 });
    }

    const admin = adminClient();
    const kayit = {
      entity_type,
      entity_id: String(entity_id),
      entity_name: String(entity_name).slice(0, 200),
      ad_soyad: String(ad_soyad).trim().slice(0, 100),
      tel: telDigits,
      email: email ? String(email).trim().slice(0, 150) : null,
      tercih: tercih ? String(tercih).trim().slice(0, 200) : null,
      mesaj: mesaj ? String(mesaj).trim().slice(0, 1000) : null,
    };

    // Önce özel tabloya yaz
    const { error } = await (admin as any).from('randevu_talepleri').insert(kayit);

    if (!error) return NextResponse.json({ ok: true });

    // Tablo henüz oluşturulmadıysa cekim_talepleri'ne düş — talep kaybolmasın.
    // Admin panelindeki "Çekim Talepleri" sekmesinde RANDEVU rozetiyle görünür.
    const tabloYok = /schema cache|does not exist/i.test(error.message || '');
    if (tabloYok) {
      const notlar = [
        '[RANDEVU TALEBİ]',
        kayit.tercih ? `Tercih: ${kayit.tercih}` : null,
        kayit.mesaj ? `Not: ${kayit.mesaj}` : null,
      ].filter(Boolean).join(' | ');

      const { error: fbErr } = await (admin as any).from('cekim_talepleri').insert({
        isletme_adi: kayit.entity_name,
        isletme_turu: `randevu-${entity_type}`,
        entity_id: kayit.entity_id,
        ad_soyad: kayit.ad_soyad,
        tel: kayit.tel,
        email: kayit.email,
        notlar,
        durum: 'beklemede',
      });
      if (!fbErr) return NextResponse.json({ ok: true });
      console.error('randevu-talebi fallback error:', fbErr.message);
    } else {
      console.error('randevu-talebi insert error:', error.message);
    }

    return NextResponse.json({ error: 'Talep kaydedilemedi. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
