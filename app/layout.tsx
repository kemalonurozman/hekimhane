import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import './styles/hk-components.css';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import CompareBar from '@/components/CompareBar';
import CerezOnay from '@/components/CerezOnay';
import SohbetBalonu from '@/components/SohbetBalonu';

// Tasarım sistemi v3: gövde Inter, başlık Plus Jakarta Sans. latin-ext: Türkçe harfler (İ ş ğ ı) önden yüklenir.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
  weight: ['600', '700', '800'],
  display: 'swap',
});

// Yazı işareti (logo): Manrope Bold — marka kimliği v1. Yalnız logoda kullanılır.
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  weight: ['500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hekimhane.com.tr'),
  title: {
    default: 'Hekimhane — Türkiye Sağlık Rehberi',
    template: '%s | Hekimhane',
  },
  description: 'Türkiye\'nin en kapsamlı sağlık rehberi. Klinik, hastane, doktor ve eczane bilgileri. İstanbul, Ankara, İzmir ve tüm Türkiye\'de doktor ara.',
  keywords: ['doktor ara', 'klinik bul', 'hastane', 'eczane', 'sağlık rehberi', 'türkiye doktor', 'randevu'],
  authors: [{ name: 'Hekimhane', url: 'https://www.hekimhane.com.tr' }],
  creator: 'Hekimhane',
  publisher: 'Hekimhane',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Hekimhane',
    url: 'https://www.hekimhane.com.tr',
    title: 'Hekimhane — Türkiye Sağlık Rehberi',
    description: 'Türkiye\'nin en kapsamlı sağlık rehberi. 1.044+ klinik, 1.825+ hastane, 1.552+ doktor ve 8.789+ eczane.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hekimhane — Türkiye Sağlık Rehberi',
    description: 'Türkiye\'nin en kapsamlı sağlık rehberi.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // canonical burada YOK: layout'taki canonical, kendi canonical'ı olmayan her sayfaya
  // miras kalıp onu ana sayfanın kopyası gösteriyordu. Her sayfa kendi canonical'ını verir.
  alternates: {
    types: {
      'application/rss+xml': [{ url: 'https://www.hekimhane.com.tr/rss.xml', title: 'Hekimhane Blog — Ağız ve Diş Sağlığı' }],
    },
  },
  verification: {
    google: 'KQGBOe-frsX4hxu3VWssHlNWwPoF6dNhgHnVZ8Jnl4o',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <SiteFooter />
        <CompareBar />
        {/* Ziyaret istatistikleri yalnızca onay verilirse yüklenir (CerezOnay içinde) */}
        <CerezOnay />
        <SohbetBalonu />
      </body>
    </html>
  );
}
