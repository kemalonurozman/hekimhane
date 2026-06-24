-- ================================================================
-- HEKİMHANE — TAM VERİTABANI ŞEMASI (Yeni Supabase Projesi)
-- Supabase Dashboard → SQL Editor'a yapıştırıp çalıştırın
-- Tüm tablolar, migration'lar ve RLS politikaları dahildir.
-- ================================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. KLİNİKLER
-- ================================================================
CREATE TABLE IF NOT EXISTS klinikler (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  type              TEXT,
  il                TEXT,
  ilce              TEXT,
  adres             TEXT,
  lat               DOUBLE PRECISION DEFAULT 0,
  lng               DOUBLE PRECISION DEFAULT 0,
  tel               TEXT,
  website           TEXT,
  maps_url          TEXT,
  specs             TEXT[],
  rat               DOUBLE PRECISION DEFAULT 4.5,
  rev               INTEGER DEFAULT 0,
  online            BOOLEAN DEFAULT FALSE,
  acil              BOOLEAN DEFAULT FALSE,
  claimed           BOOLEAN DEFAULT FALSE,
  slug              TEXT UNIQUE,
  logo              TEXT,
  cover             TEXT,
  premium           BOOLEAN DEFAULT FALSE,
  photos            TEXT[],
  photo360          TEXT,
  tour360url        TEXT,
  video_url         TEXT,
  instagram_url     TEXT,
  facebook_url      TEXT,
  linkedin_url      TEXT,
  calisma_saatleri  TEXT,
  acik_24_saat      BOOLEAN DEFAULT FALSE,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id          UUID,
  view_360_url      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 2. HASTANELER
-- ================================================================
CREATE TABLE IF NOT EXISTS hastaneler (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  type              TEXT,
  il                TEXT,
  ilce              TEXT,
  adres             TEXT,
  lat               DOUBLE PRECISION DEFAULT 0,
  lng               DOUBLE PRECISION DEFAULT 0,
  tel               TEXT,
  website           TEXT,
  maps_url          TEXT,
  specs             TEXT[],
  rat               DOUBLE PRECISION DEFAULT 4.5,
  rev               INTEGER DEFAULT 0,
  docs              INTEGER DEFAULT 0,
  beds              INTEGER DEFAULT 0,
  founded           INTEGER,
  claimed           BOOLEAN DEFAULT FALSE,
  slug              TEXT UNIQUE,
  logo              TEXT,
  cover             TEXT,
  premium           BOOLEAN DEFAULT FALSE,
  photos            TEXT[],
  photo360          TEXT,
  tour360url        TEXT,
  video_url         TEXT,
  instagram_url     TEXT,
  facebook_url      TEXT,
  linkedin_url      TEXT,
  calisma_saatleri  TEXT,
  acik_24_saat      BOOLEAN DEFAULT FALSE,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id          UUID,
  view_360_url      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. DOKTORLAR
-- ================================================================
CREATE TABLE IF NOT EXISTS doktorlar (
  id                TEXT PRIMARY KEY,
  ad                TEXT NOT NULL,
  soyad             TEXT NOT NULL,
  spec              TEXT,
  il                TEXT,
  ilce              TEXT,
  clinic_name       TEXT,
  rat               DOUBLE PRECISION DEFAULT 4.5,
  rev               INTEGER DEFAULT 0,
  fee               INTEGER DEFAULT 0,
  premium           BOOLEAN DEFAULT FALSE,
  online            BOOLEAN DEFAULT FALSE,
  verified          BOOLEAN DEFAULT FALSE,
  tel               TEXT,
  tags              TEXT[],
  exp               INTEGER DEFAULT 0,
  lat               DOUBLE PRECISION DEFAULT 0,
  lng               DOUBLE PRECISION DEFAULT 0,
  slug              TEXT UNIQUE,
  photo             TEXT,
  photos            TEXT[],
  photo360          TEXT,
  tour360url        TEXT,
  video_url         TEXT,
  instagram_url     TEXT,
  facebook_url      TEXT,
  linkedin_url      TEXT,
  calisma_saatleri  TEXT,
  acik_24_saat      BOOLEAN DEFAULT FALSE,
  unvan             TEXT,
  bio               TEXT,
  okul              TEXT,
  sigorta           TEXT[],
  conditions        TEXT[],
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id          UUID,
  view_360_url      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 4. ECZANELER
-- ================================================================
CREATE TABLE IF NOT EXISTS eczaneler (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  pharmacist        TEXT,
  il                TEXT,
  ilce              TEXT,
  address           TEXT,
  tel               TEXT,
  nobetci           BOOLEAN DEFAULT FALSE,
  nobetci_bilgi     TEXT,
  chamber           TEXT,
  slug              TEXT UNIQUE,
  lat               DOUBLE PRECISION DEFAULT 0,
  lng               DOUBLE PRECISION DEFAULT 0,
  claimed           BOOLEAN DEFAULT FALSE,
  rat               DOUBLE PRECISION DEFAULT 0,
  rev               INTEGER DEFAULT 0,
  premium           BOOLEAN DEFAULT FALSE,
  photos            TEXT[],
  photo360          TEXT,
  tour360url        TEXT,
  video_url         TEXT,
  instagram_url     TEXT,
  facebook_url      TEXT,
  linkedin_url      TEXT,
  calisma_saatleri  TEXT,
  acik_24_saat      BOOLEAN DEFAULT FALSE,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id          UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 5. YORUMLAR
-- ================================================================
CREATE TABLE IF NOT EXISTS yorumlar (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type       TEXT NOT NULL,
  entity_id         TEXT NOT NULL,
  author            TEXT NOT NULL,
  rating            DOUBLE PRECISION NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text              TEXT,
  date              TEXT,
  helpful           INTEGER DEFAULT 0,
  verified          BOOLEAN DEFAULT FALSE,
  rating_temizlik   NUMERIC(2,1),
  rating_ilgi       NUMERIC(2,1),
  rating_hiz        NUMERIC(2,1),
  user_id           UUID,
  reply_text        TEXT,
  reply_at          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 6. BLOG YAZILARI
-- ================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  summary       TEXT,
  content       TEXT,
  category      TEXT,
  tags          TEXT[],
  author        TEXT DEFAULT 'Hekimhane Editör',
  cover_image   TEXT,
  published     BOOLEAN DEFAULT TRUE,
  views         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 7. PROFİLLER (İşletme sahipleri)
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  phone         TEXT,
  entity_type   TEXT,
  entity_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 8. SAHİPLENME TALEPLERİ
-- ================================================================
CREATE TABLE IF NOT EXISTS claim_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  entity_name   TEXT,
  claimant_name TEXT,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT,
  unvan         TEXT,
  mesaj         TEXT,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'pending',
  admin_note    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 9. DOKTOR FOTOĞRAF GALERİSİ
-- ================================================================
CREATE TABLE IF NOT EXISTS doctor_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doktor_id     TEXT NOT NULL REFERENCES doktorlar(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  caption       TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 10. HEKİMKARTLAR (Dijital kartvizit)
-- ================================================================
CREATE TABLE IF NOT EXISTS hekimkartlar (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email      TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  ad              TEXT NOT NULL DEFAULT '',
  soyad           TEXT NOT NULL DEFAULT '',
  unvan           TEXT NOT NULL DEFAULT '',
  spec            TEXT NOT NULL DEFAULT '',
  tel             TEXT NOT NULL DEFAULT '',
  instagram_url   TEXT NOT NULL DEFAULT '',
  facebook_url    TEXT NOT NULL DEFAULT '',
  photo_url       TEXT NOT NULL DEFAULT '',
  il              TEXT NOT NULL DEFAULT '',
  ilce            TEXT NOT NULL DEFAULT '',
  clinic_name     TEXT NOT NULL DEFAULT '',
  bio             TEXT NOT NULL DEFAULT '',
  iban            TEXT NOT NULL DEFAULT '',
  rezervasyon_url TEXT NOT NULL DEFAULT '',
  website_url     TEXT NOT NULL DEFAULT '',
  maps_url        TEXT NOT NULL DEFAULT '',
  hekimhane_url   TEXT NOT NULL DEFAULT '',
  entity_id       TEXT,
  entity_type     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 11. E-POSTA ABONELERİ
-- ================================================================
CREATE TABLE IF NOT EXISTS email_aboneleri (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  isim          TEXT,
  tip           TEXT NOT NULL DEFAULT 'hasta',
  kaynak        TEXT DEFAULT 'form',
  entity_id     TEXT,
  entity_type   TEXT,
  entity_name   TEXT,
  aktif         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_aboneleri_uniq
  ON email_aboneleri (email, tip, COALESCE(entity_id, ''));

-- ================================================================
-- 12. ÇEKİM TALEPLERİ (360° fotoğraf)
-- ================================================================
CREATE TABLE IF NOT EXISTS cekim_talepleri (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isletme_adi   TEXT NOT NULL,
  isletme_turu  TEXT,
  entity_id     TEXT,
  il            TEXT,
  ilce          TEXT,
  ad_soyad      TEXT NOT NULL,
  tel           TEXT NOT NULL,
  email         TEXT,
  notlar        TEXT,
  durum         TEXT DEFAULT 'beklemede',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- İNDEKSLER
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_klinikler_il      ON klinikler(il);
CREATE INDEX IF NOT EXISTS idx_klinikler_ilce    ON klinikler(ilce);
CREATE INDEX IF NOT EXISTS idx_klinikler_type    ON klinikler(type);
CREATE INDEX IF NOT EXISTS idx_klinikler_rat     ON klinikler(rat DESC);
CREATE INDEX IF NOT EXISTS idx_klinikler_specs   ON klinikler USING GIN(specs);

CREATE INDEX IF NOT EXISTS idx_hastaneler_il     ON hastaneler(il);
CREATE INDEX IF NOT EXISTS idx_hastaneler_ilce   ON hastaneler(ilce);
CREATE INDEX IF NOT EXISTS idx_hastaneler_type   ON hastaneler(type);
CREATE INDEX IF NOT EXISTS idx_hastaneler_rat    ON hastaneler(rat DESC);

CREATE INDEX IF NOT EXISTS idx_doktorlar_il      ON doktorlar(il);
CREATE INDEX IF NOT EXISTS idx_doktorlar_spec    ON doktorlar(spec);
CREATE INDEX IF NOT EXISTS idx_doktorlar_rat     ON doktorlar(rat DESC);

CREATE INDEX IF NOT EXISTS idx_eczaneler_il      ON eczaneler(il);
CREATE INDEX IF NOT EXISTS idx_eczaneler_ilce    ON eczaneler(ilce);

CREATE INDEX IF NOT EXISTS idx_yorumlar_entity   ON yorumlar(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS email_aboneleri_tip_idx    ON email_aboneleri(tip);
CREATE INDEX IF NOT EXISTS email_aboneleri_aktif_idx  ON email_aboneleri(aktif);
CREATE UNIQUE INDEX IF NOT EXISTS hekimkartlar_slug_idx  ON hekimkartlar(slug);
CREATE UNIQUE INDEX IF NOT EXISTS hekimkartlar_email_idx ON hekimkartlar(user_email);

-- ================================================================
-- FOREIGN KEY EKLE (tablolar oluştuktan sonra)
-- ================================================================
ALTER TABLE klinikler  ADD CONSTRAINT klinikler_owner_fk
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE hastaneler ADD CONSTRAINT hastaneler_owner_fk
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE doktorlar  ADD CONSTRAINT doktorlar_owner_fk
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE eczaneler  ADD CONSTRAINT eczaneler_owner_fk
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE yorumlar   ADD CONSTRAINT yorumlar_user_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE klinikler       ENABLE ROW LEVEL SECURITY;
ALTER TABLE hastaneler      ENABLE ROW LEVEL SECURITY;
ALTER TABLE doktorlar       ENABLE ROW LEVEL SECURITY;
ALTER TABLE eczaneler       ENABLE ROW LEVEL SECURITY;
ALTER TABLE yorumlar        ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hekimkartlar    ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_aboneleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE cekim_talepleri ENABLE ROW LEVEL SECURITY;

-- Herkese açık okuma
CREATE POLICY "Herkese açık okuma" ON klinikler    FOR SELECT USING (TRUE);
CREATE POLICY "Herkese açık okuma" ON hastaneler   FOR SELECT USING (TRUE);
CREATE POLICY "Herkese açık okuma" ON doktorlar    FOR SELECT USING (TRUE);
CREATE POLICY "Herkese açık okuma" ON eczaneler    FOR SELECT USING (TRUE);
CREATE POLICY "Herkese açık okuma" ON yorumlar     FOR SELECT USING (TRUE);
CREATE POLICY "Herkese açık okuma" ON blog_posts   FOR SELECT USING (published = TRUE);

-- Sahip güncelleyebilir
CREATE POLICY "Sahip güncelleyebilir" ON klinikler
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Sahip güncelleyebilir" ON hastaneler
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Sahip güncelleyebilir" ON doktorlar
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Sahip güncelleyebilir" ON eczaneler
  FOR UPDATE USING (auth.uid() = owner_id);

-- Profiller
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Claim requests
CREATE POLICY "Users can view own claims" ON claim_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert claim" ON claim_requests
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage claims" ON claim_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Doctor images
CREATE POLICY "Anyone can view doctor images" ON doctor_images FOR SELECT USING (TRUE);
CREATE POLICY "Doctor owner can manage images" ON doctor_images FOR ALL USING (
  EXISTS (SELECT 1 FROM doktorlar WHERE id = doktor_id AND owner_id = auth.uid())
);

-- HekimKartlar
CREATE POLICY "hekimkartlar_public_read"  ON hekimkartlar FOR SELECT USING (TRUE);
CREATE POLICY "hekimkartlar_own_insert"   ON hekimkartlar FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');
CREATE POLICY "hekimkartlar_own_update"   ON hekimkartlar FOR UPDATE USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "hekimkartlar_own_delete"   ON hekimkartlar FOR DELETE USING (user_email = auth.jwt() ->> 'email');

-- Email aboneleri
CREATE POLICY "Herkes abone olabilir" ON email_aboneleri FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin okuyabilir"      ON email_aboneleri FOR SELECT USING (TRUE);
CREATE POLICY "Admin güncelleyebilir" ON email_aboneleri FOR UPDATE USING (TRUE);

-- Çekim talepleri
CREATE POLICY "Herkes insert yapabilir"    ON cekim_talepleri FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin her şeyi okuyabilir"  ON cekim_talepleri FOR SELECT USING (TRUE);
CREATE POLICY "Admin güncelleme yapabilir" ON cekim_talepleri FOR UPDATE USING (TRUE);

-- ================================================================
-- OTOMATİK UPDATED_AT TETİKLEYİCİLERİ
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER klinikler_updated_at
  BEFORE UPDATE ON klinikler
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hastaneler_updated_at
  BEFORE UPDATE ON hastaneler
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER doktorlar_updated_at
  BEFORE UPDATE ON doktorlar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- OTOMATİK PROFİL OLUŞTURMA (Google Auth trigger)
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- DOKTOR FOTOĞRAF LİMİT KONTROLÜ
-- ================================================================
CREATE OR REPLACE FUNCTION check_doctor_image_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM doctor_images WHERE doktor_id = NEW.doktor_id) >= 13 THEN
    RAISE EXCEPTION 'Bir doktor için en fazla 13 fotoğraf yüklenebilir';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_doctor_image_limit ON doctor_images;
CREATE TRIGGER enforce_doctor_image_limit
  BEFORE INSERT ON doctor_images
  FOR EACH ROW EXECUTE FUNCTION check_doctor_image_limit();

-- ================================================================
-- STORAGE BUCKET (Fotoğraf yükleme)
-- ================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hekimhane-photos',
  'hekimhane-photos',
  TRUE,
  8388608,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/avif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'hekimhane-photos');

CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hekimhane-photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hekimhane-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ================================================================
-- TAMAMLANDI — PostgREST şema cache yenile
-- ================================================================
NOTIFY pgrst, 'reload schema';
