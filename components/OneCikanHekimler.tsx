'use client';

import Link from 'next/link';

export type PremiumItem = {
  /** Pro üye mi (altın mühür yalnız bunlarda). Yoksa true sayılır — eski çağrılarla uyum. */
  premium?: boolean;
  /** Yalnız sunucuda sıralama için (profil puanı) — arayüzde ASLA gösterilmez. */
  sira?: number;
  /** Yalnız sunucuda sıralama için (son güncelleme) — tarayıcıya gönderilmez. */
  guncel?: number;
  tip: 'klinik' | 'doktor';
  ad: string;
  altbaslik: string;
  il: string;
  ilce: string;
  ozellikler: string[];
  foto: string | null;
  href: string;
  rat: number;
  rev: number;
};

function Yildizlar({ rat }: { rat: number }) {
  const dolu = Math.round(rat);
  return (
    <span style={{ display: 'inline-flex', gap: 1.5 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= dolu ? '#B8892F' : '#E1E3E8'}>
          <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" />
        </svg>
      ))}
    </span>
  );
}

export default function OneCikanHekimler({ items }: { items: PremiumItem[] }) {
  if (!items.length) return null;

  return (
    <section style={{ padding: '60px 0', background: '#FFFFFF' }}>
      <style>{`
        .ocp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}
        .ocp-item{position:relative;display:flex;flex-direction:column;min-height:168px;padding:20px 20px 18px;border:1px solid var(--border);border-radius:18px;background:#fff;text-decoration:none;box-shadow:0 1px 2px rgba(14,26,44,.04);transition:box-shadow .22s,transform .22s,border-color .22s;}
        .ocp-item:hover{box-shadow:0 14px 34px -18px rgba(18,41,77,.38);transform:translateY(-2px);border-color:#C1CEE2;}
        .ocp-ad{margin:0 0 6px;padding-right:26px;font-size:16.5px;line-height:1.3;font-weight:700;letter-spacing:-.02em;color:#12294D;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        @media (max-width: 900px){.ocp-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media (max-width: 600px){.ocp-grid{grid-template-columns:minmax(0,1fr);gap:12px;}.ocp-item{min-height:0;padding:18px;}}
      `}</style>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--gold-text)', margin: '0 0 10px' }}>
              Öne Çıkan Üyeler
            </p>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#1A335E', margin: 0 }}>
              Diş Hekimleri &amp; Klinikler
            </h2>
          </div>
          <Link href="/klinikler" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1A335E', textDecoration: 'none', flexShrink: 0 }}>
            Tümünü gör →
          </Link>
        </div>

        {/* Fotoğrafsız, yalın kartlar: tür · ad · uzmanlık · konum · değerlendirme */}
        <div className="ocp-grid">
          {items.slice(0, 9).map((it, idx) => (
            <Link key={idx} href={it.href} className="ocp-item">
              {it.premium === true && (
                <span title="Pro üye" aria-label="Pro üye" style={{ position: 'absolute', top: 18, right: 18, width: 22, height: 22, borderRadius: '50%', background: '#F7F0DE', boxShadow: 'inset 0 0 0 1px #EAD9AE', display: 'grid', placeItems: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#B8892F"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" /></svg>
                </span>
              )}
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 8 }}>
                {it.tip === 'doktor' ? 'Diş Hekimi' : 'Diş Kliniği'}
              </span>
              <h3 className="ocp-ad">{it.ad}</h3>
              <div style={{ fontSize: 13.5, color: '#3C4A61', fontWeight: 500, marginBottom: 10 }}>{it.altbaslik}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F0F1F4' }}>
                {(it.il || it.ilce) ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6E6E73' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6.5-5.7-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.4" /></svg>
                    {[it.ilce, it.il].filter(Boolean).join(', ')}
                  </span>
                ) : <span />}
                {it.rev > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Yildizlar rat={it.rat} />
                    <span style={{ fontSize: 12, color: '#6E6E73', fontVariantNumeric: 'tabular-nums' }}>{it.rat.toFixed(1)} ({it.rev})</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: '#AEAEB2' }}>Henüz değerlendirme yok</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
