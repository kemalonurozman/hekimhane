import { NextResponse, type NextRequest } from 'next/server';
import { dogrulanmisOturum } from '@/lib/panel-oturum';
import { jetonUret, ozveloAcik, ozveloAyar, ozveloHedefi } from '@/lib/ozvelo/ayar';
import { baglantiOku, erisimliIsletmeler, ozveloIstemcisi } from '@/lib/ozvelo/senkron';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // force-dynamic tek başına Data Cache'i kapatmıyor

/**
 * "Asistanımı yönet": hekimi şifre sormadan Ozvelo'daki hesabına geçirir.
 * Yalnız tarayıcı oturumu (MCP iç başlığı kabul edilmez) + işletmede onaylı sahip/yönetici
 * + asistan etkin. Jeton 5 dakika geçerli, tek kullanımlık (Ozvelo `jti`'yi bir kez kabul eder).
 */
export async function POST(request: NextRequest) {
  const oturum = await dogrulanmisOturum(request);
  const eposta = oturum?.user?.email?.toLowerCase();
  if (!eposta) return NextResponse.json({ error: 'Giriş yapılmamış' }, { status: 401 });
  if (!ozveloAcik()) return NextResponse.json({ error: 'Yapay zekâ asistanı henüz açılmadı.' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const entityId = String(body?.entity_id || '');
  const db = ozveloIstemcisi();
  const isletme = (await erisimliIsletmeler(db, eposta)).find(i => i.id === entityId);
  if (!isletme) return NextResponse.json({ error: 'Bu işletmenin asistanını yönetme yetkiniz yok' }, { status: 403 });

  const { baglanti } = await baglantiOku(db, isletme.tur, isletme.id);
  if (!baglanti || baglanti.durum !== 'aktif') {
    return NextResponse.json({ error: 'Asistan henüz hazır değil. Önce etkinleştirin ya da "Şimdi eşitle"ye basın.' }, { status: 409 });
  }

  const jeton = jetonUret('gecis', {
    sub: oturum!.user.id,
    eposta,
    dis_kimlik: baglanti.dis_kimlik,
    ozvelo_isletme_id: baglanti.ozvelo_isletme_id,
    rol: isletme.yonetici ? 'yonetici' : 'sahip',
    // Açılacak Ozvelo ekranı (Dijital Asistanlar sayfalarındaki düğmeler); bilinmeyen değer → genel
    hedef: ozveloHedefi(body?.hedef),
  });
  return NextResponse.json({ url: `${ozveloAyar().siteUrl}/partner/hekimhane/giris?jeton=${encodeURIComponent(jeton)}` });
}
