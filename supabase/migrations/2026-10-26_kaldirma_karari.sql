-- ================================================================
--  Profil kaldırma — YÖNETİCİ KARARI akışı (2026-10-26)
--  Önceki akış: talep → profil anında gizli → e-posta onayı → kayıt SİLİNİR.
--  Yeni akış:   talep → yönetici paneline düşer (profil yayında kalır)
--               48 saat içinde karar yoksa profil DURAKLATILIR (yayından alınır)
--               kaldırma yalnız yönetici kararıyla; silmeden önce TAM YEDEK alınır
--               → "Kaldırılan Profiller"den geri yüklenebilir (yedek süreli tutulur).
--  Önce 2026-10-25_profil_kaldirma.sql çalışmış olmalı.
--  Supabase SQL Editor'da çalıştırın.
-- ================================================================

-- İşletme tabloları: talep gelince 48 saat sonrası yazılır; o an geçtiyse profil 404
-- (cron beklenmez — detay sayfası satırı zaten okuyor, ek sorgu yok)
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS duraklat_at TIMESTAMPTZ;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS duraklat_at TIMESTAMPTZ;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS duraklat_at TIMESTAMPTZ;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS duraklat_at TIMESTAMPTZ;

-- Talep: e-posta doğrulama, duraklatma, yönetici sorusu ve kararı
-- status: bekliyor | duraklatildi | kaldirildi | reddedildi | iptal  (eski 'onaylandi' = kaldirildi)
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS karar_son           TIMESTAMPTZ;  -- bu ana kadar karar yoksa profil duraklatılır (talep + 48 saat)
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS email_dogrulandi_at TIMESTAMPTZ;
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS duraklatildi_at     TIMESTAMPTZ;
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS soru_metni          TEXT;   -- yöneticinin talep sahibine sorusu
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS soru_at             TIMESTAMPTZ;
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS karar_notu          TEXT;
ALTER TABLE profil_kaldirma_talepleri ADD COLUMN IF NOT EXISTS karar_at            TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS profil_kaldirma_status_idx ON profil_kaldirma_talepleri (status, created_at);

-- Kaldırılanlar: geri yükleme için tam yedek (kayıt + yorumlar + sahiplik), süreli
ALTER TABLE kaldirilan_profiller ADD COLUMN IF NOT EXISTS talep_id         UUID;
ALTER TABLE kaldirilan_profiller ADD COLUMN IF NOT EXISTS yedek            JSONB;        -- { kayit, yorumlar, claims }
ALTER TABLE kaldirilan_profiller ADD COLUMN IF NOT EXISTS yedek_silinme    TIMESTAMPTZ;  -- bu tarihten sonra yedek boşaltılır
ALTER TABLE kaldirilan_profiller ADD COLUMN IF NOT EXISTS geri_yuklendi_at TIMESTAMPTZ;

-- Eski akışta 'onaylandi' = kayıt silindi
UPDATE profil_kaldirma_talepleri SET status = 'kaldirildi' WHERE status = 'onaylandi';

-- Eski akışta anında gizlenmiş ama HENÜZ silinmemiş profiller yeniden yayına alınır:
-- artık talep yöneticiye düşer; 48 saat kuralı bugünden başlar.
UPDATE klinikler  SET gizli = false, duraklat_at = now() + interval '48 hours' WHERE gizli = true AND id IN (SELECT entity_id FROM profil_kaldirma_talepleri WHERE entity_type = 'klinik'  AND status = 'bekliyor');
UPDATE hastaneler SET gizli = false, duraklat_at = now() + interval '48 hours' WHERE gizli = true AND id IN (SELECT entity_id FROM profil_kaldirma_talepleri WHERE entity_type = 'hastane' AND status = 'bekliyor');
UPDATE doktorlar  SET gizli = false, duraklat_at = now() + interval '48 hours' WHERE gizli = true AND id IN (SELECT entity_id FROM profil_kaldirma_talepleri WHERE entity_type = 'doktor'  AND status = 'bekliyor');
UPDATE eczaneler  SET gizli = false, duraklat_at = now() + interval '48 hours' WHERE gizli = true AND id IN (SELECT entity_id FROM profil_kaldirma_talepleri WHERE entity_type = 'eczane'  AND status = 'bekliyor');
UPDATE profil_kaldirma_talepleri SET karar_son = now() + interval '48 hours' WHERE status = 'bekliyor' AND karar_son IS NULL;

NOTIFY pgrst, 'reload schema';
