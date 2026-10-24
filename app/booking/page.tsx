import type { Metadata } from 'next';
import Link from 'next/link';
import HkIcon, { type HkIkonAdi } from '@/components/HkIcon';
import HkLogoAnim from '@/components/HkLogoAnim';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzBalonlar, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';
import BeklemeFormu from './BeklemeFormu';

// Hekimhane Booking — Ozvelo.com ortaklığıyla sunulan yapay zekâ randevu
// asistanı (telefon + web sitesi + mesaj). Sistem hazır: başvuru ya da demo talebi toplanır.
// Not: doğrulanamayan sayı/oran yazılmaz (bkz. CLAUDE.md "Vitrin Dili").

const URL_ = 'https://www.hekimhane.com.tr/booking';

export const metadata: Metadata = {
  title: 'Hekimhane Booking — 7/24 Yapay Zekâ Randevu Asistanı',
  description:
    'Hekimhane Booking; çağrılarınızı 7/24 yanıtlayan, web sitenizden ve telefonla otomatik randevu alan yapay zekâ asistanıdır. Ozvelo.com ortaklığıyla. Hemen başvurun ya da demo talep edin.',
  keywords: ['yapay zeka randevu asistanı', 'klinik telefon asistanı', 'muayenehane sanal sekreter', 'otomatik randevu', 'hekimhane booking', 'ozvelo'],
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'Hekimhane Booking — Bir daha asla bir çağrıyı kaçırmayın',
    description: 'Çağrılarınızı ve mesajlarınızı yanıtlayan, randevuları 7/24 planlayan yapay zekâ asistanı. Ozvelo.com ortaklığıyla. Hemen başvurun.',
    url: URL_,
    type: 'website',
  },
};

// ── Faydalar (koyu bant) ──
const FAYDALAR: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: 'Kaçan randevu kalmaz',
    metin: 'Mesai saatleri dışında ve yoğun anlarda gelen çağrılar da yanıtlanır. Asistan uygun saati sunar, randevuyu oluşturur ve size bildirir.',
    gorsel: <MiniTakvim />,
  },
  {
    baslik: 'Telefon trafiği azalır',
    metin: 'Adres, çalışma saatleri, randevu değişikliği gibi tekrar eden soruları asistan yanıtlar. Ekibiniz hastaya daha fazla zaman ayırır.',
    gorsel: <MiniCagrilar />,
  },
  {
    baslik: 'Hastalar beklemez',
    metin: 'Çalan telefonun açılmasını beklemek yerine anında yanıt alırlar. Soru ve randevu değişiklikleri için her saatte ulaşılabilirsiniz.',
    gorsel: <MiniBalon />,
  },
  {
    baslik: 'İdari yük hafifler',
    metin: 'Randevu almak, değiştirmek ve iptal etmek asistanda. Ek personel ihtiyacı azalır, muayenehaneniz daha verimli çalışır.',
    gorsel: <MiniOzet />,
  },
];

// ── Kanallar ──
const KANALLAR: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Telefon', ad: 'Telefon asistanı', ikon: 'phone', renk: 'rgba(26,95,208,.45)',
    maddeler: [
      'Çağrıları 7/24, doğal bir sesle yanıtlar',
      'Çalışma saatlerinize göre davranır',
      'Gerektiğinde çağrıyı ekibinize aktarır',
      'Her görüşmenin özeti e-postanıza gelir',
    ],
  },
  {
    etiket: 'Web sitesi', ad: 'Web sitesi asistanı', ikon: 'message', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Sitenize tek satır kodla eklenir',
      'Ziyaretçilerin sorularını anında yanıtlar',
      'Uygun saatleri gösterir, randevuyu alır',
      'Yabancı hastalarla kendi dillerinde yazışır',
    ],
  },
  {
    etiket: 'Mesajlar', ad: 'Instagram ve Facebook', ikon: 'review', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Hesaplarınıza gelen mesajları yanıtlar',
      'Randevu taleplerini toplar',
      'Tüm konuşmalar tek gelen kutusunda',
      'İstediğiniz konuşmayı siz devralırsınız',
    ],
  },
];

const ADIMLAR = [
  { n: '1', baslik: 'Başvurun', metin: 'Formu doldurun ya da demo isteyin; hangi kanalları kullanmak istediğinizi öğrenelim.' },
  { n: '2', baslik: 'Sizi arayalım', metin: 'Ekibimiz sizi arar, kurulumu anlatır, muayenehanenize uygun paketi ve fiyatı iletir.' },
  { n: '3', baslik: 'Birlikte kuralım', metin: 'Çalışma saatleriniz, hizmetleriniz, sık sorulan sorular ve aktarma numaranızla asistanı hazırlarız.' },
  { n: '4', baslik: 'Asistan işbaşında', metin: 'Çağrılar ve mesajlar yanıtlanır; randevular takviminize işlenir, size bildirim gelir.' },
];

const GUVEN: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'health-info', baslik: 'Tıbbi tavsiye vermez', metin: 'Teşhis ya da tedavi önerisinde bulunmaz; bu soruları hekime yönlendirir.' },
  { ikon: 'emergency',   baslik: 'Acil durumda 112', metin: 'Acil belirti anlatan hastayı vakit kaybetmeden 112’ye yönlendirir.' },
  { ikon: 'family-medicine', baslik: 'Gerektiğinde size aktarır', metin: 'Asistanın yanıtlayamadığı çağrılar ekibinize aktarılır ya da size not olarak iletilir.' },
  { ikon: 'settings',    baslik: 'Kontrol sizde', metin: 'Asistanın ne söyleyeceğini siz belirlersiniz; istediğiniz an duraklatabilirsiniz.' },
];

const SSS: { s: string; c: string }[] = [
  { s: 'Hekimhane Booking’i hemen kullanabilir miyim?', c: 'Evet. Sistem hazır; telefon çağrılarını ve mesajları şu an yanıtlayabiliyor. Başvurunuzu aldıktan sonra sizi arıyor, kurulumu birlikte yapıyoruz.' },
  { s: 'Satın almadan önce deneyebilir miyim?', c: 'Evet. Formda “Demo istiyorum” seçeneğini işaretleyin; asistanın telefonda ve mesajlarda nasıl yanıt verdiğini size canlı olarak gösterelim.' },
  { s: 'Ücreti ne kadar?', c: 'Fiyat; kullanmak istediğiniz kanallara (telefon, web sitesi, mesajlar) ve çağrı yoğunluğunuza göre belirlenir. Formu doldurun, size özel teklifi iletelim.' },
  { s: 'Hekimhane’de profilim olması gerekiyor mu?', c: 'Hekimhane Booking, Hekimhane’de kayıtlı hekim ve klinikler için hazırlanıyor. Profiliniz yoksa ücretsiz ekleyebilirsiniz; başvurunuzu yine de alabiliriz.' },
  { s: 'Mevcut telefon numaramı kullanabilir miyim?', c: 'Kurulumda, mevcut hattınıza gelen çağrıları asistana yönlendirme ya da asistan için ayrı bir numara tanımlama seçeneklerini sizinle birlikte değerlendiriyoruz.' },
  { s: 'Asistan hangi dillerde konuşuyor?', c: 'Türkçe başta olmak üzere birçok dilde konuşur; yabancı hastalarınız kendi dillerinde randevu alabilir.' },
  { s: 'Hizmeti kim sağlıyor?', c: 'Hekimhane Booking, Hekimhane ile Ozvelo.com arasındaki iş birliği anlaşması kapsamında sunulur. Yapay zekâ asistanı ve iletişim altyapısı Ozvelo tarafından geliştirilir.' },
];

export default function BookingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Hekimhane Booking — 7/24 Yapay Zekâ Randevu Asistanı',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Yeni"
        urun="Hekimhane | Booking · Şimdi kullanımda"
        baslik={['Bir daha asla bir çağrıyı ya da', 'randevuyu kaçırmayın']}
        govde="Hekimhane Booking, tüm çağrılarınızı yanıtlayan ve randevuları 7/24 planlayan bir yapay zekâ asistanıdır. Telefonunuzda ve web sitenizde, mesai saatleri dışında da hastalarınıza cevap verir."
        birincil={{ ad: 'Hemen başvurun', href: '#basvuru' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={
          <a href="#ortaklik" className="oz-ortak-not">
            <span>Ozvelo.com ortaklığıyla</span>
            <img src="/ortaklar/ozvelo.svg" alt="Ozvelo" width={74} height={15} />
          </a>
        }
      />

      <OzBant
        baslik="Daha fazla zaman, daha az kesinti"
        alt="Hekimhane Booking telefonunuzu 7/24 yönetir. Hastalarınız istedikleri saatte randevu alırken siz zamanınızı onlara ayırırsınız."
        kartlar={FAYDALAR}
        cta={{ ad: 'Hemen başvurun', href: '#basvuru' }}
      />

      <OzIzgara
        ustyazi="Tek asistan, üç kanal"
        baslik="Hastalarınız size nereden ulaşırsa ulaşsın"
        govde="Telefon, web siteniz ve sosyal medya mesajları aynı asistanla yanıtlanır. Hangi kanalları açacağınızı siz seçersiniz."
        ogeler={KANALLAR}
      />

      <OzAdimlar id="nasil" baslik="Dört adımda işbaşında" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Sağlıkta güven"
        baslik="Kontrol her zaman sizde"
        govde="Asistan, muayenehanenizin sekreteri gibi çalışır; hekimin yerini almaz."
        ogeler={GUVEN}
      />

      {/* ── ORTAKLIK ── */}
      <section id="ortaklik" className="vt-bolum oz-ortak">
        <div className="container">
          <div className="oz-ortak__kart">
            <div className="oz-ortak__logolar" aria-label="Hekimhane ve Ozvelo">
              <HkLogoAnim size={36} autoplay={false} />
              <span className="oz-ortak__x" aria-hidden="true">×</span>
              <img src="/ortaklar/ozvelo.svg" alt="Ozvelo" width={150} height={30} />
            </div>
            <div className="oz-ortak__metin">
              <p className="vt-ustyazi" style={{ marginBottom: 10 }}>İş birliği</p>
              <h2 className="oz-ortak__baslik">Ozvelo.com ortaklığıyla</h2>
              <p>
                Hekimhane Booking, Hekimhane ile <strong>Ozvelo.com</strong> arasındaki iş birliği anlaşması kapsamında sunulmaktadır.
                Yapay zekâ asistanı ve iletişim altyapısı Ozvelo tarafından geliştirilir; Hekimhane profiliniz ve randevu takviminizle
                birlikte çalışacak şekilde hekimler için uyarlanır.
              </p>
              <a href="https://ozvelo.com" target="_blank" rel="noopener noreferrer" className="oz-ortak__bag">
                ozvelo.com
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── BAŞVURU / DEMO ── */}
      <section id="basvuru" className="oz-bekleme">
        <span id="demo" className="oz-capa" aria-hidden="true" />
        <div className="container oz-bekleme__izgara">
          <div className="oz-bekleme__yan">
            <h2 className="vt-h2" style={{ color: '#fff' }}>Hemen başvurun</h2>
            <p>Sistem hazır: telefon çağrılarını ve mesajları şu an yanıtlayabiliyoruz. Kurulum hakkında bilgi vermek ve size yardımcı olmak için sizi arayalım.</p>
            <ul>
              <li><HkIcon name="phone" size={22} color="#fff" accent="#DEC283" />Sizi arayıp kurulumu anlatalım</li>
              <li><HkIcon name="message" size={22} color="#fff" accent="#DEC283" />Canlı demo ile deneyin</li>
              <li><HkIcon name="price-guide" size={22} color="#fff" accent="#DEC283" />Size özel fiyat teklifi</li>
            </ul>
            <p className="oz-bekleme__not">
              Profiliniz yok mu? <Link href="/katil">Hekimhane’ye ücretsiz ekleyin</Link>.
            </p>
          </div>
          <BeklemeFormu />
        </div>
      </section>

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi/numara yok ═══════════════════ */

function Sahne() {
  return (
    <OzSahne ikon="phone">
      <OzSahneBaslik ikon="phone" baslik="Gelen çağrı" alt="Mesai dışı · 21:42" durum="Asistan yanıtlıyor" />
      <OzBalonlar balonlar={[
        { kim: 'asistan', metin: 'Merhaba, Dr. Aksoy Muayenehanesi’ne ulaştınız. Ben sanal asistanıyım. Size nasıl yardımcı olabilirim?' },
        { kim: 'kisi', metin: 'Önümüzdeki salı için randevu almak istiyorum.' },
        { kim: 'asistan', metin: 'Salı 09:30 ve 14:00 uygun. Hangisini tercih edersiniz?' },
        { kim: 'kisi', metin: '09:30 olsun.' },
      ]} />
      <OzOnayKart ust="Randevu oluşturuldu" baslik="Salı · 09:30" alt="Zeynep K. · Muayene" />
    </OzSahne>
  );
}

function MiniTakvim() {
  const s = ['', 'a', '', 'a', '', '', 'a', 's', '', 'a', '', ''];
  return (
    <div className="oz-mt">
      {s.map((x, i) => <span key={i} className={x === 'a' ? 'is-dolu' : x === 's' ? 'is-yeni' : ''}>{x === 's' ? '09:30' : ''}</span>)}
    </div>
  );
}

function MiniCagrilar() {
  const h = [92, 84, 70, 58, 44, 34];
  return (
    <div className="oz-mc">
      {h.map((x, i) => <span key={i} style={{ height: `${x}%`, animationDelay: `${i * 90}ms` }} className="vt-h-buyu" />)}
      <em><HkIcon name="phone" size={16} color="#12294D" />Tekrar eden çağrılar</em>
    </div>
  );
}

function MiniBalon() {
  return (
    <div className="oz-mb">
      <span className="oz-mb__hasta">Randevumu perşembeye alabilir miyim?</span>
      <span className="oz-mb__asistan">Elbette, perşembe 11:00 uygun. Değiştiriyorum.</span>
    </div>
  );
}

function MiniOzet() {
  return (
    <div className="oz-mo">
      <div className="oz-mo__satir"><b>Bugün</b><span>Asistan</span></div>
      <div className="oz-mo__satir"><span>Yanıtlanan çağrı</span><i style={{ width: '78%' }} /></div>
      <div className="oz-mo__satir"><span>Alınan randevu</span><i style={{ width: '52%' }} /></div>
      <div className="oz-mo__satir"><span>Ekibe aktarılan</span><i style={{ width: '18%' }} /></div>
    </div>
  );
}


