'use client';

// Ozvelo sohbet balonu (site sahibinin kendi destek aracı). Yönetim ekranlarında,
// gömülü randevu modülünde ve kart önizlemesinde yüklenmez.
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const GIZLI = ['/admin', '/panel', '/embed', '/giris', '/hesap-aktivasyon', '/sifre-yenile'];

export default function SohbetBalonu() {
  const yol = usePathname() || '/';
  if (GIZLI.some(p => yol === p || yol.startsWith(p + '/'))) return null;
  return <Script src="https://ozvelo.com/widget.js?k=6260b3249dec6f9aee5669ea" strategy="lazyOnload" />;
}
