'use client';

import Link from 'next/link';
import NoktaGrafik from '@/components/vitrin/NoktaGrafik';
import type { HkIkonAdi } from '@/lib/hk-icons';


interface Kategori {
  href: string;
  label: string;
  desc: string;
  count: number;
  accent: string;
  bg: string;
  icon: React.ReactNode;
  desen: HkIkonAdi;
  etiket: string;
}

// Vitrin dili: etiket + iri başlık + açıklama + köşede noktalı siluet (bkz. globals.css .vt-oz)
function KategoriKart({ k }: { k: Kategori }) {
  return (
    <Link href={k.href} className="vt-oz">
      <NoktaGrafik ikon={k.desen} size={170} />
      <span className="vt-oz__etiket">{k.count > 0 ? `${k.count.toLocaleString('tr-TR')} kayıt` : k.etiket}</span>
      <h3 className="vt-oz__ad">{k.label}</h3>
      <p className="vt-oz__metin">{k.desc}</p>
    </Link>
  );
}

export default function KategoriKartlari({ stats }: { stats: { klinik: number; disHekimi: number } }) {
  const KATEGORILER: Kategori[] = [
    {
      href: '/klinikler',
      icon: null, desen: 'clinic', etiket: 'Klinikler',
      label: 'Diş Klinikleri',
      desc: 'Diş klinikleri ve özel muayenehaneler',
      count: stats.klinik,
      accent: '#1A335E',
      bg: '#EEF2FF',
    },
    {
      href: '/doktorlar?spec=Di%C5%9F%20Hekimi',
      icon: null, desen: 'doctor-profile', etiket: 'Hekimler',
      label: 'Diş Hekimleri',
      desc: 'Uzman diş hekimleri ve hekim profilleri',
      count: 0,
      accent: '#0E7490',
      bg: '#ECFEFF',
    },
    {
      href: '/hastaliklar/dis-sagligi',
      icon: null, desen: 'health-info', etiket: 'Rehber',
      label: 'Ağız & Diş Sağlığı',
      desc: 'Diş hastalıkları ve tedavi rehberi',
      count: 0,
      accent: '#4338CA',
      bg: '#F0F0FF',
    },
  ];

  return (
    <div className="vt-izgara">
      {KATEGORILER.map(k => <KategoriKart key={k.href} k={k} />)}
    </div>
  );
}
