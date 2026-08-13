'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IL_LISTE, ILCELER } from '@/lib/tr-il-ilce';
import { DENTAL_SPECIALTIES } from '@/lib/uzmanlik-data';

const selStyle: React.CSSProperties = {
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
  width: '100%', padding: '13px 34px 13px 14px', borderRadius: 12,
  border: '1px solid rgba(255,255,255,.18)',
  background: 'rgba(255,255,255,.09)',
  color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  cursor: 'pointer', letterSpacing: '-.1px', boxSizing: 'border-box',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
};

function Chevron() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function HeroKonumSecici({ mounted }: { mounted: boolean }) {
  const router = useRouter();
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');
  const [uz, setUz] = useState('');
  const ilceler = ILCELER(il);

  function listele() {
    const p = new URLSearchParams();
    if (il) p.set('il', il);
    if (ilce) p.set('ilce', ilce);
    if (uz) p.set('uzmanlik', uz);
    const qs = p.toString();
    router.push(qs ? `/klinikler?${qs}` : '/klinikler');
  }

  return (
    <div className="hero-konum" style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity .7s ease .34s, transform .7s ease .34s',
    }}>
      <div className="hero-konum-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Konumdan seç — şehir ve ilçe seçip hekimleri listele
      </div>
      <div className="hero-konum-row">
        <div className="hero-konum-field">
          <select style={selStyle} value={il} aria-label="İl" onChange={e => { setIl(e.target.value); setIlce(''); }}>
            <option value="">İl seçin</option>
            {IL_LISTE.map(x => <option key={x} value={x} style={{ color: '#1D1D1F' }}>{x}</option>)}
          </select>
          <Chevron />
        </div>

        <div className="hero-konum-field">
          <select style={{ ...selStyle, opacity: il ? 1 : .55, cursor: il ? 'pointer' : 'not-allowed' }} value={ilce} aria-label="İlçe" disabled={!il} onChange={e => setIlce(e.target.value)}>
            <option value="">{il ? 'İlçe (tümü)' : 'Önce il seçin'}</option>
            {ilceler.map(x => <option key={x} value={x} style={{ color: '#1D1D1F' }}>{x}</option>)}
          </select>
          <Chevron />
        </div>

        <div className="hero-konum-field">
          <select style={selStyle} value={uz} aria-label="Sorun / Uzmanlık" onChange={e => setUz(e.target.value)}>
            <option value="">Sorun / uzmanlık (tümü)</option>
            {DENTAL_SPECIALTIES.map(x => <option key={x} value={x} style={{ color: '#1D1D1F' }}>{x}</option>)}
          </select>
          <Chevron />
        </div>

        <button type="button" onClick={listele} className="hero-konum-btn">
          Diş Hekimlerini Listele
        </button>
      </div>
    </div>
  );
}
