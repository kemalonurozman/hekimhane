-- Migration: add tour360url column to all entity tables
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Date: 2026-04-17

ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS tour360url TEXT;

-- Optional: add a comment to each column
COMMENT ON COLUMN klinikler.tour360url  IS '360° sanal tur iframe veya Matterport/YouTube linki';
COMMENT ON COLUMN hastaneler.tour360url IS '360° sanal tur iframe veya Matterport/YouTube linki';
COMMENT ON COLUMN doktorlar.tour360url  IS '360° sanal tur iframe veya Matterport/YouTube linki';
COMMENT ON COLUMN eczaneler.tour360url  IS '360° sanal tur iframe veya Matterport/YouTube linki';
