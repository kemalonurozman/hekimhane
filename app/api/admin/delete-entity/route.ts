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

const VALID_TABLES = ['klinikler', 'hastaneler', 'doktorlar', 'eczaneler'];

export async function DELETE(request: NextRequest) {
  try {
    // 1. Oturum doğrula — sadece admin silebilir
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { entityId, entityType } = await request.json();

    if (!entityId || !entityType || !VALID_TABLES.includes(entityType)) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const admin = adminClient();

    // 2. İlgili claim_requests'leri de temizle
    await admin.from('claim_requests').delete().eq('entity_id', entityId);

    // 3. Yorumları temizle
    const typeKey = entityType.slice(0, -3); // klinikler → klinik
    await admin.from('yorumlar').delete()
      .eq('entity_id', entityId)
      .eq('entity_type', typeKey);

    // 4. Asıl kaydı sil
    const { error } = await admin.from(entityType).delete().eq('id', entityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('delete-entity error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
