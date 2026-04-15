'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { KlinikFilters } from '@/lib/types';

const UZMANLIK_ALANLARI = [
  'Diş Sağlığı', 'Ortodonti', 'İmplant', 'Estetik Diş Hekimliği',
  'Çocuk Diş Hekimliği', 'Periodontoloji', 'Endodonti', 'Ağız ve Çene Cerrahisi',
  'Protez', 'Diş Beyazlatma',
];

const TİP_SEÇENEKLERİ = ['Özel', 'Klinik', 'Diş Hekimi', 'Diş Kliniği', 'Diş Hastanesi'];

interface Props {
  iller: string[];
  filters: KlinikFilters;
}

export default function FilterPanel({ iller, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openSections, setOpenSections] = useState({
    il: true, uzmanlik: true, tip: true, rating: true
  });

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`/klinikler?${params.toString()}`);
  }, [searchParams, router]);

  const clearAll = () => router.push('/klinikler');

  const hasFilters = !!(filters.il || filters.ilce || filters.uzmanlik || filters.tip || filters.minRat || filters.q);

  const toggle = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside style={{
      background: 'white',
      borderRadius: '18px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)' }}>
          <i className="fa-solid fa-sliders" style={{ marginRight: '8px' }} />
          Filtrele
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              fontSize: '11px', color: 'var(--gold2)', fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Temizle
          </button>
        )}
      </div>

      {/* Şehir */}
      <Section
        label="Şehir"
        open={openSections.il}
        onToggle={() => toggle('il')}
      >
        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {iller.map(il => (
            <label key={il} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
              <input
                type="radio"
                name="il"
                value={il}
                checked={filters.il === il}
                onChange={() => updateFilter('il', filters.il === il ? null : il)}
                style={{ accentColor: 'var(--navy)' }}
              />
              <span style={{ fontSize: '13px' }}>{il}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Uzmanlık */}
      <Section
        label="Uzmanlık Alanı"
        open={openSections.uzmanlik}
        onToggle={() => toggle('uzmanlik')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {UZMANLIK_ALANLARI.map(u => (
            <label key={u} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
              <input
                type="checkbox"
                value={u}
                checked={filters.uzmanlik === u}
                onChange={() => updateFilter('uzmanlik', filters.uzmanlik === u ? null : u)}
                style={{ accentColor: 'var(--navy)' }}
              />
              <span style={{ fontSize: '13px' }}>{u}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Kurum Tipi */}
      <Section
        label="Kurum Tipi"
        open={openSections.tip}
        onToggle={() => toggle('tip')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TİP_SEÇENEKLERİ.map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
              <input
                type="checkbox"
                value={t}
                checked={filters.tip === t}
                onChange={() => updateFilter('tip', filters.tip === t ? null : t)}
                style={{ accentColor: 'var(--navy)' }}
              />
              <span style={{ fontSize: '13px' }}>{t}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Min. Puan */}
      <Section
        label="Min. Puan"
        open={openSections.rating}
        onToggle={() => toggle('rating')}
      >
        <div>
          <input
            type="range"
            min={1} max={5} step={0.5}
            defaultValue={filters.minRat || 1}
            style={{ width: '100%', accentColor: 'var(--gold)' }}
            onChange={e => {
              const val = parseFloat(e.target.value);
              updateFilter('minpuan', val > 1 ? String(val) : null);
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
            <span>1.0</span>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
              ≥ {filters.minRat?.toFixed(1) || '1.0'} ⭐
            </span>
            <span>5.0</span>
          </div>
        </div>
      </Section>
    </aside>
  );
}

// Collapsible bölüm
function Section({
  label, open, onToggle, children
}: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: 700, color: 'var(--text)',
        }}
      >
        {label}
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '10px', color: 'var(--muted)' }} />
      </button>
      {open && (
        <div style={{ padding: '4px 20px 16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
