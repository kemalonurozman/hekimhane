import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function captureEmail(email: string, isim?: string | null) {
  try {
    await (adminClient() as any).from('email_aboneleri').upsert(
      { email: email.trim().toLowerCase(), isim: isim || null, tip: 'hasta', kaynak: 'giris', aktif: true },
      { onConflict: 'email,tip,entity_id', ignoreDuplicates: false }
    );
  } catch { /* sessizce geç */ }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get('code');
  const tokenHash  = searchParams.get('token_hash');
  const type       = searchParams.get('type');       // 'magiclink' | 'email' | 'recovery' vb.
  const redirect   = searchParams.get('redirect') ?? '/panel';
  const next       = searchParams.get('next');        // Supabase'in kendi next parametresi

  const redirectTarget = next || (redirect.startsWith('/') ? redirect : '/panel');
  const redirectUrl    = `${origin}${redirectTarget}`;
  const response       = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) { response.cookies.set({ name, value, ...options }); },
        remove(name, options) { response.cookies.set({ name, value: '', ...options }); },
      },
    }
  );

  // 1. OAuth PKCE akışı (Google vb.)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const u = data?.session?.user;
      if (u?.email) await captureEmail(u.email, u.user_metadata?.full_name ?? u.user_metadata?.name);
      return response;
    }
  }

  // 2. Magic link / Email OTP akışı
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    });
    if (!error) {
      const u = data?.session?.user;
      if (u?.email) await captureEmail(u.email, u.user_metadata?.full_name ?? u.user_metadata?.name);
      return response;
    }
  }

  // Başarısız → hata sayfasına yönlendir
  return NextResponse.redirect(`${origin}/giris?error=auth`);
}
