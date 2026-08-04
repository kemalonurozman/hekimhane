import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Footer() {
  const PLATFORM = [
    ['Diş Klinikleri',       '/klinikler'],
    ['Diş Hekimleri',        '/dis-hekimleri'],
    ['Ağız & Diş Sağlığı',   '/hastaliklar/dis-sagligi'],
    ['2026 Tedavi Ücretleri', '/tedavi-ucretleri'],
    ['HekimKart',            '/hekimkart'],
    ['Randevu Modülü',       '/randevu-modulu'],
    ['HekimAI',              '/hekim-ai'],
    ['Karşılaştır',          '/karsilastir'],
    ['Blog',                 '/blog'],
    ['Kliniğinizi Ekleyin',  '/katil'],
  ];

  // Diş dışı sağlık hizmetleri — ikincil, yalnızca footer'da
  const DIGER_SAGLIK = [
    ['Devlet Diş Hastaneleri', '/devlet-dis-hastaneleri'],
    ['Bobath Terapistleri', '/bobath-terapistleri'],
    ['Diğer Doktorlar', '/doktorlar'],
    ['Hastaneler',      '/hastaneler'],
    ['Eczaneler',       '/eczaneler'],
    ['Yakın Eczane',    '/yakin-eczane'],
  ];

  const SIRKET = [
    ['Hakkımızda',   '/hakkimizda'],
    ['Blog',         '/blog'],
    ['Makale Yayınla', '/makale-yayinla'],
    ['İletişim',     '/iletisim'],
  ];

  const YASAL = [
    ['Gizlilik Politikası', '/gizlilik'],
    ['Kullanım Şartları',   '/kullanim'],
    ['KVKK',                '/kvkk'],
    ['Çerez Politikası',    '/cerez'],
  ];

  // SEO iç-linkleme: popüler şehirler + diş tedavileri
  const POPULER_SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Muğla', 'Bursa', 'Adana', 'Konya', 'Zonguldak', 'Trabzon', 'Eskişehir', 'Kayseri', 'Bartın', 'Karabük'];
  const POPULER_TEDAVILER: [string, string][] = [
    ['İmplant Tedavisi', 'İmplantoloji (İmplant)'],
    ['Ortodonti (Diş Teli)', 'Ortodonti (Diş Teli)'],
    ['Çocuk Diş Hekimliği', 'Pedodonti (Çocuk Diş Hekimliği)'],
    ['Ağız Diş ve Çene Cerrahisi', 'Ağız Diş ve Çene Cerrahisi'],
    ['Estetik Diş Hekimliği', 'Estetik Diş Hekimliği'],
    ['Kanal Tedavisi', 'Endodonti (Kanal Tedavisi)'],
    ['Diş Dolgusu', 'Restoratif Diş Tedavisi (Dolgu)'],
    ['Genel Diş Hekimliği', 'Genel Diş Hekimliği'],
  ];
  const chip = {
    fontSize: '12px', color: 'rgba(255,255,255,.6)', textDecoration: 'none',
    padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.1)', whiteSpace: 'nowrap' as const,
  };

  // Sosyal hesaplar — href boşken ilgili ikon gizlenir. Hesap açıldıkça doldurun.
  const SOCIAL = [
    { icon: 'fa-instagram',   href: '', label: 'Instagram' },
    { icon: 'fa-x-twitter',   href: '', label: 'X (Twitter)' },
    { icon: 'fa-linkedin-in', href: '', label: 'LinkedIn' },
    { icon: 'fa-youtube',     href: '', label: 'YouTube' },
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
          grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr;
          gap: 36px;
          margin-bottom: 48px;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 32px;
          }
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

        {/* SEO iç-linkleme bandı: popüler şehirler + diş tedavileri */}
        <div style={{ marginBottom: 40, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.8px' }}>
            Şehre Göre Diş Klinikleri
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {POPULER_SEHIRLER.map(c => (
              <Link key={c} href={`/klinikler?il=${encodeURIComponent(c)}`} style={chip}>{c} Diş Klinikleri</Link>
            ))}
          </div>
          <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.8px' }}>
            Diş Tedavileri
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULER_TEDAVILER.map(([label, spec]) => (
              <Link key={spec} href={`/klinikler?uzmanlik=${encodeURIComponent(spec)}`} style={chip}>{label}</Link>
            ))}
          </div>
        </div>

        <div className="footer-grid">

          {/* Marka + bülten */}
          <div className="footer-brand-col">
            <div style={{ marginBottom: '14px' }}>
              <Logo size={38} dark />
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: 20, maxWidth: 240 }}>
              Türkiye'nin diş sağlığı rehberi. Size en yakın diş kliniğini ve uzman diş hekimini tek platformda bulun.
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
            {/* İletişim — bize ulaşın (iletişim formu) */}
            <Link href="/iletisim" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 13, fontWeight: 600, color: 'var(--gold)', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
              Bize ulaşın · İletişim formu
            </Link>
            {/* Sosyal medya — yalnızca gerçek hesap linki girildiğinde görünür.
                Hesaplar açıldıkça href'leri doldurun (ör. 'https://instagram.com/hekimhane'). */}
            {SOCIAL.some(s => s.href) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {SOCIAL.filter(s => s.href).map(s => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>
                    <i className={`fab ${s.icon}`} style={{ fontSize: 14 }} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Platform
            </h4>
            {PLATFORM.map(([label, href]) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 7, fontSize: '13px', marginBottom: '9px',
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              }}>
                {label}
                {href === '/hekim-ai' && (
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#0F2A55', background: 'linear-gradient(135deg,#EBC65D,#D4A843)', borderRadius: 6, padding: '2px 6px', lineHeight: 1.3 }}>
                    Çok Yakında
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Diğer sağlık — diş dışı branşlar */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Diğer Sağlık
            </h4>
            {DIGER_SAGLIK.map(([label, href]) => (
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
            <Link href="/site-haritasi" style={{ display: 'block', fontSize: '13px', marginBottom: '9px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              Site Haritası
            </Link>
            <a href="/rss.xml" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '13px', marginBottom: '9px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <i className="fa-solid fa-rss" style={{ fontSize: 11, color: 'var(--gold)' }} /> RSS
            </a>
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
            <span>Türkiye</span>
            <span>•</span>
            <span>Diş Sağlığında Güvenilir Rehber</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
