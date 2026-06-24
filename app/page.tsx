import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import KategoriKartlari from '@/components/KategoriKartlari';
import HeroAnimated from '@/components/HeroAnimated';
import HastalikRehberiSection from '@/components/HastalikRehberiSection';
import HekimhaneAI from '@/components/HekimhaneAI';

export const metadata: Metadata = {
  title: 'Hekimhane — Türkiye Sağlık Rehberi',
  description: 'Türkiye\'nin en kapsamlı sağlık rehberi. Klinik, hastane, doktor ve eczane bilgisi.',
};

async function getStats() {
  try {
    const [klinik, hastane, doktor, eczane] = await Promise.all([
      supabase.from('klinikler').select('id', { count: 'exact', head: true }),
      supabase.from('hastaneler').select('id', { count: 'exact', head: true }),
      supabase.from('doktorlar').select('id', { count: 'exact', head: true }),
      supabase.from('eczaneler').select('id', { count: 'exact', head: true }),
    ]);
    return {
      klinik: klinik.count || 0,
      hastane: hastane.count || 0,
      doktor: doktor.count || 0,
      eczane: eczane.count || 0,
    };
  } catch {
    return { klinik: 0, hastane: 0, doktor: 0, eczane: 0 };
  }
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
  const stats = await getStats();

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
              Ne Arıyorsunuz?
            </h2>
            <p style={{ color: '#6E6E73', fontSize: 15, margin: 0 }}>
              Türkiye genelinde arama yapın, size en yakını bulun.
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
              Şehre Göre Ara
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

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div style={{ maxWidth: 500 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '1.2px',
                textTransform: 'uppercase', color: '#D4A843', margin: '0 0 12px',
              }}>
                İşletme Sahipleri İçin
              </p>
              <h2 style={{
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700,
                letterSpacing: '-0.8px', color: 'white', margin: '0 0 12px',
              }}>
                İşletmenizi Listeleyin
              </h2>
              <p style={{ color: 'rgba(255,255,255,.58)', fontSize: 15, margin: 0, lineHeight: 1.65 }}>
                Kliniğinizi veya hastanenizi platforma ekleyin, binlerce potansiyel hastaya ulaşın.
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
