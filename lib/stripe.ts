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

export const ENTITY_TABLE: Record<string, string> = {
  klinik: 'klinikler',
  hastane: 'hastaneler',
  doktor: 'doktorlar',
  eczane: 'eczaneler',
};
