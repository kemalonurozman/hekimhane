import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Her istekte taze veri — yeni şikayetler anında görünsün
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

const TABLE_MAP: Record<string, string> = {
  klinik:  'klinikler',
  hastane: 'hastaneler',
  doktor:  'doktorlar',
  eczane:  'eczaneler',
};

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

// entity_type + id listesinden { "doktor:d12": "Dr. Ali Veli" } isim haritası kur
async function resolveNames(
  admin: ReturnType<typeof adminClient>,
  rows: { entity_type: string; entity_id: string }[],
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const byType: Record<string, Set<string>> = {};
  rows.forEach(r => {
    const table = TABLE_MAP[r.entity_type];
    if (!table) return;
    (byType[r.entity_type] ||= new Set()).add(r.entity_id);
  });

  for (const [type, idSet] of Object.entries(byType)) {
    const table = TABLE_MAP[type];
    const cols = type === 'doktor' ? 'id, ad, soyad, unvan' : 'id, name';
    try {
      const { data } = await (admin as any).from(table).select(cols).in('id', Array.from(idSet));
      (data || []).forEach((e: any) => {
        const name = type === 'doktor'
          ? `${e.unvan ? e.unvan + ' ' : ''}${e.ad || ''} ${e.soyad || ''}`.trim()
          : (e.name || '');
        map[`${type}:${e.id}`] = name || String(e.id);
      });
    } catch { /* tablo/ID çözülemezse boş geç */ }
  }
  return map;
}

export async function GET(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const admin = adminClient();

    // Şikayet edilmiş (report_status dolu) tüm yorumlar — pending önce
    const { data, error } = await (admin as any)
      .from('yorumlar')
      .select('*')
      .not('report_status', 'is', null)
      .order('reported_at', { ascending: false });

    if (error) {
      // Kolonlar yoksa açık uyarı ver ama sayfayı çökertme
      const missing = error.message?.includes('report_status') || error.message?.includes('column');
      return NextResponse.json(
        { reviews: [], names: {}, error: missing ? 'migration' : error.message },
        { status: missing ? 200 : 500 },
      );
    }

    const reviews = (data || []) as any[];
    const names = await resolveNames(admin, reviews);

    return NextResponse.json({ reviews, names });
  } catch (err) {
    console.error('admin/reported-yorumlar error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
