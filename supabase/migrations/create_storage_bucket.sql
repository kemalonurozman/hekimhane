-- Hekimhane fotoğraf storage bucket'ı
-- Supabase Dashboard → SQL Editor'da çalıştırın

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hekimhane-photos',
  'hekimhane-photos',
  true,
  8388608,  -- 8 MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Herkese okuma izni (public bucket)
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'hekimhane-photos');

-- Giriş yapmış kullanıcılar yükleyebilir
CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hekimhane-photos' AND auth.role() = 'authenticated'
  );

-- Kendi yüklediklerini silebilir
CREATE POLICY "Owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hekimhane-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
