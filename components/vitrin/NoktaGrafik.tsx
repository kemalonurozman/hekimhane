// Noktalı (yarım ton) siluet — özellik kartlarının köşesindeki dekoratif grafik.
// Marka ikon setindeki bir ikonu maske olarak kullanır; maskenin içi düzenli nokta
// deseniyle dolar. Görsel dosyası yok: tümü CSS + veri URI'si. Hook yok (server/client ortak).
import { HK_IKONLAR, type HkIkonAdi } from '@/lib/hk-icons';

function maske(ad: HkIkonAdi): string {
  const ic = HK_IKONLAR[ad];
  const parcalar = ic.parts.map(p => {
    const a = Object.entries(p.a).map(([k, v]) => `${k}='${v}'`).join(' ');
    // Gövde parçaları dolu, diğerleri kalın çizgi → uzaktan okunur bir siluet
    return p.dot || p.body
      ? `<${p.t} ${a} fill='black' stroke='black' stroke-width='1.2'/>`
      : `<${p.t} ${a} fill='none' stroke='black' stroke-width='2.2'/>`;
  }).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke-linecap='round' stroke-linejoin='round'>${parcalar}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export default function NoktaGrafik({ ikon, size = 220, koyu = false, renk, className, style }: {
  ikon: HkIkonAdi; size?: number; koyu?: boolean; /** Nokta rengi (varsayılan: açıkta gri, koyuda beyaz) */ renk?: string; className?: string; style?: React.CSSProperties;
}) {
  const m = maske(ikon);
  return (
    <span aria-hidden="true" className={className ? `vt-nokta ${className}` : 'vt-nokta'} style={{
      width: size, height: size,
      backgroundImage: `radial-gradient(circle, ${renk || (koyu ? 'rgba(255,255,255,.34)' : '#B9C2D0')} 1.15px, transparent 1.5px)`,
      WebkitMaskImage: m, maskImage: m, ...style,
    }} />
  );
}
