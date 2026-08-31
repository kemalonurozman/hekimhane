import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

const KONULAR: Record<string, string> = {
  genel: 'Genel Soru',
  profil: 'Profil Güncelleme Talebi',
  abonelik: 'Pro Abonelik / Fatura',
  teknik: 'Teknik Sorun',
  diger: 'Diğer',
};

// Hafif rate-limit — oturumlu kullanıcı başına 15 dakikada 5 mesaj
const istekler = new Map<string, number[]>();
function rateLimited(k: string): boolean {
  const simdi = Date.now();
  const g = (istekler.get(k) || []).filter(t => simdi - t < 15 * 60 * 1000);
  if (g.length >= 5) return true;
  g.push(simdi); istekler.set(k, g);
  return false;
}

/**
 * Panel "Hesabım" destek formu — mesaj Resend ile doğrudan admin'e gider.
 * Gönderen kimliği oturumdan alınır (taklit edilemez); yanıtla (reply-to)
 * doğrudan kullanıcıya döner. Onaylı işletmeleri de e-postaya eklenir ki
 * hangi hesaptan geldiği tek bakışta anlaşılsın.
 */
export async function POST(request: NextRequest) {
  try {
    const sess = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } });
    const { data: { session } } = await sess.auth.getSession();
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });

    if (rateLimited(email)) {
      return NextResponse.json({ error: 'Çok fazla mesaj gönderildi. Lütfen biraz sonra tekrar deneyin.' }, { status: 429 });
    }

    const { konu, mesaj } = await request.json().catch(() => ({}));
    const konuEtiket = KONULAR[String(konu)] || KONULAR.genel;
    const metin = String(mesaj || '').trim();
    if (metin.length < 10) return NextResponse.json({ error: 'Lütfen mesajınızı biraz daha ayrıntılı yazın.' }, { status: 400 });
    if (metin.length > 4000) return NextResponse.json({ error: 'Mesaj çok uzun (en fazla 4000 karakter).' }, { status: 400 });

    // Gönderenin onaylı işletmeleri — mail'de kimlik bağlamı
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: claims } = await (admin as any)
      .from('claim_requests')
      .select('entity_name,entity_type')
      .eq('email', email).eq('status', 'approved')
      .limit(10);
    const isletmeler = (claims || []).map((c: any) => `${c.entity_name} (${c.entity_type})`).join(' · ') || '—';

    const esc = (s: string) => s.replace(/[<>&]/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[ch] || ch));
    const sonuc = await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[PANEL DESTEK] ${konuEtiket} — ${email}`,
      html: mailShell(`Panel destek mesajı: ${konuEtiket}`, `
        ${satir('Gönderen', email)}
        ${satir('Onaylı işletmeleri', isletmeler)}
        ${satir('Konu', konuEtiket)}
        <div style="margin-top:14px;padding:14px;background:#F8FAFC;border:1px solid #E5E5EA;border-radius:10px;font-size:14px;color:#1c1c1e;line-height:1.7;white-space:pre-wrap;">${esc(metin)}</div>
        <p style="font-size:12px;color:#6E6E73;margin-top:14px;">Bu e-postayı doğrudan yanıtlayabilirsiniz — yanıt kullanıcıya gider.</p>
      `),
    });

    if (!sonuc.ok) {
      return NextResponse.json({ error: 'Mesaj şu an gönderilemedi. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('panel/destek error:', e?.message || e);
    return NextResponse.json({ error: 'Mesaj gönderilemedi.' }, { status: 500 });
  }
}
