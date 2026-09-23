import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/*
 * Admin › E-posta Listeleri.
 * Service-role ile TÜM aboneleri getirir (Supabase'in 1000 satır tavanını
 * sayfalayarak aşar). Eski sürüm tarayıcıdan `.limit(2000)` çekiyordu:
 * 1000'de kesiliyor, sayımlar ve CSV eksik çıkıyordu.
 */
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const SAYFA = 1000;

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const db = adminClient() as any;
    const aboneler: any[] = [];
    for (let from = 0; ; from += SAYFA) {
      const { data, error } = await db.from('email_aboneleri')
        .select('*').order('created_at', { ascending: false })
        .range(from, from + SAYFA - 1);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      aboneler.push(...(data || []));
      if (!data || data.length < SAYFA) break;
    }
    return NextResponse.json({ aboneler, toplam: aboneler.length });
  } catch (err) {
    console.error('admin/aboneler error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
