import { BLOG_YAZILARI } from '@/lib/blog-data';

const BASE = 'https://www.hekimhane.com.tr';

function esc(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = [...BLOG_YAZILARI].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const lastBuild = posts[0]?.created_at ? new Date(posts[0].created_at).toUTCString() : new Date().toUTCString();

  const items = posts.map(p => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${p.slug}</guid>
      <description>${esc(p.summary)}</description>
      <category>${esc(p.category)}</category>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hekimhane Blog — Ağız ve Diş Sağlığı</title>
    <link>${BASE}/blog</link>
    <description>Türkiye'nin diş sağlığı rehberi Hekimhane'den güncel yazılar, tedavi rehberleri ve hasta bilgilendirmeleri.</description>
    <language>tr</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
