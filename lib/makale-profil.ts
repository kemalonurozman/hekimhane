// ─────────────────────────────────────────────────────────────────
//  Profil sayfası "Makalelerimiz" — işletmenin yayındaki makaleleri
//  (sunucu). Yalnız herkese açık alanlar döner; yazar e-postası, editör
//  notu vb. istemci bileşenine gitmez. Hata → boş liste (sayfa bozulmaz).
// ─────────────────────────────────────────────────────────────────
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';

export interface ProfilMakale {
  slug: string;
  title: string;
  summary: string;
  category: string | null;
  cover_image: string | null;
  created_at: string;
  okuma_dk: number | null;
}

export async function profilMakaleleri(entityId: string | null | undefined, limit = 12): Promise<ProfilMakale[]> {
  noStore();   // yeni onaylanan yazı hemen görünsün (Next Data Cache tuzağı)
  if (!entityId) return [];
  try {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('slug,title,summary,category,cover_image,created_at,okuma_dk,status')
      .eq('entity_id', String(entityId))
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as any[])
      .filter(p => p.slug && (!p.status || p.status === 'published'))
      .map(p => ({
        slug: p.slug, title: p.title || '', summary: p.summary || '',
        category: p.category || null, cover_image: p.cover_image || null,
        created_at: p.created_at, okuma_dk: p.okuma_dk || null,
      }));
  } catch {
    return [];
  }
}
