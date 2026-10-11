import type { Metadata } from 'next';

// Sayfa istemci bileşeni olduğundan başlık burada tanımlanır. Giriş sayfası dizine eklenmez.
export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'Hekimhane hesabınıza giriş yapın: doktor ve işletme paneli ya da hasta girişi.',
  robots: { index: false, follow: true },
};

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
