import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { kaldirmaIstemcisi } from '@/lib/profil-kaldirma';
import { kaldirmaEpostaGonder, kaldirmaEpostaListesi, kaldirmaEpostaRet } from '@/lib/kaldirma-eposta';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/* Kaldırma talebi sahibine yöneticinin elle gönderdiği e-posta (tek tek; toplu yok).
   GET  → { kayitlar, retler, migration, kontenjanKalan }
   POST { talepId, kaldirilanId?, sablon, konu, metin, deneme?, tekrarOnay? }
        → 200 { ok, mesaj, kayit? } · 409 { error, tekrar[] } (daha önce gönderildi) · 409 { error, ret:true } (e-posta istemiyor; aşılamaz) · 503 { error, migration? }
   POST { aksiyon: 'ret', talepId, geriAl? } → talep sahibinin adresini "e-posta istemiyor" işaretle / işareti kaldır */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  try {
    return NextResponse.json(await kaldirmaEpostaListesi(kaldirmaIstemcisi()));
  } catch (e: any) {
    return NextResponse.json({ kayitlar: [], retler: [], migration: false, kontenjanKalan: null, error: e?.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  if (!body?.talepId) return NextResponse.json({ error: 'talepId gerekli' }, { status: 400 });
  if (body.aksiyon === 'ret') {
    const r = await kaldirmaEpostaRet(kaldirmaIstemcisi(), String(body.talepId), body.geriAl === true);
    return r.ok ? NextResponse.json(r) : NextResponse.json({ error: r.mesaj, migration: r.migration }, { status: r.durum });
  }
  const r = await kaldirmaEpostaGonder(kaldirmaIstemcisi(), {
    talepId: String(body.talepId),
    kaldirilanId: body.kaldirilanId ? String(body.kaldirilanId) : null,
    sablon: String(body.sablon || ''),
    konu: String(body.konu || ''),
    metin: String(body.metin || ''),
    deneme: body.deneme === true,
    tekrarOnay: body.tekrarOnay === true,
  });
  return r.ok
    ? NextResponse.json(r)
    : NextResponse.json({ error: r.mesaj, tekrar: r.tekrar, migration: r.migration, ret: r.ret }, { status: r.durum });
}
