-- ================================================================
--  Yorum Onayı — yorumcu kimliği + belge talebi kaydı
--  Her yeni yorum admin onayına düşer (hidden=true, report_status='onay-bekliyor';
--  bu kolonlar add_yorum_moderation.sql ile gelir — önce o çalışmış olmalı).
--  Bu dosya: yazan kişinin e-postası ve belge isteme/alındı kaydı.
--  Supabase SQL Editor'da çalıştır, ardından:  NOTIFY pgrst, 'reload schema';
-- ================================================================

ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS author_email     TEXT;          -- yorumu yazanın e-postası (yalnız admin/sahip görür)
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS belge_istendi_at TIMESTAMPTZ;   -- admin belge istediği an
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS belge_alindi_at  TIMESTAMPTZ;   -- belge alındı işaretlendiği an
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS belge_notu       TEXT;          -- istenen belge / alınan belge notu (admin)

-- Onay akışı sorguları (bekleyen / belge istendi / reddedilen)
CREATE INDEX IF NOT EXISTS idx_yorumlar_report_status ON yorumlar(report_status);

NOTIFY pgrst, 'reload schema';
