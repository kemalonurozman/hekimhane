-- HekimKart tablosu: her kullanıcının dijital kartviziti
CREATE TABLE IF NOT EXISTS hekimkartlar (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email   TEXT        NOT NULL UNIQUE,
  slug         TEXT        NOT NULL UNIQUE,
  ad           TEXT        NOT NULL DEFAULT '',
  soyad        TEXT        NOT NULL DEFAULT '',
  unvan        TEXT        NOT NULL DEFAULT '',
  spec         TEXT        NOT NULL DEFAULT '',
  tel          TEXT        NOT NULL DEFAULT '',
  instagram_url TEXT       NOT NULL DEFAULT '',
  facebook_url  TEXT       NOT NULL DEFAULT '',
  photo_url    TEXT        NOT NULL DEFAULT '',
  il           TEXT        NOT NULL DEFAULT '',
  ilce         TEXT        NOT NULL DEFAULT '',
  clinic_name  TEXT        NOT NULL DEFAULT '',
  bio          TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE hekimkartlar ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (public kart sayfası için)
CREATE POLICY "hekimkartlar_public_read"
  ON hekimkartlar FOR SELECT USING (true);

-- Kullanıcı sadece kendi kartını yönetebilir
CREATE POLICY "hekimkartlar_own_insert"
  ON hekimkartlar FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "hekimkartlar_own_update"
  ON hekimkartlar FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "hekimkartlar_own_delete"
  ON hekimkartlar FOR DELETE
  USING (user_email = auth.jwt() ->> 'email');

-- Slug için index
CREATE UNIQUE INDEX IF NOT EXISTS hekimkartlar_slug_idx ON hekimkartlar (slug);
CREATE UNIQUE INDEX IF NOT EXISTS hekimkartlar_email_idx ON hekimkartlar (user_email);
