'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { TarifeKategori } from '@/lib/ucret-tarifesi';
import { TEDAVI_BY_TARIFE_KOD } from '@/lib/tedavi-detaylari';

const TRMAP: Record<string, string> = { 'İ':'i','I':'i','ı':'i','Ş':'s','ş':'s','Ğ':'g','ğ':'g','Ü':'u','ü':'u','Ö':'o','ö':'o','Ç':'c','ç':'c' };
const norm = (s = '') => s.split('').map(c => TRMAP[c] ?? c).join('').toLowerCase().replace(/̇/g, '').trim();

export default function TarifeInteractive({ kategoriler, toplam }: { kategoriler: TarifeKategori[]; toplam: number }) {
  const [q, setQ] = useState('');
  const [acik, setAcik] = useState<string | null>(kategoriler[0]?.kod ?? null);

  const nq = norm(q);
  const filtreli = useMemo(() => {
    if (!nq) return kategoriler;
    return kategoriler
      .map(k => ({ ...k, items: k.items.filter(it => norm(it.ad).includes(nq) || norm(k.ad).includes(nq)) }))
      .filter(k => k.items.length > 0);
  }, [nq, kategoriler]);

  const bulunan = filtreli.reduce((s, k) => s + k.items.length, 0);
  const araniyor = nq.length > 0;

  return (
    <div>
      {/* Arama */}
      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        </span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tedavi ara — ör. kanal tedavisi, dolgu, implant, diş çekimi…"
          style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 14, border: '1.5px solid transparent', background: '#F1F0EB', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: 'var(--text)' }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--navy)'; e.currentTarget.style.background = '#fff'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#F1F0EB'; }} />
        {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#E5E1D8', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>✕</button>}
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        {araniyor ? <><strong style={{ color: 'var(--text)' }}>{bulunan}</strong> sonuç bulundu</> : <><strong style={{ color: 'var(--text)' }}>{toplam}</strong> işlem · {kategoriler.length} kategori</>}
      </div>

      {filtreli.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 18, border: '1px solid #EAE6DE', color: 'var(--muted)' }}>
          Aramanızla eşleşen tedavi bulunamadı.
        </div>
      ) : filtreli.map(k => {
        const open = araniyor || acik === k.kod;
        return (
          <div key={k.kod} style={{ background: 'white', borderRadius: 16, border: '1px solid #EAE6DE', marginBottom: 12, overflow: 'hidden' }}>
            <button onClick={() => !araniyor && setAcik(acik === k.kod ? null : k.kod)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', background: 'none', border: 'none', cursor: araniyor ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--gold-light)', color: 'var(--gold2, #9A7B1F)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{k.kod}</span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px' }}>{k.ad}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>({k.items.length})</span>
              </span>
              {!araniyor && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><path d="m6 9 6 6 6-6" /></svg>
              )}
            </button>
            {open && (
              <div style={{ borderTop: '1px solid #F0ECE4' }}>
                {k.items.map((it, i) => {
                  const detaySlug = TEDAVI_BY_TARIFE_KOD[it.kod];
                  const inner = (
                    <>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          {it.ad}
                          {detaySlug && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy)', background: '#EAF1FB', borderRadius: 6, padding: '1px 6px' }}>Detay →</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Kod {it.kod} · KDV hariç {it.kdvHaric} TL</div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{it.kdvDahil} <span style={{ fontSize: 12, fontWeight: 600 }}>TL</span></div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>KDV dahil</div>
                      </div>
                    </>
                  );
                  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '12px 18px', borderTop: i === 0 ? 'none' : '1px solid #F5F1E9', textDecoration: 'none' };
                  return detaySlug
                    ? <Link key={it.kod} href={`/tedavi-ucretleri/${detaySlug}`} style={{ ...rowStyle, background: '#FCFBF8' }}>{inner}</Link>
                    : <div key={it.kod} style={rowStyle}>{inner}</div>;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
