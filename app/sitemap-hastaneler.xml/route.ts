import { buildSection, renderUrlset } from '@/lib/sitemap-data';

export const revalidate = 43200; // 12 saat

export async function GET() {
  const xml = renderUrlset(await buildSection('hastaneler'));
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=43200, stale-while-revalidate=86400',
    },
  });
}
