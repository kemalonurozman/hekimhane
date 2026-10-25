'use client';

import { useEffect, useRef } from 'react';
import HkIcon from '@/components/HkIcon';
import { ERKEN_UYE_METIN as M, ERKEN_UYE_OZELLIKLER } from '@/lib/erken-uye-metin';

/**
 * İlk kullanıcılara ücretsiz Pro — tek seferlik kutlama penceresi.
 * Panel, sahibi olunan işletmenin erken üye kaydı görülmemişse bunu açar;
 * iki düğme de pencereyi kapatıp "görüldü" yazar (/api/panel/erken-uye POST).
 * Emoji yok; ikonlar HkIcon. z-index 1100 = paneldeki diğer pencerelerle aynı (Navbar 1000, çerez onayı 9000 üstte kalır).
 */
export default function ErkenUyeKutlama({ isletme, onTakvim, onKapat }: {
  isletme: string;
  onTakvim: () => void;
  onKapat: () => void;
}) {
  const kart = useRef<HTMLDivElement>(null);
  useEffect(() => {
    kart.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onKapat(); };
    window.addEventListener('keydown', esc);
    const onceki = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = onceki; };
  }, [onKapat]);

  return (
    <div className="eu-perde" role="presentation" onClick={e => { if (e.target === e.currentTarget) onKapat(); }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={kart} tabIndex={-1} className="eu-kart" role="dialog" aria-modal="true" aria-labelledby="eu-baslik">
        <div className="eu-ust">
          <div className="eu-isik" aria-hidden="true" />
          <span className="eu-ikon"><HkIcon name="premium" size={34} color="#fff" accent="#DEC283" /></span>
          <span className="eu-rozet">{M.rozet}</span>
          <h2 id="eu-baslik" className="eu-baslik">{M.baslik}</h2>
          <p className="eu-giris">{M.giris(isletme)}</p>
        </div>

        <div className="eu-govde">
          <div className="eu-takvim">
            <span className="eu-takvim-ikon"><HkIcon name="appointment" size={22} color="#12294D" accent="#C9A04A" /></span>
            <p>{M.takvim}</p>
          </div>

          <div className="eu-liste-baslik">Hesabınızda açılanlar</div>
          <ul className="eu-liste">
            {ERKEN_UYE_OZELLIKLER.map(o => (
              <li key={o.baslik}>
                <span className="eu-tik"><HkIcon name="success" size={18} /></span>
                <span><strong>{o.baslik}</strong><span className="eu-acik">{o.aciklama}</span></span>
              </li>
            ))}
          </ul>

          <p className="eu-guvence">{M.guvence}</p>

          <div className="eu-dugmeler">
            <button type="button" className="eu-birincil hk-cta-isik" onClick={onTakvim}>{M.birincil}</button>
            <button type="button" className="eu-ikincil" onClick={onKapat}>{M.ikincil}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.eu-perde{position:fixed;inset:0;z-index:1100;background:rgba(14,26,44,.46);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:euSol .25s ease both}
.eu-kart{width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:22px;box-shadow:0 30px 80px -20px rgba(14,26,44,.55);animation:euGir .45s cubic-bezier(.2,.8,.2,1) both}
.eu-ust{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:26px 30px 22px;text-align:center;background:linear-gradient(160deg,#12294D 0%,#1B3A69 70%,#22467C 100%);color:#fff}
.eu-isik{position:absolute;inset:-40% -20% auto;height:220px;background:radial-gradient(closest-side,rgba(222,194,131,.38),rgba(222,194,131,0));pointer-events:none}
.eu-ikon{position:relative;display:inline-grid;place-items:center;width:58px;height:58px;border-radius:18px;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(222,194,131,.45);margin-bottom:12px;animation:euNabiz 2.6s ease-in-out .6s infinite}
.eu-rozet{position:relative;display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:#12294D;background:#DEC283;padding:4px 10px;border-radius:999px;margin-bottom:12px}
.eu-baslik{position:relative;margin:0 0 10px;font-size:23px;line-height:1.2;font-weight:700;letter-spacing:-.6px}
.eu-giris{position:relative;margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,.86)}
.eu-govde{padding:20px 28px 22px}
.eu-takvim{display:flex;gap:12px;align-items:flex-start;padding:13px 15px;border-radius:14px;background:#FFFBF0;border:1px solid #EAD9AE;margin-bottom:16px}
.eu-takvim p{margin:0;font-size:13.5px;line-height:1.6;color:#3A3A3C}
.eu-takvim-ikon{flex-shrink:0;display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:#fff;box-shadow:inset 0 0 0 1px #EAD9AE}
.eu-liste-baslik{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6E6E73;margin:0 0 8px}
.eu-liste{list-style:none;margin:0 0 14px;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 18px}
.eu-liste li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.45;color:#1D1D1F}
.eu-tik{flex-shrink:0;margin-top:1px}
.eu-acik{display:block;font-size:12.5px;color:#6E6E73;font-weight:400;margin-top:1px}
.eu-guvence{margin:0 0 16px;padding-top:12px;border-top:1px solid #E5E5EA;font-size:12.5px;line-height:1.6;color:#6E6E73}
.eu-dugmeler{display:flex;flex-direction:column;gap:6px}
.eu-birincil{width:100%;min-height:50px;border:0;border-radius:14px;font:inherit;font-size:15px;font-weight:700;color:#12294D;cursor:pointer}
.eu-ikincil{width:100%;min-height:44px;border:0;border-radius:12px;background:transparent;font:inherit;font-size:14px;font-weight:600;color:#6E6E73;cursor:pointer}
.eu-ikincil:hover{background:#F5F5F7;color:#1D1D1F}
.eu-kart:focus{outline:none}
.eu-birincil:focus-visible,.eu-ikincil:focus-visible{outline:2px solid #12294D;outline-offset:3px}
@keyframes euSol{from{opacity:0}to{opacity:1}}
@keyframes euGir{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
@keyframes euNabiz{0%,100%{box-shadow:inset 0 0 0 1px rgba(222,194,131,.45),0 0 0 0 rgba(222,194,131,.35)}50%{box-shadow:inset 0 0 0 1px rgba(222,194,131,.7),0 0 0 10px rgba(222,194,131,0)}}
@media (prefers-reduced-motion: reduce){.eu-perde,.eu-kart,.eu-ikon{animation:none}}
@media (max-width:560px){.eu-liste{grid-template-columns:minmax(0,1fr);gap:10px}.eu-ust{padding:24px 20px 20px}.eu-govde{padding:18px 18px 18px}.eu-baslik{font-size:21px}}
`;
