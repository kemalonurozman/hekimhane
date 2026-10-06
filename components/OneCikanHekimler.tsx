'use client';

import Link from 'next/link';
import SafeLogo from '@/components/SafeLogo';
import { basHarfler } from '@/lib/hk';

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

// Fotoğrafı olmayan kartlar için markaya uygun, telifsiz diş temalı jenerik görseller
const GENEL_GORSELLER = ['/premium/dis-1.svg', '/premium/dis-2.svg', '/premium/dis-3.svg', '/premium/dis-4.svg'];

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
        .ocp-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;}
        .ocp-item{flex:1 1 300px;max-width:360px;min-width:0;background:#fff;border:1px solid #E5E5EA;border-radius:20px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05);text-decoration:none;display:flex;flex-direction:column;transition:box-shadow .2s,transform .2s;}
        .ocp-item:hover{box-shadow:0 12px 32px rgba(26,51,94,.14);transform:translateY(-3px);}
        .ocp-ph{position:relative;aspect-ratio:16/11;background:linear-gradient(120deg,var(--tint-50),var(--tint-100));overflow:hidden;}
        .ocp-init{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:56px;letter-spacing:-.02em;color:var(--brand);}
        .ocp-ph img{width:100%;height:100%;object-fit:cover;display:block;}
      `}</style>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--gold-text)', margin: '0 0 10px' }}>
              Öne Çıkan Üyeler
            </p>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#1A335E', margin: 0 }}>
              Premium Diş Hekimleri &amp; Klinikler
            </h2>
          </div>
          <Link href="/klinikler" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1A335E', textDecoration: 'none', flexShrink: 0 }}>
            Tümünü gör →
          </Link>
        </div>

        <div className="ocp-grid">
          {items.slice(0, 9).map((it, idx) => (
            <Link key={idx} href={it.href} className="ocp-item">
              <div className="ocp-ph">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* Fotoğraf yoksa diş görseli değil baş harfler (tasarım sistemi: Avatar) */}
                <SafeLogo src={it.foto} alt={it.ad} fallback={<div className="ocp-init" aria-hidden="true">{basHarfler(it.ad)}</div>} />

                {/* Altın yıldız mührü (profildeki gibi) — "premium" yazısı yerine */}
                <span title="Premium üye" style={{ position: 'absolute', top: 11, left: 11, width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#EAC86B,#B8892F)', border: '2px solid rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.28)' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" /></svg>
                </span>
              </div>
              <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 6 }}>
                  {it.tip === 'doktor' ? 'Diş Hekimi' : 'Diş Kliniği'}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#12294B', letterSpacing: '-0.3px', lineHeight: 1.3, margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.ad}</h3>
                <div style={{ fontSize: 13, color: '#1A335E', fontWeight: 600, marginBottom: 8 }}>{it.altbaslik}</div>
                {(it.il || it.ilce) && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6E6E73', marginBottom: 12 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A335E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
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
