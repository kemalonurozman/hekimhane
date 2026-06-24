import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum kontrolü
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
    }

    const body = await request.json();
    const { yorumId, replyText, deleteReply } = body;

    if (!yorumId) {
      return NextResponse.json({ error: 'Yorum ID eksik' }, { status: 400 });
    }

    const admin = adminClient();

    // 2. Bu yorumun hangi işletmeye ait olduğunu bul
    const { data: yorum, error: yorumErr } = await (admin as any)
      .from('yorumlar')
      .select('entity_id, entity_type')
      .eq('id', yorumId)
      .single();

    if (yorumErr || !yorum) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
    }

    // 3. Kullanıcının bu işletme için onaylı claim'i olduğunu doğrula
    const { data: claim } = await (admin as any)
      .from('claim_requests')
      .select('id')
      .eq('email', session.user.email!)
      .eq('entity_id', yorum.entity_id)
      .eq('status', 'approved')
      .maybeSingle();

    if (!claim) {
      return NextResponse.json({ error: 'Bu işletmeye yanıt verme yetkiniz yok' }, { status: 403 });
    }

    // 4. Yanıtı güncelle
    const updateData = deleteReply
      ? { reply_text: null, reply_at: null }
      : { reply_text: String(replyText || '').trim(), reply_at: new Date().toISOString() };

    const { error: updateErr } = await (admin as any)
      .from('yorumlar')
      .update(updateData)
      .eq('id', yorumId);

    if (updateErr) {
      // reply_text kolonu eksikse açık hata mesajı ver
      const msg = updateErr.message?.includes('reply_text') || updateErr.message?.includes('column')
        ? 'Veritabanında "reply_text" kolonu bulunamadı. Lütfen Admin → Sistem & DB → SQL migration\'ı çalıştırın.'
        : updateErr.message;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('reply-yorum error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
