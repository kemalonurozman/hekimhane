import type { Metadata } from 'next';
import Link from 'next/link';
import type { HkIkonAdi } from '@/components/HkIcon';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';
import { OzSayfa, OzHero, OzSahne, OzSahneBaslik, OzOnayKart, OzBant, OzIzgara, OzAdimlar, OzKartlar, OzBasvuru, OzSss, sssJsonLd } from '@/components/ozellik/Ozellik';
import ProCta from './ProCta';

// Hekimhane-Pro — özellik sayfası dili (bkz. components/ozellik/Ozellik.tsx).
// Fiyat yalnız lib/pro-plan.ts → PRO_AYLIK_TL. Satın alma ProCta'dan (Stripe) başlar;
// hero ve bant düğmeleri #fiyat bölümündeki ProCta'ya götürür; OzBasvuru "satın almadan önce konuşalım" içindir.

const URL_ = 'https://www.hekimhane.com.tr/pro';

export const metadata: Metadata = {
  title: 'Hekimhane-Pro — İşletmeniz İçin Profesyonel Üyelik',
  description: `Randevu yönetimi, hasta listesi, sitenize rezervasyon modülü, otomatik e-posta bilgilendirme ve profesyonel profil görünümü. Aylık ${PRO_AYLIK_TL} TL, istediğiniz an iptal.`,
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'Hekimhane-Pro | Hekimhane',
    description: `İşletmeniz için profesyonel üyelik — aylık ${PRO_AYLIK_TL} TL.`,
    url: URL_,
    type: 'website',
  },
};

// ── Koyu bant: dört temel fayda ──
const FAYDALAR: { baslik: string; metin: string; gorsel?: React.ReactNode; ikon?: HkIkonAdi }[] = [
  {
    baslik: 'Randevular tek panelde',
    metin: 'Web sitenizden ve Hekimhane profilinizden gelen tüm talepler aynı ekrana düşer. Siz karar verirsiniz, yazışmayı sistem üstlenir.',
    gorsel: <MiniTalep />,
  },
  {
    baslik: 'Hasta her adımda bilgilenir',
    metin: 'Onay, erteleme ve iptalde hastaya otomatik e-posta gider; randevudan bir gün önce hatırlatma gönderilir.',
    gorsel: <MiniEposta />,
  },
  {
    baslik: 'Güven veren bir profil',
    metin: 'Altın doğrulama mührü, Pro rozeti ve hareketli kapak; profilinizde WhatsApp ve web sitesi düğmeleri.',
    gorsel: <MiniProfil />,
  },
  {
    baslik: 'Doğru sayfalarda görünün',
    metin: 'Ana sayfada ve sağlık rehberinde öne çıkarılır, hastalık sayfalarında önerilen hekimler arasında yer alırsınız.',
    gorsel: <MiniGorunur />,
  },
];

// ── Pro hesabınıza dahil olanlar (3 büyük kart) ──
const DAHIL: { etiket: string; ad: string; ikon: HkIkonAdi; renk: string; maddeler: string[] }[] = [
  {
    etiket: 'Randevu ve hastalar', ad: 'Randevu ve hasta bilgilendirme', ikon: 'appointment', renk: 'rgba(26,95,208,.45)',
    maddeler: [
      'Tek tıkla onaylayın, erteleyin veya iptal edin',
      'Her kararda hastaya e-posta, randevudan bir gün önce hatırlatma',
      'Randevuyu Google Takvim’e tek tıkla ekleyin',
      'Hasta kartı, not, etiket, dosya ve panelden e-posta',
    ],
  },
  {
    etiket: 'Profil ve görünürlük', ad: 'Profesyonel görünüm, öne çıkma', ikon: 'verified', renk: 'rgba(184,137,47,.5)',
    maddeler: [
      'Altın doğrulama mührü ve arama sonuçlarında Pro rozeti',
      'Hareketli kapak, renk teması, WhatsApp ve web sitesi düğmeleri',
      'Ana sayfada ve sağlık rehberinde öne çıkarma',
      'Hastalık sayfalarında önerilen hekimler, karşılaştırmada Pro etiketi',
    ],
  },
  {
    etiket: 'Bağlantılar', ad: 'Web siteniz ve yapay zekâ', ikon: 'message', renk: 'rgba(91,63,184,.4)',
    maddeler: [
      'Kopyala-yapıştır tek satır kodla sitenize randevu modülü',
      'Sitenizden gelen talepler aynı panelde',
      'Claude gibi asistanlardan randevuları listeleyin, ekleyin, taşıyın',
      'Gün/saat kapatma ve yorum yanıtlama; kişisel anahtar, anında iptal',
    ],
  },
];

const ADIMLAR = [
  { baslik: 'İşletmenizi sahiplenin', metin: 'Profiliniz zaten Hekimhane’de olabilir. Ücretsiz sahiplenme başvurusu 24 saat içinde değerlendirilir.' },
  { baslik: 'Pro’ya geçin', metin: `Aylık ${PRO_AYLIK_TL} TL. Ödeme, güvenli Stripe altyapısıyla alınır; kart bilgileriniz Hekimhane’de tutulmaz.` },
  { baslik: 'Panelden yönetin', metin: 'Randevular, hastalar, profil ve içerikleriniz tek panelde.' },
  { baslik: 'İstediğiniz an iptal edin', metin: 'Panel → “Pro Üyeliği Yönet” ile Stripe müşteri portalına gidersiniz. Dönem sonuna kadar Pro özellikleri açık kalır.' },
];

const GUVEN: { ikon: HkIkonAdi; baslik: string; metin: string }[] = [
  { ikon: 'verified', baslik: 'Güvenli ödeme', metin: 'Ödemeler Stripe üzerinden alınır; kart bilgileriniz Hekimhane sunucularına hiçbir zaman ulaşmaz.' },
  { ikon: 'open-now', baslik: 'Taahhüt yok', metin: 'Üyelik her ay yenilenir; panelden tek tıkla iptal edersiniz, dönem sonuna kadar Pro özellikleri açık kalır.' },
  { ikon: 'clinic', baslik: 'İşletme başına üyelik', metin: 'Birden fazla işletmeniz varsa her biri için panelden ayrı ayrı Pro’ya geçersiniz.' },
  { ikon: 'user-account', baslik: 'Sahiplenme ücretsiz', metin: 'İşletmenizi sahiplenmek ve profilinizi yönetmek ücretsizdir; Pro için önce sahiplenme gerekir.' },
];

const FIYAT_MADDELERI = [
  'Randevu yönetimi ve takvim',
  'Hasta listesi, not ve dosyalar',
  'Altın mühür + Pro rozeti',
  'Ana sayfada ve rehberde öne çıkarma',
  'Sitenize gömülebilir randevu modülü',
  'Otomatik e-posta bilgilendirmeleri',
  'WhatsApp ve web sitesi butonları',
];

const SSS: { s: string; c: string }[] = [
  { s: 'Aboneliği nasıl iptal ederim?', c: 'Panel → "Pro Üyeliği Yönet" ile Stripe müşteri portalına gidersiniz; iptal tek tıktır. Dönem sonuna kadar Pro özellikleri açık kalır, sonrasında ücret alınmaz.' },
  { s: 'Ücretsiz hesapla farkı ne?', c: 'İşletmenizi sahiplenmek ve profilinizi yönetmek ücretsizdir. Pro; profesyonel profil görünümü, öne çıkarma ve Pro rozetiyle işletmenizi görünür kılar, tüm randevu ve hasta yönetimi araçlarını içerir.' },
  { s: 'Ödeme güvenli mi?', c: 'Ödemeler dünyanın en yaygın ödeme altyapılarından Stripe üzerinden alınır. Kart bilgileriniz Hekimhane sunucularına hiçbir zaman ulaşmaz.' },
  { s: 'Birden fazla işletmem var, ne yapmalıyım?', c: 'Pro üyelik işletme başınadır. Her işletmeniz için panelden ayrı ayrı Pro’ya geçebilirsiniz.' },
];

const BAG: React.CSSProperties = { color: '#1B3A69', fontWeight: 700, textDecoration: 'underline' };

export default function ProPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${URL_}#sayfa`, url: URL_,
        name: 'Hekimhane-Pro — İşletmeniz İçin Profesyonel Üyelik',
        isPartOf: { '@id': 'https://www.hekimhane.com.tr/#website' },
      },
      sssJsonLd(SSS),
    ],
  };

  return (
    <OzSayfa jsonLd={jsonLd}>
      <OzHero
        rozet="Pro"
        urun="Hekimhane-Pro · Profesyonel üyelik"
        baslik={['İşletmenizi', 'bir adım öne taşıyın']}
        govde={<>Randevularınızı yönetin, hastalarınızı takip edin, profilinizi profesyonelleştirin. Tek üyelik, tüm araçlar — aylık {PRO_AYLIK_TL} TL, istediğiniz an iptal.</>}
        birincil={{ ad: `Pro’ya yükseltin — aylık ${PRO_AYLIK_TL} TL`, href: '#fiyat' }}
        ikincil={{ ad: 'Demo talep edin', href: '#demo' }}
        sahne={<Sahne />}
        alt={<p style={{ margin: '18px 0 0', fontSize: 13.5, color: '#586273' }}>Güvenli ödeme — Stripe altyapısı. Taahhüt yok. <a href="#dahil" style={{ color: '#1B3A69', fontWeight: 700, textDecoration: 'underline' }}>Neler dahil?</a></p>}
      />

      <OzBant
        baslik="Tek üyelik, tüm araçlar"
        alt="İşletmenizi yönetmek için ihtiyacınız olan her şey tek pakette: randevu, hasta iletişimi, profil ve görünürlük."
        kartlar={FAYDALAR}
        cta={{ ad: 'Pro’ya yükseltin', href: '#fiyat' }}
      />

      <OzIzgara
        id="dahil"
        ustyazi="Neden Pro"
        baslik="Pro hesabınıza dahil olanlar"
        govde="Randevudan hasta iletişimine, profilinizden yapay zekâ bağlantısına kadar tüm araçlar."
        ogeler={DAHIL}
      />

      <OzAdimlar ustyazi="Nasıl çalışır?" baslik="Dört adımda Pro" adimlar={ADIMLAR} />

      <OzKartlar
        ustyazi="Güven ve kontrol"
        baslik="Satın almadan önce bilmeniz gerekenler"
        govde="Ödeme, iptal ve sahiplik kuralları baştan açık."
        ogeler={GUVEN}
      />

      {/* ── FİYAT (satın alma: ProCta → Stripe) ── */}
      <section id="fiyat" className="vt-zemin vt-bolum" style={{ scrollMarginTop: 64 }}>
        <div className="container">
          <p className="vt-ustyazi">Ücret</p>
          <h2 className="vt-h2">Tek paket, tüm özellikler</h2>
          <div className="oz-panel">
            <div className="oz-ikili" style={{ alignItems: 'start' }}>
              <div>
                <span className="vt-pro">PRO</span>
                <p style={{ margin: '16px 0 4px', fontSize: 16, fontWeight: 700, color: '#586273' }}>Hekimhane-Pro</p>
                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 5.4vw, 64px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, color: '#0E1A2C' }}>{PRO_AYLIK_TL} TL</span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: '#586273' }}>/ ay</span>
                </div>
                <p style={{ margin: '10px 0 28px', fontSize: 15, color: '#586273' }}>Taahhüt yok — istediğiniz an iptal edin.</p>
                <ProCta boyut="lg" />
              </div>
              <ul className="oz-madde" style={{ gap: 14 }}>
                {FIYAT_MADDELERI.map(m => (
                  <li key={m} style={{ fontSize: 16, color: '#0E1A2C' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E8E5A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p style={{ margin: '22px 0 0', fontSize: 15, lineHeight: 1.7, color: '#3C4A61' }}>
            Henüz işletmenizi sahiplenmediniz mi? Pro’ya geçmek için önce <Link href="/sahiplen" style={BAG}>ücretsiz sahiplenin</Link>.
            Ayrıntılı sayfalar: <Link href="/randevu-sistemi" style={BAG}>Randevu takvimi</Link>,{' '}
            <Link href="/randevu-modulu" style={BAG}>Randevu modülü</Link>,{' '}
            <Link href="/mcp" style={BAG}>Yapay zekâ ile yönetim</Link>.
          </p>
        </div>
      </section>

      <OzBasvuru not={false}
        urun="pro"
        baslik="Satın almadan önce konuşalım"
        metin="Pro’nun işletmenize uyup uymadığını, panelin nasıl çalıştığını ve kurulum adımlarını anlatmak için sizi arayalım. Satın almaya hazırsanız yukarıdaki Ücret bölümünden hemen başlayabilirsiniz. Pro’ya geçmek için önce işletmenizi sahiplenmeniz gerekir; sahiplenme ücretsizdir."
        vaatler={[
          { ikon: 'phone', ad: 'Sizi arayıp Pro’yu anlatalım' },
          { ikon: 'message', ad: 'Paneli canlı olarak gösterelim' },
          { ikon: 'price-guide', ad: 'Sorularınızı satın almadan yanıtlayalım' },
        ]}
        formBaslik="Pro hakkında bilgi alın"
        formAciklama="Bilgilerinizi bırakın; ekibimiz sizi arayıp Pro’yu anlatsın ya da canlı olarak göstersin."
        formEtiket="Pro"
      />

      <OzSss sorular={SSS} />
    </OzSayfa>
  );
}

/* ═══ Çizimler — gerçek panel/profil arayüzünün sadeleştirilmiş temsili; gerçek kişi yok ═══ */

function TalepSatiri({ ad, alt, gecikme }: { ad: string; alt: string; gecikme: number }) {
  return (
    <div className="vt-h-belir" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderRadius: 16, background: '#fff', boxShadow: '0 6px 18px -10px rgba(18,41,77,.3), inset 0 0 0 1px #E6E8EC', animationDelay: `${gecikme}s` }}>
      <div style={{ minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: 14.5, color: '#0E1A2C' }}>{ad}</strong>
        <small style={{ display: 'block', fontSize: 12.5, color: '#586273', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alt}</small>
      </div>
      <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
        <span style={{ padding: '6px 11px', borderRadius: 9, background: '#12294D', color: '#fff', fontSize: 11.5, fontWeight: 700 }}>Onayla</span>
        <span style={{ padding: '6px 11px', borderRadius: 9, background: '#EEF1F5', color: '#3C4A61', fontSize: 11.5, fontWeight: 700 }}>Ertele</span>
      </div>
    </div>
  );
}

function Sahne() {
  return (
    <OzSahne ikon="premium">
      <OzSahneBaslik ikon="appointment" baslik="Randevu talepleri" alt="Pro panel · bugün" durum="2 yeni" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TalepSatiri ad="Ayşe K." alt="Yarın 14:30 · Diş taşı temizliği" gecikme={0.2} />
        <TalepSatiri ad="Mehmet D." alt="Perşembe 10:00 · Kontrol muayenesi" gecikme={0.7} />
      </div>
      <OzOnayKart ust="Hastaya e-posta gönderildi" baslik="Cuma · 16:15" alt="Zeynep A. · Dolgu · Onaylandı" gecikme={1.6} />
    </OzSahne>
  );
}

function MiniTalep() {
  const satir = (ad: string, alt: string, yeni: boolean) => (
    <div key={ad} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0E1A2C' }}>{ad}</div>
        <div style={{ fontSize: 10.5, color: '#586273' }}>{alt}</div>
      </div>
      {yeni
        ? <span style={{ padding: '4px 9px', borderRadius: 7, background: '#12294D', color: '#fff', fontSize: 10, fontWeight: 700 }}>Onayla</span>
        : <span style={{ padding: '3px 8px', borderRadius: 999, background: '#E1F2EE', color: '#0B5F55', fontSize: 10, fontWeight: 700 }}>Onaylandı</span>}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 230 }}>
      {satir('Ayşe K.', 'Yarın 14:30', true)}
      {satir('Zeynep A.', 'Cuma 16:15', false)}
    </div>
  );
}

function MiniEposta() {
  return (
    <div style={{ width: '100%', maxWidth: 230, padding: 14, borderRadius: 14, background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: '#E1F2EE' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B5F55" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
        </span>
        <b style={{ fontSize: 12, color: '#0E1A2C' }}>Randevunuz onaylandı</b>
      </div>
      <div style={{ height: 7, width: '88%', borderRadius: 4, background: '#E6E8EC', marginBottom: 6 }} />
      <div style={{ height: 7, width: '64%', borderRadius: 4, background: '#E6E8EC', marginBottom: 12 }} />
      <span style={{ display: 'inline-block', padding: '4px 9px', borderRadius: 7, background: '#F7F0DE', color: '#8A6A1F', fontSize: 10, fontWeight: 700 }}>Hatırlatma: yarın 14:30</span>
    </div>
  );
}

function MiniProfil() {
  return (
    <div style={{ width: '100%', maxWidth: 230, borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ height: 34, background: 'linear-gradient(120deg, #0E2D55, #1A335E 55%, #2B5288)' }} />
      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: -14 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', border: '2px solid #B8892F', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: '#12294D', flex: 'none' }}>H</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0E1A2C', whiteSpace: 'nowrap' }}>Örnek Diş Kliniği</div>
            <span className="vt-pro" style={{ height: 16, fontSize: 9, padding: '0 6px' }}>PRO</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
          <span style={{ flex: 1, textAlign: 'center', padding: '5px 4px', borderRadius: 7, background: '#22A757', color: '#fff', fontSize: 9.5, fontWeight: 700 }}>WhatsApp</span>
          <span style={{ flex: 1, textAlign: 'center', padding: '5px 4px', borderRadius: 7, background: '#12294D', color: '#fff', fontSize: 9.5, fontWeight: 700 }}>Web sitesi</span>
        </div>
      </div>
    </div>
  );
}

function MiniGorunur() {
  const satir = (ad: string, alt: string, pro: boolean) => (
    <div key={ad} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: '#fff', boxShadow: pro ? 'inset 0 0 0 1.5px #B8892F' : 'inset 0 0 0 1px #DCE3EE' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0E1A2C', whiteSpace: 'nowrap' }}>{ad}</div>
        <div style={{ fontSize: 10.5, color: '#586273' }}>{alt}</div>
      </div>
      {pro && <span className="vt-pro" style={{ height: 16, fontSize: 9, padding: '0 6px', flex: 'none' }}>PRO</span>}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 230 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#12294D' }}>Ana sayfa · Öne çıkanlar</div>
      {satir('Örnek Muayenehane', 'Dahiliye · Ankara', false)}
      {satir('Örnek Diş Kliniği', 'Diş hekimi · İstanbul', true)}
    </div>
  );
}
