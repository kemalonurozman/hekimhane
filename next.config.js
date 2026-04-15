/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Türkçe karakter desteği için
  i18n: {
    locales: ['tr'],
    defaultLocale: 'tr',
  },
};

module.exports = nextConfig;
