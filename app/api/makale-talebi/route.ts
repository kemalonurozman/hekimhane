import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';
import { MAKALE_FIYAT, KDV_ORANI, KDV_TUTAR, TOPLAM, PAKET_ICERIK, tl } from '@/lib/makale-fiyat';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Basit IP bazlı rate limit — instance başına 10 dk'da 5 talep.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateMap = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  if (rateMap.size > 5000) {
    const cutoff = now - RATE_WINDOW_MS;
    Array.from(rateMap.entries()).forEach(([k, v]) => {
      if (!v.some(t => t > cutoff)) rateMap.delete(k);
    });
  }
  return false;
}

const s = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Bildirimler — asla ana akışı bloklamaz (hepsi try/catch içinde) ──
async function siparisBildirimleri(k: Record<string, string>) {
  try {
    const detay =
      satir('Makale konusu', k.konu) +
      satir('Web sitesi', k.website) +
      satir('Firma / Klinik', k.firma) +
      satir('Yetkili', k.ad_soyad) +
      satir('E-posta', k.email) +
      satir('Telefon', k.tel) +
      satir('VKN / TCKN', k.vkn) +
      satir('Vergi dairesi', k.vergi_dairesi) +
      satir('Adres', [k.adres, k.posta_kodu, k.il].filter(Boolean).join(', ')) +
      satir('Not', k.not);

    const tutar =
      satir('Tutar (KDV hariç)', `${tl(MAKALE_FIYAT)} TL`) +
      satir(`KDV (%${Math.round(KDV_ORANI * 100)})`, `${tl(KDV_TUTAR)} TL`) +
      satir('Toplam', `${tl(TOPLAM)} TL`);

    // 1) Admin — proforma kesilecek
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Yeni makale siparişi — ${k.firma || k.ad_soyad}`,
      html: mailShell('Yeni Makale Siparişi', detay + '<hr style="border:none;border-top:1px solid #E5E5EA;margin:16px 0;" />' + tutar +
        '<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Proforma faturayı düzenleyip müşteriye gönderin.</p>'),
      replyTo: k.email || undefined,
    });

    // 2) Müşteri — sipariş onayı
    if (k.email) {
      const liste = PAKET_ICERIK
        .map(x => `<li style="font-size:13.5px;color:#3A3A3C;line-height:1.7;">${x}</li>`)
        .join('');
      await sendEmail({
        to: k.email,
        subject: 'Makale siparişiniz alındı — Hekimhane',
        html: mailShell('Makale Siparişiniz Alındı',
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;">Merhaba <strong>${k.ad_soyad}</strong>,</p>` +
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;">İş ortağı makalesi siparişiniz bize ulaştı. Proforma faturanızı en geç <strong>1 iş günü içinde</strong> bu adrese göndereceğiz. Ödeme banka havalesi ile yapılır; ödeme sonrası makale hazırlığına başlarız.</p>` +
          '<hr style="border:none;border-top:1px solid #E5E5EA;margin:16px 0;" />' +
          satir('Makale konusu', k.konu) + tutar +
          `<p style="font-size:13px;color:#6E6E73;margin:16px 0 6px;font-weight:700;">Pakete dahil olanlar</p><ul style="margin:0;padding-left:18px;">${liste}</ul>`),
        replyTo: ADMIN_EMAIL,
      });
    }
  } catch { /* bildirim hatası ana akışı etkilemez */ }
}

async function soruBildirimleri(k: Record<string, string>) {
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Makale yayını sorusu — ${k.firma || k.ad_soyad}`,
      html: mailShell('Makale Yayını Hakkında Soru',
        satir('Ad Soyad', k.ad_soyad) + satir('E-posta', k.email) +
        satir('Firma / Klinik', k.firma) + satir('Mesaj', k.mesaj)),
      replyTo: k.email || undefined,
    });
    if (k.email) {
      await sendEmail({
        to: k.email,
        subject: 'Sorunuz bize ulaştı — Hekimhane',
        html: mailShell('Sorunuz Bize Ulaştı',
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.7;">Merhaba <strong>${k.ad_soyad}</strong>, mesajınızı aldık. En geç 24 saat içinde size dönüş yapacağız.</p>`),
        replyTo: ADMIN_EMAIL,
      });
    }
  } catch { /* bildirim hatası ana akışı etkilemez */ }
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla talep gönderdiniz. Lütfen biraz sonra tekrar deneyin.' }, { status: 429 });
    }

    const b = await req.json();

    // Honeypot: gerçek kullanıcılar bu gizli alanı doldurmaz
    if (b?.hp) return NextResponse.json({ ok: true });

    const tip = b?.tip === 'soru' ? 'soru' : 'siparis';
    const admin = adminClient();

    // ── SORU ──
    if (tip === 'soru') {
      const k = {
        ad_soyad: s(b.ad_soyad, 100),
        email:    s(b.email, 150),
        firma:    s(b.firma, 150),
        mesaj:    s(b.mesaj, 2000),
      };
      if (k.ad_soyad.length < 3) return NextResponse.json({ error: 'Ad ve soyad gerekli.' }, { status: 400 });
      if (!EMAIL_RE.test(k.email)) return NextResponse.json({ error: 'Geçerli bir e-posta girin.' }, { status: 400 });
      if (k.mesaj.length < 10) return NextResponse.json({ error: 'Mesajınız en az 10 karakter olmalı.' }, { status: 400 });

      const notlar = `[MAKALE SORUSU] ${k.firma ? `Firma: ${k.firma} | ` : ''}${k.mesaj}`.slice(0, 2000);
      const { error } = await (admin as any).from('cekim_talepleri').insert({
        isletme_adi:  k.firma || 'Makale Sorusu',
        isletme_turu: 'makale-soru',
        ad_soyad:     k.ad_soyad,
        tel:          '',
        email:        k.email,
        notlar,
        durum:        'beklemede',
      });
      if (error) {
        console.error('makale-talebi (soru) insert error:', error.message);
        return NextResponse.json({ error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
      }
      await soruBildirimleri(k);
      return NextResponse.json({ ok: true });
    }

    // ── SİPARİŞ ──
    const k = {
      konu:          s(b.konu, 200),
      website:       s(b.website, 200),
      firma:         s(b.firma, 200),
      ad_soyad:      s(b.ad_soyad, 100),
      email:         s(b.email, 150),
      tel:           s(b.tel, 30),
      vkn:           s(b.vkn, 20),
      vergi_dairesi: s(b.vergi_dairesi, 100),
      adres:         s(b.adres, 300),
      il:            s(b.il, 60),
      posta_kodu:    s(b.posta_kodu, 10),
      not:           s(b.not, 1000),
    };

    if (k.konu.length < 3)     return NextResponse.json({ error: 'Makale konusu gerekli.' }, { status: 400 });
    if (k.firma.length < 2)    return NextResponse.json({ error: 'Firma / klinik ünvanı gerekli.' }, { status: 400 });
    if (k.ad_soyad.length < 3) return NextResponse.json({ error: 'Yetkili ad soyad gerekli.' }, { status: 400 });
    if (!EMAIL_RE.test(k.email)) return NextResponse.json({ error: 'Geçerli bir e-posta girin.' }, { status: 400 });
    if (!k.vkn)                return NextResponse.json({ error: 'VKN / TCKN gerekli.' }, { status: 400 });
    if (!k.adres || !k.il)     return NextResponse.json({ error: 'Fatura adresi ve il gerekli.' }, { status: 400 });

    const notlar = [
      '[MAKALE SİPARİŞİ]',
      `Konu: ${k.konu}`,
      k.website ? `Site: ${k.website}` : null,
      `Ünvan: ${k.firma}`,
      `VKN/TCKN: ${k.vkn}`,
      k.vergi_dairesi ? `Vergi dairesi: ${k.vergi_dairesi}` : null,
      `Adres: ${[k.adres, k.posta_kodu].filter(Boolean).join(' ')}`,
      `Tutar: ${tl(MAKALE_FIYAT)} TL + KDV = ${tl(TOPLAM)} TL`,
      k.not ? `Not: ${k.not}` : null,
    ].filter(Boolean).join(' | ').slice(0, 2000);

    const { error } = await (admin as any).from('cekim_talepleri').insert({
      isletme_adi:  k.firma,
      isletme_turu: 'makale-siparis',
      il:           k.il,
      ad_soyad:     k.ad_soyad,
      tel:          k.tel.replace(/\D/g, '').slice(0, 15),
      email:        k.email,
      notlar,
      durum:        'beklemede',
    });

    if (error) {
      console.error('makale-talebi (siparis) insert error:', error.message);
      return NextResponse.json({ error: 'Sipariş kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
    }

    await siparisBildirimleri(k);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
