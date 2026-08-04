'use client';

import Link from 'next/link';

export type PremiumItem = {
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

function bashHarfler(ad: string) {
  return ad.replace(/^(Uzm\.?|Dt\.?|Dr\.?|Op\.?|Prof\.?|Doç\.?)\s*/gi, '')
    .trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toLocaleUpperCase('tr');
}

function Yildizlar({ rat }: { rat: number }) {
  const dolu = Math.round(rat);
  return (
    <span style={{ display: 'inline-flex', gap: 1.5 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= dolu ? '#D4A843' : '#E1E3E8'}>
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
        .ocp-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;}
        .ocp-item{flex:1 1 300px;max-width:360px;min-width:0;background:#fff;border:1px solid #E5E5EA;border-radius:20px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05);text-decoration:none;display:flex;flex-direction:column;transition:box-shadow .2s,transform .2s;}
        .ocp-item:hover{box-shadow:0 12px 32px rgba(27,58,105,.14);transform:translateY(-3px);}
        .ocp-ph{position:relative;aspect-ratio:16/11;background:linear-gradient(135deg,#12294B,#1B3A69);overflow:hidden;}
        .ocp-ph img{width:100%;height:100%;object-fit:cover;display:block;}
      `}</style>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#D4A843', margin: '0 0 10px' }}>
              Öne Çıkan Üyeler
            </p>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#1B3A69', margin: 0 }}>
              Premium Diş Hekimleri &amp; Klinikler
            </h2>
          </div>
          <Link href="/klinikler" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1B3A69', textDecoration: 'none', flexShrink: 0 }}>
            Tümünü gör →
          </Link>
        </div>

        <div className="ocp-grid">
          {items.slice(0, 6).map((it, idx) => (
            <Link key={idx} href={it.href} className="ocp-item">
              <div className="ocp-ph">
                {it.foto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.foto} alt={it.ad} loading="lazy" />
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.9)', fontSize: 40, fontWeight: 800 }}>{bashHarfler(it.ad)}</div>}
                {/* Altın yıldız mührü (profildeki gibi) — "premium" yazısı yerine */}
                <span title="Premium üye" style={{ position: 'absolute', top: 11, left: 11, width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#EAC86B,#D4A843)', border: '2px solid rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.28)' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" /></svg>
                </span>
              </div>
              <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: '#D4A843', marginBottom: 6 }}>
                  {it.tip === 'doktor' ? 'Diş Hekimi' : 'Diş Kliniği'}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#12294B', letterSpacing: '-0.3px', lineHeight: 1.3, margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.ad}</h3>
                <div style={{ fontSize: 13, color: '#1B3A69', fontWeight: 600, marginBottom: 8 }}>{it.altbaslik}</div>
                {(it.il || it.ilce) && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6E6E73', marginBottom: 12 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {[it.ilce, it.il].filter(Boolean).join(', ')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 'auto' }}>
                  <Yildizlar rat={it.rev > 0 ? it.rat : 0} />
                  <span style={{ fontSize: 12, color: '#8E8E93' }}>{it.rev > 0 ? `${it.rat.toFixed(1)} (${it.rev})` : 'Yeni'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
