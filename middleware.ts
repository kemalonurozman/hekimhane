import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // ── Admin coğrafi güvenlik: yalnızca Türkiye + Çekya ──
  // Admin paneli ve admin API'lerine sadece TR/CZ'den erişilebilir.
  // Ülke bilgisi Vercel edge'inden gelir; localhost/dev'de boştur → engellenmez.
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdminArea) {
    const country =
      request.headers.get('x-vercel-ip-country') ||
      (request as unknown as { geo?: { country?: string } }).geo?.country ||
      '';
    const ALLOWED = ['TR', 'CZ'];
    if (country && !ALLOWED.includes(country.toUpperCase())) {
      return new NextResponse(
        'Erişim reddedildi. Yönetim paneline yalnızca Türkiye ve Çekya\'dan erişilebilir.',
        { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      );
    }
  }

  // Session'ı yenile ve al
  const { data: { session } } = await supabase.auth.getSession();

  // /panel altındaki sayfalar için auth zorunlu
  if (pathname.startsWith('/panel')) {
    if (!session) {
      const loginUrl = new URL('/giris', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // /admin altındaki sayfalar için auth zorunlu (/admin/giris hariç)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/giris')) {
    if (!session) {
      const loginUrl = new URL('/admin/giris', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Auth gerektiren rotalar + tüm sayfalarda session yenile
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
