import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--navy)',
      color: 'rgba(255,255,255,0.7)',
      padding: '48px 0 24px',
      marginTop: '80px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Marka */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'rgba(212,168,67,0.2)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>🦷</div>
              <span style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '20px', fontWeight: 800, color: 'white'
              }}>Hekimhane</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Türkiye'nin en kapsamlı sağlık rehberi.
            </p>
          </div>

          {/* Kategoriler */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>
              Kategoriler
            </h4>
            {[
              ['Klinikler', '/klinikler'],
              ['Hastaneler', '/hastaneler'],
              ['Doktorlar', '/doktorlar'],
              ['Eczaneler', '/eczaneler'],
            ].map(([label, href]) => (
              <Link key={href} href={href} style={{
                display: 'block', fontSize: '13px', marginBottom: '8px',
                color: 'rgba(255,255,255,0.65)',
                transition: '0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Kurumsal */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>
              Kurumsal
            </h4>
            {[
              ['Hakkımızda', '/hakkimizda'],
              ['İletişim', '/iletisim'],
              ['Blog', '/blog'],
              ['İşletmenizi Ekleyin', '/katil'],
            ].map(([label, href]) => (
              <Link key={href} href={href} style={{
                display: 'block', fontSize: '13px', marginBottom: '8px',
                color: 'rgba(255,255,255,0.65)',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span style={{ fontSize: '12px' }}>
            © {new Date().getFullYear()} Hekimhane. Tüm hakları saklıdır.
          </span>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
            <Link href="/gizlilik" style={{ color: 'rgba(255,255,255,0.5)' }}>Gizlilik Politikası</Link>
            <Link href="/kullanim" style={{ color: 'rgba(255,255,255,0.5)' }}>Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
