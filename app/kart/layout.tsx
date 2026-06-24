// /kart/* sayfaları için minimal layout — Navbar ve Footer olmadan
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'HekimKart', template: '%s | Hekimhane' },
};

export default function KartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
