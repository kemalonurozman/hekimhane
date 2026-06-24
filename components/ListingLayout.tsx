'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
// ListMap kaldırıldı — harita sadece profil sayfasında gösterilir

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSection {
  key: string;
  label: string;
  type: 'radio' | 'checkbox' | 'search';
  options?: FilterOption[];
  placeholder?: string;
}

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tel?: string | null;
  type?: string | null;
  href: string;
}

export interface ListingLayoutProps {
  // Kimlik
  basePath: string;
  entityLabel: string;
  entityLabelPlural: string;

  // Görünüm
  color: string;
  gradient: string;
  icon: ReactNode;
  iconBg: string;

  // Başlık
  title: string;
  count: number;
  cityCount?: number;

  // Breadcrumb
  breadcrumb: Array<{ label: string; href: string }>;

  // Filtreler
  filterSections: FilterSection[];
  activeFilters: Record<string, string | undefined>;
  hasActiveFilters: boolean;

  // Harita (artık listeleme sayfasında kullanılmıyor, geriye dönük uyumluluk için tutuluyor)
  markers?: MapMarker[];

  // Sonuçlar
  children: ReactNode;
  totalPages: number;
  currentPage: number;
  searchParams: Record<string, string>;
}

// ── SVG İkon Bileşenleri ─────────────────────────────────────────────────────

function IcChevronRight() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
      <path d="M2 1.5 5 4 2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcChevronUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 6.5 5 3.5 8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcFilter() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M1 2.5h10M3 6h6M5 9.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IcSearch() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <circle cx="4.8" cy="4.8" r="3.3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7.3 7.3 9.8 9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IcCheck() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
      <path d="M1.5 4.5 3.5 6.5 7.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcX({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" fill="none" aria-hidden>
      <path d="M1.5 1.5 7.5 7.5M7.5 1.5 1.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IcReset() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M1.5 5a3.5 3.5 0 1 0 .65-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1.5 1.5v2.5H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcMapPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M6.5 1A3.5 3.5 0 0 1 10 4.5C10 7.5 6.5 12 6.5 12S3 7.5 3 4.5A3.5 3.5 0 0 1 6.5 1z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="6.5" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

function IcChevLeft() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M6.5 2 3.5 5 6.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcChevRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M3.5 2 6.5 5 3.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcSearchLg() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="17" cy="17" r="11" stroke="#C7D2E0" strokeWidth="2.5"/>
      <path d="M25 25 33 33" stroke="#C7D2E0" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function ListingLayout(props: ListingLayoutProps) {
  const {
    basePath, entityLabel, entityLabelPlural,
    color, gradient, icon, iconBg,
    title, count, cityCount,
    breadcrumb,
    filterSections, activeFilters, hasActiveFilters,
    markers,
    children, totalPages, currentPage, searchParams,
  } = props;

  const router   = useRouter();
  const sp       = useSearchParams();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(filterSections.map(s => [s.key, true]))
  );
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [filterDrawerOpen]);

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  }, [sp, router, basePath]);

  const clearAll = () => router.push(basePath);

  const activeChips = filterSections
    .filter(s => activeFilters[s.key])
    .map(s => ({ key: s.key, label: activeFilters[s.key]! }));

  // Shared aside content (used in both sidebar and drawer)
  const filterAsideContent = (
    <>
      {/* Sidebar / Drawer header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color }}>
            <IcFilter />
          </span>
          Filtrele
          {activeChips.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: color, color: 'white', fontSize: 10, fontWeight: 800 }}>{activeChips.length}</span>
          )}
        </span>
        {hasActiveFilters && (
          <button onClick={clearAll} style={{ fontSize: 11, color, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IcReset />Temizle
          </button>
        )}
      </div>

      {/* Filtre bölümleri */}
      {filterSections.map(section => (
        <FilterSectionBlock
          key={section.key}
          section={section}
          activeValue={activeFilters[section.key]}
          open={openSections[section.key] !== false}
          onToggle={() => setOpenSections(prev => ({ ...prev, [section.key]: !prev[section.key] }))}
          onUpdate={(v) => updateFilter(section.key, v)}
          color={color}
          basePath={basePath}
        />
      ))}
    </>
  );

  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* ── Responsive styles ────────────────────────────── */}
      <style>{`
        .listing-body {
          display: grid;
          grid-template-columns: 272px 1fr;
          gap: 24px;
          padding: 28px 32px;
          align-items: start;
        }
        .listing-sidebar {
          display: block;
        }
        .listing-mobile-filter-bar {
          display: none;
        }
        .listing-hero-container {
          padding: 32px 32px 0;
        }
        .listing-hero-title {
          font-size: 30px;
        }
        .listing-stat-number {
          font-size: 26px;
        }
        .listing-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 18px;
        }

        /* Mobile drawer overlay */
        .listing-drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(2px);
        }
        .listing-drawer-overlay.open {
          display: block;
        }
        .listing-drawer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: white;
          border-radius: 20px 20px 0 0;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(.32,.72,0,1);
          box-shadow: 0 -4px 40px rgba(0,0,0,.18);
        }
        .listing-drawer.open {
          transform: translateY(0);
        }
        .listing-drawer-scroll {
          overflow-y: auto;
          flex: 1;
          -webkit-overflow-scrolling: touch;
        }
        .listing-drawer-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--border);
          background: white;
          border-radius: 0 0 0 0;
        }
        .listing-drawer-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: #D1D5DB;
          margin: 12px auto 4px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .listing-body {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px 16px;
          }
          .listing-sidebar {
            display: none;
          }
          .listing-mobile-filter-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
          }
          .listing-hero-container {
            padding: 20px 16px 0;
          }
          .listing-hero-title {
            font-size: 22px !important;
          }
          .listing-stat-number {
            font-size: 20px !important;
          }
          .listing-icon-box {
            width: 48px !important;
            height: 48px !important;
            border-radius: 14px !important;
          }
          .listing-stat-strip {
            margin-left: -16px !important;
            margin-right: -16px !important;
            padding-left: 16px !important;
          }
          .listing-stat-item {
            padding: 10px 20px 10px 0 !important;
          }
          .listing-breadcrumb {
            padding: 9px 0 !important;
          }
          .listing-result-bar {
            padding: 10px 14px !important;
          }
          .listing-result-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .listing-result-count {
            font-size: 17px !important;
          }
        }

        @media (max-width: 480px) {
          .listing-body {
            padding: 12px 12px;
          }
          .listing-hero-container {
            padding: 16px 12px 0;
          }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ background: gradient, position: 'relative', overflow: 'hidden' }}>
        {/* Parçacık canvas animasyonu */}
        <HeroParticles />
        {/* Dekoratif daireler */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -120, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        {/* Breadcrumb */}
        <div className="listing-breadcrumb" style={{ borderBottom: '1px solid rgba(255,255,255,.12)', padding: '11px 0' }}>
          <div className="container" style={{ display: 'flex', gap: 6, fontSize: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {breadcrumb.map((b, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,.35)', display: 'flex' }}><IcChevronRight /></span>}
                {i === breadcrumb.length - 1
                  ? <span style={{ color: 'rgba(255,255,255,.9)', fontWeight: 600 }}>{b.label}</span>
                  : <Link href={b.href} style={{ color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>{b.label}</Link>}
              </span>
            ))}
          </div>
        </div>

        {/* Başlık ve istatistikler */}
        <div className="container listing-hero-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* İkon */}
              <div className="listing-icon-box" style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'rgba(255,255,255,.15)',
                border: '1.5px solid rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, backdropFilter: 'blur(4px)',
              }}>
                {icon}
              </div>
              <div>
                <h1 className="listing-hero-title" style={{
                  fontWeight: 800, color: 'white',
                  lineHeight: 1.15, marginBottom: 6,
                  letterSpacing: '-0.5px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                }}>
                  {title}
                </h1>
                {/* Aktif filtre chips */}
                {activeChips.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {activeChips.map(c => (
                      <span key={c.key} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: 'rgba(255,255,255,.15)', color: 'white',
                        border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(4px)',
                      }}>
                        {c.label}
                        <button onClick={() => updateFilter(c.key, null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 10, padding: 0, lineHeight: 1, display: 'flex' }}>
                          <IcX />
                        </button>
                      </span>
                    ))}
                    <button onClick={clearAll} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)',
                      border: '1px solid rgba(255,255,255,.18)', cursor: 'pointer',
                    }}>
                      <IcX />Filtreleri Temizle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="listing-stat-strip" style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,.12)', marginLeft: -32, marginRight: -32, paddingLeft: 32 }}>
            <div className="listing-stat-item" style={{ padding: '14px 28px 14px 0', borderRight: '1px solid rgba(255,255,255,.12)' }}>
              <div className="listing-stat-number" style={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>
                {count.toLocaleString('tr')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2, fontWeight: 500 }}>
                {entityLabelPlural} listelendi
              </div>
            </div>
            {cityCount !== undefined && (
              <div className="listing-stat-item" style={{ padding: '14px 28px' }}>
                <div className="listing-stat-number" style={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>{cityCount}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2, fontWeight: 500 }}>şehir</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div id="listing-body" className="container listing-body">

        {/* ── SOL: Filtre paneli (masaüstü) ─────────────── */}
        <aside className="listing-sidebar" style={{
          background: 'white', borderRadius: 20,
          border: '1px solid var(--border)', overflow: 'hidden',
          position: 'sticky', top: 82,
          boxShadow: '0 2px 16px rgba(0,0,0,.04)',
        }}>
          {filterAsideContent}
        </aside>

        {/* ── SAĞ: Sonuçlar ───────────────────────────── */}
        <div>
          {/* Mobil filtre butonu (yalnızca mobilde görünür) */}
          <div className="listing-mobile-filter-bar">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: 'white', border: '1.5px solid var(--border)',
                fontWeight: 700, fontSize: 14, color: 'var(--navy)',
                cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,.06)',
                position: 'relative',
              }}
            >
              <IcFilter />
              Filtrele
              {activeChips.length > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 18, height: 18, borderRadius: '50%',
                  background: color, color: 'white', fontSize: 10, fontWeight: 800,
                  marginLeft: 2,
                }}>
                  {activeChips.length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 12,
                  background: `${color}12`, border: `1.5px solid ${color}30`,
                  fontWeight: 600, fontSize: 13, color, cursor: 'pointer',
                }}
              >
                <IcReset />Temizle
              </button>
            )}
          </div>

          {/* Sonuç sayısı çubuğu */}
          <div className="listing-result-bar" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'white', borderRadius: 14, border: '1px solid var(--border)',
            padding: '12px 18px', marginBottom: 16, flexWrap: 'wrap', gap: 10,
            boxShadow: '0 1px 8px rgba(0,0,0,.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="listing-result-icon" style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
              <div>
                <span className="listing-result-count" style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.3px' }}>{count.toLocaleString('tr')}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 6 }}>{entityLabelPlural} bulundu</span>
              </div>
            </div>
            {activeChips.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {activeChips.map(c => (
                  <span key={c.key} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: `${color}12`, color, border: `1px solid ${color}30`,
                  }}>
                    {c.label}
                    <button onClick={() => updateFilter(c.key, null)} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: 10, padding: 0, display: 'flex' }}>
                      <IcX />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Kart listesi */}
          {children}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              basePath={basePath}
              searchParams={searchParams}
            />
          )}
        </div>
      </div>

      {/* ── Mobil Filtre Drawer ───────────────────────────── */}
      {/* Overlay */}
      <div
        className={`listing-drawer-overlay${filterDrawerOpen ? ' open' : ''}`}
        onClick={() => setFilterDrawerOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`listing-drawer${filterDrawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtrele"
      >
        {/* Handle */}
        <div className="listing-drawer-handle" />

        {/* Close button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 0', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>Filtreler</span>
          <button
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#F3F4F6', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)',
            }}
            aria-label="Kapat"
          >
            <IcX size={11} />
          </button>
        </div>

        {/* Scrollable filter content */}
        <div className="listing-drawer-scroll">
          {filterAsideContent}
        </div>

        {/* Footer — Uygula button */}
        <div className="listing-drawer-footer">
          <button
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: color, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 15, color: 'white',
              letterSpacing: '-0.2px',
            }}
          >
            {activeChips.length > 0
              ? `Uygula (${activeChips.length} filtre aktif)`
              : 'Uygula'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FilterSectionBlock ──────────────────────────────────────────────────────

function FilterSectionBlock({
  section, activeValue, open, onToggle, onUpdate, color,
}: {
  section: FilterSection;
  activeValue?: string;
  open: boolean;
  onToggle: () => void;
  onUpdate: (v: string | null) => void;
  color: string;
  basePath: string;
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={onToggle}
        style={{
          width: '100%', padding: '13px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, color: 'var(--text)',
        }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {section.label}
          {activeValue && (
            <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${color}18`, color }}>1</span>
          )}
        </span>
        <span style={{ color: 'var(--muted)', display: 'flex' }}>
          {open ? <IcChevronUp /> : <IcChevronDown />}
        </span>
      </button>

      {open && (
        <div style={{ padding: '2px 20px 14px' }}>
          {section.type === 'search' && (
            <LiveSearchInput
              sectionKey={section.key}
              activeValue={activeValue ?? null}
              placeholder={section.placeholder || 'Ara...'}
              color={color}
              onUpdate={onUpdate}
            />
          )}

          {(section.type === 'radio' || section.type === 'checkbox') && section.options && (
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'thin', paddingRight: 2 }}>
              {/* Tümü */}
              {(() => {
                const toplam = section.options.reduce((s, o) => s + (o.count || 0), 0);
                return (
                  <button onClick={() => onUpdate(null)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 8px', borderRadius: 8, fontSize: 13,
                      fontWeight: !activeValue ? 700 : 400,
                      background: !activeValue ? `${color}12` : 'transparent',
                      color: !activeValue ? color : 'var(--text)',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!activeValue && <IcCheck />}
                      Tümü
                    </span>
                    {toplam > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                        background: !activeValue ? `${color}20` : '#F3F4F6',
                        color: !activeValue ? color : '#6B7280', flexShrink: 0,
                      }}>
                        {toplam.toLocaleString('tr')}
                      </span>
                    )}
                  </button>
                );
              })()}

              {section.options.map(opt => {
                const isActive = activeValue === opt.value;
                return (
                  <button key={opt.value}
                    onClick={() => onUpdate(isActive ? null : opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 8px', borderRadius: 8, fontSize: 13,
                      fontWeight: isActive ? 700 : 400,
                      background: isActive ? `${color}12` : 'transparent',
                      color: isActive ? color : 'var(--text)',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'background .15s', gap: 6,
                    }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      {isActive && <span style={{ flexShrink: 0 }}><IcCheck /></span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                    </span>
                    {opt.count !== undefined && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 10, flexShrink: 0,
                        background: isActive ? `${color}20` : '#F3F4F6',
                        color: isActive ? color : '#6B7280',
                      }}>
                        {opt.count.toLocaleString('tr')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────────

function Pagination({ totalPages, currentPage, basePath, searchParams }: {
  totalPages: number;
  currentPage: number;
  basePath: string;
  searchParams: Record<string, string>;
}) {
  const pages = buildPageRange(currentPage, totalPages);
  const makeHref = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
      {currentPage > 1 ? (
        <Link href={makeHref(currentPage - 1)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'white', color: 'var(--navy)', border: '1px solid var(--border)', textDecoration: 'none' }}>
          <IcChevLeft />Önceki
        </Link>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'white', color: 'var(--muted)', border: '1px solid var(--border)', opacity: .4 }}>
          <IcChevLeft />Önceki
        </span>
      )}

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>…</span>
        ) : (
          <Link key={p} href={makeHref(p as number)}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              background: currentPage === p ? 'var(--navy)' : 'white',
              color: currentPage === p ? 'white' : 'var(--text)',
              border: `1.5px solid ${currentPage === p ? 'var(--navy)' : 'var(--border)'}`,
              transition: 'all .15s',
            }}>
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={makeHref(currentPage + 1)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'var(--navy)', color: 'white', border: '1px solid var(--navy)', textDecoration: 'none' }}>
          Sonraki<IcChevRight />
        </Link>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'white', color: 'var(--muted)', border: '1px solid var(--border)', opacity: .4 }}>
          Sonraki<IcChevRight />
        </span>
      )}
    </div>
  );
}

// ── HeroParticles ───────────────────────────────────────────────────────────

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    type Dot = { x: number; y: number; vx: number; vy: number; r: number; cross: boolean };
    let dots: Dot[] = [];

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const N = Math.floor((canvas.width * canvas.height) / 14000);
      dots = Array.from({ length: Math.min(N, 55) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - .5) * .45,
        vy: (Math.random() - .5) * .45,
        r: Math.random() * 1.8 + .8,
        cross: Math.random() < .28,
      }));
    };

    const drawCross = (x: number, y: number, size: number) => {
      const h = size * 1.6;
      ctx.lineWidth = .9;
      ctx.beginPath(); ctx.moveTo(x - h, y); ctx.lineTo(x + h, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y + h); ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bağlantı çizgileri
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${.13 * (1 - d / 110)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }

      // Noktalar ve çarpılar
      dots.forEach(d => {
        ctx.strokeStyle = 'rgba(255,255,255,.3)';
        ctx.fillStyle   = 'rgba(255,255,255,.22)';
        if (d.cross) {
          drawCross(d.x, d.y, d.r);
        } else {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }

        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });

      rafId = requestAnimationFrame(draw);
    };

    init();
    draw();

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        opacity: .85,
      }}
    />
  );
}

// ── LiveSearchInput — debounced, yazarken URL günceller ─────────────────────
function LiveSearchInput({
  sectionKey, activeValue, placeholder, color, onUpdate,
}: {
  sectionKey: string;
  activeValue: string | null;
  placeholder: string;
  color: string;
  onUpdate: (val: string | null) => void;
}) {
  const [value, setValue] = useState(activeValue || '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // activeValue dışarıdan değişirse (filtre temizleme) senkronize et
  useEffect(() => { setValue(activeValue || ''); }, [activeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onUpdate(v.trim() || null);
    }, 350);
  };

  // Enter tuşuyla da tetiklensin
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timerRef.current) clearTimeout(timerRef.current);
      onUpdate(value.trim() || null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--muted)', display: 'flex', pointerEvents: 'none',
      }}>
        <IcSearch />
      </span>
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 10px 8px 28px',
          borderRadius: 9, fontSize: 13, outline: 'none',
          border: `1.5px solid ${value ? color : 'var(--border)'}`,
          boxSizing: 'border-box', fontFamily: 'inherit',
          transition: 'border-color .15s',
        }}
      />
      {value && (
        <button
          onClick={() => { setValue(''); onUpdate(null); }}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: 14, lineHeight: 1, padding: 2,
          }}
          title="Temizle"
        >✕</button>
      )}
    </div>
  );
}

function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}
