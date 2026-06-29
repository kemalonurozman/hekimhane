import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { KATEGORILER, HASTALIKLAR } from '@/lib/hastaliklar-data';

const BASE = 'https://hekimhane.com.tr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Statik sayfalar
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/klinikler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/hastaneler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/doktorlar`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/eczaneler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/hastaliklar`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/katil`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/hakkimizda`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/iletisim`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/gizlilik`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/kvkk`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/kullanim`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Hastalık kategorileri
  const kategoriPages: MetadataRoute.Sitemap = KATEGORILER.map(k => ({
    url: `${BASE}/hastaliklar/${k.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  // Hastalık detay sayfaları
  const hastalikPages: MetadataRoute.Sitemap = HASTALIKLAR.map(h => ({
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
  let hastanePages: MetadataRoute.Sitemap = [];
  let doktorPages: MetadataRoute.Sitemap = [];
  let eczanePages: MetadataRoute.Sitemap = [];

  try {
    const { data: klinikler } = await supabase.from('klinikler').select('il,ilce,slug').not('slug', 'is', null);
    klinikPages = (klinikler || []).map((k: { il: string; ilce: string; slug: string }) => ({
      url: `${BASE}/klinikler/${tr(k.il || 'turkiye')}/${tr(k.ilce || 'merkez')}/${k.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));
  } catch {}

  try {
    const { data: hastaneler } = await supabase.from('hastaneler').select('il,ilce,slug').not('slug', 'is', null);
    hastanePages = (hastaneler || []).map((h: { il: string; ilce: string; slug: string }) => ({
      url: `${BASE}/hastaneler/${tr(h.il || 'turkiye')}/${tr(h.ilce || 'merkez')}/${h.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));
  } catch {}

  try {
    const { data: doktorlar } = await supabase.from('doktorlar').select('slug').not('slug', 'is', null);
    doktorPages = (doktorlar || []).map((d: { slug: string }) => ({
      url: `${BASE}/doktorlar/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {}

  try {
    const { data: eczaneler } = await supabase.from('eczaneler').select('slug').not('slug', 'is', null);
    eczanePages = (eczaneler || []).map((e: { slug: string }) => ({
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
    ...hastanePages,
    ...doktorPages,
    ...eczanePages,
  ];
}
