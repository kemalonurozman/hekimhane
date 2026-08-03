import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell } from '@/lib/email';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(n: string) { return request.cookies.get(n)?.value; }, set() {}, remove() {} } },
  );
}

async function ownedEntityIds(admin: ReturnType<typeof adminClient>, email: string): Promise<string[]> {
  const { data } = await (admin as any).from('claim_requests')
    .select('entity_id').eq('email', email).eq('status', 'approved').not('entity_id', 'is', null);
  return Array.from(new Set(((data as { entity_id: string }[]) || []).map(c => String(c.entity_id))));
}

const esc = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* POST — İşletme sahibi, kendi işletmesine gelen bir randevu talebindeki
   hastaya panelden e-posta gönderir. Yetki: talebin entity'si sahibin
   onaylı işletmelerinden biri olmalı; hasta e-posta bırakmış olmalı. */
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const { talepId, konu, mesaj } = await request.json() as { talepId?: string; konu?: string; mesaj?: string };
    if (!talepId) return NextResponse.json({ error: 'Talep bilgisi eksik' }, { status: 400 });
    if (!mesaj || String(mesaj).trim().length < 5) {
      return NextResponse.json({ error: 'Mesaj en az 5 karakter olmalı.' }, { status: 400 });
    }

    const admin = adminClient();
    const ids = await ownedEntityIds(admin, session.user.email);

    const { data: talep } = await (admin as any).from('randevu_talepleri')
      .select('entity_id, entity_name, ad_soyad, email').eq('id', talepId).maybeSingle();
    if (!talep || !ids.includes(String(talep.entity_id))) {
      return NextResponse.json({ error: 'Bu talep üzerinde yetkiniz yok' }, { status: 403 });
    }
    if (!talep.email || !String(talep.email).includes('@')) {
      return NextResponse.json({ error: 'Bu hasta e-posta bırakmamış; mail gönderilemez.' }, { status: 400 });
    }

    const konuSon = (konu && String(konu).trim()) || `${talep.entity_name} — Randevunuz hakkında`;
    const govde = esc(String(mesaj).trim()).replace(/\n/g, '<br>');

    const res = await sendEmail({
      to: String(talep.email),
      subject: String(konuSon).slice(0, 160),
      replyTo: session.user.email,   // hasta doğrudan işletmeye cevaplayabilsin
      html: mailShell('Mesajınız var', `
        <p style="font-size:14px;color:#1c1c1e;line-height:1.6;">Merhaba <strong>${esc(talep.ad_soyad || '')}</strong>,</p>
        <p style="font-size:14px;color:#1c1c1e;line-height:1.7;">${govde}</p>
        <p style="font-size:12px;color:#6E6E73;line-height:1.6;margin-top:16px;">
          Bu mesaj <strong>${esc(talep.entity_name || '')}</strong> tarafından Hekimhane üzerinden gönderilmiştir.
          Yanıtlarsanız doğrudan işletmeye ulaşır.
        </p>`),
    });

    // sendEmail: { ok, skipped, error }. Key yoksa skipped=true.
    if (res.skipped) {
      return NextResponse.json({ error: 'E-posta servisi yapılandırılmamış (RESEND_API_KEY). Yönetici eklemeli.' }, { status: 503 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'E-posta gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
