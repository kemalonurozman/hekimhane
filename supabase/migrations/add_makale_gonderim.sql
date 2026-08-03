-- ================================================================
--  MAKALE GÖNDERİM / ONAY AKIŞI
--  İşletme sahibi (panel) makale gönderir → admin onaylar → yayına girer.
--  Admin kendi yazdığı makaleyi doğrudan yayınlayabilir.
-- ================================================================

-- Onay durumu: pending | published | rejected
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status       TEXT DEFAULT 'published';
-- Yazının sahibi (panel kullanıcısının oturum e-postası)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_email TEXT;
-- Yazıyı gönderen işletme (onaylı claim'den)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS entity_id    TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS entity_type  TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS entity_name  TEXT;
-- Tahmini okuma süresi (dakika)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS okuma_dk     INTEGER;
-- Admin reddederse gerekçe — panelde yazara gösterilir
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS red_notu     TEXT;
-- Kayıt nereden geldi: 'panel' | 'admin'
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS kaynak       TEXT;
-- Ücretli iş ortağı içeriği mi? (yayında "İş Ortağı İçeriği" etiketi görünür)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sponsorlu    BOOLEAN DEFAULT false;
-- Yazarın sitesine bağlantı (iş ortağı makalelerinde gösterilir)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS website      TEXT;

-- Mevcut kayıtlar (varsa) yayında sayılsın
UPDATE blog_posts SET status = 'published' WHERE status IS NULL AND published = true;
UPDATE blog_posts SET status = 'pending'   WHERE status IS NULL AND published = false;

CREATE INDEX IF NOT EXISTS blog_posts_status_idx       ON blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_author_email_idx ON blog_posts (author_email);

NOTIFY pgrst, 'reload schema';
