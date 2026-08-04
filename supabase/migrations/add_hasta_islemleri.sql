-- Hasta işlem/tedavi geçmişi — her ziyarette yapılan işlem + not + ücret.
-- Hasta dosyası; yalnız işletme sahibine görünür.
CREATE TABLE IF NOT EXISTS hasta_islemleri (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id  text NOT NULL,
  tel        text NOT NULL,
  tarih      date,
  islem      text,
  notlar     text,
  ucret      numeric,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hasta_islemleri_entity_tel ON hasta_islemleri (entity_id, tel);

NOTIFY pgrst, 'reload schema';
