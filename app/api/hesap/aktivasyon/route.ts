import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

// Token'ı doğrula (kullanılmamış + süresi geçmemiş) — GET tüketmez (mail önden-yüklemeye dayanıklı)
async function loadToken(admin: any, token: string) {
  if (!token) return { error: 'Geçersiz bağlantı.' };
  const { data, error } = await admin.from('account_activations').select('*').eq('token', token).maybeSingle();
  if (error || !data) return { error: 'Bağlantı bulunamadı.' };
  if (data.used_at) return { error: 'Bu bağlantı zaten kullanılmış. Giriş sayfasından devam edin.' };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { error: 'Bağlantının süresi doldu.' };
  return { data };
}

// GET ?token=... → e-postayı döndür (formu ön-doldurmak için)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || '';
    const admin = adminClient();
    const r = await loadToken(admin, token);
    if (r.error) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, email: r.data.email, entity_name: r.data.entity_name || null });
  } catch {
    return NextResponse.json({ ok: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}

// POST { token, password } → şifreyi belirle, token'ı tüket
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!password || String(password).length < 6) {
      return NextResponse.json({ ok: false, error: 'Şifre en az 6 karakter olmalı.' }, { status: 400 });
    }
    const admin = adminClient();
    const r = await loadToken(admin, token);
    if (r.error) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });

    const email = r.data.email as string;
    let userId = r.data.user_id as string | null;

    // user_id yoksa (eski kayıt) e-posta ile bul
    if (!userId) {
      try {
        const { data: gl } = await (admin.auth.admin as any).generateLink({ type: 'recovery', email });
        userId = gl?.user?.id ?? null;
      } catch { /* geç */ }
    }
    if (!userId) return NextResponse.json({ ok: false, error: 'Hesap bulunamadı.' }, { status: 400 });

    // Şifreyi belirle
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true } as any);
    if (updErr) {
      console.error('aktivasyon updateUser:', updErr.message);
      return NextResponse.json({ ok: false, error: 'Şifre belirlenemedi.' }, { status: 500 });
    }

    // Token'ı tüket
    await admin.from('account_activations').update({ used_at: new Date().toISOString() }).eq('token', token);

    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json({ ok: false, error: 'Geçersiz istek.' }, { status: 400 });
  }
}
