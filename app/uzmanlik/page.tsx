import type { Metadata } from 'next';
import Link from 'next/link';
import { UZMANLIK_REHBERLERI } from '@/lib/uzmanlik-rehberleri';

export const metadata: Metadata = {
  title: 'Diş Hekimliği Uzmanlık Rehberleri — İmplant, Ortodonti, Kanal | Hekimhane',
  description: 'İmplant, ortodonti, kanal tedavisi, diş eti, estetik diş ve daha fazlası: her diş hekimliği uzmanlığının ne olduğunu, ne zaman gerektiğini ve sürecini öğrenin. Türkiye genelinde diş klinikleri Hekimhane\'de.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/uzmanlik' },
};

export default function UzmanlikIndexPage() {
  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 66 }}>
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '48px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 960 }}>
          <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <span style={{ color: 'white' }}>Uzmanlık Rehberleri</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: 'white', lineHeight: 1.2, margin: '0 0 12px' }}>
            Diş Hekimliği Uzmanlık Rehberleri
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, maxWidth: 700, margin: 0 }}>
            Hangi tedaviye ihtiyacınız olduğunu anlayın: her uzmanlığın ne olduğunu, ne zaman gerektiğini, sürecini ve
            sık sorulan soruları derledik.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 960, padding: '36px 16px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {UZMANLIK_REHBERLERI.map(r => (
            <Link key={r.slug} href={`/uzmanlik/${r.slug}`}
              style={{ display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: '24px 24px 22px', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--gold2, #B8860B)', marginBottom: 10 }}>Rehber</span>
              <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 18, fontWeight: 800, color: 'var(--navy)', margin: '0 0 8px', lineHeight: 1.3 }}>{r.kisaAd}</h2>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>{r.ozet}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>
                Rehberi oku
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
