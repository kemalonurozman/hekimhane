// Admin rotalarını dinamik yapar → CDN tam-rota cache'i devre dışı kalır,
// böylece middleware (coğrafi TR/CZ kısıtı) her istekte çalışır.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
