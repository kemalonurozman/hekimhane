import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TEDAVI_DETAYLARI, TEDAVI_SLUGS, tedaviBySlug } from '@/lib/tedavi-detaylari';
import { UCRET_TARIFESI_2026 } from '@/lib/ucret-tarifesi-2026';

const BASE = 'https://www.hekimhane.com.tr';

function fiyatByKod(kod: string): { ad: string; kdvDahil: string; kdvHaric: string } | null {
  for (const k of UCRET_TARIFESI_2026) {
    const it = k.items.find(i => i.kod === kod);
    if (it) return { ad: it.ad, kdvDahil: it.kdvDahil, kdvHaric: it.kdvHaric };
  }
  return null;
}

export function generateStaticParams() {
  return TEDAVI_SLUGS.map(slug => ({ slug }));
}

interface Props { params: { slug: string } }

export function generateMetadata({ params }: Props): Metadata {
  const t = tedaviBySlug(params.slug);
  if (!t) return { title: 'Tedavi Bulunamadı' };
  const url = `${BASE}/tedavi-ucretleri/${t.slug}`;
  return {
    title: `${t.ad} — Nedir, Nasıl Yapılır, 2026 Fiyatları`,
    description: t.ozet,
    keywords: [t.ad, `${t.ad} fiyatı`, `${t.ad} 2026`, `${t.ad} nedir`, 'diş tedavi fiyatları'],
    alternates: { canonical: url },
    openGraph: { title: `${t.ad} — Nedir, Nasıl Yapılır | Hekimhane`, description: t.ozet, url, type: 'article' },
  };
}

export default function TedaviDetayPage({ params }: Props) {
  const t = tedaviBySlug(params.slug);
  if (!t) notFound();
  const fiyat = fiyatByKod(t.tarifeKod);
  const ilgili = t.ilgili.map(tedaviBySlug).filter(Boolean) as NonNullable<ReturnType<typeof tedaviBySlug>>[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Diş Tedavi Ücretleri', item: `${BASE}/tedavi-ucretleri` },
        { '@type': 'ListItem', position: 3, name: t.ad, item: `${BASE}/tedavi-ucretleri/${t.slug}` },
      ]},
      { '@type': 'FAQPage', mainEntity: t.sss.map(f => ({ '@type': 'Question', name: f.soru, acceptedAnswer: { '@type': 'Answer', text: f.cevap } })) },
    ],
  };

  const sec: React.CSSProperties = { background: 'white', borderRadius: 18, border: '1px solid #EAE6DE', padding: 'clamp(18px,4vw,26px)', marginBottom: 16 };
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', margin: '0 0 12px' };

  return (
    <div style={{ paddingTop: 66, minHeight: '100vh', background: '#F5F4F0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECE8E0', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 500 }}>Ana Sayfa</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 8, lineHeight: '20px' }} />
          <Link href="/tedavi-ucretleri" style={{ color: 'var(--navy)', fontWeight: 500 }}>Diş Tedavi Ücretleri</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 8, lineHeight: '20px' }} />
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{t.ad}</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECE8E0', padding: 'clamp(26px,5vw,40px) 0' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-light)', color: '#9A7B1F', border: '1px solid rgba(212,168,67,.35)', borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 800, letterSpacing: '.5px', marginBottom: 12 }}>{t.kategori}</div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(24px,5vw,34px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px', margin: '0 0 10px' }}>{t.ad}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 640, lineHeight: 1.65, margin: 0 }}>{t.ozet}</p>
          {fiyat && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 18, background: '#F7F5F0', border: '1px solid #EAE6DE', borderRadius: 13, padding: '11px 16px' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>TDB 2026 taban ücreti</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>{fiyat.kdvDahil} <span style={{ fontSize: 12 }}>TL</span></span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>(KDV dahil)</span>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ maxWidth: 820, padding: 'clamp(22px,5vw,36px) clamp(16px,4vw,32px)' }}>
        {/* Nedir */}
        <div style={sec}>
          <h2 style={h2}>{t.ad} Nedir?</h2>
          <p style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.75, margin: 0 }}>{t.nedir}</p>
        </div>

        {/* Ne zaman gerekir */}
        <div style={sec}>
          <h2 style={h2}>Ne Zaman Gerekir?</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {t.neZaman.map((x, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6 9 17l-5-5" /></svg>
                {x}
              </li>
            ))}
          </ul>
        </div>

        {/* Süreç */}
        <div style={sec}>
          <h2 style={h2}>Nasıl Yapılır? (Tedavi Süreci)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {t.surec.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 13 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--navy)', color: 'white', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.baslik}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.55 }}>{s.aciklama}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid #F0ECE4', fontSize: 13, color: 'var(--muted)' }}>
            <i className="fa-regular fa-clock" style={{ color: 'var(--gold)' }} /> <strong style={{ color: 'var(--text)' }}>Süre:</strong> {t.sure}
          </div>
        </div>

        {/* Sonrası */}
        {t.sonrasi.length > 0 && (
          <div style={sec}>
            <h2 style={h2}>Tedavi Sonrası & Dikkat Edilecekler</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {t.sonrasi.map((x, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--navy)', flexShrink: 0 }}>•</span>{x}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SSS */}
        <div style={sec}>
          <h2 style={h2}>Sık Sorulan Sorular</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {t.sss.map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{f.soru}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>{f.cevap}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — hekim bul */}
        <div style={{ background: 'linear-gradient(150deg,#0F2A55,#1B3A69)', borderRadius: 20, padding: 'clamp(22px,5vw,30px)', textAlign: 'center', color: 'white', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>{t.ad} için diş hekimi bulun</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', maxWidth: 440, margin: '0 auto 18px', lineHeight: 1.6 }}>Size en yakın kliniği inceleyin, yorumları okuyun ve online randevu alın.</p>
          <Link href="/klinikler" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: 'white', padding: '12px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            <i className="fa-solid fa-magnifying-glass" /> Diş Hekimi Ara
          </Link>
        </div>

        {/* İlgili tedaviler */}
        {ilgili.length > 0 && (
          <div style={sec}>
            <h2 style={h2}>İlgili Tedaviler</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {ilgili.map(r => (
                <Link key={r.slug} href={`/tedavi-ucretleri/${r.slug}`} style={{ display: 'block', padding: '13px 15px', borderRadius: 12, border: '1px solid #EAE6DE', textDecoration: 'none', background: '#FAF9F5' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{r.ad}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{r.kategori}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7, marginTop: 8 }}>
          Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye yerine geçmez. Fiyatlar TDB 2026 taban tarifesidir; kesin ücret için hekiminize danışın.
        </p>
      </div>
    </div>
  );
}
