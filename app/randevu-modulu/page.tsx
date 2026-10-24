import type { Metadata } from 'next';
import Link from 'next/link';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';
import { PRO_FIYAT_ETIKET } from '@/lib/pro-plan';

// Randevu Modülü (Pro) — özellik sayfası dili (bkz. components/ozellik/Ozellik.tsx).
// Çizimler temsili; gerçek kişi adı/numarası/alan adı yok.

const URL_ = 'https://www.hekimhane.com.tr/randevu-modulu';

export const metadata: Metadata = {
  title: 'Randevu Modülü — Her Yerden Randevu Alın',
  description:
    'Kendi web sitenizden, HekimKart’ınızdan ve Hekimhane profilinizden gelen tüm randevu talepleri tek panelde buluşur. Randevu modülünü tek satır kodla sitenize ekleyin, her yerden randevu almaya başlayın.',
  keywords: ['randevu modülü', 'web sitesi randevu', 'diş kliniği online randevu', 'randevu iframe', 'siteme randevu ekle'],
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'Randevu Modülü — Her Yerden Randevu Alın',
    description: 'Kendi sitenizden ve Hekimhane’den gelen tüm randevular tek panelde. Tek satır kodla sitenize ekleyin.',
    url: URL_,
    type: 'website',
  },
};

// ── "Tüm randevularınız aynı sistemde buluşur" — üç kaynak + panel (koyu bant) ──
const KAYNAKLAR: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: 'Kendi web siteniz',
    metin: 'Tek satır kodla sitenize gömün; ziyaretçileriniz sitenizden çıkmadan randevu bırakır.',
    gorsel: <MiniSite />,
  },
  {
    baslik: 'HekimKart’ınız',
    metin: 'Dijital kartvizitinizde randevu butonu hazır gelir; ayrıca kurmanıza gerek yok.',
    gorsel: <MiniKart ikon="hekimkart" ust="HekimKart" />,
  },
  {
    baslik: 'Hekimhane profiliniz',
    metin: 'Rehberdeki profilinizden gelen talepler de aynı yere ulaşır.',
    gorsel: <MiniKart ikon="doctor-profile" ust="Hekimhane profili" />,
  },
  {
    baslik: 'Hepsi tek panelde',
    metin: 'Tüm talepler panelinizdeki “Randevu Talepleri” sekmesinde toplanır; her biri için size e-posta gider.',
    gorsel: <MiniPanel />,
  },
];

const OZELLIKLER: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Kurulum', ad: 'Sitenize gömün', ikon: 'clinic', renk: 'rgba(26,95,208,.4)',
    maddeler: [
      'Tek satırlık HTML kodunu kopyalayıp yapıştırırsınız',
      'WordPress, Wix ya da kendi sitenizde çalışır',
      'Kod bilgisi gerekmez',
      'Kodu panelde canlı önizlemeyle görürsünüz',
    ],
  },
  {
    etiket: 'Panel', ad: 'Tek panelde buluşur', ikon: 'appointment', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Sitenizden, HekimKart’ınızdan ve profilinizden gelen talepler aynı yerde',
      'Randevu Talepleri’nde liste ve takvim görünümü',
      'Her yeni talepte e-posta bildirimi',
      'Yeni, arandı, tamamlandı olarak takip',
    ],
  },
  {
    etiket: 'Görünüm', ad: 'Markanıza uyar', ikon: 'settings', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Bağlantıya renk parametresi ekleyerek markanızın rengine uydurun',
      'Mobil uyumlu, sitenizin içinde açılır',
      'Takvim açıksa hasta uygun saati seçer, dolu saatler gizlenir',
      'Takvim kapalıysa hasta tarih ve saat tercihini bırakır',
    ],
  },
];

const ADIMLAR = [
  { baslik: 'Pro üyeliği açın', metin: 'Randevu modülü Hekimhane-Pro ile çalışır. Pro değilse sitenizde modül yerine bir kilit ekranı görünür.' },
  { baslik: 'Panelden kodu kopyalayın', metin: 'Profili Düzenle → “Siteme Ekle” sekmesinden işletmenize özel hazır kodu kopyalayın.' },
  { baslik: 'Sitenize yapıştırın', metin: 'Kodu web sitenizde randevu almak istediğiniz yere ekleyin. Teknik bilgi gerekmez.' },
  { baslik: 'Randevular panele düşsün', metin: 'Ziyaretçileriniz sizin sitenizden randevu bıraksın; talepler tek panelde toplansın, size e-posta gelsin.' },
];

const GUVEN: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'settings', baslik: 'Takvim sizde', metin: 'Çalışma saatleriniz, randevu süresi ve kapattığınız saatler takvim açıkken sitenizdeki modülde de geçerlidir.' },
  { ikon: 'notification', baslik: 'Talep kaçmaz', metin: 'Her yeni talepte size e-posta gider; Pro üyelikte bildirim iki adrese tanımlanabilir.' },
  { ikon: 'verified', baslik: 'Spam koruması', metin: 'Randevu formunda gizli bir tuzak alanı ve hız sınırı koruması bulunur; otomatik gönderimlere karşı ilk savunma hattıdır.' },
  { ikon: 'info', baslik: 'Pro gerekir', metin: `Randevu modülü Pro üyelikle (${PRO_FIYAT_ETIKET}) çalışır. Ücretsiz üyelikte sitenizde modül yerine kilit ekranı gösterilir.` },
];

const NERELERE = ['WordPress', 'Wix', 'Kendi web siteniz', 'Açılış sayfaları', 'Blog yazıları'];

const IFRAME_KODU = `<iframe src="https://www.hekimhane.com.tr/embed/randevu?type=doktor&id=..."
        width="100%" height="640" style="border:0;max-width:480px"></iframe>`;

const SSS: { s: string; c: string }[] = [
  { s: 'Randevu modülünü siteme nasıl eklerim?', c: 'Panelinizde Profili Düzenle → “Siteme Ekle” sekmesinden işletmenize özel hazır kodu kopyalayın ve web sitenizde randevu almak istediğiniz yere yapıştırın. Teknik bilgi gerekmez.' },
  { s: 'HekimKart’ımda ayrıca kurmam gerekir mi?', c: 'Hayır. Ücretsiz HekimKart sayfanızda randevu butonu baştan gelir.' },
  { s: 'Gelen talepler nereye düşer?', c: 'Hangi kaynaktan gelirse gelsin — web siteniz, HekimKart’ınız ya da Hekimhane profiliniz — tüm talepler panelinizdeki “Randevu Talepleri” sekmesine düşer; her yeni talepte size ve ekibinize e-posta gider.' },
  { s: 'Modülü markamın rengine uydurabilir miyim?', c: 'Evet. Renk parametresiyle modülü markanıza uydurabilirsiniz; modül mobil uyumludur.' },
  { s: 'Randevu modülü hangi üyelikte var?', c: `Randevu modülü Pro üyelikle kullanılır (${PRO_FIYAT_ETIKET}). Hekimhane profiliniz ücretsizdir.` },
  { s: 'Pro üyeliğim yoksa sitemde ne görünür?', c: 'Modül kilitli görünür: ziyaretçilere randevu modülünün şu an aktif olmadığı bilgisi gösterilir. Pro üyelik açıldığında aynı kod kendiliğinden çalışmaya başlar.' },
  { s: 'Ziyaretçiler hangi bilgileri bırakır?', c: 'Ad soyad ve telefon zorunludur; e-posta, tarih, saat ve mesaj isteğe bağlıdır. Talep, panelinizdeki Randevu Talepleri sekmesine düşer.' },
];

export default function RandevuModuluPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Randevu Modülü — Her Yerden Randevu Alın',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Pro"
        urun="Hekimhane | Randevu Modülü"
        baslik={['Her yerden', 'randevu alın']}
        govde="Kendi web sitenizden, HekimKart’ınızdan ve Hekimhane profilinizden gelen tüm randevu talepleri tek panelde buluşur. Farklı yerlerden ve sayfalardan randevu almaya bugün başlayın."
        birincil={{ ad: 'İşletmenizi ekleyin', href: '/katil' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={
          <Link href="/randevu-sistemi" className="oz-ortak-not">
            <HkIcon name="appointment" size={16} color="#12294D" />
            <span>Randevu takvimi nasıl çalışır?</span>
          </Link>
        }
      />

      <OzBant
        baslik="Tüm randevularınız aynı sistemde buluşur"
        alt="Talep nereden gelirse gelsin — sitenizden, HekimKart’ınızdan ya da Hekimhane profilinizden — aynı panele düşer."
        kartlar={KAYNAKLAR}
        cta={{ ad: 'İşletmenizi ekleyin', href: '/katil' }}
      />

      <OzIzgara
        ustyazi="Neden kolay?"
        baslik="Kurulumu dakikalar, etkisi kalıcı"
        govde="Kodu bir kez yapıştırırsınız; talepler tek panelde toplanır."
        ogeler={OZELLIKLER}
      />

      <OzAdimlar id="nasil" ustyazi="Nasıl eklenir?" baslik="Dört adımda sitenizde" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Güven ve sınırlar"
        baslik="Kontrol sizde, kurallar açık"
        govde="Modülün neyi yapıp neyi yapmadığını baştan bilin."
        ogeler={GUVEN}
      />

      {/* ── Örnek kod ── */}
      <section className="vt-bolum">
        <div className="container oz-ikili">
          <div>
            <p className="vt-ustyazi">Örnek kod</p>
            <h2 className="vt-h2">Tek satır kod, sitenizde randevu</h2>
            <p className="vt-govde">
              Kodu web sitenizde randevu almak istediğiniz yere yapıştırın; modül sayfanızın içinde açılır, gelen talepler panelinize düşer.
            </p>
            <p style={{ margin: '30px 0 12px', fontSize: 15, fontWeight: 700, color: '#0E1A2C' }}>Nerelere ekleyebilirsiniz?</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {NERELERE.map(x => (
                <li key={x} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px #E6E8EC', fontSize: 14, fontWeight: 600, color: '#0E1A2C' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E8E5A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="oz-panel" style={{ marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: '#EEF3FA', flex: 'none' }}>
                <HkIcon name="settings" size={22} color="#12294D" />
              </span>
              <div style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 15, color: '#0E1A2C' }}>Siteme Ekle</b>
                <small style={{ fontSize: 12.5, color: '#586273' }}>Panel → Profili Düzenle</small>
              </div>
            </div>
            <div style={{ background: '#0E1A2C', borderRadius: 16, padding: '16px 18px', overflowX: 'auto' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>Örnek kod</div>
              <pre style={{ margin: 0, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12.5, lineHeight: 1.6, color: '#DCE6F5', whiteSpace: 'pre' }}>{IFRAME_KODU}</pre>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: 1.6, color: '#586273' }}>
              İşletmenize özel gerçek kodu, panelinizdeki <strong style={{ color: '#12294D' }}>“Siteme Ekle”</strong> sekmesinden tek tıkla kopyalarsınız.
            </p>
          </div>
        </div>
      </section>

      <OzBasvuru
        urun="randevu-modulu"
        baslik="Randevu modülünü sitenize kuralım"
        metin={`Ücretsiz profilinizi oluşturun; Pro üyelikle (${PRO_FIYAT_ETIKET}) randevu modülünü sitenize ekleyin, tüm talepleri tek panelde yönetin. Kurulumda takılırsanız bilgilerinizi bırakın, sizi arayalım.`}
        vaatler={[
          { ikon: 'clinic', ad: 'Kodu sitenize birlikte ekleyelim' },
          { ikon: 'message', ad: 'Canlı demo ile görün' },
          { ikon: 'premium', ad: `Pro üyelik: ${PRO_FIYAT_ETIKET}` },
        ]}
        formBaslik="Randevu modülünü sitenize kuralım"
        formAciklama="Bilgilerinizi bırakın; modülü ve Pro üyeliği anlatmak için sizi arayalım."
        formEtiket="Pro"
      />

      <OzSss
        sorular={SSS}
        alt={<>Randevu takvimi için <Link href="/randevu-sistemi">Randevu Takvimi</Link> sayfasına, genel bilgi için <Link href="/neden-hekimhane">Neden Hekimhane?</Link> sayfasına göz atabilirsiniz.</>}
      />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/numara/alan adı yok ═══════════ */

function Sahne() {
  const saatler = ['09:30', '11:00', '14:30'];
  return (
    <OzSahne ikon="clinic">
      <OzSahneBaslik ikon="clinic" baslik="Web sitenizde randevu" alt="Randevu modülü · tek satır kod" durum="Yayında" />
      <div className="vt-h-belir" style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: '#fff', boxShadow: '0 10px 28px -16px rgba(18,41,77,.35), inset 0 0 0 1px #E6E8EC', animationDelay: '.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#F4F6F9', borderBottom: '1px solid #E6E8EC' }}>
          {['#E5767A', '#E8C26A', '#7BC79B'].map(c => <i key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
          <span style={{ flex: 1, minWidth: 0, marginLeft: 8, padding: '4px 10px', borderRadius: 7, background: '#fff', fontSize: 11.5, color: '#586273', boxShadow: 'inset 0 0 0 1px #E6E8EC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Web siteniz · Randevu</span>
        </div>
        <div style={{ padding: 16 }}>
          <b style={{ display: 'block', fontSize: 15, color: '#0E1A2C' }}>Randevu alın</b>
          <small style={{ display: 'block', marginTop: 2, fontSize: 12.5, color: '#586273' }}>Dr. Aksoy Muayenehanesi · Perşembe</small>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 12 }}>
            {saatler.map(s => (
              <span key={s} className={s === '11:00' ? 'vt-h-sec' : undefined} style={{ display: 'grid', placeItems: 'center', height: 38, borderRadius: 10, fontSize: 13.5, fontWeight: 800, ...(s === '11:00' ? { background: '#BDEBE4', boxShadow: '0 0 0 2px #0D7C79', color: '#0B5F55' } : { background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE', color: '#12294D' }) }}>{s}</span>
            ))}
          </div>
          <span style={{ display: 'grid', placeItems: 'center', height: 40, marginTop: 12, borderRadius: 10, background: '#DEC283', color: '#12294D', fontSize: 14, fontWeight: 700 }}>Talep gönder</span>
        </div>
      </div>
      <OzOnayKart ust="Panelinize düştü" baslik="Perşembe · 11:00" alt="Mehmet T. · Kaynak: web siteniz" gecikme={1.4} />
    </OzSahne>
  );
}

function MiniSite() {
  return (
    <div style={{ width: '100%', maxWidth: 220, overflow: 'hidden', borderRadius: 12, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ display: 'flex', gap: 4, padding: '7px 10px', background: '#F4F6F9', borderBottom: '1px solid #DCE3EE' }}>
        {[0, 1, 2].map(i => <i key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9CED6' }} />)}
      </div>
      <div style={{ padding: 12 }}>
        <span style={{ display: 'block', width: '70%', height: 8, borderRadius: 4, background: '#D6DDF0' }} />
        <span style={{ display: 'block', width: '90%', height: 6, marginTop: 7, borderRadius: 3, background: '#E8ECF3' }} />
        <span style={{ display: 'block', width: '60%', height: 6, marginTop: 5, borderRadius: 3, background: '#E8ECF3' }} />
        <span style={{ display: 'grid', placeItems: 'center', height: 30, marginTop: 12, borderRadius: 8, background: '#DEC283', color: '#12294D', fontSize: 12, fontWeight: 700 }}>Randevu al</span>
      </div>
    </div>
  );
}

function MiniKart({ ikon, ust }: { ikon: HkIkonAdi; ust: string }) {
  return (
    <div style={{ width: '100%', maxWidth: 200, padding: 14, borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE', textAlign: 'center' }}>
      <span style={{ display: 'inline-grid', placeItems: 'center', width: 42, height: 42, borderRadius: 12, background: '#12294D' }}>
        <HkIcon name={ikon} size={22} color="#fff" accent="#DEC283" />
      </span>
      <small style={{ display: 'block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#586273', textTransform: 'uppercase', letterSpacing: '.04em' }}>{ust}</small>
      <b style={{ display: 'block', marginTop: 2, fontSize: 13.5, color: '#0E1A2C' }}>Dr. Aksoy</b>
      <span style={{ display: 'grid', placeItems: 'center', height: 28, marginTop: 10, borderRadius: 8, background: '#DEC283', color: '#12294D', fontSize: 12, fontWeight: 700 }}>Randevu al</span>
    </div>
  );
}

function MiniPanel() {
  const satirlar: { ad: string; kaynak: string; renk: string }[] = [
    { ad: 'Zeynep K.', kaynak: 'Web sitesi', renk: '#1A5FD0' },
    { ad: 'Mehmet T.', kaynak: 'HekimKart', renk: '#B8892F' },
    { ad: 'Ayşe D.', kaynak: 'Profil', renk: '#0D7C79' },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 230, padding: 12, borderRadius: 14, background: '#12294D' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 11.5, fontWeight: 700, color: '#DEC283' }}>
        <HkIcon name="appointment" size={15} color="#fff" accent="#DEC283" />Randevu Talepleri
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {satirlar.map((s, i) => (
          <div key={s.ad} className="vt-h-belir" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '7px 9px', borderRadius: 8, background: '#fff', animationDelay: `${0.2 + i * 0.25}s` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0E1A2C' }}>{s.ad}</span>
            <span style={{ padding: '2px 7px', borderRadius: 999, background: `${s.renk}1A`, color: s.renk, fontSize: 10.5, fontWeight: 800 }}>{s.kaynak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
