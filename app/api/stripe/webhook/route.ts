import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getStripe, ENTITY_TABLE } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } });
}

// entity premium bayrağını + abonelik kaydını güncelle
async function applyPremium(opts: {
  entity_type: string; entity_id: string; active: boolean;
  email?: string | null; customerId?: string | null; subId?: string | null;
  status?: string; periodEnd?: number | null;
}) {
  const { entity_type, entity_id, active } = opts;
  const table = ENTITY_TABLE[entity_type];
  if (!table || !entity_id) return;
  const admin = adminClient();

  // 1) Varlığın premium alanı
  await (admin as any).from(table).update({ premium: active }).eq('id', entity_id);

  // 2) Abonelik kaydı (tablo varsa)
  try {
    await (admin as any).from('premium_subscriptions').upsert({
      entity_type, entity_id: String(entity_id),
      email: opts.email ?? null,
      stripe_customer_id: opts.customerId ?? null,
      stripe_subscription_id: opts.subId ?? null,
      status: opts.status ?? (active ? 'active' : 'inactive'),
      current_period_end: opts.periodEnd ? new Date(opts.periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'entity_type,entity_id' });
  } catch (e: any) {
    console.error('premium_subscriptions upsert:', e?.message || e);
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = request.headers.get('stripe-signature');
  if (!secret || !sig) return NextResponse.json({ error: 'İmza yok' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await request.text(); // ham gövde — imza doğrulaması için şart
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (e: any) {
    console.error('webhook imza hatası:', e?.message || e);
    return NextResponse.json({ error: 'Geçersiz imza' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      let m: Record<string, string> = (s.metadata || {}) as any;

      // Payment Link akışında metadata olmaz; işletme kimliği
      // client_reference_id'de taşınır. İki biçim: 'tip:id' (API akışı)
      // ve 'tip__id' (Payment Link — ':' kabul etmediği için).
      if ((!m.entity_type || !m.entity_id) && s.client_reference_id) {
        const ref = s.client_reference_id;
        const ayrac = ref.includes(':') ? ':' : '__';
        const i = ref.indexOf(ayrac);
        if (i > 0) {
          m = { entity_type: ref.slice(0, i), entity_id: ref.slice(i + ayrac.length) };
        }
      }

      if (m.entity_type && m.entity_id) {
        await applyPremium({
          entity_type: m.entity_type, entity_id: m.entity_id, active: true,
          email: s.customer_email || (s as any).customer_details?.email || m.user_email || null,
          customerId: typeof s.customer === 'string' ? s.customer : null,
          subId: typeof s.subscription === 'string' ? s.subscription : null,
          status: 'active',
        });
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      let m: Record<string, string> = (sub.metadata || {}) as any;

      // Metadata düşmüşse (ör. abonelik Stripe panelinden elle oluşturulmuşsa)
      // ilgili işletmeyi kendi kaydımızdan bul — sessizce kaybolmasın.
      if (!m.entity_type || !m.entity_id) {
        const { data: row } = await (adminClient() as any)
          .from('premium_subscriptions')
          .select('entity_type,entity_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();
        if (row) m = { entity_type: row.entity_type, entity_id: String(row.entity_id) };
      }

      if (m.entity_type && m.entity_id) {
        // 'past_due' / 'unpaid' → ödeme alınamadı, premium kapanır.
        const active = ['active', 'trialing'].includes(sub.status);
        await applyPremium({
          entity_type: m.entity_type, entity_id: m.entity_id, active,
          customerId: typeof sub.customer === 'string' ? sub.customer : null,
          subId: sub.id, status: sub.status,
          periodEnd: (sub as any).current_period_end ?? null,
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('webhook işleme hatası:', e?.message || e);
    return NextResponse.json({ error: 'İşlenemedi' }, { status: 500 });
  }
}
