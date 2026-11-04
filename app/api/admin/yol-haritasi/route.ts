import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { YAPILACAKLAR, YAPILANLAR, yolHaritasiOzet } from '@/lib/yol-haritasi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* Admin › Yol Haritası — yapılacaklar + yapılanlar (salt okunur).
   Veri lib/yol-haritasi.ts'te; yalnız admin oturumunda döner (güvenlik notları içerir).
   ?ozet=1 → yalnız kenar çubuğu rozeti için sayılar. */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  const ozet = yolHaritasiOzet();
  if (request.nextUrl.searchParams.get('ozet') === '1') return NextResponse.json({ ozet });
  return NextResponse.json({ ozet, yapilacaklar: YAPILACAKLAR, yapilanlar: YAPILANLAR });
}
