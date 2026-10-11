import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';
import AracVitrini, { type Arac } from '@/components/vitrin/AracVitrini';
import NoktaGrafik from '@/components/vitrin/NoktaGrafik';
import { TakvimGorsel, YorumGorsel, KartGorsel, AsistanGorsel, BolgeGorsel, PuanGorsel, EkipGorsel, AdimGorsel } from '@/components/vitrin/Gorseller';
import type { HkIkonAdi } from '@/lib/hk-icons';

export const metadata: Metadata = {
  title: 'Neden Hekimhane? — Diş Hekimleri ve Klinikler İçin',
  description: 'Hekimhane; diş hekimleri ve klinikler için ücretsiz profil, randevu talepleri, yorum yönetimi, HekimKart dijital kartvizit ve ekip erişimi sunar.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/neden-hekimhane' },
  openGraph: {
    title: 'Neden Hekimhane?',
    description: 'Diş hekimleri ve klinikler için profil, randevu, yorum ve dijital kartvizit — tek yerde.',
    url: 'https://www.hekimhane.com.tr/neden-hekimhane',
    type: 'website',
  },
};

export const revalidate = 3600;

async function getSayilar() {
  try {
    const [k, d] = await Promise.all([
      supabase.from('klinikler').select('id', { count: 'exact', head: true }),
      supabase.from('doktorlar').select('id', { count: 'exact', head: true }),
    ]);
    return { klinik: k.count || 0, hekim: d.count || 0 };
  } catch { return { klinik: 0, hekim: 0 }; }
}
const sayi = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ── Öne çıkan dört araç (yapışkan menülü vitrin) ──
const ARACLAR: Arac[] = [
  {
    id: 'randevu', ad: 'Randevu Takvimi', etiket: 'Randevu Takvimi', pro: true, href: '/randevu-sistemi', renk: { zemin: '#DCE8FB', vurgu: '#1A5FD0' },
    cumle: 'Hastalar profilinizden uygun saati kendisi seçer. Takviminizi siz açar, siz kapatırsınız.',
    gorsel: <TakvimGorsel />, desen: <NoktaGrafik ikon="appointment" size={300} />,
  },
  {
    id: 'yorum', ad: 'Yorum Yönetimi', etiket: 'Yorum Yönetimi', href: '/degerlendirme-sistemi', renk: { zemin: '#F6E9C6', vurgu: '#9C7A2E' },
    cumle: 'Hasta değerlendirmelerini tek ekranda görün, her birine kendi sözlerinizle yanıt verin.',
    gorsel: <YorumGorsel />, desen: <NoktaGrafik ikon="review" size={300} />,
  },
  {
    id: 'kart', ad: 'HekimKart', etiket: 'HekimKart', href: '/hekimkart', renk: { zemin: '#D3EFEC', vurgu: '#0D7C79' },
    cumle: 'Tüm iletişim bilgileriniz tek bağlantıda. Karekodla paylaşın; profiliniz değiştikçe kartınız da güncellenir.',
    gorsel: <KartGorsel />, desen: <NoktaGrafik ikon="hekimkart" size={300} />,
  },
  {
    id: 'asistan', ad: 'Yapay Zekâ Asistanı', etiket: 'Yapay Zekâ Asistanı', pro: true, href: '/mcp', renk: { zemin: '#E4DCFA', vurgu: '#5B3FB8' },
    cumle: 'Kullandığınız yapay zekâ asistanına bağlayın; randevuları ve takvimi yazarak yönetin.',
    gorsel: <AsistanGorsel />, desen: <NoktaGrafik ikon="message" size={300} />,
  },
];

// ── Tüm özellikler ızgarası ──
const OZELLIKLER: { etiket: string; ad: string; metin: string; ikon: HkIkonAdi; href?: string }[] = [
  { etiket: 'Ücretsiz', ad: 'Profil yönetimi', metin: 'Adres, çalışma saatleri, uzmanlıklar, logo ve fotoğraflarınızı dilediğiniz an güncelleyin.', ikon: 'doctor-profile', href: '/katil' },
  { etiket: 'Ücretsiz', ad: 'Randevu talepleri', metin: 'Profilinizden gelen talepler panelinize ve e-postanıza düşer; arandı, ertelendi, tamamlandı diye izlersiniz.', ikon: 'appointment', href: '/randevu-sistemi' },
  { etiket: 'Ücretsiz', ad: 'Makale yayınlama', metin: 'Uzmanlık alanınızda yazın; onaylanan makaleniz blogda adınızla yayımlanır.', ikon: 'blog', href: '/blog' },
  { etiket: 'Ücretsiz', ad: 'Ekip erişimi', metin: 'Yönetici ya da yetkisi sınırlı asistan ekleyin; kim neye erişir siz belirlersiniz.', ikon: 'family-medicine' },
  { etiket: 'Pro', ad: 'Sitenize randevu modülü', metin: 'Aynı takvimi kendi web sitenize yerleştirin; hastalar sitenizden çıkmadan randevu alır.', ikon: 'clinic', href: '/randevu-modulu' },
  { etiket: 'Pro', ad: 'Web ve sosyal bağlantılar', metin: 'Profilinizde web sitenizi ve sosyal medya hesaplarınızı gösterin.', ikon: 'share', href: '/pro' },
];

export default async function NedenHekimhanePage() {
  const s = await getSayilar();
  return (
    <div className="vt-zemin" style={{ paddingTop: 66 }}>

      {/* ── Giriş ── */}
      <section className="vt-bolum" style={{ paddingBottom: 56 }}>
        <div className="container">
          <p className="vt-ustyazi">Diş hekimleri ve klinikler için</p>
          <h1 className="vt-h1" style={{ maxWidth: 900 }}>Muayenehanenizin dijital tarafı, tek yerde.</h1>
          <p className="vt-govde">
            Profiliniz, randevu talepleriniz, hasta yorumlarınız ve dijital kartvizitiniz aynı panelde.
            Listeleme ücretsizdir; dakikalar içinde başlarsınız.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link href="/katil" className="vt-dugme vt-dugme--koyu">İşletmenizi ekleyin</Link>
            <Link href="/klinikler" className="vt-dugme vt-dugme--acik">Profilinizi sahiplenin</Link>
          </div>
          {(s.klinik > 0 || s.hekim > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 56px', marginTop: 56 }}>
              {[[sayi(s.klinik), 'listelenen klinik ve muayenehane'], [sayi(s.hekim), 'hekim profili'], ['81', 'il']].map(([k, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 3.6vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#0E1A2C', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k}</div>
                  <div style={{ fontSize: 14.5, color: '#586273', marginTop: 8 }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Öne çıkan araçlar: yapışkan menü + büyük kartlar ── */}
      <section className="vt-bolum" style={{ paddingTop: 24 }}>
        <div className="container">
          <AracVitrini baslik="Öne çıkan araçlar" araclar={ARACLAR} />
        </div>
      </section>

      {/* ── Tüm özellikler ── */}
      <section className="vt-bolum" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <h2 className="vt-h2" style={{ marginBottom: 12 }}>Panelinizde neler var?</h2>
          <p className="vt-govde" style={{ marginTop: 0, marginBottom: 36 }}>Çoğu özellik ücretsizdir. Pro etiketi taşıyanlar aylık üyelikle açılır.</p>
          <div className="vt-izgara">
            {OZELLIKLER.map(o => {
              const ic = (
                <>
                  <NoktaGrafik ikon={o.ikon} size={170} />
                  <span className="vt-oz__etiket" style={o.etiket === 'Pro' ? { color: '#8A6A1F' } : { color: '#2E6B4F' }}>{o.etiket}</span>
                  <h3 className="vt-oz__ad">{o.ad}</h3>
                  <p className="vt-oz__metin">{o.metin}</p>
                </>
              );
              return o.href
                ? <Link key={o.ad} href={o.href} className="vt-oz">{ic}</Link>
                : <div key={o.ad} className="vt-oz">{ic}</div>;
            })}
          </div>
        </div>
      </section>

      {/* ── Koyu bento ── */}
      <section className="vt-bolum vt-koyu">
        <div className="container">
          <div className="vt-bento">
            <div className="vt-bk vt-bk--uzun">
              <h3>Hastalar aradığı yerde karşılarına çıkın</h3>
              <p>Her il, ilçe ve tedavi için ayrı sayfalar var. Profiliniz, bulunduğunuz bölgenin ve uzmanlığınızın sayfalarında yer alır.</p>
              <div className="vt-bk__gorsel"><BolgeGorsel /></div>
            </div>
            <div className="vt-bk">
              <h3>Profiliniz doldukça sıranız yükselir</h3>
              <p>Fotoğraf, tanıtım yazısı, eğitim ve çalışma saatleri puan kazandırır. Eksiklerinizi panelde kalem kalem görürsünüz.</p>
              <div className="vt-bk__gorsel"><PuanGorsel /></div>
            </div>
            <div className="vt-bk">
              <h3>Ekibinizle birlikte yönetin</h3>
              <p>Yöneticiye tam erişim, asistana yalnızca seçtiğiniz alanlar. Erişimi dilediğiniz an kaldırırsınız.</p>
              <div className="vt-bk__gorsel"><EkipGorsel /></div>
            </div>
            <div className="vt-bk" style={{ gridColumn: '1 / -1', minHeight: 0 }}>
              <h3>Üç adımda başlayın</h3>
              <p>Çoğu başvuru birkaç saat içinde, en geç 24 saatte yanıtlanır. İşletmeniz zaten listedeyse kayıtlar birleştirilir.</p>
              <div className="vt-bk__gorsel" style={{ maxWidth: 520 }}><AdimGorsel /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ücret ── */}
      <section className="vt-bolum">
        <div className="container">
          <h2 className="vt-h2" style={{ marginBottom: 36 }}>Ücretsiz başlayın, gerekirse yükseltin.</h2>
          <div className="vt-izgara" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className="vt-oz" style={{ minHeight: 260 }}>
              <span className="vt-oz__etiket" style={{ color: '#2E6B4F' }}>Ücretsiz</span>
              <h3 className="vt-oz__ad" style={{ fontSize: 'clamp(30px, 3.4vw, 44px)' }}>0 TL</h3>
              <p className="vt-oz__metin" style={{ maxWidth: 420 }}>Profil, randevu talepleri, yorum yanıtlama, HekimKart, makale yayınlama ve ekip erişimi.</p>
              <div style={{ marginTop: 'auto', paddingTop: 24 }}><Link href="/katil" className="vt-dugme vt-dugme--koyu">İşletmenizi ekleyin</Link></div>
            </div>
            <div className="vt-oz" style={{ minHeight: 260 }}>
              <NoktaGrafik ikon="premium" size={200} />
              <span className="vt-oz__etiket" style={{ color: '#8A6A1F' }}>Pro</span>
              <h3 className="vt-oz__ad" style={{ fontSize: 'clamp(30px, 3.4vw, 44px)' }}>{PRO_AYLIK_TL} TL <span style={{ fontSize: '0.45em', fontWeight: 600, letterSpacing: 0, color: '#586273' }}>/ ay</span></h3>
              <p className="vt-oz__metin" style={{ maxWidth: 420 }}>Saat seçmeli randevu takvimi, sitenize randevu modülü, web ve sosyal bağlantılar, yapay zekâ asistanı. Taahhüt yok; dilediğiniz an iptal edersiniz.</p>
              <div style={{ marginTop: 'auto', paddingTop: 24 }}><Link href="/pro" className="vt-dugme vt-dugme--acik">Pro özelliklerini inceleyin</Link></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
