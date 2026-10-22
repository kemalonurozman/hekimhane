import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/panel/', '/admin/', '/api/'],
      },
    ],
    sitemap: 'https://www.hekimhane.com.tr/sitemap.xml',
    // host: Google desteklemiyor (Search Console "Rule ignored" uyarısı) → kaldırıldı.
  };
}
