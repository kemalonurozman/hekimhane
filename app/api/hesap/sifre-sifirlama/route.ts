import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';

// Basit IP rate-limit — hesap tarama/spam'e karşı (randevu-talebi ile aynı desen).
const istekler = new Map<string, number[]>();
const PENCERE_MS = 15 * 60 * 1000; // 15 dk
const LIMIT = 5;

function rateLimited(ip: string): boolean {
  const simdi = Date.now();
  const gecmis = (istekler.get(ip) || []).filter(t => simdi - t < PENCERE_MS);
  if (gecmis.length >= LIMIT) return true;
  gecmis.push(simdi);
  istekler.set(ip, gecmis);
  return false;
}

/**
 * Şifre sıfırlama — kullanıcı e-postasını girer, kayıtlıysa tek kullanımlık
 * sıfırlama bağlantısı markalı e-postayla (Resend) gönderilir.
 *
 * Yanıt HER durumda aynıdır ("kayıtlıysa gönderildi") — e-postanın sistemde
 * olup olmadığı dışarı sızdırılmaz (hesap tarama koruması).
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'bilinmiyor';
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.' }, { status: 429 });
    }

    const { email } = await request.json().catch(() => ({}));
    const adres = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!adres || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adres)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } });

    // Tek kullanımlık recovery token'ı üret. Kullanıcı yoksa hata döner —
    // bunu dışarı yansıtmayız, generic yanıt veririz.
    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: adres });

    if (!error && data?.properties?.hashed_token) {
      const link = `${SITE}/sifre-yenile?token_hash=${encodeURIComponent(data.properties.hashed_token)}`;
      const sonuc = await sendEmail({
        to: adres,
        subject: 'Hekimhane — Şifre Sıfırlama',
        html: mailShell('Şifrenizi sıfırlayın', `
          <p style="font-size:14px;color:#1c1c1e;line-height:1.6;margin:0 0 16px;">
            Hekimhane hesabınız için şifre sıfırlama talebi aldık. Yeni şifrenizi
            belirlemek için aşağıdaki butona tıklayın.
          </p>
          <p style="text-align:center;margin:22px 0;">
            <a href="${link}" style="display:inline-block;background:#1B3A69;color:#fff;text-decoration:none;padding:13px 30px;border-radius:12px;font-size:14px;font-weight:700;">
              Yeni Şifre Belirle
            </a>
          </p>
          <p style="font-size:12px;color:#6E6E73;line-height:1.6;margin:16px 0 0;">
            Bağlantı tek kullanımlıktır ve kısa süre içinde geçerliliğini yitirir.
            Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz — şifreniz değişmez.
          </p>
        `),
      });
      // Mail altyapısı gerçek bir hata verdiyse (key eksikliği değil) bunu söyle —
      // kullanıcı boş yere gelen kutusunu beklemesin.
      if (!sonuc.ok && !sonuc.skipped) {
        console.error('sifre-sifirlama mail hatası:', sonuc.error);
        return NextResponse.json({ error: 'E-posta gönderilemedi. Lütfen birazdan tekrar deneyin.' }, { status: 500 });
      }
    } else if (error) {
      // Kullanıcı bulunamadı vb. — loglanır, dışarıya generic yanıt gider.
      console.log('sifre-sifirlama:', error.message);
    }

    return NextResponse.json({ ok: true, message: 'Bu adres kayıtlıysa sıfırlama bağlantısı gönderildi.' });
  } catch (e: any) {
    console.error('sifre-sifirlama error:', e?.message || e);
    return NextResponse.json({ error: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.' }, { status: 500 });
  }
}
