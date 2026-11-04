import { NextResponse, type NextRequest } from 'next/server';
import { dogrulanmisOturum } from '@/lib/panel-oturum';
import { ozveloAcik } from '@/lib/ozvelo/ayar';
import { baglantiOku, erisimliIsletmeler, ozetOku, ozveloIstemcisi } from '@/lib/ozvelo/senkron';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // force-dynamic tek başına Data Cache'i kapatmıyor

/**
 * Dijital Asistanlar sayfaları (e-posta, randevu, soru-cevap) için Ozvelo'daki özet.
 * İçerik Ozvelo'dan anlık okunur, Hekimhane'de saklanmaz. Yalnız onaylı sahip/yönetici.
 * Yanıt: { durum: 'tamam', ozet } | { durum: 'kapali' | 'etkin-degil' | 'ulasilamadi' }
 */
export async function GET(request: NextRequest) {
  const oturum = await dogrulanmisOturum(request);
  const eposta = oturum?.user?.email?.toLowerCase();
  if (!eposta) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
  if (!ozveloAcik()) return NextResponse.json({ durum: 'kapali' });

  const entityId = request.nextUrl.searchParams.get('entity_id') || '';
  const db = ozveloIstemcisi();
  const isletme = (await erisimliIsletmeler(db, eposta)).find(i => i.id === entityId);
  if (!isletme) return NextResponse.json({ error: 'Bu işletmenin asistanını görme yetkiniz yok' }, { status: 403 });

  const { baglanti } = await baglantiOku(db, isletme.tur, isletme.id);
  if (!baglanti || baglanti.durum !== 'aktif') return NextResponse.json({ durum: 'etkin-degil' });

  const ozet = await ozetOku(baglanti.dis_kimlik);
  return NextResponse.json(ozet ? { durum: 'tamam', ozet } : { durum: 'ulasilamadi' }, { headers: { 'cache-control': 'no-store' } });
}
