import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir, satirTel } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

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
  abonelik: 'Pro Abonelik / Fatura',
  'abonelik-iptali': 'Pro Abonelik İptal Talebi',
  diger: 'Diğer',
};

/** İptal talebi ayrı e-posta başlığı + acil rozet alır — sıradan mesaj kuyruğunda kaybolmasın. */
const IPTAL_KONULARI = ['abonelik-iptali'];

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const { ad, soyad, email, tel, konu, mesaj, website, isletme } = b || {};

    // Honeypot
    if (website) return NextResponse.json({ ok: true });

    const adSoyad = `${(ad || '').trim()} ${(soyad || '').trim()}`.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (adSoyad.length < 3) return NextResponse.json({ error: 'Ad ve soyad gerekli.' }, { status: 400 });
    if (!email || !re.test(String(email))) return NextResponse.json({ error: 'Geçerli bir e-posta girin.' }, { status: 400 });
    if (!mesaj || String(mesaj).trim().length < 10) return NextResponse.json({ error: 'Mesajınız en az 10 karakter olmalı.' }, { status: 400 });

    const konuEtiket = KONULAR[konu] || 'Genel';
    const iptalMi = IPTAL_KONULARI.includes(String(konu));
    const isletmeAdi = String(isletme || '').trim().slice(0, 150);
    const onek = iptalMi ? 'ABONELİK İPTALİ' : 'İLETİŞİM';
    const notlar = `[${onek} — ${konuEtiket}]${isletmeAdi ? ` İşletme: ${isletmeAdi} —` : ''} ${String(mesaj).trim()}`.slice(0, 2000);

    const admin = adminClient();
    const { error } = await (admin as any).from('cekim_talepleri').insert({
      isletme_adi: isletmeAdi || 'İletişim Formu',
      isletme_turu: iptalMi ? 'abonelik-iptali' : 'iletisim',
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

    // ── E-posta bildirimleri (best-effort; RESEND_API_KEY yoksa sessizce atlar) ──
    const kullaniciEmail = String(email).trim();
    try {
      // 1) Admin'e bildirim — yanıtla dediğinde doğrudan kullanıcıya gider
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: iptalMi ? `ABONELİK İPTAL TALEBİ — ${isletmeAdi || adSoyad}` : `Yeni iletişim mesajı — ${konuEtiket}`,
        replyTo: kullaniciEmail,
        html: mailShell(iptalMi ? 'Abonelik İptal Talebi' : 'Yeni İletişim Mesajı', `
          ${satir('Konu', konuEtiket)}
          ${isletmeAdi ? satir('İşletme', isletmeAdi) : ''}
          ${satir('Ad Soyad', adSoyad)}
          ${satir('E-posta', kullaniciEmail)}
          ${satirTel('Telefon', String(tel || ''))}
          <div style="margin:14px 0 4px;border-top:1px solid #E5E5EA;padding-top:14px;">
            <strong style="color:#6E6E73;font-size:14px;">Mesaj:</strong>
            <p style="margin:6px 0 0;font-size:14px;color:#1c1c1e;line-height:1.6;white-space:pre-wrap;">${String(mesaj).trim().replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c))}</p>
          </div>
          <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">Bu e-postayı yanıtlayarak doğrudan kullanıcıya dönüş yapabilirsiniz.</p>
        `),
      });
      // 2) Kullanıcıya onay
      await sendEmail({
        to: kullaniciEmail,
        subject: iptalMi ? 'İptal talebiniz alındı — Hekimhane' : 'Mesajınız alındı — Hekimhane',
        html: mailShell(iptalMi ? 'İptal Talebiniz Alındı' : 'Mesajınız Alındı', `
          <p style="margin:0 0 12px;font-size:14px;color:#1c1c1e;line-height:1.6;">Merhaba ${adSoyad.split(' ')[0] || ''},</p>
          ${iptalMi
            ? `<p style="margin:0 0 12px;font-size:14px;color:#1c1c1e;line-height:1.6;">Hekimhane-Pro abonelik iptal talebinizi aldık. Talebiniz <strong>1 iş günü</strong> içinde işleme alınır; iptal tamamlandığında bu adrese bilgi e-postası gönderilir. Aboneliğiniz, içinde bulunduğunuz ödeme döneminin sonuna kadar açık kalır ve yeni ödeme alınmaz.</p>`
            : `<p style="margin:0 0 12px;font-size:14px;color:#1c1c1e;line-height:1.6;">Bize ulaştığınız için teşekkürler. Mesajınızı aldık ve en geç <strong>24 saat</strong> içinde size dönüş yapacağız.</p>`}
          <div style="background:#FBF8F2;border-radius:12px;padding:14px 16px;margin:14px 0;">
            ${satir('Konu', konuEtiket)}
            ${isletmeAdi ? satir('İşletme', isletmeAdi) : ''}
            <p style="margin:6px 0;font-size:14px;color:#1c1c1e;"><strong style="color:#6E6E73;">Mesajınız:</strong></p>
            <p style="margin:4px 0 0;font-size:13.5px;color:#6E6E73;line-height:1.6;white-space:pre-wrap;">${String(mesaj).trim().replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c))}</p>
          </div>
        `),
      });
    } catch (e) {
      console.error('iletisim mail error:', e instanceof Error ? e.message : e);
      // mail hatası akışı bozmaz — kayıt zaten alındı
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
