import { NextResponse, type NextRequest } from 'next/server';
import { getStripe, stripeKeyTeshis } from '@/lib/stripe';
import { verifyOwner, adminClient } from '@/lib/stripe-owner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hekimhane.com.tr';

/**
 * Stripe Müşteri Portalı — abonelik iptali, kart değiştirme, fatura geçmişi.
 * İşletme sahibi panelden "Aboneliği Yönet" ile buraya gelir; Stripe'ın kendi
 * arayüzüne yönlendirilir (iptal/ödeme bilgisi bizde tutulmaz).
 */
export async function POST(request: NextRequest) {
  try {
    const { entity_type, entity_id } = await request.json();
    const auth = await verifyOwner(request, entity_type, entity_id);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // Abonelik kaydından Stripe müşteri numarasını bul
    const { data: sub } = await (adminClient() as any)
      .from('premium_subscriptions')
      .select('stripe_customer_id')
      .eq('entity_type', auth.entity_type)
      .eq('entity_id', auth.entity_id)
      .maybeSingle();

    let customerId: string | null = sub?.stripe_customer_id || null;

    const stripe = getStripe();
    // Kayıt yoksa (ör. eski abonelik) e-postadan müşteriyi bulmayı dene
    if (!customerId) {
      const found = await stripe.customers.list({ email: auth.email, limit: 1 });
      customerId = found.data[0]?.id || null;
    }
    if (!customerId) {
      return NextResponse.json({ error: 'Aktif bir abonelik bulunamadı.' }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${SITE}/panel`,
      locale: 'tr',
    });

    return NextResponse.json({ url: portal.url });
  } catch (e: any) {
    const msg: string = e?.message || String(e);
    console.error('stripe/portal error:', msg);

    // Tek bir "açılamadı" mesajı sebebi gizliyordu; en sık üç sebep ayrıştırılır.
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Ödeme yapılandırması eksik: STRIPE_SECRET_KEY tanımlı değil.' }, { status: 500 });
    }
    if (/configuration/i.test(msg)) {
      // Stripe: müşteri portalı ayarları hiç kaydedilmemiş
      return NextResponse.json(
        { error: 'Stripe Müşteri Portalı henüz etkinleştirilmemiş. Stripe → Settings → Billing → Customer portal ayarlarını kaydedin.' },
        { status: 500 });
    }
    if (/api key|authentication|invalid.*key/i.test(msg)) {
      // Teşhis yalnız sunucu loguna (Vercel → Logs); anahtarın kendisi sızdırılmaz.
      console.error('stripe/portal anahtar teşhisi:', stripeKeyTeshis());
      return NextResponse.json({
        error: 'Ödeme sağlayıcısına şu an bağlanılamıyor (Stripe anahtarı reddedildi). '
             + 'Aboneliğinizi iptal etmek için iptal talep formunu kullanabilirsiniz — talebiniz 1 iş günü içinde işlenir.',
      }, { status: 500 });
    }
    return NextResponse.json({ error: `Abonelik yönetimi açılamadı: ${msg}` }, { status: 500 });
  }
}
