'use client';

// Koyu, sekmeli vitrin — her sekmede küçük üst yazı, vurgulu iri başlık, isteğe bağlı kısa açıklama,
// bağlantı düğmesi ve süzülen bir ekran çizimi. Sekmeler altta; süre dolunca sıradakine kendiliğinden
// geçer (aktif sekmenin altındaki çizgi kalan süreyi gösterir), üzerine gelince bekler.
// Telefonda parmakla, bilgisayarda fareyle sola/sağa sürüklenebilir; geçişler yana kayarak olur.
// `hero`: ana sayfanın en üstünde — başlık h1 olur, üst boşluk ve sekme yazısı küçülür.
// Bölüm, tüm sekmelerin en uzun metni kadar yer ayırır (görünmez ölçü katmanı, .vt-sek__olcu):
// sekme değişince yükseklik oynamaz, altındaki arama kutusu zıplamaz.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSurukle } from './useSurukle';

export interface VitrinSekme {
  id: string;
  ad: string;
  ustyazi: string;
  /** [normal metin, vurgulu metin] */
  baslik: [string, string];
  /** Başlığın altında kısa açıklama (isteğe bağlı) */
  aciklama?: string;
  cta: { href: string; ad: string };
  gorsel: React.ReactNode;
  /** Arkadaki renkli noktalı siluet */
  desen: React.ReactNode;
  /** Vurgu rengi (başlıktaki renkli sözcük, düğme, ışıma) */
  renk: string;
}

const SURE = 6500;

export default function SekmeliVitrin({ sekmeler, hero = false }: { sekmeler: VitrinSekme[]; hero?: boolean }) {
  const [i, setI] = useState(0);
  const [yon, setYon] = useState<1 | -1>(1);   // kayma yönü: 1 = sonraki (sağdan gelir), -1 = önceki
  const [bekle, setBekle] = useState(false);
  const [gorunur, setGorunur] = useState(false);
  const [kenar, setKenar] = useState({ sol: false, sag: false });   // sekme şeridi taşıyor mu
  const kok = useRef<HTMLElement>(null);
  const serit = useRef<HTMLDivElement>(null);
  const ilk = useRef(true);

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
    const t = setTimeout(() => { setYon(1); setI(n => (n + 1) % sekmeler.length); }, SURE);
    return () => clearTimeout(t);
  }, [i, bekle, gorunur, sekmeler.length]);

  // Sekme şeridi ekrana sığmıyorsa kenarları solar; aktif sekme görünür alana kayar (yalnız yatay)
  const kenarOlc = useCallback(() => {
    const el = serit.current;
    if (!el) return;
    setKenar({ sol: el.scrollLeft > 4, sag: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    kenarOlc();
    const el = serit.current;
    if (el && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(kenarOlc);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', kenarOlc);
    return () => window.removeEventListener('resize', kenarOlc);
  }, [kenarOlc]);
  useEffect(() => {
    if (ilk.current) { ilk.current = false; return; }
    const el = serit.current;
    const btn = el?.children[i] as HTMLElement | undefined;
    if (!el || !btn || el.scrollWidth <= el.clientWidth) return;
    const azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: azalt ? 'auto' : 'smooth' });
  }, [i]);

  const sonraki = () => { setYon(1); setI(n => (n + 1) % sekmeler.length); };
  const onceki = () => { setYon(-1); setI(n => (n - 1 + sekmeler.length) % sekmeler.length); };
  const surukle = useSurukle({ onSonraki: sonraki, onOnceki: onceki });

  const s = sekmeler[i];
  const Baslik = (hero ? 'h1' : 'h2') as 'h1' | 'h2';
  return (
    <section ref={kok} className={`vt-sek${hero ? ' vt-sek--hero' : ''}`} style={{ ['--vt-vurgu' as string]: s.renk } as React.CSSProperties}
      onMouseEnter={() => setBekle(true)} onMouseLeave={() => setBekle(false)}>
      <div className="vt-sek__isima" aria-hidden="true" />
      <div className="container">
        <div key={s.id} {...surukle.baglar} style={surukle.stil}
          className={`vt-sek__icerik${i % 2 ? ' vt-sek__icerik--ters' : ''} ${yon > 0 ? 'vt-sek__icerik--ileri' : 'vt-sek__icerik--geri'}${surukle.suruk ? ' is-suruk' : ''}`}>
          {/* Ölçü katmanı: tüm sekmelerin metni görünmez üst üste durur → en uzun metin kadar yer ayrılır.
              Telefonda altına sahne yüksekliği eklenir; kısa metinli sekmede artan yer çizimin çevresine dağılır. */}
          <div className="vt-sek__olcu" aria-hidden="true">
            {sekmeler.map(x => (
              <div key={x.id} className="vt-sek__metin">
                <p className="vt-sek__ust">{x.ustyazi}</p>
                <div className="vt-sek__baslik">{x.baslik[0]} <em>{x.baslik[1]}</em></div>
                {x.aciklama && <p className="vt-sek__aciklama">{x.aciklama}</p>}
                <span className="vt-sek__dugme">{x.cta.ad}</span>
              </div>
            ))}
          </div>
          <div className="vt-sek__on">
            <div className="vt-sek__metin">
              <p className="vt-sek__ust">{s.ustyazi}</p>
              <Baslik className="vt-sek__baslik">{s.baslik[0]} <em>{s.baslik[1]}</em></Baslik>
              {s.aciklama && <p className="vt-sek__aciklama">{s.aciklama}</p>}
              <Link href={s.cta.href} className="vt-sek__dugme">{s.cta.ad}</Link>
            </div>
            <div className="vt-sek__sahne">
              <div className="vt-sek__desen">{s.desen}</div>
              <div className="vt-sek__gorsel">{s.gorsel}</div>
            </div>
          </div>
        </div>

        <div ref={serit} onScroll={kenarOlc} role="tablist" aria-label="Öne çıkanlar"
          className={`vt-sek__sekmeler${kenar.sol ? ' is-sol' : ''}${kenar.sag ? ' is-sag' : ''}`}>
          {sekmeler.map((x, k) => (
            <button key={x.id} type="button" role="tab" aria-selected={k === i}
              className={k === i ? 'is-aktif' : undefined} onClick={() => { setYon(k > i ? 1 : -1); setI(k); }}>
              {x.ad}
              {k === i && <span key={`${i}-${bekle || !gorunur ? 'd' : 'c'}`} style={{ animationDuration: `${SURE}ms`, animationPlayState: bekle || !gorunur ? 'paused' : 'running' }} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
