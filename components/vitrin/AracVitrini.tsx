'use client';

// "Öne çıkan araçlar" vitrini — solda yapışkan başlık + liste, sağda büyük kartlar.
// Kaydırdıkça görünen kart solda işaretlenir (IntersectionObserver); listeden
// tıklayınca ilgili karta kaydırılır. Telefonda liste yatay kaydırılan çip şeridine döner.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface Arac {
  id: string;
  ad: string;
  /** Kartın üstündeki küçük etiket */
  etiket: string;
  /** Büyük tanıtım cümlesi */
  cumle: string;
  pro?: boolean;
  gorsel: React.ReactNode;
  /** Köşedeki noktalı grafik */
  desen?: React.ReactNode;
  /** Kartın tamamı bu adrese gider */
  href?: string;
  /** Üzerine gelince kartın büründüğü renk (açık ton) ve şerit/düğme rengi (koyu ton) */
  renk?: { zemin: string; vurgu: string };
}

export default function AracVitrini({ baslik, araclar }: { baslik: string; araclar: Arac[] }) {
  const [aktif, setAktif] = useState(araclar[0]?.id);
  const kartlar = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => {
      // Ekranın orta bandına giren kart aktif sayılır
      const gorunen = es.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const id = gorunen && (gorunen.target as HTMLElement).dataset.id;
      if (id) setAktif(id);
    }, { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.2, 0.6] });
    Object.values(kartlar.current).forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [araclar]);

  const git = (id: string) => {
    const el = kartlar.current[id];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="vt-arac">
      <div className="vt-arac__yan">
        <h2 className="vt-arac__baslik">{baslik}</h2>
        <nav className="vt-arac__liste" aria-label={baslik}>
          {araclar.map(a => (
            <button key={a.id} type="button" onClick={() => git(a.id)}
              className={a.id === aktif ? 'is-aktif' : undefined} aria-current={a.id === aktif ? 'true' : undefined}>
              {a.ad}
            </button>
          ))}
        </nav>
      </div>
      <div className="vt-arac__kartlar">
        {araclar.map(a => {
          const ic = (
            <>
              {a.desen}
              {/* Üzerine gelince arkadan akan bağlantı şeridi */}
              <div className="vt-serit" aria-hidden="true">
                <div className="vt-serit__ic">
                  {Array.from({ length: 12 }).map((_, i) => <span key={i}>{a.ad} →</span>)}
                </div>
              </div>
              <div className="vt-arac__ust">
                <span className="vt-arac__etiket">{a.etiket}</span>
                {a.pro && <span className="vt-pro">Pro</span>}
              </div>
              <p className="vt-arac__cumle">{a.cumle}</p>
              <div className="vt-arac__gorsel">{a.gorsel}</div>
            </>
          );
          const stil = a.renk ? ({ ['--vt-zemin' as string]: a.renk.zemin, ['--vt-vurgu' as string]: a.renk.vurgu } as React.CSSProperties) : undefined;
          return a.href
            ? <Link key={a.id} href={a.href} data-id={a.id} ref={(el: HTMLAnchorElement | null) => { kartlar.current[a.id] = el; }} className="vt-arac__kart vt-arac__kart--bag" style={stil} aria-label={`${a.ad}: ${a.cumle}`}>{ic}</Link>
            : <article key={a.id} data-id={a.id} ref={el => { kartlar.current[a.id] = el; }} className="vt-arac__kart" style={stil}>{ic}</article>;
        })}
      </div>
    </div>
  );
}
