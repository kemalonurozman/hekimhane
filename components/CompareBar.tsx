'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompare, removeCompare, clearCompare } from '@/lib/compare';

const TUR_ETIKET: Record<string, string> = {
  doktor: 'doktor', klinik: 'klinik', hastane: 'hastane', eczane: 'eczane',
};

export default function CompareBar() {
  const items = useCompare();
  const pathname = usePathname();

  if (items.length === 0 || pathname === '/karsilastir') return null;

  const tur = items[0]?.type;

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
      display: 'flex', justifyContent: 'center', padding: '0 12px 16px',
      pointerEvents: 'none',
    }}>
      <style>{`
        .compare-bar { display: flex; align-items: center; gap: 14px; flex-wrap: nowrap; }
        .compare-bar__items { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; min-width: 0; }
        .compare-bar__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .compare-bar { flex-direction: column; align-items: stretch; gap: 10px; }
          .compare-bar__items { flex-wrap: nowrap; overflow-x: auto; }
          .compare-bar__actions { justify-content: space-between; }
        }
      `}</style>
      <div className="compare-bar" style={{
        pointerEvents: 'auto',
        background: 'white', borderRadius: 16,
        border: '1px solid var(--border)',
        boxShadow: '0 12px 40px rgba(0,0,0,.16)',
        padding: '12px 16px', maxWidth: 720, width: '100%',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', flexShrink: 0 }}>
          Karşılaştır
        </span>

        {/* Seçilen öğeler */}
        <div className="compare-bar__items">
          {items.map(it => (
            <span key={it.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'var(--cream, #FBF8F2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '5px 8px 5px 10px', maxWidth: 200,
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {it.name}
              </span>
              <button onClick={() => removeCompare(it.type, it.id)} aria-label="Çıkar"
                style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>

        <div className="compare-bar__actions">
          <button onClick={clearCompare}
            style={{ border: 'none', background: 'none', color: 'var(--muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Temizle
          </button>
          <Link href="/karsilastir" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 11,
            background: items.length < 2 ? 'var(--border)' : 'var(--navy)',
            color: items.length < 2 ? 'var(--muted)' : 'white',
            fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
            letterSpacing: '-.1px', pointerEvents: items.length < 2 ? 'none' : 'auto',
          }}>
            Karşılaştır ({items.length})
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
