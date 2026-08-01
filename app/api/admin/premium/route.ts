import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
function sessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } },
  );
}

export async function GET(request: NextRequest) {
  try {
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const admin = adminClient();

    // Her varlık türünde premium=true olanları çek
    const [klinik, hastane, doktor, eczane] = await Promise.all([
      admin.from('klinikler').select('id,name,il,ilce,slug,type,rat,rev,claimed,tel').eq('premium', true),
      admin.from('hastaneler').select('id,name,il,ilce,slug,type,rat,rev,claimed,tel').eq('premium', true),
      admin.from('doktorlar').select('id,ad,soyad,unvan,spec,il,ilce,slug,rat,rev,verified,tel').eq('premium', true),
      admin.from('eczaneler').select('id,name,il,ilce,slug,rat,rev,claimed,tel').eq('premium', true),
    ]);

    const map = (rows: any[] | null, type: string) => (rows || []).map((r) => ({
      type,
      id: r.id,
      name: type === 'doktor' ? [r.unvan, r.ad, r.soyad].filter(Boolean).join(' ') : r.name,
      il: r.il || '', ilce: r.ilce || '',
      slug: r.slug || null,
      spec: r.spec || r.type || null,
      rat: r.rat || 0, rev: r.rev || 0,
      claimed: r.claimed ?? r.verified ?? false,
      tel: r.tel || null,
    }));

    const items = [
      ...map(klinik.data, 'klinik'),
      ...map(hastane.data, 'hastane'),
      ...map(doktor.data, 'doktor'),
      ...map(eczane.data, 'eczane'),
    ];

    // Stripe abonelik bilgisi (tablo varsa) — entity_id ile eşle
    let subsByEntity: Record<string, any> = {};
    try {
      const { data: subs } = await (admin as any)
        .from('premium_subscriptions')
        .select('entity_type,entity_id,status,current_period_end,stripe_customer_id');
      if (subs) subs.forEach((s: any) => { subsByEntity[`${s.entity_type}:${s.entity_id}`] = s; });
    } catch { /* tablo yoksa geç */ }

    const withSub = items.map((it) => ({ ...it, sub: subsByEntity[`${it.type}:${it.id}`] || null }));

    const counts = {
      klinik: klinik.data?.length || 0,
      hastane: hastane.data?.length || 0,
      doktor: doktor.data?.length || 0,
      eczane: eczane.data?.length || 0,
      toplam: items.length,
    };

    return NextResponse.json({ items: withSub, counts });
  } catch (e) {
    console.error('admin/premium error:', e);
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
