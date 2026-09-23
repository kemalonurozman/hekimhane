import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

// request.cookies okur → statik derlenemez; build'deki "Dynamic server usage" uyarısını susturur
export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}


// Bir tabloda kolonun varlığını SELECT ile test et
async function colExists(admin: ReturnType<typeof adminClient>, table: string, col: string): Promise<boolean> {
  const { error } = await (admin as any).from(table).select(col).limit(1);
  // "column ... does not exist" içeriyorsa false
  if (error?.message?.includes('does not exist') || error?.message?.includes('could not find')) return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const admin = adminClient();

    const checks = await Promise.all([
      colExists(admin, 'klinikler',  'tour360url').then(ok => ({ table: 'klinikler',  col: 'tour360url', ok })),
      colExists(admin, 'klinikler',  'photo360').then(ok  => ({ table: 'klinikler',  col: 'photo360',   ok })),
      colExists(admin, 'klinikler',  'photos').then(ok    => ({ table: 'klinikler',  col: 'photos',     ok })),
      colExists(admin, 'hastaneler', 'tour360url').then(ok => ({ table: 'hastaneler', col: 'tour360url', ok })),
      colExists(admin, 'hastaneler', 'photos').then(ok    => ({ table: 'hastaneler', col: 'photos',     ok })),
      colExists(admin, 'doktorlar',  'tour360url').then(ok => ({ table: 'doktorlar',  col: 'tour360url', ok })),
      colExists(admin, 'doktorlar',  'photos').then(ok    => ({ table: 'doktorlar',  col: 'photos',     ok })),
      colExists(admin, 'eczaneler',  'tour360url').then(ok => ({ table: 'eczaneler',  col: 'tour360url', ok })),
      colExists(admin, 'yorumlar',   'reply_text').then(ok => ({ table: 'yorumlar',   col: 'reply_text', ok })),
      // Admin düzeltmeleri: bunlar yoksa eczane düzenleme ve doktor sahiplenme işareti çalışmaz
      colExists(admin, 'eczaneler',  'updated_at').then(ok => ({ table: 'eczaneler',  col: 'updated_at', ok })),
      colExists(admin, 'doktorlar',  'claimed').then(ok    => ({ table: 'doktorlar',  col: 'claimed',    ok })),
    ]);

    const missing = checks.filter(c => !c.ok);
    const allOk   = missing.length === 0;

    return NextResponse.json({ allOk, missing, checks });
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
