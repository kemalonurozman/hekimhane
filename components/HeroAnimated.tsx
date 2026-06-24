'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResults } from '@/app/api/search/route';

// ── Partikül canvas ──────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  pulse: number; pulseSpeed: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -999, y: -999 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let particles: Particle[] = [];
    let W = 0, H = 0;

    function resize() {
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width  = W;
      canvas!.height = H;
      init();
    }

    function init() {
      const count = Math.floor((W * H) / 12000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        size: Math.random() * 2.5 + .8,
        opacity: Math.random() * .35 + .08,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * .012 + .004,
      }));
    }

    function drawCross(x: number, y: number, size: number, alpha: number) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = size * .45;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
      ctx.stroke();
      ctx.restore();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p, i) => {
        const dx   = mx - p.x;
        const dy   = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180 * .018;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
        }

        p.vx *= .978; p.vy *= .978;
        p.x  += p.vx; p.y  += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        const ao = p.opacity + Math.sin(p.pulse) * .06;

        for (let j = i + 1; j < particles.length; j++) {
          const q  = particles[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < 110) {
            ctx.save();
            ctx.globalAlpha = (1 - ed / 110) * .12;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth   = .6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.restore();
          }
        }

        if (i % 4 === 0) {
          drawCross(p.x, p.y, p.size * 1.8, ao);
        } else {
          ctx.save();
          ctx.globalAlpha = ao;
          ctx.fillStyle   = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    loop();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onMove(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function onLeave() { mouseRef.current = { x: -999, y: -999 }; }
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, overflow: 'hidden' }}
    />
  );
}

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

// ── Mouse takip gradyanı ─────────────────────────────────────────────────────
function MouseGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const section = el.parentElement; if (!section) return;

    let tx = section.offsetWidth * .75;
    let ty = section.offsetHeight * .2;
    let cx = tx; let cy = ty;
    let rafId = 0;

    function animate() {
      cx += (tx - cx) * .18;
      cy += (ty - cy) * .18;
      el!.style.transform = `translate(${cx}px, ${cy}px)`;
      rafId = requestAnimationFrame(animate);
    }
    animate();

    function onMove(ev: MouseEvent) {
      const r = section!.getBoundingClientRect();
      tx = ev.clientX - r.left;
      ty = ev.clientY - r.top;
    }

    section.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={ref} style={{
      position: 'absolute',
      top: 0, left: 0,
      width: 700, height: 700,
      marginTop: -350, marginLeft: -350,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(212,168,67,.2) 0%, rgba(212,168,67,.05) 45%, transparent 70%)',
      zIndex: 2, pointerEvents: 'none',
      willChange: 'transform',
    }} />
  );
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
  { key: 'doktorlar'  as const, baslik: 'Doktor',   renk: '#1B3A69', bg: '#EEF2FF' },
  { key: 'hastaneler' as const, baslik: 'Hastane',  renk: '#2D6A4F', bg: '#ECFDF5' },
  { key: 'klinikler'  as const, baslik: 'Klinik',   renk: '#6B4C9A', bg: '#F5F3FF' },
  { key: 'eczaneler'  as const, baslik: 'Eczane',   renk: '#B45309', bg: '#FFF7ED' },
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
        const res  = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        const data: SearchResults = await res.json();
        setSonuclar(data);
        const toplam =
          data.doktorlar.length + data.hastaneler.length +
          data.klinikler.length + data.eczaneler.length;
        setAcik(toplam > 0);
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
    // Arama sayfası yoksa klinikler listesine yönlendir
    router.push(`/klinikler?q=${encodeURIComponent(term)}`);
  }

  function handleSelect(href: string) {
    setAcik(false);
    router.push(href);
  }

  const aktifGruplar = GRUPLAR_CONFIG
    .map(g => ({ ...g, items: sonuclar?.[g.key] ?? [] }))
    .filter(g => g.items.length > 0);

  const dropdownAcik = acik && aktifGruplar.length > 0;

  return (
    <div
      ref={wrapRef}
      className="hero-search-form"
      style={{
        position: 'relative',
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
            color: yukleniyor ? '#D4A843' : 'rgba(255,255,255,.4)',
            display: 'flex', pointerEvents: 'none',
            transition: 'color .2s',
          }}>
            {yukleniyor ? <IconSpinner /> : <IconSearch />}
          </div>

          {/* Input */}
          <input
            value={q}
            onChange={handleInput}
            onFocus={() => sonuclar && aktifGruplar.length > 0 && setAcik(true)}
            placeholder="Klinik, hastane, doktor veya eczane…"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              borderRadius: dropdownAcik ? '16px 16px 0 0' : '16px',
              border: '1px solid rgba(255,255,255,.15)',
              borderBottom: dropdownAcik ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(255,255,255,.15)',
              background: 'rgba(255,255,255,.09)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: 'white',
              fontSize: 15, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
              letterSpacing: '-.1px',
              boxShadow: '0 8px 32px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.08)',
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
              borderRadius: '0 0 16px 16px',
              boxShadow: '0 20px 60px rgba(0,0,0,.28)',
              zIndex: 9999,
              overflow: 'hidden',
              maxHeight: 400,
              overflowY: 'auto',
            }}>
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
            </div>
          )}
        </div>

        {/* Ara butonu */}
        <button type="submit" style={{
          padding: '16px 28px', borderRadius: 16, border: 'none',
          background: 'linear-gradient(135deg, #D4A843 0%, #E8BE5A 100%)',
          color: 'white', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', letterSpacing: '-.1px',
          flexShrink: 0, fontFamily: 'inherit',
          boxShadow: '0 4px 20px rgba(212,168,67,.4)',
          alignSelf: 'flex-start',
        }}>
          Ara
        </button>
      </form>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
interface Props {
  stats: { klinik: number; hastane: number; doktor: number; eczane: number };
}

export default function HeroAnimated({ stats }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const statItems = [
    { label: 'Klinik',   val: stats.klinik  },
    { label: 'Hastane',  val: stats.hastane },
    { label: 'Doktor',   val: stats.doktor  },
    { label: 'Eczane',   val: stats.eczane  },
  ];

  return (
    <section style={{
      position: 'relative',
      background: 'linear-gradient(160deg, #071A2E 0%, #0E2D55 40%, #163D6E 70%, #1B3A69 100%)',
      padding: '100px 0 108px',
      /* overflow: hidden kaldırıldı — dropdown'ın section dışına çıkmasına izin ver */
    }}>
      <style>{`
        .hero-section {
          padding: 100px 0 108px;
        }
        .hero-search-form {
          max-width: 560px;
          margin: 0 auto 60px;
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
      `}</style>

      {/* Arka plan katmanları */}
      <ParticleCanvas />
      <MouseGradient />

      {/* Alt gradient geçiş */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, zIndex: 3,
        background: 'linear-gradient(to bottom, transparent, rgba(7,26,46,.35))',
        pointerEvents: 'none',
      }} />

      {/* İçerik */}
      <div className="container" style={{ position: 'relative', zIndex: 4, textAlign: 'center' }}>

        {/* Etiket */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(212,168,67,.12)',
          border: '1px solid rgba(212,168,67,.3)',
          borderRadius: 20, padding: '5px 16px',
          fontSize: 11, fontWeight: 600, color: '#D4A843',
          letterSpacing: '1.2px', textTransform: 'uppercase',
          marginBottom: 32,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity .6s ease, transform .6s ease',
        }}>
          Türkiye Sağlık Rehberi
        </div>

        {/* Başlık */}
        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 72px)',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1.06,
          letterSpacing: '-2.5px',
          margin: '0 0 22px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity .7s ease .1s, transform .7s ease .1s',
        }}>
          Doğru Sağlık Kurumuna<br />
          <span style={{
            color: '#D4A843',
            textShadow: '0 0 60px rgba(212,168,67,.35)',
          }}>
            Hızlıca Ulaşın
          </span>
        </h1>

        {/* Alt yazı */}
        <p style={{
          fontSize: 17, color: 'rgba(255,255,255,.58)',
          maxWidth: 520, margin: '0 auto 48px',
          lineHeight: 1.7, fontWeight: 400, letterSpacing: '.1px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity .7s ease .2s, transform .7s ease .2s',
        }}>
          {stats.klinik.toLocaleString('tr')}+ klinik,&nbsp;
          {stats.hastane.toLocaleString('tr')}+ hastane,&nbsp;
          {stats.doktor.toLocaleString('tr')}+ doktor ve&nbsp;
          {stats.eczane.toLocaleString('tr')}+ eczane
        </p>

        {/* ── Canlı Arama ─────────────────────────────────────────── */}
        <LiveSearchForm mounted={mounted} />

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
                fontWeight: 800, color: 'white',
                letterSpacing: '-1.5px', lineHeight: 1,
              }}>
                <AnimatedCount target={s.val} />
              </div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,.45)',
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
