/**
 * Doktor panelindeki "Baktığınız hastalıklar" seçicisinin seçenek listesi (client + server ortak).
 *
 * Kaynaklar:
 *  - HASTALIK_YAZILARI — blogda yazısı olan konular (scripts/hastalik-secenekleri-uret.mjs üretir)
 *  - KONU_HAVUZU       — henüz yazılmamış ~260 hastalık/şikâyet başlığı (branşıyla birlikte)
 * Hekim seçer; seçimler `doktorlar.conditions` (text[]) kolonuna kısa ad olarak yazılır, SQL gerekmez.
 * Listede olmayan konu serbest yazılır; profilde etiket olarak görünür.
 */
import { HASTALIK_YAZILARI } from './hastalik-yazilari';
import { KONU_HAVUZU } from './blog-konu-havuzu';
import { TAKVIM } from './blog-takvim';

export interface HastalikSecenegi {
  ad: string;
  kategori: string;
  brans: string;
  /** Blogda yazısı varsa slug (yayında olup olmadığı `hastalikBlogSlug` ile bakılır) */
  slug?: string;
}

/** "Hemoroid (Basur)" ~ "hemoroid basur" — büyük/küçük harf, aksan ve noktalama farkını yok sayar */
export function hastalikAnahtari(s: string): string {
  return String(s || '').toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function secenekleriKur(): HastalikSecenegi[] {
  const goruldu = new Set<string>();
  const liste: HastalikSecenegi[] = [];
  const ekle = (o: HastalikSecenegi) => {
    const k = hastalikAnahtari(o.ad);
    if (!k || goruldu.has(k)) return;
    goruldu.add(k);
    liste.push(o);
  };
  for (const y of HASTALIK_YAZILARI) ekle({ ad: y.ad, kategori: y.kategori, brans: y.brans, slug: y.slug });
  for (const k of KONU_HAVUZU) ekle({ ad: k.baslik, kategori: k.kategori, brans: k.brans });
  return liste.sort((a, b) => a.ad.localeCompare(b.ad, 'tr-TR'));
}

export const HASTALIK_SECENEKLERI: HastalikSecenegi[] = secenekleriKur();

const SECENEK_ANAHTARI = new Map(HASTALIK_SECENEKLERI.map(o => [hastalikAnahtari(o.ad), o]));

export function hastalikSecenegi(ad: string): HastalikSecenegi | undefined {
  return SECENEK_ANAHTARI.get(hastalikAnahtari(ad));
}

/** Seçilen hastalığın blog yazısı yayındaysa adresi (/blog/slug); yazı yok ya da henüz yayında değilse null. */
export function hastalikBlogSlug(ad: string, simdi: number = Date.now()): string | null {
  const o = hastalikSecenegi(ad);
  if (!o?.slug) return null;
  const t = Date.parse(TAKVIM[o.slug] || '');
  if (Number.isNaN(t) || t > simdi) return null;
  return `/blog/${o.slug}`;
}

/** Hekimin uzmanlığına (doktorlar.spec) uyan seçenekler: "Kardiyoloji" ↔ "Kardiyoloji", "Uzm. ... Nöroloji" gibi serbest yazımlar da eşleşir. */
export function bransaUygunHastaliklar(spec: string | null | undefined): HastalikSecenegi[] {
  const s = hastalikAnahtari(spec || '');
  if (!s) return [];
  return HASTALIK_SECENEKLERI.filter(o => {
    const b = hastalikAnahtari(o.brans);
    return b === s || s.includes(b) || b.includes(s);
  });
}

/** Aramada: Türkçe harf farkını (ı/i, ş/s…) yok sayan basit eşleşme */
function sade(s: string): string {
  return hastalikAnahtari(s).replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
}
export function hastalikAra(sorgu: string, limit = 40): HastalikSecenegi[] {
  const q = sade(sorgu);
  if (!q) return [];
  const bas: HastalikSecenegi[] = []; const ic: HastalikSecenegi[] = [];
  for (const o of HASTALIK_SECENEKLERI) {
    const a = sade(o.ad);
    if (a.startsWith(q)) bas.push(o);
    else if (a.includes(q) || sade(o.kategori).includes(q)) ic.push(o);
  }
  return [...bas, ...ic].slice(0, limit);
}

/** Seçenekleri kategoriye göre gruplar (alfabetik) — "Tüm konular" görünümü için */
export function hastalikKategorileri(): { kategori: string; ogeler: HastalikSecenegi[] }[] {
  const m = new Map<string, HastalikSecenegi[]>();
  for (const o of HASTALIK_SECENEKLERI) (m.get(o.kategori) || m.set(o.kategori, []).get(o.kategori)!).push(o);
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'tr-TR')).map(([kategori, ogeler]) => ({ kategori, ogeler }));
}
