/**
 * /eczaneler listesinin saf mantığı (sunucu importu YOK — test edilebilir).
 *
 * Neden JS'te: eczane sayısı ~9 bin; tüm satırların küçük bir özeti tek seferde
 * önbelleğe alınır, filtre / il-ilçe sayaçları / Türkçe sıralama / sayfalama
 * buradan yapılır, yalnız görünen 30 kaydın tam satırı veritabanından çekilir.
 *  - Veritabanı sıralaması Türkçe harfleri (Ç, İ, Ş, Ö, Ü) alfabenin sonuna atar;
 *    burada Türkçe `Intl.Collator('tr')` kullanılır.
 *  - İçe aktarılan kayıtların bir kısmında (Ankara'nın tamamı) `ilce` boş, ama ad
 *    "Aktepe Merkez Eczanesi (Ankara Keçiören)" biçiminde ilçeyi taşır →
 *    `ilceCikar()` ad içinden, il'in resmî ilçe listesiyle doğrulayarak çıkarır.
 */
import { ILCELER } from './tr-il-ilce';

/** Önbellekteki özet satır: [id, il, ilce, name, nobetci] */
export type EczaneOzet = [string, string | null, string | null, string, boolean];

export interface EczaneSatir {
  id: string; il: string | null; ilce: string | null; name: string; nobetci: boolean;
}

export const norm = (s: string | null | undefined) =>
  (s || '').toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[̀-ͯ]/g, '').trim();

const ilceCache = new Map<string, Map<string, string>>();
function ilceHaritasi(il: string): Map<string, string> {
  let m = ilceCache.get(il);
  if (!m) { m = new Map(ILCELER(il).map(x => [norm(x), x])); ilceCache.set(il, m); }
  return m;
}

// Kaynak verideki eski / kısa ilçe adları → resmî ad
const ILCE_ESANLAM: Record<string, string> = { kazan: 'kahramankazan' };

/**
 * Ad sonundaki parantezden ilçe çıkarır; yalnız il'in resmî ilçe listesinde
 * varsa döner (mahalle adı, uydurma değer → null). Desteklenen biçimler:
 *   "(Ankara Keçiören)"  "(Alaplı - Zonguldak)"  "(Keçiören)"  "(Tokat Tokat)" → Merkez
 */
export function ilceCikar(name: string, il: string | null): string | null {
  if (!il) return null;
  const m = /\(([^()]+)\)\s*$/.exec(name || '');
  if (!m) return null;
  const nil = norm(il);
  const ic = norm(m[1]);
  let kalan: string;
  if (ic.includes(' - ')) {
    const p = ic.split(' - ').map(x => x.trim()).filter(x => x && x !== nil);
    if (p.length !== 1) return null;
    kalan = p[0];
  } else {
    kalan = ic === nil ? '' : ic.startsWith(nil + ' ') ? ic.slice(nil.length + 1) : ic;
  }
  if (!kalan) return null;
  const h = ilceHaritasi(il);
  return h.get(ILCE_ESANLAM[kalan] || kalan)
    // "(Tokat Tokat)" gibi il adı tekrarı merkez ilçedir (listede "Merkez" varsa)
    || (kalan === nil ? h.get('merkez') || null : null);
}

/** Özet satırları çözer; ilçesi boş olanlara addan ilçe türetir. */
export function ozettenSatir(o: EczaneOzet): EczaneSatir {
  const [id, il, ilce, name, nobetci] = o;
  return { id, il, ilce: ilce || ilceCikar(name, il), name, nobetci };
}

// Tek Collator örneği — localeCompare'i her çağrıda yeniden kurmaktan çok daha hızlı
const TR = new Intl.Collator('tr');
const tr = (a: string | null, b: string | null) => {
  if (a === b) return 0;
  if (!a) return 1;          // il/ilçe boş olanlar sona
  if (!b) return -1;
  return TR.compare(a, b);
};

/**
 * Sıra: il → ilçe → nöbetçi önce → ad (Türkçe alfabe; il/ilçesi boş olan sonda).
 * Liste il (şehir seçiliyse ilçe) ara başlıklarıyla gruplandığı için grup
 * anahtarları en başta olmalı — yoksa aynı başlık sayfada tekrar ederdi.
 */
export function siraKarsilastir(a: EczaneSatir, b: EczaneSatir): number {
  return tr(a.il, b.il)
    || tr(a.ilce, b.ilce)
    || (a.nobetci === b.nobetci ? 0 : a.nobetci ? -1 : 1)
    || TR.compare(a.name, b.name);
}

export interface EczaneFiltre { il?: string; ilce?: string; nobetci?: boolean; q?: string }

/** Arama: her kelime ad, il veya ilçede geçmeli (Türkçe harf duyarsız). */
function aramaUyar(s: EczaneSatir, q?: string): boolean {
  if (!q) return true;
  const hedef = norm(`${s.name} ${s.il || ''} ${s.ilce || ''}`);
  return norm(q).split(/\s+/).filter(Boolean).every(k => hedef.includes(k));
}

export interface EczaneListeSonuc {
  ids: string[];                                  // bu sayfadaki kayıtlar, sıralı
  toplam: number;                                 // filtreye uyan kayıt sayısı
  iller: { value: string; label: string; count: number }[];   // il filtresi hariç diğer filtrelere göre
  ilceler: { value: string; label: string; count: number }[]; // seçili il için (yoksa boş)
  ilceById: Record<string, string>;               // addan türetilen ilçeler (kartta göstermek için)
}

export function eczaneListesi(ozet: EczaneOzet[], f: EczaneFiltre, sayfa: number, sayfaBoyu: number): EczaneListeSonuc {
  const tum = ozet.map(ozettenSatir);
  const temel = tum.filter(s => (!f.nobetci || s.nobetci) && aramaUyar(s, f.q));

  const ilSay = new Map<string, number>();
  for (const s of temel) if (s.il) ilSay.set(s.il, (ilSay.get(s.il) || 0) + 1);
  const iller = Array.from(ilSay, ([il, count]) => ({ value: il, label: il, count }))
    .sort((a, b) => TR.compare(a.label, b.label));

  const ilde = f.il ? temel.filter(s => s.il === f.il) : temel;
  const ilceSay = new Map<string, number>();
  if (f.il) for (const s of ilde) if (s.ilce) ilceSay.set(s.ilce, (ilceSay.get(s.ilce) || 0) + 1);
  const ilceler = Array.from(ilceSay, ([ilce, count]) => ({ value: ilce, label: ilce, count }))
    .sort((a, b) => TR.compare(a.label, b.label));

  const sonuc = (f.ilce ? ilde.filter(s => s.ilce === f.ilce) : ilde).sort(siraKarsilastir);
  const bas = Math.max(0, (sayfa - 1) * sayfaBoyu);
  const sayfaSatirlari = sonuc.slice(bas, bas + sayfaBoyu);

  const ilceById: Record<string, string> = {};
  for (const s of sayfaSatirlari) if (s.ilce) ilceById[s.id] = s.ilce;

  return { ids: sayfaSatirlari.map(s => s.id), toplam: sonuc.length, iller, ilceler, ilceById };
}
