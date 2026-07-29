import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hekimhane — Türkiye Sağlık Rehberi',
    short_name: 'Hekimhane',
    description:
      'Türkiye genelindeki klinik, hastane, diş hekimi ve eczaneleri bul; yorumları oku, randevu al.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF8F2',
    theme_color: '#1B3A69',
    lang: 'tr',
    icons: [
      { src: '/web-app-manifest-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/web-app-manifest-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
