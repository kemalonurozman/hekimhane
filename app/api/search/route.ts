/**
 * GET /api/search?q=...
 *
 * Doktorlar, hastaneler, klinikler ve eczaneler üzerinde eş zamanlı arama yapar.
 * Hero bileşenindeki canlı autocomplete için kullanılır.
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { IL_LISTE, IL_ILCE } from '@/lib/tr-il-ilce';

// Konum tespiti için normalize (Türkçe + aksan-duyarsız)
const norm = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'i').toLowerCase()
  .replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
  .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();

const IL_SET = new Set(IL_LISTE.map(norm));
const ILCE_SET = new Set<string>();
for (const arr of Object.values(IL_ILCE)) for (const x of arr) ILCE_SET.add(norm(x));

/** "hasan antalya" → { name: 'hasan', loc: 'antalya' } (konum kelimesi tanınırsa) */
function parseQuery(q: string): { name: string; loc: string } {
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length < 2) return { name: q, loc: '' };
  const locWords = words.filter(w => IL_SET.has(norm(w)) || ILCE_SET.has(norm(w)));
  // Konum kelimesi var ama tümü konum değilse (ad kısmı da kalmalı) → ayır
  if (locWords.length > 0 && locWords.length < words.length) {
    const locSet = new Set(locWords);
    return { name: words.filter(w => !locSet.has(w)).join(' '), loc: locWords.join(' ') };
  }
  return { name: q, loc: '' };
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

const BOŞ: SearchResults = {
  doktorlar: [],
  hastaneler: [],
  klinikler: [],
  eczaneler: [],
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return Response.json(BOŞ);
  }

  const LIMIT = 5;
  const like = `%${q}%`;

  // scope=dental → sadece diş klinikleri ve diş hekimleri (ana sayfa diş odaklı arama)
  const dental = req.nextUrl.searchParams.get('scope') === 'dental';

  // İsim + konum ayrıştır: "hasan antalya" → ad=hasan, konum=antalya
  const { name, loc } = parseQuery(q);
  const nameLike = `%${name}%`;
  const locLike  = `%${loc}%`;
  const hasLoc   = loc.length > 0;

  // ── Doktor sorgusu ──
  let doktorQuery: any = supabase.from('doktorlar').select('ad, soyad, spec, il, ilce, slug');
  if (dental) doktorQuery = doktorQuery.ilike('spec', '%diş%');
  if (hasLoc) {
    // (ad VEYA soyad ~ isim) VE (il VEYA ilçe ~ konum)
    doktorQuery = doktorQuery
      .or(`ad.ilike.${nameLike},soyad.ilike.${nameLike}`)
      .or(`il.ilike.${locLike},ilce.ilike.${locLike}`);
  } else {
    doktorQuery = dental
      ? doktorQuery.or(`ad.ilike.${like},soyad.ilike.${like},il.ilike.${like}`)
      : doktorQuery.or(`ad.ilike.${like},soyad.ilike.${like},spec.ilike.${like},il.ilike.${like}`);
  }
  doktorQuery = doktorQuery.limit(LIMIT);

  // ── Klinik sorgusu ── (specs text[] olduğu için ada + konuma göre)
  let klinikQuery: any = supabase.from('klinikler').select('name, il, ilce, slug');
  klinikQuery = hasLoc
    ? klinikQuery.ilike('name', nameLike).or(`il.ilike.${locLike},ilce.ilike.${locLike}`)
    : klinikQuery.or(`name.ilike.${like},il.ilike.${like}`);
  klinikQuery = klinikQuery.limit(LIMIT);

  // ── Hastane sorgusu ──
  let hastaneQuery: any = dental
    ? Promise.resolve({ data: [] as never[] })
    : (() => {
        let q2: any = supabase.from('hastaneler').select('name, type, il, ilce, slug');
        q2 = hasLoc
          ? q2.ilike('name', nameLike).or(`il.ilike.${locLike},ilce.ilike.${locLike}`)
          : q2.or(`name.ilike.${like},il.ilike.${like},type.ilike.${like}`);
        return q2.limit(LIMIT);
      })();

  // ── Eczane sorgusu ──
  let eczaneQuery: any = dental
    ? Promise.resolve({ data: [] as never[] })
    : (() => {
        let q2: any = supabase.from('eczaneler').select('name, il, ilce, slug');
        q2 = hasLoc
          ? q2.ilike('name', nameLike).or(`il.ilike.${locLike},ilce.ilike.${locLike}`)
          : q2.or(`name.ilike.${like},il.ilike.${like}`);
        return q2.limit(LIMIT);
      })();

  const [doktorRes, hastaneRes, klinikRes, eczaneRes] = await Promise.allSettled([
    doktorQuery,
    hastaneQuery,
    klinikQuery,
    eczaneQuery,
  ]);

  // ── Doktorlar ─────────────────────────────────────────────────────────────
  const doktorlar: SearchItem[] =
    doktorRes.status === 'fulfilled' && doktorRes.value.data
      ? doktorRes.value.data.map((d: { ad: string; soyad: string; spec?: string; il?: string; ilce?: string; slug?: string }) => ({
          ad: `Dr. ${d.ad} ${d.soyad}`,
          alt: [d.spec, d.il, d.ilce].filter(Boolean).join(' · '),
          href: d.slug ? `/doktorlar/${d.slug}` : '/doktorlar',
        }))
      : [];

  // ── Hastaneler ────────────────────────────────────────────────────────────
  const hastaneler: SearchItem[] =
    hastaneRes.status === 'fulfilled' && hastaneRes.value.data
      ? hastaneRes.value.data.map((h: { name: string; type?: string; il?: string; ilce?: string; slug?: string }) => {
          const il  = h.il?.toLowerCase() ?? '';
          const ilce = h.ilce?.toLowerCase() ?? '';
          const href =
            h.slug && il && ilce
              ? `/hastaneler/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}/${h.slug}`
              : '/hastaneler';
          return {
            ad: h.name,
            alt: [h.type, h.il, h.ilce].filter(Boolean).join(' · '),
            href,
          };
        })
      : [];

  // ── Klinikler ─────────────────────────────────────────────────────────────
  const klinikler: SearchItem[] =
    klinikRes.status === 'fulfilled' && klinikRes.value.data
      ? klinikRes.value.data.map((k: { name: string; il?: string; ilce?: string; slug?: string }) => {
          const il  = k.il?.toLowerCase() ?? '';
          const ilce = k.ilce?.toLowerCase() ?? '';
          const href =
            k.slug && il && ilce
              ? `/klinikler/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}/${k.slug}`
              : '/klinikler';
          return {
            ad: k.name,
            alt: [k.il, k.ilce].filter(Boolean).join(' · '),
            href,
          };
        })
      : [];

  // ── Eczaneler ─────────────────────────────────────────────────────────────
  const eczaneler: SearchItem[] =
    eczaneRes.status === 'fulfilled' && eczaneRes.value.data
      ? eczaneRes.value.data.map((e: { name: string; il?: string; ilce?: string; slug?: string }) => {
          const il  = e.il?.toLowerCase() ?? '';
          const ilce = e.ilce?.toLowerCase() ?? '';
          const href =
            e.slug && il && ilce
              ? `/eczaneler/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}/${e.slug}`
              : '/eczaneler';
          return {
            ad: e.name,
            alt: [e.il, e.ilce].filter(Boolean).join(' · '),
            href,
          };
        })
      : [];

  return Response.json({ doktorlar, hastaneler, klinikler, eczaneler } satisfies SearchResults);
}
