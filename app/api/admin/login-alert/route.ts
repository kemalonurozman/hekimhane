import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

// Admin hesabına giriş yapıldığında uyarı maili gönderir.
// Token, istemcinin başarılı girişten hemen sonra gönderdiği access_token'dır;
// getUser ile doğrulanır (yalnızca gerçek admin oturumu tetikleyebilir).
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return NextResponse.json({ error: 'token yok' }, { status: 401 });

    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: { user }, error } = await anon.auth.getUser(token);
    if (error || !user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'yetkisiz' }, { status: 403 });
    }

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'bilinmiyor';
    const ua = req.headers.get('user-agent') || 'bilinmiyor';
    const zaman = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'full', timeStyle: 'medium' });

    // Bilgilendirme — hata olsa da giriş akışını etkilemez.
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'Hekimhane admin paneline giriş yapıldı',
      html: mailShell('Admin Girişi Bildirimi',
        `<p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Hekimhane admin paneline (<strong>${ADMIN_EMAIL}</strong>) bir giriş yapıldı.</p>` +
        satir('Zaman', zaman) +
        satir('IP', ip) +
        satir('Cihaz / Tarayıcı', ua) +
        `<p style="margin-top:14px;font-size:12px;color:#6E6E73;">Bu girişi siz yapmadıysanız şifrenizi değiştirin.</p>`),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'hata' }, { status: 400 });
  }
}
