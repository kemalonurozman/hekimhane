import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  KATEGORILER,
  HASTALIKLAR,
  getKategori,
  getHastalikByKategori,
} from '@/lib/hastaliklar-data';

interface Props {
  params: { kategori: string };
}

export async function generateStaticParams() {
  return KATEGORILER.map(k => ({ kategori: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kat = getKategori(params.kategori);
  if (!kat) return {};
  return {
    title: `${kat.ad} Hastalıkları | Hastalık Rehberi | Hekimhane`,
    description: `${kat.ad} alanındaki hastalıklar hakkında detaylı bilgi: belirtiler, nedenler ve tedavi seçenekleri.`,
  };
}

export default function KategoriPage({ params }: Props) {
  const kat = getKategori(params.kategori);
  if (!kat) notFound();

  const hastaliklar = getHastalikByKategori(params.kategori);

  // Alt kategorilere göre grupla
  const grouped = kat.altKategoriler.map(alt => ({
    altKat: alt,
    hastaliklar: hastaliklar.filter(h => h.altKategoriSlug === alt.slug),
  }));

  // Tüm diğer kategoriler (sidebar için)
  const digerKategoriler = KATEGORILER.filter(k => k.slug !== params.kategori);

  return (
    <main style={{ background: 'var(--ivory)', minHeight: '100vh', paddingTop: 64 }}>
      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${kat.renk}dd 0%, ${kat.renk}aa 100%)`,
        padding: '56px 0 48px',
        color: 'white',
      }}>
        <div className="container">
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>›</span>
            <Link href="/hastaliklar" style={{ color: 'inherit', textDecoration: 'none' }}>Hastalık Rehberi</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.9)' }}>{kat.ad}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              {kat.icon}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, margin: '0 0 8px' }}>{kat.ad}</h1>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, margin: 0 }}>{kat.aciklama}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap', fontSize: 14, color: 'rgba(255,255,255,.75)' }}>
            <span>📚 {hastaliklar.length} hastalık</span>
            <span>🗂 {kat.altKategoriler.length} alt kategori</span>
            <span>👨‍⚕️ Uzman içerik</span>
          </div>
        </div>
      </section>

      {/* Alt kategori hızlı nav */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {kat.altKategoriler.map(alt => (
            <a
              key={alt.slug}
              href={`#${alt.slug}`}
              style={{
                display: 'block', padding: '14px 20px', fontSize: 13,
                fontWeight: 600, color: '#374151', textDecoration: 'none',
                whiteSpace: 'nowrap', borderBottom: '3px solid transparent',
                transition: 'all .15s',
              }}
            >
              {alt.ad}
            </a>
          ))}
        </div>
      </div>

      <div className="container kategori-content-grid" style={{ padding: '40px 20px' }}>

        {/* Ana içerik: Alt kategoriler + hastalıklar */}
        <div>
          {grouped.map(({ altKat, hastaliklar: hs }) => (
            <section key={altKat.slug} id={altKat.slug} style={{ marginBottom: 48 }}>
              {/* Alt kategori başlığı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 4, height: 36, background: kat.renk, borderRadius: 4, flexShrink: 0 }} />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>{altKat.ad}</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>{altKat.aciklama}</p>
                </div>
              </div>

              {hs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {hs.map(h => (
                    <Link
                      key={h.slug}
                      href={`/hastaliklar/${params.kategori}/${h.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        background: 'white', borderRadius: 14, border: '1px solid var(--border)',
                        padding: '20px', transition: 'all .2s', cursor: 'pointer',
                        borderLeft: `4px solid ${kat.renk}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', margin: 0, lineHeight: 1.4 }}>
                            {h.ad}
                          </h3>
                          <span style={{
                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                            background: h.ciddiyeti === 'yüksek' ? '#FEE2E2' : h.ciddiyeti === 'orta' ? '#FEF3C7' : '#D1FAE5',
                            color: h.ciddiyeti === 'yüksek' ? '#DC2626' : h.ciddiyeti === 'orta' ? '#D97706' : '#065F46',
                            flexShrink: 0, marginLeft: 8,
                          }}>
                            {h.ciddiyeti === 'yüksek' ? '⚠️ Yüksek' : h.ciddiyeti === 'orta' ? '⚡ Orta' : '✅ Düşük'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px' }}>
                          {h.ozet.slice(0, 100)}...
                        </p>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
                          <span>👥 {h.gorulmeOrani}</span>
                          <span>🎂 {h.yasGrubu}</span>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: kat.renk }}>Detaylı Bilgi →</span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* Yakında gelecek (veri olmayan alt kategoriler için) */}
                  {Array.from({ length: Math.max(0, 2 - hs.length) }).map((_, i) => (
                    <div key={`placeholder-${i}`} style={{
                      background: '#F9FAFB', borderRadius: 14, border: '2px dashed #E5E7EB',
                      padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: 120,
                    }}>
                      <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📝</div>
                        <div style={{ fontSize: 12 }}>Yakında eklenecek</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: '#F9FAFB', borderRadius: 14, border: '2px dashed #E5E7EB',
                  padding: '32px', textAlign: 'center', color: '#9CA3AF',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>İçerik Hazırlanıyor</div>
                  <div style={{ fontSize: 13 }}>Bu kategori için içerikler yakında eklenecek.</div>
                </div>
              )}
            </section>
          ))}

          {/* Doktor bul CTA */}
          <div className="doktor-bul-cta-grid" style={{
            background: `linear-gradient(135deg, ${kat.renk} 0%, ${kat.renk}cc 100%)`,
            borderRadius: 20, padding: '32px',
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>
                {kat.icon} {kat.ad} Uzmanı Bul
              </h3>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                Size en yakın {kat.ad.toLowerCase()} uzmanını bulun ve randevu alın.
              </p>
            </div>
            <Link
              href={`/doktorlar?spec=${encodeURIComponent(kat.ad)}`}
              style={{
                background: 'white', color: kat.renk, fontWeight: 700,
                padding: '12px 24px', borderRadius: 10, textDecoration: 'none',
                fontSize: 14, whiteSpace: 'nowrap',
              }}
            >
              🔍 Doktor Ara
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="kategori-sidebar" style={{ position: 'sticky', top: 60 }}>
          {/* Diğer kategoriler */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>🗂 Diğer Kategoriler</div>
            </div>
            <nav style={{ padding: '8px 0' }}>
              {digerKategoriler.map(k => (
                <Link
                  key={k.slug}
                  href={`/hastaliklar/${k.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', textDecoration: 'none', fontSize: 13, color: '#374151' }}
                >
                  <span style={{ fontSize: 18 }}>{k.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{k.ad}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{k.aciklama}</div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Tüm hastalıklar listesi */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: kat.bg }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: kat.renk }}>📋 {kat.ad} Hastalıkları</div>
            </div>
            <nav style={{ padding: '8px 0', maxHeight: 280, overflowY: 'auto' }}>
              {hastaliklar.length > 0 ? hastaliklar.map(h => (
                <Link
                  key={h.slug}
                  href={`/hastaliklar/${params.kategori}/${h.slug}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 18px', textDecoration: 'none', fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}
                >
                  <span>{h.ad}</span>
                  <span style={{ color: kat.renk, fontSize: 11 }}>→</span>
                </Link>
              )) : (
                <div style={{ padding: '16px 18px', fontSize: 13, color: '#9CA3AF' }}>
                  Bu kategoride henüz içerik yok.
                </div>
              )}
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}
