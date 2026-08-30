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

    // 2) Girdi — /pro sayfası işletme belirtmeden çağırır; o durumda
    //    kullanıcının ilk onaylı işletmesi kullanılır.
    let { entity_type, entity_id } = await request.json().catch(() => ({}));
    const admin = adminClient();

    if (!entity_type || !entity_id) {
      const { data: first } = await (admin as any)
        .from('claim_requests')
        .select('entity_type,entity_id')
        .eq('email', email)
        .eq('status', 'approved')
        .not('entity_id', 'is', null)
        .neq('entity_id', 'new')
        .limit(1)
        .maybeSingle();
      if (!first) {
        return NextResponse.json(
          { error: 'no_claim', message: 'Önce işletmenizi sahiplenmeniz gerekiyor.' }, { status: 403 });
      }
      entity_type = first.entity_type;
      entity_id = first.entity_id;
    }

    if (!VALID.includes(entity_type) || !entity_id) {
      return NextResponse.json({ error: 'Geçersiz işletme.' }, { status: 400 });
    }

    // 3) Sahiplik — bu işletme için onaylı claim var mı?
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

    // 4) İşletme adı (açıklama için) + zaten Pro ise ikinci abonelik açma
    const { data: ent } = await (admin as any)
      .from(ENTITY_TABLE[entity_type]).select('name,ad,soyad,premium').eq('id', entity_id).maybeSingle();
    if (ent?.premium) {
      return NextResponse.json(
        { error: 'already_pro', message: 'Bu işletme zaten Pro üye. Aboneliği panelden yönetebilirsiniz.' }, { status: 409 });
    }
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
    const msg: string = e?.message || String(e);
    console.error('stripe/checkout error:', msg);

    // Tek bir genel mesaj sebebi gizliyordu; en sık kurulum hataları ayrıştırılır.
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Ödeme yapılandırması eksik: STRIPE_SECRET_KEY tanımlı değil.' }, { status: 500 });
    }
    if (/no such product|no such price/i.test(msg)) {
      // Tipik sebep: ürün test modunda, anahtar canlı modda (veya tersi).
      return NextResponse.json(
        { error: 'Stripe ürünü bulunamadı — API anahtarı ile ürün farklı modda (test/canlı) olabilir. Stripe panelinde modu kontrol edin.' },
        { status: 500 });
    }
    if (/api key|authentication|invalid.*key/i.test(msg)) {
      return NextResponse.json(
        { error: 'Stripe anahtarı geçersiz. STRIPE_SECRET_KEY değerini kontrol edin.' }, { status: 500 });
    }
    if (msg.includes('Pro abonelik fiyatı bulunamadı')) {
      return NextResponse.json(
        { error: 'Üründe aktif fiyat yok. Stripe panelinde Hekimhane-Pro ürününe varsayılan fiyat ekleyin.' }, { status: 500 });
    }
    return NextResponse.json({ error: `Ödeme başlatılamadı: ${msg}` }, { status: 500 });
  }
}
