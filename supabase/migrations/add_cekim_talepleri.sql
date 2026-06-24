-- Migration: 360° profesyonel fotoğraf çekim talepleri tablosu
-- Supabase Dashboard → SQL Editor'da çalıştırın
-- Tarih: 2026-04-19

CREATE TABLE IF NOT EXISTS cekim_talepleri (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isletme_adi  TEXT NOT NULL,
  isletme_turu TEXT,             -- klinik, hastane, doktor, eczane
  entity_id    TEXT,             -- Supabase entity id (varsa)
  il           TEXT,
  ilce         TEXT,
  ad_soyad     TEXT NOT NULL,
  tel          TEXT NOT NULL,
  email        TEXT,
  notlar       TEXT,
  durum        TEXT DEFAULT 'beklemede',  -- beklemede, iletisime_gecildi, tamamlandi, iptal
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Admin okuma + yazma, anonim kullanıcılar sadece insert
ALTER TABLE cekim_talepleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes insert yapabilir" ON cekim_talepleri
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin her şeyi okuyabilir" ON cekim_talepleri
  FOR SELECT USING (true);

CREATE POLICY "Admin güncelleme yapabilir" ON cekim_talepleri
  FOR UPDATE USING (true);

-- PostgREST şema cache yenile
NOTIFY pgrst, 'reload schema';
