'use client';

import { useState, useEffect } from 'react';
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

export default function OneCikanHekimler({ items }: { items: PremiumItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(() => setI(p => (p + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!n) return null;

  return (
    <section style={{ padding: '64px 0', background: '#FFFFFF' }}>
      <style>{`
        .ocp-card{display:flex;align-items:stretch;gap:0;min-height:300px;}
        .ocp-photo{flex:0 0 42%;position:relative;overflow:hidden;background:linear-gradient(135deg,#12294B,#1B3A69);}
        .ocp-photo img{width:100%;height:100%;object-fit:cover;display:block;}
        .ocp-body{flex:1;padding:40px 44px;display:flex;flex-direction:column;justify-content:center;min-width:0;}
        @media (max-width:760px){
          .ocp-card{flex-direction:column;min-height:0;}
          .ocp-photo{flex:none;height:220px;}
          .ocp-body{padding:26px 24px;}
        }
      `}</style>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
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

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          style={{ position: 'relative', borderRadius: 24, border: '1px solid #E5E5EA', overflow: 'hidden', boxShadow: '0 10px 40px rgba(27,58,105,.10)' }}>
          {/* Kayan şerit */}
          <div style={{ display: 'flex', transform: `translateX(-${i * 100}%)`, transition: 'transform .6s cubic-bezier(.4,0,.2,1)' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ flex: '0 0 100%', minWidth: 0 }}>
                <div className="ocp-card">
                  <div className="ocp-photo">
                    {it.foto
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={it.foto} alt={it.ad} loading="lazy" />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.9)', fontSize: 54, fontWeight: 800, letterSpacing: '1px' }}>{bashHarfler(it.ad)}</div>}
                    <span style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#E8C56A,#D4A843)', color: '#12294B', fontSize: 11.5, fontWeight: 800, letterSpacing: '.4px', borderRadius: 20, padding: '5px 12px', boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#12294B"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" /></svg>
                      PREMIUM
                    </span>
                  </div>
                  <div className="ocp-body">
                    <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: '#D4A843', marginBottom: 8 }}>
                      {it.tip === 'doktor' ? 'Diş Hekimi' : 'Diş Kliniği'}
                    </span>
                    <h3 style={{ fontSize: 'clamp(19px,2.6vw,25px)', fontWeight: 800, color: '#12294B', letterSpacing: '-0.5px', lineHeight: 1.2, margin: '0 0 6px' }}>{it.ad}</h3>
                    <div style={{ fontSize: 14.5, color: '#1B3A69', fontWeight: 600, marginBottom: 12 }}>{it.altbaslik}</div>

                    {(it.il || it.ilce) && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#6E6E73', marginBottom: 14 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {[it.ilce, it.il].filter(Boolean).join(', ')}
                      </div>
                    )}

                    {it.ozellikler.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
                        {it.ozellikler.slice(0, 4).map((o, k) => (
                          <span key={k} style={{ fontSize: 12, fontWeight: 600, color: '#1B3A69', background: '#EEF3FA', border: '1px solid #DCE6F4', borderRadius: 8, padding: '5px 11px' }}>{o}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <Link href={it.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1B3A69,#12294B)', color: '#fff', fontSize: 14, fontWeight: 700, borderRadius: 12, padding: '12px 22px', textDecoration: 'none', boxShadow: '0 6px 18px rgba(27,58,105,.28)' }}>
                        Profili Gör
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </Link>
                      {it.rev > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, color: '#6E6E73' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="#D4A843"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" /></svg>
                          <strong style={{ color: '#12294B' }}>{it.rat.toFixed(1)}</strong> ({it.rev})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Noktalar */}
          {n > 1 && (
            <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 7 }}>
              {items.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Slayt ${k + 1}`}
                  style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: k === i ? '#D4A843' : 'rgba(27,58,105,.25)', transition: 'all .3s', padding: 0 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
