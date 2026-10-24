'use client';

// Yatay sürükleme (swipe) — telefonda parmak, bilgisayarda fare.
// Kullanım: const s = useSurukle({ onSonraki, onOnceki }); <div {...s.baglar} style={s.stil} className={s.suruk ? 'is-suruk' : ''}>
// Alanın CSS'inde `touch-action: pan-y` olmalı (dikey kaydırma çalışsın, yatay hareketi biz alalım).
// Sürüklerken içerik parmağı izler; eşik (px) aşılırsa sonraki/önceki çağrılır, aksi hâlde yerine döner.
// Sürükleme sonrası tıklama (bağlantıya yanlışlıkla basma) engellenir.
import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, MouseEvent } from 'react';

export function useSurukle({ onSonraki, onOnceki, esik = 56 }: { onSonraki: () => void; onOnceki: () => void; esik?: number }) {
  const [dx, setDx] = useState(0);
  const [suruk, setSuruk] = useState(false);
  const d = useRef({ x: 0, y: 0, aktif: false, yatay: false, id: -1, hareket: false });

  const bitir = (e: PointerEvent<HTMLElement>, iptal = false) => {
    const s = d.current;
    if (!s.aktif || e.pointerId !== s.id) return;
    const fark = e.clientX - s.x;
    const yatay = s.yatay;
    s.aktif = false; s.yatay = false;
    setSuruk(false); setDx(0);
    if (yatay && !iptal) {
      if (fark <= -esik) onSonraki();
      else if (fark >= esik) onOnceki();
    }
    // yatay sürüklenen bir hareketten sonra gelen click'i yut
    if (s.hareket) setTimeout(() => { s.hareket = false; }, 0);
  };

  const baglar = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      d.current = { x: e.clientX, y: e.clientY, aktif: true, yatay: false, id: e.pointerId, hareket: false };
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const s = d.current;
      if (!s.aktif || e.pointerId !== s.id) return;
      const ddx = e.clientX - s.x, ddy = e.clientY - s.y;
      if (!s.yatay) {
        if (Math.abs(ddx) > 8 && Math.abs(ddx) > Math.abs(ddy) * 1.2) {
          s.yatay = true; s.hareket = true; setSuruk(true);
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* yok say */ }
        } else if (Math.abs(ddy) > 10) { s.aktif = false; return; }   // dikey kaydırma: karışma
      }
      if (s.yatay) setDx(Math.max(-140, Math.min(140, ddx)));
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => bitir(e),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => bitir(e, true),
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (d.current.hareket) { e.preventDefault(); e.stopPropagation(); }
    },
  };

  const stil: CSSProperties | undefined = (suruk || dx !== 0)
    ? { transform: `translateX(${dx}px)`, opacity: 1 - Math.min(Math.abs(dx), 140) / 420, transition: suruk ? 'none' : 'transform .28s cubic-bezier(.2,.8,.2,1), opacity .28s ease' }
    : undefined;

  return { baglar, stil, suruk };
}
