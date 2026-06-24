'use client';

import Link from 'next/link';
import { useState } from 'react';

function IconTooth() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7C7 4.5 8.5 2.5 10 2.5Q11 4 12 5Q13 4 14 2.5C15.5 2.5 17 4.5 17 7C17 8.5 16.5 10 16 11.5C15.5 13 15.5 16 16 18.5C16.5 21 16 22 14.5 22C13.5 22 13 20.5 12.5 19L12 17L11.5 19C11 20.5 10.5 22 9.5 22C8 22 7.5 21 8 18.5C8.5 16 8.5 13 8 11.5C7.5 10 7 8.5 7 7Z" />
    </svg>
  );
}
function IconHospital() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12h6M12 9v6" />
      <path d="M3 9h18" />
    </svg>
  );
}
function IconDoctor() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M17 14h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
      <path d="M17 19v-4" />
    </svg>
  );
}
function IconPill() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

interface Kategori {
  href: string;
  label: string;
  desc: string;
  count: number;
  accent: string;
  bg: string;
  icon: React.ReactNode;
}

function KategoriKart({ k }: { k: Kategori }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={k.href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #E5E5EA',
          padding: '28px 24px 22px',
          boxShadow: hovered ? '0 10px 32px rgba(0,0,0,.1)' : '0 1px 4px rgba(0,0,0,.05)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'box-shadow .22s ease, transform .22s ease',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: k.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: k.accent, marginBottom: 18,
        }}>
          {k.icon}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-.3px' }}>
            {k.label}
          </span>
          {k.count > 0 && (
            <span style={{
              fontSize: 11.5, fontWeight: 600,
              color: k.accent, background: k.bg,
              borderRadius: 6, padding: '2px 7px',
              letterSpacing: '-.1px',
            }}>
              {k.count.toLocaleString('tr')}+
            </span>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#8E8E93', margin: '0 0 16px', lineHeight: 1.45, letterSpacing: '.05px' }}>
          {k.desc}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12.5, fontWeight: 600, color: k.accent,
        }}>
          Tümünü Gör <IconChevronRight />
        </div>
      </div>
    </Link>
  );
}

export default function KategoriKartlari({ stats }: { stats: { klinik: number; hastane: number; doktor: number; eczane: number } }) {
  const KATEGORILER: Kategori[] = [
    {
      href: '/klinikler',
      icon: <IconTooth />,
      label: 'Klinikler',
      desc: 'Diş klinikleri ve özel muayenehane',
      count: stats.klinik,
      accent: '#4338CA',
      bg: '#F0F0FF',
    },
    {
      href: '/hastaneler',
      icon: <IconHospital />,
      label: 'Hastaneler',
      desc: 'Devlet, özel ve üniversite hastaneleri',
      count: stats.hastane,
      accent: '#065F46',
      bg: '#EFFAF5',
    },
    {
      href: '/doktorlar',
      icon: <IconDoctor />,
      label: 'Doktorlar',
      desc: 'Uzman ve aile hekimleri',
      count: stats.doktor,
      accent: '#92400E',
      bg: '#FFFBEB',
    },
    {
      href: '/eczaneler',
      icon: <IconPill />,
      label: 'Eczaneler',
      desc: 'Nöbetçi ve çevre eczaneler',
      count: stats.eczane,
      accent: '#991B1B',
      bg: '#FFF5F5',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 14,
    }}>
      {KATEGORILER.map(k => (
        <KategoriKart key={k.href} k={k} />
      ))}
    </div>
  );
}
