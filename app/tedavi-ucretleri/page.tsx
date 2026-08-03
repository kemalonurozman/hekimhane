import type { Metadata } from 'next';
import Link from 'next/link';
import { UCRET_TARIFESI_2026, TARIFE_ITEM_SAYISI } from '@/lib/ucret-tarifesi-2026';
import { TEDAVI_DETAYLARI } from '@/lib/tedavi-detaylari';
import TarifeInteractive from './TarifeInteractive';

const BASE = 'https://www.hekimhane.com.tr';

export const metadata: Metadata = {
  title: '2026 Diş Tedavi Ücretleri — TDB Taban Fiyat Tarifesi',
  description: 'Türk Dişhekimleri Birliği (TDB) 2026 ağız ve diş sağlığı muayene ve tedavi ücret tarifesi. Dolgu, kanal tedavisi, implant, diş çekimi, ortodonti ve tüm işlemlerin KDV dahil/hariç taban fiyatları. Ara, karşılaştır.',
  keywords: ['diş tedavi fiyatları 2026', 'diş hekimi ücret tarifesi', 'TDB 2026 fiyat listesi', 'kanal tedavisi fiyatı', 'implant fiyatı', 'dolgu fiyatı', 'diş çekimi ücreti', 'ortodonti fiyatı'],
  alternates: { canonical: `${BASE}/tedavi-ucretleri` },
  openGraph: {
    title: '2026 Diş Tedavi Ücretleri — TDB Taban Fiyat Tarifesi | Hekimhane',
    description: 'TDB 2026 diş tedavi ücret tarifesi — tüm işlemlerin KDV dahil taban fiyatları. Ara ve karşılaştır.',
    url: `${BASE}/tedavi-ucretleri`,
    type: 'website',
  },
};

export default function TedaviUcretleriPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE },
          { '@type': 'ListItem', position: 2, name: '2026 Diş Tedavi Ücretleri', item: `${BASE}/tedavi-ucretleri` },
        ],
      },
      {
        '@type': 'WebPage',
        name: '2026 Diş Tedavi Ücretleri — TDB Taban Fiyat Tarifesi',
        url: `${BASE}/tedavi-ucretleri`,
        description: 'Türk Dişhekimleri Birliği 2026 ağız ve diş sağlığı tedavi ücret tarifesi.',
      },
    ],
  };

  return (
    <div style={{ paddingTop: 66, minHeight: '100vh', background: '#F5F4F0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECE8E0', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 500 }}>Ana Sayfa</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 8, lineHeight: '20px' }} />
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>Diş Tedavi Ücretleri</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECE8E0', padding: 'clamp(30px,6vw,52px) 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, margin: '0 auto 18px', background: 'linear-gradient(150deg,#1B3A69,#274d86)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(27,58,105,.22)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-light)', color: '#9A7B1F', border: '1px solid rgba(212,168,67,.35)', borderRadius: 20, padding: '4px 12px', fontSize: 11.5, fontWeight: 800, letterSpacing: '.6px', marginBottom: 14 }}>
            2026 TABAN FİYATLARI
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(24px,5vw,34px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px', margin: '0 0 10px' }}>
            Diş Tedavi Ücretleri
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
            Türk Dişhekimleri Birliği (TDB) 2026 ağız ve diş sağlığı muayene ve tedavi ücret tarifesi. {TARIFE_ITEM_SAYISI} işlemin taban (asgari) fiyatları.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 860, padding: 'clamp(24px,5vw,40px) clamp(16px,4vw,32px)' }}>
        {/* Popüler tedaviler — detay sayfaları */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px', margin: '0 0 12px' }}>Popüler Tedaviler — Detaylı Bilgi</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {TEDAVI_DETAYLARI.map(t => (
              <Link key={t.slug} href={`/tedavi-ucretleri/${t.slug}`} style={{ display: 'block', padding: '13px 15px', borderRadius: 13, border: '1px solid #EAE6DE', textDecoration: 'none', background: 'white' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{t.ad}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t.kategori}</div>
              </Link>
            ))}
          </div>
        </div>

        <TarifeInteractive kategoriler={UCRET_TARIFESI_2026} toplam={TARIFE_ITEM_SAYISI} />

        {/* Yasal not */}
        <div style={{ background: '#F7F5F0', border: '1px solid #EAE6DE', borderRadius: 14, padding: '16px 18px', marginTop: 20, display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <i className="fa-solid fa-circle-info" style={{ color: 'var(--gold)', marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
            Bu liste <strong>Türk Dişhekimleri Birliği&apos;nin (TDB) 2026 yılı için belirlediği taban (asgari) ücret tarifesidir</strong>.
            Hekim, klinik ve şehir bazında fiyatlar bu taban değerlerin üzerinde olabilir; kesin ücret için ilgili diş hekimine/kliniğe danışın.
            Fiyatlar bilgilendirme amaçlıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
