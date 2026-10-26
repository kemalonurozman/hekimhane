import { NextResponse, type NextRequest } from 'next/server';
import { kaldirmaIstemcisi, kaldirmaTalebiOlustur } from '@/lib/profil-kaldirma';
import { epostaNormal } from '@/lib/sahiplik';
import { uyumTuru } from '@/lib/profil-ozet';

// Basit IP hız sınırı — instance başına 10 dk'da 4 talep (kaldırma formu için yeterli).
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 4;
const rateMap = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  if (rateMap.size > 5000) {
    const cutoff = now - RATE_WINDOW_MS;
    Array.from(rateMap.entries()).forEach(([k, v]) => { if (!v.some(t => t > cutoff)) rateMap.delete(k); });
  }
  return false;
}

/* ── POST: profil kaldırma talebi (oturum gerekmez — hesap açtırılmaz) ──
   Talep gelince profil anında gizlenir; onay bağlantısı e-postaya gider.
   Ayrıntı: lib/profil-kaldirma.ts */
export async function POST(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Çok fazla talep gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.' }, { status: 429 });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }

  // Bot tuzağı — gerçek kullanıcı bu gizli alanı doldurmaz
  if (body?.website) return NextResponse.json({ ok: true });

  const tur = uyumTuru(body?.entity_type);
  const id = String(body?.entity_id || '').slice(0, 100);
  if (!tur || !id) return NextResponse.json({ error: 'Profil bilgisi eksik.' }, { status: 400 });

  const adSoyad = String(body?.ad_soyad || '').trim();
  if (adSoyad.length < 3) return NextResponse.json({ error: 'Ad soyad gerekli.' }, { status: 400 });

  const eposta = epostaNormal(body?.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });

  const talepEden = body?.talep_eden === 'yetkili' ? 'yetkili' : 'sahip';

  const sonuc = await kaldirmaTalebiOlustur(kaldirmaIstemcisi(), {
    entity_type: tur, entity_id: id, ad_soyad: adSoyad, talep_eden: talepEden, email: eposta,
    tel: body?.tel ? String(body.tel).trim() : null,
    aciklama: body?.aciklama ? String(body.aciklama).trim() : null,
    ip,
  });
  if (!sonuc.ok) return NextResponse.json({ error: sonuc.mesaj }, { status: sonuc.durum });
  return NextResponse.json({ ok: true, gizlendi: sonuc.gizlendi, onayBaglantisi: sonuc.onayBaglantisi });
}
