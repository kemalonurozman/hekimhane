-- Kurum türü — diş kliniği/hekimi için Özel / Devlet / Üniversite sınıflandırması.
-- Klinikler doğası gereği "özel"; devlet/üniversite diş hekimleri doktorlar tablosunda
-- etiketle (devlet-dis-hastanesi / universite-dis-hastanesi) ayrışır. Bu kolon,
-- kliniklerin de elle devlet/üniversite işaretlenebilmesi ve panelden seçilebilmesi için.
ALTER TABLE klinikler ADD COLUMN IF NOT EXISTS kurum text DEFAULT 'ozel';

-- Mevcut kayıtları sınıflandır (type alanındaki ipucuna göre); kalan hepsi 'ozel'.
UPDATE klinikler SET kurum = 'devlet'     WHERE lower(coalesce(type,'')) LIKE '%devlet%';
UPDATE klinikler SET kurum = 'universite' WHERE lower(coalesce(type,'')) LIKE '%niversite%';
UPDATE klinikler SET kurum = 'ozel'       WHERE kurum IS NULL OR kurum = '';

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
