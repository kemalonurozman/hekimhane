import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { yayindakiBlogYazilari, getBlogYazi, yayinlanmamisBaglantilariSuz, type BlogBlok } from '@/lib/blog-data';
import { supabase } from '@/lib/supabase';
import { parseGovde, okumaSuresi } from '@/lib/makale-icerik';
import MakaleGovde from '@/components/MakaleGovde';
import { HASTALIK_YAZILARI } from '@/lib/hastalik-yazilari';
import { profilYayindaDegil } from '@/lib/uyum';
import PaylasDugmeleri from '@/components/PaylasDugmeleri';
import { isletmeBilgisi } from '@/lib/entity-link';

interface Props { params: { slug: string } }

// Derleme anında yayında olan statik yazılar önceden üretilir; zamanlı
// (gelecek tarihli) yazılar ve panel/admin yazıları istek anında üretilir
// (dynamicParams açık). Tarihi gelmemiş yazı getBlogYazi'de 404 olur.
export function generateStaticParams() {
  return yayindakiBlogYazilari().map(y => ({ slug: y.slug }));
}

export const revalidate = 300;

/** Statik veri + Supabase'i tek bir görünüm modeline indirger. */
interface Yazi {
  title: string;
  summary: string;
  category: string | null;
  author: string;
  authorHref: string | null;
  /** Yazar işletmenin branşı/türü — yazar kutusunda */
  authorAlt: string | null;
  created_at: string;
  okumaDk: number;
  govde: BlogBlok[];
  sponsorlu: boolean;
  website: string | null;
  cover_image: string | null;
  cover_alt: string | null;
  brans: string | null;
  kapakIcte: boolean;   // kapak görseli sayfa başında değil, 2.–4. paragraftan sonra gövdede gösterilir
}

/** Kapağı gövdeye yerleştirir: yazıya göre 2., 3. ya da 4. paragraftan sonra (slug'a göre sabit, yazılar arası değişir). */
function kapagiGovdeyeKoy(govde: BlogBlok[], slug: string, url: string, alt: string): BlogBlok[] {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hedef = 2 + (h % 3);
  const paragraflar = govde.map((b, i) => (b.tip === 'p' ? i : -1)).filter(i => i >= 0);
  if (!paragraflar.length) return govde;
  const idx = paragraflar[Math.min(hedef, paragraflar.length) - 1];
  return [...govde.slice(0, idx + 1), { tip: 'gorsel', url, alt }, ...govde.slice(idx + 1)];
}

/** Bu yazının konusunu "Baktığı hastalıklar" listesine ekleyen hekimler (en çok 6). Hata olursa kutu gizlenir. */
async function konuHekimleri(slug: string): Promise<{ ad: string; hekimler: { href: string; isim: string; alt: string }[] } | null> {
  const konu = HASTALIK_YAZILARI.find(h => h.slug === slug);
  if (!konu) return null;
  try {
    const { data } = await supabase.from('doktorlar').select('*').contains('conditions', [konu.ad]).limit(12);
    const liste = ((data || []) as any[])
      .filter(d => d.slug && !profilYayindaDegil(d))
      .slice(0, 6)
      .map(d => ({
        href: `/doktorlar/${d.slug}`,
        isim: [d.unvan, d.ad, d.soyad].filter(Boolean).join(' ').trim(),
        alt: [d.spec, d.il].filter(Boolean).join(' · '),
      }));
    return liste.length ? { ad: konu.ad, hekimler: liste } : null;
  } catch { return null; }
}

async function getYazi(slug: string): Promise<Yazi | null> {
  const statik = getBlogYazi(slug);
  if (statik) {
    return {
      title: statik.title, summary: statik.summary, category: statik.category,
      author: statik.author, authorHref: null, authorAlt: null, created_at: statik.created_at, okumaDk: statik.okumaDk,
      govde: yayinlanmamisBaglantilariSuz(statik.govde), sponsorlu: false, website: null,
      cover_image: statik.cover_image,
      cover_alt: statik.cover_alt || null,
      brans: statik.brans || null,
      kapakIcte: !!statik.cover_image,
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

    // Panelden yazan işletme (doktor/klinik/hastane/eczane) → güncel adı + profil bağlantısı
    let author = p.entity_name || p.author || 'Hekimhane';
    let authorHref: string | null = null;
    let authorAlt: string | null = null;
    if (p.entity_type && p.entity_id) {
      const b = await isletmeBilgisi(supabase as any, String(p.entity_type), String(p.entity_id));
      if (b.ad) author = b.ad;
      if (b.url) authorHref = b.url.replace(/^https?:\/\/(www\.)?hekimhane\.com\.tr/, '') || null;
      authorAlt = b.bolum || b.kurum || null;
    }

    return {
      title: p.title,
      summary: p.summary || '',
      category: p.category || null,   // panelden kategorisiz gönderilebilir
      author,
      authorHref,
      authorAlt,
      created_at: p.created_at,
      okumaDk: p.okuma_dk || okumaSuresi(p.content || ''),
      govde: parseGovde(p.content || ''),
      sponsorlu: p.sponsorlu === true,
      website: p.website || null,
      cover_image: p.cover_image || null,
      cover_alt: p.cover_alt || null,
      brans: null,
      kapakIcte: false,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const y = await getYazi(params.slug);
  if (!y) return { title: 'Yazı Bulunamadı' };
  const url = `https://www.hekimhane.com.tr/blog/${params.slug}`;
  const imgAbs = y.cover_image
    ? (y.cover_image.startsWith('http') ? y.cover_image : `https://www.hekimhane.com.tr${y.cover_image}`)
    : null;
  const ogImages = imgAbs ? [{ url: imgAbs, width: 1200, height: 675, alt: y.cover_alt || y.title }] : undefined;
  return {
    title: { absolute: `${y.title} | Hekimhane Blog` },
    description: y.summary,
    alternates: { canonical: url },
    openGraph: { title: y.title, description: y.summary, url, type: 'article', images: ogImages },
    twitter: { card: imgAbs ? 'summary_large_image' : 'summary', title: y.title, description: y.summary, images: imgAbs ? [imgAbs] : undefined },
  };
}

const trTarih = (s: string) => {
  try { return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return s; }
};

export default async function BlogDetayPage({ params }: Props) {
  const y = await getYazi(params.slug);
  if (!y) notFound();

  // Önce aynı kategoriden (en yeni), sonra diğerlerinden 3 yazı
  const digerAday = yayindakiBlogYazilari()
    .filter(x => x.slug !== params.slug)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const digerYazilar = [
    ...digerAday.filter(x => x.category === y.category),
    ...digerAday.filter(x => x.category !== y.category),
  ].slice(0, 3);

  // Yazının konusuna göre hekim bulma kutusu (statik yazıdaki `brans` = doktorlar.spec)
  const cta = y.brans
    ? {
        baslik: `${y.brans} uzmanı mı arıyorsunuz?`,
        metin: 'Size yakın uzmanları Hekimhane\'de bulun, profillerini inceleyin.',
        href: `/doktorlar?spec=${encodeURIComponent(y.brans)}`,
        dugme: 'Uzmanları Gör',
      }
    : {
        baslik: 'Diş hekimi mi arıyorsunuz?',
        metin: 'Size en yakın uzman diş hekimini Hekimhane\'de bulun.',
        href: '/dis-hekimleri',
        dugme: 'Diş Hekimlerini Gör',
      };

  const imgAbs = y.cover_image
    ? (y.cover_image.startsWith('http') ? y.cover_image : `https://www.hekimhane.com.tr${y.cover_image}`)
    : null;
  const konuKutusu = await konuHekimleri(params.slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: y.title,
    description: y.summary,
    author: { '@type': 'Organization', name: y.author },
    datePublished: y.created_at,
    ...(imgAbs ? { image: { '@type': 'ImageObject', url: imgAbs, width: 1200, height: 675 } } : {}),
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
            {y.category && <>
              <span style={{ fontSize: 8 }}>›</span>
              <span style={{ color: 'rgba(255,255,255,.9)' }}>{y.category}</span>
            </>}
          </nav>
          {y.category && (
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--navy)', background: 'var(--gold-fill)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
              {y.category}
            </span>
          )}
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
            {y.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'rgba(255,255,255,.7)', flexWrap: 'wrap' }}>
            {y.authorHref
              ? <Link href={y.authorHref} style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>{y.author}{y.authorAlt && <span style={{ opacity: .7, fontSize: 11 }}> ({y.authorAlt})</span>}</Link>
              : <span>{y.author}</span>}
            <span style={{ opacity: .5 }}>•</span>
            <span>{trTarih(y.created_at)}</span>
            <span style={{ opacity: .5 }}>•</span>
            <span>{y.okumaDk} dk okuma</span>
          </div>
        </div>
      </div>

      {/* Kapak görseli */}
      {y.cover_image && !y.kapakIcte && (
        <div className="container" style={{ maxWidth: 760, padding: '28px 32px 0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={y.cover_image} alt={y.cover_alt || y.title} width={1200} height={675}
            style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 18, border: '1px solid var(--border)' }} />
        </div>
      )}

      {/* Gövde */}
      <article className="container" style={{ maxWidth: 760, padding: y.cover_image && !y.kapakIcte ? '24px 32px 24px' : '40px 32px 24px' }}>
        {y.sponsorlu && (
          <div style={{ background: '#FDF6E3', border: '1px solid #F0DFB4', borderRadius: 14, padding: '14px 18px', marginBottom: 26 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#B8860B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5 }}>
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
        <MakaleGovde bloklar={y.kapakIcte && y.cover_image ? kapagiGovdeyeKoy(y.govde, params.slug, y.cover_image, y.cover_alt || y.title) : y.govde} />

        {/* Paylaş */}
        <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <PaylasDugmeleri url={`https://www.hekimhane.com.tr/blog/${params.slug}`} baslik={y.title} etiket="Bu yazıyı paylaşın" />
        </div>

        {/* Yazar kutusu — yazının profil sayfasındaki "Makalelerimiz"e bağlantısı */}
        {y.authorHref && (
          <Link href={y.authorHref} style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px', textDecoration: 'none' }}>
            <span style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--navy)', color: '#DEC283', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)' }}>Yazar</span>
              <span style={{ display: 'block', fontSize: 15.5, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>{y.author}</span>
              {y.authorAlt && <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{y.authorAlt}</span>}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>Profil ve diğer yazılar ›</span>
          </Link>
        )}

        {/* Yazarın sitesi — panel/iş ortağı makalelerinde */}
        {y.website && (
          <div style={{ marginTop: 26, background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>Bu yazı <strong style={{ color: 'var(--navy)' }}>{y.author}</strong> tarafından hazırlanmıştır.</span>
            <a href={y.website} target="_blank" rel="noopener" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>
              {y.website.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
        )}

        {/* Bu konuda bakan hekimler — hekimin panelde "Baktığınız hastalıklar" listesine eklediği konu */}
        {konuKutusu && (
          <div style={{ marginTop: 32, background: '#F9FBFF', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--navy)', marginBottom: 12 }}>{konuKutusu.ad} konusuna bakan hekimler</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
              {konuKutusu.hekimler.map(h => (
                <Link key={h.href} href={h.href} style={{ textDecoration: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '11px 14px', display: 'block' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', lineHeight: 1.3 }}>{h.isim}</div>
                  {h.alt && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{h.alt}</div>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Randevu CTA */}
        <div style={{ marginTop: 32, background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--navy)', marginBottom: 4 }}>{cta.baslik}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>{cta.metin}</div>
          </div>
          <Link href={cta.href} style={{ flexShrink: 0, padding: '11px 22px', borderRadius: 11, background: 'var(--navy)', color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            {cta.dugme}
          </Link>
        </div>
      </article>

      {/* Diğer yazılar */}
      {digerYazilar.length > 0 && (
        <section className="container" style={{ maxWidth: 900, padding: '24px 32px 64px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--navy)', marginBottom: 18 }}>Diğer Yazılar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {digerYazilar.map(o => (
              <Link key={o.slug} href={`/blog/${o.slug}`} style={{ textDecoration: 'none', background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'block' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{o.category}</span>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', margin: '8px 0 6px', lineHeight: 1.35 }}>{o.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{o.summary.slice(0, 90)}…</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
