import { NextResponse, type NextRequest } from 'next/server';
import { dogrulanmisOturum } from '@/lib/panel-oturum';
import { ozveloAcik } from '@/lib/ozvelo/ayar';
import {
  baglantiOku, erisimliIsletmeler, esitle, etkinlestir, kapat, ozveloIstemcisi, widgetKodu, type Baglanti,
} from '@/lib/ozvelo/senkron';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // force-dynamic tek başına Data Cache'i kapatmıyor

/*
 * Panel → Yapay Zekâ Asistanı sekmesi.
 *   GET  ?entity_id=…            durum
 *   POST { entity_id, islem }    etkinlestir (onay: true şart) | esitle | kapat
 * Yalnız işletmenin onaylı sahibi ya da yöneticisi; asistan (insan) rolü erişemez.
 */

function gorunum(b: Baglanti | null) {
  if (!b) return null;
  return {
    durum: b.durum,
    son_basari_at: b.son_basari_at,
    son_gonderim_at: b.son_gonderim_at,
    hata: b.durum === 'hata' || b.durum === 'kapali' ? b.son_hata : null,
    sonraki_deneme_at: b.durum === 'hata' ? b.sonraki_deneme_at : null,
    aktarim_onay_at: b.aktarim_onay_at,
    widget_kodu: b.durum === 'aktif' ? widgetKodu(b) : null,
  };
}

async function yetki(request: NextRequest, entityId: string) {
  const oturum = await dogrulanmisOturum(request);
  const eposta = oturum?.user?.email?.toLowerCase();
  if (!eposta) return { hata: NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 }) };
  const db = ozveloIstemcisi();
  const isletme = (await erisimliIsletmeler(db, eposta)).find(i => i.id === entityId);
  return { db, eposta, isletme };
}

export async function GET(request: NextRequest) {
  const entityId = request.nextUrl.searchParams.get('entity_id') || '';
  const y = await yetki(request, entityId);
  if (y.hata) return y.hata;
  const acik = ozveloAcik();
  if (!y.isletme) return NextResponse.json({ acik, uygun: false, baglanti: null });

  let { baglanti, tabloVar } = await baglantiOku(y.db!, y.isletme.tur, y.isletme.id);
  // Bekleyen/hatalı gönderimin vakti geldiyse sekme açılırken bir kez daha dene
  if (acik && baglanti && (baglanti.durum === 'bekliyor' || (baglanti.durum === 'hata' && (!baglanti.sonraki_deneme_at || new Date(baglanti.sonraki_deneme_at) <= new Date())))) {
    baglanti = (await esitle(y.db!, y.isletme.tur, y.isletme.id, { zorla: true, zamanAsimiMs: 5000 })).baglanti ?? baglanti;
  }
  return NextResponse.json({ acik, uygun: true, tabloVar, tur: y.isletme.tur, baglanti: gorunum(baglanti) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const entityId = String(body?.entity_id || '');
  const islem = String(body?.islem || '');
  const y = await yetki(request, entityId);
  if (y.hata) return y.hata;
  if (!y.isletme) return NextResponse.json({ error: 'Bu işletmenin asistanını yönetme yetkiniz yok' }, { status: 403 });
  if (!ozveloAcik()) return NextResponse.json({ error: 'Yapay zekâ asistanı henüz açılmadı.' }, { status: 503 });

  const { tur, id } = y.isletme;
  if (islem === 'etkinlestir') {
    if (body?.onay !== true) return NextResponse.json({ error: 'Bilgilerinizin Ozvelo\'ya aktarılmasını onaylamanız gerekiyor.' }, { status: 400 });
    const r = await etkinlestir(y.db!, tur, id, y.eposta!);
    if (!r.tabloVar) return NextResponse.json({ error: r.hata }, { status: 503 });
    return NextResponse.json({ ok: r.durum === 'gonderildi', uyari: r.durum === 'hata' ? r.hata : null, baglanti: gorunum(r.baglanti ?? (await baglantiOku(y.db!, tur, id)).baglanti) });
  }
  if (islem === 'esitle') {
    const r = await esitle(y.db!, tur, id, { zorla: true });
    if (r.durum === 'atlandi') return NextResponse.json({ error: 'Asistan etkin değil' }, { status: 409 });
    return NextResponse.json({ ok: r.durum === 'gonderildi', uyari: r.durum === 'hata' ? r.hata : null, baglanti: gorunum(r.baglanti ?? null) });
  }
  if (islem === 'kapat') {
    const r = await kapat(y.db!, tur, id, 'sahip-kapatti');
    return NextResponse.json({ ok: true, uyari: r.hata || null, baglanti: gorunum((await baglantiOku(y.db!, tur, id)).baglanti) });
  }
  return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
}
