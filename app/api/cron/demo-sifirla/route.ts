import { NextResponse, type NextRequest } from 'next/server';
import { demoIstemcisi, demoDurumu, demoSifirla } from '@/lib/demo-sunucu';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/* Günlük cron (vercel.json, gece 03:00 TR). Deneme hesabında ziyaretçilerin yaptığı
   değişiklikleri örnek hâline döndürür. Kurulmamışsa hiçbir şey yapmaz — kurulum
   admin panelinden (Deneme Hesabı) bilinçli olarak yapılır. Giriş bağlantısı değişmez. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}` && request.nextUrl.searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
  }
  try {
    const db = demoIstemcisi();
    if (!(await demoDurumu(db)).kurulu) return NextResponse.json({ ok: true, atlandi: 'kurulu değil' });
    return NextResponse.json(await demoSifirla(db));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
