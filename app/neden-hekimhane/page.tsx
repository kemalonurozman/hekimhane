import type { Metadata } from 'next';
import Link from 'next/link';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import NoktaGrafik from '@/components/vitrin/NoktaGrafik';
import { supabase } from '@/lib/supabase';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, OzDugme, sssJsonLd } from '@/components/ozellik/Ozellik';

// Neden Hekimhane? — özellik sayfası dili (bkz. components/ozellik/Ozellik.tsx).
// Sayaçlar veritabanından gelir; doğrulanamayan sayı/oran yazılmaz.

const URL_ = 'https://www.hekimhane.com.tr/neden-hekimhane';

export const metadata: Metadata = {
  title: 'Neden Hekimhane? — Diş Hekimleri ve Klinikler İçin',
  description: 'Hekimhane; diş hekimleri ve klinikler için ücretsiz profil, randevu talepleri, yorum yönetimi, HekimKart dijital kartvizit ve ekip erişimi sunar.',
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'Neden Hekimhane?',
    description: 'Diş hekimleri ve klinikler için profil, randevu, yorum ve dijital kartvizit — tek yerde.',
    url: URL_,
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

// ── Koyu bant: listelemenin faydaları ──
const FAYDALAR: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: 'Aradığı yerde karşısına çıkın',
    metin: 'Her il, ilçe ve tedavi için ayrı sayfalar var. Profiliniz, bulunduğunuz bölgenin ve uzmanlığınızın sayfalarında yer alır.',
    gorsel: <MiniBolge />,
  },
  {
    baslik: 'Profiliniz doldukça sıranız yükselir',
    metin: 'Fotoğraf, tanıtım yazısı, eğitim ve çalışma saatleri puan kazandırır. Eksiklerinizi panelde kalem kalem görürsünüz.',
    gorsel: <MiniPuan />,
  },
  {
    baslik: 'Ekibinizle birlikte yönetin',
    metin: 'Yöneticiye tam erişim, asistana yalnızca seçtiğiniz alanlar. Erişimi dilediğiniz an kaldırırsınız.',
    gorsel: <MiniEkip />,
  },
  {
    baslik: 'Talepler panelinize düşer',
    metin: 'Profilinizden gelen randevu talepleri panelinize ve e-postanıza ulaşır; arandı, ertelendi, tamamlandı diye izlersiniz.',
    gorsel: <MiniTalep />,
  },
];

// ── Panelinizde neler var? (her öğe kendi özellik sayfasına bağlanır) ──
const OZELLIKLER: { etiket: string; ad: string; metin: string; ikon: HkIkonAdi; renk: string; href: string; rozet?: 'Pro' | 'Yeni' }[] = [
  {
    etiket: 'Ozvelo.com ortaklığıyla', ad: 'Hekimhane Booking', rozet: 'Yeni', ikon: 'phone', renk: 'rgba(13,124,121,.45)', href: '/booking',
    metin: 'Telefon çağrılarını ve mesajları 7/24 yanıtlayan yapay zekâ asistanı; Ozvelo.com ortaklığıyla.',
  },
  {
    etiket: 'Ücretsiz · saat seçimi Pro ile', ad: 'Randevu sistemi', ikon: 'appointment', renk: 'rgba(26,95,208,.45)', href: '/randevu-sistemi',
    metin: 'Profilinizden gelen talepler panelinize ve e-postanıza düşer; arandı, ertelendi, tamamlandı diye izlersiniz. Pro’da hastalar uygun saati kendisi seçer.',
  },
  {
    etiket: 'Web siteniz', ad: 'Sitenize randevu modülü', rozet: 'Pro', ikon: 'clinic', renk: 'rgba(184,137,47,.5)', href: '/randevu-modulu',
    metin: 'Aynı takvimi kendi web sitenize yerleştirin; hastalar sitenizden çıkmadan randevu alır.',
  },
  {
    etiket: 'MCP bağlantısı', ad: 'Yapay zekâ ile yönetim', rozet: 'Pro', ikon: 'message', renk: 'rgba(91,63,184,.4)', href: '/mcp',
    metin: 'Kullandığınız yapay zekâ asistanına bağlayın; randevuları ve takvimi yazarak yönetin.',
  },
  {
    etiket: 'Ücretsiz', ad: 'HekimKart', ikon: 'hekimkart', renk: 'rgba(13,124,121,.45)', href: '/hekimkart',
    metin: 'Tüm iletişim bilgileriniz tek bağlantıda. Karekodla paylaşın; profiliniz değiştikçe kartınız da güncellenir.',
  },
  {
    etiket: 'Ücretsiz', ad: 'Yorum yönetimi', ikon: 'review', renk: 'rgba(184,137,47,.5)', href: '/degerlendirme-sistemi',
    metin: 'Hasta değerlendirmelerini tek ekranda görün, her birine kendi sözlerinizle yanıt verin.',
  },
  {
    etiket: 'İçerik', ad: 'Makale yayınlama', ikon: 'blog', renk: 'rgba(26,95,208,.45)', href: '/makale-yayinla',
    metin: 'Uzmanlık alanınızda yazın; onaylanan makaleniz blogda adınızla yayımlanır. Kalıcı iş ortağı makalesi için ayrı paket de var.',
  },
  {
    etiket: 'Ücretsiz', ad: 'Profil ve ekip', ikon: 'doctor-profile', renk: 'rgba(91,63,184,.4)', href: '/katil',
    metin: 'Adres, çalışma saatleri, uzmanlıklar, logo ve fotoğraflarınızı dilediğiniz an güncelleyin; yönetici ya da asistan ekleyin.',
  },
  {
    etiket: 'Aylık üyelik', ad: 'Hekimhane-Pro', rozet: 'Pro', ikon: 'premium', renk: 'rgba(184,137,47,.5)', href: '/pro',
    metin: `Saat seçmeli takvim, sitenize randevu modülü, web ve sosyal bağlantılar, yapay zekâ ile yönetim. Aylık ${PRO_AYLIK_TL} TL.`,
  },
];

const ADIMLAR = [
  { baslik: 'Türünüzü seçin', metin: 'İşletmenizin türünü seçerek başlayın. İşletmeniz zaten listedeyse kayıtlar birleştirilir.' },
  { baslik: 'Bilgilerinizi girin', metin: 'Başvuru formunda temel bilgilerinizi girin.' },
  { baslik: 'Onay e-postasını alın', metin: 'Çoğu başvuru birkaç saat içinde, en geç 24 saatte yanıtlanır.' },
  { baslik: 'Panelden tamamlayın', metin: 'Fotoğraf, çalışma saatleri ve uzmanlıklarınızı panelden dilediğiniz an ekler ve güncellersiniz.' },
];

const GUVEN: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'settings', baslik: 'Kontrol sizde', metin: 'Adres, çalışma saatleri, uzmanlıklar, logo ve fotoğraflarınızı dilediğiniz an güncellersiniz.' },
  { ikon: 'user-account', baslik: 'Ekip erişimi yetkiyle', metin: 'Yöneticiye tam erişim, asistana yalnızca seçtiğiniz alanlar. Erişimi dilediğiniz an kaldırırsınız.' },
  { ikon: 'review', baslik: 'Yorumlara söz hakkı', metin: 'Hasta değerlendirmelerinin her birine kendi sözlerinizle yanıt verirsiniz.' },
  { ikon: 'verified', baslik: 'Taahhüt yok', metin: 'Listeleme ücretsizdir. Pro aylık üyeliktir; dilediğiniz an iptal edersiniz.' },
];

const SSS: { s: string; c: string }[] = [
  { s: 'Hekimhane’de listelenmek ücretli mi?', c: 'Hayır. Profil, randevu talepleri, yorum yanıtlama, HekimKart, makale yayınlama ve ekip erişimi ücretsizdir. İsteğe bağlı Hekimhane-Pro aylık üyeliktir; saat seçmeli takvim, sitenize randevu modülü, web ve sosyal bağlantılar ve yapay zekâ ile yönetim sunar.' },
  { s: 'İşletmem zaten listede; ne yapmalıyım?', c: 'Profilinizi sahiplenip panelden yönetmeye başlayabilirsiniz. İşletmeniz zaten listedeyse başvurunuzda kayıtlar birleştirilir.' },
  { s: 'Başvurum ne kadar sürede yanıtlanır?', c: 'Çoğu başvuru birkaç saat içinde, en geç 24 saatte yanıtlanır. Sonucu e-posta ile alırsınız.' },
  { s: 'Profilim doldukça gerçekten öne çıkar mı?', c: 'Evet. Fotoğraf, tanıtım yazısı, eğitim ve çalışma saatleri gibi bilgiler profilinize puan kazandırır ve profil doldukça sıranız yükselir. Eksiklerinizi panelde kalem kalem görürsünüz.' },
  { s: 'Ekibimle birlikte yönetebilir miyim?', c: 'Evet. Yönetici ekleyebilirsiniz; yöneticiye tam erişim, asistana yalnızca seçtiğiniz alanlar açılır. Erişimi dilediğiniz an kaldırırsınız.' },
  { s: 'Pro üyelikte taahhüt var mı?', c: 'Hayır. Pro aylık üyeliktir; taahhüt yoktur ve dilediğiniz an iptal edebilirsiniz.' },
  { s: 'Özellikleri canlı görebilir miyim?', c: 'Evet. Sayfadaki formda “Demo istiyorum” seçeneğini işaretleyin; ekibimiz sizi arayıp özellikleri canlı olarak göstersin.' },
];

export default async function NedenHekimhanePage() {
  const s = await getSayilar();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Neden Hekimhane? — Diş Hekimleri ve Klinikler İçin',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };
  const sayaclar: [string, string][] = [[sayi(s.klinik), 'listelenen klinik ve muayenehane'], [sayi(s.hekim), 'hekim profili'], ['81', 'il']];

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Ücretsiz"
        urun="Diş hekimleri ve klinikler için"
        baslik={['Muayenehanenizin dijital tarafı,', 'tek yerde']}
        govde="Profiliniz, randevu talepleriniz, hasta yorumlarınız ve dijital kartvizitiniz aynı panelde. Listeleme ücretsizdir; dakikalar içinde başlarsınız."
        birincil={{ ad: 'İşletmenizi ekleyin', href: '/katil' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={(s.klinik > 0 || s.hekim > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 44px', marginTop: 40 }}>
            {sayaclar.map(([k, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#0E1A2C', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k}</div>
                <div style={{ fontSize: 14, color: '#586273', marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      />

      <OzBant
        baslik="Hastalar aradığı yerde sizi bulsun"
        alt="Profiliniz bölge ve tedavi sayfalarında yer alır, doldukça öne çıkar. Ekibinizle birlikte yönetirsiniz."
        kartlar={FAYDALAR}
        cta={{ ad: 'İşletmenizi ekleyin', href: '/katil' }}
      />

      <OzIzgara
        ustyazi="Tek panel"
        baslik="Panelinizde neler var?"
        govde="Çoğu özellik ücretsizdir. Pro rozeti taşıyanlar aylık üyelikle açılır. Ayrıntı için karta tıklayın."
        ogeler={OZELLIKLER}
      />

      <OzAdimlar ustyazi="Nasıl başlanır?" baslik="Dört adımda başlayın" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Güven ve kontrol"
        baslik="Profiliniz ve erişimler sizin elinizde"
        govde="Bilgilerinizi siz yönetir, kimin neye erişeceğini siz belirlersiniz."
        ogeler={GUVEN}
      />

      {/* ── ÜCRET ── */}
      <section className="vt-zemin vt-bolum">
        <div className="container">
          <p className="vt-ustyazi">Ücret</p>
          <h2 className="vt-h2">Ücretsiz başlayın, gerekirse yükseltin.</h2>
          <div className="oz-ikili" style={{ marginTop: 44, alignItems: 'stretch', gap: 20 }}>
            <div className="vt-oz" style={{ minHeight: 0 }}>
              <NoktaGrafik ikon="doctor-profile" size={200} renk="rgba(13,124,121,.35)" />
              <span className="vt-oz__etiket">Ücretsiz</span>
              <h3 className="vt-oz__ad" style={{ fontSize: 'clamp(30px, 3.4vw, 44px)' }}>0 TL</h3>
              <p className="vt-oz__metin" style={{ maxWidth: 420 }}>Profil, randevu talepleri, yorum yanıtlama, HekimKart, makale yayınlama ve ekip erişimi.</p>
              <div style={{ position: 'relative', marginTop: 'auto', paddingTop: 24 }}><OzDugme ad="İşletmenizi ekleyin" href="/katil" tur="altin" /></div>
            </div>
            <div className="vt-oz" style={{ minHeight: 0 }}>
              <NoktaGrafik ikon="premium" size={200} renk="rgba(184,137,47,.45)" />
              <span className="vt-oz__etiket">Pro</span>
              <h3 className="vt-oz__ad" style={{ fontSize: 'clamp(30px, 3.4vw, 44px)' }}>{PRO_AYLIK_TL} TL <span style={{ fontSize: '0.45em', fontWeight: 600, letterSpacing: 0, color: '#586273' }}>/ ay</span></h3>
              <p className="vt-oz__metin" style={{ maxWidth: 420 }}>Saat seçmeli randevu takvimi, sitenize randevu modülü, web ve sosyal bağlantılar, yapay zekâ ile yönetim. Taahhüt yok; dilediğiniz an iptal edersiniz.</p>
              <div style={{ position: 'relative', marginTop: 'auto', paddingTop: 24 }}><OzDugme ad="Pro özelliklerini inceleyin" href="/pro" tur="cerceve" /></div>
            </div>
          </div>
        </div>
      </section>

      <OzBasvuru not={false}
        urun="genel"
        baslik="Hekimhane’yi birlikte kuralım"
        metin="Hangi özellikle başlamak istediğinizi bize yazın; sizi arayıp Hekimhane’yi muayenehaneniz için birlikte kuralım. Hazırsanız işletmenizi doğrudan ekleyebilirsiniz."
        vaatler={[
          { ikon: 'phone', ad: 'Sizi arayıp anlatalım' },
          { ikon: 'message', ad: 'Özellikleri canlı demo ile görün' },
          { ikon: 'clinic', ad: 'İşletmenizi birlikte ekleyelim' },
        ]}
        formBaslik="Hekimhane’yi sizin için kuralım"
        formAciklama="Formu doldurun; Hekimhane’yi tanıtalım, işletmenizi ekleme ve panel kurulumunda yardımcı olalım."
        formEtiket="Ücretsiz"
      />

      <OzSss
        sorular={SSS}
        alt={<>İşletmeniz zaten Hekimhane’de mi? <Link href="/klinikler">Profilinizi sahiplenin</Link> ya da <Link href="/katil">işletmenizi ekleyin</Link>.</>}
      />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/numara yok ═══════════════════ */

function Sahne() {
  const satirlar: { ikon: HkIkonAdi; baslik: string; alt: string }[] = [
    { ikon: 'appointment', baslik: 'Yeni randevu talebi', alt: 'Zeynep K. · Salı 09:30' },
    { ikon: 'review', baslik: 'Yeni değerlendirme', alt: 'Yanıtınızı bekliyor' },
    { ikon: 'hekimkart', baslik: 'HekimKart', alt: 'Karekodla paylaşıldı' },
  ];
  return (
    <OzSahne ikon="clinic">
      <OzSahneBaslik ikon="clinic" baslik="Örnek Diş Kliniği" alt="Paneliniz · bugün" durum="Profil yayında" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {satirlar.map((r, i) => (
          <div key={r.baslik} className="vt-h-belir" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, background: '#fff', boxShadow: '0 6px 18px -10px rgba(18,41,77,.3), inset 0 0 0 1px #E6E8EC', animationDelay: `${0.2 + i * 0.5}s` }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 12, background: '#EEF3FA', flex: 'none' }}>
              <HkIcon name={r.ikon} size={20} color="#12294D" />
            </span>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: 14.5, color: '#0E1A2C' }}>{r.baslik}</strong>
              <small style={{ display: 'block', fontSize: 12.5, color: '#586273' }}>{r.alt}</small>
            </div>
          </div>
        ))}
      </div>
      <OzOnayKart ust="Randevu onaylandı" baslik="Salı · 09:30" alt="Hastaya e-posta gönderildi" gecikme={2} />
    </OzSahne>
  );
}

function MiniTalep() {
  const satir = (ad: string, durum: string, ton: 'teal' | 'altin' | 'lacivert') => {
    const renk = { teal: ['#E1F2EE', '#0B5F55'], altin: ['#FDF6E3', '#9C7A2E'], lacivert: ['#EEF3FA', '#12294D'] }[ton];
    return (
      <div key={durum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0E1A2C', whiteSpace: 'nowrap' }}>{ad}</span>
        <span style={{ padding: '3px 9px', borderRadius: 999, background: renk[0], color: renk[1], fontSize: 11, fontWeight: 800 }}>{durum}</span>
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 230 }}>
      {satir('Randevu talebi', 'Arandı', 'teal')}
      {satir('Randevu talebi', 'Ertelendi', 'altin')}
      {satir('Randevu talebi', 'Tamamlandı', 'lacivert')}
    </div>
  );
}

function MiniBolge() {
  const pinler = [[18, 34], [34, 66], [52, 26], [66, 62], [82, 40], [46, 84], [74, 18]];
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 230, height: 130, backgroundImage: 'radial-gradient(circle, rgba(18,41,77,.22) 1.3px, transparent 1.6px)', backgroundSize: '9px 9px', borderRadius: 14 }}>
      {pinler.map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 26, height: 26, marginLeft: -13, marginTop: -13, borderRadius: '50%', background: i % 2 ? 'rgba(184,137,47,.2)' : 'rgba(13,124,121,.18)', display: 'grid', placeItems: 'center' }}>
          <span className="vt-h-nabiz" style={{ width: 9, height: 9, borderRadius: '50%', background: i % 2 ? '#B8892F' : '#0D7C79', animationDelay: `${i * 0.35}s` }} />
        </span>
      ))}
    </div>
  );
}

function MiniPuan() {
  const h = [22, 30, 38, 48, 60, 74, 90];
  return (
    <div className="oz-mc">
      {h.map((x, i) => <span key={i} style={{ height: `${x}%`, animationDelay: `${i * 90}ms` }} className="vt-h-buyu" />)}
      <em><HkIcon name="doctor-profile" size={16} color="#12294D" />Profil doluluğu</em>
    </div>
  );
}

function MiniEkip() {
  const cip = (harf: string, rol: string, altin: boolean) => (
    <span key={rol} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: altin ? '#DEC283' : '#12294D', color: altin ? '#12294D' : '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{harf}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#0E1A2C', whiteSpace: 'nowrap' }}>{rol}</span>
    </span>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 240 }}>
      {cip('S', 'Sahip', true)}{cip('Y', 'Yönetici', false)}{cip('A', 'Asistan · randevu', false)}{cip('A', 'Asistan · yorumlar', false)}
    </div>
  );
}
