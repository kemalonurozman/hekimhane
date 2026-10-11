import type { Metadata } from 'next';

// Sayfa istemci bileşeni olduğundan başlık/açıklama burada tanımlanır.
export const metadata: Metadata = {
  title: 'İşletmenizi Ekleyin',
  description: 'Diş kliniğinizi, muayenehanenizi, hastanenizi veya eczanenizi Hekimhane\'ye ücretsiz ekleyin. Üç kısa adımda başvurun.',
  alternates: { canonical: 'https://www.hekimhane.com.tr/katil' },
};

export default function KatilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
