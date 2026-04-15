import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Hekimhane — Türkiye Sağlık Rehberi',
  description: 'Türkiye\'nin en kapsamlı sağlık rehberi. 1.000+ klinik, 1.800+ hastane, 1.500+ doktor ve 8.700+ eczane bilgisi.',
};

// İstatistikler sunucuda hesaplanır, her build'de güncellenir
async function getStats() {
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
}

const KATEGORILER = [
  { href: '/klinikler',  icon: '🦷', label: 'Klinikler',  color: '#EEF2FF', border: '#C7D2FE', text: '#4338CA' },
  { href: '/hastaneler', icon: '🏥', label: 'Hastaneler', color: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
  { href: '/doktorlar',  icon: '👨‍⚕️', label: 'Doktorlar',  color: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
  { href: '/eczaneler',  icon: '💊', label: 'Eczaneler',  color: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
];

const POPÜLER_İLLER = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Muğla', 'Mersin',
];

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div style={{ paddingTop: '66px' }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 60%, #1B4080 100%)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(212,168,67,.15), transparent 60%)',
        }}/>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(212,168,67,.15)',
            border: '1px solid rgba(212,168,67,.3)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.5px',
            marginBottom: '20px',
          }}>
            TÜRKİYE SAĞLIK REHBERİ
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Doğru Sağlık Kurumuna<br />
            <span style={{ color: 'var(--gold)' }}>Hızlıca Ulaşın</span>
          </h1>

          <p style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.75)',
            maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.6,
          }}>
            {stats.klinik.toLocaleString('tr')}+ klinik, {stats.hastane.toLocaleString('tr')}+ hastane,
            {stats.doktor.toLocaleString('tr')}+ doktor ve {stats.eczane.toLocaleString('tr')}+ eczane
          </p>

          {/* Arama */}
          <form action="/klinikler" method="get" style={{
            display: 'flex', gap: '8px', maxWidth: '560px', margin: '0 auto',
          }}>
            <input
              name="q"
              placeholder="Klinik, hastane, doktor veya eczane ara..."
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '12px',
                border: 'none', fontSize: '15px', outline: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,.15)',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '14px 24px' }}>
              <i className="fa-solid fa-magnifying-glass" /> Ara
            </button>
          </form>
        </div>
      </section>

      {/* ── KATEGORİLER ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '36px' }}>
            Ne Arıyorsunuz?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {KATEGORILER.map(k => (
              <Link key={k.href} href={k.href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '32px 16px',
                background: k.color,
                border: `1.5px solid ${k.border}`,
                borderRadius: '20px',
                transition: '0.18s',
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: '40px', marginBottom: '12px' }}>{k.icon}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: k.text }}>{k.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPÜLER İLLER ── */}
      <section style={{
        padding: '40px 0 60px',
        background: 'white',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '24px' }}>
            Şehre Göre Ara
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {POPÜLER_İLLER.map(il => (
              <Link
                key={il}
                href={`/klinikler?il=${encodeURIComponent(il)}`}
                className="badge badge-navy"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
              >
                {il}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — İşletme Ekle ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--navy), var(--navy2))',
            borderRadius: '24px',
            padding: '56px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-playfair, serif)',
                fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '10px'
              }}>
                İşletmenizi Listeleyin
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '460px' }}>
                Kliniğinizi veya hastanenizi platforma ekleyin, binlerce potansiyel hastaya ulaşın.
              </p>
            </div>
            <Link href="/katil" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Hemen Başlayın →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
