import Link from 'next/link';

export default function Footer() {
  const PLATFORM = [
    ['🔍 Doktor Ara',        '/doktorlar'],
    ['🦷 Diş Klinikleri',    '/klinikler'],
    ['🏥 Hastaneler',        '/hastaneler'],
    ['💊 Eczaneler',         '/eczaneler'],
    ['🩺 Hastalık Rehberi',  '/hastaliklar'],
    ['➕ İşletme Ekleyin',   '/katil'],
  ];

  const SIRKET = [
    ['Hakkımızda',   '/hakkimizda'],
    ['Blog',         '/blog'],
    ['İletişim',     '/iletisim'],
  ];

  const YASAL = [
    ['Gizlilik Politikası', '/gizlilik'],
    ['Kullanım Şartları',   '/kullanim'],
    ['KVKK',                '/kvkk'],
    ['Çerez Politikası',    '/cerez'],
  ];

  return (
    <footer style={{
      background: 'var(--navy)',
      color: 'rgba(255,255,255,0.7)',
      padding: '52px 0 24px',
      marginTop: '80px',
    }}>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
          }
        }
      `}</style>
      <div className="container">
        <div className="footer-grid">

          {/* Marka + bülten */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'rgba(212,168,67,0.2)',
                borderRadius: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
              }}>🦷</div>
              <span style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '22px', fontWeight: 800, color: 'white',
              }}>Hekimhane</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: 20, maxWidth: 240 }}>
              Türkiye'nin en kapsamlı sağlık rehberi. Doktor, klinik ve eczane bilgilerini tek platformda bulun.
            </p>
            {/* Bülten */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,.15)',
                  background: 'rgba(255,255,255,.08)', color: 'white', fontSize: 12,
                  fontFamily: 'inherit', outline: 'none', minWidth: 0,
                }}
              />
              <button style={{
                padding: '9px 14px', borderRadius: 9, background: 'var(--gold)',
                color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                Abone Ol
              </button>
            </div>
            {/* Sosyal medya */}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {[
                { icon: 'fa-instagram',   href: '#' },
                { icon: 'fa-twitter',     href: '#' },
                { icon: 'fa-linkedin-in', href: '#' },
                { icon: 'fa-youtube',     href: '#' },
              ].map(s => (
                <a key={s.icon} href={s.href}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>
                  <i className={`fab ${s.icon}`} style={{ fontSize: 14 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Platform
            </h4>
            {PLATFORM.map(([label, href]) => (
              <Link key={href} href={href} style={{
                display: 'block', fontSize: '13px', marginBottom: '9px',
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Şirket */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Şirket
            </h4>
            {SIRKET.map(([label, href]) => (
              <Link key={href} href={href} style={{
                display: 'block', fontSize: '13px', marginBottom: '9px',
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Yasal */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Yasal
            </h4>
            {YASAL.map(([label, href]) => (
              <Link key={href} href={href} style={{
                display: 'block', fontSize: '13px', marginBottom: '9px',
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              }}>
                {label}
              </Link>
            ))}
          </div>

        </div>

        {/* Alt çizgi */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>
            © {new Date().getFullYear()} Hekimhane — hekimhane.com.tr — Tüm hakları saklıdır.
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'rgba(255,255,255,.3)' }}>
            <span>🇹🇷 Türkiye</span>
            <span>•</span>
            <span>Sağlıkta Güvenilir Rehber</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
