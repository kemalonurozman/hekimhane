import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

// Randevu talebi bildirimleri — asla ana akışı bloklamaz (hepsi try/catch içinde).
// RESEND_API_KEY yoksa sendEmail sessizce atlar.
async function sendRandevuBildirimleri(admin: ReturnType<typeof adminClient>, kayit: {
  entity_type: string; entity_id: string; entity_name: string;
  ad_soyad: string; tel: string; email: string | null;
  tercih: string | null; mesaj: string | null;
}) {
  try {
    const detay =
      satir('İşletme', kayit.entity_name) +
      satir('Ad Soyad', kayit.ad_soyad) +
      satir('Telefon', kayit.tel) +
      satir('E-posta', kayit.email) +
      satir('Tercih', kayit.tercih) +
      satir('Mesaj', kayit.mesaj);
    const bildirimHtml = mailShell('Yeni Randevu Talebi', detay +
      `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Admin panelindeki Talepler sekmesinden yönetebilirsiniz.</p>`);

    // 1) Admin bildirimi (her zaman)
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Yeni randevu talebi — ${kayit.entity_name}`,
      html: bildirimHtml,
      replyTo: kayit.email || undefined,
    });

    // 2) İşletme sahibine bildir. Hedef e-posta:
    //    (a) işletmenin seçtiği randevu_email (varsa) — "farklı adres",
    //    (b) yoksa onaylı claim e-postası — "hesabımla aynı".
    try {
      // İşletmenin ayarladığı bildirim adresi (kolon yoksa sessizce geç)
      let randevuEmail: string | null = null;
      try {
        const TBL: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
        const tbl = TBL[kayit.entity_type];
        if (tbl) {
          const { data: ent } = await (admin as any).from(tbl).select('randevu_email').eq('id', kayit.entity_id).maybeSingle();
          const e = (ent?.randevu_email || '').trim();
          if (e.includes('@')) randevuEmail = e;
        }
      } catch { /* randevu_email kolonu yoksa geç */ }

      const { data: claim } = await (admin as any).from('claim_requests')
        .select('email').eq('entity_id', kayit.entity_id).eq('status', 'approved')
        .not('email', 'is', null).limit(1).maybeSingle();

      const hedef = randevuEmail || claim?.email || null;
      if (hedef && hedef !== ADMIN_EMAIL) {
        const sahipHtml = mailShell('Yeni Randevu Talebiniz Var',
          `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;"><strong>${kayit.entity_name}</strong> işletmeniz için yeni bir randevu talebi geldi. Talep sahibiyle en kısa sürede iletişime geçebilirsiniz:</p>` +
          detay +
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

    if (!error) {
      await addToEmailList(admin, kayit);
      await sendRandevuBildirimleri(admin, kayit);
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
        await sendRandevuBildirimleri(admin, kayit);
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
