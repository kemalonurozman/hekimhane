import type { Metadata } from 'next';
import Link from 'next/link';
import type { HkIkonAdi } from '@/components/HkIcon';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';

// Değerlendirme ve Yorum Sistemi — özellik sayfası dili (bkz. components/ozellik/Ozellik.tsx).
// Kaynak bilgiler: CLAUDE.md "Onaylı Yorum" + "Yorum Şikayet / Moderasyon Akışı".
// Not: doğrulanamayan sayı/oran yazılmaz; çizimlerdeki adlar temsilidir.

const URL_ = 'https://www.hekimhane.com.tr/degerlendirme-sistemi';

export const metadata: Metadata = {
  title: 'Değerlendirme ve Yorum Sistemi',
  description: 'Hekimhane\'de puanlar ve yorumlar nasıl çalışır? Değerlendirmelerin kaynağı, doğrulama, gizlilik ve "Yeni" profillerin ne anlama geldiğini şeffaf biçimde açıklıyoruz.',
  alternates: { canonical: URL_ },
};

// ── Faydalar (koyu bant) ──
const FAYDALAR: { baslik: string; metin: string; gorsel: React.ReactNode }[] = [
  {
    baslik: 'Onaylı hasta yorumları',
    metin: 'Hekimhane üzerinden randevu alan ve randevusu tamamlanan hastanın yorumu, profilde yeşil “Onaylı hasta” rozetiyle gösterilir.',
    gorsel: <MiniRozet />,
  },
  {
    baslik: 'Adınız gizli kalır',
    metin: 'Yorumlarda ad sayfada yalnız baş harflerle yer alır. Tam adı yalnızca değerlendirilen hekim ya da işletme görür.',
    gorsel: <MiniAd />,
  },
  {
    baslik: 'Tek yorum puanı savurmaz',
    metin: 'Dengeli ortalama sayesinde tek bir 5 yıldız ya da tek bir kötü niyetli 1 yıldız, bir işletmeyi uçlara taşıyamaz.',
    gorsel: <MiniOlcek />,
  },
  {
    baslik: 'İşletme yanıt verir, silemez',
    metin: 'İşletme sahibi yorumu silemez veya değiştiremez; yalnızca yanıt verebilir. Değerlendirmeler tarafsız kalır.',
    gorsel: <MiniYanit />,
  },
];

// ── Değerlendirme türleri ──
const TURLER: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Profilden', ad: 'Ziyaretçi yorumu', ikon: 'star-rating', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Klinik, hekim ya da eczane profilinden bırakılır',
      'Yıldız verilir, deneyim yazılır',
      'Ad-soyad istenir, sayfada baş harflerle görünür',
      'Tam adı yalnız değerlendirilen işletme görür',
    ],
  },
  {
    etiket: 'Randevudan sonra', ad: 'Onaylı yorum', ikon: 'verified', renk: 'rgba(13,124,121,.45)',
    maddeler: [
      'Yalnız randevusu tamamlanan hasta yazabilir',
      'Kişiye özel, tek kullanımlık bağlantıyla',
      'Bağlantı e-postayla ya da işletme aracılığıyla gelir',
      'Profilde “Onaylı hasta” rozetiyle görünür',
    ],
  },
  {
    etiket: 'İşletmeden', ad: 'İşletme yanıtı', ikon: 'message', renk: 'rgba(26,95,208,.45)',
    maddeler: [
      'Sahipliği onaylı işletme yorumlara yanıt verir',
      'Yanıt, yorumun altında “İşletme Yanıtı” olarak görünür',
      'Yorum silinemez ve değiştirilemez',
      'Uygunsuz yorum moderasyona şikâyet edilir',
    ],
  },
];

const ADIMLAR = [
  { baslik: 'Randevu tamamlanır', metin: 'Hekimhane üzerinden alınan randevu, işletme panelinde “Tamamlandı” olarak işaretlenir.' },
  { baslik: 'Bağlantı gelir', metin: 'E-posta adresiniz varsa “Deneyiminizi Değerlendirin” e-postası gelir; yoksa işletme bağlantıyı size iletir.' },
  { baslik: 'Puan ve yorum', metin: 'Kişiye özel, tek kullanımlık bağlantıdan puanınızı verir, deneyiminizi yazarsınız.' },
  { baslik: '“Onaylı hasta” rozeti', metin: 'Yorumunuz profilde yeşil “Onaylı hasta” rozetiyle yayımlanır.' },
];

const MODERASYON: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'verified', baslik: 'Onaylı işletme rozeti', metin: '“Onaylı” rozeti, sahipliği doğrulanmış hekim ve işletmeleri gösterir.' },
  { ikon: 'warning', baslik: 'Şikâyet hakkı', metin: 'İşletme sahibi, uygunsuz bulduğu bir yorumu gerekçesiyle şikâyet edebilir.' },
  { ikon: 'settings', baslik: 'Son karar moderasyonda', metin: 'Şikâyeti yalnızca Hekimhane moderasyon ekibi karara bağlar: gizle, kaldır ya da reddet.' },
  { ikon: 'review', baslik: 'Silme ve değiştirme yok', metin: 'İşletme yorumu silemez veya değiştiremez; yalnızca yanıt verebilir.' },
];

// İlk üç soru eski sayfanın FAQ JSON-LD'sinden aynen korunmuştur.
const SSS: { s: string; c: string }[] = [
  { s: 'Puanlar neden 4.2 civarında başlıyor?', c: 'Hekimhane dengeli (Bayesian) bir ortalama kullanır. Her profil, 4.2 gibi nötr bir başlangıç puanından başlar; böylece tek bir 5 yıldız bir işletmeyi anında 5.0 yapamaz, tek bir kötü niyetli 1 yıldız da bir işletmeyi yerin dibine sokamaz. Gerçek yorumlar biriktikçe puan, o işletmenin gerçek ortalamasına doğru kayar. Yorum sayısı arttıkça başlangıç değerinin etkisi azalır.' },
  { s: 'Yorumlar gerçek hastalardan mı geliyor?', c: 'Evet. Değerlendirmeler ziyaretçiler ve hastalar tarafından bırakılır. Yorum bırakırken ad-soyad istenir; bu bilgi sayfada gizlenir, yalnızca değerlendirilen hekim/işletme doğrulama için tam adı görebilir.' },
  { s: 'Yorumumdaki adım herkese görünür mü?', c: 'Hayır. Adınız sayfada tam ve açık gösterilmez (ör. "Elif K."). Tam adınızı yalnızca değerlendirdiğiniz hekim görür; bu, yorumun gerçek bir hastadan geldiğinin doğrulanması içindir.' },
  { s: '“Onaylı hasta” rozeti ne anlama geliyor?', c: 'Bu rozet, yorumu yazan kişinin Hekimhane üzerinden randevu aldığını ve randevusunun tamamlandığını gösterir. Onaylı yorum, randevu tamamlandıktan sonra hastaya iletilen kişiye özel, tek kullanımlık bir bağlantıyla yazılır.' },
  { s: 'İşletme yorumumu silebilir mi?', c: 'Hayır. İşletme sahibi yorumu silemez veya değiştiremez; yalnızca yanıt verebilir. Uygunsuz bulduğu bir yorumu şikâyet edebilir; son kararı yalnızca Hekimhane moderasyon ekibi verir (gizle / kaldır / reddet).' },
  { s: '“Başlangıç puanı” etiketi ne demek?', c: 'Henüz yorumu olmayan profillerde görünen puan, gerçek bir topluluk puanı değil, adil bir başlangıç noktasıdır ve “başlangıç puanı” olarak etiketlenir.' },
  { s: 'Nasıl değerlendirme bırakırım?', c: 'Ziyaret ettiğiniz kliniğin, hekimin veya eczanenin Hekimhane profiline gidin; “Deneyiminizi paylaşın” bölümünden yıldız verip yorumunuzu yazın.' },
];

const P: React.CSSProperties = { margin: '0 0 14px', fontSize: 16, lineHeight: 1.65, color: '#3C4A61' };

export default function DegerlendirmeSistemiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Değerlendirme ve Yorum Sistemi — Hekimhane',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Ücretsiz"
        urun="Hekimhane | Değerlendirme Sistemi"
        baslik={['Puanlar ve yorumlar', 'nasıl çalışır?']}
        govde="Hekimhane’de güven her şeyin önünde gelir. Değerlendirmelerin kaynağını, puanın nasıl hesaplandığını, onaylı hasta yorumlarını ve gizliliği burada şeffaf biçimde açıklıyoruz."
        birincil={{ ad: 'Bilgi isteyin', href: '#basvuru' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={
          <p style={{ margin: '18px 0 0', fontSize: 14, lineHeight: 1.6, color: '#586273' }}>
            Hasta mısınız? <Link href="/klinikler" style={{ color: '#1B3A69', fontWeight: 700, textDecoration: 'underline' }}>Diş kliniklerini keşfedin</Link>
            {' '}ya da <a href="#puan" style={{ color: '#1B3A69', fontWeight: 700, textDecoration: 'underline' }}>puanın nasıl hesaplandığını</a> okuyun.
          </p>
        }
      />

      <OzBant
        baslik="Güvenilir yorumlar, adil puanlar"
        alt="Değerlendirmeler gerçek kişilerden gelir, gizliliğiniz korunur ve tek bir yorum bir işletmenin puanını haksız yere değiştiremez."
        kartlar={FAYDALAR}
        cta={{ ad: 'Bilgi isteyin', href: '#basvuru' }}
      />

      <OzIzgara
        ustyazi="Değerlendirmeler nereden gelir?"
        baslik="Gerçek kişiler, şeffaf kurallar"
        govde="Puanlar ve yorumlar; kliniği, hekimi veya eczaneyi ziyaret eden gerçek kişiler tarafından bırakılır. İşletme sahibi bu yorumlara yanıt verebilir."
        ogeler={TURLER}
      />

      <OzAdimlar id="onayli" ustyazi="Onaylı yorum" baslik="Randevudan onaylı yoruma dört adım" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Doğrulama ve moderasyon"
        baslik="Değerlendirmeler tarafsız kalır"
        govde="İşletmeler yorumlara yanıt verebilir ve uygunsuz içeriği bildirebilir; karar her zaman Hekimhane moderasyon ekibindedir."
        ogeler={MODERASYON}
      />

      {/* ── PUAN HESABI ── */}
      <section id="puan" className="vt-bolum" style={{ background: '#fff', scrollMarginTop: 64 }}>
        <div className="container">
          <p className="vt-ustyazi">Puan hesabı</p>
          <h2 className="vt-h2">Puanlar neden 4.2 civarında başlıyor?</h2>
          <div className="oz-panel">
            <div className="oz-ikili">
              <div>
                <p style={P}>
                  Hekimhane’de puanlar <strong>dengeli (Bayesian) ortalama</strong> ile hesaplanır. Her profil, henüz yorumu
                  yokken <strong>4.2 gibi nötr bir başlangıç puanından</strong> başlar. Bunun nedeni basit: tek bir
                  değerlendirmenin bir işletmeyi haksız yere uçlara savurmasını engellemek.
                </p>
                <p style={P}>
                  Yani bir tane 5 yıldız bir kliniği anında 5.0 yapmaz; aynı şekilde tek bir kötü niyetli 1 yıldız da bir
                  işletmeyi yerin dibine sokamaz. Puan, ortada gerçek bir topluluk görüşü oluşana kadar dengeli, ortada bir
                  noktadan başlar.
                </p>
                <p style={{ ...P, margin: 0 }}>
                  Gerçek yorumlar biriktikçe puan, o işletmenin gerçek ortalamasına doğru kayar ve başlangıç değerinin etkisi
                  giderek azalır. Yorumu olmayan profillerde bu değer <strong>“başlangıç puanı”</strong> olarak etiketlenir —
                  gerçek bir topluluk puanı değil, adil bir başlangıç noktasıdır.
                </p>
              </div>
              <PuanOlcegi />
            </div>
          </div>
          <div className="oz-panel" style={{ marginTop: 18 }}>
            <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.4vw, 28px)', fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>
              Puan nasıl hesaplanır?
            </h3>
            <p style={P}>
              Profildeki puan, o işletmeye bırakılan tüm yıldızların ortalamasıdır. Listelerdeki sıralamada, tek bir yorumun
              bir işletmeyi haksız yere en üste taşımaması için dengeli bir ortalama kullanılır — yani 1 tane 5 yıldız,
              200 yorumlu bir kliniğin önüne geçmez.
            </p>
            <p style={{ ...P, margin: 0 }}>Yorum sayısı arttıkça puan, gerçek ortalamayı daha net yansıtır.</p>
          </div>
        </div>
      </section>

      <OzBasvuru
        urun="degerlendirme"
        baslik="Yorum yönetimini birlikte kuralım"
        metin="İşletmenizin yorumlarına nasıl yanıt vereceğinizi, uygunsuz bir yorumu nasıl şikâyet edeceğinizi ve randevusu tamamlanan hastaya değerlendirme bağlantısının nasıl ulaşacağını anlatmak için sizi arayalım. Hasta olarak yorum bırakmak isterseniz ziyaret ettiğiniz kliniğin, hekimin veya eczanenin Hekimhane profilindeki “Deneyiminizi paylaşın” bölümünü kullanın; diş kliniklerini sayfanın üstündeki bağlantıdan keşfedebilirsiniz."
        vaatler={[
          { ikon: 'message', ad: 'Yorumlara yanıt vermeyi anlatalım' },
          { ikon: 'warning', ad: 'Şikâyet ve moderasyon akışını gösterelim' },
          { ikon: 'verified', ad: 'Onaylı yorum bağlantısını birlikte kuralım' },
        ]}
        formBaslik="Yorum yönetimi hakkında bilgi alın"
        formAciklama="Bilgilerinizi bırakın; ekibimiz sizi arayıp yorum yönetimini anlatsın ya da canlı olarak göstersin."
        formEtiket="Ücretsiz"
      />

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizimler — temsili içerik, gerçek kişi yok ═══════════════════════ */

function Yildizlar({ n = 5, boyut = 16 }: { n?: number; boyut?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={boyut} height={boyut} viewBox="0 0 24 24" fill={i < n ? '#D4AC55' : '#DCE3EE'}>
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

function OnayliRozet() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#166534', background: '#F0FDF4', boxShadow: 'inset 0 0 0 1px #BBF7D0', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      Onaylı hasta
    </span>
  );
}

function Sahne() {
  return (
    <OzSahne ikon="review">
      <OzSahneBaslik ikon="review" baslik="Yeni değerlendirme" alt="Dr. Aksoy Muayenehanesi" durum="Yayında" />

      {/* Yorum kartı */}
      <div className="oz-b oz-b--asistan" style={{ maxWidth: '100%', alignSelf: 'stretch', padding: '16px 18px', animationDelay: '.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: '#EEF3FA', color: '#12294D', fontSize: 13, fontWeight: 800 }}>ZK</span>
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 14.5, color: '#0E1A2C' }}>Zeynep K.</strong>
            <Yildizlar n={5} boyut={14} />
          </div>
          <span style={{ marginLeft: 'auto' }}><OnayliRozet /></span>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5, color: '#3C4A61' }}>
          Randevu saatine tam uyuldu, tedavi süreci adım adım anlatıldı. Çok memnun kaldım.
        </p>
      </div>

      {/* İşletme yanıtı */}
      <div className="oz-b" style={{ maxWidth: '88%', alignSelf: 'flex-end', padding: '14px 16px', borderRadius: '16px 16px 4px 16px', background: 'linear-gradient(135deg, #E1F7F4, #CDEFEA)', boxShadow: 'inset 0 0 0 1px rgba(13,124,121,.2)', animationDelay: '1.4s' }}>
        <small style={{ display: 'block', fontSize: 11.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#0B5F55' }}>İşletme yanıtı</small>
        <span style={{ display: 'block', marginTop: 4, fontSize: 14, lineHeight: 1.5, color: '#0E1A2C' }}>
          Değerlendirmeniz için teşekkür ederiz Zeynep Hanım. Kontrol randevunuzda görüşmek üzere.
        </span>
      </div>

      {/* Puan özeti (temsili) */}
      <div className="oz-b oz-b--asistan" style={{ maxWidth: '100%', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', animationDelay: '2.6s' }}>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-.03em', color: '#0E1A2C' }}>4,8</strong>
        <div>
          <Yildizlar n={5} boyut={13} />
          <small style={{ display: 'block', fontSize: 12, color: '#586273' }}>Dengeli ortalama</small>
        </div>
      </div>
    </OzSahne>
  );
}

function MiniRozet() {
  return (
    <div style={{ width: '100%', maxWidth: 230, padding: 14, borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <strong style={{ fontSize: 13, color: '#0E1A2C' }}>Elif K.</strong>
        <OnayliRozet />
      </div>
      <div style={{ marginTop: 6 }}><Yildizlar n={5} boyut={13} /></div>
      <i style={{ display: 'block', height: 7, marginTop: 10, borderRadius: 4, background: '#EEF1F6' }} />
      <i style={{ display: 'block', height: 7, width: '72%', marginTop: 6, borderRadius: 4, background: '#EEF1F6' }} />
    </div>
  );
}

function MiniAd() {
  const satir: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 12px', borderRadius: 11, fontSize: 12.5 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 230 }}>
      <div style={{ ...satir, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE', color: '#3C4A61' }}>
        <span>Sayfada</span><strong style={{ color: '#0E1A2C' }}>Elif K.</strong>
      </div>
      <div style={{ ...satir, background: '#12294D', color: 'rgba(255,255,255,.75)' }}>
        <span>Tam adı yalnız hekim görür</span>
        <span style={{ display: 'inline-flex', gap: 3, flex: 'none' }} aria-hidden="true">
          {[0, 1, 2, 3].map(i => <i key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#DEC283' }} />)}
        </span>
      </div>
    </div>
  );
}

function MiniOlcek() {
  return (
    <div style={{ width: '100%', maxWidth: 230 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#586273' }}>
        <span>1</span><span>5</span>
      </div>
      <div style={{ position: 'relative', height: 10, marginTop: 6, borderRadius: 5, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
        <i style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80%', borderRadius: 5, background: 'linear-gradient(90deg, #0D7C79, #5FD6CE)' }} />
        <span style={{ position: 'absolute', left: '80%', top: '50%', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: '50%', background: '#12294D', boxShadow: '0 0 0 3px #fff' }} />
      </div>
      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#12294D' }}>Başlangıç puanı 4.2</div>
    </div>
  );
}

function MiniYanit() {
  return (
    <div className="oz-mb">
      <span className="oz-mb__asistan">Güler yüzlü ekip, temiz klinik.</span>
      <span className="oz-mb__hasta">İşletme yanıtı: Teşekkür ederiz, yine bekleriz.</span>
    </div>
  );
}

function PuanOlcegi() {
  return (
    <div aria-hidden="true" style={{ padding: 'clamp(20px, 3vw, 32px)', borderRadius: 22, background: 'linear-gradient(160deg, #FBF8F2, #F1F5FA)', boxShadow: 'inset 0 0 0 1px #E6E8EC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#586273' }}>
        <span>1 yıldız</span><span>5 yıldız</span>
      </div>
      <div style={{ position: 'relative', height: 12, marginTop: 10, borderRadius: 6, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
        <span style={{ position: 'absolute', left: '80%', top: '50%', width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: '50%', background: '#12294D', boxShadow: '0 0 0 4px #fff' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
        {[
          { b: 'Yorum yok', m: '4.2 başlangıç puanı — nötr, ortada bir nokta' },
          { b: 'Tek yorum', m: 'Puan uçlara savrulmaz, dengede kalır' },
          { b: 'Yorumlar biriktikçe', m: 'Gerçek ortalamaya doğru kayar' },
        ].map((x, i) => (
          <div key={x.b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #E6E8EC' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: i === 2 ? '#0D7C79' : '#12294D', color: '#DEC283', fontSize: 13, fontWeight: 800, flex: 'none' }}>{i + 1}</span>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: 14.5, color: '#0E1A2C' }}>{x.b}</strong>
              <span style={{ fontSize: 13.5, color: '#586273' }}>{x.m}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
