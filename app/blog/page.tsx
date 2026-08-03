import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import BlogInteractive from './BlogInteractive';
import { HASTALIKLAR, KATEGORILER } from '@/lib/hastaliklar-data';
import { BLOG_YAZILARI } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog | Hekimhane — Diş Sağlığı Yazıları',
  description: 'Diş sağlığı, tedaviler ve hasta rehberleri. Uzman gözünden ağız ve diş sağlığı içerikleri.',
};

// Statik diş odaklı yazılar — DB'den gelen yazılarla birleştirilir
const STATIK_POSTS = BLOG_YAZILARI.map((y, i) => ({
  id: String(i + 1), slug: y.slug, title: y.title, summary: y.summary,
  category: y.category, author: y.author, created_at: y.created_at,
  cover_image: y.cover_image, views: y.views,
}));

// Panel/admin üzerinden yayınlanan yazılar + statik yazılar birlikte listelenir.
// (Eskiden DB doluysa statikler gizleniyordu; ilk onaylanan makalede tüm
//  statik içerik kaybolmasın diye birleştirip slug'a göre tekilleştiriyoruz.)
async function getPosts() {
  // Next Data Cache sabit Supabase sorgusunu süresiz cache'ler → yeni onaylanan
  // makale listede görünmez. noStore() olmadan yayınlar bayat kalır.
  noStore();
  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('id,title,slug,summary,category,author,cover_image,views,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(60);

    const dbPosts = data || [];
    const dbSlugs = new Set(dbPosts.map((p: any) => p.slug));
    return [...dbPosts, ...STATIK_POSTS.filter(p => !dbSlugs.has(p.slug))]
      .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)));
  } catch {
    return STATIK_POSTS;
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
  // Şimdilik yalnızca diş/ağız hastalıkları gösterilir; diğerleri gizli
  return HASTALIKLAR.filter(h => h.kategoriSlug === 'dis-sagligi').map(h => ({
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
            Diş sağlığı, tedaviler ve hasta rehberleri.
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
