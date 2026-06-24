import type { Metadata } from 'next';
import Link from 'next/link';
import { KATEGORILER, HASTALIKLAR } from '@/lib/hastaliklar-data';

export const metadata: Metadata = {
  title: 'Hastalık Rehberi | Hekimhane',
  description: 'Sık görülen hastalıklar, belirtileri ve tedavi yöntemleri hakkında güvenilir sağlık bilgisi.',
};

const sağlıkKonuları = [
  { başlık: 'Antibiyotik Kullanımı', özet: 'Doğru antibiyotik kullanımı ve direnç hakkında bilmeniz gerekenler', renk: '#DC2626' },
  { başlık: 'Kan Tahlili Sonuçları', özet: 'Kan değerlerini nasıl yorumlarsınız? Normal değerler ve anlamları', renk: '#2563EB' },
  { başlık: 'Stres ve Sağlık', özet: 'Kronik stresin sağlık üzerindeki etkileri ve başa çıkma yöntemleri', renk: '#7C3AED' },
  { başlık: 'Beslenme Önerileri', özet: 'Sağlıklı beslenme rehberi ve kronik hastalıklarda diyet', renk: '#065F46' },
  { başlık: 'Egzersiz ve Hareket', özet: 'Günlük hareketin önemi ve hastalıklardan korunma', renk: '#D97706' },
  { başlık: 'Uyku Bozuklukları', özet: 'Uyku kalitesini etkileyen faktörler ve çözüm yolları', renk: '#1B3A69' },
];

// SVG ikonlar — inline, emoji yok
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export default function HastalıklarPage() {
  const kategorilerWithHastaliklar = KATEGORILER.map(kat => ({
    ...kat,
    hastaliklar: HASTALIKLAR.filter(h => h.kategoriSlug === kat.slug).slice(0, 4),
  }));

  return (
    <main style={{ background: '#F5F5F7', minHeight: '100vh', paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #0A2540 0%, #163D6E 60%, #1B3A69 100%)',
        padding: '72px 0 64px',
        color: 'white',
      }}>
        <div className="container">

          {/* Breadcrumb */}
          <nav style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 36, display: 'flex', gap: 6, alignItems: 'center', letterSpacing: '.3px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span style={{ opacity: .5 }}>›</span>
            <span style={{ color: 'rgba(255,255,255,.75)' }}>Hastalık Rehberi</span>
          </nav>

          {/* Başlık + açıklama */}
          <div style={{ maxWidth: 640, marginBottom: 44 }}>
            <p style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase',
              color: '#D4A843', margin: '0 0 16px',
            }}>
              Güvenilir Sağlık Bilgisi
            </p>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700,
              letterSpacing: '-1.5px', lineHeight: 1.08, margin: '0 0 20px',
            }}>
              Hastalık Rehberi
            </h1>
            <p style={{
              color: 'rgba(255,255,255,.65)', fontSize: 17, margin: 0,
              lineHeight: 1.65, fontWeight: 400, letterSpacing: '.1px',
            }}>
              Sık görülen hastalıklar, belirtileri ve tedavi yöntemleri hakkında
              uzman doktorların derlediği güvenilir içeriklere ulaşın.
            </p>
          </div>

          {/* Arama kutusu */}
          <div style={{ maxWidth: 520, position: 'relative', marginBottom: 36 }}>
            <div style={{
              position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center',
            }}>
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Hastalık veya belirti arayın…"
              style={{
                width: '100%', padding: '16px 20px 16px 50px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,.12)',
                background: 'rgba(255,255,255,.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: 'white',
                fontSize: 15, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
                letterSpacing: '.1px',
              }}
            />
          </div>

          {/* İstatistik rozetleri */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: <IconBook />, text: `${HASTALIKLAR.length}+ hastalık bilgisi` },
              { icon: <IconUsers />, text: 'Uzman doktor içerikleri' },
              { icon: <IconRefresh />, text: 'Düzenli güncelleme' },
            ].map(item => (
              <div key={item.text} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,.09)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 20, padding: '7px 14px',
                fontSize: 13, color: 'rgba(255,255,255,.7)',
                letterSpacing: '.1px',
              }}>
                <span style={{ opacity: .7 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UYARI BANDI ────────────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E5E5EA',
        padding: '11px 0',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12.5, color: '#6E6E73', letterSpacing: '.1px',
        }}>
          <span style={{ color: '#D4A843', flexShrink: 0 }}><IconShield /></span>
          <span>
            <strong style={{ color: '#3A3A3C', fontWeight: 600 }}>Önemli Uyarı:</strong>{' '}
            Bu sayfadaki bilgiler yalnızca genel sağlık bilgisi amaçlıdır ve tıbbi tavsiye yerine geçmez.
            Herhangi bir sağlık sorununuz için mutlaka bir doktora başvurun.
          </span>
        </div>
      </div>

      <div className="container" style={{ padding: '56px 20px' }}>

        {/* ── KATEGORİLER ────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 700, letterSpacing: '-0.6px',
              color: '#1D1D1F', margin: '0 0 8px',
            }}>
              Uzmanlık Dalına Göre Hastalıklar
            </h2>
            <p style={{ color: '#6E6E73', fontSize: 15, margin: 0, letterSpacing: '.1px' }}>
              Merak ettiğiniz uzmanlık alanını seçerek detaylı bilgiye ulaşın.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {kategorilerWithHastaliklar.map(kat => (
              <div key={kat.slug} style={{
                background: 'white', borderRadius: 18,
                border: '1px solid #E5E5EA',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,.04)',
              }}>
                {/* Kart başlık */}
                <div style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid #F2F2F7',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: kat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: kat.renk, opacity: .85 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: '#1D1D1F', letterSpacing: '-.1px' }}>{kat.ad}</div>
                    <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{kat.aciklama}</div>
                  </div>
                </div>

                {/* Hastalık listesi */}
                <div>
                  {kat.hastaliklar.length > 0 ? kat.hastaliklar.map((h, idx) => (
                    <Link
                      key={h.slug}
                      href={`/hastaliklar/${kat.slug}/${h.slug}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 20px', fontSize: 13.5,
                        color: '#3A3A3C', textDecoration: 'none',
                        borderBottom: idx < kat.hastaliklar.length - 1 ? '1px solid #F2F2F7' : 'none',
                        letterSpacing: '-.1px',
                      }}
                    >
                      <span>{h.ad}</span>
                      <span style={{ color: '#C7C7CC' }}><IconChevron /></span>
                    </Link>
                  )) : (
                    <div style={{ padding: '14px 20px', fontSize: 13, color: '#AEAEB2', fontStyle: 'italic' }}>
                      İçerikler yakında eklenecek
                    </div>
                  )}

                  <Link
                    href={`/hastaliklar/${kat.slug}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '12px 20px', fontSize: 13, fontWeight: 600,
                      color: kat.renk, textDecoration: 'none',
                      borderTop: '1px solid #F2F2F7', letterSpacing: '-.1px',
                    }}
                  >
                    Tümünü görüntüle
                    <IconChevron />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ÖNER SAĞLIK KONULARI ───────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 700, letterSpacing: '-0.6px',
              color: '#1D1D1F', margin: '0 0 8px',
            }}>
              Öne Çıkan Sağlık Konuları
            </h2>
            <p style={{ color: '#6E6E73', fontSize: 15, margin: 0, letterSpacing: '.1px' }}>
              Uzman doktorların hazırladığı rehber içerikler.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {sağlıkKonuları.map(konu => (
              <a
                key={konu.başlık}
                href="#"
                style={{
                  background: 'white', borderRadius: 16,
                  border: '1px solid #E5E5EA',
                  padding: '22px 22px',
                  textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                }}
              >
                <div style={{
                  width: 4, height: 28, borderRadius: 2,
                  background: konu.renk,
                }} />
                <div style={{ fontWeight: 600, fontSize: 14.5, color: '#1D1D1F', letterSpacing: '-.1px', lineHeight: 1.3 }}>
                  {konu.başlık}
                </div>
                <div style={{ fontSize: 13, color: '#6E6E73', lineHeight: 1.55, letterSpacing: '.05px' }}>
                  {konu.özet}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12.5, fontWeight: 600, color: konu.renk, marginTop: 4,
                }}>
                  Devamını oku <IconArrow />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section>
          <div style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #163D6E 100%)',
            borderRadius: 22,
            padding: '48px 48px',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center',
          }}>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '1.2px',
                textTransform: 'uppercase', color: '#D4A843', margin: '0 0 12px',
              }}>
                Hekimhane Ağı
              </p>
              <h2 style={{
                fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700,
                letterSpacing: '-0.6px', color: 'white', margin: '0 0 12px',
              }}>
                Uzman Doktor Bulun
              </h2>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, margin: 0, lineHeight: 1.65, letterSpacing: '.1px' }}>
                Okuduğunuz hastalıkla ilgili en yakın uzman doktoru bulun.
                12.000+ doktor profili ile Türkiye genelinde sağlık hizmeti arayın.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              <Link href="/doktorlar" style={{
                background: '#D4A843', color: 'white', fontWeight: 600,
                padding: '13px 24px', borderRadius: 12, textDecoration: 'none',
                textAlign: 'center', fontSize: 14.5, letterSpacing: '-.1px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <IconSearch /> Doktor Ara
              </Link>
              <Link href="/klinikler" style={{
                background: 'rgba(255,255,255,.08)',
                color: 'rgba(255,255,255,.8)', fontWeight: 500,
                padding: '11px 24px', borderRadius: 12, textDecoration: 'none',
                textAlign: 'center', fontSize: 14, letterSpacing: '-.1px',
                border: '1px solid rgba(255,255,255,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                Klinik Bul
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
