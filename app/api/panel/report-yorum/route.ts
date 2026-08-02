import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, mailShell, satir } from '@/lib/email';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );
}

/* ── POST: işletme sahibi bir yorumu şikayet eder ── */
export async function POST(request: NextRequest) {
  try {
    // 1. Oturum kontrolü
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
    }

    const body = await request.json();
    const { yorumId, reason } = body as { yorumId?: string; reason?: string };

    if (!yorumId) {
      return NextResponse.json({ error: 'Yorum ID eksik' }, { status: 400 });
    }
    if (!reason || !String(reason).trim()) {
      return NextResponse.json({ error: 'Şikayet gerekçesi boş olamaz.' }, { status: 400 });
    }

    const admin = adminClient();

    // 2. Yorumun hangi işletmeye ait olduğunu bul
    const { data: yorum, error: yorumErr } = await (admin as any)
      .from('yorumlar')
      .select('id, entity_id, entity_type, author, rating, text, report_status')
      .eq('id', yorumId)
      .single();

    if (yorumErr || !yorum) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
    }

    // 3. Kullanıcının bu işletme için onaylı claim'i olduğunu doğrula
    const { data: claim } = await (admin as any)
      .from('claim_requests')
      .select('id, entity_name')
      .eq('email', session.user.email!)
      .eq('entity_id', yorum.entity_id)
      .eq('status', 'approved')
      .maybeSingle();

    if (!claim) {
      return NextResponse.json({ error: 'Bu işletmeye ait yorumu şikayet etme yetkiniz yok' }, { status: 403 });
    }

    // 4. Zaten sonuçlanmış şikayeti tekrar açma; bekleyeni güncelle
    const { error: updateErr } = await (admin as any)
      .from('yorumlar')
      .update({
        report_status: 'pending',
        report_reason: String(reason).trim().slice(0, 1000),
        reported_by:   session.user.email,
        reported_at:   new Date().toISOString(),
      })
      .eq('id', yorumId);

    if (updateErr) {
      const msg = updateErr.message?.includes('report_status') || updateErr.message?.includes('column')
        ? 'Veritabanında şikayet kolonları bulunamadı. Lütfen "add_yorum_moderation.sql" migration\'ını çalıştırın.'
        : updateErr.message;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 5. Admin'e bilgilendirme maili (graceful — key yoksa atlar)
    const entityName = claim.entity_name || yorum.entity_id;
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Yorum şikayeti — ${entityName}`,
      replyTo: session.user.email || undefined,
      html: mailShell('Yeni yorum şikayeti', `
        <p style="font-size:14px;color:#1c1c1e;margin:0 0 12px;">Bir işletme sahibi bir yorumu şikayet etti. Admin panelinden inceleyin.</p>
        ${satir('İşletme', entityName)}
        ${satir('Şikayet eden', session.user.email)}
        ${satir('Yorum sahibi', yorum.author)}
        ${satir('Puan', `${yorum.rating}/5`)}
        ${satir('Yorum', yorum.text)}
        ${satir('Gerekçe', String(reason).trim())}
        <p style="margin:16px 0 0;"><a href="https://www.hekimhane.com.tr/admin" style="color:#1B3A69;font-weight:700;">Admin → Şikayetler</a></p>
      `),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('report-yorum error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
