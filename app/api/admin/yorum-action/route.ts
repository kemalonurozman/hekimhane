import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

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
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
}

/**
 * Admin bir şikayet edilen yorum için son kararı verir:
 *   action='hide'    → yorumu herkese görünmez yap (geri alınabilir), şikayet 'resolved'
 *   action='delete'  → yorumu kalıcı sil
 *   action='dismiss' → şikayeti reddet, yorum görünür kalır ('dismissed')
 *   action='unhide'  → gizlenmiş yorumu tekrar görünür yap
 */
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { yorumId, action, note } = body as {
      yorumId?: string;
      action?: 'hide' | 'delete' | 'dismiss' | 'unhide';
      note?: string;
    };

    if (!yorumId || !action) {
      return NextResponse.json({ error: 'yorumId ve action zorunlu' }, { status: 400 });
    }

    const admin = adminClient();
    const adminNote = note ? String(note).trim().slice(0, 500) : null;

    if (action === 'delete') {
      const { error } = await (admin as any).from('yorumlar').delete().eq('id', yorumId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, deleted: true });
    }

    const patch: Record<string, unknown> =
      action === 'hide'    ? { hidden: true,  report_status: 'resolved',  admin_note: adminNote }
    : action === 'unhide'  ? { hidden: false, report_status: 'dismissed', admin_note: adminNote }
    : action === 'dismiss' ? { hidden: false, report_status: 'dismissed', admin_note: adminNote }
    : {};

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 });
    }

    const { error } = await (admin as any).from('yorumlar').update(patch).eq('id', yorumId);
    if (error) {
      const missing = error.message?.includes('hidden') || error.message?.includes('report_status') || error.message?.includes('column');
      return NextResponse.json(
        { error: missing ? 'Veritabanı kolonları eksik. "add_yorum_moderation.sql" migration\'ını çalıştırın.' : error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin/yorum-action error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
