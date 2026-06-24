/**
 * Admin Geocoding API
 * Koordinatı eksik işletmeleri Nominatim (OpenStreetMap) ile geocode eder.
 * Her çağrıda en fazla BATCH_SIZE kayıt işler — progress için tekrar tekrar çağrılabilir.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';
const BATCH_SIZE  = 30;   // Her çağrıda işlenecek max kayıt
const DELAY_MS    = 1100; // Nominatim rate limit: max 1 req/sn

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
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
    }
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
    // Auth kontrolü
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { table, typeFilter } = await request.json();
    const config = TABLE_CONFIG[table];
    if (!config) {
      return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 });
    }

    const admin = adminClient();

    // Koordinatsız kayıtları çek
    let q = (admin as any)
      .from(table)
      .select(config.select)
      .or('lat.is.null,lat.eq.0,lng.is.null,lng.eq.0');

    if (typeFilter) {
      q = q.ilike('type', `%${typeFilter}%`);
    }

    const { data: rows, error: fetchErr } = await q.limit(BATCH_SIZE + 200);

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    const total   = (rows || []).length;
    const batch   = (rows || []).slice(0, BATCH_SIZE);
    const results: { id: string; name: string; ok: boolean; lat?: number; lng?: number }[] = [];

    for (const row of batch) {
      const name = table === 'doktorlar'
        ? `${row.ad || ''} ${row.soyad || ''}`.trim()
        : (row.name || '');
      const adres = config.adresAlan ? row[config.adresAlan] : (row.clinic_name || null);

      const coords = await geocodeRecord(name, row.il || '', row.ilce || '', adres);
      await sleep(DELAY_MS);

      if (coords) {
        await (admin as any).from(table).update({ lat: coords.lat, lng: coords.lng }).eq('id', row.id);
        results.push({ id: row.id, name: name.slice(0, 50), ok: true, lat: coords.lat, lng: coords.lng });
      } else {
        results.push({ id: row.id, name: name.slice(0, 50), ok: false });
      }
    }

    const remaining = Math.max(0, total - BATCH_SIZE);
    const success   = results.filter(r => r.ok).length;
    const failed    = results.filter(r => !r.ok).length;

    return NextResponse.json({ success, failed, remaining, results });
  } catch (err) {
    console.error('geocode error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Her tablo için koordinatsız kayıt sayısını döndür
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const admin = adminClient();
    const counts: Record<string, number> = {};

    await Promise.all(Object.keys(TABLE_CONFIG).map(async (table) => {
      const { count } = await (admin as any)
        .from(table)
        .select('id', { count: 'exact', head: true })
        .or('lat.is.null,lat.eq.0,lng.is.null,lng.eq.0');
      counts[table] = count || 0;
    }));

    // Diş klinikleri özel sayısı
    const { count: disCount } = await (admin as any)
      .from('klinikler')
      .select('id', { count: 'exact', head: true })
      .ilike('type', '%diş%')
      .or('lat.is.null,lat.eq.0,lng.is.null,lng.eq.0');
    counts['klinikler_dis'] = disCount || 0;

    return NextResponse.json({ counts });
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
