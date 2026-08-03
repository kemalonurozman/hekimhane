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

// Doktorun iletişim bilgilerini (tel+email) gizle/aç
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { doktorId, hidden } = await request.json();
    if (!doktorId || typeof hidden !== 'boolean') {
      return NextResponse.json({ error: 'doktorId ve hidden (boolean) zorunlu' }, { status: 400 });
    }

    const { error } = await adminClient().from('doktorlar').update({ contact_hidden: hidden }).eq('id', doktorId);
    if (error) {
      const missing = error.message?.includes('contact_hidden') || error.message?.includes('column');
      return NextResponse.json(
        { error: missing ? 'Veritabanı "contact_hidden" kolonu eksik. "add_bobath_contact.sql" migration\'ını çalıştırın.' : error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, hidden });
  } catch (err) {
    console.error('admin/toggle-contact error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
