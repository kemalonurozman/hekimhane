-- Hasta kartı — işletmenin kayıtlı hastalarına özel kalıcı not/bilgi.
-- Hastalar telefona göre randevu_talepleri'nden türetilir; kalıcı not burada tutulur.
-- (entity_id, tel) tekil → aynı hastaya tek kart.
CREATE TABLE IF NOT EXISTS hastalar (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id  text NOT NULL,
  tel        text NOT NULL,
  ad         text,
  email      text,
  notlar     text,
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_hastalar_entity_tel ON hastalar (entity_id, tel);

NOTIFY pgrst, 'reload schema';
