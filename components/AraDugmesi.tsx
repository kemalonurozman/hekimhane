'use client';

// ─────────────────────────────────────────────────────────────────
//  Telefon numarası sitede hiçbir yerde açıkta yazmaz — yalnız bu düğme.
//  Basınca tel: bağlantısı arar (telefonda) ve etiket numaraya döner
//  (masaüstünde numarayı görmenin yolu bu).
// ─────────────────────────────────────────────────────────────────
import { useState, type CSSProperties, type ReactNode } from 'react';

export function telBaglantisi(tel: string): string {
  return 'tel:' + String(tel).replace(/[^\d+]/g, '');
}

interface Props {
  tel: string;
  etiket?: string;                       // kapalıyken yazı (varsayılan "Ara")
  goster?: (tel: string) => string;      // açılınca numaranın biçimi
  ikon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  durdur?: boolean;                      // tıklama kart tıklamasına geçmesin
  children?: (metin: string, acik: boolean) => ReactNode;  // özel iç düzen
}

export default function AraDugmesi({ tel, etiket = 'Ara', goster, ikon, className, style, ariaLabel, durdur = true, children }: Props) {
  const [acik, setAcik] = useState(false);
  const metin = acik ? (goster ? goster(tel) : tel) : etiket;
  return (
    <a
      href={telBaglantisi(tel)}
      className={className}
      style={style}
      aria-label={ariaLabel || `${etiket} — telefonla ara`}
      onClick={e => { if (durdur) e.stopPropagation(); setAcik(true); }}
    >
      {children ? children(metin, acik) : <>{ikon}{metin}</>}
    </a>
  );
}
