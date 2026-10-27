// ─────────────────────────────────────────────────────────────────
//  Yorum Yayınlama Kuralları — TEK KAYNAK (Eki 2026).
//
//  Üç yorum formu (profil, HekimKart, onaylı hasta bağlantısı), /api/yorum
//  rotaları, admin Yorumlar sekmesi ve /yorum-kurallari sayfası buradan okur.
//  İstemci ve sunucuda ortak — sunucu importu KOYMA.
//
//  Kural metni değişince YORUM_KURALLARI_SURUM'u güncelle: her yorum kaydına
//  gönderildiği andaki sürüm yazılır (kabulün kanıtı).
// ─────────────────────────────────────────────────────────────────

export const YORUM_KURALLARI_YOL = '/yorum-kurallari';
export const YORUM_KURALLARI_SURUM = '2026-10-26';
export const YORUM_KURALLARI_GUNCELLEME = '26 Ekim 2026';

/** Yorum metni en az / en çok karakter (sunucu ve formlar aynı sınırı kullanır). */
export const YORUM_MIN_KARAKTER = 50;
export const YORUM_MAX_KARAKTER = 2000;

/**
 * "Sizce hangi noktalar geliştirilebilir?" seçenekleri — isteğe bağlı, çoklu seçim.
 * Profilde YAYINLANMAZ: yalnız yönetici ve işletme sahibi görür (iyileştirme geri bildirimi).
 */
export const GELISTIRME_NOKTALARI = [
  { v: 'aciklama', ad: 'Sağlık sorununun anlaşılır açıklanması' },
  { v: 'iletisim', ad: 'İletişim ve ilgi' },
  { v: 'bekleme', ad: 'Bekleme süresi' },
  { v: 'randevu', ad: 'Randevu alma kolaylığı' },
  { v: 'ucret', ad: 'Ücret konusunda bilgilendirme' },
  { v: 'ortam', ad: 'Ortam ve temizlik' },
  { v: 'diger', ad: 'Diğer' },
] as const;
export type GelistirmeNoktasi = (typeof GELISTIRME_NOKTALARI)[number]['v'];

/** İstemciden gelen seçimi süz: yalnız tanımlı değerler, tekil. */
export function gelistirmeSuz(v: unknown): GelistirmeNoktasi[] {
  if (!Array.isArray(v)) return [];
  const gecerli = new Set<string>(GELISTIRME_NOKTALARI.map(g => g.v));
  return Array.from(new Set(v.map(String).filter(s => gecerli.has(s)))) as GelistirmeNoktasi[];
}

export const gelistirmeAdi = (v: string) => GELISTIRME_NOKTALARI.find(g => g.v === v)?.ad || v;

/**
 * Sunucu tarafı ortak doğrulama — kurallar onayı + metin uzunluğu.
 * Hata varsa kullanıcıya gösterilecek mesajı döner.
 */
export function yorumGirdiHatasi(body: { kurallar_onay?: unknown; text?: unknown }): string | null {
  if (body.kurallar_onay !== true) return 'Yorumunuzu göndermek için Yorum Yayınlama Kuralları\'nı kabul etmelisiniz.';
  const t = String(body.text ?? '').trim();
  if (t.length < YORUM_MIN_KARAKTER) return `Deneyiminiz en az ${YORUM_MIN_KARAKTER} karakter olmalı.`;
  return null;
}

/** Yorum kaydına eklenecek kabul alanları (2026-10-26_yorum_kurallari.sql). */
export function kurallarKabulAlanlari(gelistirme: unknown, simdi = new Date()) {
  const g = gelistirmeSuz(gelistirme);
  return {
    kurallar_onay_at: simdi.toISOString(),
    kurallar_surum: YORUM_KURALLARI_SURUM,
    ...(g.length ? { gelistirme: g } : {}),
  };
}

/** Bu migration'la gelen kolonlar — kolon yoksa insert onlarsız yeniden denenir. */
export const KURALLAR_KOLONLARI = ['kurallar_onay_at', 'kurallar_surum', 'gelistirme'] as const;
