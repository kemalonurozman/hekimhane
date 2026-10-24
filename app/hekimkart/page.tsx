import type { Metadata } from 'next';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import { OzSayfa, OzHero, OzSahne, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';

// HekimKart tanıtım sayfası — ücretsiz dijital kartvizit. Özellik sayfası dili (components/ozellik).
// Sahnedeki kart temsilidir (gerçek kişi değil).

const URL_ = 'https://www.hekimhane.com.tr/hekimkart';

export const metadata: Metadata = {
  title: 'HekimKart — Dijital Kartvizit',
  description:
    'HekimKart, diş hekimleri için ücretsiz dijital kartvizit. Online randevu, telefon, Instagram, LinkedIn, Facebook, web sitesi ve konum — hepsi tek linkte ve QR kodda. Her özelliğin ne işe yaradığını keşfedin.',
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'HekimKart — Dijital Kartvizit',
    description: 'Tüm iletişim kanalların tek linkte. Neden özel bir kart olduğunu keşfet.',
    url: URL_,
    type: 'website',
  },
};

// ── Karar yolculuğu (koyu bant) ──
const SIRA: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: '1 · Önce eylem',
    metin: 'Online randevu ve doğrudan arama en üstte. En çok ihtiyaç duyulan iki eylem; dönüşüm burada olur.',
    gorsel: <MiniEylem />,
  },
  {
    baslik: '2 · Sonra güven',
    metin: 'Instagram, LinkedIn ve Facebook tek kompakt satırda, yan yana. Hasta sizi tanıyarak gelir.',
    gorsel: <MiniGuven />,
  },
  {
    baslik: '3 · En son yön',
    metin: 'Web sitesi ve konum en altta: kararını vermiş, iletişime geçmiş hasta için yol tarifi.',
    gorsel: <MiniYon />,
  },
  {
    baslik: '4 · Kartı dışarı taşıyın',
    metin: 'QR kod kliniğinizde, vitrininizde ve basılı kartvizitinizde. Okutan hasta saniyeler içinde kartınızda.',
    gorsel: <MiniQr />,
  },
];

// ── Üç büyük kart: paylaşım, butonlar, profille bağ (kaynak: bu sayfanın önceki metinleri + app/kart ve CLAUDE.md "HekimKart") ──
const BOLUMLER: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Paylaşım', ad: 'Tek link ve QR kod', ikon: 'hekimkart', renk: 'rgba(26,95,208,.45)',
    maddeler: [
      'Tüm iletişim kanallarınız tek bağlantıda',
      'QR kodu kliniğinizde, vitrininizde ve basılı kartvizitinizde kullanın',
      'Okutan hasta saniyeler içinde kartınıza ulaşır',
      'Web sitenize ekleyebileceğiniz hazır rozet kodu panelde',
    ],
  },
  {
    etiket: 'Butonlar', ad: 'Önceliklendirilmiş butonlar', ikon: 'appointment', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Online randevu ve doğrudan arama en üstte; hasta aramadan talebini bırakabilir',
      'Instagram, LinkedIn ve Facebook tek kompakt satırda',
      'Web sitesi ve Google Maps ile tek dokunuşta konum en altta',
      'Web sitesi isteğe bağlıdır; boşsa kartta görünmez',
    ],
  },
  {
    etiket: 'Otomatik güncelleme', ad: 'Profilinizle canlı bağlı', ikon: 'doctor-profile', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Kartta boş bıraktığınız fotoğraf, telefon, web sitesi, konum ve sosyal bağlantılar profilinizden gelir',
      'Profilinizi güncellediğinizde, karta ayrıca yazmadığınız alanlar da güncellenir',
      'Puan ve yorumlar Hekimhane profilinizdeki gerçek hasta yorumlarından gelir',
      'Panelde ziyaretçinin göreceği kartı gerçek hâliyle önizlersiniz',
    ],
  },
];

// ── Sağlığa özel (4 ikonlu kart) ──
const OZELLIKLER: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'verified', baslik: 'Onaylı Hekim rozeti', metin: 'Pro hesaplarda kartın en üstünde yeşil onay rozeti. Sıradan bir link listesinden ayrışmanızı sağlar; güveni ve ciddiyeti artırır.' },
  { ikon: 'star-rating', baslik: 'Gerçek puan ve yorumlar', metin: 'Kartınızdaki puan, Hekimhane profilinizdeki gerçek hasta yorumlarından gelir; uydurma değil. Şeffaf itibar, en güçlü pazarlama.' },
  { ikon: 'doctor-profile', baslik: 'Hekimhane profilinize bağlı', metin: 'Kart, doğrudan Hekimhane profilinize bağlı yapısıyla sıradan bağlantı araçlarından ayrılır; hasta karşısına doğrulanmış kimlikle çıkarsınız.' },
  { ikon: 'price-guide', baslik: 'Tamamen ücretsiz', metin: 'HekimKart ücretsizdir. Yalnızca kartın en üstündeki yeşil Onaylı Hekim rozeti Pro hesaplarda görünür.' },
];

const ADIMLAR = [
  { baslik: 'Kliniğinizi ekleyin', metin: 'Kliniğinizi Hekimhane’ye ücretsiz ekleyin.' },
  { baslik: 'Kartınız hazır', metin: 'Profiliniz onaylandığında dijital kartınız otomatik olarak hazır olur.' },
  { baslik: 'Paylaşın', metin: 'Tek bağlantıyı ve QR kodu kliniğinizde, vitrininizde ve basılı kartınızda kullanın.' },
];

const SSS: { s: string; c: string }[] = [
  { s: 'HekimKart ücretli mi?', c: 'Hayır, HekimKart tamamen ücretsizdir. Kartın en üstündeki yeşil Onaylı Hekim rozeti Pro hesaplarda görünür.' },
  { s: 'Kartımı nasıl oluştururum?', c: 'Kliniğinizi Hekimhane’ye ekleyin; profiliniz onaylandığında dijital kartınız otomatik olarak hazır olur.' },
  { s: 'Kartımdaki puan nereden geliyor?', c: 'Puan, Hekimhane profilinizdeki gerçek hasta yorumlarından gelir.' },
  { s: 'Web sitem yoksa ne olur?', c: 'Web sitesi alanı isteğe bağlıdır; dolu değilse kartınızda görünmez.' },
  { s: 'QR kodu nerede kullanabilirim?', c: 'Kliniğinizde, vitrininizde ya da basılı kartvizitinizde. QR kodu okutan hasta saniyeler içinde kartınıza ulaşır.' },
];

export default function HekimKartTanitim() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'HekimKart — Dijital Kartvizit',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Ücretsiz"
        urun="HekimKart · Dijital kartvizit"
        baslik={['Tüm iletişim kanallarınız', 'tek linkte ve QR kodda']}
        govde="Sıradan bir link listesi değil; sağlığa özel, önceliklendirilmiş bir dijital kartvizit. Online randevu, telefon, Instagram, LinkedIn, Facebook, web sitesi ve konum tek kartta."
        birincil={{ ad: 'Kliniğinizi ekleyin', href: '/katil' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={<p style={{ margin: '18px 0 0', fontSize: 13, color: '#8A93A3' }}>Sağdaki örnek karttır. Gerçek kartınızda kendi fotoğrafınızı ve bilgilerinizi kullanırsınız.</p>}
      />

      <OzBant
        baslik="Butonların sırası tesadüf değil"
        alt="HekimKart, bir hastanın karar yolculuğuna göre tasarlandı: önce eylem, sonra güven, en son yön. QR kod ise kartı fiziksel dünyaya taşır."
        kartlar={SIRA}
        cta={{ ad: 'Kliniğinizi ekleyin', href: '/katil' }}
      />

      <OzIzgara
        ustyazi="Neden özel bir kart?"
        baslik="Her bölüm, bir amaca hizmet ediyor"
        govde="HekimKart’taki her bölüm, hastanın sizi bulmasını, size güvenmesini ve iletişime geçmesini kolaylaştırmak için var."
        ogeler={BOLUMLER}
      />

      <OzAdimlar id="nasil" ustyazi="Nasıl oluşturulur?" baslik="Üç adımda kartınız hazır" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Sağlığa özel"
        baslik="Genel bir “link sayfası” değil"
        govde="Onaylı Hekim rozeti, gerçek hasta yorumlarından gelen puan ve profilinize bağlı yapı: hastanın karşısına güven ve doğrulanmış kimlikle çıkarsınız."
        ogeler={OZELLIKLER}
      />

      <OzBasvuru
        urun="hekimkart"
        baslik="HekimKart hakkında bilgi alın"
        metin="HekimKart ücretsizdir. Kliniğinizi Hekimhane’ye ekleyerek kartınızı hemen oluşturabilirsiniz; profiliniz onaylandığında dijital kartınız otomatik hazır olur. Sorularınız ya da canlı gösterim için formu doldurun."
        vaatler={[
          { ikon: 'phone', ad: 'Sizi arayıp anlatalım' },
          { ikon: 'message', ad: 'Canlı demo ile görün' },
          { ikon: 'hekimkart', ad: 'Tamamen ücretsiz' },
        ]}
        formBaslik="HekimKart için bize ulaşın"
        formAciklama="Bilgilerinizi bırakın; kartınızı nasıl oluşturacağınızı anlatalım ya da canlı gösterelim."
        formEtiket="Ücretsiz"
      />

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/numara yok ═══════════════════ */

const SOSYAL = [
  { ad: 'Instagram', zemin: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' },
  { ad: 'LinkedIn', zemin: 'linear-gradient(135deg,#0A66C2,#004182)' },
  { ad: 'Facebook', zemin: 'linear-gradient(135deg,#1877F2,#0D5EC7)' },
];

function KartDugme({ ikon, ust, ad, tur }: { ikon: HkIkonAdi; ust: string; ad: string; tur: 'yesil' | 'lacivert' | 'acik' }) {
  const zemin = { yesil: 'linear-gradient(135deg,#047857,#059669)', lacivert: 'linear-gradient(135deg,#12294D,#2d5496)', acik: '#F3F5F9' }[tur];
  const koyu = tur !== 'acik';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 12, background: zemin, color: koyu ? '#fff' : '#0E1A2C' }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 8, background: koyu ? 'rgba(255,255,255,.18)' : '#fff', flex: 'none' }}>
        <HkIcon name={ikon} size={17} color={koyu ? '#fff' : '#12294D'} accent={koyu ? '#DEC283' : undefined} />
      </span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
        <small style={{ fontSize: 10, opacity: .78, fontWeight: 500 }}>{ust}</small>
        <b style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad}</b>
      </span>
    </div>
  );
}

function SosyalSatir({ kucuk = false }: { kucuk?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {SOSYAL.map(s => (
        <span key={s.ad} style={{ flex: 1, minWidth: 0, padding: kucuk ? '7px 4px' : '8px 4px', borderRadius: 10, background: s.zemin, color: '#fff', fontSize: kucuk ? 10.5 : 11, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.ad}</span>
      ))}
    </div>
  );
}

function Sahne() {
  return (
    <OzSahne ikon="hekimkart">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', paddingRight: '14%' }}>
        {/* Örnek kart */}
        <div className="vt-h-belir" style={{ position: 'relative', width: 'min(290px, 100%)', borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 50px -24px rgba(18,41,77,.55), inset 0 0 0 1px #E6E8EC' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '20px 16px 14px', background: 'radial-gradient(120% 90% at 50% 0%, #143a6b 0%, #0d2547 55%, #0a1f3d 100%)', color: '#fff', textAlign: 'center' }}>
            <AvatarIllustration />
            <strong style={{ marginTop: 4, fontSize: 16, letterSpacing: '-.02em' }}>Dr. Dt. Elif Yılmaz</strong>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#DEC283' }}>Ağız, Diş ve Çene Cerrahisi</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 3 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,.16)', boxShadow: 'inset 0 0 0 1px rgba(16,185,129,.4)', color: '#6EE7B7', fontSize: 10.5, fontWeight: 700 }}>
                <HkIcon name="verified" size={12} color="#6EE7B7" accent={false} />Onaylı Hekim
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'rgba(222,194,131,.16)', boxShadow: 'inset 0 0 0 1px rgba(222,194,131,.35)', color: '#DEC283', fontSize: 10.5, fontWeight: 700 }}>
                <HkIcon name="star-rating" size={12} color="#DEC283" accent={false} />4,9 · 128
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 12px 6px' }}>
            <KartDugme ikon="appointment" ust="Online Randevu" ad="Randevu Al" tur="yesil" />
            <KartDugme ikon="phone" ust="Doğrudan Ara" ad="Telefonla ara" tur="lacivert" />
            <SosyalSatir />
            <KartDugme ikon="clinic" ust="Web Sitesi" ad="Kliniğin web sitesi" tur="acik" />
            <KartDugme ikon="location-pin" ust="Konum" ad="Haritada görüntüle" tur="acik" />
          </div>
          <div style={{ padding: '4px 0 12px', textAlign: 'center', fontSize: 10, color: '#9AA4B2' }}>Hekimhane ile oluşturuldu</div>
        </div>

        {/* Karekod */}
        <div className="vt-h-belir" style={{ position: 'absolute', right: 0, bottom: 34, width: 118, padding: 10, borderRadius: 16, background: '#fff', boxShadow: '0 18px 40px -18px rgba(18,41,77,.6), inset 0 0 0 1px #E6E8EC', transform: 'rotate(4deg)', animationDelay: '.7s' }}>
          <div style={{ position: 'relative' }}>
            <Karekod />
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 7, background: '#fff', boxShadow: '0 0 0 3px #fff' }}>
                <HkIcon name="hekimkart" size={18} color="#12294D" />
              </span>
            </span>
          </div>
          <div style={{ marginTop: 7, fontSize: 10.5, fontWeight: 700, color: '#12294D', textAlign: 'center' }}>Okutun, karta gidin</div>
        </div>
      </div>
    </OzSahne>
  );
}

/** Temsili karekod deseni (okunmaz; yalnız görsel) — 21×21, üç köşe bulucu kare */
function Karekod() {
  const N = 21;
  const bulucu = (x: number, y: number) => {
    for (const [ox, oy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      const dx = x - ox, dy = y - oy;
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return 0; // beyaz ayraç
        const kenar = dx === 0 || dy === 0 || dx === 6 || dy === 6;
        const ic = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return kenar || ic ? 1 : 0;
      }
    }
    return -1;
  };
  const hucreler: [number, number][] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const b = bulucu(x, y);
      const dolu = b >= 0 ? b === 1 : (y === 6 || x === 6) ? (x + y) % 2 === 0 : ((x * 31 + y * 17 + x * y * 7) % 11) < 5;
      if (dolu) hucreler.push([x, y]);
    }
  }
  return (
    <svg viewBox={`0 0 ${N} ${N}`} width="100%" style={{ display: 'block' }} shapeRendering="crispEdges" aria-hidden="true">
      {hucreler.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#12294D" />)}
    </svg>
  );
}

function MiniEylem() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 220 }}>
      <KartDugme ikon="appointment" ust="Online Randevu" ad="Randevu Al" tur="yesil" />
      <KartDugme ikon="phone" ust="Doğrudan Ara" ad="Telefonla ara" tur="lacivert" />
    </div>
  );
}

function MiniGuven() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 230 }}>
      <div style={{ width: '100%' }}><SosyalSatir kucuk /></div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE', fontSize: 12, fontWeight: 700, color: '#12294D' }}>
        <HkIcon name="verified" size={15} color="#1E8E5A" accent={false} />Onaylı Hekim
      </span>
    </div>
  );
}

function MiniQr() {
  return (
    <div style={{ width: 92, padding: 8, borderRadius: 12, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <Karekod />
    </div>
  );
}

function MiniYon() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 220 }}>
      <KartDugme ikon="clinic" ust="Web Sitesi" ad="Kliniğin web sitesi" tur="acik" />
      <KartDugme ikon="location-pin" ust="Konum" ad="Haritada görüntüle" tur="acik" />
    </div>
  );
}

/* Profil avatarı — kendi içinde illüstrasyon (temsili hekim) */
function AvatarIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 100 100" style={{ borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,.32)' }} aria-hidden="true">
      <defs>
        <clipPath id="hkAvatar"><circle cx="50" cy="50" r="50" /></clipPath>
        <linearGradient id="hkBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE7F5" /><stop offset="1" stopColor="#B9CDE8" />
        </linearGradient>
        <linearGradient id="hkCoat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EEF2F7" />
        </linearGradient>
      </defs>
      <g clipPath="url(#hkAvatar)">
        <rect width="100" height="100" fill="url(#hkBg)" />
        <path d="M20 100 C20 78 34 70 50 70 C66 70 80 78 80 100 Z" fill="url(#hkCoat)" />
        <path d="M50 70 L44 100 M50 70 L56 100" stroke="#D9E0E9" strokeWidth="1.5" fill="none" />
        <path d="M42 72 L50 84 L44 92 Z" fill="#EDF1F6" />
        <path d="M58 72 L50 84 L56 92 Z" fill="#EDF1F6" />
        <path d="M49 84 h2 v16 h-2 z" fill="#1A335E" opacity=".18" />
        <path d="M43 62 h14 v10 c0 4 -14 4 -14 0 z" fill="#E4A886" />
        <ellipse cx="50" cy="46" rx="17" ry="19" fill="#EDB595" />
        <circle cx="33" cy="47" r="3.2" fill="#E4A886" /><circle cx="67" cy="47" r="3.2" fill="#E4A886" />
        <path d="M31 48 C29 26 41 20 50 20 C59 20 71 26 69 48 C69 40 64 33 50 33 C36 33 31 40 31 48 Z" fill="#3A2A26" />
        <path d="M31 48 C30 60 32 66 34 70 C31 62 33 52 34 48 Z" fill="#3A2A26" />
        <path d="M69 48 C70 60 68 66 66 70 C69 62 67 52 66 48 Z" fill="#3A2A26" />
        <path d="M40 42 q4 -2.5 8 0" stroke="#4A362F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M52 42 q4 -2.5 8 0" stroke="#4A362F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="47" r="2.1" fill="#3A2A26" /><circle cx="56" cy="47" r="2.1" fill="#3A2A26" />
        <path d="M44 55 q6 5 12 0" stroke="#B9705A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
