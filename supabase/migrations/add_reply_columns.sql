-- Yorum yanıt kolonları — işletme sahibinin yorumlara cevap verebilmesi için
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS reply_text TEXT;
ALTER TABLE yorumlar ADD COLUMN IF NOT EXISTS reply_at   TIMESTAMPTZ;

-- PostgREST şema cache'ini yenile
NOTIFY pgrst, 'reload schema';
