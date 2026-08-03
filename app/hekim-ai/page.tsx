import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HekimAI — Yapay Zekâ Randevu Asistanı (Çok Yakında) | Hekimhane',
  description:
    'HekimAI; hastalarınızın bir çalışana ihtiyaç duymadan, sistemle doğal biçimde konuşarak 7/24 randevu almasını sağlayan yapay zekâ randevu asistanı. Çok yakında Hekimhane’de.',
  keywords: ['yapay zeka randevu', 'diş hekimi ai asistan', 'otomatik randevu sistemi', 'HekimAI', 'sesli randevu asistanı'],
  alternates: { canonical: 'https://www.hekimhane.com.tr/hekim-ai' },
  openGraph: {
    title: 'HekimAI — Yapay Zekâ Randevu Asistanı (Çok Yakında)',
    description: 'Hastalarınız sistemle konuşarak, bir çalışana ihtiyaç duymadan 7/24 randevu alsın. Çok yakında Hekimhane’de.',
    url: 'https://www.hekimhane.com.tr/hekim-ai',
    type: 'website',
  },
};

const IC: Record<string, React.ReactNode> = {
  ai:     <><rect x="4" y="5" width="16" height="14" rx="4" /><path d="M9 10h.01M15 10h.01M9 14.5c1 .9 5 .9 6 0 M12 2v3 M2 11h2 M20 11h2" /></>,
  clock:  <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  phone:  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  chat:   <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z M8 9h8 M8 13h5" />,
  rules:  <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  globe:  <><circle cx="12" cy="12" r="9" /><path d="M3 12h18 M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></>,
  chart:  <path d="M3 3v18h18 M7 15l3-3 3 3 5-6" />,
  card:   <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20 M6 15h4" /></>,
  bolt:   <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
  check:  <path d="M20 6L9 17l-5-5" />,
};

function Icon({ name, size = 22, color = '#1B3A69', stroke = 2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {IC[name]}
    </svg>
  );
}

const NAVY = '#1B3A69', GOLD = '#D4A843', TEXT = '#1c1c1e', MUTED = '#6E6E73', BORDER = '#E5E5EA';

const FEATURES = [
  { icon: 'phone',  title: 'Hiçbir Talebi Kaçırmayın', text: 'Aynı anda birden fazla aramayı ve talebi karşılar; menü ve bekleme derdi olmadan her talebi randevuya dönüştürür.' },
  { icon: 'clock',  title: '7/24 Randevu', text: 'Ofisiniz kapalıyken bile hastalarınız gece gündüz randevu alabilir. Hasta kaybını en aza indirin.' },
  { icon: 'chat',   title: 'Doğal Konuşmayla Randevu', text: 'Hastanız bir çalışana ihtiyaç duymadan, robot menülere takılmadan doğal bir dille konuşarak randevusunu oluşturur.' },
  { icon: 'rules',  title: 'Sizin Kurallarınıza Göre', text: 'Uzmanlığınıza ve çalışma düzeninize özel kurallar tanımlayın; HekimAI yalnızca uygun boşluklara randevu verir.' },
  { icon: 'globe',  title: 'Çok Dilli Destek', text: 'Hastalarınız tercih ettikleri dilde iletişim kurabilir; kimseyi geri çevirmeyin.' },
  { icon: 'chart',  title: 'Çağrı Özeti & Raporları', text: 'Her görüşmenin özeti panelinize düşer; talep hacmini ve nedenlerini zaman içinde takip edin.' },
  { icon: 'card',   title: 'HekimKart ile Web’den Randevu', text: 'HekimKart sayfanızdan gelen ziyaretçiler tek dokunuşla, anında müsaitliğinizi görüp randevu alır.' },
  { icon: 'bolt',   title: 'Panelinizle Entegre', text: 'Randevular doğrudan Hekimhane panelinize yazılır; ayrı bir sistem kurmanıza gerek kalmaz.' },
];

const STEPS = [
  { n: '1', title: 'Hasta ulaşır', text: 'Hastanız telefonla arar ya da HekimKart sayfanızdan randevu ister.' },
  { n: '2', title: 'HekimAI konuşur', text: 'Yapay zekâ asistan doğal dille görüşür, ihtiyacı anlar ve kurallarınıza göre uygun saati bulur.' },
  { n: '3', title: 'Randevu oluşur', text: 'Onaylanan randevu doğrudan panelinize yazılır; özet ve bilgiler size iletilir.' },
];

export default function HekimAIPage() {
  return (
    <div style={{ paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', color: TEXT, background: '#fff' }}>
      <style>{`
        .ha-wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
        .ha-hero{position:relative;overflow:hidden;background:linear-gradient(155deg,#0B1F42 0%,#12305C 55%,#163D6E 100%);color:#fff;}
        .ha-glow{position:absolute;border-radius:50%;filter:blur(12px);opacity:.55;pointer-events:none;}
        .ha-cta{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-.2px;transition:transform .16s ease;}
        .ha-cta:hover{transform:translateY(-2px);}
        .ha-cta-gold{background:linear-gradient(135deg,#EBC65D,#D4A843);color:#0F2A55;box-shadow:0 10px 26px rgba(212,168,67,.4);}
        .ha-cta-ghost{background:rgba(255,255,255,.08);color:#fff;border:1.5px solid rgba(255,255,255,.28);}
        .ha-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .ha-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
        .ha-card{background:#fff;border:1px solid ${BORDER};border-radius:20px;padding:24px 22px;box-shadow:0 1px 4px rgba(0,0,0,.05);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;}
        .ha-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(15,42,85,.1);border-color:#D6DEEC;}
        .ha-ic{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#EEF3FB,#E3ECF9);margin-bottom:15px;}
        @media (max-width:940px){ .ha-grid{grid-template-columns:1fr 1fr;} }
        @media (max-width:760px){ .ha-steps{grid-template-columns:1fr;} }
        @media (max-width:520px){ .ha-grid{grid-template-columns:1fr;} }
      `}</style>

      {/* ── HERO ── */}
      <section className="ha-hero">
        <span className="ha-glow" style={{ width: 380, height: 380, right: -90, top: -140, background: 'rgba(212,168,67,.2)' }} />
        <span className="ha-glow" style={{ width: 320, height: 320, left: -110, bottom: -150, background: 'rgba(78,123,192,.3)' }} />
        <div className="ha-wrap" style={{ position: 'relative', zIndex: 1, padding: '84px 24px 92px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'linear-gradient(135deg,#EBC65D,#D4A843)', color: '#0F2A55', fontSize: 12, fontWeight: 800, letterSpacing: '1px', marginBottom: 24 }}>
            ÇOK YAKINDA
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
            <span style={{ width: 58, height: 58, borderRadius: 18, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="ai" size={30} color="#EBC65D" />
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5.6vw, 60px)', fontWeight: 800, letterSpacing: '-1.8px', lineHeight: 1, margin: 0 }}>HekimAI</h1>
          </div>
          <p style={{ fontSize: 'clamp(16px, 2.2vw, 21px)', lineHeight: 1.6, color: 'rgba(255,255,255,.85)', maxWidth: 740, margin: '0 auto 34px', fontWeight: 400 }}>
            Yapay zekâ randevu asistanınız. Hastalarınız <strong style={{ color: '#fff', fontWeight: 700 }}>bir çalışana ihtiyaç duymadan</strong>,
            sistemle doğal biçimde konuşarak 7/24 randevu alsın. Bekleme yok, kaçan çağrı yok.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/katil" className="ha-cta ha-cta-gold">
              İşletmenizi Ekleyin
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/neden-hekimhane" className="ha-cta ha-cta-ghost">Neden Hekimhane?</Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 18 }}>
            Hazır olduğunda, Hekimhane panelinizde otomatik olarak kullanımınıza sunulacak.
          </p>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="ha-wrap" style={{ padding: '72px 24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>Nasıl Çalışır?</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: 0 }}>Üç adımda, çalışan gerekmeden randevu</h2>
        </div>
        <div className="ha-steps">
          {STEPS.map(s => (
            <div key={s.n} style={{ background: '#F5F5F7', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '26px 24px', position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#12305C,#1B3A69)', color: '#EBC65D', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{s.n}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-.3px', margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section className="ha-wrap" style={{ padding: '52px 24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>Neler Yapabilir?</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.4vw, 34px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: 0 }}>Daha iyi randevu sonuçları için tasarlandı</h2>
        </div>
        <div className="ha-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="ha-card">
              <div className="ha-ic"><Icon name={f.icon} size={22} /></div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: TEXT, letterSpacing: '-.2px', margin: '0 0 7px' }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HEDEFİMİZ (dürüst; gerçek metrik iddiası yok) ── */}
      <section className="ha-wrap" style={{ padding: '56px 24px' }}>
        <div style={{ background: 'linear-gradient(150deg,#0B1F42,#163D6E)', borderRadius: 26, padding: 'clamp(30px, 4vw, 48px)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <span className="ha-glow" style={{ width: 260, height: 260, right: -60, bottom: -110, background: 'rgba(212,168,67,.18)' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#EBC65D', margin: '0 0 12px' }}>Hedefimiz</p>
            <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 30px)', fontWeight: 800, letterSpacing: '-.7px', lineHeight: 1.25, margin: '0 0 26px' }}>
              Bekleme süresini sıfıra indirmek, kaçan her talebi randevuya çevirmek
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              {['Kaçan çağrı ve talebi yakala', 'Ekibinizi rutin aramalardan kurtar', 'Hasta memnuniyetini yükselt', 'Randevuyu doğrudan panelinize yaz'].map(x => (
                <span key={x} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 999, padding: '9px 16px', fontSize: 14, fontWeight: 600 }}>
                  <Icon name="check" size={15} color="#4ADE80" stroke={3} />{x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── KAPANIŞ ── */}
      <section style={{ background: '#F5F5F7' }}>
        <div className="ha-wrap" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 15px', borderRadius: 999, background: 'linear-gradient(135deg,#EBC65D,#D4A843)', color: '#0F2A55', fontSize: 12, fontWeight: 800, letterSpacing: '1px', marginBottom: 18 }}>
            ÇOK YAKINDA
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3.6vw, 34px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: '0 0 14px' }}>HekimAI yolda</h2>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65, maxWidth: 600, margin: '0 auto 28px' }}>
            Şimdiden Hekimhane’de yerinizi alın; HekimAI hazır olana kadar, <strong style={{ color: NAVY }}>Randevu Modülü</strong> ile
            kendi sitenizden ve Hekimhane’den gelen tüm randevuları bugün tek panelde toplayın.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/katil" className="ha-cta ha-cta-gold">
              İşletmenizi Ekleyin
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/randevu-modulu" className="ha-cta ha-cta-ghost" style={{ background: '#fff', border: `1.5px solid ${BORDER}`, color: NAVY }}>Randevu Modülü</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
