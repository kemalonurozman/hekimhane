import type { Metadata } from 'next';
import FircaOyunu from '@/components/oyun/FircaOyunu';

// Başka sitelere iframe ile gömülen sürüm. Üst menü / alt bilgi /embed'de çizilmez
// (Navbar, SiteFooter, CompareBar). Çerçevelenme izni next.config.js → /embed/:path*.
// Logo + hekimhane.com.tr bağlantısı oyunun içinde (FircaOyunu gomulu): gömen site değiştiremez.

export const metadata: Metadata = {
  title: '2 Dakika Fırçala',
  description: 'Çocuklar için ücretsiz diş fırçalama oyunu — Hekimhane.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/cocuk-dis-sagligi/oyunlar/dis-fircalama' },
  robots: { index: false, follow: true },
};

export default function GomuluFircaOyunu() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <FircaOyunu gomulu />
    </div>
  );
}
