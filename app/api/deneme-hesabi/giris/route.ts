// Deneme paneline şifresiz giriş: gönderilen bağlantının anahtarı doğrulanır, sunucuda
// tek kullanımlık giriş kodu üretilip oturum çerezleri yazılır, panele yönlendirilir.
// Form POST'u (GET değil): e-posta/mesaj uygulamalarının bağlantı önizlemesi oturum açmasın.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { demoIstemcisi, demoAnahtarGecerli, demoGirisKodu } from '@/lib/demo-sunucu';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const vurus = new Map<string, number[]>();
function hizSiniri(ip: string): boolean {
  const simdi = Date.now();
  const l = (vurus.get(ip) || []).filter(t => simdi - t < 10 * 60_000);
  l.push(simdi); vurus.set(ip, l);
  if (vurus.size > 5000) vurus.clear();
  return l.length > 20;
}

export async function POST(request: NextRequest) {
  const geri = (durum: string) => NextResponse.redirect(new URL(`/deneme-hesabi?durum=${durum}`, request.url), 303);
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'yerel';
  if (hizSiniri(ip)) return geri('cok');

  let k = '';
  try { k = String((await request.formData()).get('k') || ''); } catch { /* boş */ }

  const db = demoIstemcisi();
  if (!(await demoAnahtarGecerli(db, k))) return geri('gecersiz');

  try {
    const kod = await demoGirisKodu(db);
    const yanit = NextResponse.redirect(new URL('/panel', request.url), 303);
    const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get: (n: string) => request.cookies.get(n)?.value,
        set: (name: string, value: string, options: any) => { yanit.cookies.set({ name, value, ...options }); },
        remove: (name: string, options: any) => { yanit.cookies.set({ name, value: '', ...options }); },
      },
    });
    const { error } = await sb.auth.verifyOtp({ token_hash: kod, type: 'magiclink' });
    if (error) { console.error('deneme girişi:', error.message); return geri('hata'); }
    return yanit;
  } catch (e: any) {
    console.error('deneme girişi:', e?.message);
    return geri('hata');
  }
}
