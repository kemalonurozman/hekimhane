import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UZMANLIK_REHBERLERI, rehberBySlug } from '@/lib/uzmanlik-rehberleri';
import { DENTAL_PROBLEMS } from '@/lib/uzmanlik-data';
import { toSlug } from '@/lib/helpers';

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return UZMANLIK_REHBERLERI.map(r => ({ slug: r.slug }));
}

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = rehberBySlug(params.slug);
  if (!r) return { title: 'Sayfa Bulunamadı' };
  const url = `https://www.hekimhane.com.tr/uzmanlik/${r.slug}`;
  const desc = `${r.ad}: nedir, ne zaman gerekir, süreç ve sık sorulan sorular. ${r.ozet} Türkiye genelinde ${r.kisaAd.toLowerCase()} yapan diş klinikleri Hekimhane'de.`;
  return {
    title: `${r.ad} — Nedir, Ne Zaman Gerekir? | Hekimhane`,
    description: desc,
    keywords: [r.kisaAd, `${r.kisaAd.toLowerCase()} nedir`, `${r.kisaAd.toLowerCase()} rehberi`, r.spec, 'diş kliniği', 'diş hekimi'],
    alternates: { canonical: url },
    openGraph: { title: `${r.ad} | Hekimhane`, description: desc, url, type: 'article' },
  };
}

const KART: React.CSSProperties = { background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: '26px 28px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' };
const H2: React.CSSProperties = { fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px' };
const chip: React.CSSProperties = { padding: '8px 14px', borderRadius: 20, background: 'white', border: '1px solid var(--border)', color: 'var(--navy)', fontSize: 13, fontWeight: 600, textDecoration: 'none' };

const BUYUK_SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];

export default function UzmanlikRehberPage({ params }: Props) {
  const r = rehberBySlug(params.slug);
  if (!r) notFound();

  const ilgiliProblemler = (r.ilgiliProblemler || [])
    .map(ps => DENTAL_PROBLEMS.find(p => p.slug === ps))
    .filter(Boolean) as { slug: string; ad: string }[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
          { '@type': 'ListItem', position: 2, name: 'Uzmanlık Rehberleri', item: 'https://www.hekimhane.com.tr/uzmanlik' },
          { '@type': 'ListItem', position: 3, name: r.kisaAd, item: `https://www.hekimhane.com.tr/uzmanlik/${r.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: r.sss.map(s => ({ '@type': 'Question', name: s.soru, acceptedAnswer: { '@type': 'Answer', text: s.cevap } })),
      },
    ],
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '48px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 16, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/uzmanlik" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Uzmanlık Rehberleri</Link><span>›</span>
            <span style={{ color: 'white' }}>{r.kisaAd}</span>
          </nav>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--navy)', background: 'var(--gold)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>Uzmanlık Rehberi</span>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: 'white', lineHeight: 1.2, margin: '0 0 12px' }}>{r.ad}</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, maxWidth: 700, margin: 0 }}>{r.ozet}</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 820, padding: '36px 16px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <section style={KART}>
          <h2 style={H2}>{r.kisaAd} Nedir?</h2>
          <p style={{ fontSize: 15, color: '#3A3A3C', lineHeight: 1.75, margin: 0 }}>{r.nedir}</p>
        </section>

        <section style={KART}>
          <h2 style={H2}>Ne Zaman Gerekir?</h2>
          <ul style={{ margin: 0, paddingLeft: 4, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {r.neZaman.map((n, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: '#3A3A3C', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>{n}
              </li>
            ))}
          </ul>
        </section>

        <section style={KART}>
          <h2 style={H2}>Tedavi Süreci</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {r.surec.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < r.surec.length - 1 ? 18 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  {i < r.surec.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 3 }}>{s.baslik}</div>
                  <div style={{ fontSize: 14, color: '#3A3A3C', lineHeight: 1.6 }}>{s.aciklama}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...KART, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0, color: 'var(--navy)', marginTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>Fiyat Hakkında</div>
            <p style={{ fontSize: 14.5, color: '#3A3A3C', lineHeight: 1.65, margin: 0 }}>{r.fiyatNot}</p>
          </div>
        </section>

        {/* Klinik bulma CTA */}
        <section style={{ ...KART, background: 'linear-gradient(135deg,#F0F6FF,#EAF1FD)', border: '1px solid #DCE6F4' }}>
          <h2 style={H2}>{r.kisaAd} Yapan Diş Klinikleri</h2>
          <p style={{ fontSize: 14.5, color: '#3A3A3C', lineHeight: 1.65, margin: '0 0 14px' }}>
            Bulunduğunuz şehirdeki {r.kisaAd.toLowerCase()} kliniklerini puan ve hasta yorumlarıyla karşılaştırın.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 14 }}>
            {BUYUK_SEHIRLER.map(c => (
              <Link key={c} href={`/dis-tedavileri/${toSlug(c)}/${toSlug(r.spec)}`} style={chip}>{c} {r.kisaAd}</Link>
            ))}
          </div>
          <Link href={`/klinikler?uzmanlik=${encodeURIComponent(r.spec)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--navy)', color: 'white', fontSize: 14, fontWeight: 700, borderRadius: 11, padding: '11px 20px', textDecoration: 'none' }}>
            Tüm {r.kisaAd.toLowerCase()} kliniklerini gör →
          </Link>
        </section>

        {/* SSS */}
        <section style={KART}>
          <h2 style={H2}>Sık Sorulan Sorular</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {r.sss.map((s, i) => (
              <div key={i} style={{ borderBottom: i < r.sss.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < r.sss.length - 1 ? 16 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{s.soru}</div>
                <div style={{ fontSize: 14.5, color: '#3A3A3C', lineHeight: 1.65 }}>{s.cevap}</div>
              </div>
            ))}
          </div>
        </section>

        {/* İlgili problemler */}
        {ilgiliProblemler.length > 0 && (
          <section style={KART}>
            <h2 style={H2}>İlgili Diş Sağlığı Şikâyetleri</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {ilgiliProblemler.map(p => (
                <Link key={p.slug} href={`/dis-tedavileri/istanbul/${p.slug}`} style={chip}>{p.ad}</Link>
              ))}
            </div>
          </section>
        )}

        {/* Diğer uzmanlıklar */}
        <section style={{ ...KART, background: 'transparent', border: 'none', boxShadow: 'none', padding: '4px 0' }}>
          <h2 style={{ ...H2, fontSize: 17 }}>Diğer Uzmanlık Rehberleri</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {UZMANLIK_REHBERLERI.filter(x => x.slug !== r.slug).map(x => (
              <Link key={x.slug} href={`/uzmanlik/${x.slug}`} style={chip}>{x.kisaAd}</Link>
            ))}
          </div>
        </section>

        <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
          Bu içerik genel bilgilendirme amaçlıdır ve diş hekimi muayenesinin yerini tutmaz. Şikâyetiniz için bir diş hekimine başvurun.
        </p>
      </div>
    </main>
  );
}
