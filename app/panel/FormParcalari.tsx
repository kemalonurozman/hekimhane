'use client';

// ─────────────────────────────────────────────────────────────────
//  Panel profil formu — Apple dili parçaları.
//  Stiller: app/globals.css → "Panel profil formu" (pf- öneki).
//
//  SecimKutusu  : tarayıcının ham <select>'i yerine. Masaüstünde
//                 tetikleyicinin altında açılan menü (uzun listede arama),
//                 telefonda alttan açılan sayfa. Klavye: oklar, Enter, Esc,
//                 aramasız listede harfe basınca o harfe atlar.
//  Segment      : iOS bölümlü seçim (2–4 kısa seçenek).
//  SecenekKartlari : başlık + açıklamalı büyük seçim kartları.
//  AnahtarSatir : ayarlar listesi satırı + iOS anahtarı.
//  BolumBaslik / Grup : iki tonlu başlıklar ("Konum. Sizi bulsunlar.").
// ─────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode, KeyboardEvent as RKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export type Secenek = string | { value: string; label: string };
type Opt = { value: string; label: string };

/** Türkçe harf duyarsız karşılaştırma anahtarı */
const norm = (s: string) => s.toLocaleLowerCase('tr-TR')
  .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const optlar = (l: Secenek[]): Opt[] => l.map(s => (typeof s === 'string' ? { value: s, label: s } : s));

/* ── Başlıklar ───────────────────────────────────────────────── */

export function BolumBaslik({ baslik, alt }: { baslik: string; alt?: string }) {
  return (
    <header className="pf-bolum">
      <h2>{baslik}.{alt && <span> {alt}</span>}</h2>
    </header>
  );
}

export function Grup({ baslik, alt, children }: { baslik: string; alt?: string; children: ReactNode }) {
  return (
    <section className="pf-grup">
      <h3>{baslik}.{alt && <span> {alt}</span>}</h3>
      {children}
    </section>
  );
}

/* ── Seçim kutusu ────────────────────────────────────────────── */

type Konum = { top?: number; bottom?: number; left: number; width: number; maxH: number };

export function SecimKutusu({
  value, onChange, secenekler, baslik, placeholder = 'Seçin', disabled = false, arama, kompakt = false,
}: {
  value: string;
  onChange: (v: string) => void;
  secenekler: Secenek[];
  /** Ekran okuyucu etiketi + telefondaki sayfanın başlığı */
  baslik: string;
  placeholder?: string;
  disabled?: boolean;
  /** Varsayılan: 12'den fazla seçenekte arama kutusu */
  arama?: boolean;
  /** Saat gibi kısa değerler için küçük kutu */
  kompakt?: boolean;
}) {
  // Listede olmayan kayıtlı değer korunur (ör. eski "Diş Hekimi" türü, elle yazılmış ilçe)
  const liste = useMemo<Opt[]>(() => {
    const l = optlar(secenekler);
    if (value && !l.some(o => o.value === value)) l.unshift({ value, label: value });
    return l;
  }, [secenekler, value]);
  const aramali = arama ?? liste.length > 12;

  const [acik, setAcik] = useState(false);
  const [sayfa, setSayfa] = useState(false);      // telefon: alttan açılan sayfa
  const [q, setQ] = useState('');
  const [imlec, setImlec] = useState(0);
  const [konum, setKonum] = useState<Konum | null>(null);
  const tetik = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const araKutu = useRef<HTMLInputElement>(null);
  const listeEl = useRef<HTMLDivElement>(null);
  const kimlik = useId().replace(/:/g, '');

  const gorunen = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return liste;
    const basla = liste.filter(o => norm(o.label).startsWith(n));
    const kelime = liste.filter(o => !basla.includes(o) && norm(o.label).includes(' ' + n));
    const icer = liste.filter(o => !basla.includes(o) && !kelime.includes(o) && norm(o.label).includes(n));
    return [...basla, ...kelime, ...icer];
  }, [liste, q]);

  const yerlestir = useCallback(() => {
    const t = tetik.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const vh = window.innerHeight, vw = window.innerWidth;
    const alt = vh - r.bottom - 12, ust = r.top - 12;
    const yukari = alt < 260 && ust > alt;
    const maxH = Math.min(380, Math.max(160, (yukari ? ust : alt) - 6));
    const width = Math.min(vw - 16, Math.max(r.width, kompakt ? 128 : 260));
    const left = Math.min(Math.max(8, r.left), vw - width - 8);
    setKonum(yukari
      ? { bottom: vh - r.top + 6, left, width, maxH }
      : { top: r.bottom + 6, left, width, maxH });
  }, [kompakt]);

  function ac() {
    if (disabled) return;
    const telefon = window.matchMedia('(max-width: 640px)').matches;
    setSayfa(telefon);
    setQ('');
    const i = liste.findIndex(o => o.value === value);
    setImlec(i < 0 ? 0 : i);
    if (!telefon) yerlestir();
    setAcik(true);
  }
  const kapat = useCallback((odakGeri = true) => {
    setAcik(false);
    setQ('');
    if (odakGeri) tetik.current?.focus({ preventScroll: true });
  }, []);
  function sec(o: Opt) { onChange(o.value); kapat(); }

  // Dışarı dokununca kapan; masaüstünde kaydırma/boyut değişince yeniden konumla
  useEffect(() => {
    if (!acik) return;
    const disari = (e: Event) => {
      const h = e.target as Node;
      if (pop.current?.contains(h) || tetik.current?.contains(h)) return;
      kapat(false);
    };
    document.addEventListener('mousedown', disari);
    document.addEventListener('touchstart', disari, { passive: true });
    if (!sayfa) {
      window.addEventListener('scroll', yerlestir, true);
      window.addEventListener('resize', yerlestir);
    }
    return () => {
      document.removeEventListener('mousedown', disari);
      document.removeEventListener('touchstart', disari);
      window.removeEventListener('scroll', yerlestir, true);
      window.removeEventListener('resize', yerlestir);
    };
  }, [acik, sayfa, yerlestir, kapat]);

  // Telefonda sayfa açıkken arkadaki sayfa kaymasın
  useEffect(() => {
    if (!acik || !sayfa) return;
    const eski = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = eski; };
  }, [acik, sayfa]);

  // Açılınca: masaüstünde arama kutusuna, aksi hâlde listeye odaklan
  useEffect(() => {
    if (!acik) return;
    const id = requestAnimationFrame(() => {
      if (aramali && !sayfa) araKutu.current?.focus({ preventScroll: true });
      else listeEl.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [acik, aramali, sayfa]);

  // İmleç satırı görünür kalsın (yalnız liste kutusu kayar, sayfa kaymaz)
  useEffect(() => {
    if (!acik) return;
    const l = listeEl.current;
    const el = l?.querySelector<HTMLElement>(`[data-i="${imlec}"]`);
    if (!l || !el) return;
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 6;
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 6;
  }, [imlec, acik, gorunen]);

  // İlk açılışta seçili satır ortada
  useEffect(() => {
    if (!acik) return;
    const id = requestAnimationFrame(() => {
      const l = listeEl.current;
      const el = l?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (l && el) l.scrollTop = el.offsetTop - l.clientHeight / 2 + el.offsetHeight / 2;
    });
    return () => cancelAnimationFrame(id);
  }, [acik]);

  function tus(e: RKeyboardEvent) {
    const son = gorunen.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setImlec(i => Math.min(i + 1, son)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setImlec(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Home') { e.preventDefault(); setImlec(0); }
    else if (e.key === 'End') { e.preventDefault(); setImlec(son); }
    else if (e.key === 'Enter') { e.preventDefault(); const o = gorunen[imlec]; if (o) sec(o); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); kapat(); }
    else if (e.key === 'Tab') { kapat(false); }
    else if (!aramali && e.key.length === 1 && /\S/.test(e.key)) {
      // Aramasız listede harfe basınca o harfle başlayan sıradaki seçeneğe atla
      const h = norm(e.key);
      const sira = [...gorunen.slice(imlec + 1), ...gorunen.slice(0, imlec + 1)];
      const bul = sira.find(o => norm(o.label).startsWith(h));
      if (bul) setImlec(gorunen.indexOf(bul));
    }
  }

  const secili = liste.find(o => o.value === value);
  const aktifId = gorunen[imlec] ? `${kimlik}-s${imlec}` : undefined;

  const aramaKutusu = aramali && (
    <div className="pf-menu__ara">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={araKutu} value={q} placeholder="Ara"
        role="combobox" aria-expanded="true" aria-controls={`${kimlik}-l`} aria-activedescendant={aktifId}
        aria-label={`${baslik} ara`} autoComplete="off" spellCheck={false}
        onChange={e => { setQ(e.target.value); setImlec(0); }} />
      {q && (
        <button type="button" className="pf-menu__temizle" aria-label="Aramayı temizle"
          onMouseDown={e => e.preventDefault()} onClick={() => { setQ(''); setImlec(0); araKutu.current?.focus(); }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );

  const satirlar = (
    <div ref={listeEl} id={`${kimlik}-l`} role="listbox" tabIndex={-1} aria-label={baslik}
      aria-activedescendant={aramali && !sayfa ? undefined : aktifId}
      className="pf-menu__liste"
      style={!sayfa && konum ? { maxHeight: konum.maxH - (aramali ? 54 : 0) } : undefined}>
      {gorunen.length === 0 ? (
        <div className="pf-menu__bos">“{q.trim()}” için sonuç yok</div>
      ) : gorunen.map((o, i) => {
        const s = o.value === value;
        return (
          <div key={o.value} id={`${kimlik}-s${i}`} data-i={i} role="option" aria-selected={s}
            className={`pf-menu__satir${i === imlec ? ' imlec' : ''}${s ? ' secili' : ''}`}
            onMouseMove={() => { if (i !== imlec) setImlec(i); }}
            onMouseDown={e => e.preventDefault()}
            onClick={() => sec(o)}>
            <span className="pf-menu__tik" aria-hidden>
              {s && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
            </span>
            <span className="pf-menu__ad">{o.label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <button ref={tetik} type="button" disabled={disabled}
        className={`pf-secim${kompakt ? ' pf-secim--kompakt' : ''}${secili ? '' : ' bos'}`}
        aria-haspopup="listbox" aria-expanded={acik}
        aria-label={`${baslik}: ${secili?.label || placeholder}`}
        onClick={() => (acik ? kapat() : ac())}
        onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!acik) ac(); } }}>
        <span className="pf-secim__deger">{secili?.label || placeholder}</span>
        <svg className="pf-secim__ok" width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m2.5 6 3.5-3.5L9.5 6M2.5 10 6 13.5 9.5 10" />
        </svg>
      </button>

      {acik && typeof document !== 'undefined' && createPortal(
        sayfa ? (
          <div className="pf-sayfa-zemin">
            <div ref={pop} className="pf-sayfa" role="dialog" aria-modal="true" aria-label={baslik} onKeyDown={tus}>
              <div className="pf-sayfa__tutamac" aria-hidden />
              <div className="pf-sayfa__ust">
                <strong>{baslik}</strong>
                <button type="button" onClick={() => kapat()}>Bitti</button>
              </div>
              {aramaKutusu}
              {satirlar}
            </div>
          </div>
        ) : (
          <div ref={pop} className={`pf-menu${kompakt ? ' pf-menu--kompakt' : ''}`} onKeyDown={tus}
            style={konum ? { top: konum.top, bottom: konum.bottom, left: konum.left, width: konum.width } : { visibility: 'hidden' }}>
            {aramaKutusu}
            {satirlar}
          </div>
        ),
        document.body,
      )}
    </>
  );
}

/* ── Segment (iOS bölümlü seçim) ─────────────────────────────── */

export function Segment({ value, onChange, secenekler, baslik }: {
  value: string;
  onChange: (v: string) => void;
  secenekler: Secenek[];
  baslik: string;
}) {
  const l = optlar(secenekler);
  const ref = useRef<HTMLDivElement>(null);
  function tus(e: RKeyboardEvent, i: number) {
    const yon = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!yon) return;
    e.preventDefault();
    const j = (i + yon + l.length) % l.length;
    onChange(l[j].value);
    ref.current?.querySelectorAll<HTMLButtonElement>('button')[j]?.focus();
  }
  const seciliVar = l.some(o => o.value === value);
  return (
    <div ref={ref} className="pf-segment" role="radiogroup" aria-label={baslik}>
      {l.map((o, i) => {
        const s = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={s}
            tabIndex={s || (!seciliVar && i === 0) ? 0 : -1}
            className={s ? 'secili' : undefined}
            onClick={() => onChange(o.value)} onKeyDown={e => tus(e, i)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Seçenek kartları (başlık + açıklama) ────────────────────── */

export function SecenekKartlari<V extends string | boolean>({ value, onChange, secenekler, baslik }: {
  value: V;
  onChange: (v: V) => void;
  secenekler: { value: V; baslik: string; aciklama?: string; ikon?: ReactNode }[];
  baslik: string;
}) {
  return (
    <div className="pf-kartlar" role="radiogroup" aria-label={baslik}>
      {secenekler.map(o => {
        const s = o.value === value;
        return (
          <button key={String(o.value)} type="button" role="radio" aria-checked={s}
            className={`pf-kart${s ? ' secili' : ''}`} onClick={() => onChange(o.value)}>
            <span className="pf-kart__baslik">{o.ikon}{o.baslik}</span>
            {o.aciklama && <span className="pf-kart__alt">{o.aciklama}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── Anahtar + ayarlar satırı ────────────────────────────────── */

export function Anahtar({ acik, onChange, etiket }: { acik: boolean; onChange: (v: boolean) => void; etiket: string }) {
  return (
    <button type="button" role="switch" aria-checked={acik} aria-label={etiket}
      className={`pf-anahtar${acik ? ' acik' : ''}`}
      onClick={e => { e.stopPropagation(); onChange(!acik); }}>
      <span />
    </button>
  );
}

export function AnahtarSatir({ acik, onChange, etiket, aciklama }: {
  acik: boolean;
  onChange: (v: boolean) => void;
  etiket: string;
  aciklama?: string;
}) {
  return (
    <div className="pf-satir pf-satir--tik" onClick={() => onChange(!acik)}>
      <div className="pf-satir__metin">
        <div className="pf-satir__baslik">{etiket}</div>
        {aciklama && <div className="pf-satir__alt">{aciklama}</div>}
      </div>
      <Anahtar acik={acik} onChange={onChange} etiket={etiket} />
    </div>
  );
}
