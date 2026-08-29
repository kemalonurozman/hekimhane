import { NextResponse, type NextRequest } from 'next/server';
import { verifyOwner, adminClient } from '@/lib/stripe-owner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Panelin abonelik durumu okuması. premium_subscriptions tablosu RLS ile tarayıcıya
 * kapalı (abone e-postası + Stripe ID'leri içerir), bu yüzden sunucudan servis edilir.
 * Gövde: { items: [{ entity_type, entity_id }] } → yalnızca sahibi olunan kayıtlar döner.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items.slice(0, 25) : [];
    if (!items.length) return NextResponse.json({ subs: {} });

    const admin = adminClient();
    const subs: Record<string, { status: string; period_end: string | null }> = {};

    for (const it of items) {
      const auth = await verifyOwner(request, it?.entity_type, it?.entity_id);
      if (!auth.ok) continue; // yetkisiz kayıt sessizce atlanır

      const { data } = await (admin as any)
        .from('premium_subscriptions')
        .select('status,current_period_end')
        .eq('entity_type', auth.entity_type)
        .eq('entity_id', auth.entity_id)
        .maybeSingle();

      if (data) {
        subs[`${auth.entity_type}:${auth.entity_id}`] = {
          status: data.status || 'inactive',
          period_end: data.current_period_end || null,
        };
      }
    }

    return NextResponse.json({ subs });
  } catch (e: any) {
    console.error('stripe/subscription error:', e?.message || e);
    // Tablo yoksa veya sorgu patlarsa panel yine açılsın — abonelik detayı gizlenir
    return NextResponse.json({ subs: {} });
  }
}
