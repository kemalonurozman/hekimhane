-- Admin paneli düzeltmeleri (2026-09-22)
-- Supabase Dashboard › SQL Editor'da çalıştırın. Tekrar çalıştırmak güvenlidir.

-- 1) eczaneler.updated_at YOKTU → admin "Kaydı Düzenle" her eczane kaydında
--    "column updated_at does not exist" hatası veriyordu.
ALTER TABLE eczaneler ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2) doktorlar.claimed YOKTU → sahiplenme onayı doktorlarda işaretlenemiyor,
--    hata sessizce yutuluyor, listede "Sahiplenilmiş" sütunu hep boş kalıyordu.
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;

-- Var olan onaylı doktor sahiplenmelerini geriye dönük işaretle
UPDATE doktorlar d SET claimed = TRUE
 WHERE claimed IS DISTINCT FROM TRUE
   AND EXISTS (
     SELECT 1 FROM claim_requests c
      WHERE c.entity_type = 'doktor' AND c.entity_id = d.id AND c.status = 'approved'
   );

NOTIFY pgrst, 'reload schema';
