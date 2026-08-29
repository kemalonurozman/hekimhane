import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/** Stripe client — STRIPE_SECRET_KEY env'inden lazy init. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY tanımlı değil');
  }
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

/** Hekimhane-Pro ürünü (Stripe Product Catalog — aylık abonelik). */
const PRO_PRODUCT_ID = process.env.STRIPE_PRODUCT_PRO || 'prod_VA4Ez1eZ6NPoBm';

let _proPriceId: string | null = null;

/**
 * Pro aboneliğin Stripe price ID'sini çözer.
 * Öncelik: STRIPE_PRICE_MONTHLY env → Hekimhane-Pro ürününün varsayılan fiyatı
 * → ürünün ilk aktif recurring fiyatı → STRIPE_PRICE_YEARLY (eski kurulum).
 * Sonuç modül seviyesinde cache'lenir — her checkout'ta Stripe'a gidilmez.
 */
export async function getProPriceId(): Promise<string> {
  if (process.env.STRIPE_PRICE_MONTHLY) return process.env.STRIPE_PRICE_MONTHLY;
  if (_proPriceId) return _proPriceId;

  const stripe = getStripe();
  try {
    const product = await stripe.products.retrieve(PRO_PRODUCT_ID);
    const def = typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price?.id;
    if (def) { _proPriceId = def; return def; }

    const prices = await stripe.prices.list({ product: PRO_PRODUCT_ID, active: true, limit: 10 });
    const recurring = prices.data.find(p => p.recurring) || prices.data[0];
    if (recurring) { _proPriceId = recurring.id; return recurring.id; }
  } catch (e: any) {
    console.error('getProPriceId:', e?.message || e);
  }

  if (process.env.STRIPE_PRICE_YEARLY) return process.env.STRIPE_PRICE_YEARLY;
  throw new Error('Pro abonelik fiyatı bulunamadı (STRIPE_PRICE_MONTHLY tanımlayın).');
}

export const ENTITY_TABLE: Record<string, string> = {
  klinik: 'klinikler',
  hastane: 'hastaneler',
  doktor: 'doktorlar',
  eczane: 'eczaneler',
};
