import type { Metadata } from 'next';
import YakinEczaneClient from './YakinEczaneClient';

export const metadata: Metadata = {
  title: 'Yakınımdaki Eczaneler — Konumunuza En Yakın Eczaneyi Bulun',
  description:
    'Konumunuza en yakın eczaneleri anında bulun. Adres, telefon ve yol tarifi ile Türkiye genelinde 8.700+ eczane.',
  alternates: { canonical: 'https://hekimhane.com.tr/yakin-eczane' },
  openGraph: {
    title: 'Yakınımdaki Eczaneler | Hekimhane',
    description: 'Konumunuza en yakın eczaneleri anında bulun.',
    url: 'https://hekimhane.com.tr/yakin-eczane',
  },
};

export default function YakinEczanePage() {
  return <YakinEczaneClient />;
}
