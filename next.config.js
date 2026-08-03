/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        // /embed hariç tüm rotalar — çerçevelenmeye kapalı
        source: '/:path((?!embed).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Randevu embed'i — işletmeler kendi sitelerine gömebilsin diye
        // X-Frame-Options göndermez; CSP frame-ancestors ile her yerde çerçevelenebilir.
        source: '/embed/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Diş hekimleri klinikler tablosunda type='Diş Hekimi' olarak duruyor.
      // Kendi temiz adresiyle sunulur (SEO + menüde doğru aktif vurgu).
      { source: '/dis-hekimleri', destination: '/klinikler?tip=Di%C5%9F%20Hekimi' },
    ];
  },
  async redirects() {
    return [
      {
        source: '/www',
        destination: 'https://hekimhane.com.tr',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
