import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import KategoriKartlari from '@/components/KategoriKartlari';
import HeroAnimated from '@/components/HeroAnimated';
import HastalikRehberiSection from '@/components/HastalikRehberiSection';
import HekimhaneAI from '@/components/HekimhaneAI';
import SaglikBul from '@/components/SaglikBul';

export const metadata: Metadata = {
  title: 'Hekimhane — Türkiye Diş Hekimi & Klinik Rehberi',
  description: 'Türkiye\'nin diş sağlığı rehberi. 1.044+ diş kliniği ve muayenehane, uzman diş hekimleri. İstanbul, Ankara, İzmir ve tüm Türkiye\'de size en yakın diş hekimini ve kliniğini bulun.',
  keywords: ['diş hekimi', 'diş kliniği', 'diş hekimi ara', 'ağız ve diş sağlığı', 'implant', 'ortodonti', 'diş muayenehanesi', 'randevu'],
  alternates: { canonical: 'https://www.hekimhane.com.tr' },
  openGraph: {
    title: 'Hekimhane — Türkiye Diş Hekimi & Klinik Rehberi',
    description: 'Diş kliniği ve diş hekimi arama platformu. Türkiye genelinde 1.000+ diş kliniği ve muayenehane.',
    url: 'https://www.hekimhane.com.tr',
    type: 'website',
  },
};

async function getStats() {
  try {
    const [klinik, disHekimi] = await Promise.all([
      supabase.from('klinikler').select('id', { count: 'exact', head: true }),
      supabase.from('doktorlar').select('id', { count: 'exact', head: true }).ilike('spec', '%diş%'),
    ]);
    return {
      klinik: klinik.count || 0,
      disHekimi: disHekimi.count || 0,
    };
  } catch {
    return { klinik: 0, disHekimi: 0 };
  }
}

interface OneCikan {
  title: string; slug: string; summary: string; category: string;
  cover_image: string | null; okuma_dk: number | null; sponsorlu: boolean;
}

/** Admin tarafından "Anasayfada öne çıkar" işaretli yayındaki makaleler. */
async function getOneCikanMakaleler(): Promise<OneCikan[]> {
  noStore();   // yeni öne çıkarılan makale Data Cache'te bayatlamasın
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('title,slug,summary,category,cover_image,okuma_dk,sponsorlu')
      .eq('published', true)
      .eq('show_homepage', true)
      .order('created_at', { ascending: false })
      .limit(3);
    if (error) return [];   // show_homepage kolonu yoksa sessizce boş
    return (data as any[])?.map(p => ({
      title: p.title, slug: p.slug, summary: p.summary || '',
      category: p.category || 'Diş Sağlığı', cover_image: p.cover_image || null,
      okuma_dk: p.okuma_dk || null, sponsorlu: p.sponsorlu === true,
    })) || [];
  } catch { return []; }
}

const POPÜLER_İLLER = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Muğla', 'Mersin',
];

function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default async function HomePage() {
  const [stats, oneCikanlar] = await Promise.all([getStats(), getOneCikanMakaleler()]);

  return (
    <div style={{
      paddingTop: 64,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <style>{`
        .cta-section {
          padding: 80px 0;
          background: #F5F5F7;
        }
        .cta-card {
          background: linear-gradient(155deg, #0A2540 0%, #163D6E 100%);
          border-radius: 24px;
          padding: 52px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 32px;
        }
        @media (max-width: 768px) {
          .cta-section {
            padding: 40px 0;
          }
          .cta-card {
            padding: 24px;
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* ── HERO — canvas partikül + mouse efekti ────────────────── */}
      <HeroAnimated stats={stats} />

      {/* ── SAĞLIK SORUNU BUL ────────────────────────────────────── */}
      <SaglikBul />

      {/* ── HEKİMHANE AI ────────────────────────────────────────────── */}
      <section style={{ padding: '40px 0 0', background: '#F5F5F7' }}>
        <div className="container">
          <HekimhaneAI />
        </div>
      </section>

      {/* ── KATEGORİLER ─────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0', background: '#F5F5F7' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 30, fontWeight: 700, letterSpacing: '-0.8px',
              color: '#1D1D1F', margin: '0 0 10px',
            }}>
              Diş Sağlığında Ne Arıyorsunuz?
            </h2>
            <p style={{ color: '#6E6E73', fontSize: 15, margin: 0 }}>
              Türkiye genelinde arama yapın, size en yakın diş hekimini bulun.
            </p>
          </div>
          {/* Client component — hover etkileşimi burada */}
          <KategoriKartlari stats={stats} />
        </div>
      </section>

      {/* ── POPÜLER İLLER ───────────────────────────────────────────── */}
      <section style={{
        padding: '52px 0',
        background: 'white',
        borderTop: '1px solid #E5E5EA',
        borderBottom: '1px solid #E5E5EA',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ color: '#6E6E73', display: 'flex' }}><IconMapPin /></span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-.4px', margin: 0 }}>
              Şehre Göre Diş Kliniği Ara
            </h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPÜLER_İLLER.map(il => (
              <Link
                key={il}
                href={`/klinikler?il=${encodeURIComponent(il)}`}
                style={{
                  padding: '7px 16px', borderRadius: 20,
                  border: '1px solid #E5E5EA', background: 'white',
                  fontSize: 13.5, fontWeight: 500, color: '#3A3A3C',
                  textDecoration: 'none', letterSpacing: '-.1px',
                }}
              >
                {il}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HASTALIK REHBERİ ────────────────────────────────────────── */}
      <HastalikRehberiSection />

      {/* ── ÖNE ÇIKAN MAKALELER ─────────────────────────────────────── */}
      {oneCikanlar.length > 0 && (
        <section style={{ padding: '72px 0', background: '#FFFFFF' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#D4A843', margin: '0 0 10px' }}>
                  Uzmanlardan
                </p>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#1B3A69', margin: 0 }}>
                  Öne Çıkan Makaleler
                </h2>
              </div>
              <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1B3A69', textDecoration: 'none', flexShrink: 0 }}>
                Tüm yazılar <IconArrow />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {oneCikanlar.map(m => (
                <Link key={m.slug} href={`/blog/${m.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #E5E5EA', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                  <div style={{ position: 'relative', aspectRatio: '16 / 9', background: m.cover_image ? '#F5F5F7' : 'linear-gradient(135deg,#1B3A69,#163D6E)' }}>
                    {m.cover_image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.cover_image} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>{m.category}</div>}
                    {m.sponsorlu && (
                      <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#B8860B', background: 'rgba(255,255,255,.94)', borderRadius: 8, padding: '3px 8px' }}>İş Ortağı</span>
                    )}
                  </div>
                  <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D4A843', textTransform: 'uppercase', letterSpacing: '.5px' }}>{m.category}</span>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1c1c1e', margin: '8px 0 8px', lineHeight: 1.35 }}>{m.title}</div>
                    <div style={{ fontSize: 13.5, color: '#6E6E73', lineHeight: 1.55, flex: 1 }}>{m.summary.slice(0, 110)}{m.summary.length > 110 ? '…' : ''}</div>
                    {m.okuma_dk ? <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 12 }}>{m.okuma_dk} dk okuma</div> : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div style={{ maxWidth: 500 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '1.2px',
                textTransform: 'uppercase', color: '#D4A843', margin: '0 0 12px',
              }}>
                Diş Hekimleri İçin
              </p>
              <h2 style={{
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700,
                letterSpacing: '-0.8px', color: 'white', margin: '0 0 12px',
              }}>
                Kliniğinizi Listeleyin
              </h2>
              <p style={{ color: 'rgba(255,255,255,.58)', fontSize: 15, margin: 0, lineHeight: 1.65 }}>
                Muayenehanenizi veya diş kliniğinizi platforma ekleyin, binlerce potansiyel hastaya ulaşın.
              </p>
            </div>
            <Link href="/katil" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 13,
              background: '#D4A843', color: 'white',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
              letterSpacing: '-.2px', flexShrink: 0,
            }}>
              Hemen Başlayın <IconArrow />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
