import type { Metadata } from 'next';
import type { HkIkonAdi } from '@/components/HkIcon';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzBalonlar, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';

// Ücretsiz görüşme ve danışmanlık talebi — hekim ve kliniklere işletmelerini nasıl
// büyütebileceklerini konuştuğumuz ücretsiz görüşme. Form: OzBasvuru urun='danismanlik'
// (kayıt booking_bekleme'ye; admin "Booking Başvuruları" sekmesinde "Ücretsiz Görüşme" rozetiyle).
// Kural: doğrulanamayan sayı/oran ya da sonuç vaadi yazılmaz; görüşmede yalnız Hekimhane'de
// gerçekten var olan araçlar önerilir (bkz. CLAUDE.md "Vitrin Dili").

const URL_ = 'https://www.hekimhane.com.tr/ucretsiz-gorusme';

export const metadata: Metadata = {
  title: 'Ücretsiz Görüşme — Muayenehanenizi Birlikte Büyütelim',
  description:
    'Hekim ve klinikler için ücretsiz görüşme: online görünürlük, randevu, hasta yorumları ve dijital iletişim konusunda muayenehanenize özel öneriler. Yükümlülük yok. Hemen görüşme talep edin.',
  keywords: ['hekim danışmanlık', 'klinik dijital pazarlama', 'muayenehane büyütme', 'doktor online randevu', 'ücretsiz görüşme', 'hekimhane'],
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'Ücretsiz Görüşme — Muayenehanenizi birlikte büyütelim',
    description: 'Hastalarınızın sizi nasıl bulduğuna, randevu ve iletişim akışınıza birlikte bakalım. Ücretsiz ve yükümlülüksüz.',
    url: URL_,
    type: 'website',
  },
};

// ── Neden görüşmeli? (koyu bant) ──
const FAYDALAR: { baslik: string; metin: string; ikon: HkIkonAdi }[] = [
  { ikon: 'premium', baslik: 'Tamamen ücretsiz', metin: 'Görüşme için hiçbir ücret ödemezsiniz. Sonrasında bir şey satın alıp almamak tamamen sizin kararınız.' },
  { ikon: 'doctor-profile', baslik: 'Size özel', metin: 'Hazır bir sunum yapmıyoruz. Branşınıza, şehrinize ve çalışma düzeninize bakıp ona göre konuşuyoruz.' },
  { ikon: 'search', baslik: 'Dışarıdan bir göz', metin: 'Hastanın gözünden sizi arıyor, profilinize ve iletişim kanallarınıza birlikte bakıyoruz.' },
  { ikon: 'success', baslik: 'Uygulanabilir öneriler', metin: 'Genel tavsiyeler değil; hemen başlayabileceğiniz, önceliği belli adımlar konuşuyoruz.' },
];

// ── Görüşmede neler konuşuyoruz? ──
const KONULAR: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Görünürlük', ad: 'Hastalar sizi nasıl buluyor?', ikon: 'search', renk: 'rgba(26,95,208,.45)',
    maddeler: [
      'İnternette adınızla ve branşınızla aratıldığınızda ne çıkıyor',
      'Hekimhane profilinizin eksikleri ve güçlü yanları',
      'Fotoğraf, hakkında yazısı ve hizmet listesi önerileri',
      'Uzmanlığınızı makaleyle anlatma fırsatları',
    ],
  },
  {
    etiket: 'Randevu', ad: 'Randevu ve telefon akışı', ikon: 'appointment', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Mesai dışında ve yoğun saatlerde kaçan çağrılar',
      'Hastaların online randevu alabilmesi',
      'Web sitenizden randevu almanın yolları',
      'Sekreterinizin yükünü azaltacak düzenlemeler',
    ],
  },
  {
    etiket: 'İletişim', ad: 'Yorumlar ve mesajlar', ikon: 'review', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Memnun hastalardan yorum toplamanın kolay yolları',
      'Yorumlara nasıl ve ne zaman yanıt verilir',
      'Instagram ve Facebook mesajlarının yanıtlanması',
      'Tek bağlantıda dijital kartvizit (HekimKart)',
    ],
  },
];

const ADIMLAR = [
  { baslik: 'Formu doldurun', metin: 'Bir dakikanızı alır. Konuşmak istediğiniz konuları ve görüşme biçimini seçin.' },
  { baslik: 'Sizi arayalım', metin: 'Ekibimiz sizi arar ve size uygun bir gün ve saat belirler.' },
  { baslik: 'Birlikte bakalım', metin: 'Telefonda ya da ekran paylaşarak bugünkü durumunuzu birlikte inceleriz.' },
  { baslik: 'Yol haritanız', metin: 'Size uygun önerileri önem sırasına göre konuşuruz; neyi ne zaman yapacağınız netleşir.' },
];

const KIMLER: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'private-practice', baslik: 'Muayenehaneler', metin: 'Tek başına ya da küçük bir ekiple çalışan uzman hekimler.' },
  { ikon: 'dentistry', baslik: 'Diş klinikleri', metin: 'Birden fazla hekimin çalıştığı ağız ve diş sağlığı klinikleri.' },
  { ikon: 'hospital', baslik: 'Poliklinik ve hastaneler', metin: 'Birden çok branşı ve randevu hattı olan sağlık kuruluşları.' },
  { ikon: 'clinic', baslik: 'Yeni açılanlar', metin: 'Yeni açılan ya da yeni bir şehre taşınan, hasta kitlesini oluşturan hekimler.' },
];

const SSS: { s: string; c: string }[] = [
  { s: 'Görüşme gerçekten ücretsiz mi?', c: 'Evet. Görüşme için hiçbir ücret alınmaz ve görüşme sizi hiçbir şey satın almaya yükümlü kılmaz.' },
  { s: 'Görüşme nasıl yapılıyor?', c: 'Formda seçtiğiniz biçimde: telefonla ya da ekran paylaşarak online. Ekibimiz sizi arar ve size uygun bir saat belirler.' },
  { s: 'Görüşmede neler konuşuyoruz?', c: 'Hastaların sizi internette nasıl bulduğunu, randevu ve telefon akışınızı, hasta yorumlarını ve sosyal medya mesajlarını konuşuruz. Formda işaretlediğiniz konulara öncelik veririz.' },
  { s: 'Hekimhane’de profilim olması gerekiyor mu?', c: 'Hayır. Profiliniz olmasa da görüşme talep edebilirsiniz. İsterseniz görüşmede profilinizi birlikte de oluşturabiliriz.' },
  { s: 'Tıbbi konularda tavsiye veriyor musunuz?', c: 'Hayır. Görüşme yalnız işletmenizin tanıtım, randevu ve iletişim tarafıyla ilgilidir; tıbbi uygulamalarınıza karışmaz.' },
  { s: 'Bilgilerim ne için kullanılıyor?', c: 'Formdaki bilgileriniz yalnız bu görüşmeyi planlamak ve sizinle iletişime geçmek için kullanılır. Ayrıntılar KVKK Aydınlatma Metni’nde yer alır.' },
];

export default function UcretsizGorusmePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Ücretsiz Görüşme — Muayenehanenizi Birlikte Büyütelim',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Ücretsiz"
        urun="Hekimler ve klinikler için"
        baslik={['Muayenehanenizi', 'birlikte büyütelim']}
        govde="Hastalarınızın sizi nasıl bulduğuna, randevu ve iletişim akışınıza birlikte bakalım. Size özel, uygulanabilir önerileri konuşalım. Görüşme ücretsizdir, hiçbir yükümlülüğü yoktur."
        birincil={{ ad: 'Görüşme talep edin', href: '#basvuru' }}
        ikincil={{ ad: 'Neler konuşuyoruz?', href: '#konular' }}
        sahne={<Sahne />}
      />

      <OzBant
        baslik="Neden bir görüşme?"
        alt="Hekimliğe odaklanırken işletmenin dijital tarafı çoğu zaman ikinci planda kalır. Kısa bir görüşmeyle nereden başlayacağınızı birlikte netleştirelim."
        kartlar={FAYDALAR}
        cta={{ ad: 'Görüşme talep edin', href: '#basvuru' }}
      />

      <OzIzgara
        id="konular"
        ustyazi="Görüşmede neler konuşuyoruz?"
        baslik="Hasta sizi aradığı andan randevuya kadar"
        govde="Formda işaretlediğiniz konulara öncelik veririz. En sık konuştuğumuz başlıklar:"
        ogeler={KONULAR}
      />

      <OzAdimlar baslik="Dört adımda yol haritanız" ustyazi="Nasıl ilerliyoruz?" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Kimler için?"
        baslik="Her ölçekte sağlık işletmesi"
        govde="Tek hekimli muayenehaneden çok branşlı polikliniğe kadar, hasta kabul eden her sağlık işletmesi için."
        ogeler={KIMLER}
      />

      <OzBasvuru
        urun="danismanlik"
        baslik="Ücretsiz görüşme talep edin"
        metin="Formu doldurun; ekibimiz sizi arayıp size uygun bir saat belirlesin. Telefonla ya da online, nasıl isterseniz."
        vaatler={[
          { ikon: 'premium', ad: 'Ücretsiz, yükümlülük yok' },
          { ikon: 'doctor-profile', ad: 'İşletmenize özel öneriler' },
          { ikon: 'phone', ad: 'Telefonla ya da online' },
        ]}
        formEtiket="Ücretsiz"
        formBaslik="Görüşme talebi"
        formAciklama="Bilgilerinizi bırakın, sizi arayalım. Konuşmak istediğiniz konuları işaretlerseniz görüşmeye hazırlıklı geliriz."
      />

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizim — temsili içerik, gerçek kişi yok ═══════════════════════════════ */

function Sahne() {
  return (
    <OzSahne ikon="message">
      <OzSahneBaslik ikon="message" baslik="Ücretsiz görüşme" alt="Online · Ekran paylaşımı" durum="Görüşmede" />
      <OzBalonlar balonlar={[
        { kim: 'kisi', metin: 'Akşamları gelen çağrılara yetişemiyoruz, hastalar başka kliniğe gidiyor.' },
        { kim: 'asistan', metin: 'Online randevuyu açalım; hastalar profilinizden uygun saati kendisi seçsin.' },
        { kim: 'kisi', metin: 'Yorumlarımız da çok az, nasıl artırabiliriz?' },
        { kim: 'asistan', metin: 'Muayene sonrası yorum davetiyle başlayalım. Size adım adım göstereyim.' },
      ]} />
      <OzOnayKart ust="Yol haritanız hazır" baslik="3 öncelikli adım" alt="Online randevu · Yorum daveti · Profil" />
    </OzSahne>
  );
}
