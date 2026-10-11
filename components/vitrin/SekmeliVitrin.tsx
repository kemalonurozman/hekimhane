'use client';

// Koyu, sekmeli vitrin — her sekmede küçük üst yazı, vurgulu iri başlık, bağlantı düğmesi
// ve süzülen bir ekran çizimi. Sekmeler altta; süre dolunca sıradakine kendiliğinden geçer
// (aktif sekmenin altındaki çizgi kalan süreyi gösterir), üzerine gelince bekler.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface VitrinSekme {
  id: string;
  ad: string;
  ustyazi: string;
  /** [normal metin, vurgulu metin] */
  baslik: [string, string];
  cta: { href: string; ad: string };
  gorsel: React.ReactNode;
  /** Arkadaki renkli noktalı siluet */
  desen: React.ReactNode;
  /** Vurgu rengi (başlıktaki renkli sözcük, düğme, ışıma) */
  renk: string;
}

const SURE = 6500;

export default function SekmeliVitrin({ sekmeler }: { sekmeler: VitrinSekme[] }) {
  const [i, setI] = useState(0);
  const [bekle, setBekle] = useState(false);
  const [gorunur, setGorunur] = useState(false);
  const kok = useRef<HTMLElement>(null);

  // Yalnız ekrandayken döner (görünmeyen bölüm boşuna çalışmasın)
  useEffect(() => {
    const el = kok.current;
    if (!el || !('IntersectionObserver' in window)) { setGorunur(true); return; }
    const io = new IntersectionObserver(es => setGorunur(es.some(e => e.isIntersecting)), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (bekle || !gorunur) return;
    const t = setTimeout(() => setI(n => (n + 1) % sekmeler.length), SURE);
    return () => clearTimeout(t);
  }, [i, bekle, gorunur, sekmeler.length]);

  const s = sekmeler[i];
  return (
    <section ref={kok} className="vt-sek" style={{ ['--vt-vurgu' as string]: s.renk } as React.CSSProperties}
      onMouseEnter={() => setBekle(true)} onMouseLeave={() => setBekle(false)}>
      <div className="vt-sek__isima" aria-hidden="true" />
      <div className="container">
        <div key={s.id} className={`vt-sek__icerik${i % 2 ? ' vt-sek__icerik--ters' : ''}`}>
          <div className="vt-sek__metin">
            <p className="vt-sek__ust">{s.ustyazi}</p>
            <h2 className="vt-sek__baslik">{s.baslik[0]} <em>{s.baslik[1]}</em></h2>
            <Link href={s.cta.href} className="vt-sek__dugme">{s.cta.ad}</Link>
          </div>
          <div className="vt-sek__sahne">
            <div className="vt-sek__desen">{s.desen}</div>
            <div className="vt-sek__gorsel">{s.gorsel}</div>
          </div>
        </div>

        <div className="vt-sek__sekmeler" role="tablist" aria-label="Öne çıkanlar">
          {sekmeler.map((x, k) => (
            <button key={x.id} type="button" role="tab" aria-selected={k === i}
              className={k === i ? 'is-aktif' : undefined} onClick={() => setI(k)}>
              {x.ad}
              {k === i && <span key={`${i}-${bekle || !gorunur ? 'd' : 'c'}`} style={{ animationDuration: `${SURE}ms`, animationPlayState: bekle || !gorunur ? 'paused' : 'running' }} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
