import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getHastalik,
  getKategori,
  getAllHastalikSlugs,
  HASTALIKLAR,
} from '@/lib/hastaliklar-data';

interface Props {
  params: { kategori: string; hastalik: string };
}

export async function generateStaticParams() {
  return getAllHastalikSlugs().map(({ kategori, hastalik }) => ({ kategori, hastalik }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const h = getHastalik(params.hastalik);
  if (!h) return {};
  return {
    title: `${h.ad} – Belirtiler, Nedenler ve Tedavi | Hekimhane`,
    description: h.ozet.slice(0, 155),
  };
}

export default function HastalıkDetayPage({ params }: Props) {
  const h = getHastalik(params.hastalik);
  if (!h) notFound();

  const kat = getKategori(h.kategoriSlug);
  if (!kat) notFound();

  const ilgiliHastaliklar = HASTALIKLAR.filter(x => h.ilgiliHastaliklar.includes(x.slug));

  const ciddiyetRenk = h.ciddiyeti === 'yüksek' ? '#DC2626' : h.ciddiyeti === 'orta' ? '#D97706' : '#059669';
  const ciddiyetBg   = h.ciddiyeti === 'yüksek' ? '#FEE2E2' : h.ciddiyeti === 'orta' ? '#FEF3C7' : '#D1FAE5';

  const navItems = [
    { id: 'belirtiler', label: 'Belirtiler' },
    { id: 'nedenler',   label: 'Nedenler' },
    { id: 'tani',       label: 'Tanı' },
    { id: 'tedavi',     label: 'Tedavi' },
    { id: 'risk',       label: 'Risk & Korunma' },
    { id: 'sss',        label: 'Sık Sorulanlar' },
  ];

  return (
    <main style={{ background: 'var(--ivory)', minHeight: '100vh', paddingTop: 64 }}>

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${kat.renk}ee 0%, ${kat.renk}99 100%)`,
        padding: '52px 0 44px',
        color: 'white',
      }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span>›</span>
            <Link href="/hastaliklar" style={{ color: 'inherit', textDecoration: 'none' }}>Hastalık Rehberi</Link>
            <span>›</span>
            <Link href={`/hastaliklar/${kat.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{kat.ad}</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.9)' }}>{h.ad}</span>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.2)', color: 'white' }}>
                  {kat.icon} {kat.ad}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: ciddiyetBg, color: ciddiyetRenk }}>
                  {h.ciddiyeti === 'yüksek' ? '⚠️ Yüksek Ciddiyet' : h.ciddiyeti === 'orta' ? '⚡ Orta Ciddiyet' : '✅ Düşük Ciddiyet'}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2 }}>{h.ad}</h1>
              <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 15, lineHeight: 1.7, maxWidth: 640, margin: 0 }}>{h.ozet}</p>
            </div>

            {/* İstatistik kartı */}
            <div style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,.2)', minWidth: 200, flexShrink: 0 }}>
              <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.2)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Görülme Oranı</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{h.gorulmeOrani}</div>
              </div>
              <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.2)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Yaş Grubu</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{h.yasGrubu}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Uzman</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{h.uzmanlik}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky section nav */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ padding: '0 20px', display: 'flex', overflowX: 'auto' }}>
          {navItems.map(item => (
            <a key={item.id} href={`#${item.id}`} style={{
              display: 'block', padding: '13px 18px', fontSize: 13, fontWeight: 600,
              color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap',
              borderBottom: '3px solid transparent',
            }}>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Uyarı */}
      <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '10px 0' }}>
        <div className="container" style={{ fontSize: 12, color: '#92400E', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>⚕️</span>
          <span>Bu içerik bilgilendirme amaçlıdır; tıbbi tanı veya tedavi yerine geçmez. Sağlık sorununuz için mutlaka bir doktora başvurun.</span>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>

        {/* Ana makale */}
        <article>

          {/* ─── BELİRTİLER ─── */}
          <section id="belirtiler" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: kat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🩺</span>
              Belirtiler ve Semptomlar
            </h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {h.belirtiler.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: kat.renk + '20', color: kat.renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', marginBottom: 4 }}>{b.baslik}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{b.aciklama}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── NEDENLER ─── */}
          <section id="nedenler" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔍</span>
              Nedenler ve Etkenler
            </h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {h.nedenler.map((n, i) => (
                <div key={i} style={{ borderLeft: `4px solid ${kat.renk}`, padding: '14px 18px', background: '#F9FAFB', borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', marginBottom: 5 }}>{n.baslik}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{n.aciklama}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── TANI ─── */}
          <section id="tani" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔬</span>
              Tanı Yöntemleri
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {h.taniYontemleri.map((t, i) => (
                <div key={i} style={{ padding: '16px', background: '#F0F9FF', borderRadius: 12, border: '1px solid #BAE6FD' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1E40AF', marginBottom: 6 }}>{t.ad}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{t.aciklama}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── TEDAVİ ─── */}
          <section id="tedavi" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</span>
              Tedavi Seçenekleri
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              Tedavi seçenekleri bireyden bireye farklılık gösterir. Aşağıdaki bilgiler genel rehber niteliğindedir; tedavi planınız için mutlaka uzman doktorunuza danışın.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {h.tedaviSecenekleri.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{t.ikon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937', marginBottom: 5 }}>{t.tip}</div>
                    <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{t.aciklama}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── RİSK & KORUNMA ─── */}
          <section id="risk" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</span>
              Risk Faktörleri ve Korunma
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#DC2626', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🚨</span> Risk Faktörleri
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {h.riskFaktorleri.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', alignItems: 'flex-start' }}>
                      <span style={{ color: '#DC2626', marginTop: 2, flexShrink: 0 }}>✗</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#059669', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🛡</span> Korunma Yolları
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {h.korunmaYollari.map((k, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', alignItems: 'flex-start' }}>
                      <span style={{ color: '#059669', marginTop: 2, flexShrink: 0 }}>✓</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ─── SSS ─── */}
          {h.sikSorilanSorular.length > 0 && (
            <section id="sss" style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>❓</span>
                Sık Sorulan Sorular
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {h.sikSorilanSorular.map((s, i) => (
                  <details key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                    <summary style={{
                      padding: '14px 18px', fontWeight: 700, fontSize: 14, color: '#1F2937',
                      cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#F9FAFB',
                    }}>
                      <span>💬 {s.soru}</span>
                      <span style={{ color: kat.renk, fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
                    </summary>
                    <div style={{ padding: '16px 18px', fontSize: 14, color: '#374151', lineHeight: 1.7, background: 'white' }}>
                      {s.cevap}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* İlgili hastalıklar */}
          {ilgiliHastaliklar.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>İlgili Hastalıklar</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {ilgiliHastaliklar.map(ih => {
                  const ihKat = getKategori(ih.kategoriSlug);
                  return (
                    <Link
                      key={ih.slug}
                      href={`/hastaliklar/${ih.kategoriSlug}/${ih.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{ihKat?.icon || '🩺'}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{ih.ad}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{ihKat?.ad}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </article>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 60 }}>

          {/* İçindekiler */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', background: kat.bg, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: kat.renk }}>📑 Bu Sayfada</div>
            </div>
            <nav style={{ padding: '8px 0' }}>
              {navItems.map(item => (
                <a key={item.id} href={`#${item.id}`} style={{
                  display: 'block', padding: '7px 18px', fontSize: 13,
                  color: '#374151', textDecoration: 'none',
                }}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Uzman bul kartı */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: kat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 10px' }}>{kat.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)' }}>{h.uzmanlik} Uzmanı Bul</div>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0', lineHeight: 1.5 }}>
                Size en yakın {h.uzmanlik.toLowerCase()} uzmanıyla görüşün.
              </p>
            </div>
            <Link
              href={`/doktorlar?spec=${encodeURIComponent(h.uzmanlik)}`}
              style={{
                display: 'block', textAlign: 'center', background: kat.renk, color: 'white',
                fontWeight: 700, padding: '11px', borderRadius: 10, textDecoration: 'none', fontSize: 14,
                marginBottom: 8,
              }}
            >
              🔍 Doktor Ara
            </Link>
            <Link
              href={`/klinikler?spec=${encodeURIComponent(h.uzmanlik)}`}
              style={{
                display: 'block', textAlign: 'center', background: '#F3F4F6', color: '#374151',
                fontWeight: 600, padding: '10px', borderRadius: 10, textDecoration: 'none', fontSize: 13,
              }}
            >
              🏥 Klinik Bul
            </Link>
          </div>

          {/* Hızlı özet */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', marginBottom: 12 }}>📊 Hızlı Özet</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Ciddiyet</span>
                <span style={{ fontWeight: 700, color: ciddiyetRenk, background: ciddiyetBg, padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>
                  {h.ciddiyeti.charAt(0).toUpperCase() + h.ciddiyeti.slice(1)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Uzman</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{h.uzmanlik}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Yaş</span>
                <span style={{ fontWeight: 600, color: '#374151', textAlign: 'right', maxWidth: 130, lineHeight: 1.3 }}>{h.yasGrubu}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ color: '#6B7280' }}>Sıklık</span>
                <span style={{ fontWeight: 600, color: '#374151', textAlign: 'right', maxWidth: 130, lineHeight: 1.3, fontSize: 12 }}>{h.gorulmeOrani}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Belirtiler</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{h.belirtiler.length} adet</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Tedavi</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{h.tedaviSecenekleri.length} seçenek</span>
              </div>
            </div>
          </div>

          {/* Diğer hastalıklar */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: kat.bg }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: kat.renk }}>{kat.icon} {kat.ad} Hastalıkları</div>
            </div>
            <nav style={{ padding: '6px 0' }}>
              <Link
                href={`/hastaliklar/${kat.slug}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', textDecoration: 'none', fontSize: 13, color: '#374151' }}
              >
                <span>← Tüm hastalıklar</span>
              </Link>
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}
