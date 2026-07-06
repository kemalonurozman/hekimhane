'use client';
import Link from 'next/link';
import { useCompare, removeCompare, clearCompare, type CompareItem, type CompareType } from '@/lib/compare';
import { formatTel } from '@/lib/helpers';

const TUR: Record<CompareType, { etiket: string; liste: string; listeAd: string }> = {
  doktor:  { etiket: 'Doktor',  liste: '/doktorlar',  listeAd: 'Doktorlar' },
  klinik:  { etiket: 'Klinik',  liste: '/klinikler',  listeAd: 'Klinikler' },
  hastane: { etiket: 'Hastane', liste: '/hastaneler', listeAd: 'Hastaneler' },
  eczane:  { etiket: 'Eczane',  liste: '/eczaneler',  listeAd: 'Eczaneler' },
};

interface Satir {
  label: string;
  render: (it: CompareItem) => React.ReactNode;
  /** Kazananın id'sini döndürür — o hücre vurgulanır */
  best?: (items: CompareItem[]) => string | null;
}

const bosDeger = <span style={{ color: '#C7C7CC' }}>—</span>;

function evetHayir(v?: boolean) {
  return v
    ? <span style={{ color: '#059669', fontWeight: 700 }}>✓ Evet</span>
    : <span style={{ color: '#C7C7CC' }}>—</span>;
}

// En yüksek sayısal değere sahip öğeyi bul (0/undefined hariç)
function enYuksek(items: CompareItem[], key: keyof CompareItem): string | null {
  let best: string | null = null, val = -Infinity;
  for (const it of items) {
    const v = Number(it[key] ?? 0);
    if (v > val && v > 0) { val = v; best = it.id; }
  }
  return items.filter(i => Number(i[key] ?? 0) === val && val > 0).length === 1 ? best : null;
}

// En düşük pozitif değere sahip öğeyi bul (örn. en uygun ücret)
function enDusuk(items: CompareItem[], key: keyof CompareItem): string | null {
  let best: string | null = null, val = Infinity;
  for (const it of items) {
    const v = Number(it[key] ?? 0);
    if (v > 0 && v < val) { val = v; best = it.id; }
  }
  return items.filter(i => Number(i[key] ?? 0) === val && val < Infinity).length === 1 ? best : null;
}

const puanSatiri: Satir = {
  label: 'Puan',
  best: items => enYuksek(items, 'rat'),
  render: it => it.rat && it.rat > 0
    ? <span><strong style={{ fontSize: 16, color: 'var(--navy)' }}>{it.rat.toFixed(1)}</strong>
        <span style={{ color: '#D4A843' }}> ★</span>
        {it.rev ? <span style={{ color: 'var(--muted)', fontSize: 12 }}> ({it.rev})</span> : null}</span>
    : bosDeger,
};
const konumSatiri: Satir = {
  label: 'Konum',
  render: it => [it.ilce, it.il].filter(Boolean).join(', ') || bosDeger,
};
const telSatiri: Satir = {
  label: 'Telefon',
  render: it => it.tel
    ? <a href={`tel:${it.tel.replace(/\D/g, '')}`} style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>{formatTel(it.tel)}</a>
    : bosDeger,
};
const onaySatiri: Satir = { label: 'Onaylı / Sahiplenilmiş', render: it => evetHayir(it.verified || it.claimed) };

const SATIRLAR: Record<CompareType, Satir[]> = {
  doktor: [
    puanSatiri,
    { label: 'Uzmanlık', render: it => it.spec || bosDeger },
    { label: 'Muayene Ücreti', best: items => enDusuk(items, 'fee'),
      render: it => it.fee && it.fee > 0 ? <strong>{it.fee.toLocaleString('tr')} ₺</strong> : bosDeger },
    { label: 'Deneyim', best: items => enYuksek(items, 'exp'),
      render: it => it.exp && it.exp > 0 ? `${it.exp} yıl` : bosDeger },
    { label: 'Çalıştığı Kurum', render: it => it.clinic_name || bosDeger },
    { label: 'Online Randevu', render: it => evetHayir(it.online) },
    konumSatiri, telSatiri,
    { label: 'Onaylı Hekim', render: it => evetHayir(it.verified) },
  ],
  klinik: [
    puanSatiri,
    { label: 'Tür', render: it => it.typeLabel || bosDeger },
    { label: 'Uzmanlık Alanları', render: it => it.specs?.length ? it.specs.slice(0, 6).join(', ') : bosDeger },
    { label: 'Online Randevu', render: it => evetHayir(it.online) },
    { label: 'Acil', render: it => evetHayir(it.acil) },
    konumSatiri, telSatiri, onaySatiri,
  ],
  hastane: [
    puanSatiri,
    { label: 'Tür', render: it => it.typeLabel || bosDeger },
    { label: 'Doktor Sayısı', best: items => enYuksek(items, 'docs'),
      render: it => it.docs && it.docs > 0 ? <strong>{it.docs}</strong> : bosDeger },
    { label: 'Yatak Sayısı', best: items => enYuksek(items, 'beds'),
      render: it => it.beds && it.beds > 0 ? <strong>{it.beds}</strong> : bosDeger },
    { label: 'Uzmanlık Alanları', render: it => it.specs?.length ? it.specs.slice(0, 6).join(', ') : bosDeger },
    konumSatiri, telSatiri, onaySatiri,
  ],
  eczane: [
    puanSatiri,
    { label: 'Eczacı', render: it => it.pharmacist || bosDeger },
    { label: 'Nöbetçi', render: it => evetHayir(it.nobetci) },
    konumSatiri, telSatiri,
    { label: 'Sahiplenilmiş', render: it => evetHayir(it.claimed) },
  ],
};

function BosDurum() {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '48px 20px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
        background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8E93',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /></svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1D1D1F', margin: '0 0 10px', letterSpacing: '-.4px' }}>
        Karşılaştırma listeniz boş
      </h1>
      <p style={{ fontSize: 15, color: '#6E6E73', lineHeight: 1.6, margin: '0 0 24px' }}>
        Listeleme sayfalarında kartların köşesindeki <strong>Karşılaştır</strong> düğmesine
        basarak aynı türden 2–3 öğe seçin, burada yan yana kıyaslayın.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['doktor', 'klinik', 'hastane', 'eczane'] as CompareType[]).map(t => (
          <Link key={t} href={TUR[t].liste} style={{
            padding: '10px 18px', borderRadius: 11, background: 'var(--navy)', color: 'white',
            fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
          }}>
            {TUR[t].listeAd}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function KarsilastirClient() {
  const items = useCompare();

  if (items.length === 0) {
    return (
      <main style={{ background: '#F5F5F7', minHeight: '100vh', paddingTop: 64 }}>
        <BosDurum />
      </main>
    );
  }

  const tur = items[0].type;
  const satirlar = SATIRLAR[tur];
  // Sabit ilk sütun (etiketler) + öğe sütunları
  const colW = `minmax(120px, 1.4fr)`;
  const gridCols = `${colW} repeat(${items.length}, minmax(150px, 1fr))`;

  return (
    <main style={{ background: '#F5F5F7', minHeight: '100vh', paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <div className="container" style={{ padding: '32px 20px 80px' }}>

        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <nav style={{ fontSize: 12.5, color: '#8E8E93', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link>
              <span>›</span>
              <Link href={TUR[tur].liste} style={{ color: 'inherit', textDecoration: 'none' }}>{TUR[tur].listeAd}</Link>
              <span>›</span>
              <span style={{ color: '#3A3A3C' }}>Karşılaştır</span>
            </nav>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.8px', color: '#1D1D1F', margin: 0 }}>
              {TUR[tur].etiket} Karşılaştırma
            </h1>
            <p style={{ fontSize: 14, color: '#6E6E73', margin: '6px 0 0' }}>
              {items.length} {TUR[tur].etiket.toLowerCase()} yan yana kıyaslanıyor
            </p>
          </div>
          <button onClick={clearCompare} style={{
            padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'white', color: '#6E6E73', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Listeyi Temizle
          </button>
        </div>

        {/* Karşılaştırma tablosu */}
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: gridCols,
            background: 'white', borderRadius: 18, border: '1px solid var(--border)',
            overflow: 'hidden', minWidth: 480,
          }}>

            {/* Başlık satırı — kartlar */}
            <div style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }} />
            {items.map(it => (
              <div key={it.id} style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', background: '#FAFAFA', position: 'relative' }}>
                <button onClick={() => removeCompare(it.type, it.id)} aria-label="Çıkar"
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 7, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', color: '#8E8E93', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
                <div style={{
                  width: 52, height: 52, borderRadius: tur === 'doktor' ? '50%' : 14, marginBottom: 10,
                  background: it.image ? 'transparent' : 'linear-gradient(135deg, var(--navy), var(--navy2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {it.image
                    ? <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>}
                </div>
                <Link href={it.url} style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', textDecoration: 'none', letterSpacing: '-.2px', lineHeight: 1.3, display: 'block' }}>
                  {it.name}
                </Link>
                {it.premium && <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, padding: '2px 7px' }}>★ Premium</span>}
              </div>
            ))}

            {/* Özellik satırları */}
            {satirlar.map((satir, ri) => {
              const kazanan = satir.best?.(items) ?? null;
              const sonSatir = ri === satirlar.length - 1;
              return (
                <div key={satir.label} style={{ display: 'contents' }}>
                  <div style={{
                    padding: '14px 16px', fontSize: 12.5, fontWeight: 600, color: '#6E6E73',
                    background: '#FAFAFA', borderBottom: sonSatir ? 'none' : '1px solid #F0F0F5',
                    display: 'flex', alignItems: 'center',
                  }}>
                    {satir.label}
                  </div>
                  {items.map(it => {
                    const kazandi = kazanan === it.id;
                    return (
                      <div key={it.id} style={{
                        padding: '14px 16px', fontSize: 13.5, color: '#1D1D1F', lineHeight: 1.5,
                        borderLeft: '1px solid var(--border)',
                        borderBottom: sonSatir ? 'none' : '1px solid #F0F0F5',
                        background: kazandi ? '#F0FDF4' : 'white',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {satir.render(it)}
                        {kazandi && (
                          <span title="En iyi değer" style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#DCFCE7', borderRadius: 5, padding: '1px 6px', flexShrink: 0 }}>
                            En iyi
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Profil linki satırı */}
            <div style={{ padding: '16px', background: '#FAFAFA' }} />
            {items.map(it => (
              <div key={it.id} style={{ padding: '16px', borderLeft: '1px solid var(--border)', background: '#FAFAFA' }}>
                <Link href={it.url} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0', borderRadius: 10, background: 'var(--navy)', color: 'white',
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}>
                  Profili Gör
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Daha fazla ekle ipucu */}
        {items.length < 3 && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#8E8E93', marginTop: 24 }}>
            <Link href={TUR[tur].liste} style={{ color: 'var(--navy)', fontWeight: 600 }}>
              {TUR[tur].listeAd} listesinden
            </Link>{' '}
            {3 - items.length} öğe daha ekleyebilirsiniz.
          </p>
        )}
      </div>
    </main>
  );
}
