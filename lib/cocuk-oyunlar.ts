// Çocuklar için diş sağlığı oyunları — tek kaynak.
// /cocuk-dis-sagligi/oyunlar listesi, oyun sayfaları ve sitemap buradan okur.
// Yeni oyun: buraya ekle + app/cocuk-dis-sagligi/oyunlar/<slug>/page.tsx yaz.

export interface CocukOyun {
  slug: string;
  ad: string;
  kisa: string;
  yas: string;
  sure: string;
}

export const COCUK_OYUNLAR: CocukOyun[] = [
  {
    slug: 'dis-fircalama',
    ad: '2 Dakika Fırçala',
    kisa: 'Ağız dört bölgeye ayrılır, her bölgeye 30 saniye. Parlayan bölgedeki dişleri fırçala, plakları temizle, gerçek fırçalama süresini oynayarak öğren.',
    yas: '3–9 yaş',
    sure: '2 dakika',
  },
];
