'use client';

// 2 Dakika Fırçala — çocuklar için diş fırçalama oyunu.
// Ağız 4 bölge × 5 süt dişi; her bölgeye 30 sn (toplam 2 dk = önerilen fırçalama süresi).
// Yalnız parlayan bölge fırçalanır; bölge temizlenince süre dolana kadar "parlatma" puanı toplanır.
// Veri toplamaz, ses yok. Stiller: app/globals.css → "fo-".

import { useCallback, useEffect, useRef, useState } from 'react';
import HkIcon from '@/components/HkIcon';
import { LogoMark } from '@/components/Logo';

// Gömülü sürümde (başka sitede iframe) kaynak bağlantısı. Logo + bağlantı iframe'in içinde
// çizildiği için gömen site bunları değiştiremez.
const KAYNAK_URL = 'https://www.hekimhane.com.tr/cocuk-dis-sagligi/oyunlar?utm_source=oyun-gomme&utm_medium=iframe&utm_campaign=dis-fircalama';
const GOMULU_MIN_G = 280;
const GOMULU_MIN_Y = 420;

function KaynakSatiri() {
  return (
    <a className="fo-kaynak-satir" href={KAYNAK_URL} target="_blank" rel="noopener">
      <LogoMark size={16} /> hekimhane.com.tr&apos;nin ücretsiz oyunu
    </a>
  );
}

const BOLGE_MS = 30_000;
const TOPLAM_MS = BOLGE_MS * 4;
const CX = 200;
const CY = 200;
const RX = 152;
const RY = 138;
const DIS_SAYISI = 20;
const PARLATMA_ESIK = 300; // temiz dişte bu kadar fırçalama = 1 parıltı

const BOLGELER = ['Üst sol', 'Üst sağ', 'Alt sağ', 'Alt sol'];
const BOLGE_YAY: [number, number][] = [[190, 270], [270, 350], [10, 90], [90, 170]];

type Tur = 'azi' | 'kopek' | 'kesici';
interface Dis { i: number; x: number; y: number; rot: number; w: number; h: number; tur: Tur; bolge: number }

const BOYUT: Record<Tur, [number, number]> = { azi: [36, 32], kopek: [27, 32], kesici: [28, 30] };
const r2 = (n: number) => Math.round(n * 100) / 100;

function nokta(derece: number): [number, number] {
  const t = (derece * Math.PI) / 180;
  return [r2(CX + RX * Math.cos(t)), r2(CY + RY * Math.sin(t))];
}

function yay(a: number, b: number): string {
  const [x1, y1] = nokta(a);
  const [x2, y2] = nokta(b);
  return `M${x1} ${y1} A${RX} ${RY} 0 ${b - a > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

function kemer(bas: number, son: number, ilk: number, bolgeler: [number, number]): Dis[] {
  return Array.from({ length: 10 }, (_, k) => {
    const derece = bas + ((son - bas) * k) / 9;
    const t = (derece * Math.PI) / 180;
    const [x, y] = nokta(derece);
    const rot = r2((Math.atan2(RY * Math.cos(t), -RX * Math.sin(t)) * 180) / Math.PI);
    const tur: Tur = k <= 1 || k >= 8 ? 'azi' : k === 2 || k === 7 ? 'kopek' : 'kesici';
    const [w, h] = BOYUT[tur];
    return { i: ilk + k, x, y, rot, w, h, tur, bolge: k < 5 ? bolgeler[0] : bolgeler[1] };
  });
}

// Üst çene: soldan sağa (0–4 üst sol, 5–9 üst sağ). Alt çene: sağdan sola (10–14 alt sağ, 15–19 alt sol).
const DISLER: Dis[] = [...kemer(195, 345, 0, [0, 1]), ...kemer(15, 165, 10, [2, 3])];
const BOLGE_DISLERI: number[][] = [0, 1, 2, 3].map(b =>
  DISLER.filter(d => d.bolge === b).sort((a, c) => a.x - c.x).map(d => d.i),
);
const PLAK: [number, number, number][] = [[-0.22, -0.18, 0.2], [0.2, 0.02, 0.17], [-0.04, 0.24, 0.15]];
const YILDIZ_YOL = 'M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z';
const HALKA_C = 2 * Math.PI * 50;

type Durum = 'giris' | 'oyun' | 'durdu' | 'bitti';
interface Kopuk { id: number; x: number; y: number; r: number; t: number }

function sureYaz(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function bolgeYildizi(kir: number[], b: number): number {
  const temiz = BOLGE_DISLERI[b].filter(i => kir[i] === 0).length;
  return temiz === 5 ? 3 : temiz >= 3 ? 2 : temiz >= 1 ? 1 : 0;
}

function Yildiz({ dolu, boyut = 16 }: { dolu: boolean; boyut?: number }) {
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"
        fill={dolu ? '#D4A843' : 'none'} stroke={dolu ? '#C29632' : '#C7CDD6'} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function FircaOyunu({ gomulu = false }: { gomulu?: boolean }) {
  const [alanKucuk, setAlanKucuk] = useState(false);
  const [durum, setDurum] = useState<Durum>('giris');
  const [kir, setKir] = useState<number[]>(() => Array(DIS_SAYISI).fill(100));
  const [gecen, setGecen] = useState(0);
  const [yildizlar, setYildizlar] = useState<number[]>([]);
  const [parilti, setParilti] = useState(0);
  const [secili, setSeciliDurum] = useState(BOLGE_DISLERI[0][0]);
  const seciliRef = useRef(BOLGE_DISLERI[0][0]);
  const setSecili = useCallback((i: number) => { seciliRef.current = i; setSeciliDurum(i); }, []);
  const [klavye, setKlavye] = useState(false);
  const [firca, setFirca] = useState<{ x: number; y: number } | null>(null);
  const [kopukler, setKopukler] = useState<Kopuk[]>([]);
  const [mesaj, setMesaj] = useState<{ metin: string; id: number } | null>(null);
  const [duyuru, setDuyuru] = useState('');

  const svgRef = useRef<SVGSVGElement>(null);
  const alanRef = useRef<HTMLDivElement>(null);
  const kirRef = useRef<number[]>(kir);
  const gecenRef = useRef(0);
  const bolgeRef = useRef(0);
  const durumRef = useRef<Durum>('giris');
  const basili = useRef(false);
  const sonNokta = useRef<{ x: number; y: number } | null>(null);
  const kopukBirikim = useRef(0);
  const parlatmaBirikim = useRef(0);
  const kopukId = useRef(0);
  const sonUyari = useRef(0);

  durumRef.current = durum;
  const bolge = Math.min(3, Math.floor(gecen / BOLGE_MS));
  const temizSayisi = kir.filter(k => k === 0).length;
  const bolgeTemiz = BOLGE_DISLERI[bolge].every(i => kir[i] === 0);

  const goster = useCallback((metin: string) => {
    setMesaj({ metin, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!mesaj) return;
    const id = window.setTimeout(() => setMesaj(null), 2200);
    return () => window.clearTimeout(id);
  }, [mesaj]);

  const bitir = useCallback(() => {
    setYildizlar(y => { const yeni = [...y]; yeni[3] = bolgeYildizi(kirRef.current, 3); return yeni; });
    setFirca(null);
    basili.current = false;
    setDurum('bitti');
    setDuyuru('Süre bitti. İki dakika boyunca fırçaladın.');
  }, []);

  // Zamanlayıcı
  useEffect(() => {
    if (durum !== 'oyun') return;
    let son = performance.now();
    const id = window.setInterval(() => {
      if (durumRef.current !== 'oyun') return;
      const simdi = performance.now();
      gecenRef.current = Math.min(TOPLAM_MS, gecenRef.current + (simdi - son));
      son = simdi;
      setGecen(gecenRef.current);

      const b = Math.min(3, Math.floor(gecenRef.current / BOLGE_MS));
      if (b !== bolgeRef.current && gecenRef.current < TOPLAM_MS) {
        const onceki = bolgeRef.current;
        bolgeRef.current = b;
        setYildizlar(y => { const yeni = [...y]; yeni[onceki] = bolgeYildizi(kirRef.current, onceki); return yeni; });
        setSecili(BOLGE_DISLERI[b][0]);
        goster(`Sıradaki bölge: ${BOLGELER[b]}`);
        setDuyuru(`Sıradaki bölge: ${BOLGELER[b]} dişler.`);
      }
      if (gecenRef.current >= TOPLAM_MS) bitir();

      setKopukler(k => (k.length && k.some(x => simdi - x.t > 800) ? k.filter(x => simdi - x.t <= 800) : k));
    }, 100);
    return () => window.clearInterval(id);
  }, [durum, bitir, goster, setSecili]);

  // Sekme gizlenince duraklat
  useEffect(() => {
    const f = () => { if (document.hidden && durumRef.current === 'oyun') setDurum('durdu'); };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);

  // Gömülü: çerçeve çok küçükse oyunu değil, kaynağa giden bağlantıyı göster
  useEffect(() => {
    if (!gomulu) return;
    const olc = () => setAlanKucuk(window.innerWidth < GOMULU_MIN_G || window.innerHeight < GOMULU_MIN_Y);
    olc();
    window.addEventListener('resize', olc);
    return () => window.removeEventListener('resize', olc);
  }, [gomulu]);

  function basla() {
    const bos = Array(DIS_SAYISI).fill(100);
    kirRef.current = bos;
    setKir(bos);
    gecenRef.current = 0;
    bolgeRef.current = 0;
    parlatmaBirikim.current = 0;
    setGecen(0);
    setYildizlar([]);
    setParilti(0);
    setSecili(BOLGE_DISLERI[0][0]);
    setKopukler([]);
    setDurum('oyun');
    setDuyuru('Başladı. Üst sol dişleri fırçala.');
    window.setTimeout(() => alanRef.current?.focus({ preventScroll: true }), 0);
  }

  function kopukEkle(x: number, y: number) {
    const t = performance.now();
    const yeni: Kopuk = {
      id: ++kopukId.current,
      x: x + (Math.random() - 0.5) * 22,
      y: y + (Math.random() - 0.5) * 22,
      r: 3 + Math.random() * 4,
      t,
    };
    setKopukler(k => [...k.slice(-23), yeni]);
  }

  function fircala(idx: number, miktar: number) {
    if (durumRef.current !== 'oyun') return;
    const d = DISLER[idx];
    if (d.bolge !== bolgeRef.current) {
      const simdi = Date.now();
      if (simdi - sonUyari.current > 2500) {
        sonUyari.current = simdi;
        goster(`Şimdi ${BOLGELER[bolgeRef.current].toLocaleLowerCase('tr')} dişleri fırçala`);
      }
      return;
    }
    kopukBirikim.current += miktar;
    if (kopukBirikim.current >= 18) {
      kopukBirikim.current = 0;
      kopukEkle(d.x, d.y);
    }
    const onceki = kirRef.current[idx];
    if (onceki > 0) {
      const yeniKir = [...kirRef.current];
      const kalan = onceki - miktar;
      yeniKir[idx] = kalan <= 3 ? 0 : kalan;
      kirRef.current = yeniKir;
      setKir(yeniKir);
      if (yeniKir[idx] === 0) {
        const bolgeBitti = BOLGE_DISLERI[d.bolge].every(i => yeniKir[i] === 0);
        if (bolgeBitti) {
          goster('Bu bölge tertemiz! Süre dolana kadar parlat');
          setDuyuru('Bu bölge tertemiz. Süre dolana kadar parlatmaya devam et.');
        } else {
          setDuyuru(`Bir diş tertemiz. Bu bölgede ${BOLGE_DISLERI[d.bolge].filter(i => yeniKir[i] > 0).length} diş kaldı.`);
        }
      }
    } else {
      parlatmaBirikim.current += miktar;
      if (parlatmaBirikim.current >= PARLATMA_ESIK) {
        parlatmaBirikim.current = 0;
        setParilti(p => p + 1);
      }
    }
  }

  function svgNokta(e: React.PointerEvent): { x: number; y: number } | null {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function enYakin(p: { x: number; y: number }): number | null {
    let en: number | null = null;
    let enMesafe = 27 * 27;
    for (const d of DISLER) {
      const m = (d.x - p.x) ** 2 + (d.y - p.y) ** 2;
      if (m < enMesafe) { enMesafe = m; en = d.i; }
    }
    return en;
  }

  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    if (durumRef.current !== 'oyun') return;
    const p = svgNokta(e);
    if (!p) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* yakalama desteklenmiyorsa sürükleme yine çalışır */ }
    basili.current = true;
    sonNokta.current = p;
    setKlavye(false);
    setFirca(p);
    const idx = enYakin(p);
    if (idx !== null) fircala(idx, 10);
  }

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (durumRef.current !== 'oyun') return;
    const p = svgNokta(e);
    if (!p) return;
    if (e.pointerType === 'mouse' || basili.current) { setFirca(p); setKlavye(false); }
    if (!basili.current) return;
    const son = sonNokta.current;
    sonNokta.current = p;
    if (!son) return;
    const mesafe = Math.min(40, Math.hypot(p.x - son.x, p.y - son.y));
    const idx = enYakin(p);
    if (idx !== null && mesafe > 0.5) fircala(idx, mesafe * 0.45);
  }

  function onUp() {
    basili.current = false;
    sonNokta.current = null;
  }

  function onLeave(e: React.PointerEvent) {
    onUp();
    if (e.pointerType === 'mouse') setFirca(null);
  }

  function onKey(e: React.KeyboardEvent) {
    if (durum !== 'oyun') return;
    const sira = BOLGE_DISLERI[bolgeRef.current];
    const k = sira.indexOf(seciliRef.current);
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      setKlavye(true);
      setSecili(sira[(Math.max(0, k) - 1 + sira.length) % sira.length]);
    } else if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      setKlavye(true);
      setSecili(sira[(k + 1) % sira.length]);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setKlavye(true);
      fircala(k >= 0 ? sira[k] : sira[0], 22);
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      e.preventDefault();
      setDurum('durdu');
    }
  }

  const seciliDis = DISLER[secili];
  const fircaKonum = klavye && durum === 'oyun' ? { x: seciliDis.x, y: seciliDis.y } : durum === 'oyun' ? firca : null;
  const bolgeIlerleme = gecen >= TOPLAM_MS ? 1 : (gecen % BOLGE_MS) / BOLGE_MS;
  const toplamYildiz = yildizlar.reduce((a, b) => a + (b || 0), 0);
  const oynaniyor = durum === 'oyun';

  let durumMetni = 'Parlayan bölgedeki dişleri fırçala.';
  if (durum === 'giris') durumMetni = 'Hazır olunca başla.';
  else if (durum === 'durdu') durumMetni = 'Duraklatıldı.';
  else if (durum === 'bitti') durumMetni = `Bitti! ${temizSayisi} diş tertemiz.`;
  else if (bolgeTemiz) durumMetni = `Tertemiz! Parlatmaya devam et · ${parilti} parıltı`;

  if (gomulu && alanKucuk) {
    return (
      <div className="fo-kart fo-kart--gomulu fo-kart--kucuk">
        <a href={KAYNAK_URL} target="_blank" rel="noopener" className="fo-kucuk-bag">
          <LogoMark size={36} />
          <b>2 Dakika Fırçala</b>
          <span>Oyunu oynamak için dokunun · hekimhane.com.tr</span>
        </a>
      </div>
    );
  }

  return (
    <div className={gomulu ? 'fo-kart fo-kart--gomulu' : 'fo-kart'}>
      <div className="fo-ust">
        <span className="fo-hap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9.5 2.5h5" />
          </svg>
          {durum === 'giris' ? '2:00' : sureYaz(TOPLAM_MS - gecen)}
          <span className="fo-hap__ayrac" aria-hidden="true" />
          Bölge {bolge + 1}/4
        </span>
        <span className="fo-sayac">Tertemiz <b>{temizSayisi}/{DIS_SAYISI}</b></span>
      </div>
      <div className="fo-cubuk" aria-hidden="true"><span style={{ width: `${(gecen / TOPLAM_MS) * 100}%` }} /></div>

      <div className="fo-sahne">
        <div
          ref={alanRef}
          className="fo-alan"
          tabIndex={oynaniyor ? 0 : -1}
          role="application"
          aria-label="Diş fırçalama alanı. Ok tuşlarıyla diş seçin, boşluk tuşuyla fırçalayın, Escape ile duraklatın."
          onKeyDown={onKey}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 400 400"
            className={`fo-svg${oynaniyor ? ' fo-svg--oyun' : ''}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onLeave}
            aria-hidden="true"
          >
            <path d={yay(188, 352)} className="fo-dis-eti" />
            <path d={yay(8, 172)} className="fo-dis-eti" />
            {oynaniyor || durum === 'durdu' ? (
              <path key={bolge} d={yay(BOLGE_YAY[bolge][0], BOLGE_YAY[bolge][1])} className="fo-bolge-isik" />
            ) : null}

            {DISLER.map(d => {
              const temiz = kir[d.i] === 0;
              const aktif = (oynaniyor || durum === 'durdu') && d.bolge === bolge;
              const sinif = [
                'fo-dis',
                temiz ? 'fo-dis--temiz' : '',
                aktif ? 'fo-dis--aktif' : '',
                (oynaniyor || durum === 'durdu') && !aktif ? 'fo-dis--pasif' : '',
                klavye && oynaniyor && d.i === secili ? 'fo-dis--secili' : '',
              ].filter(Boolean).join(' ');
              return (
                <g key={d.i} className={sinif} transform={`translate(${d.x} ${d.y}) rotate(${d.rot})`}>
                  <rect className="fo-govde" x={-d.w / 2} y={-d.h / 2} width={d.w} height={d.h} rx={d.tur === 'azi' ? 10 : 9} />
                  {d.tur === 'azi' && <path className="fo-oluk" d={`M${-d.w * 0.22} 0 Q0 ${-d.h * 0.14} ${d.w * 0.22} 0`} />}
                  {kir[d.i] > 0 && PLAK.map(([px, py, pr], j) => (
                    <circle key={j} className="fo-plak" cx={px * d.w} cy={py * d.h} r={pr * d.w} opacity={(kir[d.i] / 100) * 0.9} />
                  ))}
                  {temiz && (
                    <path className="fo-parilti" d={YILDIZ_YOL} transform={`translate(${d.w * 0.3} ${-d.h * 0.32}) scale(0.75)`} />
                  )}
                </g>
              );
            })}

            {kopukler.map(k => <circle key={k.id} className="fo-kopuk" cx={k.x} cy={k.y} r={k.r} />)}

            <circle cx={CX} cy={CY} r={50} className="fo-halka-iz" />
            <circle
              cx={CX} cy={CY} r={50} className="fo-halka"
              strokeDasharray={HALKA_C} strokeDashoffset={HALKA_C * (1 - bolgeIlerleme)}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
            <text x={CX} y={CY + 4} textAnchor="middle" className="fo-sure">
              {durum === 'giris' ? '2:00' : sureYaz(TOPLAM_MS - gecen)}
            </text>
            <text x={CX} y={CY + 22} textAnchor="middle" className="fo-etiket">
              {BOLGELER[bolge].toLocaleUpperCase('tr')}
            </text>
            {[0, 1, 2, 3].map(b => (
              <circle key={b} cx={CX - 15 + b * 10} cy={CY - 26} r={3}
                className={b < bolge || durum === 'bitti' ? 'fo-nokta fo-nokta--bitti' : b === bolge && durum !== 'giris' ? 'fo-nokta fo-nokta--aktif' : 'fo-nokta'} />
            ))}

            {fircaKonum && (
              <g className="fo-firca" transform={`translate(${r2(fircaKonum.x)} ${r2(fircaKonum.y)}) rotate(-28)`}>
                <rect x={-14} y={-5} width={28} height={9} rx={2.5} fill="#8ECFE6" stroke="#5FA9C6" strokeWidth="1" />
                <rect x={-16} y={4} width={32} height={9} rx={4} fill="#FFFFFF" stroke="#1B3A69" strokeWidth="1.6" />
                <rect x={14} y={5.5} width={58} height={7} rx={3.5} fill="#D4A843" stroke="#B88E2F" strokeWidth="1" />
              </g>
            )}
          </svg>
        </div>

        {mesaj && oynaniyor && <div key={mesaj.id} className="fo-mesaj">{mesaj.metin}</div>}

        {durum === 'giris' && (
          <div className="fo-perde">
            <div className="fo-perde__ic">
              <span className="fo-perde__ikon"><HkIcon name="dentistry" size={28} color="#1B3A69" /></span>
              <h2>2 Dakika Fırçala</h2>
              <ol className="fo-adimlar">
                <li><b className="no">1</b><span>Ağzın dört bölgesi sırayla parlar. Her bölgeye <strong>30 saniye</strong> var.</span></li>
                <li><b className="no">2</b><span>Parlayan dişlerin üstünde parmağını ya da fareni basılı tutup ileri geri gezdir.</span></li>
                <li><b className="no">3</b><span>Sarı plaklar kaybolunca diş parlar. Süre dolana kadar parlatmaya devam et.</span></li>
              </ol>
              <button type="button" className="fo-dugme fo-dugme--ana" onClick={basla}>Fırçalamaya başla</button>
              {gomulu && <KaynakSatiri />}
            </div>
          </div>
        )}

        {durum === 'durdu' && (
          <div className="fo-perde">
            <div className="fo-perde__ic">
              <h2>Duraklatıldı</h2>
              <p>Kalan süre {sureYaz(TOPLAM_MS - gecen)}. Hazır olunca kaldığın yerden devam et.</p>
              <button type="button" className="fo-dugme fo-dugme--ana" onClick={() => { setDurum('oyun'); window.setTimeout(() => alanRef.current?.focus({ preventScroll: true }), 0); }}>
                Devam et
              </button>
            </div>
          </div>
        )}

        {durum === 'bitti' && (
          <div className="fo-perde">
            <div className="fo-perde__ic">
              <h2>{toplamYildiz >= 11 ? 'Pırıl pırıl!' : toplamYildiz >= 7 ? 'Çok iyi!' : 'İyi başlangıç!'}</h2>
              <p>
                Tam 2 dakika fırçaladın. {temizSayisi}/{DIS_SAYISI} diş tertemiz
                {parilti > 0 ? `, ${parilti} parıltı topladın` : ''}.
                {toplamYildiz < 11 ? ' Bir dahaki sefere her bölgedeki bütün dişleri fırçalamayı dene.' : ''}
              </p>
              <div className="fo-yildizlar">
                {BOLGELER.map((ad, b) => (
                  <div key={ad} className="fo-yildiz-satir">
                    <span>{ad}</span>
                    <span className="fo-yildiz-dizi" aria-label={`${yildizlar[b] || 0} yıldız`}>
                      {[0, 1, 2].map(s => <Yildiz key={s} dolu={s < (yildizlar[b] || 0)} />)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="fo-not">Gerçek fırçalama da böyle: sabah ve akşam, her seferinde 2 dakika.</p>
              <button type="button" className="fo-dugme fo-dugme--ana" onClick={basla}>Yeniden oyna</button>
              {gomulu && <KaynakSatiri />}
            </div>
          </div>
        )}
      </div>

      <div className="fo-alt">
        <span className="fo-durum">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          </svg>
          <span>{durumMetni}</span>
        </span>
        <span className="fo-dugmeler">
          {oynaniyor && (
            <button type="button" className="fo-dugme" onClick={() => setDurum('durdu')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              Duraklat
            </button>
          )}
          {(oynaniyor || durum === 'durdu') && (
            <button type="button" className="fo-dugme" onClick={basla}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
              Baştan
            </button>
          )}
        </span>
      </div>
      {!gomulu && <p className="fo-ipucu">Klavye: ok tuşlarıyla diş seçin, boşluk tuşuyla fırçalayın, Esc ile duraklatın.</p>}
      {gomulu && (
        <a className="fo-marka" href={KAYNAK_URL} target="_blank" rel="noopener" aria-label="Hekimhane — daha fazla çocuk oyunu (yeni sekmede açılır)">
          <LogoMark size={22} />
          <span className="fo-marka__ad">hekimhane<span>.com.tr</span></span>
          <span className="fo-marka__git">Daha fazla oyun →</span>
        </a>
      )}
      <div className="fo-gizli" aria-live="polite">{duyuru}</div>
    </div>
  );
}
