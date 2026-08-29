-- Premium abonelik kayıtları (Stripe) — Supabase SQL Editor'da çalıştırın.
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type             TEXT NOT NULL CHECK (entity_type IN ('klinik','hastane','doktor','eczane')),
  entity_id               TEXT NOT NULL,
  email                   TEXT,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  status                  TEXT NOT NULL DEFAULT 'inactive',
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_premsub_entity ON premium_subscriptions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_premsub_sub    ON premium_subscriptions(stripe_subscription_id);

ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tabloda abone e-postası + Stripe müşteri/abonelik ID'leri duruyor; tarayıcıya
-- (anon key) hiçbir satır açılmaz. Service-role RLS'i zaten baypas eder, o yüzden
-- webhook yazması ve panel/admin okuması için politika gerekmez.
-- NOT: eski kurulumda herkese açık SELECT politikası vardı — aşağıdaki DROP onu kaldırır.
DROP POLICY IF EXISTS "svc read premsub" ON premium_subscriptions;

NOTIFY pgrst, 'reload schema';
