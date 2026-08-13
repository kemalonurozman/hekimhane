import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COCUK_KONULAR, cocukKonuBySlug, COCUK_UZMANLIK } from '@/lib/cocuk-dis';
import PremiumHekimler from '@/components/PremiumHekimler';

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return COCUK_KONULAR.map(k => ({ slug: k.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const k = cocukKonuBySlug(params.slug);
  if (!k) return { title: 'Konu Bulunamadı' };
  const url = `https://www.hekimhane.com.tr/cocuk-dis-sagligi/${k.slug}`;
  return {
    title: `${k.ad} — Çocuk Diş Sağlığı | Hekimhane`,
    description: k.ozet.slice(0, 155),
    alternates: { canonical: url },
    openGraph: { title: `${k.ad} | Hekimhane`, description: k.ozet.slice(0, 155), url, type: 'article' },
  };
}

const KART: React.CSSProperties = { background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: '26px 28px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: 18 };
const H2: React.CSSProperties = { fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 12px', letterSpacing: '-0.3px' };
const P: React.CSSProperties = { fontSize: 15, color: '#3A3A3C', lineHeight: 1.75, margin: '0 0 12px' };

export default function CocukKonuDetayPage({ params }: Props) {
  const k = cocukKonuBySlug(params.slug);
  if (!k) notFound();

  const digerKonular = COCUK_KONULAR.filter(x => x.slug !== k.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Çocuk Diş Sağlığı', item: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi' },
        { '@type': 'ListItem', position: 3, name: k.ad, item: `https://www.hekimhane.com.tr/cocuk-dis-sagligi/${k.slug}` },
      ] },
      ...(k.sss.length ? [{
        '@type': 'FAQPage',
        mainEntity: k.sss.map(s => ({ '@type': 'Question', name: s.soru, acceptedAnswer: { '@type': 'Answer', text: s.cevap } })),
      }] : []),
    ],
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '46px 0 42px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 16, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/cocuk-dis-sagligi" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Çocuk Diş Sağlığı</Link><span>›</span>
            <span style={{ color: 'white' }}>{k.ad}</span>
          </nav>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 20, padding: '5px 13px', marginBottom: 14 }}>
            Pedodonti
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(24px,3.6vw,34px)', fontWeight: 800, color: 'white', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.4px' }}>
            {k.ad}
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.65, maxWidth: 680, margin: 0 }}>{k.ozet}</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 820, padding: '34px 16px 60px' }}>

        {/* Bölümler */}
        {k.bolumler.map((b, i) => (
          <section key={i} style={KART}>
            <h2 style={H2}>{b.baslik}</h2>
            {b.icerik.map((p, j) => (
              <p key={j} style={j === b.icerik.length - 1 ? { ...P, margin: 0 } : P}>{p}</p>
            ))}
          </section>
        ))}

        {/* SSS */}
        {k.sss.length > 0 && (
          <section style={KART}>
            <h2 style={H2}>Sık Sorulan Sorular</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {k.sss.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 5 }}>{s.soru}</div>
                  <div style={{ fontSize: 14.5, color: '#3A3A3C', lineHeight: 1.7 }}>{s.cevap}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Premium önerilen çocuk diş hekimleri */}
        <PremiumHekimler uzmanlik={COCUK_UZMANLIK} />

        {/* CTA */}
        <section style={{ ...KART, background: 'var(--navy)', textAlign: 'center', marginTop: 6 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Çocuğunuz için bir diş hekimi bulun</h2>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.8)', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Bulunduğunuz şehirdeki çocuk diş hekimlerini (pedodonti) inceleyin, puan ve yorumlara göre karşılaştırın.
          </p>
          <Link href="/klinikler?uzmanlik=Pedodonti%20(%C3%87ocuk%20Di%C5%9F%20Hekimli%C4%9Fi)"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: 'var(--navy)', fontSize: 14.5, fontWeight: 700, borderRadius: 12, padding: '13px 24px', textDecoration: 'none' }}>
            Çocuk diş hekimlerini gör →
          </Link>
        </section>

        {/* Diğer konular */}
        <section style={KART}>
          <h2 style={H2}>Diğer Çocuk Diş Sağlığı Konuları</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {digerKonular.map(x => (
              <Link key={x.slug} href={`/cocuk-dis-sagligi/${x.slug}`}
                style={{ padding: '8px 14px', borderRadius: 20, background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--navy)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {x.ad}
              </Link>
            ))}
          </div>
        </section>

        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
          Bu içerik bilgilendirme amaçlıdır; tıbbi tanı veya tedavi yerine geçmez. Sağlık sorununuz için diş hekimine başvurun.
        </p>
      </div>
    </main>
  );
}
