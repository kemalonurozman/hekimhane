-- hekimkartlar: entity_id ve entity_type kolonlarını ekle (yoksa)
ALTER TABLE hekimkartlar
  ADD COLUMN IF NOT EXISTS entity_id   TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT;

-- Eski tek-kullanıcı unique constraint'i düşür
ALTER TABLE hekimkartlar
  DROP CONSTRAINT IF EXISTS hekimkartlar_user_email_key;

-- Yeni çoklu profil unique constraint (user_email + entity_id)
DO $$ BEGIN
  ALTER TABLE hekimkartlar
    ADD CONSTRAINT hekimkartlar_user_entity_unique UNIQUE (user_email, entity_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Slug unique index (zaten varsa hata vermez)
CREATE UNIQUE INDEX IF NOT EXISTS hekimkartlar_slug_idx ON hekimkartlar (slug);

-- Schema cache'i yenile
NOTIFY pgrst, 'reload schema';
