-- Ücretsiz Pro tanımı (Eki 2026) — veri değişikliği, şema değişikliği değil.
-- İki profile Stripe aboneliği olmadan Pro açılır ("elle açılmış premium").
-- Admin panel → Premium Üyeler listesinde görünür; kapatmak için oradaki "Premium'u Kapat".
-- Aynı iş admin panelden de yapılabilir: Doktorlar/Klinikler → Kaydı Düzenle → Premium Hesap = true.

UPDATE doktorlar
   SET premium = true, updated_at = now()
 WHERE slug = 'fiziksel-tip-ve-rehabilitasyon-osman-alper-arslan-ankara';

UPDATE klinikler
   SET premium = true, updated_at = now()
 WHERE slug = 'ankara-cankaya-ozel-klinik-99-agiz-ve-dis-sagligi-poliklinigi';

-- Kontrol: iki satır da premium = true dönmeli
SELECT 'doktor' AS tur, id, ad || ' ' || soyad AS ad, premium
  FROM doktorlar WHERE slug = 'fiziksel-tip-ve-rehabilitasyon-osman-alper-arslan-ankara'
UNION ALL
SELECT 'klinik', id, name, premium
  FROM klinikler WHERE slug = 'ankara-cankaya-ozel-klinik-99-agiz-ve-dis-sagligi-poliklinigi';
