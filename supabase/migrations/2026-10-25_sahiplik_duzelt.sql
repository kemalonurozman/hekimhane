-- Sahiplik tutarlılığı — DÜZELTME (2026-10-25)
-- Supabase Dashboard › SQL Editor'da çalıştırın. Tekrar çalıştırmak güvenlidir.
-- Önce 2026-10-25_sahiplik_teshis.sql ile durumu görebilirsiniz.
--
-- Kural (lib/sahiplik.ts): "sahiplenilmiş" = claim_requests'te status='approved'
-- ve yönetici OLMAYAN bir satır. İşletme tablolarındaki `claimed` bunun önbelleğidir.
-- `verified` (doktorlarda içe aktarılan "Onaylı") sahiplik değildir, dokunulmaz.

-- 1) doktorlar.claimed kolonu (2026-09-22 migration'ı çalıştırılmamış olabilir)
ALTER TABLE doktorlar ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE eczaneler ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;

-- 2) Başvuru e-postalarını küçük harfe çek: panel erişimi Auth e-postasıyla (küçük harf)
--    birebir eşleşir; "Ali@x.com" yazıp onaylanan kişi paneline giremiyordu.
UPDATE claim_requests
   SET email = lower(trim(email))
 WHERE email IS NOT NULL AND email <> lower(trim(email));

-- 3) Yanlışlıkla "itiraz" olarak kaydedilmiş başvurular → normal başvuru.
--    (Doktorlarda verified yüzünden sahipsiz profillere itiraz yazılıyordu; admin
--    panelinde bu durum hiç görünmüyordu.) Gerçek sahibi olanlar itiraz olarak kalır.
UPDATE claim_requests c
   SET status = 'pending'
 WHERE c.status = 'dispute'
   AND NOT EXISTS (
     SELECT 1 FROM claim_requests a
      WHERE a.entity_id = c.entity_id AND a.status = 'approved'
        AND NOT (btrim(coalesce(a.role, '')) ILIKE '[yönetici]%')
   );

-- 4) claimed önbelleğini onaylı sahip kayıtlarına göre yeniden hesapla (dört tablo).
--    Onaylı sahibi olan → TRUE; hiçbir onaylı sahibi olmayan → FALSE.
--    Not: FALSE adımı, elle "sahiplenildi" işaretlenmiş ama kimsenin yönetmediği
--    kayıtları da sahipsiz yapar (teşhis 5. blok listeler). Bu bilinçli: böyle bir
--    kayıtta "sahiplen" düğmesi gizleniyor, gerçek sahip itiraza zorlanıyordu.
UPDATE klinikler k SET claimed = s.var
  FROM (SELECT k2.id, EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_id = k2.id AND c.status = 'approved'
                              AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%')) AS var
          FROM klinikler k2) s
 WHERE k.id = s.id AND k.claimed IS DISTINCT FROM s.var;

UPDATE hastaneler h SET claimed = s.var
  FROM (SELECT h2.id, EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_id = h2.id AND c.status = 'approved'
                              AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%')) AS var
          FROM hastaneler h2) s
 WHERE h.id = s.id AND h.claimed IS DISTINCT FROM s.var;

UPDATE eczaneler e SET claimed = s.var
  FROM (SELECT e2.id, EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_id = e2.id AND c.status = 'approved'
                              AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%')) AS var
          FROM eczaneler e2) s
 WHERE e.id = s.id AND e.claimed IS DISTINCT FROM s.var;

UPDATE doktorlar d SET claimed = s.var
  FROM (SELECT d2.id, EXISTS (SELECT 1 FROM claim_requests c WHERE c.entity_id = d2.id AND c.status = 'approved'
                              AND NOT (btrim(coalesce(c.role, '')) ILIKE '[yönetici]%')) AS var
          FROM doktorlar d2) s
 WHERE d.id = s.id AND d.claimed IS DISTINCT FROM s.var;

-- 5) Sorgu hızı: profil ve /sahiplen her açılışta entity_id + status ile sahip arar.
CREATE INDEX IF NOT EXISTS claim_requests_entity_status_idx ON claim_requests (entity_id, status);

NOTIFY pgrst, 'reload schema';
