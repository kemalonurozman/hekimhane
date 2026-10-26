import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir, esc } from '@/lib/email';
import { isletmeBilgisi } from '@/lib/entity-link';
import { epostaNormal } from '@/lib/sahiplik';
import { uyumTuru } from '@/lib/profil-ozet';
import { HATALI_BILGI_KONULARI, UYUM_SURE } from '@/lib/uyum';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 6;
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

const KONU_AD: Record<string, string> = Object.fromEntries(HATALI_BILGI_KONULARI.map(k => [k.v, k.ad]));

/* ── POST: "Bilgileri düzelt" (doktor/yetkili) ve "Hatalı bilgi bildir" (hasta) ──
   DDL yok: kayıt cekim_talepleri'ne isletme_turu='bilgi-duzelt' | 'hatali-bilgi'
   ile düşer (admin Randevu & Çekim listesinde görünür). Admin'e bildirim,
   e-posta bırakana onay gider. Sağlık bilgisi istenmez (form notu). */
export async function POST(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return NextResponse.json({ error: 'Çok fazla bildirim gönderildi. Lütfen biraz sonra tekrar deneyin.' }, { status: 429 });

  let b: any;
  try { b = await request.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  if (b?.website) return NextResponse.json({ ok: true });   // bot tuzağı

  const mod: 'duzelt' | 'hatali' = b?.mod === 'duzelt' ? 'duzelt' : 'hatali';
  const tur = uyumTuru(b?.entity_type);
  const id = String(b?.entity_id || '').slice(0, 100);
  if (!tur || !id) return NextResponse.json({ error: 'Profil bilgisi eksik.' }, { status: 400 });

  const konu = String(b?.konu || '');
  if (!KONU_AD[konu]) return NextResponse.json({ error: 'Hangi bilginin hatalı olduğunu seçin.' }, { status: 400 });

  const aciklama = String(b?.aciklama || '').trim().slice(0, 1500);
  if (aciklama.length < 5) return NextResponse.json({ error: mod === 'duzelt' ? 'Doğru bilgiyi yazın.' : 'Kısa bir açıklama yazın.' }, { status: 400 });

  const eposta = epostaNormal(b?.email);
  const epostaGecerli = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta);
  // Düzeltme talebinde e-posta zorunlu (sonuç bildirimi için); hasta bildiriminde isteğe bağlı
  if (mod === 'duzelt' && !epostaGecerli) return NextResponse.json({ error: 'Sonuç bildirimi için geçerli bir e-posta girin.' }, { status: 400 });
  if (eposta && !epostaGecerli) return NextResponse.json({ error: 'E-posta adresi geçersiz.' }, { status: 400 });

  const kaynak = String(b?.kaynak || '').trim().slice(0, 300);
  const adSoyad = String(b?.ad_soyad || '').trim().slice(0, 120);

  const admin = adminClient();
  const bilgi = await isletmeBilgisi(admin, tur, id);
  if (!bilgi.ad) return NextResponse.json({ error: 'Profil bulunamadı.' }, { status: 404 });

  const etiket = mod === 'duzelt' ? 'BİLGİ DÜZELTME TALEBİ' : 'HATALI BİLGİ BİLDİRİMİ';
  try {
    await (admin as any).from('cekim_talepleri').insert({
      isletme_adi: bilgi.ad, isletme_turu: mod === 'duzelt' ? 'bilgi-duzelt' : 'hatali-bilgi', entity_id: id,
      ad_soyad: adSoyad || (mod === 'duzelt' ? 'Profil sahibi' : 'Ziyaretçi'), tel: '-', email: eposta || null,
      notlar: [`[${etiket}]`, `Tür: ${tur}`, `Konu: ${KONU_AD[konu]}`, `${mod === 'duzelt' ? 'Doğru bilgi' : 'Açıklama'}: ${aciklama}`, kaynak ? `Kaynak: ${kaynak}` : null].filter(Boolean).join(' | '),
      durum: 'beklemede',
    });
  } catch (e) {
    console.error('profil bildirim insert:', e);
  }

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${mod === 'duzelt' ? 'Bilgi düzeltme talebi' : 'Hatalı bilgi bildirimi'} — ${bilgi.ad} (${KONU_AD[konu]})`,
      html: mailShell(mod === 'duzelt' ? 'Bilgi Düzeltme Talebi' : 'Hatalı Bilgi Bildirimi',
        satir('Profil', bilgi.ad) + satir('Tür', tur) + satir('Konum', bilgi.konum) +
        (bilgi.url ? `<p style="margin:6px 0;font-size:14px;"><strong style="color:#6E6E73;">Profil:</strong> <a href="${esc(bilgi.url)}" style="color:#1A335E;">${esc(bilgi.url.replace(/^https?:\/\/(www\.)?/, ''))}</a></p>` : '') +
        `<hr style="border:0;border-top:1px solid #E5E5EA;margin:12px 0;">` +
        satir('Konu', KONU_AD[konu]) + satir(mod === 'duzelt' ? 'Doğru bilgi' : 'Açıklama', aciklama) + satir('Kaynak / belge', kaynak || null) +
        satir('Bildiren', adSoyad || null) + satir('E-posta', eposta || null) +
        `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Kayıt admin panelinde Randevu &amp; Çekim listesinde (${mod === 'duzelt' ? 'bilgi-duzelt' : 'hatali-bilgi'}). Düzeltmeler editör kontrolünden sonra en geç ${UYUM_SURE.inceleme_is_gunu} iş günü içinde yayına alınmalı.</p>`),
      replyTo: epostaGecerli ? eposta : undefined,
    });
    if (epostaGecerli) {
      await sendEmail({
        to: eposta,
        subject: mod === 'duzelt' ? `Düzeltme talebiniz alındı — ${bilgi.ad}` : `Bildiriminiz alındı — ${bilgi.ad}`,
        html: mailShell(mod === 'duzelt' ? 'Düzeltme talebiniz alındı' : 'Bildiriminiz alındı',
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${esc(bilgi.ad)}</strong> profili için ${mod === 'duzelt' ? 'düzeltme talebinizi' : 'hatalı bilgi bildiriminizi'} aldık (${esc(KONU_AD[konu])}). ${mod === 'duzelt'
            ? `Düzeltmeler editör kontrolünden sonra en geç ${UYUM_SURE.inceleme_is_gunu} iş günü içinde yayına alınır.`
            : 'Bildiriminiz editörlerimiz tarafından incelenir.'}</p>` +
          `<p style="font-size:13px;color:#6E6E73;margin-top:12px;">Saygılarımızla, Hekimhane Ekibi</p>`),
      });
    }
  } catch { /* e-posta ana akışı düşürmez */ }

  return NextResponse.json({ ok: true });
}
