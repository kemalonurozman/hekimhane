-- Migration: eczaneler tablosuna claimed, rat, rev kolonlarını ekle
-- Supabase Dashboard → SQL Editor'da çalıştırın
-- Tarih: 2026-04-19

ALTER TABLE eczaneler ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE eczaneler ADD COLUMN IF NOT EXISTS rat     DOUBLE PRECISION DEFAULT 0;
ALTER TABLE eczaneler ADD COLUMN IF NOT EXISTS rev     INTEGER DEFAULT 0;

-- PostgREST şema cache yenile
NOTIFY pgrst, 'reload schema';
