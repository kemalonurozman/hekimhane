-- Sahiplik tutarlılığı — TEŞHİS (yalnız okuma, hiçbir şeyi değiştirmez)
-- Supabase Dashboard › SQL Editor'da çalıştırın. Her blok ayrı bir sonuç tablosu verir.
-- Düzeltme için: 2026-10-25_sahiplik_duzelt.sql
-- Kural (lib/sahiplik.ts): sahip = status='approved' ve role '[yönetici]' ile BAŞLAMAYAN satır.

-- 0) doktorlar.claimed kolonu var mı? (yoksa 2026-10-25_sahiplik_duzelt.sql ekler)
SELECT table_name, column_name
  FROM information_schema.columns
 WHERE table_schema = 'public' AND column_name = 'claimed'
   AND table_name IN ('klinikler','hastaneler','doktorlar','eczaneler')
 ORDER BY table_name;

-- 1) Başvuruların genel durumu (tür × durum)
SELECT entity_type, status, count(*) AS adet
  FROM claim_requests
 GROUP BY 1, 2
 ORDER BY 1, 2;

-- 2) Doktorlarda "Onaylı" (verified) ama onaylı sahibi olmayanlar.
--    Eski /sahiplen bunlara "zaten sahiplenilmiş" diyordu.
SELECT count(*) FILTER (WHERE d.verified) AS verified_doktor,
       count(*) FILTER (WHERE d.verified AND NOT EXISTS (
         SELECT 1 FROM claim_requests c
          WHERE c.entity_id = d.id AND c.status = 'approved'
            AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%')
       )) AS verified_ama_sahipsiz,
       count(*) AS toplam_doktor
  FROM doktorlar d;

-- 3) Yanlışlıkla "itiraz" olarak kaydedilmiş başvurular:
--    status = 'dispute' ama işletmenin onaylı sahibi yok → aslında normal sahiplenme başvurusu.
SELECT c.id, c.entity_type, c.entity_id, c.entity_name, c.claimant_name, c.email, c.created_at
  FROM claim_requests c
 WHERE c.status = 'dispute'
   AND NOT EXISTS (
     SELECT 1 FROM claim_requests a
      WHERE a.entity_id = c.entity_id AND a.status = 'approved'
        AND NOT (btrim(coalesce(a.role, '')) ILIKE '[yönetici]%')
   )
 ORDER BY c.created_at DESC;

-- 4) Onaylı sahibi olduğu hâlde claimed = false olan işletmeler
--    (profil "Sahiplenilmemiş" gösterir, liste rozetleri ve ana sayfa vitrini kaçırır).
--    Not: doktorlar.claimed kolonu yoksa bu bloktaki doktor satırı hata verir; önce 0) sonucuna bakın.
SELECT 'klinik' AS tur, k.id, k.name AS ad FROM klinikler k
 WHERE k.claimed IS DISTINCT FROM TRUE
   AND EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'klinik' AND c.entity_id = k.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'))
UNION ALL
SELECT 'hastane', h.id, h.name FROM hastaneler h
 WHERE h.claimed IS DISTINCT FROM TRUE
   AND EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'hastane' AND c.entity_id = h.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'))
UNION ALL
SELECT 'eczane', e.id, e.name FROM eczaneler e
 WHERE e.claimed IS DISTINCT FROM TRUE
   AND EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'eczane' AND c.entity_id = e.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'))
UNION ALL
SELECT 'doktor', d.id, trim(coalesce(d.ad,'') || ' ' || coalesce(d.soyad,'')) FROM doktorlar d
 WHERE d.claimed IS DISTINCT FROM TRUE
   AND EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'doktor' AND c.entity_id = d.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'));

-- 5) claimed = true ama hiçbir onaylı erişimi olmayan işletmeler (kimse yönetemiyor).
--    Otomatik düzeltilmez: elle işaretlenmiş olabilir. Listeyi gözden geçirin.
SELECT 'klinik' AS tur, k.id, k.name AS ad FROM klinikler k
 WHERE k.claimed = TRUE
   AND NOT EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'klinik' AND c.entity_id = k.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'))
UNION ALL
SELECT 'hastane', h.id, h.name FROM hastaneler h
 WHERE h.claimed = TRUE
   AND NOT EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'hastane' AND c.entity_id = h.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'))
UNION ALL
SELECT 'eczane', e.id, e.name FROM eczaneler e
 WHERE e.claimed = TRUE
   AND NOT EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'eczane' AND c.entity_id = e.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'))
UNION ALL
SELECT 'doktor', d.id, trim(coalesce(d.ad,'') || ' ' || coalesce(d.soyad,'')) FROM doktorlar d
 WHERE d.claimed = TRUE
   AND NOT EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_type = 'doktor' AND c.entity_id = d.id AND c.status = 'approved' AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%'));

-- 6) Şikâyet eden doktor (d463) — kayıt ve başvuruları
SELECT id, ad, soyad, unvan, spec, il, ilce, clinic_name, tel, verified, claimed, premium
  FROM doktorlar WHERE id = 'd463';
SELECT id, status, email, claimant_name, role, created_at
  FROM claim_requests WHERE entity_type = 'doktor' AND entity_id = 'd463'
 ORDER BY created_at;
