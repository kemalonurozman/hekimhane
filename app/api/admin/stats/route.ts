import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

// Her istekte taze sayımlar — istatistikler cache'lenmesin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}


export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
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

    // Bekleyen (yeni) randevu talebi sayısı — tablo yoksa 0
    let randevuPending = 0;
    try {
      const { count } = await admin.from('randevu_talepleri')
        .select('*', { count: 'exact', head: true }).eq('status', 'yeni');
      randevuPending = count ?? 0;
    } catch { /* tablo yok */ }

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
      randevuPending,
    });
  } catch (err) {
    console.error('admin/stats error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
