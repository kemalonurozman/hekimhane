import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { YORUM_ONAY_DURUMLARI } from '@/lib/yorum-onay';
import { urlParca } from '@/lib/entity-link';

// Her istekte taze veri — yeni şikayetler anında görünsün
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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


// entity_type + id listesinden { "doktor:d12": "Dr. Ali Veli" } isim haritası kur
async function resolveNames(
  admin: ReturnType<typeof adminClient>,
  rows: { entity_type: string; entity_id: string }[],
): Promise<{ names: Record<string, string>; urls: Record<string, string> }> {
  const map: Record<string, string> = {};
  const urls: Record<string, string> = {};
  const byType: Record<string, Set<string>> = {};
  rows.forEach(r => {
    const table = TABLE_MAP[r.entity_type];
    if (!table) return;
    (byType[r.entity_type] ||= new Set()).add(r.entity_id);
  });

  for (const [type, idSet] of Object.entries(byType)) {
    const table = TABLE_MAP[type];
    const cols = type === 'doktor' ? 'id, ad, soyad, unvan, slug' : 'id, name, slug, il, ilce';
    try {
      const { data } = await (admin as any).from(table).select(cols).in('id', Array.from(idSet));
      (data || []).forEach((e: any) => {
        const name = type === 'doktor'
          ? `${e.unvan ? e.unvan + ' ' : ''}${e.ad || ''} ${e.soyad || ''}`.trim()
          : (e.name || '');
        map[`${type}:${e.id}`] = name || String(e.id);
        if (e.slug) {
          urls[`${type}:${e.id}`] =
            type === 'doktor'  ? `/doktorlar/${e.slug}`
          : type === 'eczane'  ? `/eczaneler/${e.slug}`
          : `/${table}/${urlParca(e.il || 'turkiye')}/${urlParca(e.ilce || 'merkez')}/${e.slug}`;
        }
      });
    } catch { /* tablo/ID çözülemezse boş geç */ }
  }
  return { names: map, urls };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const admin = adminClient();

    // ?tip=onay → onay bekleyen / reddedilen yorumlar (Yorum Onayı sekmesi)
    // varsayılan  → şikayet edilmiş yorumlar; onay akışı değerleri dışarıda (Şikayetler sekmesi)
    const tip = request.nextUrl.searchParams.get('tip');
    const onay = tip === 'onay';
    const onayListesi = `(${YORUM_ONAY_DURUMLARI.map(d => `"${d}"`).join(',')})`;
    let data: any[] | null = null; let error: any = null;
    if (onay) {
      // Onay sürecindekilerin tamamı + yayına alınmış son 300 yorum (işletmelere yazılan yorumlar tek yerde)
      const [sure, yayin] = await Promise.all([
        (admin as any).from('yorumlar').select('*').in('report_status', [...YORUM_ONAY_DURUMLARI]).order('created_at', { ascending: false }),
        (admin as any).from('yorumlar').select('*').or('report_status.is.null,report_status.not.in.' + onayListesi).order('created_at', { ascending: false }).limit(300),
      ]);
      error = sure.error || yayin.error;
      const gorulen = new Set<string>();
      data = [...(sure.data || []), ...(yayin.data || [])].filter((r: any) => (gorulen.has(r.id) ? false : (gorulen.add(r.id), true)));
    } else {
      ({ data, error } = await (admin as any).from('yorumlar').select('*')
        .not('report_status', 'is', null).not('report_status', 'in', onayListesi)
        .order('reported_at', { ascending: false }));
    }

    if (error) {
      // Kolonlar yoksa açık uyarı ver ama sayfayı çökertme
      const missing = error.message?.includes('report_status') || error.message?.includes('column');
      return NextResponse.json(
        { reviews: [], names: {}, error: missing ? 'migration' : error.message },
        { status: missing ? 200 : 500 },
      );
    }

    const reviews = (data || []) as any[];
    const { names, urls } = await resolveNames(admin, reviews);

    return NextResponse.json({ reviews, names, urls });
  } catch (err) {
    console.error('admin/reported-yorumlar error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
