import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, mailShell, satir, satirTel } from '@/lib/email';
import { ADMIN_EMAIL } from '@/lib/admin-auth';
import { BOOKING_ROLLER, BOOKING_KANALLAR, BOOKING_HACIM, BOOKING_TALEPLER, etiketBul } from '@/lib/booking';
import { IL_LISTE } from '@/lib/tr-il-ilce';

/*
 * Hekimhane Booking başvuruları (kurulum için arama / demo talebi).
 * - Tablo `booking_bekleme` (RLS açık, politika yok → yalnız service-role).
 * - Aynı e-posta tekrar gelirse yeni satır açılmaz, bilgiler güncellenir.
 * - Tablo henüz yoksa (migration çalışmadıysa) kayıt kaybolmasın diye
 *   admin e-postası yine gider; ziyaretçiye başarı döner.
 * - Bülten kutusu işaretlendiyse e-posta listesine (email_aboneleri) de eklenir.
 */

const kirp = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const ROL_IDLER = new Set(BOOKING_ROLLER.map(r => r.id));
const KANAL_IDLER = new Set(BOOKING_KANALLAR.map(k => k.id));
const HACIM_IDLER = new Set(BOOKING_HACIM.map(h => h.id));
const ILLER = new Set(IL_LISTE);

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }

  // Bot tuzakları: gizli alan dolu ya da form 3 sn'den kısa sürede gönderildi → sessizce "tamam"
  const sure = Number(body?.t) ? Date.now() - Number(body.t) : 99999;
  if (body?.website || sure < 3000) return NextResponse.json({ ok: true });

  const ad = kirp(body?.ad, 60);
  const soyad = kirp(body?.soyad, 60);
  const email = kirp(body?.email, 160).toLowerCase();
  const tel = kirp(body?.tel, 30);
  const rol = kirp(body?.rol, 30);
  const talep = body?.talep === 'demo' ? 'demo' : 'kurulum';
  const kurum_adi = kirp(body?.kurum_adi, 160) || null;
  const il = ILLER.has(kirp(body?.il, 40)) ? kirp(body?.il, 40) : null;
  const kanallar = Array.isArray(body?.kanallar)
    ? Array.from(new Set((body.kanallar as unknown[]).filter((k): k is string => typeof k === 'string' && KANAL_IDLER.has(k))))
    : [];
  const cagri_hacmi = HACIM_IDLER.has(kirp(body?.cagri_hacmi, 20)) ? kirp(body?.cagri_hacmi, 20) : null;
  const mesaj = kirp(body?.mesaj, 800) || null;
  const bulten = body?.bulten === true;

  if (body?.izin !== true) return NextResponse.json({ error: 'Devam etmek için iletişim onayını işaretleyin.' }, { status: 400 });
  if (!ad || !soyad) return NextResponse.json({ error: 'Adınızı ve soyadınızı yazın.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: 'Geçerli bir e-posta adresi yazın.' }, { status: 400 });
  if (tel.replace(/\D/g, '').length < 10) return NextResponse.json({ error: 'Geçerli bir telefon numarası yazın.' }, { status: 400 });
  if (!ROL_IDLER.has(rol)) return NextResponse.json({ error: 'Kim olduğunuzu seçin.' }, { status: 400 });

  const kayit = { ad, soyad, email, tel, rol, talep, kurum_adi, il, kanallar, cagri_hacmi, mesaj, bulten };
  const db = supabaseAdmin() as any;

  // ── Kaydet (varsa güncelle) ──
  let tekrar = false;
  let tabloYok = false;
  try {
    const { data: var_ } = await db.from('booking_bekleme').select('id').eq('email', email).limit(1);
    if (var_ && var_.length) {
      tekrar = true;
      const { error } = await db.from('booking_bekleme')
        .update({ ...kayit, updated_at: new Date().toISOString() })
        .eq('id', var_[0].id);
      if (error) throw error;
    } else {
      const { error } = await db.from('booking_bekleme').insert(kayit);
      if (error) throw error;
    }
  } catch (e: any) {
    // 42P01 / PGRST205: tablo yok (migration çalışmamış) → e-postayla yine de ulaştır
    if (e?.code === '42P01' || e?.code === 'PGRST205' || /booking_bekleme/.test(e?.message || '')) {
      tabloYok = true;
      console.error('booking_bekleme tablosu yok — add_booking_bekleme.sql çalıştırılmalı', e?.message);
    } else {
      console.error('booking_bekleme kayıt hatası:', e);
      return NextResponse.json({ error: 'Kaydınız alınamadı. Lütfen biraz sonra tekrar deneyin.' }, { status: 500 });
    }
  }

  // ── Bülten izni verildiyse genel e-posta listesine de ekle (check-then-insert) ──
  if (bulten) {
    try {
      const { data: abone } = await db.from('email_aboneleri').select('id')
        .eq('email', email).eq('tip', 'isletme').is('entity_id', null).limit(1);
      if (!abone || !abone.length) {
        await db.from('email_aboneleri').insert({ email, isim: `${ad} ${soyad}`, tip: 'isletme', kaynak: 'booking', aktif: true });
      }
    } catch { /* bülten kaydı ana akışı bozmaz */ }
  }

  // ── Bildirimler (hiçbiri ana akışı bozmaz) ──
  const kanalMetni = kanallar.map(k => etiketBul(BOOKING_KANALLAR, k)).join(', ');
  try {
    const detay =
      satir('Talep', etiketBul(BOOKING_TALEPLER, talep)) +
      satir('Ad Soyad', `${ad} ${soyad}`) +
      satirTel('Telefon', tel) +
      satir('E-posta', email) +
      satir('Kim', etiketBul(BOOKING_ROLLER, rol)) +
      satir('Kurum', kurum_adi) +
      satir('İl', il) +
      satir('İlgilendiği kanallar', kanalMetni) +
      satir('Çağrı yoğunluğu', cagri_hacmi ? etiketBul(BOOKING_HACIM, cagri_hacmi) : null) +
      satir('Not', mesaj) +
      satir('Bülten izni', bulten ? 'Evet' : 'Hayır');
    const uyari = tabloYok
      ? `<p style="margin:14px 0 0;padding:10px 12px;border-radius:10px;background:#FFF4E5;color:#8A4B00;font-size:13px;"><strong>Dikkat:</strong> booking_bekleme tablosu yok, kayıt veritabanına yazılamadı. supabase/migrations/add_booking_bekleme.sql çalıştırılmalı. Bu e-postayı saklayın.</p>`
      : `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Admin panelinde “Booking Başvuruları” sekmesinden takip edebilirsiniz. Başvuranı arayın.</p>`;
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${tekrar ? 'Güncellendi — ' : ''}Hekimhane Booking ${talep === 'demo' ? 'demo talebi' : 'başvurusu'}: ${ad} ${soyad} — arayın`,
      html: mailShell(talep === 'demo' ? 'Yeni demo talebi' : 'Yeni Hekimhane Booking başvurusu', detay + uyari),
      replyTo: email,
    });
  } catch { /* yok say */ }

  if (!tekrar) {
    try {
      await sendEmail({
        to: email,
        subject: talep === 'demo' ? 'Hekimhane Booking demo talebinizi aldık' : 'Hekimhane Booking başvurunuzu aldık',
        html: mailShell(talep === 'demo' ? 'Demo talebinizi aldık' : 'Başvurunuzu aldık',
          `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#1c1c1e;">Merhaba ${ad.replace(/[<>&]/g, '')},</p>
           <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#1c1c1e;">${talep === 'demo' ? 'Demo talebinizi aldık. Ekibimiz sizi arayıp uygun bir saatte asistanı canlı olarak gösterecek.' : 'Başvurunuzu aldık. Ekibimiz kurulum hakkında bilgi vermek ve size yardımcı olmak için kısa süre içinde sizi arayacak.'}</p>
           <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#1c1c1e;">Hekimhane Booking; telefon çağrılarınızı ve mesajlarınızı 7/24 yanıtlayan, randevu alan bir yapay zekâ asistanıdır. Hizmet, <strong>Ozvelo.com</strong> ortaklığıyla sunulmaktadır.</p>
           <p style="margin:16px 0 0;"><a href="https://www.hekimhane.com.tr/booking" style="display:inline-block;background:#1A335E;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;padding:11px 20px;">Hekimhane Booking’i inceleyin</a></p>
           <p style="margin:16px 0 0;font-size:12px;color:#6E6E73;line-height:1.6;">Bu e-postayı Hekimhane Booking sayfasındaki formu doldurduğunuz için aldınız. Sorularınız için bu e-postayı yanıtlayabilirsiniz.</p>`),
        replyTo: 'info@hekimhane.com.tr',
      });
    } catch { /* yok say */ }
  }

  return NextResponse.json({ ok: true, tekrar });
}
