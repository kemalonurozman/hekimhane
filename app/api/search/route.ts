/**
 * GET /api/search?q=...
 *
 * Doktorlar, hastaneler, klinikler ve eczaneler üzerinde eş zamanlı arama yapar.
 * Hero bileşenindeki canlı autocomplete için kullanılır.
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

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

  const [doktorRes, hastaneRes, klinikRes, eczaneRes] = await Promise.allSettled([
    supabase
      .from('doktorlar')
      .select('ad, soyad, spec, il, ilce, slug')
      .or(`ad.ilike.${like},soyad.ilike.${like},spec.ilike.${like},il.ilike.${like}`)
      .limit(LIMIT),

    supabase
      .from('hastaneler')
      .select('name, type, il, ilce, slug')
      .or(`name.ilike.${like},il.ilike.${like},type.ilike.${like}`)
      .limit(LIMIT),

    supabase
      .from('klinikler')
      .select('name, il, ilce, slug')
      .or(`name.ilike.${like},il.ilike.${like},specs.ilike.${like}`)
      .limit(LIMIT),

    supabase
      .from('eczaneler')
      .select('name, il, ilce, slug')
      .or(`name.ilike.${like},il.ilike.${like}`)
      .limit(LIMIT),
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
