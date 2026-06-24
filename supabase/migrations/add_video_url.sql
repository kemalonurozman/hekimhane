-- Migration: tüm işletme tablolarına video_url kolonu ekle
-- YouTube, Vimeo veya herhangi bir video iframe embed kodu
-- Supabase Dashboard → SQL Editor'da çalıştırın
-- Tarih: 2026-04-19

ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- PostgREST şema cache yenile
NOTIFY pgrst, 'reload schema';
