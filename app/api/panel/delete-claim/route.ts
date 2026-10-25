import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { claimedEsitle } from '@/lib/sahiplik';

export const dynamic = 'force-dynamic';

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
    { cookies: { get(name: string) { return request.cookies.get(name)?.value; }, set() {}, remove() {} } },
  );
}

const TABLE_MAP: Record<string, string> = {
  klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler',
};

/**
 * Kullanıcı kendi sahiplenme başvurusunu iptal edip siler.
 * - E-postayı SESSION'dan alır; yalnızca kendi (email eşleşen) başvurusunu silebilir.
 * - Başvuru onaylıysa silindikten sonra işletmenin claimed önbelleği yeniden hesaplanır:
 *   başka sahip kalmadıysa false olur (eskiden yönetici kendi satırını silse ya da
 *   ikinci sahip olsa da koşulsuz false yazılıyordu).
 */
export async function POST(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    const { claimId } = await request.json();
    if (!claimId) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });

    const admin = adminClient();
    const { data: claim, error: fErr } = await admin.from('claim_requests').select('*').eq('id', claimId).single();
    if (fErr || !claim) return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 });

    // Yalnızca sahibi silebilir
    if ((claim.email || '').trim().toLowerCase() !== session.user.email.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Bu başvuruyu silme yetkiniz yok' }, { status: 403 });
    }

    const { error: dErr } = await admin.from('claim_requests').delete().eq('id', claimId);
    if (dErr) {
      console.error('delete-claim error:', dErr.message);
      return NextResponse.json({ error: 'Başvuru silinemedi' }, { status: 500 });
    }

    // Onaylı erişim silindiyse "claimed" önbelleğini yeniden hesapla (hata silmeyi engellemez)
    if (claim.status === 'approved' && claim.entity_id && claim.entity_id !== 'new' && TABLE_MAP[claim.entity_type]) {
      await claimedEsitle(admin, claim.entity_type, claim.entity_id);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('delete-claim error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
