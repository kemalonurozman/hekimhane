-- YALNIZ OKUMA — hiçbir şeyi değiştirmez.
-- İşletmesi silinmiş ya da işletme bağı koparılmış HekimKart'ları listeler.
-- 2026-11-15'ten önce işletme silinince kart silinmiyor, bağı koparılıp yayında kalıyordu.
-- Supabase SQL Editor'da çalıştırın.

SELECT
  CASE
    WHEN k.entity_id IS NULL THEN 'bağsız (işletmesi silinmiş olabilir)'
    ELSE 'işletmesi yok'
  END                                   AS neden,
  k.slug                                AS kart_adresi,
  trim(k.ad || ' ' || k.soyad)          AS ad,
  k.entity_type                         AS tur,
  k.entity_id                           AS eski_isletme_id,
  k.updated_at::date                    AS son_guncelleme
FROM hekimkartlar k
WHERE k.entity_id IS NULL
   OR (k.entity_type = 'klinik'  AND NOT EXISTS (SELECT 1 FROM klinikler  x WHERE x.id::text = k.entity_id))
   OR (k.entity_type = 'hastane' AND NOT EXISTS (SELECT 1 FROM hastaneler x WHERE x.id::text = k.entity_id))
   OR (k.entity_type = 'doktor'  AND NOT EXISTS (SELECT 1 FROM doktorlar  x WHERE x.id::text = k.entity_id))
   OR (k.entity_type = 'eczane'  AND NOT EXISTS (SELECT 1 FROM eczaneler  x WHERE x.id::text = k.entity_id))
ORDER BY k.updated_at DESC;

-- Bağsız kartlardan hangisi kaldırma talebiyle silinen bir profile aitti?
-- (ad eşleşmesi — kesin değil, kontrol için)
SELECT k.slug, trim(k.ad || ' ' || k.soyad) AS kart_adi, p.ad AS kaldirilan_profil, p.entity_type, p.kaldirma_tarihi
FROM hekimkartlar k
JOIN kaldirilan_profiller p
  ON lower(p.ad) LIKE '%' || lower(trim(k.ad || ' ' || k.soyad)) || '%'
WHERE k.entity_id IS NULL;
