'use client';

import Link from 'next/link';
import { useState } from 'react';
import HkIconAnim from '@/components/HkIconAnim';

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

export default function KategoriKartlari({ stats }: { stats: { klinik: number; disHekimi: number } }) {
  const KATEGORILER: Kategori[] = [
    {
      href: '/klinikler',
      icon: <HkIconAnim name="clinic" size={28} playOnView />,
      label: 'Diş Klinikleri',
      desc: 'Diş klinikleri ve özel muayenehaneler',
      count: stats.klinik,
      accent: '#1A335E',
      bg: '#EEF2FF',
    },
    {
      href: '/doktorlar?spec=Di%C5%9F%20Hekimi',
      icon: <HkIconAnim name="doctor-profile" size={28} playOnView />,
      label: 'Diş Hekimleri',
      desc: 'Uzman diş hekimleri ve hekim profilleri',
      count: 0,
      accent: '#0E7490',
      bg: '#ECFEFF',
    },
    {
      href: '/hastaliklar/dis-sagligi',
      icon: <HkIconAnim name="health-info" size={28} playOnView />,
      label: 'Ağız & Diş Sağlığı',
      desc: 'Diş hastalıkları ve tedavi rehberi',
      count: 0,
      accent: '#4338CA',
      bg: '#F0F0FF',
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
