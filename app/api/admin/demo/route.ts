// Admin › Deneme Hesabı — durum, kurulum/sıfırlama, yeni giriş bağlantısı (lib/demo-sunucu.ts).
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { demoIstemcisi, demoDurumu, demoSifirla } from '@/lib/demo-sunucu';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    return NextResponse.json(await demoDurumu(demoIstemcisi()));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Durum okunamadı' }, { status: 500 });
  }
}

/** { islem: 'kur' | 'yeni-baglanti' } — ikisi de örnek veriyi baştan yazar. */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  let islem = 'kur';
  try { islem = String((await request.json())?.islem || 'kur'); } catch { /* varsayılan */ }
  if (!['kur', 'yeni-baglanti'].includes(islem)) return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  try {
    const db = demoIstemcisi();
    const sonuc = await demoSifirla(db, { anahtarYenile: islem === 'yeni-baglanti' });
    return NextResponse.json({ ...sonuc, durum: await demoDurumu(db) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Deneme hesabı kurulamadı' }, { status: 500 });
  }
}
