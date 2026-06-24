-- Migration: E-posta abone listesi tablosu
-- Supabase Dashboard → SQL Editor'da çalıştırın
-- Tarih: 2026-04-19

CREATE TABLE IF NOT EXISTS email_aboneleri (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  isim         TEXT,
  -- Segment: 'isletme' = doktor/klinik sahibi, 'hasta' = kullanıcı/hasta
  tip          TEXT NOT NULL DEFAULT 'hasta',
  -- Nereden geldi
  kaynak       TEXT DEFAULT 'form',  -- 'kayit' | 'giris' | 'sahiplenme' | 'form' | 'profil'
  -- Hangi işletmeye bağlı (opsiyonel)
  entity_id    TEXT,
  entity_type  TEXT,  -- klinik | hastane | doktor | eczane
  entity_name  TEXT,
  aktif        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Aynı email + tip + entity kombinasyonu tekrar eklenmesin
CREATE UNIQUE INDEX IF NOT EXISTS email_aboneleri_uniq
  ON email_aboneleri (email, tip, COALESCE(entity_id, ''));

-- Hızlı sorgu için index'ler
CREATE INDEX IF NOT EXISTS email_aboneleri_tip_idx ON email_aboneleri (tip);
CREATE INDEX IF NOT EXISTS email_aboneleri_entity_idx ON email_aboneleri (entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_aboneleri_aktif_idx ON email_aboneleri (aktif);

-- RLS: anonim insert, admin her şey
ALTER TABLE email_aboneleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes abone olabilir" ON email_aboneleri
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin okuyabilir" ON email_aboneleri
  FOR SELECT USING (true);

CREATE POLICY "Admin güncelleyebilir" ON email_aboneleri
  FOR UPDATE USING (true);

NOTIFY pgrst, 'reload schema';
