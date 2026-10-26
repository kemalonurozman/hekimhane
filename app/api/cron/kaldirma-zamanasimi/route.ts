import { NextResponse, type NextRequest } from 'next/server';
import { kaldirmaIstemcisi, kaldirmaZamanAsimi } from '@/lib/profil-kaldirma';

export const dynamic = 'force-dynamic';

/* Günlük cron (vercel.json). 48 saat içinde karar verilmeyen kaldırma taleplerini
   "duraklatildi" yapar ve profili gizler; süresi dolan yedekleri boşaltır.
   Not: profil yayından düşmek için cron'u BEKLEMEZ — detay sayfası işletme satırındaki
   duraklat_at geçince zaten 404 verir; cron durumu ve bildirimleri tamamlar. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}` && request.nextUrl.searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
  }
  try {
    return NextResponse.json({ ok: true, ...(await kaldirmaZamanAsimi(kaldirmaIstemcisi())) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
