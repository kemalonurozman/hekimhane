'use client';

// Hareketli Hekimhane logosu ve yükleme göstergesi (marka kimliği v1 — Hareket).
// Giriş: sol sütun aşağıdan, sağ sütun yukarıdan yükselir → altın dalga soldan sağa
// akar → kıvılcım → yazı işareti yerine oturur. Görünür olduğunda bir kez oynar,
// üzerine gelince yeniden oynar. "Hareketi azalt" tercihinde sabit durur.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { HK_LOGO, HK_RENK } from '@/components/Logo';

const YAY = 'cubic-bezier(0.34,1.56,0.64,1)';
const AKIS = 'cubic-bezier(0.25,0.1,0.25,1)';
/** Dalganın omurgası — açılma maskesi bu çizgi boyunca ilerler. */
const OMURGA = 'M8 33.9C10 28.6 14 23.8 24 24C31 24.2 37.5 25.3 40 16.5';
const KIVILCIM = 'M41 8Q41 12 45 12Q41 12 41 16Q41 12 37 12Q41 12 41 8Z';

const azalt = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface LogoProps {
  size?: number;
  dark?: boolean;
  layout?: 'horizontal' | 'stacked' | 'symbol';
  /** Altında aralıklı "hekimhane.com.tr" satırı. */
  url?: boolean;
  /** Görünür olduğunda kendiliğinden oynasın (o ana dek gizli kalır). */
  autoplay?: boolean;
  /** Üzerine gelince yeniden oynat. */
  hover?: boolean;
}

export default function HkLogoAnim({ size = 34, dark = false, layout = 'horizontal', url = false, autoplay = true, hover = true }: LogoProps) {
  const id = useId().replace(/:/g, '');
  const [gizli, setGizli] = useState(autoplay);
  const sar = useRef<HTMLSpanElement>(null);
  const sol = useRef<SVGPathElement>(null);
  const sag = useRef<SVGPathElement>(null);
  const ac = useRef<SVGPathElement>(null);
  const kiv = useRef<SVGPathElement>(null);
  const yazi = useRef<HTMLSpanElement>(null);
  const adres = useRef<HTMLSpanElement>(null);

  const oynat = useCallback(() => {
    setGizli(false);
    if (azalt()) return;
    const A = (el: Element | null, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      try { el?.animate(kf, { fill: 'backwards', ...o }); } catch { /* yoksay */ }
    };
    A(sol.current, [{ transform: 'translateY(10px) scaleY(0.25)', opacity: 0 }, { transform: 'translateY(0px) scaleY(1)', opacity: 1 }], { duration: 640, easing: YAY });
    A(sag.current, [{ transform: 'translateY(-10px) scaleY(0.25)', opacity: 0 }, { transform: 'translateY(0px) scaleY(1)', opacity: 1 }], { duration: 640, easing: YAY, delay: 170 });
    A(ac.current, [{ strokeDasharray: '1 2', strokeDashoffset: 1 }, { strokeDasharray: '1 2', strokeDashoffset: 0 }], { duration: 680, easing: AKIS, delay: 820 });
    A(kiv.current, [{ opacity: 0, transform: 'scale(0) rotate(0deg)' }, { opacity: 1, transform: 'scale(1) rotate(45deg)', offset: 0.45 }, { opacity: 0, transform: 'scale(0.2) rotate(90deg)' }], { duration: 760, easing: AKIS, delay: 1420 });
    A(yazi.current, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0px)' }], { duration: 700, easing: AKIS, delay: 1250 });
    A(adres.current, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0px)' }], { duration: 600, easing: AKIS, delay: 1600 });
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const el = sar.current;
    if (!el || !('IntersectionObserver' in window)) { oynat(); return; }
    let bitti = false;
    const baslat = () => { if (bitti) return; bitti = true; io.disconnect(); oynat(); };
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) baslat(); }, { threshold: 0.35 });
    io.observe(el);
    // Gözlemci hiç tetiklenmezse logo gizli kalmasın
    const yedek = setTimeout(baslat, 1500);
    return () => { io.disconnect(); clearTimeout(yedek); };
  }, [autoplay, oynat]);

  const ink = dark ? '#FFFFFF' : HK_RENK.navy;
  const gold = dark ? HK_RENK.gold300 : HK_RENK.gold;
  const kutu = { transformBox: 'fill-box' } as const;
  const dikey = layout === 'stacked';

  return (
    <span
      ref={sar}
      onMouseEnter={hover ? oynat : undefined}
      style={{
        display: 'inline-flex', flexDirection: dikey ? 'column' : 'row', alignItems: 'center',
        gap: dikey ? size * 0.2 : size * 0.26, opacity: gizli ? 0 : 1,
      }}
    >
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden style={{ display: 'block', overflow: 'visible', flex: 'none' }}>
        <defs>
          {/* Açılma maskesi: omurga boyunca kalın beyaz çizgi (dashoffset ile ilerler) */}
          <mask id={`hka${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
            <path ref={ac} d={OMURGA} stroke="#fff" strokeWidth="16" fill="none" pathLength={1} />
          </mask>
          {/* Boşluk maskesi: boşluk da dalgayla birlikte açılır */}
          <mask id={`hkb${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
            <rect width="48" height="48" fill="#fff" />
            <g mask={`url(#hka${id})`}><path d={HK_LOGO.gap} stroke="#000" strokeWidth="1.6" fill="none" /></g>
          </mask>
        </defs>
        <g mask={`url(#hkb${id})`}>
          <path ref={sol} d={HK_LOGO.left} fill={ink} style={{ ...kutu, transformOrigin: '50% 100%' }} />
          <path ref={sag} d={HK_LOGO.right} fill={ink} style={{ ...kutu, transformOrigin: '50% 0%' }} />
        </g>
        <g mask={`url(#hka${id})`}><path d={HK_LOGO.band} fill={gold} /></g>
        <path ref={kiv} d={KIVILCIM} fill={dark ? '#F7F0DE' : HK_RENK.gold300} style={{ ...kutu, transformOrigin: 'center', opacity: 0 }} />
      </svg>
      {layout !== 'symbol' && (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: dikey ? 'center' : 'flex-start', gap: size * 0.08 }}>
          <span ref={yazi} style={{
            display: 'block', fontFamily: 'var(--font-manrope), Manrope, "SF Pro Display", system-ui, sans-serif',
            fontWeight: 700, fontSize: size * 0.66, letterSpacing: '-0.035em', lineHeight: 1, color: ink,
          }}>hekimhane</span>
          {url && (
            <span ref={adres} style={{
              display: 'block', fontFamily: 'var(--font-manrope), Manrope, system-ui, sans-serif',
              fontWeight: 500, fontSize: size * 0.15, letterSpacing: '0.32em', paddingLeft: '0.1em',
              color: dark ? '#C1CEE2' : '#586273',
            }}>hekimhane.com.tr</span>
          )}
        </span>
      )}
    </span>
  );
}

/** Yükleme göstergesi — altın dalga sütunların arasından sürekli akar. */
export function HkSpinner({ size = 40, dark = false, label = 'Yükleniyor' }: { size?: number; dark?: boolean; label?: string }) {
  const id = useId().replace(/:/g, '');
  const sol = useRef<SVGPathElement>(null);
  const sag = useRef<SVGPathElement>(null);
  const ac = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (azalt()) return;
    const calisan: Animation[] = [];
    try {
      if (ac.current) calisan.push(ac.current.animate(
        [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0, offset: 0.5 }, { strokeDasharray: '1 1', strokeDashoffset: -1 }],
        { duration: 1400, easing: AKIS, iterations: Infinity }));
      [sol.current, sag.current].forEach((el, i) => {
        if (el) calisan.push(el.animate([{ opacity: 1 }, { opacity: 0.35, offset: 0.5 }, { opacity: 1 }], { duration: 1400, easing: AKIS, iterations: Infinity, delay: i * 700 }));
      });
    } catch { /* yoksay */ }
    return () => calisan.forEach(a => a.cancel());
  }, []);

  const ink = dark ? '#FFFFFF' : HK_RENK.navy;
  const gold = dark ? HK_RENK.gold300 : HK_RENK.gold;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ display: 'block' }} role="progressbar" aria-label={label}>
      <defs>
        <mask id={`hks${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <path ref={ac} d={OMURGA} stroke="#fff" strokeWidth="16" fill="none" pathLength={1} />
        </mask>
      </defs>
      <path ref={sol} d={HK_LOGO.left} fill={ink} />
      <path ref={sag} d={HK_LOGO.right} fill={ink} />
      <g mask={`url(#hks${id})`}><path d={HK_LOGO.band} fill={gold} /></g>
    </svg>
  );
}
