import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getStripe, getProPriceId, ENTITY_TABLE } from '@/lib/stripe';

export const runtime = 'nodejs';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';
const VALID = ['klinik', 'hastane', 'doktor', 'eczane'];

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}
function sessionClient(request: NextRequest) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => request.cookies.get(n)?.value, set() {}, remove() {} } });
}

export async function POST(request: NextRequest) {
  try {
    // 1) Oturum
    const sess = sessionClient(request);
    const { data: { session } } = await sess.auth.getSession();
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });

    // 2) Girdi
    const { entity_type, entity_id } = await request.json();
    if (!VALID.includes(entity_type) || !entity_id) {
      return NextResponse.json({ error: 'Geçersiz işletme.' }, { status: 400 });
    }

    // 3) Sahiplik — bu işletme için onaylı claim var mı?
    const admin = adminClient();
    const { data: claim } = await (admin as any)
      .from('claim_requests')
      .select('id')
      .eq('email', email)
      .eq('entity_type', entity_type)
      .eq('entity_id', String(entity_id))
      .eq('status', 'approved')
      .maybeSingle();
    if (!claim) {
      return NextResponse.json({ error: 'Bu işletmeyi yönetme yetkiniz yok (onaylı sahiplik gerekli).' }, { status: 403 });
    }

    // 4) İşletme adı (açıklama için)
    const { data: ent } = await (admin as any)
      .from(ENTITY_TABLE[entity_type]).select('name,ad,soyad').eq('id', entity_id).maybeSingle();
    const entName = ent?.name || [ent?.ad, ent?.soyad].filter(Boolean).join(' ') || 'İşletme';

    // 5) Checkout session (Hekimhane-Pro — aylık abonelik)
    const stripe = getStripe();
    const priceId = await getProPriceId();
    const cs = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: `${entity_type}:${entity_id}`,
      metadata: { entity_type, entity_id: String(entity_id), entity_name: entName, user_email: email },
      subscription_data: { metadata: { entity_type, entity_id: String(entity_id) } },
      allow_promotion_codes: true,
      locale: 'tr',
      success_url: `${SITE}/panel?premium=success`,
      cancel_url: `${SITE}/panel?premium=cancel`,
    });

    return NextResponse.json({ url: cs.url });
  } catch (e: any) {
    console.error('stripe/checkout error:', e?.message || e);
    return NextResponse.json({ error: 'Ödeme başlatılamadı.' }, { status: 500 });
  }
}
