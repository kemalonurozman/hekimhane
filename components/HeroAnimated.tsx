'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResults } from '@/app/api/search/route';
import { IL_ILCE, IL_LISTE } from '@/lib/tr-il-ilce';
import { toSlug } from '@/lib/helpers';

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
  { key: 'klinikler'  as const, baslik: 'Diş Kliniği',  renk: '#1A335E', bg: '#EEF2FF' },
  { key: 'doktorlar'  as const, baslik: 'Diş Hekimi',   renk: '#0E7490', bg: '#ECFEFF' },
];

/** Konum alanı: "İzmir", "kadıköy", "Çankaya Ankara" → { il, ilce }. Eşleşmezse serbest metin olarak aramaya eklenir. */
function konumCoz(girdi: string): { il?: string; ilce?: string; serbest?: string } {
  const t = girdi.trim();
  if (!t) return {};
  const k = toSlug(t);
  const il = IL_LISTE.find(x => toSlug(x) === k);
  if (il) return { il };
  // Konum seçicisinin yazdığı biçim: "Çankaya, Ankara" (çok kelimeli ilçe adları bölünmesin)
  if (t.includes(',')) {
    const [ilceStr, ilStr] = t.split(',').map(x => x.trim());
    const ilAdi = IL_LISTE.find(x => toSlug(x) === toSlug(ilStr || ''));
    if (ilAdi) {
      const ilce = IL_ILCE[ilAdi].find(c => toSlug(c) === toSlug(ilceStr));
      return ilce ? { il: ilAdi, ilce } : { il: ilAdi };
    }
  }
  const parcalar = t.split(/[,/]+|\s+/).filter(Boolean);
  for (const ilAdi of IL_LISTE) {
    if (parcalar.some(p => toSlug(p) === toSlug(ilAdi))) {
      const kalan = toSlug(parcalar.filter(p => toSlug(p) !== toSlug(ilAdi)).join(' '));
      const ilce = IL_ILCE[ilAdi].find(c => toSlug(c) === kalan);
      return ilce ? { il: ilAdi, ilce } : { il: ilAdi };
    }
  }
  for (const [ilAdi, ilceler] of Object.entries(IL_ILCE)) {
    const ilce = ilceler.find(c => toSlug(c) === k);
    if (ilce) return { il: ilAdi, ilce };
  }
  return { serbest: t };
}

// ── Konum seçici — il/ilçe açılır listesi ────────────────────────────────────
type KonumOneri = { tip: 'il' | 'ilce'; il: string; ilce?: string };
type KonumGrup = { baslik: string; items: KonumOneri[] };

/** "Merkez" her zaman listenin başında, kalanı veri sırasıyla. */
function merkezOnce(ilceler: string[]): string[] {
  return [...ilceler.filter(c => c === 'Merkez'), ...ilceler.filter(c => c !== 'Merkez')];
}

/**
 * Yazılan metne göre öneriler: boşsa 81 il; metin bir ile tam eşitse o ilin
 * ilçeleri (Merkez başta); aksi hâlde önce eşleşen iller, sonra eşleşen ilçeler.
 * Eşleşmede "ile başlayan" > "içeren"; ilçelerde Merkez öne alınır.
 */
function konumOnerileri(girdi: string): KonumGrup[] {
  const t = toSlug(girdi.trim());
  if (!t) return [{ baslik: 'İller', items: IL_LISTE.map(il => ({ tip: 'il', il })) }];

  const tamIl = IL_LISTE.find(il => toSlug(il) === t);
  if (tamIl) {
    return [
      { baslik: 'İl', items: [{ tip: 'il', il: tamIl }] },
      { baslik: `${tamIl} ilçeleri`, items: merkezOnce(IL_ILCE[tamIl]).map(ilce => ({ tip: 'ilce', il: tamIl, ilce })) },
    ];
  }

  const puan = (ad: string) => { const k = toSlug(ad); return k.startsWith(t) ? 2 : k.includes(t) ? 1 : 0; };
  const iller = IL_LISTE.map(il => ({ il, p: puan(il) })).filter(x => x.p > 0)
    .sort((a, b) => b.p - a.p).slice(0, 8).map(x => ({ tip: 'il' as const, il: x.il }));

  const ilceler: { il: string; ilce: string; p: number }[] = [];
  for (const [il, liste] of Object.entries(IL_ILCE)) {
    for (const ilce of liste) { const pp = puan(ilce); if (pp > 0) ilceler.push({ il, ilce, p: pp }); }
  }
  ilceler.sort((a, b) => (b.p - a.p) || ((b.ilce === 'Merkez' ? 1 : 0) - (a.ilce === 'Merkez' ? 1 : 0)) || a.ilce.localeCompare(b.ilce, 'tr'));

  const gruplar: KonumGrup[] = [];
  if (iller.length) gruplar.push({ baslik: 'İller', items: iller });
  if (ilceler.length) gruplar.push({ baslik: 'İlçeler', items: ilceler.slice(0, 12).map(x => ({ tip: 'ilce', il: x.il, ilce: x.ilce })) });
  return gruplar;
}

function KonumSecici({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [acik, setAcik] = useState(false);
  const [aktif, setAktif] = useState(-1);
  const kokRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);
  const girdiRef = useRef<HTMLInputElement>(null);

  const gruplar = konumOnerileri(value);
  const duz = gruplar.flatMap(g => g.items);

  useEffect(() => {
    function kapat(e: MouseEvent) { if (kokRef.current && !kokRef.current.contains(e.target as Node)) setAcik(false); }
    document.addEventListener('mousedown', kapat);
    return () => document.removeEventListener('mousedown', kapat);
  }, []);

  // Klavyeyle gezerken aktif satır görünür kalsın
  useEffect(() => {
    if (aktif < 0 || !listeRef.current) return;
    const el = listeRef.current.querySelector(`[data-idx="${aktif}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [aktif]);

  function sec(o: KonumOneri) {
    if (o.tip === 'il') { onChange(o.il); setAktif(-1); setAcik(true); }   // il seçildi → ilçeleri göster
    else { onChange(`${o.ilce}, ${o.il}`); setAcik(false); }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!acik && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { setAcik(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setAktif(i => Math.min(i + 1, duz.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAktif(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && acik && aktif >= 0 && duz[aktif]) { e.preventDefault(); sec(duz[aktif]); }
    else if (e.key === 'Escape') { setAcik(false); }
  }

  let idx = -1;
  return (
    <div ref={kokRef} className="hk-search__field hk-search__field--loc hk-hero-arama__konum" style={{ position: 'relative', cursor: 'text' }}
      onClick={e => { if ((e.target as HTMLElement).closest('button')) return; girdiRef.current?.focus(); }}>
      <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', fontSize: 16 }} aria-hidden="true" />
      <span className="hk-sr">İl veya ilçe</span>
      <input
        ref={girdiRef}
        type="text" value={value} placeholder="İl veya ilçe" autoComplete="off" spellCheck={false}
        role="combobox" aria-expanded={acik} aria-controls="hk-konum-liste" aria-autocomplete="list"
        onChange={e => { onChange(e.target.value); setAktif(-1); setAcik(true); }}
        onFocus={() => setAcik(true)}
        onKeyDown={onKey}
      />
      {value && (
        <button type="button" aria-label="Konumu temizle" className="hk-konum-temizle"
          onMouseDown={e => { e.preventDefault(); onChange(''); setAktif(-1); setAcik(true); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
      {acik && duz.length === 0 && value.trim() && (
        <div className="hk-konum-dd" role="status">
          <div className="hk-konum-dd__bos">
            <div className="hk-konum-dd__bos-baslik">Sonuç yok</div>
            <div className="hk-konum-dd__bos-alt">&ldquo;{value.trim()}&rdquo; adında il veya ilçe bulunamadı.</div>
          </div>
        </div>
      )}
      {acik && duz.length > 0 && (
        <div id="hk-konum-liste" ref={listeRef} className="hk-konum-dd" role="listbox">
          {gruplar.map(g => (
            <div key={g.baslik} className="hk-konum-dd__bolum">
              <div className="hk-konum-dd__grup">{g.baslik}</div>
              {g.items.map(o => {
                idx += 1; const i = idx;
                const secili = i === aktif;
                return (
                  <button key={`${o.tip}-${o.il}-${o.ilce || ''}`} type="button" role="option" aria-selected={secili} data-idx={i}
                    className={`hk-konum-dd__satir${secili ? ' is-aktif' : ''}`}
                    onMouseDown={e => { e.preventDefault(); sec(o); }}
                    onMouseEnter={() => setAktif(i)}>
                    <span className="hk-konum-dd__ikon" aria-hidden="true">
                      {o.tip === 'il'
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 13h.01M9 17h.01" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>}
                    </span>
                    <span className="hk-konum-dd__ad">{o.tip === 'il' ? o.il : o.ilce}</span>
                    {o.tip === 'ilce' && <span className="hk-konum-dd__alt">{o.il}</span>}
                    {o.tip === 'il' && (value && toSlug(value.trim()) === toSlug(o.il)
                      ? <span className="hk-konum-dd__alt">Tüm il</span>
                      : <svg className="hk-konum-dd__ok" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LiveSearchForm({ mounted }: { mounted: boolean }) {
  const router = useRouter();
  const [q, setQ]         = useState('');
  const [konum, setKonum] = useState('');   // tek arama çubuğundaki "İl veya ilçe" alanı
  const [sonuclar, setSonuclar] = useState<SearchResults | null>(null);
  const [acik, setAcik]   = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const aramaRef    = useRef<HTMLInputElement>(null);

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
    const yer = konumCoz(konum);
    if (!term && !yer.il && !yer.serbest) return;
    // Tek arama: metin + konum birlikte diş klinikleri listesine gider
    const ps = new URLSearchParams();
    const metin = [term, yer.serbest].filter(Boolean).join(' ');
    if (metin) ps.set('q', metin);
    if (yer.il) ps.set('il', yer.il);
    if (yer.ilce) ps.set('ilce', yer.ilce);
    router.push(`/klinikler?${ps.toString()}`);
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
      <form onSubmit={handleSubmit} role="search" className="hk-search hk-search--lg hk-hero-arama">

        {/* Input + dropdown */}
        <div className="hk-hero-arama__alan" style={{ position: 'relative', cursor: 'text' }}
          onClick={e => { if ((e.target as HTMLElement).closest('button, a')) return; aramaRef.current?.focus(); }}>
          {/* İkon */}
          <div style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: yukleniyor ? 'var(--brand)' : 'var(--ink-tertiary)',
            display: 'flex', pointerEvents: 'none',
            transition: 'color .2s',
          }}>
            {yukleniyor ? <IconSpinner /> : <IconSearch />}
          </div>

          {/* Input */}
          <input
            ref={aramaRef}
            value={q}
            onChange={handleInput}
            onFocus={() => sonuclar && setAcik(true)}
            placeholder="Diş kliniği, diş hekimi veya tedavi"
            aria-label="Diş kliniği, diş hekimi veya tedavi"
            autoComplete="off"
            spellCheck={false}
            className="hk-hero-arama__input"
          />

          {/* Dropdown */}
          {dropdownAcik && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0, right: 0,
              background: 'white',
              borderRadius: 'var(--radius-lg)', marginTop: 10,
              border: '1px solid var(--border)',
              boxShadow: '0 20px 50px rgba(26,51,94,.14)',
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
                        background: '#1A335E', color: 'white',
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
                        background: '#F5F5F7', color: '#1A335E',
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
                    fontSize: 12, color: '#1A335E', fontWeight: 600,
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

        {/* Konum — aynı çubukta; il/ilçe açılır listesi (tarayıcının gri datalist'i yerine) */}
        <KonumSecici value={konum} onChange={setKonum} />
        <button type="submit" className="hk-btn hk-btn--lg hk-btn--primary hk-search__btn">Ara</button>
      </form>

      {/* Popüler tedaviler — tek satır etiket dizisi ("Tüm klinikler" tedaviler bölümünün başlığında) */}
      <div className="hk-hero-etiketler">
        {([
          ['İmplant', `/klinikler?uzmanlik=${encodeURIComponent('İmplantoloji (İmplant)')}`],
          ['Ortodonti', `/klinikler?uzmanlik=${encodeURIComponent('Ortodonti (Diş Teli)')}`],
          ['Estetik diş', `/klinikler?uzmanlik=${encodeURIComponent('Estetik Diş Hekimliği')}`],
          ['Kanal tedavisi', `/klinikler?uzmanlik=${encodeURIComponent('Endodonti (Kanal Tedavisi)')}`],
          ['Çocuk diş', `/klinikler?uzmanlik=${encodeURIComponent('Pedodonti (Çocuk Diş Hekimliği)')}`],
        ] as [string, string][]).map(([label, href]) => (
          <a key={href} href={href} className="hk-tag">{label}</a>
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
      <span className="hk-badge hk-badge--new">DİŞ HEKİMLERİ İÇİN</span>
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
    { label: 'Diş kliniği', val: stats.klinik,    suffix: ''  },
    { label: 'İl',          val: 81,              suffix: ''  },
  ];

  return (
    <section style={{ position: 'relative', background: 'var(--canvas)', padding: 'var(--space-5) 0 0' }}>
      {/* dangerouslySetInnerHTML: children olarak verilen CSS'teki ">" sunucuda
          escape edilip hydration hatasına yol açıyordu */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-section {
          padding: 92px 0 88px;
        }
        /* Hero: açık lacivert düz gradyan panel; başlık tek renk (gradyan metin yok) */
        .hk-hero-panel { text-align: center; padding: 80px 32px; border-radius: var(--radius-xl); background: linear-gradient(120deg, var(--tint-50), var(--tint-100)); }
        .hk-hero-baslik { margin: 0 auto 16px; max-width: 900px; font-family: var(--font-display); font-size: 64px; line-height: 68px; font-weight: 800; letter-spacing: -0.035em; color: var(--brand); }
        .hk-hero-alt { margin: 0 auto 32px; max-width: 560px; font-size: 18px; line-height: 28px; color: var(--ink-secondary); }
        .hk-hero-arama { text-align: left; transition: border-color .15s; }
        .hk-hero-arama:focus-within { border-color: #b9c4d6; }
        .hk-hero-arama input:focus-visible { outline: none !important; }
        .hk-hero-arama .hk-search__field:focus-within { box-shadow: none !important; border-color: transparent !important; }
        .hk-hero-arama__alan { flex: 1 1 280px; min-width: 0; display: flex; align-items: center; height: 56px; }
        .hk-hero-arama__input { width: 100%; height: 56px; padding: 0 16px 0 46px; border: 0; background: transparent; font: inherit; font-size: 16px; color: var(--ink); outline: none; border-radius: var(--radius-md); }
        .hk-hero-arama__input::placeholder { color: var(--ink-tertiary); }
        .hk-hero-arama__konum { border-left: 1px solid var(--border) !important; border-radius: 0 !important; }
        /* Konum açılır listesi — Apple popover: buzlu cam, ok ucu, iOS grup başlıkları, seçimde vurgu */
        .hk-konum-temizle { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; border: 0; background: rgba(60,60,67,.12); color: rgba(60,60,67,.7); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .hk-konum-temizle:hover { background: rgba(60,60,67,.2); color: var(--ink); }
        .hk-konum-dd {
          position: absolute; top: calc(100% + 12px); left: 50%; transform: translateX(-50%);
          width: 320px; max-height: 360px; overflow-y: auto; overscroll-behavior: contain;
          padding: 6px; z-index: 60; text-align: left;
          background: rgba(255,255,255,.96);   /* hafif cam etkisi; arkadaki metin okunmasın */
          -webkit-backdrop-filter: saturate(160%) blur(18px); backdrop-filter: saturate(160%) blur(18px);
          border: 0.5px solid rgba(0,0,0,.12); border-radius: 14px;
          box-shadow: 0 0 0 0.5px rgba(0,0,0,.04), 0 12px 36px rgba(0,0,0,.16), 0 2px 6px rgba(0,0,0,.06);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          animation: hk-popover-ac .16s cubic-bezier(.2,.8,.2,1);
        }
        .hk-konum-dd::before {
          content: ""; position: absolute; top: -6px; left: calc(50% - 6px); width: 12px; height: 12px;
          background: rgba(255,255,255,.96); border-left: 0.5px solid rgba(0,0,0,.12); border-top: 0.5px solid rgba(0,0,0,.12);
          transform: rotate(45deg); border-radius: 2px 0 0 0;
        }
        @keyframes hk-popover-ac { from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(.98); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
        .hk-konum-dd__bolum + .hk-konum-dd__bolum { margin-top: 4px; padding-top: 4px; border-top: 0.5px solid rgba(60,60,67,.16); }
        .hk-konum-dd__grup { padding: 10px 14px 5px; font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: rgba(60,60,67,.48); }
        .hk-konum-dd__satir { position: relative; display: flex; align-items: center; gap: 11px; width: 100%; padding: 9px 12px 9px 14px; border: 0; border-radius: 9px; background: transparent; font: inherit; font-size: 15px; font-weight: 400; letter-spacing: -.01em; line-height: 20px; color: rgba(17,28,46,.9); cursor: pointer; text-align: left; transition: background .1s; }
        .hk-konum-dd__satir + .hk-konum-dd__satir::before { content: ""; position: absolute; left: 43px; right: 12px; top: -0.5px; height: 0.5px; background: rgba(60,60,67,.12); }
        .hk-konum-dd__satir.is-aktif { background: rgba(26,51,94,.07); color: var(--brand); }
        .hk-konum-dd__satir.is-aktif::before, .hk-konum-dd__satir.is-aktif + .hk-konum-dd__satir::before { opacity: 0; }
        .hk-konum-dd__ikon { flex-shrink: 0; width: 18px; display: inline-flex; align-items: center; justify-content: center; color: rgba(60,60,67,.42); }
        .hk-konum-dd__ikon svg { stroke-width: 1.6; }
        .hk-konum-dd__satir.is-aktif .hk-konum-dd__ikon, .hk-konum-dd__satir.is-aktif .hk-konum-dd__ok { color: var(--brand); }
        .hk-konum-dd__ad { font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hk-konum-dd__satir.is-aktif .hk-konum-dd__ad { font-weight: 500; }
        .hk-konum-dd__alt { margin-left: auto; flex-shrink: 0; font-size: 13px; font-weight: 400; color: rgba(60,60,67,.5); }
        .hk-konum-dd__ok { margin-left: auto; flex-shrink: 0; color: rgba(60,60,67,.28); }
        .hk-konum-dd__bos { padding: 18px 14px 16px; text-align: center; }
        .hk-konum-dd__bos-baslik { font-size: 15px; font-weight: 500; color: var(--ink); }
        .hk-konum-dd__bos-alt { margin-top: 3px; font-size: 13px; line-height: 1.45; color: rgba(60,60,67,.6); }
        .hk-hero-etiketler { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 16px; }
        .hk-hero-etiketler a { height: 30px; padding: 0 12px; text-decoration: none; }
        .hk-hero-etiketler a:hover { background: var(--tint-100); }
        @media (max-width: 1080px) { .hk-hero-baslik { font-size: 48px; line-height: 52px; } }
        @media (max-width: 640px) {
          .hk-hero-panel { padding: 48px 20px; }
          .hk-hero-baslik { font-size: 36px; line-height: 40px; }
          .hk-hero-alt { font-size: 16px; line-height: 24px; }
          .hk-hero-arama__alan, .hk-hero-arama__konum { flex-basis: 100% !important; }
          .hk-hero-arama__konum { border-left: 0 !important; border-top: 1px solid var(--border) !important; }
          .hk-konum-dd { left: 0; right: 0; width: auto; transform: none; max-height: 300px; animation: none; }
          .hk-konum-dd::before { left: 28px; }
        }
        /* Hekimlere seslenen dönen şerit — arama alanının altında, /katil'e götürür */
        .hekim-serit {
          display: inline-flex; align-items: center; gap: 10px;
          max-width: 100%; margin: 22px auto 0;
          padding: 9px 16px 9px 10px; border-radius: 999px;
          background: #FFFFFF; border: 1px solid #E2E7F0;
          box-shadow: 0 4px 16px rgba(26,51,94,.07);
          text-decoration: none; color: #1A335E;
          transition: border-color .18s, box-shadow .18s, transform .18s;
        }
        .hekim-serit:hover {
          border-color: #C9D4E6; box-shadow: 0 8px 26px rgba(26,51,94,.13); transform: translateY(-1px);
        }
        .hekim-serit-etiket {
          flex-shrink: 0; padding: 3px 10px; border-radius: 999px;
          background: var(--gold-fill); color: var(--on-gold);
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
        .hekim-serit:hover .hekim-serit-ok { color: #1A335E; }
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
          max-width: 860px;
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
      <div className="container" style={{ position: 'relative', zIndex: 4 }}>
       <div className="hk-hero-panel">

        <span className="hk-badge hk-badge--neutral" style={{ marginBottom: 24 }}>TÜRKİYE DİŞ SAĞLIĞI REHBERİ</span>

        {/* Başlık — cümle düzeni, tek renk */}
        <h1 className="hk-hero-baslik">Size en yakın diş hekimini hızlıca bulun</h1>

        <p className="hk-hero-alt">
          {stats.klinik.toLocaleString('tr-TR')} diş kliniği ve muayenehane; puan, adres ve iletişim bilgileriyle tek yerde.
        </p>

        {/* ── Canlı Arama ─────────────────────────────────────────── */}
        <LiveSearchForm mounted={mounted} />

        {/* ── Hekimlere seslenen dönen şerit ── */}
        <HekimSerit mounted={mounted} />
       </div>

        {/* İstatistik bandı — ayrı beyaz bant, rakamlar artı işaretsiz */}
        <div className="hk-stats" style={{ marginTop: 'var(--space-5)' }}>
          {statItems.map(s => (
            <div key={s.label} className="hk-stats__item">
              <span className="hk-stats__num hk-stats__num--brand"><AnimatedCount target={s.val} suffix={s.suffix} /></span>
              <span className="hk-stats__label">{s.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
