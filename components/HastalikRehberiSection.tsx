/**
 * HastalikRehberiSection — Ana sayfa "Hastalık Rehberi" bölümü
 * Server Component — etkileşim yok, doğrudan hastalik-data'dan veri çeker
 */

import Link from 'next/link';
import { KATEGORILER, HASTALIKLAR } from '@/lib/hastaliklar-data';

/* Kategori başına hastalık sayısı */
function countPerKategori() {
  const map: Record<string, number> = {};
  for (const h of HASTALIKLAR) {
    map[h.kategoriSlug] = (map[h.kategoriSlug] || 0) + 1;
  }
  return map;
}

export default function HastalikRehberiSection() {
  const sayiMap = countPerKategori();
  const toplamHastalik = HASTALIKLAR.length;

  return (
    <section style={{
      padding: '72px 0 80px',
      background: 'white',
      borderTop: '1px solid #E5E5EA',
    }}>
      <style>{`
        .hastalik-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .hastalik-kart {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 22px 20px 18px;
          border-radius: 18px;
          border: 1.5px solid #E5E5EA;
          background: white;
          text-decoration: none;
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s;
          cursor: pointer;
        }
        .hastalik-kart:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,.09);
          border-color: transparent;
          transform: translateY(-2px);
        }
        .hastalik-kart-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .hastalik-emoji-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 28px;
          line-height: 1;
        }
        .hastalik-sayi-chip {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .3px;
          padding: 3px 9px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hastalik-kart-ad {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #1D1D1F;
          margin: 0;
          line-height: 1.3;
        }
        .hastalik-kart-aciklama {
          font-size: 12.5px;
          color: #6E6E73;
          margin: 2px 0 0;
          line-height: 1.5;
        }
        .hastalik-kart-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: -.1px;
          margin-top: 6px;
          text-decoration: none;
        }
        @media (max-width: 1024px) {
          .hastalik-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .hastalik-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .hastalik-kart { padding: 16px 14px 14px; }
          .hastalik-emoji-wrap { width: 44px; height: 44px; font-size: 24px; }
        }
        @media (max-width: 480px) {
          .hastalik-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        }
      `}</style>

      <div className="container">
        {/* ── Başlık ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 40,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '1.2px',
              textTransform: 'uppercase', color: '#1B3A69',
              margin: '0 0 8px',
            }}>
              Sağlık Bilgi Merkezi
            </p>
            <h2 style={{
              fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px',
              color: '#1D1D1F', margin: '0 0 8px',
            }}>
              Hastalık Rehberi
            </h2>
            <p style={{ color: '#6E6E73', fontSize: 14.5, margin: 0 }}>
              {toplamHastalik}+ hastalık, belirtilerden tedaviye kapsamlı bilgi.
            </p>
          </div>

          <Link href="/hastaliklar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 10,
            border: '1.5px solid #1B3A69', color: '#1B3A69',
            fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
            letterSpacing: '-.2px', whiteSpace: 'nowrap',
          }}>
            Tümünü Gör
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── Kategori grid ── */}
        <div className="hastalik-grid">
          {KATEGORILER.map(kat => {
            const sayi = sayiMap[kat.slug] || 0;
            if (sayi === 0) return null;
            return (
              <Link
                key={kat.slug}
                href={`/hastaliklar/${kat.slug}`}
                className="hastalik-kart"
              >
                {/* Üst satır: emoji + sayı chip */}
                <div className="hastalik-kart-top">
                  <div
                    className="hastalik-emoji-wrap"
                    style={{ background: kat.bg }}
                  >
                    {kat.icon}
                  </div>
                  <span
                    className="hastalik-sayi-chip"
                    style={{ background: kat.bg, color: kat.renk }}
                  >
                    {sayi} hastalık
                  </span>
                </div>

                {/* Ad + açıklama */}
                <div>
                  <p className="hastalik-kart-ad">{kat.ad}</p>
                  <p className="hastalik-kart-aciklama">{kat.aciklama}</p>
                </div>

                {/* Link satırı */}
                <span className="hastalik-kart-link" style={{ color: kat.renk }}>
                  İncele
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
