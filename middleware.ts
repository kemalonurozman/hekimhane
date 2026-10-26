import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Detay sayfalarındaki tr() ile aynı il/ilçe biçimi.
// "İ".toLowerCase() görünmez birleşik nokta (U+0307) bırakır → önce silinir.
const ilceParca = (s: string) => s.toLowerCase().replace(/̇/g, '')
  .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
  .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c').replace(/\s+/g, '-');

// /klinikler|hastaneler/<il>/<ilce>[/<slug>] adreslerinde il/ilçe kanonik değilse
// (ör. "i̇stanbul", "%c4%b0stanbul", "Kadıköy") tek adımda temiz adrese 301.
function ilIlceYonlendir(request: NextRequest): NextResponse | null {
  const parts = request.nextUrl.pathname.split('/');
  // ['', 'klinikler', il, ilce] veya ['', 'klinikler', il, ilce, slug]
  if (parts.length < 4 || parts.length > 5) return null;
  if (parts[1] !== 'klinikler' && parts[1] !== 'hastaneler') return null;
  let degisti = false;
  for (const i of [2, 3]) {
    let ham: string;
    try { ham = decodeURIComponent(parts[i]); } catch { return null; }
    const temiz = ilceParca(ham);
    if (!temiz) return null;
    if (temiz !== ham) degisti = true;
    parts[i] = encodeURIComponent(temiz);
  }
  if (!degisti) return null;
  const url = request.nextUrl.clone();
  url.pathname = parts.join('/');
  return NextResponse.redirect(url, 301);
}

export async function middleware(request: NextRequest) {
  const yon = ilIlceYonlendir(request);
  if (yon) return yon;

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

  // Session'ı yenile ve al.
  // getSession() burada BİLEREK kalıyor: yalnız süresi dolan çerezi yeniler ve
  // /panel, /admin sayfalarında girişe yönlendirir — kimlik/yetki kararı vermez.
  // Sahte çerez bu kapıyı geçse de yalnız boş sayfa kabuğu görür; veri veren her
  // sunucu rotası kimliği getUser() ile doğrular (lib/panel-oturum.ts →
  // dogrulanmisOturum, lib/admin-auth.ts → isAdminRequest). Buradaki session'dan
  // e-posta/kimlik okuyup yetki vermeyin.
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
