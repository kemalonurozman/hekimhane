import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hekimhane.com.tr'),
  title: {
    default: 'Hekimhane — Türkiye Sağlık Rehberi',
    template: '%s | Hekimhane',
  },
  description: 'Türkiye\'nin en kapsamlı sağlık rehberi. Klinik, hastane, doktor ve eczane bilgileri. İstanbul, Ankara, İzmir ve tüm Türkiye\'de doktor ara.',
  keywords: ['doktor ara', 'klinik bul', 'hastane', 'eczane', 'sağlık rehberi', 'türkiye doktor', 'randevu'],
  authors: [{ name: 'Hekimhane', url: 'https://hekimhane.com.tr' }],
  creator: 'Hekimhane',
  publisher: 'Hekimhane',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Hekimhane',
    url: 'https://hekimhane.com.tr',
    title: 'Hekimhane — Türkiye Sağlık Rehberi',
    description: 'Türkiye\'nin en kapsamlı sağlık rehberi. 1.044+ klinik, 1.825+ hastane, 1.552+ doktor ve 8.789+ eczane.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Hekimhane — Türkiye Sağlık Rehberi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hekimhane — Türkiye Sağlık Rehberi',
    description: 'Türkiye\'nin en kapsamlı sağlık rehberi.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://hekimhane.com.tr',
  },
  verification: {
    google: '',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
