'use client';
import { useState } from 'react';
import { toggleCompare, useCompare, COMPARE_MAX, type CompareItem } from '@/lib/compare';

/** Kart köşesinde ("corner") veya bir satır içinde ("inline") yer alan
    "Karşılaştır" toggle butonu */
export default function CompareButton({ item, variant = 'corner' }: { item: CompareItem; variant?: 'corner' | 'inline' }) {
  const items = useCompare();
  const [flash, setFlash] = useState<'full' | null>(null);

  const active = items.some(i => i.type === item.type && i.id === item.id);
  const full = !active && items.length > 0 && items[0].type === item.type && items.length >= COMPARE_MAX;

  function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const res = toggleCompare(item);
    if (res === 'full') {
      setFlash('full');
      setTimeout(() => setFlash(null), 1600);
    }
  }

  const cornerPos: React.CSSProperties = variant === 'corner'
    ? { position: 'absolute', top: 12, right: 12, zIndex: 3, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }
    : { flexShrink: 0 };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={full ? `En fazla ${COMPARE_MAX} öğe karşılaştırabilirsiniz` : active ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
      style={{
        ...cornerPos,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 9,
        border: `1.5px solid ${active ? 'var(--navy)' : flash ? '#F59E0B' : 'var(--border)'}`,
        background: active ? 'var(--navy)' : 'rgba(255,255,255,.92)',
        color: active ? 'white' : flash ? '#B45309' : 'var(--muted)',
        fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit', letterSpacing: '-.1px',
        whiteSpace: 'nowrap',
        transition: 'all .15s',
      }}
    >
      {active ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /></svg>
      )}
      {flash === 'full' ? 'En fazla 3' : active ? 'Seçildi' : 'Karşılaştır'}
    </button>
  );
}
