-- Klinik ve hastane işletmelerine "sorumlu hekim" (ad soyad) alanı.
-- İşletme adından ayrı; işletme sahibi hekimin kendi adını girebilmesi için.
-- (Eczanelerde bu görevi mevcut "pharmacist" / Eczacı Adı kolonu görür.)

ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS sorumlu_hekim text;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS sorumlu_hekim text;

-- PostgREST şema önbelleğini yenile (yoksa "column not found" hatası alınır)
NOTIFY pgrst, 'reload schema';
