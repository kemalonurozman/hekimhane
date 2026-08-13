import type { Metadata } from 'next';
import Link from 'next/link';
import { COCUK_KONULAR } from '@/lib/cocuk-dis';

export const metadata: Metadata = {
  title: 'Çocuk Diş Sağlığı (Pedodonti) — Konular ve Rehberler | Hekimhane',
  description: 'Çocuk diş hekimliği (pedodonti) rehberi: süt dişi, arayüz çürükleri, süt dişi çekimi, koruyucu tedavi, fissür örtücü, flor uygulaması, çocuk diş dolgusu ve ağız içi dijital tarama. Çocuğunuzun diş sağlığı için bilmeniz gerekenler.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi' },
};

const ToothIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5c-1.5-1.5-3-2-4.5-2C5 3.5 3.5 5.5 3.5 8c0 2 .5 3.5 1 5.5.4 1.6.6 3 .9 4.5.2 1.2.6 2 1.4 2 1 0 1.2-1 1.5-2.5.3-1.4.5-2.5 1.2-2.5s.9 1.1 1.2 2.5c.3 1.5.5 2.5 1.5 2.5.8 0 1.2-.8 1.4-2 .3-1.5.5-2.9.9-4.5.5-2 1-3.5 1-5.5 0-2.5-1.5-4.5-4-4.5-1.5 0-3 .5-4.5 2Z" /></svg>
);

export default function CocukDisHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Çocuk Diş Sağlığı', item: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi' },
      ] },
      { '@type': 'ItemList', name: 'Çocuk Diş Sağlığı Konuları', numberOfItems: COCUK_KONULAR.length,
        itemListElement: COCUK_KONULAR.map((k, i) => ({ '@type': 'ListItem', position: i + 1, name: k.ad, url: `https://www.hekimhane.com.tr/cocuk-dis-sagligi/${k.slug}` })) },
    ],
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '48px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 960 }}>
          <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <span style={{ color: 'white' }}>Çocuk Diş Sağlığı</span>
          </nav>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 20, padding: '5px 13px', marginBottom: 16 }}>
            Pedodonti
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: 'white', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
            Çocuk Diş Sağlığı
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', lineHeight: 1.65, maxWidth: 720, margin: 0 }}>
            Çocuk diş hekimliği (pedodonti), doğumdan ergenliğe kadar çocukların ağız ve diş sağlığını korumayı hedefler.
            Süt dişlerinden koruyucu uygulamalara, çürük tedavisinden dijital taramaya kadar merak ettiğiniz konuları
            burada derledik.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 960, padding: '36px 16px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {COCUK_KONULAR.map(k => (
            <Link key={k.slug} href={`/cocuk-dis-sagligi/${k.slug}`}
              style={{ display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 22px 20px', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{ToothIcon}</span>
              <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 800, color: 'var(--navy)', margin: '0 0 7px', lineHeight: 1.3 }}>{k.ad}</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>{k.kisa}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>
                İçeriği gör
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span>
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 28 }}>
          Bu içerikler bilgilendirme amaçlıdır; tıbbi tanı veya tedavi yerine geçmez. Çocuğunuzun diş sağlığı için bir
          <Link href="/klinikler?uzmanlik=Pedodonti%20(%C3%87ocuk%20Di%C5%9F%20Hekimli%C4%9Fi)" style={{ color: 'var(--navy)', fontWeight: 600 }}> çocuk diş hekimine</Link> başvurun.
        </p>
      </div>
    </main>
  );
}
