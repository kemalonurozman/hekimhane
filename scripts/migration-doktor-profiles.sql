-- ================================================================
-- Doktor profil alanları migrasyonu
-- Çalıştır: Supabase Dashboard > SQL Editor
-- ================================================================

alter table doktorlar
  add column if not exists unvan       text,          -- 'Prof. Dr.', 'Op. Dr.', 'Uzm. Dr.' vb.
  add column if not exists bio         text,          -- uzun paragraf biyografi
  add column if not exists okul        text,          -- eğitim geçmişi (· ile ayrılmış)
  add column if not exists sigorta     text[],        -- ['SGK','Özel Sigorta']
  add column if not exists conditions  text[];        -- ['katarakt','glokom', ...]

-- tags sütunu schema.sql'de zaten var; yoksa ekle
alter table doktorlar
  add column if not exists tags        text[];
