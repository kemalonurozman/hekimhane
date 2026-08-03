import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { BLOG_YAZILARI } from '@/lib/blog-data';
import MakaleYayinlaClient from './MakaleYayinlaClient';

/* Aylık ziyaretçi — analytics'ten gelen gerçek rakamla güncelleyin.
   Hero'da olduğu gibi gösterilir (ör. '45.000+'). */
const AYLIK_ZIYARETCI = '25.000+';

export const metadata: Metadata = {
  title: 'Hekimhane\'de Makale Yayınlayın — İş Ortağı İçeriği',
  description: 'Kliniğinizin makalesini Hekimhane\'de kalıcı olarak yayınlayın. Sağlık bilgisi arayan hastalara ulaşın, metin içi SEO bağlantısı alın. Tek paket, tek fiyat.',
  keywords: ['sponsorlu içerik', 'iş ortağı makalesi', 'sağlık blogu reklam', 'klinik tanıtım yazısı', 'backlink', 'diş kliniği reklamı'],
  alternates: { canonical: 'https://www.hekimhane.com.tr/makale-yayinla' },
  openGraph: {
    title: 'Hekimhane\'de Makale Yayınlayın',
    description: 'Her ay sağlık bilgisi arayan on binlerce hastaya ulaşın. Makaleniz sitede kalıcı olarak yer alır.',
    url: 'https://www.hekimhane.com.tr/makale-yayinla',
    type: 'website',
  },
};

async function getStats() {
  try {
    const [klinik, hekim] = await Promise.all([
      supabase.from('klinikler').select('id', { count: 'exact', head: true }),
      supabase.from('doktorlar').select('id', { count: 'exact', head: true }),
    ]);
    return { klinik: klinik.count || 0, hekim: hekim.count || 0 };
  } catch {
    // Supabase düşse bile sayfa render olsun — sayaçlar makul varsayılana düşer.
    return { klinik: 1000, hekim: 2500 };
  }
}

export default async function MakaleYayinlaPage() {
  const stats = await getStats();

  return (
    <MakaleYayinlaClient
      klinikSayisi={stats.klinik || 1000}
      hekimSayisi={stats.hekim || 2500}
      makaleSayisi={BLOG_YAZILARI.length}
      aylikZiyaretci={AYLIK_ZIYARETCI}
    />
  );
}
