import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Haversine — iki koordinat arası km cinsinden mesafe
function mesafeKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Eczane koordinatları henüz geocode edilmediği için (tümü 0,0) mesafe
 * doğrudan hesaplanamıyor. Bunun yerine: koordinatı bilinen en yakın
 * hastaneden kullanıcının il/ilçesini tespit edip o bölgedeki eczaneleri
 * döndürüyoruz. Eczaneler geocode edildiğinde bu route mesafe bazlıya
 * çevrilebilir.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = parseFloat(sp.get('lat') || '');
  const lng = parseFloat(sp.get('lng') || '');

  if (isNaN(lat) || isNaN(lng) || lat < 35 || lat > 43 || lng < 25 || lng > 45) {
    return NextResponse.json({ error: 'Geçersiz konum.' }, { status: 400 });
  }

  try {
    const admin = adminClient();

    // 1) Koordinatı bilinen hastanelerden en yakınını bul → il/ilçe tespiti
    const { data: hastaneler, error: hErr } = await (admin as any)
      .from('hastaneler')
      .select('il, ilce, lat, lng')
      .gt('lat', 30)
      .gte('lat', lat - 0.6).lte('lat', lat + 0.6)
      .gte('lng', lng - 0.75).lte('lng', lng + 0.75)
      .limit(400);

    if (hErr) throw hErr;

    let il: string | null = null;
    let ilce: string | null = null;
    if (hastaneler && hastaneler.length > 0) {
      const enYakin = hastaneler
        .map((h: any) => ({ ...h, d: mesafeKm(lat, lng, h.lat, h.lng) }))
        .sort((a: any, b: any) => a.d - b.d)[0];
      il = enYakin.il;
      ilce = enYakin.ilce;
    }

    if (!il) {
      return NextResponse.json({ eczaneler: [], konum: null });
    }

    // 2) Önce ilçedeki eczaneler; yetersizse il geneli.
    // Not: eczanelerde ilce kolonu çoğunlukla boş; ilçe adı işletme adının
    // içinde geçiyor ("Emin Eczanesi (Ankara Çubuk)") — o yüzden name üzerinde
    // de arıyoruz.
    let eczaneler: any[] = [];
    if (ilce) {
      const { data } = await (admin as any)
        .from('eczaneler')
        .select('id, name, slug, il, ilce, address, tel, nobetci, acik_24_saat')
        .eq('il', il)
        .or(`ilce.ilike.%${ilce}%,name.ilike.%${ilce}%,address.ilike.%${ilce}%`)
        .order('rat', { ascending: false })
        .limit(20);
      eczaneler = data || [];
    }
    if (eczaneler.length < 5) {
      const { data } = await (admin as any)
        .from('eczaneler')
        .select('id, name, slug, il, ilce, address, tel, nobetci, acik_24_saat')
        .eq('il', il)
        .order('rat', { ascending: false })
        .limit(20);
      const mevcutIds = new Set(eczaneler.map(e => e.id));
      eczaneler = [...eczaneler, ...(data || []).filter((e: any) => !mevcutIds.has(e.id))].slice(0, 20);
    }

    return NextResponse.json({ eczaneler, konum: { il, ilce } });
  } catch {
    return NextResponse.json({ error: 'Eczaneler yüklenemedi.' }, { status: 500 });
  }
}
