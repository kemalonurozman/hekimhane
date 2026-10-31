/**
 * Hekimlerin "Baktığı hastalıklar" (doktorlar.conditions) alanıyla arama.
 *
 * "lipödem ankara" → Ankara'da Lipödem'i baktığı hastalıklara eklemiş hekimler.
 * conditions bir text[] olduğu için PostgREST'te kelime başı ilike yapılamaz;
 * alanı dolduran hekim sayısı az (yalnız panelden sahibi doldurur), bu yüzden
 * hepsi küçük bir indekse alınır ve eşleşme JS'te yapılır (DDL yok).
 *
 * Kullananlar: /api/search (ana sayfa canlı arama) ve /doktorlar (?q=).
 * Önbellek etiketi 'facets' → panel kaydı (update-entity) indeksi tazeler.
 */
import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/fetch-all';
import { profilYayindaDegil } from '@/lib/uyum';
import { IL_LISTE, IL_ILCE } from '@/lib/tr-il-ilce';

/** Türkçe + aksan duyarsız küçük harf ("İ" → i, "ş" → s …). */
export const norm = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'i').toLowerCase()
  .replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
  .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();

const IL_SET = new Set(IL_LISTE.map(norm));
const ILCE_SET = new Set<string>();
for (const arr of Object.values(IL_ILCE)) for (const x of arr) ILCE_SET.add(norm(x));

/** Kelime il ya da ilçe adı mı? */
export const konumKelimesiMi = (w: string) => IL_SET.has(norm(w)) || ILCE_SET.has(norm(w));

/** Metni karşılaştırma kelimelerine böler ("Lenfödem (Fil Hastalığı)" → lenfodem, fil, hastaligi). */
const parcala = (s: string) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

export interface HastalikHekimi {
  id: string;
  ad: string | null;
  soyad: string | null;
  unvan: string | null;
  spec: string | null;
  il: string | null;
  ilce: string | null;
  slug: string | null;
  conditions: string[];
}

/** conditions'ı dolu, yayında olan hekimler (10 dk; panel kaydı 'facets' ile tazeler). */
const hastalikIndeksi = unstable_cache(async (): Promise<HastalikHekimi[]> => {
  try {
    const rows = await fetchAllRows<any>(() =>
      supabase.from('doktorlar').select('*').not('conditions', 'is', null), 20000);
    return rows
      .filter(r => Array.isArray(r.conditions) && r.conditions.length && r.slug && !profilYayindaDegil(r))
      .map(r => ({
        id: String(r.id), ad: r.ad ?? null, soyad: r.soyad ?? null, unvan: r.unvan ?? null,
        spec: r.spec ?? null, il: r.il ?? null, ilce: r.ilce ?? null, slug: r.slug,
        conditions: (r.conditions as unknown[]).map(String).filter(Boolean),
      }));
  } catch {
    return [];   // arama hastalık eşleşmesi olmadan çalışmaya devam eder
  }
}, ['hastalik-arama-indeksi'], { revalidate: 600, tags: ['facets'] });

/**
 * Aranan kelimelerin TAMAMI aynı hastalık adında kelime başından geçiyorsa eşleşir
 * ("bel ağ" → "Bel ağrısı", "fil" → "Lenfödem (Fil Hastalığı)"). İl/ilçe kelimeleri
 * hekimin il/ilçesine uygulanır; `il`/`ilce` parametreleri (konum alanı) birebir eşleşir.
 * 3 harften kısa tek kelimeli aramada sonuç verilmez (her şeyi eşleştirmesin).
 */
export async function hastalikEslesenHekimler(
  metin: string,
  opts: { il?: string; ilce?: string; limit?: number } = {},
): Promise<{ hekim: HastalikHekimi; hastalik: string }[]> {
  const kelimeler = metin.split(/\s+/).filter(Boolean).slice(0, 6);
  const konum = kelimeler.filter(konumKelimesiMi).map(norm);
  const aranan = kelimeler.filter(w => !konumKelimesiMi(w)).flatMap(parcala);
  if (!aranan.length || aranan.join('').length < 3) return [];

  const il = opts.il ? norm(opts.il) : '';
  const ilce = opts.ilce ? norm(opts.ilce) : '';
  const out: { hekim: HastalikHekimi; hastalik: string }[] = [];

  for (const h of await hastalikIndeksi()) {
    const hIl = norm(h.il || '');
    const hIlce = norm(h.ilce || '');
    if (il && hIl !== il) continue;
    if (ilce && hIlce !== ilce) continue;
    if (konum.some(k => k !== hIl && k !== hIlce)) continue;
    const hastalik = h.conditions.find(c => {
      const cw = parcala(c);
      return aranan.every(w => cw.some(x => x.startsWith(w)));
    });
    if (hastalik) out.push({ hekim: h, hastalik });
    if (opts.limit && out.length >= opts.limit) break;
  }
  return out;
}
