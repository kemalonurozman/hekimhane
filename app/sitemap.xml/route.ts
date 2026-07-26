import { renderSitemapIndex, SITEMAP_SECTIONS } from '@/lib/sitemap-data';

export const revalidate = 3600;

export async function GET() {
  return new Response(renderSitemapIndex(SITEMAP_SECTIONS), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
