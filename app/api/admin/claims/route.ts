import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Her istekte taze veri — talep listesi asla cache'lenmesin (yeni başvurular anında görünsün)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

// Claim listesi service-role ile çekilir — claim_requests üzerindeki RLS
// politikaları (profiles özyinelemesi) tarayıcı client'ında sorguyu bozuyor.
export async function GET(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const admin = adminClient();
    const { data, error } = await admin.from('claim_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('admin/claims error:', error.message);
      return NextResponse.json({ error: 'Talepler alınamadı' }, { status: 500 });
    }

    return NextResponse.json({ claims: data ?? [] });
  } catch (err) {
    console.error('admin/claims error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
