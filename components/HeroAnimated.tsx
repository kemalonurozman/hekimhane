'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResults } from '@/app/api/search/route';
import HeroKonumSecici from '@/components/HeroKonumSecici';

// ── Sayaç animasyonu ─────────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref      = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || started.current || target === 0) return;
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const dur    = 1600;
      const start  = performance.now();
      function tick(now: number) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: .3 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString('tr')}{suffix}</span>;
}

// ── İkonlar ───────────────────────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".7s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// ── Canlı Arama Formu ─────────────────────────────────────────────────────────
const GRUPLAR_CONFIG = [
  { key: 'klinikler'  as const, baslik: 'Diş Kliniği',  renk: '#1B3A69', bg: '#EEF2FF' },
  { key: 'doktorlar'  as const, baslik: 'Diş Hekimi',   renk: '#0E7490', bg: '#ECFEFF' },
];

function LiveSearchForm({ mounted }: { mounted: boolean }) {
  const router = useRouter();
  const [q, setQ]         = useState('');
  const [sonuclar, setSonuclar] = useState<SearchResults | null>(null);
  const [acik, setAcik]   = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);

  // Dışarı tıklamada kapat
  useEffect(() => {
    function kapat(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    document.addEventListener('mousedown', kapat);
    return () => document.removeEventListener('mousedown', kapat);
  }, []);

  // ESC ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAcik(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const araDebounced = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) {
      setSonuclar(null);
      setAcik(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setYukleniyor(true);
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(val)}&scope=dental`);
        const data: SearchResults = await res.json();
        setSonuclar(data);
        // Sonuç olsun olmasın dropdown'ı aç — sonuç yoksa "bulunamadı + ekleme talebi" gösterilir
        setAcik(true);
      } catch { /* ignore */ } finally {
        setYukleniyor(false);
      }
    }, 280);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQ(val);
    araDebounced(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAcik(false);
    const term = q.trim();
    if (!term) return;
    // Diş klinikleri listesine yönlendir
    router.push(`/klinikler?q=${encodeURIComponent(term)}`);
  }

  function handleSelect(href: string) {
    setAcik(false);
    router.push(href);
  }

  const aktifGruplar = GRUPLAR_CONFIG
    .map(g => ({ ...g, items: sonuclar?.[g.key] ?? [] }))
    .filter(g => g.items.length > 0);

  const sonucYok = sonuclar !== null && aktifGruplar.length === 0 && q.trim().length >= 2 && !yukleniyor;
  const dropdownAcik = acik && (aktifGruplar.length > 0 || sonucYok);

  return (
    <div
      ref={wrapRef}
      className="hero-search-form"
      style={{
        position: 'relative',
        zIndex: 50,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity .7s ease .3s, transform .7s ease .3s',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, width: '100%' }}>

        {/* Input + dropdown */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* İkon */}
          <div style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            color: yukleniyor ? '#1B3A69' : '#8E8E93',
            display: 'flex', pointerEvents: 'none',
            transition: 'color .2s',
          }}>
            {yukleniyor ? <IconSpinner /> : <IconSearch />}
          </div>

          {/* Input */}
          <input
            value={q}
            onChange={handleInput}
            onFocus={() => sonuclar && setAcik(true)}
            placeholder="Diş kliniği, diş hekimi veya ilçe ara…"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              borderRadius: dropdownAcik ? '14px 14px 0 0' : '14px',
              border: '1px solid #D9DCE3',
              borderBottom: dropdownAcik ? '1px solid #EEF0F4' : '1px solid #D9DCE3',
              background: '#FFFFFF',
              color: '#1D1D1F',
              fontSize: 15, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
              letterSpacing: '-.1px',
              boxShadow: '0 6px 24px rgba(27,58,105,.08)',
              transition: 'border-radius .15s, border-bottom .15s',
            }}
          />

          {/* Dropdown */}
          {dropdownAcik && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0, right: 0,
              background: 'white',
              borderRadius: '0 0 14px 14px',
              border: '1px solid #D9DCE3', borderTop: 'none',
              boxShadow: '0 20px 50px rgba(27,58,105,.14)',
              zIndex: 9999,
              overflow: 'hidden',
              maxHeight: 400,
              overflowY: 'auto',
            }}>
              {/* Sonuç bulunamadı — ekleme talebi */}
              {sonucYok && (
                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: '#F5F5F7', margin: '0 auto 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#8E8E93',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 11h6" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-.2px', marginBottom: 4 }}>
                    &ldquo;{q.trim()}&rdquo; için sonuç bulunamadı
                  </div>
                  <p style={{ fontSize: 12.5, color: '#6E6E73', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Aradığınız diş kliniği veya diş hekimi henüz sistemimizde yok.
                    Eklenmesini isterseniz bize bildirebilirsiniz.
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setAcik(false);
                        router.push(`/katil?oneri=${encodeURIComponent(q.trim())}`);
                      }}
                      style={{
                        padding: '9px 18px', borderRadius: 10,
                        background: '#1B3A69', color: 'white',
                        fontSize: 13, fontWeight: 600, border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-.1px',
                      }}
                    >
                      Ekleme Talebi Gönder
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setAcik(false);
                        router.push(`/klinikler?q=${encodeURIComponent(q.trim())}`);
                      }}
                      style={{
                        padding: '9px 18px', borderRadius: 10,
                        background: '#F5F5F7', color: '#1B3A69',
                        fontSize: 13, fontWeight: 600, border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-.1px',
                      }}
                    >
                      Detaylı Ara
                    </button>
                  </div>
                </div>
              )}

              {aktifGruplar.map((grup, gi) => (
                <div key={grup.key}>
                  {gi > 0 && (
                    <div style={{ height: 1, background: '#F0F0F5', margin: '0 12px' }} />
                  )}

                  {/* Grup başlığı */}
                  <div style={{
                    padding: '10px 16px 4px',
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '1px', textTransform: 'uppercase',
                    color: grup.renk,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: grup.renk,
                      flexShrink: 0,
                    }} />
                    {grup.baslik}
                  </div>

                  {/* Sonuçlar */}
                  {grup.items.map((item, ii) => (
                    <button
                      key={ii}
                      onMouseDown={(e) => { e.preventDefault(); handleSelect(item.href); }}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 2,
                        width: '100%', padding: '9px 16px 9px 28px',
                        background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit',
                        overflow: 'hidden',
                        minWidth: 0,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = grup.bg; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <span style={{
                        fontSize: 13.5, fontWeight: 600,
                        color: '#1D1D1F', letterSpacing: '-.2px',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}>
                        {item.ad}
                      </span>
                      {item.alt && (
                        <span style={{
                          fontSize: 11.5, color: '#6E6E73', letterSpacing: '.1px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          display: 'block',
                        }}>
                          {item.alt}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {/* Alt bar — tüm sonuçları gör */}
              {aktifGruplar.length > 0 && (
              <div style={{
                padding: '10px 16px 12px',
                borderTop: '1px solid #F0F0F5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 11.5, color: '#9999A8' }}>
                  {aktifGruplar.reduce((s, g) => s + g.items.length, 0)} sonuç bulundu
                </span>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setAcik(false);
                    if (q.trim()) router.push(`/klinikler?q=${encodeURIComponent(q.trim())}`);
                  }}
                  style={{
                    fontSize: 12, color: '#1B3A69', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, fontFamily: 'inherit', letterSpacing: '-.1px',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  Tüm sonuçlar
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              )}
            </div>
          )}
        </div>

        {/* Ara butonu */}
        <button type="submit" style={{
          padding: '16px 28px', borderRadius: 14, border: 'none',
          background: '#1B3A69',
          color: 'white', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', letterSpacing: '-.1px',
          flexShrink: 0, fontFamily: 'inherit',
          boxShadow: '0 2px 8px rgba(27,58,105,.22)',
          alignSelf: 'flex-start',
        }}>
          Ara
        </button>
      </form>

      {/* Hızlı filtre butonları — doğrudan aramaya götürür */}
      <div className="hero-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, justifyContent: 'center' }}>
        {([
          ['İmplant', `/klinikler?uzmanlik=${encodeURIComponent('İmplantoloji (İmplant)')}`],
          ['Ortodonti', `/klinikler?uzmanlik=${encodeURIComponent('Ortodonti (Diş Teli)')}`],
          ['Estetik Diş', `/klinikler?uzmanlik=${encodeURIComponent('Estetik Diş Hekimliği')}`],
          ['Kanal Tedavisi', `/klinikler?uzmanlik=${encodeURIComponent('Endodonti (Kanal Tedavisi)')}`],
          ['Çocuk Diş', `/klinikler?uzmanlik=${encodeURIComponent('Pedodonti (Çocuk Diş Hekimliği)')}`],
          ['Tüm Klinikler →', '/klinikler'],
        ] as [string, string][]).map(([label, href]) => (
          <a key={href} href={href}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 15px', borderRadius: 999,
              background: '#FFFFFF', border: '1px solid #E0E3E9', color: '#1B3A69',
              fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '-.1px',
              whiteSpace: 'nowrap', transition: 'background .15s, border-color .15s' }}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
// ── Hekimlere seslenen dönen şerit ───────────────────────────────────────────
// Başlık hastalara yönelik kalır; bu şerit arama alanının altında işletme
// sahiplerine panelin sunduklarını sırayla anlatır ve /katil sayfasına götürür.
// Her açılışta farklı bir madde ile başlar; hareketi azalt tercihinde sabit kalır.
const HEKIM_OZELLIKLERI = [
  'Randevularınızı tüm platformlardan yönetin',
  'Randevu öncesi hastanıza hatırlatma e-postası',
  'Gelir ve giderinizi tek ekrandan takip edin',
  'Rezervasyon sistemini sitenize ücretsiz ekleyin',
  'Yapay zeka asistanınızla günlük planınızı yönetin',
  'HekimKart ile dijital kartvizitinizi paylaşın',
];

function HekimSerit({ mounted }: { mounted: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(Math.floor(Math.random() * HEKIM_OZELLIKLERI.length));
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(n => (n + 1) % HEKIM_OZELLIKLERI.length), 3600);
    return () => clearInterval(t);
  }, []);

  return (
    <a href="/katil" className="hekim-serit" style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity .8s ease .45s, transform .8s ease .45s',
    }}>
      <span className="hekim-serit-etiket">Diş hekimleri için</span>
      <span className="hekim-serit-metin" aria-live="polite">
        <span key={i} className="hekim-serit-ic">{HEKIM_OZELLIKLERI[i]}</span>
      </span>
      <span className="hekim-serit-ok" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
    </a>
  );
}

interface Props {
  stats: { klinik: number; disHekimi: number };
}

export default function HeroAnimated({ stats }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const statItems = [
    { label: 'Diş Kliniği', val: stats.klinik,    suffix: '+' },
    { label: 'İl',          val: 81,              suffix: ''  },
  ];

  return (
    <section style={{
      position: 'relative',
      background: 'radial-gradient(900px 480px at 50% -12%, #E9F0FB 0%, rgba(233,240,251,0) 70%), #FBFBFD',
      borderBottom: '1px solid #E5E5EA',
      padding: '92px 0 88px',
      /* overflow: hidden kaldırıldı — dropdown'ın section dışına çıkmasına izin ver */
    }}>
      {/* dangerouslySetInnerHTML: children olarak verilen CSS'teki ">" sunucuda
          escape edilip hydration hatasına yol açıyordu */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-section {
          padding: 92px 0 88px;
        }
        .hero-chips a:hover { background: #F2F4F8 !important; border-color: #CBD2DE !important; }
        /* Dönen başlık: satır yüksekliği sabit (sayfa zıplamasın), metin gradyanla boyanır
           ve içinden parlak bir şerit süzülür */
        .hero-donen { display: inline-block; min-height: 1.12em; padding: 0 .06em .08em; white-space: nowrap; }
        @media (max-width: 360px) { .hero-donen { font-size: .88em; } }
        .hero-donen-ic {
          display: inline-block;
          background: linear-gradient(100deg, #2F5591 0%, #4A6A9A 30%, #D4A843 45%, #FFF3C4 50%, #D4A843 55%, #4A6A9A 70%, #2F5591 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: heroGir .7s cubic-bezier(.2,.8,.2,1) both, heroParilti 3.2s ease-in-out infinite;
        }
        @keyframes heroGir {
          from { opacity: 0; transform: translateY(.35em); filter: blur(8px); }
          to   { opacity: 1; transform: none;             filter: blur(0); }
        }
        @keyframes heroParilti {
          0%   { background-position: 100% 0; }
          100% { background-position: 0% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-donen-ic { animation: none; background-position: 60% 0; }
        }
        /* Hekimlere seslenen dönen şerit — arama alanının altında, /katil'e götürür */
        .hekim-serit {
          display: inline-flex; align-items: center; gap: 10px;
          max-width: 100%; margin: 22px auto 0;
          padding: 9px 16px 9px 10px; border-radius: 999px;
          background: #FFFFFF; border: 1px solid #E2E7F0;
          box-shadow: 0 4px 16px rgba(27,58,105,.07);
          text-decoration: none; color: #1B3A69;
          transition: border-color .18s, box-shadow .18s, transform .18s;
        }
        .hekim-serit:hover {
          border-color: #C9D4E6; box-shadow: 0 8px 26px rgba(27,58,105,.13); transform: translateY(-1px);
        }
        .hekim-serit-etiket {
          flex-shrink: 0; padding: 3px 10px; border-radius: 999px;
          background: linear-gradient(135deg,#D4A843,#BE8F2C); color: #fff;
          font-size: 10.5px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase;
        }
        .hekim-serit-metin {
          position: relative; display: block; overflow: hidden;
          min-width: 0; height: 1.5em; line-height: 1.5em;
          font-size: 14px; font-weight: 600; color: #3C4A61; text-align: left;
        }
        .hekim-serit-ic {
          display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          animation: seritGir .55s cubic-bezier(.2,.8,.2,1) both;
        }
        .hekim-serit-ok { flex-shrink: 0; display: flex; color: #7C8AA3; }
        .hekim-serit:hover .hekim-serit-ok { color: #1B3A69; }
        @keyframes seritGir {
          from { opacity: 0; transform: translateY(1.1em); }
          to   { opacity: 1; transform: none; }
        }
        /* Telefon: rozet kendi satırında, metin tam genişlikte iki satıra kadar */
        @media (max-width: 560px) {
          .hekim-serit {
            display: flex; width: 100%; flex-direction: column; align-items: center;
            gap: 7px; padding: 12px 16px; border-radius: 16px; text-align: center;
          }
          .hekim-serit-metin { width: 100%; font-size: 13px; height: 2.9em; line-height: 1.45em; text-align: center; }
          .hekim-serit-ic { white-space: normal; }
          .hekim-serit-ok { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hekim-serit-ic { animation: none; }
        }
        .hero-search-form {
          max-width: 560px;
          margin: 0 auto 26px;
        }
        @media (max-width: 480px) {
          .hero-section {
            padding: 60px 0 64px !important;
          }
          .hero-search-form > form {
            flex-direction: column;
            gap: 10px;
          }
          .hero-search-form button[type="submit"] {
            width: 100%;
            justify-content: center;
            align-self: auto !important;
          }
        }
      ` }} />


      {/* İçerik */}
      <div className="container" style={{ position: 'relative', zIndex: 4, textAlign: 'center' }}>

        {/* Etiket */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(27,58,105,.06)',
          border: '1px solid rgba(27,58,105,.12)',
          borderRadius: 20, padding: '5px 14px',
          fontSize: 11, fontWeight: 600, color: '#1B3A69',
          letterSpacing: '1px', textTransform: 'uppercase',
          marginBottom: 26,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity .6s ease, transform .6s ease',
        }}>
          Türkiye Diş Sağlığı Rehberi
        </div>

        {/* Başlık */}
        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 72px)',
          fontWeight: 700,
          color: '#1B3A69',
          lineHeight: 1.06,
          letterSpacing: '-2.2px',
          margin: '0 0 18px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity .7s ease .1s, transform .7s ease .1s',
        }}>
          Size En Yakın Diş Hekimini<br />
          <span className="hero-donen"><span className="hero-donen-ic">Hızlıca Bulun</span></span>
        </h1>

        {/* Alt yazı */}
        <p style={{
          fontSize: 17, color: '#6E6E73',
          maxWidth: 520, margin: '0 auto 40px',
          lineHeight: 1.7, fontWeight: 400, letterSpacing: '.1px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity .7s ease .2s, transform .7s ease .2s',
        }}>
          {stats.klinik.toLocaleString('tr')}+ diş kliniği ve muayenehane
        </p>

        {/* ── Canlı Arama ─────────────────────────────────────────── */}
        <LiveSearchForm mounted={mounted} />

        {/* ── Konumdan seç: İl / İlçe / Sorun → Diş Hekimlerini Listele ── */}
        <HeroKonumSecici mounted={mounted} />

        {/* ── Hekimlere seslenen dönen şerit ── */}
        <HekimSerit mounted={mounted} />

        {/* İstatistik sayaçları */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: 'clamp(16px, 4vw, 56px)',
          flexWrap: 'wrap',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity .8s ease .4s, transform .8s ease .4s',
        }}>
          {statItems.map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(10px)',
              transition: `opacity .6s ease ${.45 + i * .08}s, transform .6s ease ${.45 + i * .08}s`,
            }}>
              <div style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 700, color: '#1B3A69',
                letterSpacing: '-1.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                <AnimatedCount target={s.val} suffix={s.suffix} />
              </div>
              <div style={{
                fontSize: 12, color: '#6E6E73',
                letterSpacing: '.8px', textTransform: 'uppercase',
                fontWeight: 500, marginTop: 6,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
