import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Randevu Modülü — Her Yerden Randevu Alın | Hekimhane',
  description:
    'Kendi web sitenizden, HekimKart’ınızdan ve Hekimhane profilinizden gelen tüm randevu talepleri tek panelde buluşur. Randevu modülünü tek satır kodla sitenize ekleyin, her yerden randevu almaya başlayın.',
  keywords: ['randevu modülü', 'web sitesi randevu', 'diş kliniği online randevu', 'randevu iframe', 'siteme randevu ekle'],
  alternates: { canonical: 'https://www.hekimhane.com.tr/randevu-modulu' },
  openGraph: {
    title: 'Randevu Modülü — Her Yerden Randevu Alın',
    description: 'Kendi sitenizden ve Hekimhane’den gelen tüm randevular tek panelde. Tek satır kodla sitenize ekleyin.',
    url: 'https://www.hekimhane.com.tr/randevu-modulu',
    type: 'website',
  },
};

const IC: Record<string, React.ReactNode> = {
  code:   <path d="M16 18l6-6-6-6 M8 6l-6 6 6 6" />,
  card:   <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20 M6 15h4" /></>,
  globe:  <><circle cx="12" cy="12" r="9" /><path d="M3 12h18 M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></>,
  inbox:  <path d="M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />,
  bell:   <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />,
  wand:   <path d="M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M17.8 11.8 19 13 M15 9h0 M17.8 6.2 19 5 M12.2 6.2 11 5 M4 20l7-7" />,
  check:  <path d="M20 6L9 17l-5-5" />,
  arrow:  <path d="M5 12h14M12 5l7 7-7 7" />,
};

function Icon({ name, size = 22, color = '#1B3A69', stroke = 2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {IC[name]}
    </svg>
  );
}

const NAVY = '#1B3A69', GOLD = '#D4A843', TEXT = '#1c1c1e', MUTED = '#6E6E73', BORDER = '#E5E5EA';

const KAYNAKLAR = [
  { icon: 'globe', title: 'Kendi Web Siteniz', text: 'Tek satır kodla sitenize gömün.' },
  { icon: 'card',  title: 'HekimKart’ınız', text: 'Dijital kartvizitinizde hazır.' },
  { icon: 'inbox', title: 'Hekimhane Profiliniz', text: 'Rehberdeki profilinizden.' },
];

const FEATURES = [
  { icon: 'code',  title: 'Sitenize Gömün', text: 'Tek satırlık HTML kodunu WordPress, Wix ya da kendi sitenize yapıştırın — kod bilgisi gerekmez.' },
  { icon: 'card',  title: 'HekimKart’ta Hazır', text: 'Ücretsiz HekimKart sayfanızda randevu butonu baştan gelir; ayrıca kurmanıza gerek yok.' },
  { icon: 'inbox', title: 'Tek Panelde Buluşur', text: 'Hangi kaynaktan gelirse gelsin tüm talepler Hekimhane panelinizdeki Randevu Talepleri’ne düşer.' },
  { icon: 'bell',  title: 'Anında Bildirim', text: 'Her yeni talepte size ve ekibinize e-posta gider; hiçbir randevuyu kaçırmayın.' },
  { icon: 'globe', title: 'Her Yerde Çalışır', text: 'Web siteniz, blog, açılış sayfası — nereye koyarsanız oradan randevu toplar.' },
  { icon: 'wand',  title: 'Markanıza Uyar', text: 'Renk parametresiyle butonu markanıza uydurun; mobil uyumlu ve hızlı yüklenir.' },
];

const STEPS = [
  { n: '1', title: 'Panelden kodu kopyalayın', text: 'Profili Düzenle → “Siteme Ekle” sekmesinden işletmenize özel hazır kodu kopyalayın.' },
  { n: '2', title: 'Sitenize yapıştırın', text: 'Kodu web sitenizde randevu almak istediğiniz yere ekleyin. Teknik bilgi gerekmez.' },
  { n: '3', title: 'Randevular panele düşsün', text: 'Ziyaretçileriniz sizin sitenizden randevu bıraksın; talepler tek panelde toplansın.' },
];

const IFRAME_KODU = `<iframe src="https://www.hekimhane.com.tr/embed/randevu?type=doktor&id=..."
        width="100%" height="640" style="border:0;max-width:480px"></iframe>`;

export default function RandevuModuluPage() {
  return (
    <div style={{ paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', color: TEXT, background: '#fff' }}>
      <style>{`
        .rm-wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
        .rm-hero{position:relative;overflow:hidden;background:linear-gradient(155deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%);color:#fff;}
        .rm-glow{position:absolute;border-radius:50%;filter:blur(12px);opacity:.5;pointer-events:none;}
        .rm-cta{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-.2px;transition:transform .16s ease;}
        .rm-cta:hover{transform:translateY(-2px);}
        .rm-cta-gold{background:linear-gradient(135deg,#EBC65D,#D4A843);color:#0F2A55;box-shadow:0 10px 26px rgba(212,168,67,.4);}
        .rm-cta-ghost{background:rgba(255,255,255,.08);color:#fff;border:1.5px solid rgba(255,255,255,.28);}
        .rm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
        .rm-card{background:#fff;border:1px solid ${BORDER};border-radius:20px;padding:24px 22px;box-shadow:0 1px 4px rgba(0,0,0,.05);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;}
        .rm-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(15,42,85,.1);border-color:#D6DEEC;}
        .rm-ic{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#EEF3FB,#E3ECF9);margin-bottom:15px;}
        .rm-hub{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;}
        .rm-src{display:flex;flex-direction:column;gap:12px;}
        .rm-arrow-wrap{display:flex;align-items:center;justify-content:center;}
        @media (max-width:820px){
          .rm-grid{grid-template-columns:1fr;}
          .rm-hub{grid-template-columns:1fr;gap:14px;}
          .rm-arrow-wrap{transform:rotate(90deg);}
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="rm-hero">
        <span className="rm-glow" style={{ width: 380, height: 380, right: -90, top: -140, background: 'rgba(212,168,67,.2)' }} />
        <span className="rm-glow" style={{ width: 320, height: 320, left: -110, bottom: -150, background: 'rgba(78,123,192,.3)' }} />
        <div className="rm-wrap" style={{ position: 'relative', zIndex: 1, padding: '82px 24px 90px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 999, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', fontSize: 12, fontWeight: 800, letterSpacing: '1px', marginBottom: 24 }}>
            RANDEVU MODÜLÜ
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 5.2vw, 56px)', fontWeight: 800, letterSpacing: '-1.6px', lineHeight: 1.05, margin: '0 0 20px' }}>
            Her yerden randevu alın
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', lineHeight: 1.6, color: 'rgba(255,255,255,.84)', maxWidth: 720, margin: '0 auto 34px', fontWeight: 400 }}>
            Kendi web sitenizden, HekimKart’ınızdan ve Hekimhane profilinizden gelen tüm randevu talepleri
            <strong style={{ color: '#fff', fontWeight: 700 }}> tek panelde</strong> buluşur. Farklı yerlerden ve sayfalardan randevu almaya bugün başlayın.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/katil" className="rm-cta rm-cta-gold">İşletmenizi Ekleyin<Icon name="arrow" size={17} color="#0F2A55" stroke={2.4} /></Link>
            <Link href="/neden-hekimhane" className="rm-cta rm-cta-ghost">Neden Hekimhane?</Link>
          </div>
        </div>
      </section>

      {/* ── TEK PANEL DİYAGRAMI ── */}
      <section className="rm-wrap" style={{ padding: '72px 24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>Tek Merkez</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.4vw, 34px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: 0 }}>Tüm randevularınız aynı sistemde buluşur</h2>
        </div>
        <div className="rm-hub">
          <div className="rm-src">
            {KAYNAKLAR.map(k => (
              <div key={k.title} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#F5F5F7', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={k.icon} size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT }}>{k.title}</div>
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 1 }}>{k.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="rm-arrow-wrap">
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#EBC65D,#D4A843)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(212,168,67,.35)' }}>
              <Icon name="arrow" size={22} color="#0F2A55" stroke={2.6} />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(150deg,#0F2A55,#163D6E)', borderRadius: 20, padding: '28px 26px', color: '#fff', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="inbox" size={26} color="#EBC65D" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 6 }}>Hekimhane Paneli</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.6 }}>
              Tüm randevu talepleri “Randevu Talepleri” sekmesinde toplanır; her biri için size e-posta gider.
            </div>
          </div>
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section className="rm-wrap" style={{ padding: '56px 24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>Neden Kolay?</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.4vw, 34px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: 0 }}>Kurulumu dakikalar, etkisi kalıcı</h2>
        </div>
        <div className="rm-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="rm-card">
              <div className="rm-ic"><Icon name={f.icon} size={22} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-.2px', margin: '0 0 7px' }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NASIL EKLENİR ── */}
      <section className="rm-wrap" style={{ padding: '56px 24px' }}>
        <div style={{ background: '#F5F5F7', border: `1px solid ${BORDER}`, borderRadius: 26, padding: 'clamp(28px, 4vw, 44px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>Nasıl Eklenir?</p>
            <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 30px)', fontWeight: 800, letterSpacing: '-.8px', color: NAVY, margin: 0 }}>Üç adımda sitenizde</h2>
          </div>
          <div className="rm-grid" style={{ marginBottom: 26 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '22px 20px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#12305C,#1B3A69)', color: '#EBC65D', fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>{s.n}</div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: TEXT, margin: '0 0 7px', letterSpacing: '-.2px' }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#0F2A55', borderRadius: 14, padding: '16px 18px', overflowX: 'auto' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Örnek Kod</div>
            <pre style={{ margin: 0, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12.5, lineHeight: 1.6, color: '#DCE6F5', whiteSpace: 'pre' }}>{IFRAME_KODU}</pre>
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
            İşletmenize özel gerçek kodu, panelinizdeki <strong style={{ color: NAVY }}>“Siteme Ekle”</strong> sekmesinden tek tıkla kopyalarsınız.
          </p>
        </div>
      </section>

      {/* ── NERELERE ── */}
      <section className="rm-wrap" style={{ padding: '10px 24px 56px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 16 }}>Nerelere ekleyebilirsiniz?</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {['WordPress', 'Wix', 'Kendi web siteniz', 'Açılış sayfaları', 'Blog yazıları', 'Google İşletme profili'].map(x => (
            <span key={x} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F5F5F7', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '9px 16px', fontSize: 14, fontWeight: 600, color: TEXT }}>
              <Icon name="check" size={15} color="#059669" stroke={3} />{x}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#F5F5F7' }}>
        <div className="rm-wrap" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.6vw, 34px)', fontWeight: 800, letterSpacing: '-1px', color: NAVY, margin: '0 0 14px' }}>Farklı yerlerden randevu almaya başlayın</h2>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 28px' }}>
            Ücretsiz profilinizi oluşturun; randevu modülünü sitenize ekleyin, tüm talepleri tek panelde yönetin.
          </p>
          <Link href="/katil" className="rm-cta rm-cta-gold" style={{ boxShadow: '0 10px 26px rgba(212,168,67,.35)' }}>
            İşletmenizi Ekleyin<Icon name="arrow" size={17} color="#0F2A55" stroke={2.4} />
          </Link>
        </div>
      </section>
    </div>
  );
}
