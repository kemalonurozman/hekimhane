import type { Metadata } from 'next';
import Link from 'next/link';
import { PRO_AYLIK_TL } from '@/lib/pro-plan';
import ProCta from './ProCta';

export const metadata: Metadata = {
  title: 'Hekimhane-Pro — İşletmeniz İçin Profesyonel Üyelik',
  description: `Randevu yönetimi, hasta listesi, sitenize rezervasyon modülü, otomatik e-posta bilgilendirme ve profesyonel profil görünümü. Aylık ${PRO_AYLIK_TL} TL, istediğiniz an iptal.`,
  alternates: { canonical: 'https://www.hekimhane.com.tr/pro' },
  openGraph: {
    title: 'Hekimhane-Pro | Hekimhane',
    description: `İşletmeniz için profesyonel üyelik — aylık ${PRO_AYLIK_TL} TL.`,
    url: 'https://www.hekimhane.com.tr/pro',
    type: 'website',
  },
};

const NAVY = '#1B3A69';
const GOLD = '#D4A843';
const MUTED = '#6E6E73';
const BORDER = '#E5E5EA';

function Ikon({ d, size = 22, color = NAVY }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('|').map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

/* İki büyük vitrin (mini arayüz maketiyle) + dört detay kartı */
const VITRIN = [
  {
    etiket: 'Randevu & Hasta',
    baslik: 'Randevularınız tek panelde, hastanız her adımda bilgilendirilir',
    aciklama: 'Web sitenizden ve Hekimhane profilinizden gelen tüm talepler aynı ekrana düşer. Siz karar verirsiniz, yazışmayı sistem üstlenir.',
    maddeler: [
      'Tek tıkla onaylayın, erteleyin veya iptal edin',
      'Her kararda hastaya otomatik e-posta gider',
      'Randevudan bir gün önce otomatik hatırlatma',
      'Randevuyu Google Takvim\'e tek tıkla ekleyin',
    ],
    mock: 'randevu' as const,
  },
  {
    etiket: 'Profil & Görünürlük',
    baslik: 'Profiliniz güven veren, seçkin bir vitrine dönüşür',
    aciklama: 'Hastalar hekim seçerken görünüme ve doğrulanmışlık işaretlerine bakar. Pro profil, ilk bakışta fark yaratır.',
    maddeler: [
      'Altın doğrulama mührü ve arama sonuçlarında Pro rozeti',
      'Hareketli kapak tasarımı ve renk teması seçimi',
      'Profilinizde WhatsApp ve web sitesi butonları',
      'Ana sayfa ve sağlık rehberinde öne çıkarma',
    ],
    mock: 'profil' as const,
  },
];

const KARTLAR = [
  {
    baslik: 'Hasta Listesi',
    aciklama: 'Hasta kayıtlarınız düzenli ve elinizin altında.',
    maddeler: ['Hasta kartı, not ve etiketler', 'İşlem geçmişi ve dosya ekleme', 'Panelden doğrudan e-posta gönderme'],
    ikon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8|M22 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    baslik: 'Sitenize Rezervasyon Modülü',
    aciklama: 'Randevu modülünü kendi sitenize gömün.',
    maddeler: ['Kopyala-yapıştır tek satır kod', 'Sitenizden gelen talepler aynı panelde', 'Tasarımınıza uyumlu sade görünüm'],
    ikon: 'M16 18l6-6-6-6|M8 6l-6 6 6 6',
  },
  {
    baslik: 'Otomatik E-posta Bilgilendirme',
    aciklama: 'Hasta iletişimini sistem sizin adınıza yürütür.',
    maddeler: ['Onay, erteleme ve iptal bildirimleri', 'Bir gün önce randevu hatırlatması', 'Hekimhane markalı şık şablonlar'],
    ikon: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z|M22 6l-10 7L2 6',
  },
  {
    baslik: 'Öne Çıkarma',
    aciklama: 'Doğru sayfalarda, doğru anda görünün.',
    maddeler: ['Ana sayfada Premium bölümünde yer alma', 'Hastalık sayfalarında önerilen hekimler', 'Karşılaştırma sayfasında Pro etiketi'],
    ikon: 'M12 19V5|M5 12l7-7 7 7',
  },
];

/* Vitrin maketleri — gerçek panel/profil arayüzünün sadeleştirilmiş temsili */
function MockRandevu() {
  const satir = (ad: string, saat: string, islem: string, durum: 'yeni' | 'onaylandi') => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', background: 'white', borderRadius: 11, border: `1px solid ${BORDER}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1D1D1F' }}>{ad}</div>
        <div style={{ fontSize: 11, color: MUTED }}>{saat} · {islem}</div>
      </div>
      {durum === 'yeni' ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span style={{ padding: '5px 11px', borderRadius: 8, background: NAVY, color: 'white', fontSize: 10.5, fontWeight: 700 }}>Onayla</span>
          <span style={{ padding: '5px 11px', borderRadius: 8, background: '#F1F5F9', color: '#475569', fontSize: 10.5, fontWeight: 700 }}>Ertele</span>
        </div>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
          <svg width="9" height="9" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5 L4.5 8.5 L11 1.5" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Onaylandı
        </span>
      )}
    </div>
  );
  return (
    <div style={{ background: '#F4F7FB', borderRadius: 16, border: `1px solid ${BORDER}`, padding: 14, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 2px 6px' }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1D1D1F' }}>Randevu Talepleri</span>
        <span style={{ padding: '3px 9px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 800 }}>2 yeni</span>
      </div>
      {satir('Ayşe K.', 'Yarın 14:30', 'Diş taşı temizliği', 'yeni')}
      {satir('Mehmet D.', 'Perşembe 10:00', 'Kontrol muayenesi', 'yeni')}
      {satir('Zeynep A.', 'Cuma 16:15', 'Dolgu', 'onaylandi')}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px 0' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3E7C4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
        <span style={{ fontSize: 10.5, color: '#3E7C4A', fontWeight: 700 }}>Hastaya onay e-postası gönderildi</span>
      </div>
    </div>
  );
}

function MockProfil() {
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden', background: 'white' }}>
      <div style={{ height: 58, background: `linear-gradient(120deg, #0E2D55, ${NAVY} 55%, #2B5288)`, position: 'relative' }}>
        <svg viewBox="0 0 400 58" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
          <path d="M0 40 C 90 18, 180 56, 400 31 L 400 58 L 0 58 Z" fill="rgba(255,255,255,.08)" />
          <path d="M0 49 C 120 31, 240 60, 400 42 L 400 58 L 0 58 Z" fill="rgba(212,168,67,.16)" />
        </svg>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        {/* Yalnızca logo şeride taşar; ad ve rozet beyaz zeminde kalır (okunurluk) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: -16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'white', border: `2.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: NAVY }}>H</div>
            <span style={{ position: 'absolute', bottom: -3, right: -3, width: 17, height: 17, borderRadius: '50%', background: `linear-gradient(145deg, ${GOLD}, #BE8F2C)`, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="8" height="8" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5 L4.5 8.5 L11 1.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
          <div style={{ minWidth: 0, marginTop: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1D1D1F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Örnek Diş Kliniği</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: MUTED }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 999, background: 'linear-gradient(135deg,#D4A843,#BE8F2C)', color: 'white', fontWeight: 800, letterSpacing: '.6px' }}>PRO</span>
              İstanbul · Beşiktaş
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
          <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 8px', borderRadius: 9, background: '#22A757', color: 'white', fontSize: 10.5, fontWeight: 700 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.1 14.2c-.2.6-1.2 1.1-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3 0 .2 0 .7-.2 1.3z" /></svg>
            WhatsApp
          </span>
          <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 8px', borderRadius: 9, background: NAVY, color: 'white', fontSize: 10.5, fontWeight: 700 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" /></svg>
            Web Sitesi
          </span>
          <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '7px 8px', borderRadius: 9, background: `linear-gradient(135deg, ${GOLD}, #BE8F2C)`, color: 'white', fontSize: 10.5, fontWeight: 700 }}>Randevu Al</span>
        </div>
      </div>
    </div>
  );
}

const ADIMLAR = [
  { no: '1', baslik: 'İşletmenizi sahiplenin', aciklama: 'Profiliniz zaten Hekimhane\'de olabilir. Ücretsiz sahiplenme başvurusu 24 saat içinde değerlendirilir.' },
  { no: '2', baslik: 'Pro\'ya geçin', aciklama: `Aylık ${PRO_AYLIK_TL} TL. Ödeme, güvenli Stripe altyapısıyla alınır; kart bilgileriniz Hekimhane'de tutulmaz.` },
  { no: '3', baslik: 'Panelden yönetin', aciklama: 'Randevular, hastalar, profil ve içerikleriniz tek panelde. Aboneliğinizi istediğiniz an iptal edebilirsiniz.' },
];

const SSS = [
  {
    soru: 'Aboneliği nasıl iptal ederim?',
    cevap: 'Panel → "Pro Üyeliği Yönet" ile Stripe müşteri portalına gidersiniz; iptal tek tıktır. Dönem sonuna kadar Pro özellikleri açık kalır, sonrasında ücret alınmaz.',
  },
  {
    soru: 'Ücretsiz hesapla farkı ne?',
    cevap: 'İşletmenizi sahiplenmek ve profilinizi yönetmek ücretsizdir. Pro; profesyonel profil görünümü, öne çıkarma ve Pro rozetiyle işletmenizi görünür kılar, tüm randevu ve hasta yönetimi araçlarını içerir.',
  },
  {
    soru: 'Ödeme güvenli mi?',
    cevap: 'Ödemeler dünyanın en yaygın ödeme altyapılarından Stripe üzerinden alınır. Kart bilgileriniz Hekimhane sunucularına hiçbir zaman ulaşmaz.',
  },
  {
    soru: 'Birden fazla işletmem var, ne yapmalıyım?',
    cevap: 'Pro üyelik işletme başınadır. Her işletmeniz için panelden ayrı ayrı Pro\'ya geçebilirsiniz.',
  },
];

export default function ProPage() {
  return (
    <main style={{ background: 'var(--ivory, #FBF8F2)', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg, #071A2E 0%, #0E2D55 45%, ${NAVY} 100%)`, padding: '120px 24px 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.4)', color: GOLD, fontSize: 11.5, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 22 }}>
            <svg width="11" height="11" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5 L4.5 8.5 L11 1.5" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Hekimhane-Pro
          </span>
          <h1 style={{ color: 'white', fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.15, margin: '0 0 16px' }}>
            İşletmenizi bir adım öne taşıyın
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 17, lineHeight: 1.65, margin: '0 auto 30px', maxWidth: 560 }}>
            Randevularınızı yönetin, hastalarınızı takip edin, profilinizi profesyonelleştirin.
            Tek üyelik, tüm araçlar — aylık {PRO_AYLIK_TL} TL, istediğiniz an iptal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}><ProCta boyut="lg" /></div>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 12.5, marginTop: 16 }}>
            Güvenli ödeme — Stripe altyapısı. Taahhüt yok.
          </p>
        </div>
      </section>

      {/* ÖZELLİKLER — vitrinler + detay kartları */}
      <section style={{ padding: '76px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ display: 'inline-block', padding: '4px 13px', borderRadius: 999, background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.35)', color: '#9A742A', fontSize: 11, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 14 }}>
            Neden Pro
          </span>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.9px', margin: '0 0 10px' }}>
            Pro hesabınıza dahil olanlar
          </h2>
          <p style={{ color: MUTED, fontSize: 15.5, margin: 0 }}>
            İşletmenizi yönetmek için ihtiyacınız olan her şey, tek pakette.
          </p>
        </div>

        {/* Vitrinler — metin + mini arayüz maketi, dönüşümlü yerleşim */}
        {VITRIN.map((v, i) => (
          <div key={v.baslik} className={`pro-vitrin${i % 2 === 1 ? ' pro-vitrin--ters' : ''}`}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center', background: 'white', border: `1px solid ${BORDER}`, borderRadius: 22, padding: '38px 40px', marginBottom: 22, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div className="pro-vitrin-metin">
              <span style={{ display: 'inline-block', padding: '3px 11px', borderRadius: 999, background: '#EEF3FA', color: NAVY, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.1px', textTransform: 'uppercase', marginBottom: 14 }}>
                {v.etiket}
              </span>
              <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.5px', lineHeight: 1.3, margin: '0 0 10px' }}>{v.baslik}</h3>
              <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.65, margin: '0 0 18px' }}>{v.aciklama}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {v.maddeler.map(m => (
                  <li key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '5px 0', fontSize: 13.5, color: '#3A3A3C', fontWeight: 500, lineHeight: 1.5 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" fill="#F5EEDC" /><path d="M8 12l3 3 5-6" stroke="#9A742A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pro-vitrin-mock">
              {v.mock === 'randevu' ? <MockRandevu /> : <MockProfil />}
            </div>
          </div>
        ))}

        {/* Detay kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 10 }}>
          {KARTLAR.map(o => (
            <div key={o.baslik} className="pro-kart"
              style={{ background: 'white', borderRadius: 18, border: `1px solid ${BORDER}`, padding: '24px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(140deg, ${NAVY}, #0F2A55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, boxShadow: '0 3px 10px rgba(27,58,105,.25)' }}>
                <Ikon d={o.ikon} size={20} color="white" />
              </div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1D1D1F', margin: '0 0 6px', letterSpacing: '-0.3px' }}>{o.baslik}</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: '0 0 13px' }}>{o.aciklama}</p>
              <ul style={{ listStyle: 'none', padding: '13px 0 0', margin: 0, borderTop: `1px solid #F1F1F4` }}>
                {o.maddeler.map(m => (
                  <li key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', fontSize: 12.5, color: '#48484A', lineHeight: 1.5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2.5 }}><path d="M5 12l4 4 10-11" stroke="#9A742A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Kart hover + vitrin mobil yerleşimi.
          DİKKAT: style blok metnine tırnak VEYA > (child combinator) koyma —
          React SSR bunları escape edip hydration uyumsuzluğu yaratıyor. */}
      <style>{`
        .pro-kart { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .pro-kart:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(27,58,105,.12); border-color: #D4A843; }
        .pro-vitrin--ters .pro-vitrin-metin { order: 2; }
        .pro-vitrin--ters .pro-vitrin-mock { order: 1; }
        @media (max-width: 800px) {
          .pro-vitrin { grid-template-columns: 1fr !important; padding: 26px 22px !important; gap: 26px !important; }
          .pro-vitrin--ters .pro-vitrin-metin { order: 1; }
          .pro-vitrin--ters .pro-vitrin-mock { order: 2; }
        }
      `}</style>

      {/* NASIL ÇALIŞIR */}
      <section style={{ background: 'white', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.7px', margin: '0 0 40px' }}>
            Üç adımda Pro
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 26 }}>
            {ADIMLAR.map(a => (
              <div key={a.no} style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: NAVY, color: 'white', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{a.no}</div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1D1D1F', margin: '0 0 8px' }}>{a.baslik}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{a.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FİYAT */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', background: 'white', borderRadius: 22, border: `1.5px solid ${GOLD}`, boxShadow: '0 8px 32px rgba(190,143,44,.15)', overflow: 'hidden' }}>
          <div style={{ background: `linear-gradient(135deg, ${GOLD}, #BE8F2C)`, padding: '10px', textAlign: 'center', color: 'white', fontSize: 11.5, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase' }}>
            Tek paket, tüm özellikler
          </div>
          <div style={{ padding: '34px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: MUTED, marginBottom: 6 }}>Hekimhane-Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-1.5px' }}>{PRO_AYLIK_TL} TL</span>
              <span style={{ fontSize: 15, color: MUTED, fontWeight: 600 }}>/ ay</span>
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 24 }}>Taahhüt yok — istediğiniz an iptal edin</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', textAlign: 'left' }}>
              {['Randevu yönetimi ve takvim', 'Hasta listesi, not ve dosyalar', 'Altın mühür + Pro rozeti', 'Ana sayfada ve rehberde öne çıkarma', 'Sitenize gömülebilir randevu modülü', 'Otomatik e-posta bilgilendirmeleri', 'WhatsApp ve web sitesi butonları'].map(m => (
                <li key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 14, color: '#1D1D1F', fontWeight: 500 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" fill="#F0F7EE" /><path d="M8 12l3 3 5-6" stroke="#3E7C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {m}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}><ProCta /></div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.6px', margin: '0 0 30px' }}>
            Sık sorulan sorular
          </h2>
          {SSS.map(s => (
            <details key={s.soru} style={{ background: 'white', borderRadius: 14, border: `1px solid ${BORDER}`, padding: '16px 20px', marginBottom: 10 }}>
              <summary style={{ fontSize: 14.5, fontWeight: 700, color: '#1D1D1F', cursor: 'pointer' }}>{s.soru}</summary>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, margin: '10px 0 0' }}>{s.cevap}</p>
            </details>
          ))}
          <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, marginTop: 28 }}>
            Henüz işletmenizi sahiplenmediniz mi?{' '}
            <Link href="/sahiplen" style={{ color: NAVY, fontWeight: 700 }}>Ücretsiz sahiplenin</Link>
            {' '}— profiliniz büyük ihtimalle zaten Hekimhane&apos;de.
          </p>
        </div>
      </section>
    </main>
  );
}
