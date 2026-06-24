import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const admin = adminClient();

    const [
      { count: klinikCount },
      { count: hastaneCount },
      { count: doktorCount },
      { count: eczaneCount },
      { count: klinikClaimed },
      { count: hastaneClaimed },
      { count: pendingCount },
      { count: approvedCount },
      { count: rejectedCount },
      { data: recentClaims },
    ] = await Promise.all([
      admin.from('klinikler').select('*', { count: 'exact', head: true }),
      admin.from('hastaneler').select('*', { count: 'exact', head: true }),
      admin.from('doktorlar').select('*', { count: 'exact', head: true }),
      admin.from('eczaneler').select('*', { count: 'exact', head: true }),
      admin.from('klinikler').select('*', { count: 'exact', head: true }).eq('claimed', true),
      admin.from('hastaneler').select('*', { count: 'exact', head: true }).eq('claimed', true),
      admin.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      admin.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      admin.from('claim_requests').select('id,entity_type,entity_name,claimant_name,ad_soyad,email,status,created_at')
        .order('created_at', { ascending: false }).limit(5),
    ]);

    return NextResponse.json({
      entities: {
        klinik:  klinikCount  ?? 0,
        hastane: hastaneCount ?? 0,
        doktor:  doktorCount  ?? 0,
        eczane:  eczaneCount  ?? 0,
        klinikClaimed:  klinikClaimed  ?? 0,
        hastaneClaimed: hastaneClaimed ?? 0,
      },
      claims: {
        pending:  pendingCount  ?? 0,
        approved: approvedCount ?? 0,
        rejected: rejectedCount ?? 0,
        total: (pendingCount ?? 0) + (approvedCount ?? 0) + (rejectedCount ?? 0),
      },
      recentClaims: recentClaims ?? [],
    });
  } catch (err) {
    console.error('admin/stats error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
