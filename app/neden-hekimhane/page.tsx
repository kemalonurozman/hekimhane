import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Neden Hekimhane? — Diş Hekimleri & Klinikler İçin Ücretsiz Dijital Platform',
  description:
    'Hekimhane; diş hekimleri ve klinikler için tamamen ücretsiz profil, ücretsiz HekimKart dijital kartvizit, randevu sistemi, blog ile marka görünürlüğü ve bölgeye özel SEO sayfaları sunar. Google ve yapay zekâda öne çıkın.',
  keywords: ['diş hekimi tanıtım', 'ücretsiz klinik profili', 'HekimKart', 'diş kliniği randevu sistemi', 'diş hekimi web sitesi', 'diş hekimi SEO'],
  alternates: { canonical: 'https://www.hekimhane.com.tr/neden-hekimhane' },
  openGraph: {
    title: 'Neden Hekimhane?',
    description: 'Diş hekimleri ve klinikler için tamamen ücretsiz dijital platform — HekimKart, randevu, blog ve bölgeye özel SEO.',
    url: 'https://www.hekimhane.com.tr/neden-hekimhane',
    type: 'website',
  },
};

/* ── İnline ikonlar (emoji yok, kurala uygun) ── */
const IC: Record<string, React.ReactNode> = {
  gift:   <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8 M2 7h20v5H2z M12 21V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />,
  card:   <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20 M6 15h4" /></>,
  globe:  <><circle cx="12" cy="12" r="9" /><path d="M3 12h18 M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></>,
  cal:    <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></>,
  mega:   <path d="M3 11l14-6v14L3 13v-2z M3 11v2 M8 12v6a2 2 0 0 0 4 0v-1" />,
  pen:    <path d="M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  star:   <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />,
  lock:   <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  bolt:   <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
  ai:     <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h.01M15 9h.01M9 14c1 1 5 1 6 0" /></>,
  check:  <path d="M20 6L9 17l-5-5" />,
};

function Icon({ name, size = 22, color = '#1B3A69', stroke = 2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {IC[name]}
    </svg>
  );
}

const FEATURES = [
  { icon: 'gift',   title: 'Tamamen Ücretsiz Giriş', text: 'Kayıt, profil oluşturma ve profilinizi sahiplenme bugün tamamen ücretsiz. Gizli ücret, sürpriz kesinti yok.' },
  { icon: 'card',   title: 'Ücretsiz HekimKart', text: 'Dijital kartvizitiniz HekimKart ücretsiz. QR ile paylaşın, tek bağlantıda tüm bilgileriniz hastalarınıza ulaşsın.' },
  { icon: 'globe',  title: 'HekimKart = Web Siteniz', text: 'Size özel, kaliteli ve profesyonel; ayrı bir web sitesi maliyetine gerek kalmadan HekimKart’ınızı web siteniz olarak kullanın.' },
  { icon: 'cal',    title: 'Randevu Sistemi', text: 'Hastalarınızla doğrudan ya da internet üzerinden randevu ayarlayın. Talepler size ulaşsın, takviminizi siz yönetin.' },
  { icon: 'mega',   title: 'İşletmenizin Reklamı', text: 'Profiliniz aramalarda, bölge sayfalarında ve öne çıkan alanlarda görünür — potansiyel hastalara ulaşın.' },
  { icon: 'pen',    title: 'Blog ile Marka Görünürlüğü', text: 'Uzmanlık makalelerinizle işletmenizin görünürlüğünü artırın, kendi markanızı öne çıkarın.' },
  { icon: 'search', title: 'Bölge & Alana Özel Sayfalar', text: 'Her il, ilçe ve uzmanlık için özel sayfalar sayesinde Google ve yapay zekâ araçlarında görünürlüğünüzü artırın.' },
  { icon: 'star',   title: 'Yorumlarınızı Yönetin', text: 'Hasta yorumlarını görün, yanıtlayın ve itibarınızı yönetin. Şeffaf ve güvenilir bir profil oluşturun.' },
  { icon: 'lock',   title: 'Kendi Hasta Altyapınız', text: 'Hasta iletişiminizi kayıt altında tutun; görüşmeleriniz size özel, kripto-şifreli hafızada saklanır. Verileriniz sizin kalır.' },
];

/* ── Değerler — "Neden bize güvenebilirsiniz?" (Docplanner güven çerçevesinden esinlenilmiş, bize özel) ── */
const VALUES = [
  { icon: 'bolt',   title: 'Sadelik', text: 'Hastalar ihtiyacına uygun diş hekimini kolayca bulup randevu alsın; işletmeler profilini zahmetsiz yönetsin diye her adımı sade tuttuk.' },
  { icon: 'star',   title: 'Kullanıcı Odaklı', text: 'Hem hastanın hem işletmenin ihtiyacını dinliyor, geri bildirimlerle platformu sürekli iyileştiriyoruz.' },
  { icon: 'check',  title: 'Güvenilirlik', text: 'Doğrulanmış profiller, şeffaf yorumlar ve açık bilgi — doğru uzmanı seçmek için güvenilir bir zemin.' },
  { icon: 'lock',   title: 'Gizlilik & Güvenlik', text: 'Verilerin gizliliği önceliğimiz. İşletme verileri size özel; hasta iletişiminiz güvenli şekilde saklanır.' },
  { icon: 'globe',  title: 'Şeffaflık', text: 'İçerik yayınlama ve moderasyon süreçlerimizde açık davranır, topluluğun güvenini korumayı ilke ediniriz.' },
  { icon: 'cal',    title: '7/24 Erişilebilir', text: 'Sağlık ihtiyaçları saate bakmaz. Platform her an açık; hastalar dilediği zaman size ulaşır.' },
];

async function getSayilar() {
  try {
    const [klinik, disHekimi] = await Promise.all([
      supabase.from('klinikler').select('id', { count: 'exact', head: true }),
      supabase.from('doktorlar').select('id', { count: 'exact', head: true }).ilike('spec', '%diş%'),
    ]);
    return { klinik: klinik.count || 0, disHekimi: disHekimi.count || 0 };
  } catch {
    return { klinik: 0, disHekimi: 0 };
  }
}

const NAVY = '#1B3A69', GOLD = '#D4A843', TEXT = '#1c1c1e', MUTED = '#6E6E73', BORDER = '#E5E5EA';

const trSayi = (n: number) => n.toLocaleString('tr-TR');

export default async function NedenHekimhanePage() {
  const sayilar = await getSayilar();
  return (
    <div style={{ paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', color: TEXT, background: '#fff' }}>
      <style>{`
        .nh-wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
        .nh-hero{position:relative;overflow:hidden;background:linear-gradient(155deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%);color:#fff;}
        .nh-hero-glow{position:absolute;border-radius:50%;filter:blur(10px);opacity:.5;}
        .nh-cta{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-.2px;transition:transform .16s ease, box-shadow .16s ease;}
        .nh-cta:hover{transform:translateY(-2px);}
        .nh-cta-gold{background:linear-gradient(135deg,#EBC65D,#D4A843);color:#0F2A55;box-shadow:0 10px 26px rgba(212,168,67,.4);}
        .nh-cta-ghost{background:rgba(255,255,255,.08);color:#fff;border:1.5px solid rgba(255,255,255,.28);}
        .nh-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
        .nh-card{background:#fff;border:1px solid ${BORDER};border-radius:20px;padding:26px 24px;box-shadow:0 1px 4px rgba(0,0,0,.05);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;}
        .nh-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(15,42,85,.1);border-color:#D6DEEC;}
        .nh-ic{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#EEF3FB,#E3ECF9);margin-bottom:16px;}
        .nh-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
        .nh-compare{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media (max-width:860px){
          .nh-grid{grid-template-columns:1fr 1fr;}
          .nh-stat{grid-template-columns:1fr;}
          .nh-compare{grid-template-columns:1fr;}
        }
        @media (max-width:560px){
          .nh-grid{grid-template-columns:1fr;}
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="nh-hero">
        <span className="nh-hero-glow" style={{ width: 360, height: 360, right: -80, top: -120, background: 'rgba(212,168,67,.22)' }} />
        <span className="nh-hero-glow" style={{ width: 300, height: 300, left: -100, bottom: -140, background: 'rgba(78,123,192,.28)' }} />
        <div className="nh-wrap" style={{ position: 'relative', zIndex: 1, padding: '84px 24px 92px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 999, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', fontSize: 12.5, fontWeight: 700, letterSpacing: '.4px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
            ŞU AN TAMAMEN ÜCRETSİZ
          </span>
          <h1 style={{ fontSize: 'clamp(34px, 5.4vw, 58px)', fontWeight: 800, letterSpacing: '-1.6px', lineHeight: 1.05, margin: '0 0 20px' }}>
            Neden Hekimhane?
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', lineHeight: 1.6, color: 'rgba(255,255,255,.82)', maxWidth: 720, margin: '0 auto 34px', fontWeight: 400 }}>
            Türkiye’nin diş sağlığı rehberinde işletmeniz için ihtiyacınız olan her şey tek çatı altında:
            ücretsiz profil, ücretsiz HekimKart, randevu sistemi, blog ile görünürlük ve bölgeye özel SEO — bugün tamamen ücretsiz.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/katil" className="nh-cta nh-cta-gold">
              İşletmenizi Ekleyin
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/klinikler" className="nh-cta nh-cta-ghost">Profilinizi Sahiplenin</Link>
          </div>
        </div>
      </section>

      {/* ── STAT BANDI ───────────────────────────────────── */}
      <section style={{ background: '#F5F5F7', borderBottom: `1px solid ${BORDER}` }}>
        <div className="nh-wrap" style={{ padding: '40px 24px' }}>
          <div className="nh-stat">
            {[
              { k: '₺0', l: 'Tamamen ücretsiz', d: 'Profil, HekimKart ve sahiplenme' },
              { k: '%90’a varan', l: 'Fiyat–performans etkisi', d: 'Benzer platformlara kıyasla hedefimiz' },
              { k: 'Google + Yapay Zekâ', l: 'Görünürlük', d: 'Bölge ve alana özel sayfalarla' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px 8px' }}>
                <div style={{ fontSize: 'clamp(24px, 3.4vw, 32px)', fontWeight: 800, color: NAVY, letterSpacing: '-.8px', marginBottom: 6 }}>{s.k}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖZELLİK KARTLARI ─────────────────────────────── */}
      <section className="nh-wrap" style={{ padding: '72px 24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>İşletmeniz İçin</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: 0 }}>Hekimhane ile neler kazanırsınız?</h2>
        </div>
        <div className="nh-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="nh-card">
              <div className="nh-ic"><Icon name={f.icon} size={24} /></div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-.3px', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEĞERLER / GÜVEN ─────────────────────────────── */}
      <section style={{ background: '#F5F5F7', marginTop: 40 }}>
        <div className="nh-wrap" style={{ padding: '72px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 44px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>Güven Bir Tercihtir</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: '0 0 14px' }}>Neden bize güvenebilirsiniz?</h2>
            <p style={{ fontSize: 15.5, color: MUTED, lineHeight: 1.7, margin: 0 }}>
              Sağlık, güven ister. Hastaların doğru bilgiye ulaşması ve işletmelerin hastaların ihtiyacını anlaması için
              platformumuzu açık, sade ve güvenilir ilkeler üzerine kuruyoruz.
            </p>
          </div>
          <div className="nh-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="nh-card">
                <div className="nh-ic"><Icon name={v.icon} size={24} /></div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-.3px', margin: '0 0 8px' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>

          {/* Etkimiz — gerçek sayılar */}
          <div style={{ marginTop: 40, background: 'linear-gradient(150deg,#0F2A55,#1B3A69)', borderRadius: 24, padding: 'clamp(28px, 4vw, 44px)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <span className="nh-hero-glow" style={{ width: 260, height: 260, right: -70, top: -120, background: 'rgba(212,168,67,.18)' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#EBC65D', margin: '0 0 10px' }}>Etkimiz</p>
              <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-.6px', margin: '0 0 26px' }}>Türkiye genelinde büyüyen bir sağlık rehberi</h3>
              <div className="nh-stat">
                <div>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', color: '#EBC65D' }}>{sayilar.klinik > 0 ? `${trSayi(sayilar.klinik)}+` : '—'}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', marginTop: 4 }}>Diş kliniği ve muayenehane</div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', color: '#EBC65D' }}>{sayilar.disHekimi > 0 ? `${trSayi(sayilar.disHekimi)}+` : '—'}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', marginTop: 4 }}>Uzman diş hekimi</div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', color: '#EBC65D' }}>81 il</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', marginTop: 4 }}>Bölgeye özel sayfalarla kapsam</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÜCRETSİZ BAŞLANGIÇ PAKETİ ────────────────────── */}
      <section className="nh-wrap" style={{ padding: '64px 24px 8px' }}>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 26, padding: 'clamp(28px, 4vw, 44px)', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'linear-gradient(135deg,#EBC65D,#D4A843)', color: '#0F2A55', fontSize: 12, fontWeight: 800, letterSpacing: '.5px' }}>
              <Icon name="gift" size={14} color="#0F2A55" /> ÜCRETSİZ BAŞLANGIÇ PAKETİ
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3.4vw, 32px)', fontWeight: 800, letterSpacing: '-.9px', color: NAVY, textAlign: 'center', margin: '0 0 8px' }}>Bugün hiçbir ücret ödemeden başlayın</h2>
          <p style={{ fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 1.65, maxWidth: 620, margin: '0 auto 30px' }}>
            Profilinizi ekleyin veya sahiplenin; aşağıdaki her şey başlangıç paketinde ücretsiz.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px 28px', maxWidth: 820, margin: '0 auto' }}>
            {[
              'Ücretsiz işletme / doktor profili',
              'Ücretsiz HekimKart dijital kartvizit',
              'HekimKart’ı web siteniz olarak kullanma',
              'Randevu talebi sistemi',
              'Blog ile makale yayınlama',
              'Bölge ve alana özel SEO sayfaları',
              'Yorum yönetimi ve yanıtlama',
              'Fotoğraf ve 360° tur ekleme',
            ].map(x => (
              <div key={x} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 14.5, color: TEXT, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 1, width: 22, height: 22, borderRadius: '50%', background: 'rgba(5,150,105,.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={14} color="#059669" stroke={3} />
                </span>{x}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/katil" className="nh-cta nh-cta-gold" style={{ boxShadow: '0 10px 26px rgba(212,168,67,.35)' }}>
              Ücretsiz Başlayın
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HEKİMKART SPOTLIGHT ──────────────────────────── */}
      <section className="nh-wrap" style={{ padding: '56px 24px' }}>
        <div style={{ background: 'linear-gradient(150deg,#0F2A55,#1B3A69)', borderRadius: 28, padding: 'clamp(28px, 4vw, 52px)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <span className="nh-hero-glow" style={{ width: 260, height: 260, right: -60, bottom: -100, background: 'rgba(212,168,67,.2)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: 20, maxWidth: 760 }}>
            <span style={{ display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 8, padding: '6px 13px', borderRadius: 999, background: 'rgba(212,168,67,.18)', border: '1px solid rgba(212,168,67,.4)', color: '#EBC65D', fontSize: 12, fontWeight: 800, letterSpacing: '.5px' }}>
              <Icon name="card" size={14} color="#EBC65D" /> HEKİMKART
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 3.4vw, 34px)', fontWeight: 800, letterSpacing: '-.9px', lineHeight: 1.15, margin: 0 }}>
              Web sitenizin profesyonel hâli — ücretsiz.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,.8)', margin: 0 }}>
              Size özel, kaliteli ve hızlı HekimKart’ınızı web siteniz olarak kullanın. Ayrı bir site yaptırma
              maliyeti ve teknik uğraş olmadan; iletişim bilgileriniz, uzmanlıklarınız, fotoğraflarınız,
              çalışma saatleriniz ve randevu talebi tek profesyonel sayfada. QR ile paylaşın, kartvizite basın.
            </p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 4 }}>
              {['Profesyonel tasarım', 'Mobil uyumlu', 'QR ile paylaşım', 'SEO uyumlu'].map(x => (
                <span key={x} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                  <Icon name="check" size={16} color="#4ADE80" stroke={3} />{x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── KARŞILAŞTIRMA ────────────────────────────────── */}
      <section className="nh-wrap" style={{ padding: '20px 24px 64px' }}>
        <div className="nh-compare">
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 22, padding: '28px 26px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#EBC65D,#D4A843)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bolt" size={20} color="#0F2A55" />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: NAVY, margin: 0, letterSpacing: '-.4px' }}>Hekimhane ile</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Ücretsiz profil, ücretsiz HekimKart', 'Bölge ve alana özel SEO sayfaları', 'Randevu talepleri doğrudan size', 'Blog ile marka ve görünürlük', 'Yorum yönetimi ve şeffaf itibar', 'Verileriniz size özel, güvenli'].map(x => (
                <li key={x} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: TEXT, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="check" size={17} color="#059669" stroke={3} /></span>{x}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: '#FAFAFB', border: `1px solid ${BORDER}`, borderRadius: 22, padding: '28px 26px' }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: MUTED, margin: '0 0 16px', letterSpacing: '-.4px' }}>Diğer platformlar</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Çoğu özellik için aylık ücret', 'Sınırlı görünürlük ve öne çıkma', 'Ek web sitesi maliyeti', 'Reklam için ayrı ödeme', 'Kısıtlı içerik ve blog imkânı'].map(x => (
                <li key={x} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: MUTED, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0, marginTop: 2, width: 17, height: 17, borderRadius: '50%', border: `2px solid #CBD1DB`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#CBD1DB" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </span>{x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, marginTop: 20, lineHeight: 1.6, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          Hedefimiz; benzer sitelere kıyasla <strong style={{ color: NAVY }}>%90’a varan fiyat–performans dengesi</strong> ve
          gerçek bir görünürlük etkisi sunmaktır. Sistemimiz şu anda tamamen ücretsizdir.
        </p>
      </section>

      {/* ── KAPANIŞ CTA ──────────────────────────────────── */}
      <section style={{ background: '#F5F5F7' }}>
        <div className="nh-wrap" style={{ padding: '64px 24px' }}>
          <div style={{ background: 'linear-gradient(150deg,#0F2A55,#163D6E)', borderRadius: 26, padding: 'clamp(30px, 4vw, 52px)', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <span className="nh-hero-glow" style={{ width: 280, height: 280, left: '50%', top: -160, transform: 'translateX(-50%)', background: 'rgba(212,168,67,.16)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.6vw, 36px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 14px' }}>Bugün ücretsiz başlayın</h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.78)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 30px' }}>
                Profilinizi ekleyin veya sahiplenin; HekimKart’ınızı oluşturun, randevu almaya ve markanızı büyütmeye hemen başlayın.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/katil" className="nh-cta nh-cta-gold">
                  İşletmenizi Ekleyin
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/giris" className="nh-cta nh-cta-ghost">Giriş Yap</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
