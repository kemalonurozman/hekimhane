'use client';

import { useRouter } from 'next/navigation';
import type { Hastane } from '@/lib/types';
import PremiumBadge from '@/components/PremiumBadge';

function Stars({ rat }: { rat: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i}
          className={`fa-${i <= Math.round(rat) ? 'solid' : 'regular'} fa-star`}
          style={{ fontSize: 13, color: i <= Math.round(rat) ? '#D4A843' : '#D1D5DB' }} />
      ))}
    </span>
  );
}

export default function HastaneCard({ hastane: h }: { hastane: Hastane }) {
  const router = useRouter();

  const il   = (h.il   || 'turkiye').toLowerCase().replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g').replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');
  const ilce = (h.ilce || 'merkez').toLowerCase().replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g').replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');
  const profileUrl = h.slug ? `/hastaneler/${il}/${ilce}/${h.slug}` : `/hastaneler/${h.id}`;
  const isPremium  = !!(h as any).premium;

  return (
    <>
      <style>{`
        .hc {
          background: white;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
          cursor: pointer;
          transition: box-shadow .2s, transform .2s;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .hc:hover { box-shadow: 0 10px 36px rgba(0,0,0,.12); transform: translateY(-2px); }
        .hc.hc--premium { border-color: #D4A843; box-shadow: 0 2px 16px rgba(212,168,67,.18); }

        /* ── Üst gövde: fotoğraf + içerik ── */
        .hc__top {
          display: flex;
          min-height: 190px;
        }

        /* Sol: fotoğraf (temiz, overlay yok) */
        .hc__img-wrap {
          width: 200px;
          flex-shrink: 0;
          align-self: stretch;
          background: linear-gradient(135deg, #065F46, #047857);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 190px;
        }
        .hc__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }

        /* Sağ: içerik */
        .hc__content {
          flex: 1;
          min-width: 0;
          padding: 18px 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* İsim + favori butonu */
        .hc__name-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .hc__name {
          font-size: 17px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.25;
          letter-spacing: -.3px;
        }
        .hc__fav {
          width: 32px; height: 32px;
          border-radius: 9px;
          border: 1px solid var(--border);
          background: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          transition: color .15s, border-color .15s;
        }
        .hc__fav:hover { color: #E53E3E; border-color: #FCA5A5; }

        /* Rozetler (artık fotoğraf dışında) */
        .hc__badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 9px;
        }

        /* Puan satırı (fotoğraf dışında) */
        .hc__rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 9px;
        }
        .hc__rat-num {
          font-size: 16px;
          font-weight: 800;
          color: var(--navy);
          line-height: 1;
        }
        .hc__rev {
          font-size: 11px;
          color: var(--muted);
        }

        /* Konum */
        .hc__meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 9px;
        }
        .hc__meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--muted);
        }

        /* İstatistik */
        .hc__stats {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 9px;
        }
        .hc__stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: var(--text);
          font-weight: 500;
        }

        /* Spec chips */
        .hc__specs {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: auto;
        }

        /* ── Alt footer: butonlar ── */
        .hc__footer {
          border-top: 1px solid var(--border);
          display: flex;
        }
        .hc__btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px 10px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
          transition: background .15s;
          border-right: 1px solid var(--border);
          color: var(--navy);
        }
        .hc__btn:last-child { border-right: none; }
        .hc__btn:hover { background: rgba(27,58,105,.05); }
        .hc__btn--primary {
          background: var(--navy);
          color: white;
          border-right-color: transparent;
        }
        .hc__btn--primary:hover { background: var(--navy2); }

        @media (max-width: 640px) {
          .hc__top { flex-direction: column; }
          .hc__img-wrap { width: 100%; height: 170px; }
          .hc__name { font-size: 15px; }
          .hc__content { padding: 14px 14px 12px; }
          .hc__btn { font-size: 12px; padding: 11px 6px; }
        }
      `}</style>

      <div className={`hc${isPremium ? ' hc--premium' : ''}`} onClick={() => router.push(profileUrl)}>

        {/* ── Üst: fotoğraf + içerik ── */}
        <div className="hc__top">

          {/* Fotoğraf — temiz, overlay yok */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="hc__img-wrap">
              {h.photos?.[0] || h.logo
                ? <img src={h.photos?.[0] || h.logo!} alt={h.name} className="hc__img" />
                : <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M3 21h18M9 21V7l6-4v18M9 11H3v10M15 11h6v10M9 7h6M12 11v4"/>
                  </svg>
              }
            </div>
            {isPremium && <PremiumBadge />}
          </div>

          {/* İçerik */}
          <div className="hc__content">

            {/* İsim + kalp */}
            <div className="hc__name-row">
              <div className="hc__name">{h.name}</div>
              <button className="hc__fav" onClick={e => e.stopPropagation()} aria-label="Favorilere ekle">
                <i className="fa-regular fa-heart" />
              </button>
            </div>

            {/* Rozetler — fotoğraf dışında */}
            <div className="hc__badges">
              {h.type    && <span className="badge badge-gold" style={{ fontSize: '11px' }}>{h.type}</span>}
              {isPremium && <span className="badge" style={{ fontSize: '11px', background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', color: '#92400E', border: '1px solid #F59E0B' }}>👑 Premium</span>}
              {h.claimed && <span className="badge" style={{ fontSize: '11px', background: '#065F46', color: 'white', border: 'none' }}>✓ Sahiplenildi</span>}
              {(h as any).acil && <span className="badge badge-red" style={{ fontSize: '11px' }}>🚑 7/24 Acil</span>}
            </div>

            {/* Puan + yıldız — fotoğraf dışında */}
            {h.rat > 0 && (
              <div className="hc__rating-row">
                <span className="hc__rat-num">{h.rat.toFixed(1)}</span>
                <Stars rat={h.rat} />
                {h.rev > 0 && <span className="hc__rev">({h.rev} yorum)</span>}
              </div>
            )}

            {/* Konum */}
            <div className="hc__meta">
              {(h.il || h.ilce) && (
                <div className="hc__meta-row">
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', fontSize: '11px', flexShrink: 0 }} />
                  <span>{[h.ilce, h.il].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {h.adres && (
                <div className="hc__meta-row">
                  <i className="fa-solid fa-building" style={{ fontSize: '10px', flexShrink: 0 }} />
                  <span>{h.adres.slice(0, 65)}{h.adres.length > 65 ? '…' : ''}</span>
                </div>
              )}
            </div>

            {/* Doktor / Yatak sayısı */}
            {(h.docs > 0 || h.beds > 0) && (
              <div className="hc__stats">
                {h.docs > 0 && <div className="hc__stat-item">
                  <i className="fa-solid fa-user-doctor" style={{ color: 'var(--navy)', fontSize: '11px' }} />
                  <span><strong>{h.docs}</strong> Doktor</span>
                </div>}
                {h.beds > 0 && <div className="hc__stat-item">
                  <i className="fa-solid fa-bed" style={{ color: 'var(--muted)', fontSize: '11px' }} />
                  <span><strong>{h.beds}</strong> Yatak</span>
                </div>}
              </div>
            )}

            {/* Uzmanlık */}
            {h.specs && h.specs.length > 0 && (
              <div className="hc__specs">
                {h.specs.slice(0, 3).map(s => (
                  <span key={s} className="badge badge-navy" style={{ fontSize: '10px', padding: '2px 9px' }}>{s}</span>
                ))}
                {h.specs.length > 3 && <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center' }}>+{h.specs.length - 3}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Alt footer: Telefon Edin + Detaylar ── */}
        <div className="hc__footer" onClick={e => e.stopPropagation()}>
          {h.tel
            ? <a href={`tel:${h.tel.replace(/\s/g,'')}`} className="hc__btn hc__btn--primary">
                <i className="fa-solid fa-phone" />
                Telefon Edin
              </a>
            : <button className="hc__btn hc__btn--primary" onClick={() => router.push(profileUrl)}>
                <i className="fa-solid fa-phone" />
                Telefon Edin
              </button>
          }
          <button className="hc__btn" onClick={() => router.push(profileUrl)}>
            <i className="fa-regular fa-file-lines" />
            Detaylar
          </button>
        </div>
      </div>
    </>
  );
}
