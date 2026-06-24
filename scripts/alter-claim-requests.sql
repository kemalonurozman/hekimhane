-- ================================================================
-- claim_requests tablosuna eksik kolonları EKLE
-- (tabloyu silmeden, mevcut verileri koruyarak)
-- Supabase Dashboard > SQL Editor'da çalıştırın
-- ================================================================

-- 1. Eksik kolonları ekle
ALTER TABLE claim_requests
  ADD COLUMN IF NOT EXISTS ad_soyad     text,
  ADD COLUMN IF NOT EXISTS tel          text,
  ADD COLUMN IF NOT EXISTS unvan        text,
  ADD COLUMN IF NOT EXISTS mesaj        text,
  ADD COLUMN IF NOT EXISTS entity_name  text,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz DEFAULT now();

-- 2. NOT NULL kısıtlamalarını kaldır (yeni başvurular entity_id=null gönderebilir)
ALTER TABLE claim_requests ALTER COLUMN entity_id     DROP NOT NULL;
ALTER TABLE claim_requests ALTER COLUMN claimant_name DROP NOT NULL;
ALTER TABLE claim_requests ALTER COLUMN phone         DROP NOT NULL;

-- 3. Admin güncelleme yapabilsin (status: pending → approved/rejected)
DROP POLICY IF EXISTS "Allow authenticated update" ON claim_requests;
CREATE POLICY "Allow authenticated update"
  ON claim_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Anonim INSERT hâlâ açık olsun
DROP POLICY IF EXISTS "Allow anonymous insert" ON claim_requests;
CREATE POLICY "Allow anonymous insert"
  ON claim_requests FOR INSERT
  TO anon
  WITH CHECK (true);
