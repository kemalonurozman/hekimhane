import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_YAZILARI, getBlogYazi, type BlogBlok } from '@/lib/blog-data';
import { supabase } from '@/lib/supabase';
import { parseGovde, okumaSuresi } from '@/lib/makale-icerik';

interface Props { params: { slug: string } }

// Statik yazılar önceden üretilir; panel/admin üzerinden yayınlananlar
// istek anında Supabase'den okunur (dynamicParams varsayılan olarak açık).
export function generateStaticParams() {
  return BLOG_YAZILARI.map(y => ({ slug: y.slug }));
}

export const revalidate = 300;

/** Statik veri + Supabase'i tek bir görünüm modeline indirger. */
interface Yazi {
  title: string;
  summary: string;
  category: string;
  author: string;
  created_at: string;
  okumaDk: number;
  govde: BlogBlok[];
  sponsorlu: boolean;
  website: string | null;
}

async function getYazi(slug: string): Promise<Yazi | null> {
  const statik = getBlogYazi(slug);
  if (statik) {
    return {
      title: statik.title, summary: statik.summary, category: statik.category,
      author: statik.author, created_at: statik.created_at, okumaDk: statik.okumaDk,
      govde: statik.govde, sponsorlu: false, website: null,
    };
  }

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    const p = data as any;
    if (!p) return null;
    // status kolonu varsa yalnızca yayında olanlar açılır
    if (p.status && p.status !== 'published') return null;

    return {
      title: p.title,
      summary: p.summary || '',
      category: p.category || 'Diş Sağlığı',
      author: p.entity_name || p.author || 'Hekimhane',
      created_at: p.created_at,
      okumaDk: p.okuma_dk || okumaSuresi(p.content || ''),
      govde: parseGovde(p.content || ''),
      sponsorlu: p.sponsorlu === true,
      website: p.website || null,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const y = await getYazi(params.slug);
  if (!y) return { title: 'Yazı Bulunamadı | Hekimhane' };
  const url = `https://www.hekimhane.com.tr/blog/${params.slug}`;
  return {
    title: `${y.title} | Hekimhane Blog`,
    description: y.summary,
    alternates: { canonical: url },
    openGraph: { title: y.title, description: y.summary, url, type: 'article' },
  };
}

const trTarih = (s: string) => {
  try { return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return s; }
};

export default async function BlogDetayPage({ params }: Props) {
  const y = await getYazi(params.slug);
  if (!y) notFound();

  const digerYazilar = BLOG_YAZILARI.filter(x => x.slug !== params.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: y.title,
    description: y.summary,
    author: { '@type': 'Organization', name: y.author },
    datePublished: y.created_at,
    publisher: { '@type': 'Organization', name: 'Hekimhane' },
    mainEntityOfPage: `https://www.hekimhane.com.tr/blog/${params.slug}`,
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '40px 0 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 18, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.65)' }}>Ana Sayfa</Link>
            <span style={{ fontSize: 8 }}>›</span>
            <Link href="/blog" style={{ color: 'rgba(255,255,255,.65)' }}>Blog</Link>
            <span style={{ fontSize: 8 }}>›</span>
            <span style={{ color: 'rgba(255,255,255,.9)' }}>{y.category}</span>
          </nav>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--navy)', background: 'var(--gold)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
            {y.category}
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
            {y.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'rgba(255,255,255,.7)', flexWrap: 'wrap' }}>
            <span>{y.author}</span>
            <span style={{ opacity: .5 }}>•</span>
            <span>{trTarih(y.created_at)}</span>
            <span style={{ opacity: .5 }}>•</span>
            <span>{y.okumaDk} dk okuma</span>
          </div>
        </div>
      </div>

      {/* Gövde */}
      <article className="container" style={{ maxWidth: 760, padding: '40px 32px 24px' }}>
        {y.sponsorlu && (
          <div style={{ background: '#FDF6E3', border: '1px solid #F0DFB4', borderRadius: 14, padding: '14px 18px', marginBottom: 26 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#B8860B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5 }}>
              İş Ortağı İçeriği
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
              Bu makale ticari bir iş ortağı ile iş birliği içinde hazırlanmıştır.
              İçerik, okuyucuya değer sunmak amacıyla düzenlenmiştir.
            </div>
          </div>
        )}

        <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text)', fontWeight: 500, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {y.summary}
        </p>
        {y.govde.map((b, i) => {
          if (b.tip === 'h') return <h2 key={i} style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: '30px 0 12px' }}>{b.metin}</h2>;
          if (b.tip === 'liste') return (
            <ul key={i} style={{ margin: '4px 0 18px', paddingLeft: 4, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {b.ogeler.map((o, j) => (
                <li key={j} style={{ display: 'flex', gap: 10, fontSize: 16, lineHeight: 1.6, color: 'var(--text)' }}>
                  <span style={{ flexShrink: 0, marginTop: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
                  {o}
                </li>
              ))}
            </ul>
          );
          return <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text)', marginBottom: 16 }}>{b.metin}</p>;
        })}

        {/* Yazarın sitesi — panel/iş ortağı makalelerinde */}
        {y.website && (
          <div style={{ marginTop: 26, background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>Bu yazı <strong style={{ color: 'var(--navy)' }}>{y.author}</strong> tarafından hazırlanmıştır.</span>
            <a href={y.website} target="_blank" rel="noopener" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)', textDecoration: 'none' }}>
              {y.website.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
        )}

        {/* Randevu CTA */}
        <div style={{ marginTop: 32, background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)', marginBottom: 4 }}>Diş hekimi mi arıyorsunuz?</div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Size en yakın uzman diş hekimini Hekimhane&apos;de bulun.</div>
          </div>
          <Link href="/dis-hekimleri" style={{ flexShrink: 0, padding: '11px 22px', borderRadius: 11, background: 'var(--navy)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Diş Hekimlerini Gör
          </Link>
        </div>
      </article>

      {/* Diğer yazılar */}
      {digerYazilar.length > 0 && (
        <section className="container" style={{ maxWidth: 900, padding: '24px 32px 64px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginBottom: 18 }}>Diğer Yazılar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {digerYazilar.map(o => (
              <Link key={o.slug} href={`/blog/${o.slug}`} style={{ textDecoration: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'block' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{o.category}</span>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: '8px 0 6px', lineHeight: 1.35 }}>{o.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{o.summary.slice(0, 90)}…</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
