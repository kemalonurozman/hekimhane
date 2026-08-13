// ─────────────────────────────────────────────────────────────────
//  AKTİF diş tedavi ücret tarifesi — sitedeki TÜM fiyatların TEK kaynağı.
//
//  Türk Dişhekimleri Birliği (TDB) her yıl yeni bir taban tarife yayımlar.
//  Yeni yıl geldiğinde SADECE bu dosya değişir:
//    1) lib/ucret-tarifesi-2027.ts eklenir (yeni yıl verisi),
//    2) aşağıdaki import satırı ve AKTIF_TARIFE_YILI 2027 yapılır.
//  Site genelindeki tüm fiyatlar VE yıl etiketleri otomatik güncellenir —
//  başka hiçbir sayfaya dokunmak gerekmez.
// ─────────────────────────────────────────────────────────────────
import { UCRET_TARIFESI_2026, TARIFE_ITEM_SAYISI } from './ucret-tarifesi-2026';
import type { TarifeItem, TarifeKategori } from './ucret-tarifesi-2026';

export type { TarifeItem, TarifeKategori } from './ucret-tarifesi-2026';

/** Sitede o an gösterilen tarifenin yılı (başlıklar, SEO ve etiketler bunu kullanır). */
export const AKTIF_TARIFE_YILI = 2026;

/** Sitede o an gösterilen tarife verisi (tüm kategoriler + kalemler). */
export const AKTIF_TARIFE: TarifeKategori[] = UCRET_TARIFESI_2026;

/** Aktif tarifedeki toplam işlem (kalem) sayısı. */
export const AKTIF_TARIFE_ITEM_SAYISI = TARIFE_ITEM_SAYISI;

// Kod → kalem hızlı erişim haritası (tek seferde kurulur).
const _MAP: Record<string, TarifeItem> = (() => {
  const m: Record<string, TarifeItem> = {};
  for (const kat of AKTIF_TARIFE) for (const it of kat.items) m[it.kod] = it;
  return m;
})();

/** Tek bir tarife kalemini koduyla getirir (ör. '3-2'). */
export function tarifeByKod(kod: string): TarifeItem | undefined {
  return _MAP[kod];
}

/** Birden çok kalemi kod listesiyle getirir; bulunamayanlar atlanır. */
export function tarifeByKodlar(kodlar: string[]): TarifeItem[] {
  return kodlar.map(k => _MAP[k]).filter(Boolean) as TarifeItem[];
}
