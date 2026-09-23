/**
 * Admin Geocoding API
 * Koordinatı eksik işletmeleri Nominatim (OpenStreetMap) ile geocode eder.
 *
 * İMLEÇ (cursor) TABANLI: her çağrı `cursor`'dan (son işlenen id) SONRAKİ
 * BATCH_SIZE kaydı işler ve `nextCursor` döner. Eski sürüm her çağrıda
 * "koordinatsız ilk 30" kaydı yeniden seçiyordu; Nominatim'in bulamadığı
 * kayıtlar hiç ilerlemediği için döngü sonsuza gidiyordu.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Nominatim 1 istek/sn → tek çağrı uzun sürer

const BATCH_SIZE  = 8;    // kayıt başına en kötü ~6 sn → 8 × 6 ≈ 48 sn < maxDuration
const DELAY_MS    = 1100; // Nominatim rate limit: max 1 req/sn
const KOORDINATSIZ = 'lat.is.null,lat.eq.0,lng.is.null,lng.eq.0';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function nominatim(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = 'https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({ q, format: 'json', limit: '1', countrycodes: 'tr' });
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Hekimhane/1.0 (rehber360com@gmail.com)' },
      cache: 'no-store',
    });
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

async function geocodeRecord(
  name: string, il: string, ilce: string, adres: string | null
): Promise<{ lat: number; lng: number } | null> {
  const queries = [
    adres ? `${adres}, ${ilce || ''}, ${il || ''}, Turkey` : null,
    `${name}, ${ilce || ''}, ${il || ''}, Turkey`,
    `${name}, ${il || ''}, Turkey`,
  ].filter(Boolean) as string[];

  for (const q of queries) {
    const result = await nominatim(q);
    if (result) return result;
    await sleep(DELAY_MS);
  }
  return null;
}

const TABLE_CONFIG: Record<string, { adresAlan: string | null; nameAlan: string; select: string }> = {
  klinikler:  { adresAlan: 'adres',   nameAlan: 'name', select: 'id,name,il,ilce,adres' },
  hastaneler: { adresAlan: 'adres',   nameAlan: 'name', select: 'id,name,il,ilce,adres' },
  eczaneler:  { adresAlan: 'address', nameAlan: 'name', select: 'id,name,il,ilce,address' },
  doktorlar:  { adresAlan: null,      nameAlan: 'ad',   select: 'id,ad,soyad,il,ilce,clinic_name' },
};

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { table, typeFilter, cursor } = await request.json();
    const config = TABLE_CONFIG[table];
    if (!config) {
      return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 });
    }

    const admin = adminClient() as any;

    // İmleçten sonraki koordinatsız kayıtlar — id sırasıyla, sabit parti
    let q = admin.from(table).select(config.select).or(KOORDINATSIZ)
      .order('id', { ascending: true }).limit(BATCH_SIZE);
    if (typeFilter) q = q.ilike('type', `%${typeFilter}%`);
    if (cursor)     q = q.gt('id', String(cursor));

    const { data: rows, error: fetchErr } = await q;
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    const batch: any[] = rows || [];
    const results: { id: string; name: string; ok: boolean; lat?: number; lng?: number }[] = [];

    for (const row of batch) {
      const name = table === 'doktorlar'
        ? `${row.ad || ''} ${row.soyad || ''}`.trim()
        : (row.name || '');
      const adres = config.adresAlan ? row[config.adresAlan] : (row.clinic_name || null);

      const coords = await geocodeRecord(name, row.il || '', row.ilce || '', adres);
      await sleep(DELAY_MS);

      if (coords) {
        const { error: updErr } = await admin.from(table).update({ lat: coords.lat, lng: coords.lng }).eq('id', row.id);
        results.push({ id: row.id, name: name.slice(0, 50), ok: !updErr, lat: coords.lat, lng: coords.lng });
      } else {
        results.push({ id: row.id, name: name.slice(0, 50), ok: false });
      }
    }

    // Kalan = imleçten SONRA hâlâ koordinatsız olan kayıt sayısı (bulunamayanlar dahil değil)
    const nextCursor: string | null = batch.length ? String(batch[batch.length - 1].id) : (cursor ? String(cursor) : null);
    let cq = admin.from(table).select('id', { count: 'exact', head: true }).or(KOORDINATSIZ);
    if (typeFilter) cq = cq.ilike('type', `%${typeFilter}%`);
    if (nextCursor) cq = cq.gt('id', nextCursor);
    const { count } = await cq;
    const remaining = count || 0;

    const success = results.filter(r => r.ok).length;
    const failed  = results.filter(r => !r.ok).length;
    const done    = batch.length < BATCH_SIZE || remaining === 0;

    return NextResponse.json({ success, failed, remaining, results, nextCursor, done });
  } catch (err) {
    console.error('geocode error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Her tablo için koordinatsız kayıt sayısını döndür
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const admin = adminClient() as any;
    const counts: Record<string, number> = {};

    await Promise.all(Object.keys(TABLE_CONFIG).map(async (table) => {
      const { count } = await admin.from(table)
        .select('id', { count: 'exact', head: true })
        .or(KOORDINATSIZ);
      counts[table] = count || 0;
    }));

    // Diş klinikleri özel sayısı
    const { count: disCount } = await admin.from('klinikler')
      .select('id', { count: 'exact', head: true })
      .ilike('type', '%diş%')
      .or(KOORDINATSIZ);
    counts['klinikler_dis'] = disCount || 0;

    return NextResponse.json({ counts });
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
