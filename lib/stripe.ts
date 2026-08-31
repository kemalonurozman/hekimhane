import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/**
 * Stripe client — STRIPE_SECRET_KEY env'inden lazy init.
 * Anahtar `trim()` edilir: Vercel'e yapıştırırken araya giren boşluk/satır sonu
 * Stripe'tan "Invalid API Key provided" döndürüyordu (anahtar doğru olsa bile).
 */
export function getStripe(): Stripe {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY tanımlı değil');
  }
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

/**
 * Anahtarın biçim teşhisi — gizli değeri sızdırmadan (yalnız önek + uzunluk).
 * "Geçersiz anahtar" hatasında sebebi ayırt etmek için kullanılır.
 */
export function stripeKeyTeshis(): string {
  const ham = process.env.STRIPE_SECRET_KEY || '';
  const key = ham.trim();
  if (!key) return 'anahtar tanımlı değil';
  const onek = key.slice(0, 8);
  const notlar: string[] = [`önek ${onek}…`, `${key.length} karakter`];
  if (ham !== key) notlar.push('BAŞ/SON BOŞLUK VARDI');
  if (key.startsWith('rk_')) notlar.push('kısıtlı anahtar (rk_) — müşteri portalı yetkisi olmayabilir');
  if (key.startsWith('sk_test_')) notlar.push('TEST anahtarı');
  return notlar.join(', ');
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
