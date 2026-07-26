import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { KATEGORILER, HASTALIKLAR } from '@/lib/hastaliklar-data';
import { BLOG_YAZILARI } from '@/lib/blog-data';
import { toSlug } from '@/lib/helpers';
import { canonicalDentalSpec, TREATMENTS } from '@/lib/uzmanlik-data';

const BASE = 'https://hekimhane.com.tr';

// Supabase tek sorguda max 1000 satır döndürür — tüm kayıtları sayfalayarak topla
async function fetchAll<T = any>(build: () => any, max = 30000): Promise<T[]> {
  const PAGE = 1000; const out: T[] = [];
  for (let f = 0; f < max; f += PAGE) {
    const { data, error } = await build().range(f, f + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Statik sayfalar
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/klinikler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/dis-hekimleri`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/hastaneler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/doktorlar`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/eczaneler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/yakin-eczane`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/hastaliklar`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...BLOG_YAZILARI.map(y => ({
      url: `${BASE}/blog/${y.slug}`,
      lastModified: new Date(y.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${BASE}/katil`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/hakkimizda`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/iletisim`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/gizlilik`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/kvkk`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/kullanim`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Hastalık kategorileri — şimdilik yalnızca diş/ağız (diğerleri gizli)
  const kategoriPages: MetadataRoute.Sitemap = KATEGORILER
    .filter(k => k.slug === 'dis-sagligi')
    .map(k => ({
      url: `${BASE}/hastaliklar/${k.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

  // Hastalık detay sayfaları — yalnızca diş/ağız
  const hastalikPages: MetadataRoute.Sitemap = HASTALIKLAR
    .filter(h => h.kategoriSlug === 'dis-sagligi')
    .map(h => ({
      url: `${BASE}/hastaliklar/${h.kategoriSlug}/${h.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  // Klinik sayfaları
  const tr = (s: string) => (s || '').toLowerCase()
    .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c').replace(/\s+/g, '-');

  let klinikPages: MetadataRoute.Sitemap = [];
  let comboPages: MetadataRoute.Sitemap = [];
  let ilceLandingPages: MetadataRoute.Sitemap = [];
  let hastanePages: MetadataRoute.Sitemap = [];
  let doktorPages: MetadataRoute.Sitemap = [];
  let eczanePages: MetadataRoute.Sitemap = [];

  try {
    const klinikler = await fetchAll<{ il: string; ilce: string; slug: string; specs: string[] | null }>(
      () => supabase.from('klinikler').select('il,ilce,slug,specs').not('slug', 'is', null));
    klinikPages = klinikler.map(k => ({
      url: `${BASE}/klinikler/${tr(k.il || 'turkiye')}/${tr(k.ilce || 'merkez')}/${k.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));

    // Kanonik uzmanlık kümeleri: il ve il+ilçe bazında
    const ilSpecs: Record<string, Set<string>> = {};
    const ilceSpecs: Record<string, Set<string>> = {};       // key: "il|ilce"
    const ilceSet = new Set<string>();                         // "il|ilce"
    klinikler.forEach(k => {
      if (!k.il) return;
      const ilce = k.ilce || 'Merkez';
      const key = `${k.il}|${ilce}`;
      ilceSet.add(key);
      (k.specs || []).forEach(s => {
        const c = canonicalDentalSpec(s);
        if (!c) return;
        (ilSpecs[k.il] ||= new Set()).add(c);
        (ilceSpecs[key] ||= new Set()).add(c);
      });
    });

    const treatmentsForSpecs = (specSet: Set<string>) =>
      TREATMENTS.filter(t => { const c = canonicalDentalSpec(t.spec); return c && specSet.has(c); });

    // İl + uzmanlık ve il + tedavi
    for (const [il, set] of Object.entries(ilSpecs)) {
      const ilP = toSlug(il);
      for (const spec of Array.from(set))
        comboPages.push({ url: `${BASE}/dis-tedavileri/${ilP}/${toSlug(spec)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
      for (const t of treatmentsForSpecs(set))
        comboPages.push({ url: `${BASE}/dis-tedavileri/${ilP}/${t.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.72 });
    }

    // İlçe landing + ilçe + uzmanlık/tedavi
    for (const key of Array.from(ilceSet)) {
      const [il, ilce] = key.split('|');
      const ilP = toSlug(il); const ilceP = toSlug(ilce);
      ilceLandingPages.push({ url: `${BASE}/klinikler/${ilP}/${ilceP}`, lastModified: now, changeFrequency: 'weekly', priority: 0.68 });
      const set = ilceSpecs[key];
      if (!set) continue;
      for (const spec of Array.from(set))
        comboPages.push({ url: `${BASE}/dis-tedavileri/${ilP}/${ilceP}/${toSlug(spec)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.66 });
      for (const t of treatmentsForSpecs(set))
        comboPages.push({ url: `${BASE}/dis-tedavileri/${ilP}/${ilceP}/${t.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.66 });
    }
  } catch {}

  try {
    const hastaneler = await fetchAll<{ il: string; ilce: string; slug: string }>(
      () => supabase.from('hastaneler').select('il,ilce,slug').not('slug', 'is', null));
    hastanePages = hastaneler.map((h: { il: string; ilce: string; slug: string }) => ({
      url: `${BASE}/hastaneler/${tr(h.il || 'turkiye')}/${tr(h.ilce || 'merkez')}/${h.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));
  } catch {}

  try {
    const doktorlar = await fetchAll<{ slug: string }>(() => supabase.from('doktorlar').select('slug').not('slug', 'is', null));
    doktorPages = doktorlar.map((d: { slug: string }) => ({
      url: `${BASE}/doktorlar/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {}

  try {
    const eczaneler = await fetchAll<{ slug: string }>(() => supabase.from('eczaneler').select('slug').not('slug', 'is', null));
    eczanePages = eczaneler.map((e: { slug: string }) => ({
      url: `${BASE}/eczaneler/${e.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {}

  return [
    ...statics,
    ...kategoriPages,
    ...hastalikPages,
    ...klinikPages,
    ...ilceLandingPages,
    ...comboPages,
    ...hastanePages,
    ...doktorPages,
    ...eczanePages,
  ];
}
