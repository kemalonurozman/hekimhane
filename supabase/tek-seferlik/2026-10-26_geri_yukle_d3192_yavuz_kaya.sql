-- ================================================================
--  Geri yükleme: Uzm. Dt. Yavuz Kaya (d3192) — 2026-10-26
--  Kaldırma onay bağlantısı tıklandığı için kayıt kalıcı silinmişti
--  (eski akış: onay = silme). Bu satır, silinmeden önce kaydedilen
--  sayfa verisinden ve import-devlet-dis.js kolon düzeninden kuruldu.
--  Aynı id/slug ile geri gelir → eski bağlantı ve Google kaydı çalışır.
--  Yorumlar BİLEREK geri yüklenmez (kaldırılması istenen iki yorum).
--  Supabase SQL Editor'da çalıştırın.
-- ================================================================

-- 1) Kaldırma talebi hâlâ kayıtlı mı? (kimin istediğini görmek için — yalnız okuma)
SELECT id, created_at, ad_soyad, talep_eden, email, tel, aciklama, status, confirmed_at, ip
FROM profil_kaldirma_talepleri
WHERE entity_type = 'doktor' AND entity_id = 'd3192'
ORDER BY created_at DESC;

-- 2) Doktor kaydını geri ekle (varsa dokunmaz)
INSERT INTO doktorlar (id, ad, soyad, unvan, spec, il, ilce, clinic_name, tel, tags, verified, rat, rev, fee, slug)
VALUES ('d3192', 'Yavuz', 'Kaya', 'Uzm. Dt.', 'Periodontoloji (Diş Eti)', 'İstanbul', 'Kağıthane',
        'T.C. Sağlık Bakanlığı İstanbul Okmeydanı Ağız ve Diş Sağlığı Hastanesi',
        '(0212) 320 10 43', ARRAY['devlet-dis-hastanesi', 'Periodontoloji (Diş Eti)'],
        false, 0, 0, 0, 'yavuz-kaya-istanbul')
ON CONFLICT (id) DO NOTHING;

-- 3) "Kaldırılanlar listesi"nden çıkar — yoksa içe aktarma betikleri yeniden eklemez
DELETE FROM kaldirilan_profiller WHERE entity_type = 'doktor' AND eski_entity_id = 'd3192';

-- 4) Talebi geri yüklendi olarak işaretle (2026-10-26_kaldirma_karari.sql çalıştıysa)
UPDATE profil_kaldirma_talepleri
SET status = 'reddedildi', karar_notu = 'Kayıt elle geri yüklendi (eski akışta onay bağlantısı kaydı silmişti).', karar_at = now()
WHERE entity_type = 'doktor' AND entity_id = 'd3192';

-- 5) Kontrol
SELECT id, unvan, ad, soyad, slug, clinic_name FROM doktorlar WHERE id = 'd3192';
