'use client';

import { useRouter } from 'next/navigation';
import type { Eczane } from '@/lib/types';
import PremiumBadge from '@/components/PremiumBadge';

function Stars({ rat }: { rat: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`fa-${i <= Math.round(rat) ? 'solid' : 'regular'} fa-star`}
          style={{ fontSize: '12px', color: i <= Math.round(rat) ? '#D4A843' : '#D1D5DB' }} />
      ))}
    </span>
  );
}

export default function EczaneCard({ eczane: e }: { eczane: Eczane }) {
  const router = useRouter();
  const profileUrl = e.slug ? `/eczaneler/${e.slug}` : `/eczaneler/${e.id}`;

  return (
    <>
      <style>{`
        .eczane-card {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
          cursor: pointer;
          transition: box-shadow .18s, transform .18s;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .eczane-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .eczane-card__body {
          display: flex;
          gap: 16px;
          padding: 18px 20px 14px;
          align-items: flex-start;
        }
        .eczane-card__icon {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,.07);
        }
        .eczane-card__info { flex: 1; min-width: 0; }
        .eczane-card__name {
          font-weight: 700;
          font-size: 15px;
          color: var(--text);
          line-height: 1.3;
          margin-bottom: 5px;
        }
        .eczane-card__rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 7px;
        }
        .eczane-card__rat-num { font-size: 15px; font-weight: 800; color: var(--navy); line-height: 1; }
        .eczane-card__rev { font-size: 11px; color: var(--muted); }
        .eczane-card__badges { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 7px; }
        .eczane-card__meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--muted); }
        .eczane-card__meta-item { display: flex; align-items: center; gap: 4px; }
        .eczane-card__footer { border-top: 1px solid var(--border); }
        .eczane-card__tel {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--navy);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background .15s;
          font-family: inherit;
        }
        .eczane-card__tel:hover { background: rgba(27,58,105,.04); }
        @media (max-width: 480px) {
          .eczane-card__body { padding: 14px 14px 12px; gap: 12px; }
          .eczane-card__icon { width: 60px; height: 60px; border-radius: 14px; }
          .eczane-card__name { font-size: 14px; }
        }
      `}</style>

      <div className="eczane-card" onClick={() => router.push(profileUrl)}>

        <div className="eczane-card__body">
          {/* İkon */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="eczane-card__icon"
              style={{ background: e.logo ? 'transparent' : 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
              {e.logo
                ? <img src={e.logo} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                    <path d="m8.5 8.5 7 7"/>
                  </svg>
              }
            </div>
            {e.premium && <PremiumBadge />}
          </div>

          <div className="eczane-card__info">
            <div className="eczane-card__name">{e.name}</div>

            {/* Puan */}
            {e.rat != null && e.rat > 0 && (
              <div className="eczane-card__rating-row">
                <span className="eczane-card__rat-num">{e.rat.toFixed(1)}</span>
                <Stars rat={e.rat} />
                {e.rev != null && e.rev > 0 && <span className="eczane-card__rev">({e.rev})</span>}
              </div>
            )}

            <div className="eczane-card__badges">
              {e.nobetci && (
                <span className="badge badge-red" style={{ fontSize: '10px' }}>🌙 Nöbetçi</span>
              )}
              {e.claimed && (
                <span className="badge" style={{ fontSize: '10px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>✓ Onaylı</span>
              )}
            </div>

            <div className="eczane-card__meta">
              {(e.il || e.ilce) && (
                <span className="eczane-card__meta-item">
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', fontSize: '11px' }} />
                  {[e.ilce, e.il].filter(Boolean).join(', ')}
                </span>
              )}
              {e.address && (
                <span className="eczane-card__meta-item">
                  <i className="fa-solid fa-map-pin" style={{ fontSize: '10px' }} />
                  {e.address.slice(0, 45)}{e.address.length > 45 ? '…' : ''}
                </span>
              )}
              {e.pharmacist && (
                <span className="eczane-card__meta-item">
                  <i className="fa-solid fa-user" style={{ fontSize: '10px' }} />
                  {e.pharmacist}
                </span>
              )}
            </div>
          </div>
        </div>

        {e.tel && (
          <div className="eczane-card__footer">
            <a href={`tel:${e.tel.replace(/\s/g,'')}`}
              onClick={ev => ev.stopPropagation()}
              className="eczane-card__tel">
              <i className="fa-solid fa-phone" style={{ fontSize: '11px', color: 'var(--gold)' }} />
              {e.tel}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
