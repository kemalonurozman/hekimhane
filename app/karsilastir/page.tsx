import type { Metadata } from 'next';
import KarsilastirClient from './KarsilastirClient';

export const metadata: Metadata = {
  title: 'Karşılaştır — Doktor, Klinik ve Hastane Kıyaslama',
  description: 'Seçtiğiniz doktor, klinik, hastane veya eczaneleri puan, ücret, konum ve uzmanlık açısından yan yana karşılaştırın.',
  alternates: { canonical: 'https://hekimhane.com.tr/karsilastir' },
  robots: { index: false, follow: true },
};

export default function KarsilastirPage() {
  return <KarsilastirClient />;
}
