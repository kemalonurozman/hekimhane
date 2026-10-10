'use client';

// Hareketli Hekimhane ikonu — HkIcon ile aynı çizim + tasarım kılavuzundaki
// hareketler (Web Animations API). Hareket şu anlarda oynar:
//   • üzerine gelince — ikonun kendisi ya da en yakın bağlantı/düğme/[data-hk-hover] atası
//   • `playOnView` ile görünür olduğunda bir kez
//   • bekleme (idle) döngüsü tanımlı ikonlarda sürekli (konum iğnesi, nöbetçi eczane…)
// "Hareketi azalt" tercihinde hiçbir şey oynamaz; ikon sabit kalır.
import { useCallback, useEffect, useRef } from 'react';
import {
  HK_BEKLEME, HK_HAREKET, HK_IKONLAR, HK_KIVILCIM, HK_TONLAR,
  type HkHareket, type HkIkonAdi,
} from '@/lib/hk-icons';

interface Props {
  name: HkIkonAdi;
  size?: number;
  color?: string;
  accent?: string | false;
  bg?: string;
  active?: boolean;
  strokeWidth?: number;
  className?: string;
  /** Bekleme döngüsü (varsa) oynasın mı. */
  idle?: boolean;
  /** Görünür olduğunda bir kez oynat. */
  playOnView?: boolean;
  /** playOnView gecikmesi (ms) — dizilerde sırayla oynatmak için. */
  delay?: number;
  /** Üzerine gelince hareketi tetikleyen ata seçicisi. */
  hoverTarget?: string;
}

const azalt = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function HkIconAnim({
  name, size = 24, color = 'currentColor', accent = '#C9A04A', bg = '#FFFFFF',
  active = false, strokeWidth = 1.5, className, idle = true, playOnView = false, delay = 0,
  hoverTarget = 'a,button,[data-hk-hover]',
}: Props) {
  const ic = HK_IKONLAR[name];
  const svgRef = useRef<SVGSVGElement>(null);
  const kokRef = useRef<SVGGElement>(null);
  const kivRef = useRef<SVGPathElement>(null);
  const els = useRef<(SVGElement | null)[]>([]);

  const hedefler = useCallback((s: HkHareket): (SVGElement | null)[] => {
    if (s.tgt === 'root') return [kokRef.current];
    if (s.tgt === 'spark') return [kivRef.current];
    let t = ic.parts.map((p, i) => (p.tag === s.tgt ? els.current[i] : null)).filter(Boolean);
    if (!t.length) {
      if (s.tgt === 'draw') t = ic.parts.map((p, i) => (!p.dot && p.tag !== 'morph' && p.tag !== 'hideOnActive' ? els.current[i] : null)).filter(Boolean);
      else if (s.tgt !== 'seq') t = [kokRef.current];
    }
    return t;
  }, [ic]);

  const oynat = useCallback((ek = 0) => {
    if (azalt()) return;
    (ic.hover || ['bounce']).forEach(k => {
      const s = HK_HAREKET[k]; if (!s) return;
      hedefler(s).forEach((el, i) => {
        try { el?.animate(s.kf as Keyframe[], { duration: s.dur, easing: s.ease, delay: ek + (s.stagger || 0) * i, fill: 'backwards' }); } catch { /* yoksay */ }
      });
    });
  }, [ic, hedefler]);

  // Üzerine gelince: en yakın bağlantı/düğme atası, yoksa ikonun kendisi
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const hedef: Element = (hoverTarget && svg.closest(hoverTarget)) || svg;
    const h = () => oynat();
    hedef.addEventListener('mouseenter', h);
    hedef.addEventListener('focusin', h);
    return () => { hedef.removeEventListener('mouseenter', h); hedef.removeEventListener('focusin', h); };
  }, [oynat, hoverTarget]);

  // Görünür olduğunda bir kez
  useEffect(() => {
    const svg = svgRef.current;
    if (!playOnView || !svg || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); oynat(delay); }
    }, { threshold: 0.4 });
    io.observe(svg);
    return () => io.disconnect();
  }, [playOnView, delay, oynat]);

  // Bekleme döngüsü
  useEffect(() => {
    if (!idle || !ic.idle || azalt()) return;
    const s = HK_BEKLEME[ic.idle]; if (!s) return;
    const calisan: Animation[] = [];
    hedefler(s).forEach((el, i) => {
      try { if (el) calisan.push(el.animate(s.kf as Keyframe[], { duration: s.dur, easing: s.ease, iterations: Infinity, delay: i * 120 })); } catch { /* yoksay */ }
    });
    return () => calisan.forEach(a => a.cancel());
  }, [idle, ic, hedefler]);

  const taban = ic.tone ? HK_TONLAR[ic.tone] : color;
  const altin = ic.tone || accent === false ? taban : accent;
  const kutu = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

  return (
    <svg
      ref={svgRef}
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={taban} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className ? `hk-icon ${className}` : 'hk-icon'}
      style={{ overflow: 'visible' }} aria-hidden
    >
      <g ref={kokRef} style={{ transformBox: 'fill-box', transformOrigin: ic.origin || 'center' }}>
        {ic.parts.map((p, i) => {
          const c = p.acc ? altin : taban;
          let stroke: string = c;
          let fill = 'none';
          if (p.dot) { fill = c; stroke = 'none'; }
          if (p.bgfill) fill = bg;
          if (active && p.body) { fill = p.fillAcc ? altin : c; if (p.fillAcc) stroke = altin; }
          if (active && p.on && !p.acc) { if (p.dot) fill = bg; else stroke = bg; }
          const gizli = (p.tag === 'morph' && !active) || (p.tag === 'hideOnActive' && active);
          const Tag = p.t;
          return (
            <Tag
              key={i}
              ref={(e: SVGElement | null) => { els.current[i] = e; }}
              {...(p.a as Record<string, string | number>)}
              pathLength={p.dot ? undefined : 1}
              fill={fill} stroke={stroke}
              style={{ ...kutu, opacity: gizli ? 0 : undefined }}
            />
          );
        })}
      </g>
      {ic.shine ? <path ref={kivRef} d={HK_KIVILCIM} fill={altin} stroke="none" style={{ ...kutu, opacity: 0 }} /> : null}
    </svg>
  );
}
