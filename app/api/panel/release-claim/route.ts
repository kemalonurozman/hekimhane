import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Service role — RLS bypass, yalnız server-side
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Cookie tabanlı session — kullanıcıyı doğrular
function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return request.cookies.get(name)?.value; }, set() {}, remove() {} } }
  );
}

const TABLE_MAP: Record<string, string> = {
  klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler',
};
const PATH_MAP: Record<string, string> = {
  klinik: '/klinikler', hastane: '/hastaneler', doktor: '/doktorlar', eczane: '/eczaneler',
};

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });

    const { claimId } = await request.json();
    if (!claimId) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });

    // 2. Claim bu kullanıcıya ait ve onaylı mı?
    const admin = adminClient();
    const { data: claim } = await admin.from('claim_requests')
      .select('id, entity_type, entity_id, email, status')
      .eq('id', claimId).single();
    const c = claim as { id: string; entity_type: string; entity_id: string | null; email: string | null; status: string } | null;
    if (!c || c.email !== session.user.email || c.status !== 'approved') {
      return NextResponse.json({ error: 'Bu işletmenin sahipliğini bırakma yetkiniz yok' }, { status: 403 });
    }

    // 3. Entity'yi sahiplenilmemiş yap (premium + online randevu da kapanır)
    const table = TABLE_MAP[c.entity_type];
    if (table && c.entity_id && c.entity_id !== 'new') {
      await (admin as any).from(table).update({ claimed: false, premium: false }).eq('id', c.entity_id);
      // randevu_aktif kolonu yoksa akış bozulmasın — best-effort
      try { await (admin as any).from(table).update({ randevu_aktif: false }).eq('id', c.entity_id); } catch { /* kolon yok */ }
    }

    // 4. Claim kaydını sil — sahiplik tamamen bırakılır (kullanıcı dilerse yeniden sahiplenebilir)
    await admin.from('claim_requests').delete().eq('id', claimId);

    // 5. Cache tazele — liste + profil "sahiplenilmemiş" olarak görünsün
    const basePath = PATH_MAP[c.entity_type];
    if (basePath) { revalidatePath(basePath, 'layout'); revalidatePath('/', 'layout'); }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('release-claim error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
