'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

/** Global footer'ı yalnızca genel sayfalarda gösterir.
 *  Panel ve admin kendi düzenlerini (sabit sidebar) kullandığı için
 *  pazarlama footer'ı orada gizlenir — sidebar'ın altına girmesin. */
export default function SiteFooter() {
  const pathname = usePathname() || '';
  if (pathname.startsWith('/panel') || pathname.startsWith('/admin')) return null;
  return <Footer />;
}
