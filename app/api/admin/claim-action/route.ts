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

const TABLE_MAP: Record<string, string> = {
  klinik:  'klinikler',
  hastane: 'hastaneler',
  doktor:  'doktorlar',
  eczane:  'eczaneler',
};

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum doğrula
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { claimId, action } = await request.json();
    if (!claimId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const admin = adminClient();

    // 2. Talebi bul
    const { data: claim, error: fetchErr } = await admin
      .from('claim_requests')
      .select('*')
      .eq('id', claimId)
      .single();

    if (fetchErr || !claim) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 3. Talep durumunu güncelle
    const { error: updateErr } = await admin
      .from('claim_requests')
      .update({ status: newStatus })
      .eq('id', claimId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 4. Onaylandıysa → işletmeyi "claimed = true" yap
    if (action === 'approve' && claim.entity_id && claim.entity_id !== 'new') {
      const table = TABLE_MAP[claim.entity_type];
      if (table) {
        await admin.from(table).update({ claimed: true }).eq('id', claim.entity_id);
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('claim-action error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
