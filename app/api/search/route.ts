/**
 * GET /api/search?q=...
 *
 * Klinikler, doktorlar, hastaneler ve eczaneler üzerinde eş zamanlı arama yapar.
 * Ana sayfa (hero) arama kutusundaki canlı öneri listesi için kullanılır.
 * `scope=dental` → yalnız diş klinikleri ve diş hekimleri (eski davranış).
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { urlParca } from '@/lib/entity-link';
import { IL_LISTE, IL_ILCE } from '@/lib/tr-il-ilce';

// Konum tespiti için normalize (Türkçe + aksan-duyarsız)
const norm = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'i').toLowerCase()
  .replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
  .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();

const IL_SET = new Set(IL_LISTE.map(norm));
const ILCE_SET = new Set<string>();
for (const arr of Object.values(IL_ILCE)) for (const x of arr) ILCE_SET.add(norm(x));

// PostgREST .or() sözdizimini bozan karakterler ayıklanır (, ( ) % * " ' \)
function kelimeler(q: string): string[] {
  return q.replace(/[,()%*\\"']/g, ' ').split(/\s+/).filter(Boolean).slice(0, 5);
}

/** "aktepe keçiören" → ad: [aktepe], konum: [keçiören]. Yalnız konum yazılırsa ad boş kalır. */
function ayristir(q: string): { ad: string[]; konum: string[] } {
  const ws = kelimeler(q);
  const konum = ws.filter(w => IL_SET.has(norm(w)) || ILCE_SET.has(norm(w)));
  if (!konum.length) return { ad: ws, konum: [] };
  const kSet = new Set(konum);
  return { ad: ws.filter(w => !kSet.has(w)), konum };
}

// Kelime BAŞI eşleşmesi: "tepe" yazınca "Sancaktepe" değil, bir kelimesi "tepe" ile başlayanlar gelir.
// "(Ankara Keçiören)" ve "Dt.Ahmet" gibi bitişik yazımlar için "(w" ve ".w" de sayılır.
// "(" PostgREST or() gruplamasıyla karışmasın diye o desen çift tırnak içinde.
const basla = (kolon: string, w: string) =>
  `${kolon}.ilike.${w}%,${kolon}.ilike.% ${w}%,${kolon}.ilike.%.${w}%,${kolon}.ilike."%(${w}%"`;

/**
 * Her ad kelimesi (VE) en az bir kolonda kelime başından eşleşmeli.
 * Konum kelimeleri il/ilçede; `konumAdda` ise addaki "(Ankara Keçiören)" gibi yazımda da
 * (içe aktarılan eczanelerin çoğunda ilce boş, ilçe yalnız adda yazılı).
 */
function filtrele(q: any, adKolonlari: string[], ad: string[], konum: string[], ek?: (w: string) => string, konumAdda = false) {
  for (const w of ad) {
    const parca = adKolonlari.map(k => basla(k, w)).join(',');
    const e = ek?.(w);
    q = q.or(e ? `${parca},${e}` : parca);
  }
  for (const w of konum) {
    const adda = konumAdda ? ',' + adKolonlari.map(k => basla(k, w)).join(',') : '';
    q = q.or(`il.ilike.${w}%,ilce.ilike.${w}%${adda}`);
  }
  return q;
}

export interface SearchItem {
  ad: string;
  alt: string;
  href: string;
}

export interface SearchResults {
  doktorlar: SearchItem[];
  hastaneler: SearchItem[];
  klinikler: SearchItem[];
  eczaneler: SearchItem[];
}

const BOŞ: SearchResults = { doktorlar: [], hastaneler: [], klinikler: [], eczaneler: [] };

const detayUrl = (kok: string, r: { il?: string | null; ilce?: string | null; slug?: string | null }) =>
  r.slug ? `/${kok}/${urlParca(r.il || 'turkiye')}/${urlParca(r.ilce || 'merkez')}/${r.slug}` : `/${kok}`;

const satirlar = (r: PromiseSettledResult<any>): any[] =>
  r.status === 'fulfilled' && Array.isArray(r.value?.data) ? r.value.data : [];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return Response.json(BOŞ);

  const LIMIT = 5;
  const dental = req.nextUrl.searchParams.get('scope') === 'dental';
  const { ad, konum } = ayristir(q);
  if (!ad.length && !konum.length) return Response.json(BOŞ);

  // ── Doktorlar ── (branş 3+ harfte aranır — tek harf her şeyi eşleştirmesin)
  let doktorQuery: any = supabase.from('doktorlar').select('ad, soyad, unvan, spec, il, ilce, slug');
  if (dental) doktorQuery = doktorQuery.ilike('spec', '%diş%');
  doktorQuery = filtrele(doktorQuery, ['ad', 'soyad'], ad, konum, w => (w.length >= 3 ? `spec.ilike.%${w}%` : ''))
    .limit(LIMIT);

  // ── Klinikler ──
  const klinikQuery: any = filtrele(supabase.from('klinikler').select('name, il, ilce, slug'), ['name'], ad, konum, undefined, true)
    .limit(LIMIT);

  // ── Hastaneler ──
  const hastaneQuery: any = dental
    ? Promise.resolve({ data: [] })
    : filtrele(supabase.from('hastaneler').select('name, type, il, ilce, slug'), ['name'], ad, konum, undefined, true).limit(LIMIT);

  // ── Eczaneler ──
  const eczaneQuery: any = dental
    ? Promise.resolve({ data: [] })
    : filtrele(supabase.from('eczaneler').select('name, il, ilce, slug, nobetci'), ['name'], ad, konum, undefined, true).limit(LIMIT);

  const [doktorRes, hastaneRes, klinikRes, eczaneRes] = await Promise.allSettled([
    doktorQuery, hastaneQuery, klinikQuery, eczaneQuery,
  ]);

  const doktorlar: SearchItem[] = satirlar(doktorRes).map(d => {
    const isim = `${d.ad || ''} ${d.soyad || ''}`.trim();
    // Unvan kayıtlıysa ve adın başında zaten yoksa eklenir (fizyoterapist vb. için "Dr." uydurulmaz)
    const unvan = d.unvan && !isim.toLocaleLowerCase('tr').startsWith(String(d.unvan).toLocaleLowerCase('tr'))
      ? `${d.unvan} ` : '';
    return {
      ad: `${unvan}${isim}`,
      alt: [d.spec, d.il, d.ilce].filter(Boolean).join(' · '),
      href: d.slug ? `/doktorlar/${d.slug}` : '/doktorlar',
    };
  });

  const hastaneler: SearchItem[] = satirlar(hastaneRes).map(h => ({
    ad: h.name,
    alt: [h.type, h.il, h.ilce].filter(Boolean).join(' · '),
    href: detayUrl('hastaneler', h),
  }));

  const klinikler: SearchItem[] = satirlar(klinikRes).map(k => ({
    ad: k.name,
    alt: [k.il, k.ilce].filter(Boolean).join(' · '),
    href: detayUrl('klinikler', k),
  }));

  // Eczane detay rotası /eczaneler/<slug> (il/ilçe parçası yok)
  const eczaneler: SearchItem[] = satirlar(eczaneRes).map(e => ({
    ad: e.name,
    alt: [e.nobetci ? 'Nöbetçi' : '', e.il, e.ilce].filter(Boolean).join(' · '),
    href: e.slug ? `/eczaneler/${e.slug}` : '/eczaneler',
  }));

  return Response.json({ doktorlar, hastaneler, klinikler, eczaneler } satisfies SearchResults);
}
