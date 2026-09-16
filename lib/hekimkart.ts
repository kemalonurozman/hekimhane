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

/* ── Web sitesi rozeti ────────────────────────────────────────────────── */

/** Diş glifi — components/Logo.tsx içindeki TOOTH ile aynı yol. */
const ROZET_DIS =
  'M20 8.2c-2.9 0-4.3-1.5-6.9-1.5-2.4 0-4.2 1.9-4.2 4.9 0 2.3.9 4.3 1.5 6.4.5 1.9.7 3.6.9 5.6.2 2 .5 4.1 1.1 5.8.5 1.4 1.2 2.4 2.2 2.4 1.1 0 1.6-1.2 1.9-2.9.3-1.7.5-3.6 1.1-5.1.2-.6.6-1.1 1.3-1.1s1.1.5 1.3 1.1c.6 1.5.8 3.4 1.1 5.1.3 1.7.8 2.9 1.9 2.9 1 0 1.7-1 2.2-2.4.6-1.7.9-3.8 1.1-5.8.2-2 .4-3.7.9-5.6.6-2.1 1.5-4.1 1.5-6.4 0-3-1.8-4.9-4.2-4.9C24.3 6.7 22.9 8.2 20 8.2Z';

export type RozetTema = 'acik' | 'koyu';

function htmlKacis(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * İşletmenin kendi web sitesinin footer'ına yapıştıracağı "Hekimhane üyesi"
 * rozeti. **Tamamen kendi içinde** HTML + inline stil + inline SVG: dış
 * script/görsel/CSS yok → WordPress, Wix, Squarespace, düz HTML fark etmez,
 * reklam engelleyiciye takılmaz, sitenin CSS'iyle çakışmaz.
 * Bağlantı HekimKart'a gider (utm ile kaynak ölçülebilir).
 */
export function rozetHtml(opts: { kartUrl: string; ad: string; tema: RozetTema }): string {
  const koyu = opts.tema === 'koyu';
  const url = `${opts.kartUrl}${opts.kartUrl.includes('?') ? '&' : '?'}utm_source=rozet&utm_medium=footer`;
  const ad = htmlKacis(opts.ad || 'İşletmemiz');

  const zemin   = koyu ? '#1B3A69' : '#FFFFFF';
  const kenar   = koyu ? 'rgba(255,255,255,.18)' : '#E5E5EA';
  const baslik  = koyu ? '#FFFFFF' : '#1B3A69';
  const ikincil = koyu ? 'rgba(255,255,255,.72)' : '#6E6E73';
  const logoZem = koyu ? '#FFFFFF' : '#1B3A69';
  const logoDis = koyu ? '#1B3A69' : '#FFFFFF';

  return [
    `<!-- Hekimhane Onaylı Üye Rozeti -->`,
    `<a href="${htmlKacis(url)}" target="_blank" rel="noopener" title="${ad} — Hekimhane dijital kartviziti" aria-label="${ad} Hekimhane onaylı üyesidir — dijital kartviziti görüntüle" style="display:inline-flex;align-items:center;gap:11px;padding:9px 16px 9px 9px;border-radius:13px;border:1px solid ${kenar};background:${zemin};text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.25;box-shadow:0 1px 3px rgba(0,0,0,.08);max-width:100%;box-sizing:border-box">`,
    `<svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" style="flex-shrink:0;display:block"><rect width="40" height="40" rx="11" fill="${logoZem}"/><path d="${ROZET_DIS}" fill="${logoDis}"/></svg>`,
    `<span style="display:flex;flex-direction:column;text-align:left;min-width:0">`,
    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#D4A843"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D4A843" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>Onaylı Üye</span>`,
    `<span style="font-size:13px;font-weight:700;color:${baslik};margin-top:1px">Bu işletme hekimhane.com.tr üyesidir</span>`,
    `<span style="font-size:11px;color:${ikincil};margin-top:1px">Dijital kartvizitimizi görüntüleyin &#8594;</span>`,
    `</span>`,
    `</a>`,
  ].join('\n');
}
