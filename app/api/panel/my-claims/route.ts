import { dogrulanmisOturum } from '@/lib/panel-oturum';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Her istekte taze — silinen/eklenen başvurular anında yansısın (cache bayat kalmasın)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Service role — RLS'yi bypass eder (yalnızca server-side)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Giriş yapmış kullanıcının kendi sahiplenme taleplerini döndürür.
 * E-postayı SESSION'dan alır (istemciden gelen parametreye güvenmez) ve
 * service-role ile okur — böylece claim_requests üzerindeki RLS'e takılmaz.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await dogrulanmisOturum(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const admin = adminClient();
    const { data, error } = await (admin as any)
      .from('claim_requests')
      .select('*')
      .eq('email', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('my-claims error:', error.message);
      return NextResponse.json({ error: 'Talepler alınamadı' }, { status: 500 });
    }
    return NextResponse.json({ claims: data || [] });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
