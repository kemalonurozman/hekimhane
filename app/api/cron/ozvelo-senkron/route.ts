import { NextResponse, type NextRequest } from 'next/server';
import { ozveloIstemcisi, topluEsitle } from '@/lib/ozvelo/senkron';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // force-dynamic tek başına Data Cache'i kapatmıyor
export const maxDuration = 60;

/* Gece cron'u (vercel.json): yapay zekâ asistanı etkin işletmeleri Ozvelo'ya baştan gönderir
   ("varsa güncelle") ve başarısız kalan gönderimleri yeniden dener. Böylece kaçan bir değişiklik
   en geç ertesi sabah düzelir. Ozvelo ayarları yoksa hiçbir şey yapmaz.
   ?tam=0 → yalnız bekleyen/hatalı gönderimler (elle tetiklemek için). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}` && request.nextUrl.searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
  }
  try {
    const tam = request.nextUrl.searchParams.get('tam') !== '0';
    return NextResponse.json({ ok: true, ...(await topluEsitle(ozveloIstemcisi(), { tam })) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
