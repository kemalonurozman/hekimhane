-- Slot bazlı randevu takvimi.
-- randevu_aktif   : Slot bazlı randevu açık mı? (kapalıysa serbest metin tercih formu)
-- randevu_slot_dk : Randevu aralığı (dakika) — çalışma saatlerinden slot üretimi
-- Çalışma saatleri mevcut 'calisma_saatleri' (JSON) + 'acik_24_saat' alanlarından okunur.
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS randevu_aktif   boolean DEFAULT false;
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS randevu_slot_dk integer DEFAULT 30;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS randevu_aktif   boolean DEFAULT false;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS randevu_slot_dk integer DEFAULT 30;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS randevu_aktif   boolean DEFAULT false;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS randevu_slot_dk integer DEFAULT 30;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS randevu_aktif   boolean DEFAULT false;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS randevu_slot_dk integer DEFAULT 30;

-- Seçilen slot (yerel "YYYY-MM-DD HH:MM"). Çakışma bu metin üzerinden kontrol edilir
-- (saat dilimi dönüşümü yok → tutarlı).
ALTER TABLE randevu_talepleri ADD COLUMN IF NOT EXISTS randevu_slot text;

NOTIFY pgrst, 'reload schema';
