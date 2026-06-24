'use client';

import { useRouter } from 'next/navigation';
import type { Klinik } from '@/lib/types';
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

export default function KlinikCard({ klinik: k }: { klinik: Klinik }) {
  const router = useRouter();

  const profileUrl = k.slug
    ? `/klinikler/${encodeURIComponent(k.il || '').toLowerCase().replace(/%../g, s => s.toLowerCase())}/${encodeURIComponent(k.ilce || '').toLowerCase().replace(/%../g, s => s.toLowerCase())}/${k.slug}`
    : `/klinikler/${k.id}`;

  return (
    <>
      <style>{`
        .klinik-card {
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
        .klinik-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .klinik-card__body {
          display: flex;
          gap: 16px;
          padding: 18px 20px 14px;
          align-items: flex-start;
        }
        .klinik-card__icon {
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
        .klinik-card__info { flex: 1; min-width: 0; }
        .klinik-card__name {
          font-weight: 700;
          font-size: 15px;
          color: var(--text);
          line-height: 1.3;
          margin-bottom: 5px;
        }
        .klinik-card__rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 7px;
        }
        .klinik-card__rat-num {
          font-size: 15px;
          font-weight: 800;
          color: var(--navy);
          line-height: 1;
        }
        .klinik-card__rev { font-size: 11px; color: var(--muted); }
        .klinik-card__badges { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 7px; }
        .klinik-card__address {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 7px;
        }
        .klinik-card__specs { display: flex; gap: 5px; flex-wrap: wrap; }
        .klinik-card__footer { border-top: 1px solid var(--border); }
        .klinik-card__tel {
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
        .klinik-card__tel:hover { background: rgba(27,58,105,.04); }
        @media (max-width: 480px) {
          .klinik-card__body { padding: 14px 14px 12px; gap: 12px; }
          .klinik-card__icon { width: 60px; height: 60px; border-radius: 14px; }
          .klinik-card__name { font-size: 14px; }
        }
      `}</style>

      <div className="klinik-card" onClick={() => router.push(profileUrl)}>

        <div className="klinik-card__body">
          {/* İkon / Logo */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="klinik-card__icon"
              style={{ background: k.logo ? 'transparent' : 'linear-gradient(135deg, var(--navy), var(--navy2))' }}>
              {k.logo
                ? <img src={k.logo} alt={k.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>
                  </svg>
              }
            </div>
            {k.premium && <PremiumBadge />}
          </div>

          <div className="klinik-card__info">
            <div className="klinik-card__name">{k.name}</div>

            {k.rat > 0 && (
              <div className="klinik-card__rating-row">
                <span className="klinik-card__rat-num">{k.rat.toFixed(1)}</span>
                <Stars rat={k.rat} />
                {k.rev > 0 && <span className="klinik-card__rev">({k.rev})</span>}
              </div>
            )}

            <div className="klinik-card__badges">
              {k.type   && <span className="badge badge-gold"  style={{ fontSize: '10px' }}>{k.type}</span>}
              {k.online && <span className="badge badge-green" style={{ fontSize: '10px' }}>Online Randevu</span>}
              {k.acil   && <span className="badge badge-red"   style={{ fontSize: '10px' }}>Acil</span>}
              {k.claimed && <span className="badge" style={{ fontSize: '10px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>✓ Onaylı</span>}
            </div>

            {(k.il || k.adres) && (
              <div className="klinik-card__address">
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', fontSize: '11px', flexShrink: 0 }} />
                <span>
                  {[k.ilce, k.il].filter(Boolean).join(', ')}
                  {k.adres && <><span style={{ color: 'var(--border)' }}> · </span>{k.adres.slice(0,50)}{k.adres.length>50?'…':''}</>}
                </span>
              </div>
            )}

            {k.specs && k.specs.length > 0 && (
              <div className="klinik-card__specs">
                {k.specs.slice(0, 3).map(s => (
                  <span key={s} className="badge badge-navy" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
                ))}
                {k.specs.length > 3 && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>+{k.specs.length - 3}</span>}
              </div>
            )}
          </div>
        </div>

        {k.tel && (
          <div className="klinik-card__footer">
            <a href={`tel:${k.tel.replace(/\s/g,'')}`}
              onClick={e => e.stopPropagation()}
              className="klinik-card__tel">
              <i className="fa-solid fa-phone" style={{ fontSize: '11px', color: 'var(--gold)' }} />
              {k.tel}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
