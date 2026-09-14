import { NextResponse, type NextRequest } from 'next/server';
import { sahipEpostasi } from '@/lib/yonetici';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir, satirTel } from '@/lib/email';
import { isletmeBilgisi, profilSatiri } from '@/lib/entity-link';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

// "YYYY-MM-DD HH:MM" slotundan Google Takvim "etkinlik ekle" bağlantısı üretir.
function googleTakvimUrl(kayit: { entity_name: string; ad_soyad: string; tel: string; email: string | null; mesaj: string | null; randevu_slot?: string | null }): string | null {
  const m = kayit.randevu_slot && /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(kayit.randevu_slot);
  if (!m) return null;
  const [, Y, Mo, D, H, Mi] = m;
  const bas = (+H) * 60 + (+Mi);
  const bit = bas + 30;   // 30 dk varsayılan
  const eh = String(Math.floor(bit / 60) % 24).padStart(2, '0');
  const em = String(bit % 60).padStart(2, '0');
  const start = `${Y}${Mo}${D}T${H}${Mi}00`;
  const end = `${Y}${Mo}${D}T${eh}${em}00`;
  const detay = [`Hasta: ${kayit.ad_soyad}`, `Telefon: ${kayit.tel}`, kayit.email ? `E-posta: ${kayit.email}` : '', kayit.mesaj ? `Not: ${kayit.mesaj}` : '', '', 'Hekimhane randevu talebi'].filter(Boolean).join('\n');
  const p = new URLSearchParams({ action: 'TEMPLATE', text: `Randevu — ${kayit.ad_soyad}`, dates: `${start}/${end}`, details: detay, location: kayit.entity_name });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// Randevu talebi bildirimleri — asla ana akışı bloklamaz (hepsi try/catch içinde).
// RESEND_API_KEY yoksa sendEmail sessizce atlar.
async function sendRandevuBildirimleri(admin: ReturnType<typeof adminClient>, kayit: {
  entity_type: string; entity_id: string; entity_name: string;
  ad_soyad: string; tel: string; email: string | null;
  tercih: string | null; mesaj: string | null; randevu_slot?: string | null;
}) {
  try {
    // İşletme özeti: profil linki + işletmeye kayıtlı e-posta. Sahip bildirimi
    // için hedef adres de aynı çözümlemeden çıkar (önce panelden ayarlanan
    // randevu_email, sonra profil e-postası, sonra onaylı sahip hesabı).
    const b = await isletmeBilgisi(admin, kayit.entity_type, kayit.entity_id);
    let sahipEmail: string | null = null;
    try {
      sahipEmail = await sahipEpostasi(admin as any, kayit.entity_id);
    } catch { /* sahip bulunamadı — sorun değil */ }

    const isletmeEmail = b.randevuEmail || b.profilEmail || sahipEmail;
    const emailKaynak = b.randevuEmail ? 'randevu bildirim adresi' : b.profilEmail ? 'profil e-postası' : sahipEmail ? 'sahip hesabı' : null;
    const isletmeEmailSatiri = isletmeEmail
      ? `<p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">İşletme E-postası:</strong> <a href="mailto:${isletmeEmail}" style="color:#1B3A69;font-weight:600;">${isletmeEmail}</a> <span style="font-size:12px;color:#6E6E73;">(${emailKaynak})</span></p>`
      : `<p style="margin:6px 0;font-size:14px;"><strong style="color:#6E6E73;">İşletme E-postası:</strong> <span style="color:#B45309;font-weight:600;">Eklenmemiş</span> <span style="font-size:12px;color:#6E6E73;">— işletmeye kayıtlı e-posta yok, talebi telefonla iletin</span></p>`;

    // Admin'e: işletme bloğu + talep bloğu. Sahibe/hastaya: yalnız talep bloğu.
    const isletmeBlok =
      satir('İşletme', kayit.entity_name) +
      (b.konum ? satir('Konum', b.konum) : '') +
      profilSatiri(b.url) +
      isletmeEmailSatiri +
      `<hr style="border:0;border-top:1px solid #E5E5EA;margin:12px 0;">`;
    const detay =
      satir('Ad Soyad', kayit.ad_soyad) +
      satirTel('Telefon', kayit.tel) +
      satir('E-posta', kayit.email) +
      satir('Tercih', kayit.tercih) +
      satir('Mesaj', kayit.mesaj);
    const calUrl = googleTakvimUrl(kayit);
    const calBtn = calUrl
      ? `<div style="margin:16px 0 4px;"><a href="${calUrl}" style="display:inline-block;background:#D4A843;color:#12294B;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;padding:11px 20px;">Google Takvim'e Ekle</a></div>`
      : '';
    const bildirimHtml = mailShell('Yeni Randevu Talebi', isletmeBlok + detay +
      `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Admin panelindeki Talepler sekmesinden yönetebilirsiniz.</p>`);

    // 1) Admin bildirimi (her zaman)
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Yeni randevu talebi — ${kayit.entity_name}`,
      html: bildirimHtml,
      replyTo: kayit.email || undefined,
    });

    // 2) İşletme sahibine bildir — hedef yukarıda çözülen işletme e-postası.
    try {
      const hedef = isletmeEmail;
      if (hedef && hedef !== ADMIN_EMAIL) {
        const sahipHtml = mailShell('Yeni Randevu Talebiniz Var',
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${kayit.entity_name}</strong> işletmeniz için yeni bir randevu talebi geldi. Talep sahibiyle en kısa sürede iletişime geçebilirsiniz:</p>` +
          detay +
          calBtn +
          `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Bu bildirim Hekimhane üzerinden gönderilmiştir.</p>`);
        await sendEmail({
          to: hedef,
          subject: `Yeni randevu talebiniz var — ${kayit.entity_name}`,
          html: sahipHtml,
          replyTo: kayit.email || undefined,
        });
      }
    } catch { /* sahip bulunamadı — sorun değil */ }

    // 3) Hastaya onay (e-posta verdiyse)
    if (kayit.email) {
      await sendEmail({
        to: kayit.email,
        subject: `Randevu talebiniz alındı — ${kayit.entity_name}`,
        html: mailShell('Randevu Talebiniz Alındı',
          `<p style="font-size:14px;color:#1c1c1e;">Merhaba <strong>${kayit.ad_soyad}</strong>,</p>` +
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${kayit.entity_name}</strong> için randevu talebiniz başarıyla alındı. İşletme en kısa sürede <strong>${kayit.tel}</strong> numaranızdan sizinle iletişime geçecektir.</p>` +
          (kayit.tercih ? satir('Tercihiniz', kayit.tercih) : '')),
      });
    }
  } catch { /* bildirim hatası ana akışı etkilemez */ }
}

// Müşteri e-posta bıraktıysa e-posta listesine (email_aboneleri) 'randevu'
// kaynağıyla ekle. Ana akışı asla bloklamaz.
async function addToEmailList(admin: ReturnType<typeof adminClient>, kayit: {
  email: string | null; ad_soyad: string; entity_id: string; entity_type: string; entity_name: string;
}) {
  if (!kayit.email || !kayit.email.includes('@')) return;
  const emailN = kayit.email.trim().toLowerCase();
  try {
    // email_aboneleri'nde 'email,tip,entity_id' için unique constraint yok →
    // upsert onConflict çalışmaz. Elle kontrol edip yoksa ekliyoruz.
    let q = (admin as any).from('email_aboneleri').select('id')
      .eq('email', emailN).eq('tip', 'hasta');
    q = kayit.entity_id ? q.eq('entity_id', kayit.entity_id) : q.is('entity_id', null);
    const { data: existing } = await q.limit(1);
    if (existing && existing.length) return; // zaten kayıtlı
    await (admin as any).from('email_aboneleri').insert({
      email: emailN,
      isim: kayit.ad_soyad || null,
      tip: 'hasta',
      kaynak: 'randevu',
      entity_id: kayit.entity_id || null,
      entity_type: kayit.entity_type || null,
      entity_name: kayit.entity_name || null,
      aktif: true,
    });
  } catch { /* liste kaydı ana akışı etkilemez */ }
}

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
    const { entity_type, entity_id, entity_name, ad_soyad, tel, email, tercih, mesaj, website, randevu_slot } = body || {};
    // Slot formatı: "YYYY-MM-DD HH:MM" (yerel; saat dilimi dönüşümü yok)
    const slot = randevu_slot && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(randevu_slot).trim())
      ? String(randevu_slot).trim() : null;

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

    // Slot bazlı ise: aynı işletme + aynı slot zaten alınmış mı? (çakışma)
    if (slot) {
      try {
        const { data: cakisan } = await (admin as any).from('randevu_talepleri')
          .select('id').eq('entity_id', String(entity_id)).eq('randevu_slot', slot)
          .neq('status', 'iptal').limit(1).maybeSingle();
        if (cakisan) {
          return NextResponse.json({ error: 'Seçtiğiniz saat az önce doldu. Lütfen başka bir saat seçin.' }, { status: 409 });
        }
      } catch { /* randevu_slot kolonu yoksa kontrolü atla */ }
    }

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
    // Slot yalnızca varsa insert'e eklenir (kolon yoksa diğer talepler etkilenmesin)
    const insertKayit = slot ? { ...kayit, randevu_slot: slot } : kayit;

    // Önce özel tabloya yaz
    const { error } = await (admin as any).from('randevu_talepleri').insert(insertKayit);

    if (!error) {
      await addToEmailList(admin, kayit);
      await sendRandevuBildirimleri(admin, { ...kayit, randevu_slot: slot || null });
      return NextResponse.json({ ok: true });
    }

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
      if (!fbErr) {
        await addToEmailList(admin, kayit);
        await sendRandevuBildirimleri(admin, { ...kayit, randevu_slot: slot || null });
        return NextResponse.json({ ok: true });
      }
      console.error('randevu-talebi fallback error:', fbErr.message);
    } else {
      console.error('randevu-talebi insert error:', error.message);
    }

    return NextResponse.json({ error: 'Talep kaydedilemedi. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
