-- Randevu talebine işletme sahibinin ekleyebileceği özel not (hasta takibi).
-- Yalnızca panelde işletme sahibine görünür; hastaya gösterilmez.
ALTER TABLE randevu_talepleri ADD COLUMN IF NOT EXISTS sahip_notu text;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
