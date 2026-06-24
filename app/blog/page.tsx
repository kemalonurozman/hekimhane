import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BlogInteractive from './BlogInteractive';
import { HASTALIKLAR, KATEGORILER } from '@/lib/hastaliklar-data';

export const metadata: Metadata = {
  title: 'Blog | Hekimhane',
  description: 'Sağlık haberleri, uzman yazıları ve hasta rehberleri. Hekimhane Blog.',
};

// Fallback placeholder yazılar (veritabanı boşsa gösterilir)
const PLACEHOLDER_POSTS = [
  {
    id: '1', slug: '#', title: 'Doktor Seçerken Dikkat Edilmesi Gereken 7 Önemli Kriter',
    summary: 'Doğru doktoru bulmak, sağlığınızı korumanın ilk adımıdır. Uzman seçiminde göz önünde bulundurmanız gereken kriterleri derledik.',
    category: 'Hasta Rehberi', author: 'Hekimhane Editör',
    created_at: '2024-11-15', cover_image: null, views: 1240,
  },
  {
    id: '2', slug: '#', title: 'SGK ile Özel Hastaneye Nasıl Gidilir?',
    summary: 'SGK katkısıyla özel hastanelerden yararlanma süreci, gerekli belgeler ve bilmeniz gereken tüm detaylar bu yazıda.',
    category: 'Hasta Rehberi', author: 'Hekimhane Editör',
    created_at: '2024-11-10', cover_image: null, views: 3180,
  },
  {
    id: '3', slug: '#', title: 'Randevu Almadan Önce Yapmanız Gerekenler',
    summary: 'Muayene sürecinizi kolaylaştırmak için randevu öncesi hazırlık listesi.',
    category: 'Hasta Rehberi', author: 'Hekimhane Editör',
    created_at: '2024-11-05', cover_image: null, views: 870,
  },
  {
    id: '4', slug: '#', title: 'Kış Aylarında Bağışıklık Sistemini Güçlendirmenin 10 Yolu',
    summary: 'Mevsim geçişlerinde hastalıklara karşı korunmak için beslenme, uyku ve egzersiz önerileri.',
    category: 'Sağlıklı Yaşam', author: 'Hekimhane Editör',
    created_at: '2024-10-28', cover_image: null, views: 2100,
  },
  {
    id: '5', slug: '#', title: 'Çocuklarda Aşı Takvimi: Hangi Aşı Ne Zaman Yapılır?',
    summary: 'Türkiye\'de uygulanan zorunlu ve isteğe bağlı aşılar, takvim ve sık sorulan sorular.',
    category: 'Çocuk Sağlığı', author: 'Hekimhane Editör',
    created_at: '2024-10-20', cover_image: null, views: 4230,
  },
  {
    id: '6', slug: '#', title: 'Stres ve Anksiyete ile Başa Çıkma Yöntemleri',
    summary: 'Günlük hayatta stres yönetimi için uzmanların önerdiği pratik teknikler ve farkındalık egzersizleri.',
    category: 'Ruh Sağlığı', author: 'Hekimhane Editör',
    created_at: '2024-10-12', cover_image: null, views: 1560,
  },
];

async function getPosts() {
  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('id,title,slug,summary,category,author,cover_image,views,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(30);
    return (data && data.length > 0) ? data : PLACEHOLDER_POSTS;
  } catch {
    return PLACEHOLDER_POSTS;
  }
}

// Hastalık verisini hafiflet — sadece kart için gerekli alanlar
export type HastalıkOzet = {
  slug: string;
  ad: string;
  kategoriSlug: string;
  kategoriAd: string;
  ozet: string;
  ciddiyeti: 'düşük' | 'orta' | 'yüksek';
  uzmanlik: string;
  gorulmeOrani: string;
};

function getHastalikOzetler(): HastalıkOzet[] {
  const katMap = Object.fromEntries(KATEGORILER.map(k => [k.slug, k.ad]));
  return HASTALIKLAR.map(h => ({
    slug: h.slug,
    ad: h.ad,
    kategoriSlug: h.kategoriSlug,
    kategoriAd: katMap[h.kategoriSlug] || h.kategoriSlug,
    ozet: h.ozet,
    ciddiyeti: h.ciddiyeti,
    uzmanlik: h.uzmanlik,
    gorulmeOrani: h.gorulmeOrani,
  }));
}

export default async function BlogPage() {
  const posts = await getPosts();
  const hastaliklar = getHastalikOzetler();

  return (
    <div style={{ paddingTop: 66, background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero — Server Component'te kalabilir, event handler yok */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)', padding: '48px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.65)' }}>Ana Sayfa</Link>
            <span style={{ fontSize: 8 }}>›</span>
            <span style={{ color: 'rgba(255,255,255,.9)' }}>Blog</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 10 }}>
            Hekimhane Blog
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 500 }}>
            Sağlık haberleri, uzman yazıları ve hasta rehberleri.
          </p>
        </div>
      </div>

      {/* Etkileşimli kısım → Client Component */}
      <div className="container" style={{ padding: '40px 32px 56px' }}>
        <BlogInteractive posts={posts} hastaliklar={hastaliklar} />
      </div>
    </div>
  );
}
