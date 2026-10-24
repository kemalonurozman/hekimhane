import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { BLOG_YAZILARI } from '@/lib/blog-data';
import { MAKALE_FIYAT, KDV_ORANI, KDV_TUTAR, TOPLAM, PAKET_ICERIK, tl } from '@/lib/makale-fiyat';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import { OzSayfa, OzHero, OzSahne, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzKapanis, OzSss, OzDugme, sssJsonLd } from '@/components/ozellik/Ozellik';
import { SiparisFormu, SoruFormu } from './MakaleYayinlaClient';

// İş Ortağı İçeriği — özellik sayfası dili (bkz. components/ozellik/Ozellik.tsx).
// Fiyat ve paket içeriği yalnız lib/makale-fiyat.ts'ten okunur. Formlar MakaleYayinlaClient.tsx'te.

/* Aylık ziyaretçi — analytics'ten gelen gerçek rakamla güncelleyin.
   Hero'da olduğu gibi gösterilir (ör. '45.000+'). */
const AYLIK_ZIYARETCI = '25.000+';

const URL_ = 'https://www.hekimhane.com.tr/makale-yayinla';

export const metadata: Metadata = {
  title: 'Hekimhane\'de Makale Yayınlayın — İş Ortağı İçeriği',
  description: 'Kliniğinizin makalesini Hekimhane\'de kalıcı olarak yayınlayın. Sağlık bilgisi arayan hastalara ulaşın, metin içi SEO bağlantısı alın. Tek paket, tek fiyat.',
  keywords: ['sponsorlu içerik', 'iş ortağı makalesi', 'sağlık blogu reklam', 'klinik tanıtım yazısı', 'backlink', 'diş kliniği reklamı'],
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'Hekimhane\'de Makale Yayınlayın',
    description: 'Her ay sağlık bilgisi arayan on binlerce hastaya ulaşın. Makaleniz sitede kalıcı olarak yer alır.',
    url: URL_,
    type: 'website',
  },
};

async function getStats() {
  try {
    const [klinik, hekim] = await Promise.all([
      supabase.from('klinikler').select('id', { count: 'exact', head: true }),
      supabase.from('doktorlar').select('id', { count: 'exact', head: true }),
    ]);
    return { klinik: klinik.count || 0, hekim: hekim.count || 0 };
  } catch {
    // Supabase düşse bile sayfa render olsun — sayaçlar makul varsayılana düşer.
    return { klinik: 1000, hekim: 2500 };
  }
}

const KDV_YUZDE = Math.round(KDV_ORANI * 100);

// ── Faydalar (koyu bant) ──
const FAYDALAR: { baslik: string; metin: string; gorsel?: React.ReactNode; ikon?: 'blog' }[] = [
  { baslik: 'SEO bağlantıları', metin: 'Makale metnine en fazla 3 harici bağlantı ekleyebilirsiniz. Sitenizin otoritesini ve organik trafiğini artırın.', gorsel: <MiniBaglanti /> },
  { baslik: 'Doğru hedef kitle', metin: 'Hekimhane ziyaretçileri diş hekimi, klinik ve tedavi arayan hastalar — yani tam olarak sizin hedef kitleniz.', gorsel: <MiniArama /> },
  { baslik: 'Profesyonel sunum', metin: 'İçeriğiniz güvenilir bir sağlık rehberi bağlamında, şeffaf biçimde etiketlenerek yayımlanır.', gorsel: <MiniEtiket /> },
  { baslik: 'Kalıcı yayın', metin: 'Makale sitede kalıcı olarak kalır. Tek seferlik ödeme, aylık ücret yok.', ikon: 'blog' },
];

// ── Paketin içeriği (3 büyük kart) — yalnız lib/makale-fiyat.ts PAKET_ICERIK ve sayfadaki bilgilerden ──
const PAKET_KARTLARI: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Yayın', ad: 'Kalıcı blog yayını', ikon: 'blog', renk: 'rgba(26,95,208,.45)',
    maddeler: [
      'Hekimhane blogunda süresiz yayın',
      'Metin içine en fazla 3 harici bağlantı (dofollow)',
      'Editör düzenlemesi, görsel ve SEO optimizasyonu',
      'Yayın sonrası düzeltme ve güncelleme hakkı',
    ],
  },
  {
    etiket: '30 gün', ad: 'Öne çıkarma', ikon: 'search', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Ana sayfada 30 gün öne çıkarma',
      'Blog bölümünde önerilenler alanında 30 gün',
      'En fazla 3 uzmanlık sayfasında gösterim, 30 gün',
      'Bir sonraki e-bültende yer alma',
    ],
  },
  {
    etiket: 'Sipariş', ad: 'Nasıl sipariş verilir?', ikon: 'message', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Formu doldurun; proforma faturayı e-postayla alın',
      'Metni siz gönderin ya da biz yazalım',
      'Ödeme banka havalesi/EFT ile; sipariş ödemeye kadar sizi bağlamaz',
      'Onaylı işletmeniz varsa panelde Makalelerim’den de gönderebilirsiniz',
    ],
  },
];

const GUVEN: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'verified', baslik: 'Editör incelemesi', metin: 'Her makale yayımlanmadan önce editör ekibimiz tarafından incelenir.' },
  { ikon: 'info', baslik: 'Şeffaf etiketleme', metin: 'Makale okuyucuya karşı şeffaflık için “İş Ortağı İçeriği” olarak etiketlenir.' },
  { ikon: 'success', baslik: 'Yayın sonrası düzeltme', metin: 'Yayından sonra da düzeltme ve güncelleme hakkınız vardır.' },
  { ikon: 'price-guide', baslik: 'Tek paket, tek fiyat', metin: `${tl(MAKALE_FIYAT)} ₺ + KDV. Ek modül ya da sürpriz kalem yok; aylık ücret yok.` },
];

const ADIMLAR = [
  { baslik: 'Bize ulaşın', metin: 'Aşağıdaki formu doldurun veya info@hekimhane.com.tr adresine yazın. Konuyu ve isteklerinizi iletin.' },
  { baslik: 'İçerik hazırlığı', metin: 'Metni siz gönderirsiniz ya da biz yazarız. Düzen, görsel ve bağlantıları biz ekleriz.' },
  { baslik: 'İnceleme ve yayın', metin: 'Editör ekibimiz makaleyi inceler ve yayımlar. İş ortağı içeriği olarak şeffafça işaretlenir.' },
  { baslik: 'Öne çıkarma', metin: 'Makale ana sayfada, blog bölümünde ve ilgili uzmanlık sayfalarında öne çıkarılır — fiyata dahil.' },
];

const SSS: { s: string; c: string }[] = [
  { s: 'Fiyata neler dahil?', c: `Tek paket, tek fiyat: ${tl(MAKALE_FIYAT)} ₺ + KDV (KDV dahil ${tl(TOPLAM)} ₺). Pakete dahil olanlar: ${PAKET_ICERIK.join('; ')}. Ek modül ya da sürpriz kalem yoktur.` },
  { s: 'Ödeme nasıl yapılır?', c: 'Siparişinizden sonra proforma faturanızı en geç 1 iş günü içinde e-posta ile göndeririz. Ödeme banka havalesi/EFT ile yapılır; ödeme sonrası makale hazırlığına başlanır. Sipariş, ödeme tamamlanana kadar sizi bağlamaz.' },
  { s: 'Metni kim yazıyor?', c: 'Metni siz gönderebilirsiniz ya da biz yazarız. Düzen, görsel ve bağlantıları biz ekleriz; editör ekibimiz makaleyi inceleyip yayımlar.' },
  { s: 'Makale ne kadar süre yayında kalır?', c: 'Makale Hekimhane’de kalıcı olarak yayında kalır. Tek seferlik ödeme yapılır, aylık ücret yoktur.' },
  { s: 'Makale reklam olarak işaretlenir mi?', c: 'Evet. Her iş ortağı makalesi, okuyucuya karşı şeffaflık için “İş Ortağı İçeriği” olarak etiketlenir.' },
  { s: 'Onaylı işletmem var, yazımı panelden gönderebilir miyim?', c: 'Evet. Hekimhane’de onaylı işletmeniz varsa yazınızı panelinizdeki Makalelerim sekmesinden de gönderebilirsiniz.' },
];

const CHECK = (renk = '#1E8E5A') => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={renk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);

export default async function MakaleYayinlaPage() {
  const stats = await getStats();
  const klinikSayisi = stats.klinik || 1000;
  const hekimSayisi = stats.hekim || 2500;
  const makaleSayisi = BLOG_YAZILARI.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Hekimhane\'de Makale Yayınlayın — İş Ortağı İçeriği',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  const sayaclar = [
    { n: AYLIK_ZIYARETCI, l: 'aylık ziyaretçi' },
    { n: `${tl(klinikSayisi)}+`, l: 'klinik ve muayenehane' },
    { n: `${tl(hekimSayisi)}+`, l: 'veritabanındaki hekim' },
    { n: tl(makaleSayisi), l: 'blogda yayımlanmış makale' },
  ];

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        urun="Hekimhane | İş Ortağı İçeriği"
        baslik={['Hekimhane’de', 'makale yayınlayın']}
        govde="Her ay sağlık bilgisi arayan on binlerce hastaya ulaşın. Makaleniz Hekimhane’de kalıcı olarak yer alır — tek seferlik ödeme, aylık ücret yok."
        birincil={{ ad: 'Makale sipariş et', href: '#siparis' }}
        ikincil={{ ad: 'Fiyatı görün', href: '#fiyat' }}
        sahne={<Sahne />}
        alt={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 24px', marginTop: 34, maxWidth: 460 }}>
            {sayaclar.map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 2.6vw, 30px)', fontWeight: 800, letterSpacing: '-.03em', color: '#12294D', lineHeight: 1.1 }}>{s.n}</div>
                <div style={{ marginTop: 4, fontSize: 13.5, color: '#586273' }}>{s.l}</div>
              </div>
            ))}
          </div>
        }
      />

      <OzBant
        baslik="Neden Hekimhane’de yayın yapmalısınız?"
        alt="Hekimhane, Türkiye’nin diş hekimi ve klinik rehberidir."
        kartlar={FAYDALAR}
        cta={{ ad: 'Makale sipariş et', href: '#siparis' }}
      />

      <OzIzgara
        ustyazi="Pakette neler var?"
        baslik="Yayın, öne çıkarma ve sipariş tek pakette"
        govde="Hepsi tek fiyata dahildir; ayrı modül satın almazsınız."
        ogeler={PAKET_KARTLARI}
      />

      <OzAdimlar id="nasil" baslik="Talebinizden yayına dört adım" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Güven ve şeffaflık"
        baslik="Makaleniz güvenilir bir çerçevede yayımlanır"
        govde="İnceleme, etiketleme ve fiyat baştan açıktır."
        ogeler={GUVEN}
      />

      {/* ── FİYAT — TEK PAKET ── */}
      <section id="fiyat" className="vt-zemin vt-bolum" style={{ scrollMarginTop: 64 }}>
        <div className="container">
          <p className="vt-ustyazi">Fiyat</p>
          <h2 className="vt-h2">Tek paket, tek fiyat</h2>
          <p className="vt-govde">Ek modül yok, sürpriz kalem yok.</p>
          <div className="oz-panel">
            <div className="oz-ikili" style={{ alignItems: 'start' }}>
              <div>
                <span className="oz-etiket">Her şey dahil</span>
                <h3 style={{ margin: '14px 0 6px', fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 2.6vw, 30px)', fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>İş Ortağı Makalesi</h3>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: '#3C4A61' }}>Makale Hekimhane’de kalıcı olarak yayında kalır. Tek seferlik ödeme.</p>
                <div style={{ marginTop: 24, fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-.04em', color: '#12294D', lineHeight: 1 }}>
                  {tl(MAKALE_FIYAT)} ₺
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 14, color: '#586273' }}>
                  KDV hariç · KDV (%{KDV_YUZDE}) dahil toplam <strong style={{ color: '#0E1A2C' }}>{tl(TOPLAM)} ₺</strong>
                </p>
                <div className="oz-cta" style={{ marginTop: 26 }}>
                  <OzDugme ad="Makale sipariş et" href="#siparis" tur="altin" />
                </div>
                <p style={{ margin: '16px 0 0', fontSize: 13, lineHeight: 1.6, color: '#6E6E73' }}>
                  Fiyat KDV hariçtir. Fatura, sipariş ödemesi yapıldıktan sonra düzenlenir.
                </p>
              </div>
              <div style={{ padding: 'clamp(20px, 3vw, 28px)', borderRadius: 22, background: '#F7F8FA', boxShadow: 'inset 0 0 0 1px #E6E8EC' }}>
                <p className="vt-ustyazi" style={{ marginBottom: 16 }}>Pakete dahil</p>
                <ul className="oz-madde">
                  {PAKET_ICERIK.map(d => <li key={d}>{CHECK()}{d}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SİPARİŞ ── */}
      <section id="siparis" className="oz-bekleme">
        <div className="container oz-bekleme__izgara">
          <div className="oz-bekleme__yan">
            <h2 className="vt-h2" style={{ color: '#fff' }}>Makale sipariş edin</h2>
            <p>Bilgileri doldurun, e-posta ile proforma fatura gönderelim.</p>

            <div style={{ marginTop: 28, padding: '20px 22px', borderRadius: 20, background: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#DEC283', marginBottom: 14 }}>Sipariş özeti</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15, marginBottom: 8 }}>
                <span>İş Ortağı Makalesi</span>
                <strong style={{ whiteSpace: 'nowrap' }}>{tl(MAKALE_FIYAT)} ₺</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14.5, color: 'rgba(255,255,255,.7)' }}>
                <span>KDV (%{KDV_YUZDE})</span>
                <span style={{ whiteSpace: 'nowrap' }}>{tl(KDV_TUTAR)} ₺</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.14)', fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>
                <span>Toplam</span>
                <span style={{ whiteSpace: 'nowrap' }}>{tl(TOPLAM)} ₺</span>
              </div>
            </div>

            <ul>
              {PAKET_ICERIK.slice(0, 5).map(d => (
                <li key={d} style={{ alignItems: 'flex-start', fontSize: 15, fontWeight: 500 }}>
                  <span style={{ flex: 'none' }}><HkIcon name="success" size={20} color="#fff" accent="#DEC283" /></span>{d}
                </li>
              ))}
            </ul>
            <p className="oz-bekleme__not">ve dahası — hepsi fiyata dahil. <a href="#fiyat">Paketin tamamı</a></p>
          </div>
          <SiparisFormu />
        </div>
      </section>

      {/* ── SORU ── */}
      <section id="soru" className="vt-bolum" style={{ background: '#fff', scrollMarginTop: 64 }}>
        <div className="container oz-ikili">
          <div>
            <p className="vt-ustyazi">Soru</p>
            <h2 className="vt-h2">Sorunuz mu var?</h2>
            <p className="vt-govde">Bize yazın, 24 saat içinde dönüş yapalım.</p>
            <p style={{ margin: '20px 0 0', fontSize: 15.5, lineHeight: 1.6, color: '#3C4A61' }}>
              Ya da doğrudan <a href="mailto:info@hekimhane.com.tr" style={{ color: '#12294D', fontWeight: 700 }}>info@hekimhane.com.tr</a> adresine yazın.
            </p>
            <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.6, color: '#3C4A61' }}>
              Hekimhane’de onaylı işletmeniz varsa yazınızı{' '}
              <a href="/panel" style={{ color: '#12294D', fontWeight: 700 }}>panelinizdeki Makalelerim</a> sekmesinden de gönderebilirsiniz.
            </p>
          </div>
          <SoruFormu />
        </div>
      </section>

      <OzKapanis
        baslik="Makaleniz Hekimhane’de kalıcı olarak yer alsın"
        metin={`Tek paket, tek fiyat: ${tl(MAKALE_FIYAT)} ₺ + KDV. Bilgileri doldurun, e-posta ile proforma fatura gönderelim.`}
        birincil={{ ad: 'Makale sipariş et', href: '#siparis' }}
        ikincil={{ ad: 'Soru sorun', href: '#soru' }}
      />

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/firma yok ═══════════════════ */

function Cizgi({ w = '100%' }: { w?: string }) {
  return <i style={{ display: 'block', height: 8, width: w, marginTop: 8, borderRadius: 4, background: '#EEF1F6' }} />;
}

function Sahne() {
  return (
    <OzSahne ikon="blog">
      <div className="oz-b oz-b--asistan" style={{ maxWidth: '100%', alignSelf: 'stretch', padding: 0, borderRadius: 18, overflow: 'hidden', animationDelay: '.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#F5F6F8', borderBottom: '1px solid #E6E8EC' }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <i key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
          <span style={{ marginLeft: 8, fontSize: 11.5, color: '#8E8E93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>hekimhane.com.tr/blog/makaleniz</span>
        </div>
        <div style={{ padding: '18px 20px 20px' }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#FDF6E3', boxShadow: 'inset 0 0 0 1px #F0DFB4' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9C7A2E' }}>İş Ortağı İçeriği</div>
            <div style={{ marginTop: 3, fontSize: 12, lineHeight: 1.5, color: '#6E6E73' }}>Bu makale ticari bir iş ortağı ile iş birliği içinde hazırlanmıştır.</div>
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C', lineHeight: 1.2 }}>Makalenizin başlığı</div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12, color: '#6E6E73' }}>
            <strong style={{ color: '#0E1A2C' }}>Kliniğiniz</strong><span>·</span><span>5 dakikalık okuma</span>
          </div>
          <Cizgi /><Cizgi w="94%" /><Cizgi w="86%" />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 12px', borderRadius: 10, background: '#EEF3FA', boxShadow: 'inset 0 0 0 1px #DCE3EE', fontSize: 12.5, fontWeight: 700, color: '#12294D' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
            www.klinigim.com — metin içi bağlantı
          </div>
        </div>
      </div>
      <OzOnayKart ust="Yayında" baslik="Kalıcı yayın" alt="Ana sayfada 30 gün öne çıkarma" gecikme={1.2} />
    </OzSahne>
  );
}

function MiniBaglanti() {
  return (
    <div style={{ width: '100%', maxWidth: 230, padding: 14, borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <Cizgi w="100%" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <i style={{ display: 'block', height: 8, width: '30%', borderRadius: 4, background: '#EEF1F6' }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1A5FD0', textDecoration: 'underline', whiteSpace: 'nowrap' }}>klinigim.com</span>
        <i style={{ display: 'block', height: 8, flex: 1, borderRadius: 4, background: '#EEF1F6' }} />
      </div>
      <Cizgi w="80%" />
      <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: '#0B5F55' }}>En fazla 3 bağlantı</div>
    </div>
  );
}

function MiniArama() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 230 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE', fontSize: 12.5, color: '#0E1A2C' }}>
        <HkIcon name="search" size={16} color="#12294D" />implant tedavisi
      </div>
      {['78%', '64%', '70%'].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: i === 0 ? '#E1F2EE' : '#fff', boxShadow: i === 0 ? 'inset 0 0 0 1.5px #0D7C79' : 'inset 0 0 0 1px #DCE3EE' }}>
          <span style={{ width: 18, height: 18, borderRadius: 6, background: i === 0 ? '#0D7C79' : '#D6DDF0', flex: 'none' }} />
          <i style={{ display: 'block', height: 7, width: w, borderRadius: 4, background: i === 0 ? '#9ED8CF' : '#EEF1F6' }} />
        </div>
      ))}
    </div>
  );
}

function MiniEtiket() {
  return (
    <div style={{ width: '100%', maxWidth: 230, padding: 14, borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ padding: '7px 10px', borderRadius: 8, background: '#FDF6E3', boxShadow: 'inset 0 0 0 1px #F0DFB4', fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9C7A2E' }}>İş Ortağı İçeriği</div>
      <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 800, color: '#0E1A2C' }}>Makalenizin başlığı</div>
      <Cizgi /><Cizgi w="88%" />
    </div>
  );
}
