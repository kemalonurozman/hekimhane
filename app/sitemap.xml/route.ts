import { SITEMAP_SECTIONS, renderSitemapIndex } from '@/lib/sitemap-data';

export const revalidate = 43200; // 12 saat

// Kök sitemap index — arama motorları buradan bölüm alt-haritalarına ulaşır (ağaç kökü)
export async function GET() {
  const xml = renderSitemapIndex(SITEMAP_SECTIONS);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=43200, stale-while-revalidate=86400',
    },
  });
}
