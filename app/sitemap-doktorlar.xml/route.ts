import { buildSection, renderUrlset } from '@/lib/sitemap-data';

export const revalidate = 3600;

export async function GET() {
  const urls = await buildSection('doktorlar');
  return new Response(renderUrlset(urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
