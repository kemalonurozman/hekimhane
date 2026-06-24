'use client';

import { useRouter } from 'next/navigation';
import type { Doktor } from '@/lib/types';
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

export default function DoktorCard({ doktor: d }: { doktor: Doktor }) {
  const router = useRouter();

  const fullName    = `${d.ad} ${d.soyad}`.trim();
  const displayName = d.unvan ? `${d.unvan} ${fullName}` : fullName;
  const profileUrl  = d.slug ? `/doktorlar/${d.slug}` : `/doktorlar/${d.id}`;

  return (
    <>
      <style>{`
        .doktor-card {
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
        .doktor-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .doktor-card__body {
          display: flex;
          gap: 16px;
          padding: 18px 20px 14px;
          align-items: flex-start;
        }
        .doktor-card__avatar {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid var(--border);
        }
        .doktor-card__info { flex: 1; min-width: 0; }
        .doktor-card__name {
          font-weight: 700;
          font-size: 15px;
          color: var(--text);
          line-height: 1.3;
          margin-bottom: 5px;
        }
        .doktor-card__rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 7px;
        }
        .doktor-card__rat-num { font-size: 15px; font-weight: 800; color: var(--navy); line-height: 1; }
        .doktor-card__fee { font-size: 13px; font-weight: 700; color: var(--navy); margin-left: auto; background: rgba(27,58,105,.07); padding: 2px 8px; border-radius: 8px; }
        .doktor-card__rev { font-size: 11px; color: var(--muted); }
        .doktor-card__badges { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 7px; }
        .doktor-card__meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--muted); margin-bottom: 7px; }
        .doktor-card__meta-item { display: flex; align-items: center; gap: 4px; }
        .doktor-card__tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .doktor-card__footer { border-top: 1px solid var(--border); }
        .doktor-card__tel {
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
        .doktor-card__tel:hover { background: rgba(27,58,105,.04); }
        @media (max-width: 480px) {
          .doktor-card__body { padding: 14px 14px 12px; gap: 12px; }
          .doktor-card__avatar { width: 60px; height: 60px; }
          .doktor-card__name { font-size: 14px; }
        }
      `}</style>

      <div className="doktor-card" onClick={() => router.push(profileUrl)}>

        <div className="doktor-card__body">
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="doktor-card__avatar"
              style={{ background: d.photo ? 'transparent' : 'linear-gradient(135deg, var(--navy), var(--navy2))' }}>
              {d.photo
                ? <img src={d.photo} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
              }
            </div>
            {d.premium && <PremiumBadge />}
          </div>

          <div className="doktor-card__info">
            <div className="doktor-card__name">{displayName}</div>

            {/* Yıldız + puan + ücret aynı satırda */}
            <div className="doktor-card__rating-row">
              {d.rat > 0 && <>
                <span className="doktor-card__rat-num">{d.rat.toFixed(1)}</span>
                <Stars rat={d.rat} />
                {d.rev > 0 && <span className="doktor-card__rev">({d.rev})</span>}
              </>}
              {d.fee > 0 && (
                <span className="doktor-card__fee">{d.fee.toLocaleString('tr')} ₺</span>
              )}
            </div>

            <div className="doktor-card__badges">
              {d.spec    && <span className="badge badge-gold"  style={{ fontSize: '10px' }}>{d.spec}</span>}
              {d.verified && <span className="badge" style={{ fontSize: '10px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>✓ Onaylı</span>}
              {d.premium  && <span className="badge" style={{ fontSize: '10px', background: 'var(--gold-light)', color: 'var(--gold2)', border: '1px solid rgba(212,168,67,.3)' }}>⭐ Premium</span>}
              {d.online   && <span className="badge badge-green" style={{ fontSize: '10px' }}>Online Randevu</span>}
            </div>

            <div className="doktor-card__meta">
              {(d.il || d.ilce) && (
                <span className="doktor-card__meta-item">
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', fontSize: '11px' }} />
                  {[d.ilce, d.il].filter(Boolean).join(', ')}
                </span>
              )}
              {d.clinic_name && (
                <span className="doktor-card__meta-item">
                  <i className="fa-solid fa-hospital" style={{ color: 'var(--navy)', fontSize: '11px' }} />
                  {d.clinic_name}
                </span>
              )}
              {d.exp > 0 && (
                <span className="doktor-card__meta-item">
                  <i className="fa-solid fa-briefcase" style={{ color: 'var(--muted)', fontSize: '11px' }} />
                  {d.exp} yıl deneyim
                </span>
              )}
            </div>

            {d.tags && d.tags.length > 0 && (
              <div className="doktor-card__tags">
                {d.tags.slice(0, 3).map(t => (
                  <span key={t} className="badge badge-navy" style={{ fontSize: '10px', padding: '2px 8px' }}>{t}</span>
                ))}
                {d.tags.length > 3 && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>+{d.tags.length - 3}</span>}
              </div>
            )}
          </div>
        </div>

        {d.tel && (
          <div className="doktor-card__footer">
            <a href={`tel:${d.tel.replace(/\s/g,'')}`}
              onClick={e => e.stopPropagation()}
              className="doktor-card__tel">
              <i className="fa-solid fa-phone" style={{ fontSize: '11px', color: 'var(--gold)' }} />
              {d.tel}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
