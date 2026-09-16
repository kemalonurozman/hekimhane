/**
 * HekimKart adres (slug) kuralları — TEK KAYNAK.
 *
 * Hem panel (tarayıcı) hem `/api/kart` (sunucu) buradan okur; bu dosyaya
 * sunucuya özel import (service-role supabase vb.) KOYMA — client bundle'a
 * giriyor. Sunucu tarafı çözümleme `lib/hekimkart-sunucu.ts` içinde.
 */

/** Türkçe karakterleri sadeleştirip URL parçasına çevirir. */
export function kartSlugify(s: string): string {
  return (s || '')
    .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Adres uzunluk sınırı — çok uzun slug hem okunmaz hem QR'da sıkışır. */
export const KART_SLUG_MAX = 70;

/**
 * Kartın varsayılan adresi: kişinin **tam adı**.
 * Rastgele ek yoktur — çakışma olursa çağıran taraf sonuna ek koyar.
 */
export function kartSlugTemel(ad: string, soyad?: string): string {
  const tam = [ad, soyad].filter(Boolean).join(' ').trim();
  return kisalt(kartSlugify(tam));
}

/**
 * Kullanıcı adresi elle yazarken kullanılan sürüm: sondaki tireyi KORUR
 * (yoksa "mehmet-" yazarken tire anında siliniyor, kelimeler birleşiyordu).
 */
export function kartSlugYaz(s: string): string {
  const sonTire = /[-\s]$/.test(s || '');
  const temel = kartSlugify(s).slice(0, KART_SLUG_MAX);
  return sonTire && temel && temel.length < KART_SLUG_MAX ? `${temel}-` : temel;
}

/** Sınırı aşan adresi kelime ortasından değil, son tam kelimeden keser. */
export function kisalt(slug: string): string {
  if (slug.length <= KART_SLUG_MAX) return slug.replace(/-+$/, '');
  const kesik = slug.slice(0, KART_SLUG_MAX);
  const son = kesik.lastIndexOf('-');
  return (son > 20 ? kesik.slice(0, son) : kesik).replace(/-+$/, '');
}

/** Kartta doldurulmamış alan mı? (boş string de "doldurulmamış" sayılır) */
export function bos(v: unknown): boolean {
  return v === null || v === undefined || String(v).trim() === '';
}

/**
 * İşletme satırından kart alanlarının karşılıkları — tip farkları
 * (logo/photo/photos, adres/address, spec/specs/type) burada toplanır.
 *
 * İki yerde kullanılır: kart sayfası boş alanları bununla tamamlar,
 * `/api/kart` kaydederken profildekiyle **aynı** olan değeri boş bırakır
 * (böylece profil güncellenince kart da kendiliğinden güncellenir).
 */
export function entityKartAlanlari(r: Record<string, any> | null | undefined): Record<string, any> {
  if (!r) return {};
  const foto = r.photo_url || r.photo || r.logo || (Array.isArray(r.photos) ? r.photos[0] : null) || null;
  return {
    photo_url:     typeof foto === 'string' && foto.startsWith('preset:') ? null : foto,
    tel:           r.tel || null,
    website_url:   r.website || null,
    maps_url:      r.maps_url || null,
    instagram_url: r.instagram_url || null,
    facebook_url:  r.facebook_url || null,
    linkedin_url:  r.linkedin_url || null,
    bio:           r.bio || null,
    spec:          r.spec || (Array.isArray(r.specs) ? r.specs[0] : null) || r.type || null,
    clinic_name:   r.clinic_name || r.name || null,
    il:            r.il || null,
    ilce:          r.ilce || null,
  };
}
