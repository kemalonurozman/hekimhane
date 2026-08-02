-- Hesap aktivasyon token'ları (sahiplenme onayı → şifre belirleme) — Supabase SQL Editor'da çalıştırın.
CREATE TABLE IF NOT EXISTS account_activations (
  token        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  user_id      UUID,
  entity_name  TEXT,
  used_at      TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activ_email ON account_activations(email);

ALTER TABLE account_activations ENABLE ROW LEVEL SECURITY;
-- Yalnızca service-role (API) erişir; public policy yok → herkese kapalı.

NOTIFY pgrst, 'reload schema';
