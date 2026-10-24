import type { Metadata } from 'next';
import Link from 'next/link';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';
import { PRO_FIYAT_ETIKET } from '@/lib/pro-plan';

// Hekim Randevu Sistemi (Randevu Takvimi, Pro) — özellik sayfası dili (bkz. components/ozellik/Ozellik.tsx).
// Çizimler temsili; gerçek kişi adı/numarası yok.

const URL_ = 'https://www.hekimhane.com.tr/randevu-sistemi';

export const metadata: Metadata = {
  title: 'Hekim Randevu Sistemi — Online Randevu, Hatırlatma ve Takvim Yönetimi',
  description: 'Hekimhane Randevu Sistemi nasıl çalışır? Hastalar uygun tarihi sistemden seçer; talep hekime anında iletilir, e-posta bırakan hastaya bilgi ve hatırlatma maili gider. Hekimler takvimlerini kolayca açıp bloke edebilir.',
  alternates: { canonical: URL_ },
};

// ── Faydalar (koyu bant) ──
const FAYDALAR: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: 'Telefon beklemeden randevu',
    metin: 'Hasta, hekimin sayfasında açık tarih ve saatleri görür, uygun olanı seçer. Telefon beklemeye, mesai saatine gerek yok.',
    gorsel: <MiniSaatler />,
  },
  {
    baslik: 'Çift taraflı onay maili',
    metin: 'Randevu talebi gelince hekime e-posta gider; hasta e-posta bıraktıysa ona da yazılı bilgi iletilir. Hekim gelen hastayı, hasta talep ettiği saati yazılı olarak bilir.',
    gorsel: <MiniCiftMail />,
  },
  {
    baslik: 'Randevudan önce hatırlatma',
    metin: 'Randevu gününden bir gün önce, e-posta bırakmış hastaya otomatik hatırlatma gider; gelemeyecekse işletmeye haber vermesi rica edilir. Erken haber, o saatin başka bir hastaya açılmasını sağlar.',
    gorsel: <MiniHatirlatma />,
  },
  {
    baslik: 'Takvim sizin elinizde',
    metin: 'İstediğiniz gün ve saat dilimini tek dokunuşla randevuya kapatır ya da yeniden açarsınız. Bloke saatler hastalara gösterilmez.',
    gorsel: <MiniAcKapa />,
  },
];

const ADIMLAR = [
  { baslik: 'Uygun zamanı seçin', metin: 'Hasta, hekimin sayfasından “Randevu Al” butonuna basar; açık tarih ve saat dilimini sistemden seçer.' },
  { baslik: 'Talep anında iletilir', metin: 'Randevu talebi hekime ve Hekimhane’ye saniyeler içinde ulaşır — telefon beklemeye, mesai saatine gerek yok.' },
  { baslik: 'Çift taraflı onay maili', metin: 'Hekime bildirim e-postası gider; e-posta bırakan hastaya da talebinin alındığı bildirilir. İki taraf da aynı bilgiye sahiptir.' },
  { baslik: 'Randevudan önce hatırlatma', metin: 'Randevu gününden bir gün önce, e-posta bırakan hastaya hatırlatma maili gönderilir: “Gelemeyecekseniz lütfen bilgi verin.”' },
];

const AVANTAJLAR: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[]; href?: string; rozet?: 'Pro' }[] = [
  {
    etiket: 'Hastalar için', ad: 'Beklemeden randevu', ikon: 'user-account', renk: 'rgba(26,95,208,.4)',
    maddeler: [
      'Telefonda beklemeden, istediği saatte randevu talebi',
      'Açık saatleri görür, uygun olanı seçer',
      'Dolu saatler gizlenir; aynı saat iki kişiye verilmez',
      'E-posta bırakırsa yazılı bilgi ve hatırlatma alır',
    ],
  },
  {
    etiket: 'Hekimler için', ad: 'Düzenli bir program', ikon: 'doctor-profile', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Gün ve saatleri tek dokunuşla aç ya da bloke edin',
      'Her yeni talepte e-posta bildirimi',
      'Takvimde boş saate tıklayıp elle randevu ekleyin',
      'Randevuyu erteleyin ya da iptal edin; hastaya e-posta gider',
    ],
  },
  {
    etiket: 'Randevu Modülü', rozet: 'Pro', ad: 'Kendi sitenizde de →', ikon: 'clinic', renk: 'rgba(184,137,47,.5)', href: '/randevu-modulu',
    maddeler: [
      'Aynı takvim web sitenizde de çalışır',
      'Tek satır kodla eklenir',
      'Tüm talepler tek panelde buluşur',
    ],
  },
];

const GUVEN: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'settings', baslik: 'Takvim sizde', metin: 'Çalışma saatleriniz ve randevu süresi (15, 20, 30, 45 ya da 60 dakika) sizin belirlediğiniz gibi işler; istediğiniz zaman takvimi kapatıp serbest tercihe dönebilirsiniz.' },
  { ikon: 'success', baslik: 'Çakışma olmaz', metin: 'Aynı saat için ikinci bir randevu alınamaz. Saat az önce dolduysa hasta başka bir saat seçer.' },
  { ikon: 'notification', baslik: 'Hastaya haber gider', metin: 'Randevuyu ertelediğinizde ya da iptal ettiğinizde, e-posta bırakmış hastaya bilgi gider. Tamamlandı işaretlerseniz onaylı yorum bağlantısı da iletilir.' },
  { ikon: 'info', baslik: 'Bilmeniz gerekenler', metin: `Saat seçmeli randevu takvimi Pro üyelikle (${PRO_FIYAT_ETIKET}) açılır. Bildirimler e-postayla gider; hasta e-posta bırakmazsa ona onay ve hatırlatma gitmez.` },
];

const SSS: { s: string; c: string }[] = [
  { s: 'Hekimhane üzerinden randevu nasıl alınır?', c: 'Hekimin veya kliniğin Hekimhane profiline gidip “Randevu Al” butonuna basın, açık tarih ve saat dilimini seçin, ad-soyad ve iletişim bilginizi bırakın. Talebiniz anında hekime iletilir; e-posta adresi bıraktıysanız talebinizin alındığını bildiren bir e-posta da gelir.' },
  { s: 'Randevu aldığımda bana e-posta gelir mi?', c: 'E-posta adresi bıraktıysanız evet: talebiniz alındığında bilgilendirme e-postası gelir, randevu gününden bir gün önce de hatırlatma iletilir. Hekime ise her yeni talepte e-posta gider.' },
  { s: 'Randevuya gelemeyeceğim, ne yapmalıyım?', c: 'Hatırlatma e-postasındaki bilgilerle hekime en kısa sürede haber vermeniz yeterlidir. Erken bilgi vermeniz, o saatin başka bir hastaya açılmasını sağlar.' },
  { s: 'Hekimler randevu takvimini nasıl yönetir?', c: 'Hekimler panelden istedikleri gün ve saat dilimlerini tek dokunuşla randevuya kapatabilir (bloke) veya yeniden açabilir. Bloke edilen saatler hastalara gösterilmez.' },
  { s: 'Randevu süresini değiştirebilir miyim?', c: 'Evet. Panelin Randevu Takvimi sekmesinde randevu süresini 15, 20, 30, 45 ya da 60 dakika olarak seçersiniz. Saatler, profilinizdeki çalışma saatlerinden okunur.' },
  { s: 'Randevuyu ertelersem ya da iptal edersem hasta haberdar olur mu?', c: 'Evet. Hasta e-posta adresi bıraktıysa, ertelemede yeni tarih-saat, iptalde iptal bilgisi e-postayla gider. Seçtiğiniz yeni saat başka bir hasta tarafından alınmışsa sistem erteleme yapmaz, başka saat seçmenizi ister.' },
  { s: 'Randevu takvimi ücretsiz mi?', c: `Hekimhane profili ücretsizdir. Hastaların saat seçerek randevu aldığı takvim ise Pro üyelikle (${PRO_FIYAT_ETIKET}) açılır.` },
];

export default function RandevuSistemiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Hekim Randevu Sistemi — Online Randevu, Hatırlatma ve Takvim Yönetimi',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Pro"
        urun="Hekimhane | Randevu Takvimi"
        baslik={['Randevular telefonla değil,', 'sistemden seçilir']}
        govde="Hekime her talepte e-posta gider, hasta e-posta bıraktıysa bilgilendirilir ve randevudan bir gün önce hatırlatma alır; hekimler takvimlerini istedikleri gibi açıp kapatır."
        birincil={{ ad: 'İşletmemi ekle', href: '/katil' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={
          <Link href="/doktorlar" className="oz-ortak-not">
            <HkIcon name="search" size={16} color="#12294D" />
            <span>Hasta mısınız? Hekimlerden randevu alın</span>
          </Link>
        }
      />

      <OzBant
        baslik="Yazılı bilgi, zamanında hatırlatma"
        alt="Randevu ilk tıklamadan hatırlatmaya kadar sistemde ilerler: iki taraf da aynı bilgiye sahip olur, kimse randevuyu unutmaz."
        kartlar={FAYDALAR}
        cta={{ ad: 'İşletmemi ekle', href: '/katil' }}
      />

      <OzIzgara
        ustyazi="İki taraf için de kolay"
        baslik="Hastalar beklemez, hekimler planlar"
        govde="Aynı takvim hem hastanın randevu almasını hem hekimin programını kolaylaştırır. Dilerseniz kendi web sitenize de ekleyin."
        ogeler={AVANTAJLAR}
      />

      <OzAdimlar id="nasil" baslik="Dört adımda randevu" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Güven ve sınırlar"
        baslik="Kontrol sizde, kurallar açık"
        govde="Takvimin neyi yapıp neyi yapmadığını baştan bilin."
        ogeler={GUVEN}
      />

      {/* ── Takvim kontrolü ── */}
      <section className="vt-bolum">
        <div className="container oz-ikili">
          <div>
            <p className="vt-ustyazi">Takvim kontrolü</p>
            <h2 className="vt-h2">Hekim, takvimini istediği gibi yönetir</h2>
            <p className="vt-govde">
              Panelinizden istediğiniz gün ve saat dilimini tek dokunuşla randevuya kapatır (bloke) ya da yeniden açarsınız.
              İzin, ameliyat, dolu bir gün — bloke edilen saatler hastalara hiç gösterilmez.
            </p>
          </div>
          <TakvimPaneli />
        </div>
      </section>

      <OzBasvuru
        urun="randevu-sistemi"
        baslik="Randevu takvimini sizin için kuralım"
        metin={`Saat seçmeli randevu takvimi Hekimhane-Pro üyelikle (${PRO_FIYAT_ETIKET}) açılır. Takvimi kurmanız ya da nasıl çalıştığını görmeniz için bilgilerinizi bırakın, sizi arayalım. Hekimhane profili ücretsizdir.`}
        vaatler={[
          { ikon: 'appointment', ad: 'Takvimi birlikte kuralım' },
          { ikon: 'message', ad: 'Canlı demo ile görün' },
          { ikon: 'premium', ad: `Pro üyelik: ${PRO_FIYAT_ETIKET}` },
        ]}
        formBaslik="Randevu takvimini sizin için kuralım"
        formAciklama="Bilgilerinizi bırakın; takvimi ve Pro üyeliği anlatmak için sizi arayalım."
        formEtiket="Pro"
      />

      <OzSss
        sorular={SSS}
        alt={<>Hasta mısınız? <Link href="/doktorlar">Hekimlerden randevu alın</Link>. Başka sorularınız için <Link href="/iletisim">iletişim</Link> sayfasından bize ulaşabilirsiniz.</>}
      />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/numara yok ═══════════════════ */

const SLOT_STIL: Record<'acik' | 'secili' | 'bloke', React.CSSProperties> = {
  acik: { background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE', color: '#12294D' },
  secili: { background: '#BDEBE4', boxShadow: '0 0 0 2px #0D7C79', color: '#0B5F55' },
  bloke: { background: '#EEF0F3', color: '#9AA1AD', textDecoration: 'line-through' },
};

function Sahne() {
  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
  const saatler: { s: string; d: 'acik' | 'secili' | 'bloke' }[] = [
    { s: '09:00', d: 'acik' }, { s: '09:30', d: 'secili' }, { s: '10:00', d: 'bloke' },
    { s: '11:00', d: 'acik' }, { s: '14:00', d: 'acik' }, { s: '15:30', d: 'bloke' },
  ];
  return (
    <OzSahne ikon="appointment">
      <OzSahneBaslik ikon="appointment" baslik="Randevu al" alt="Dr. Aksoy · Diş Hekimi" durum="Açık saatler" />
      <div className="vt-h-belir" style={{ position: 'relative', padding: 18, borderRadius: 18, background: '#fff', boxShadow: '0 10px 28px -16px rgba(18,41,77,.35), inset 0 0 0 1px #E6E8EC', animationDelay: '.3s' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#586273', marginBottom: 10 }}>Gün seçin</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
          {gunler.map(g => (
            <span key={g} style={{ display: 'grid', placeItems: 'center', height: 38, borderRadius: 10, fontSize: 13, fontWeight: 700, ...(g === 'Sal' ? { background: '#12294D', color: '#DEC283' } : { background: '#F4F6F9', color: '#3C4A61' }) }}>{g}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#586273', margin: '16px 0 10px' }}>Saat seçin</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {saatler.map(x => (
            <span key={x.s} className={x.d === 'secili' ? 'vt-h-sec' : undefined} style={{ display: 'grid', placeItems: 'center', height: 40, borderRadius: 10, fontSize: 14, fontWeight: 800, ...SLOT_STIL[x.d] }}>{x.s}</span>
          ))}
        </div>
      </div>
      <OzOnayKart ust="Onay maili gönderildi" baslik="Salı · 09:30" alt="Zeynep K. · Hekime ve hastaya" gecikme={1.4} />
    </OzSahne>
  );
}

function MiniSaatler() {
  const s: ('acik' | 'secili' | 'bloke')[] = ['acik', 'bloke', 'secili', 'acik', 'acik', 'bloke'];
  const t = ['09:00', '10:00', '11:00', '13:00', '14:00', '16:00'];
  return (
    <div style={{ width: '100%', maxWidth: 220, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
      {s.map((d, i) => (
        <span key={i} className={d === 'secili' ? 'vt-h-sec' : undefined} style={{ display: 'grid', placeItems: 'center', height: 36, borderRadius: 8, fontSize: 12, fontWeight: 800, ...SLOT_STIL[d] }}>{t[i]}</span>
      ))}
    </div>
  );
}

function MiniCiftMail() {
  const dugum = (ikon: HkIkonAdi, ad: string, koyu?: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 'none' }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 14, background: koyu ? '#12294D' : '#fff', boxShadow: koyu ? 'none' : 'inset 0 0 0 1px #DCE3EE' }}>
        <HkIcon name={ikon} size={24} color={koyu ? '#fff' : '#12294D'} accent="#DEC283" />
      </span>
      <b style={{ fontSize: 11.5, color: '#12294D' }}>{ad}</b>
    </div>
  );
  const cizgi = (
    <span style={{ flex: 1, minWidth: 14, height: 0, marginBottom: 22, borderTop: '2px dashed #B8892F' }} />
  );
  return (
    <div style={{ width: '100%', maxWidth: 240, display: 'flex', alignItems: 'center', gap: 6 }}>
      {dugum('user-account', 'Hasta')}
      {cizgi}
      {dugum('appointment', 'Hekimhane', true)}
      {cizgi}
      {dugum('doctor-profile', 'Hekim')}
    </div>
  );
}

function MiniHatirlatma() {
  return (
    <div style={{ width: '100%', maxWidth: 230, padding: 14, borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 800, color: '#0B5F55', textTransform: 'uppercase', letterSpacing: '.04em' }}>
        <HkIcon name="notification" size={16} color="#0B5F55" />Hatırlatma
      </div>
      <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: '#0E1A2C' }}>Yarın 09:30 randevunuz var.</div>
      <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: '#586273' }}>Gelemeyecekseniz lütfen bilgi verin.</div>
    </div>
  );
}

function MiniAcKapa() {
  const satir = (saat: string, acik: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: acik ? '#12294D' : '#9AA1AD', textDecoration: acik ? 'none' : 'line-through' }}>{saat}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: acik ? '#0B5F55' : '#9AA1AD' }}>
        {acik ? 'Açık' : 'Bloke'}
        <span style={{ position: 'relative', width: 30, height: 18, borderRadius: 9, background: acik ? '#0D7C79' : '#C9CED6' }}>
          <span style={{ position: 'absolute', top: 2, left: acik ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
        </span>
      </span>
    </div>
  );
  return (
    <div style={{ width: '100%', maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 7 }}>
      {satir('Salı 11:00', true)}
      {satir('Salı 13:00', false)}
      {satir('Salı 14:00', true)}
    </div>
  );
}

function TakvimPaneli() {
  const slotlar: { s: string; st: 'acik' | 'bloke' }[] = [
    { s: '09:00', st: 'acik' }, { s: '10:00', st: 'bloke' }, { s: '11:00', st: 'acik' }, { s: '13:00', st: 'bloke' },
    { s: '14:00', st: 'acik' }, { s: '15:00', st: 'acik' }, { s: '16:00', st: 'acik' }, { s: '17:00', st: 'bloke' },
  ];
  return (
    <div className="oz-panel" style={{ marginTop: 0 }} aria-hidden="true">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: '#EEF3FA' }}>
            <HkIcon name="appointment" size={22} color="#12294D" />
          </span>
          <div>
            <b style={{ display: 'block', fontSize: 15, color: '#0E1A2C' }}>Randevu takvimi</b>
            <small style={{ fontSize: 12.5, color: '#586273' }}>Salı</small>
          </div>
        </div>
        <span className="vt-pro">Pro</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        {slotlar.map(x => (
          <div key={x.s} style={{ padding: '10px 4px', borderRadius: 12, textAlign: 'center', ...(x.st === 'acik' ? { background: '#E6F6F2', boxShadow: 'inset 0 0 0 1px #A8DDD3' } : { background: '#F1F2F5', boxShadow: 'inset 0 0 0 1px #E3E5EA' }) }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#12294D', textDecoration: x.st === 'bloke' ? 'line-through' : 'none', opacity: x.st === 'bloke' ? 0.5 : 1 }}>{x.s}</div>
            <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: x.st === 'acik' ? '#0B5F55' : '#9AA1AD' }}>{x.st === 'acik' ? 'Açık' : 'Bloke'}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 18 }}>
        {[['#0D7C79', 'Açık — randevuya uygun'], ['#B8BEC9', 'Bloke — hastalara gösterilmez']].map(([c, t]) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#586273' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: c }} />{t}
          </span>
        ))}
      </div>
    </div>
  );
}
