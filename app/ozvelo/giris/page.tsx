import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase-server';
import { donusAdresiGecerli, jetonUret, ozveloAcik } from '@/lib/ozvelo/ayar';
import { baglantiOku, erisimliIsletmeler, ozveloIstemcisi } from '@/lib/ozvelo/senkron';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // force-dynamic tek başına Data Cache'i kapatmıyor
export const metadata: Metadata = {
  title: 'Hekimhane ile giriş',
  robots: { index: false, follow: false },
  alternates: { canonical: '/ozvelo/giris' },
};

/*
 * "Hekimhane ile giriş yap" (Ozvelo → Partnerler sayfası).
 * Ozvelo kullanıcıyı buraya gönderir: /ozvelo/giris?donus=<ozvelo /partner/... adresi>&durum=<rastgele>
 *  1. donus yalnız Ozvelo sitesinin /partner/ yolu olabilir (başka siteye jeton gitmez).
 *  2. Oturum yoksa Hekimhane girişine, dönüşte buraya geri.
 *  3. Oturum varsa 5 dakikalık imzalı jetonla Ozvelo'ya geri: kim olduğu + yönettiği klinik/hekim profilleri.
 * Ozvelo `durum`u kendi gönderdiğiyle karşılaştırır, jetonu doğrular ve `jti`'yi bir kez kullanır.
 */
export default async function OzveloGiris({ searchParams }: { searchParams: { donus?: string; durum?: string } }) {
  const donus = donusAdresiGecerli(searchParams.donus);
  const durum = /^[A-Za-z0-9_-]{8,200}$/.test(searchParams.durum || '') ? searchParams.durum! : null;

  if (!ozveloAcik()) return <Bilgi baslik="Bu giriş henüz açılmadı" metin="Hekimhane ile Ozvelo bağlantısı hazırlanıyor. Ozvelo hesabınıza e-posta ve şifrenizle giriş yapabilirsiniz." />;
  if (!donus || !durum) return <Bilgi baslik="Geçersiz giriş bağlantısı" metin="Lütfen Ozvelo'daki Partnerler sayfasından “Hekimhane ile giriş yap” düğmesine yeniden basın." />;

  const user = await getUser();
  if (!user?.email) {
    const geri = `/ozvelo/giris?donus=${encodeURIComponent(donus.toString())}&durum=${encodeURIComponent(durum)}`;
    redirect(`/giris?tip=isletme&redirect=${encodeURIComponent(geri)}`);
  }

  const eposta = user.email!.toLowerCase();
  const db = ozveloIstemcisi();
  const isletmeler = await erisimliIsletmeler(db, eposta);
  if (!isletmeler.length) {
    return <Bilgi baslik="Yönettiğiniz bir profil bulunamadı" metin={`${eposta} hesabıyla yönetilen bir klinik ya da hekim profili yok. Önce Hekimhane'deki profilinizi sahiplenin.`} baglanti={{ href: '/klinikler', metin: 'Profilimi bulup sahipleneyim' }} />;
  }

  const liste = await Promise.all(isletmeler.map(async i => {
    const { baglanti } = await baglantiOku(db, i.tur, i.id);
    return {
      dis_kimlik: `hekimhane:${i.tur}:${i.id}`,
      tur: i.tur,
      ad: i.ad,
      rol: i.yonetici ? 'yonetici' : 'sahip',
      asistan: baglanti?.durum === 'aktif' ? 'aktif' : baglanti && baglanti.durum !== 'kapali' ? 'hazirlaniyor' : 'kapali',
      ozvelo_isletme_id: baglanti?.ozvelo_isletme_id || null,
    };
  }));

  const jeton = jetonUret('giris', { sub: user.id, eposta, durum, isletmeler: liste });
  const hedef = new URL(donus.toString());
  hedef.searchParams.set('jeton', jeton);
  hedef.searchParams.set('durum', durum);
  redirect(hedef.toString());
}

function Bilgi({ baslik, metin, baglanti }: { baslik: string; metin: string; baglanti?: { href: string; metin: string } }) {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '48px 16px', background: '#FBFBFD' }}>
      <div style={{ maxWidth: 460, width: '100%', background: 'white', border: '1px solid #E5E5EA', borderRadius: 20, padding: '32px 28px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.3px', color: '#1B3A69' }}>{baslik}</h1>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55, color: '#4B5563' }}>{metin}</p>
        {baglanti && (
          <Link href={baglanti.href} style={{ display: 'inline-block', marginTop: 20, padding: '11px 18px', borderRadius: 12, background: '#1B3A69', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            {baglanti.metin}
          </Link>
        )}
      </div>
    </main>
  );
}
