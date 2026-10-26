import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { kaldirmaIstemcisi, kaldirmaListesi, kaldirmaKarar, profilGeriYukle, type KararAksiyon } from '@/lib/profil-kaldirma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* GET  → kaldırma talepleri + kaldırılan profiller (önce 48 saat kuralını uygular)
   POST { talepId, aksiyon: kaldir|duraklat|yayinda_tut|soru, not?, bildir? }
   POST { kaldirilanId, aksiyon: 'geri_yukle' } */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  try {
    return NextResponse.json(await kaldirmaListesi(kaldirmaIstemcisi()));
  } catch (e: any) {
    return NextResponse.json({ talepler: [], kaldirilanlar: [], urls: {}, error: e?.message || 'Sunucu hatası' }, { status: 500 });
  }
}

const AKSIYONLAR: KararAksiyon[] = ['kaldir', 'duraklat', 'yayinda_tut', 'soru'];

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  const admin = kaldirmaIstemcisi();

  if (body?.aksiyon === 'geri_yukle') {
    if (!body?.kaldirilanId) return NextResponse.json({ error: 'kaldirilanId gerekli' }, { status: 400 });
    const r = await profilGeriYukle(admin, String(body.kaldirilanId));
    return r.ok ? NextResponse.json(r) : NextResponse.json({ error: r.mesaj }, { status: r.durum });
  }

  const aksiyon = body?.aksiyon as KararAksiyon;
  if (!body?.talepId || !AKSIYONLAR.includes(aksiyon)) return NextResponse.json({ error: 'talepId ve geçerli aksiyon gerekli' }, { status: 400 });
  const r = await kaldirmaKarar(admin, String(body.talepId), aksiyon, body?.not ? String(body.not) : null, body?.bildir !== false);
  return r.ok ? NextResponse.json(r) : NextResponse.json({ error: r.mesaj }, { status: r.durum });
}
