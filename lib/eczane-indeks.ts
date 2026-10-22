/**
 * Tüm eczanelerin küçük özeti — /eczaneler listesi ve /api/eczane-ara önerileri
 * ortak kullanır (yalnız sunucu). Üç katman:
 *   1) Süreç belleği (60 sn): aynı sunucu örneğinde ardışık tıklamalar anında.
 *   2) Next veri önbelleği (10 dk, etiket `eczane-indeks` + `facets`): örnekler arası.
 *   3) Veritabanı: `fetchAllRows` ile paralel sayfalar (~2 tur).
 * Ekleme / silme / düzenleme sonrası `revalidateTag('facets')` 2. katmanı tazeler;
 * 1. katman en geç 60 sn'de kendiliğinden yenilenir.
 */
import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/fetch-all';
import { ilceCikar, type EczaneOzet } from '@/lib/eczane-liste';

const onbellekli = unstable_cache(async (): Promise<EczaneOzet[]> => {
  const rows = await fetchAllRows<{ id: string; il: string | null; ilce: string | null; name: string | null; nobetci: boolean | null; slug: string | null }>(
    () => supabase.from('eczaneler').select('id,il,ilce,name,nobetci,slug'));
  // İlçesi boş kayıtlarda ilçe addan bir kez, önbelleğe alırken türetilir
  return rows.map(r => [r.id, r.il, r.ilce || ilceCikar(r.name || '', r.il), r.name || '', !!r.nobetci, r.slug]);
}, ['eczane-indeks-v2'], { revalidate: 600, tags: ['eczane-indeks', 'facets'] });

const BELLEK_MS = 60_000;
let bellek: { t: number; veri: EczaneOzet[] } | null = null;
let yukleniyor: Promise<EczaneOzet[]> | null = null;

export async function eczaneIndeksi(): Promise<EczaneOzet[]> {
  if (bellek && Date.now() - bellek.t < BELLEK_MS) return bellek.veri;
  // Aynı anda gelen istekler tek yüklemeyi paylaşsın
  if (!yukleniyor) {
    yukleniyor = onbellekli()
      .then(veri => { if (veri.length) bellek = { t: Date.now(), veri }; return veri; })
      .finally(() => { yukleniyor = null; });
  }
  return yukleniyor;
}
