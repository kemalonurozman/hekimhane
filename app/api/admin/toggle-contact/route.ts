import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}


// Doktorun iletişim bilgilerini (tel+email) gizle/aç
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
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
