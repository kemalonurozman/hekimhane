import { NextResponse, type NextRequest } from 'next/server';
import { eczaneIndeksi } from '@/lib/eczane-indeks';
import { eczaneOnerileri } from '@/lib/eczane-liste';

/**
 * GET /api/eczane-ara?q=akt → arama kutusu önerileri (en fazla 8).
 * Veri bellekteki / önbellekteki eczane özetinden gelir; veritabanına her tuşta
 * gidilmez. Herkese açık bilgi (ad, ilçe, il, sayfa adresi) — telefon dönmez.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ oneriler: [] });
  try {
    const oneriler = eczaneOnerileri(await eczaneIndeksi(), q, 8);
    return NextResponse.json({ oneriler }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e) {
    console.error('eczane-ara:', e);
    return NextResponse.json({ oneriler: [] });   // öneri gelmezse arama yine çalışır
  }
}
