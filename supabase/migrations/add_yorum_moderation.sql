-- ================================================================
--  Yorum Moderasyonu — şikayet + gizleme/silme akışı
--  İşletme sahibi istenmeyen yorumu şikayet eder; admin son kararı verir.
--  Supabase SQL Editor'da çalıştır, ardından:  NOTIFY pgrst, 'reload schema';
-- ================================================================

ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS hidden        BOOLEAN     DEFAULT false; -- true → herkese görünmez
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS report_status TEXT;                       -- null | 'pending' | 'resolved' | 'dismissed'
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS report_reason TEXT;                       -- sahibin şikayet gerekçesi
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS reported_by   TEXT;                        -- şikayet eden işletme sahibi e-postası
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS reported_at   TIMESTAMPTZ;
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS admin_note    TEXT;                        -- admin karar notu

-- Eski satırların hidden alanını netle (null → false)
UPDATE yorumlar SET hidden = false WHERE hidden IS NULL;

-- Bekleyen şikayetleri hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_yorumlar_report_status ON yorumlar(report_status);

NOTIFY pgrst, 'reload schema';
