-- Makale yerleşimi — "Anasayfada öne çıkar" seçeneği.
-- İşaretli ve yayında olan makaleler anasayfada öne çıkan makaleler bölümünde gösterilir.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS show_homepage boolean DEFAULT false;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
