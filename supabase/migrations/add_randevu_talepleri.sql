-- Randevu talepleri tablosu
-- Supabase SQL Editor'da çalıştırın, ardından: NOTIFY pgrst, 'reload schema';

CREATE TABLE IF NOT EXISTS randevu_talepleri (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('klinik','hastane','doktor','eczane')),
  entity_id   TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  ad_soyad    TEXT NOT NULL,
  tel         TEXT NOT NULL,
  email       TEXT,
  tercih      TEXT,          -- tercih edilen tarih/saat (serbest metin)
  mesaj       TEXT,
  status      TEXT NOT NULL DEFAULT 'yeni' CHECK (status IN ('yeni','arandi','tamamlandi','iptal')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_randevu_entity ON randevu_talepleri(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_randevu_status ON randevu_talepleri(status);

ALTER TABLE randevu_talepleri ENABLE ROW LEVEL SECURITY;

-- Insert yalnızca service role üzerinden (API route) yapılır.
-- Admin paneli tarayıcı client'ıyla okur/günceller — cekim_talepleri ile aynı model.
CREATE POLICY "Admin okuyabilir"     ON randevu_talepleri FOR SELECT USING (TRUE);
CREATE POLICY "Admin güncelleyebilir" ON randevu_talepleri FOR UPDATE USING (TRUE);

NOTIFY pgrst, 'reload schema';
