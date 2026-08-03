// ─────────────────────────────────────────────────────────────
// Sitemap ağacı — kök index + kategori alt-haritaları için ortak URL üretici
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import { toSlug } from './helpers';
import { canonicalDentalSpec, TREATMENTS } from './uzmanlik-data';
import { KATEGORILER, HASTALIKLAR } from './hastaliklar-data';
import { BLOG_YAZILARI } from './blog-data';
import { TEDAVI_SLUGS } from './tedavi-detaylari';
import { getDevletHospitals } from './devlet-dis';

export const BASE = 'https://www.hekimhane.com.tr';

export const SITEMAP_SECTIONS = ['genel', 'klinikler', 'dis-tedavileri', 'hastaneler', 'doktorlar', 'eczaneler'] as const;
export type SitemapSection = typeof SITEMAP_SECTIONS[number];

export interface SmUrl { loc: string; changefreq?: string; priority?: number; lastmod?: string }

const tr = toSlug;

// Supabase tek sorguda max 1000 satır — hepsini sayfalayarak topla
async function fetchAll<T = any>(build: () => any, max = 40000): Promise<T[]> {
  const PAGE = 1000; const out: T[] = [];
  for (let f = 0; f < max; f += PAGE) {
    const { data, error } = await build().range(f, f + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

export async function buildSection(section: string): Promise<SmUrl[]> {
  const lastmod = new Date().toISOString();

  // ── GENEL: statik + hastalık + blog ──
  if (section === 'genel') {
    const statics: SmUrl[] = [
      { loc: BASE, changefreq: 'daily', priority: 1.0 },
      { loc: `${BASE}/klinikler`, changefreq: 'daily', priority: 0.9 },
      { loc: `${BASE}/dis-hekimleri`, changefreq: 'daily', priority: 0.9 },
      { loc: `${BASE}/hastaneler`, changefreq: 'daily', priority: 0.9 },
      { loc: `${BASE}/doktorlar`, changefreq: 'daily', priority: 0.9 },
      { loc: `${BASE}/eczaneler`, changefreq: 'daily', priority: 0.9 },
      { loc: `${BASE}/yakin-eczane`, changefreq: 'weekly', priority: 0.85 },
      { loc: `${BASE}/hastaliklar`, changefreq: 'weekly', priority: 0.85 },
      { loc: `${BASE}/tedavi-ucretleri`, changefreq: 'monthly', priority: 0.85 },
      { loc: `${BASE}/blog`, changefreq: 'weekly', priority: 0.7 },
      { loc: `${BASE}/katil`, changefreq: 'monthly', priority: 0.6 },
      { loc: `${BASE}/makale-yayinla`, changefreq: 'monthly', priority: 0.6 },
      { loc: `${BASE}/hakkimizda`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${BASE}/iletisim`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${BASE}/gizlilik`, changefreq: 'yearly', priority: 0.3 },
      { loc: `${BASE}/kvkk`, changefreq: 'yearly', priority: 0.3 },
      { loc: `${BASE}/kullanim`, changefreq: 'yearly', priority: 0.3 },
    ];
    const kategori = KATEGORILER.filter(k => k.slug === 'dis-sagligi')
      .map(k => ({ loc: `${BASE}/hastaliklar/${k.slug}`, changefreq: 'weekly', priority: 0.75 }));
    const hastalik = HASTALIKLAR.filter(h => h.kategoriSlug === 'dis-sagligi')
      .map(h => ({ loc: `${BASE}/hastaliklar/${h.kategoriSlug}/${h.slug}`, changefreq: 'weekly', priority: 0.7 }));
    const blog = BLOG_YAZILARI.map(b => ({ loc: `${BASE}/blog/${b.slug}`, changefreq: 'monthly', priority: 0.6, lastmod: new Date(b.created_at).toISOString() }));
    // Devlet diş hastaneleri kategorisi + hastane sayfaları
    let devlet: SmUrl[] = [{ loc: `${BASE}/devlet-dis-hastaneleri`, changefreq: 'weekly', priority: 0.85 }];
    try {
      const hosp = await getDevletHospitals();
      devlet.push(...hosp.map(h => ({ loc: `${BASE}/devlet-dis-hastaneleri/${h.ilSlug}/${h.slug}`, changefreq: 'weekly' as const, priority: 0.7, lastmod })));
    } catch {}
    const tedaviDetay: SmUrl[] = TEDAVI_SLUGS.map(s => ({ loc: `${BASE}/tedavi-ucretleri/${s}`, changefreq: 'monthly', priority: 0.75 }));
    return [...statics, ...kategori, ...hastalik, ...blog, ...devlet, ...tedaviDetay];
  }

  // ── KLİNİKLER: tüm klinik detay + ilçe landing ──
  if (section === 'klinikler') {
    const rows = await fetchAll<{ il: string; ilce: string; slug: string }>(
      () => supabase.from('klinikler').select('il,ilce,slug').not('slug', 'is', null));
    const detay: SmUrl[] = rows.map(k => ({
      loc: `${BASE}/klinikler/${tr(k.il || 'turkiye')}/${tr(k.ilce || 'merkez')}/${k.slug}`,
      changefreq: 'monthly', priority: 0.65, lastmod,
    }));
    // ilçe landing (benzersiz il+ilçe)
    const ilceSet = new Set<string>();
    rows.forEach(k => { if (k.il) ilceSet.add(`${k.il}|${k.ilce || 'Merkez'}`); });
    const ilce: SmUrl[] = Array.from(ilceSet).map(key => {
      const [il, ic] = key.split('|');
      return { loc: `${BASE}/klinikler/${tr(il)}/${tr(ic)}`, changefreq: 'weekly', priority: 0.68, lastmod };
    });
    return [...ilce, ...detay];
  }

  // ── DİŞ TEDAVİLERİ: il/ilçe × uzmanlık/tedavi combo (yalnızca veri olanlar) ──
  if (section === 'dis-tedavileri') {
    const rows = await fetchAll<{ il: string; ilce: string; specs: string[] | null }>(
      () => supabase.from('klinikler').select('il,ilce,specs').not('il', 'is', null));
    const ilSpecs: Record<string, Set<string>> = {};
    const ilceSpecs: Record<string, Set<string>> = {};
    rows.forEach(k => {
      const ic = k.ilce || 'Merkez'; const key = `${k.il}|${ic}`;
      (k.specs || []).forEach(s => {
        const c = canonicalDentalSpec(s); if (!c) return;
        (ilSpecs[k.il] ||= new Set()).add(c);
        (ilceSpecs[key] ||= new Set()).add(c);
      });
    });
    const treatmentsFor = (set: Set<string>) => TREATMENTS.filter(t => { const c = canonicalDentalSpec(t.spec); return c && set.has(c); });
    const out: SmUrl[] = [];
    for (const [il, set] of Object.entries(ilSpecs)) {
      const ilP = tr(il);
      for (const spec of Array.from(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${tr(spec)}`, changefreq: 'weekly', priority: 0.7, lastmod });
      for (const t of treatmentsFor(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${t.slug}`, changefreq: 'weekly', priority: 0.72, lastmod });
    }
    for (const [key, set] of Object.entries(ilceSpecs)) {
      const [il, ic] = key.split('|'); const ilP = tr(il); const icP = tr(ic);
      for (const spec of Array.from(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${icP}/${tr(spec)}`, changefreq: 'weekly', priority: 0.66, lastmod });
      for (const t of treatmentsFor(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${icP}/${t.slug}`, changefreq: 'weekly', priority: 0.66, lastmod });
    }
    return out;
  }

  // ── HASTANELER ──
  if (section === 'hastaneler') {
    const rows = await fetchAll<{ il: string; ilce: string; slug: string }>(
      () => supabase.from('hastaneler').select('il,ilce,slug').not('slug', 'is', null));
    return rows.map(h => ({ loc: `${BASE}/hastaneler/${tr(h.il || 'turkiye')}/${tr(h.ilce || 'merkez')}/${h.slug}`, changefreq: 'monthly', priority: 0.65, lastmod }));
  }

  // ── DOKTORLAR ──
  if (section === 'doktorlar') {
    const rows = await fetchAll<{ slug: string }>(() => supabase.from('doktorlar').select('slug').not('slug', 'is', null));
    return rows.map(d => ({ loc: `${BASE}/doktorlar/${d.slug}`, changefreq: 'monthly', priority: 0.6, lastmod }));
  }

  // ── ECZANELER ──
  if (section === 'eczaneler') {
    const rows = await fetchAll<{ slug: string }>(() => supabase.from('eczaneler').select('slug').not('slug', 'is', null));
    return rows.map(e => ({ loc: `${BASE}/eczaneler/${e.slug}`, changefreq: 'monthly', priority: 0.6, lastmod }));
  }

  return [];
}

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Kök sitemap index — bölüm alt-haritalarına işaret eder (ağaç kökü)
export function renderSitemapIndex(sections: readonly string[], lastmod = new Date().toISOString()): string {
  const body = sections.map(s => `  <sitemap>
    <loc>${BASE}/sitemap-${s}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export function renderUrlset(urls: SmUrl[]): string {
  const body = urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `
    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority != null ? `
    <priority>${u.priority}</priority>` : ''}
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
