// ─────────────────────────────────────────────────────────────
// Sitemap ağacı — kök index + kategori alt-haritaları için ortak URL üretici
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase';
import { toSlug } from './helpers';
import { canonicalDentalSpec, TREATMENTS, DENTAL_PROBLEMS } from './uzmanlik-data';
import { KATEGORILER, HASTALIKLAR } from './hastaliklar-data';
import { BLOG_YAZILARI } from './blog-data';
import { TEDAVI_SLUGS } from './tedavi-detaylari';
import { UZMANLIK_REHBERLERI } from './uzmanlik-rehberleri';
import { COCUK_KONULAR } from './cocuk-dis';

export const BASE = 'https://www.hekimhane.com.tr';

export const SITEMAP_SECTIONS = ['genel', 'klinikler', 'dis-tedavileri', 'hastaneler', 'doktorlar', 'eczaneler'] as const;
export type SitemapSection = typeof SITEMAP_SECTIONS[number];

export interface SmImage { loc: string; caption?: string; title?: string }
export interface SmUrl { loc: string; changefreq?: string; priority?: number; lastmod?: string; images?: SmImage[] }

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

// updated_at ile dene; sütun yoksa (migration çalışmamışsa) eski sorguya düş —
// yoksa hata yüzünden bölüm sitemap'i boş döner.
async function fetchWithDate<T>(table: string, cols: string, notNull: string): Promise<(T & { updated_at?: string | null })[]> {
  const ilk = await supabase.from(table).select(`${cols},updated_at`).not(notNull, 'is', null).range(0, 0);
  const tarihli = !ilk.error;
  return fetchAll<T & { updated_at?: string | null }>(
    () => supabase.from(table).select(tarihli ? `${cols},updated_at` : cols).not(notNull, 'is', null));
}

// Geçerli bir tarihse ISO'ya çevir; yoksa lastmod hiç yazılmaz (uydurma "şimdi" yerine).
function tarih(v?: string | null): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}
const enGec = (a?: string, b?: string) => (!a ? b : !b ? a : (a > b ? a : b));

// Aynı loc iki kez yazılmasın (ör. uzmanlık slug'ı ile tedavi slug'ı çakışınca)
function tekil(urls: SmUrl[]): SmUrl[] {
  const gor = new Set<string>();
  return urls.filter(u => (gor.has(u.loc) ? false : (gor.add(u.loc), true)));
}

export async function buildSection(section: string): Promise<SmUrl[]> {
  return tekil(await buildSectionRaw(section));
}

async function buildSectionRaw(section: string): Promise<SmUrl[]> {

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
      { loc: `${BASE}/randevu-sistemi`, changefreq: 'yearly', priority: 0.5 },
      { loc: `${BASE}/mcp`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${BASE}/degerlendirme-sistemi`, changefreq: 'yearly', priority: 0.4 },
      { loc: `${BASE}/uzmanlik`, changefreq: 'monthly', priority: 0.7 },
      ...UZMANLIK_REHBERLERI.map(r => ({ loc: `${BASE}/uzmanlik/${r.slug}`, changefreq: 'monthly' as const, priority: 0.72 })),
      { loc: `${BASE}/cocuk-dis-sagligi`, changefreq: 'monthly', priority: 0.7 },
      ...COCUK_KONULAR.map(k => ({ loc: `${BASE}/cocuk-dis-sagligi/${k.slug}`, changefreq: 'monthly' as const, priority: 0.68 })),
      { loc: `${BASE}/iletisim`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${BASE}/gizlilik`, changefreq: 'yearly', priority: 0.3 },
      { loc: `${BASE}/kvkk`, changefreq: 'yearly', priority: 0.3 },
      { loc: `${BASE}/mesafeli-satis-sozlesmesi`, changefreq: 'yearly', priority: 0.2 },
      { loc: `${BASE}/on-bilgilendirme-formu`, changefreq: 'yearly', priority: 0.2 },
      { loc: `${BASE}/iptal-iade`, changefreq: 'yearly', priority: 0.2 },
      { loc: `${BASE}/kullanim`, changefreq: 'yearly', priority: 0.3 },
    ];
    const kategori = KATEGORILER.filter(k => k.slug === 'dis-sagligi')
      .map(k => ({ loc: `${BASE}/hastaliklar/${k.slug}`, changefreq: 'weekly', priority: 0.75 }));
    const hastalik = HASTALIKLAR.filter(h => h.kategoriSlug === 'dis-sagligi')
      .map(h => ({ loc: `${BASE}/hastaliklar/${h.kategoriSlug}/${h.slug}`, changefreq: 'weekly', priority: 0.7 }));
    const blog = BLOG_YAZILARI.map(b => ({
      loc: `${BASE}/blog/${b.slug}`, changefreq: 'monthly', priority: 0.6, lastmod: new Date(b.created_at).toISOString(),
      images: b.cover_image ? [{ loc: b.cover_image.startsWith('http') ? b.cover_image : `${BASE}${b.cover_image}`, caption: b.cover_alt || b.title, title: b.title }] : undefined,
    }));
    // Devlet diş hastaneleri: kategori sayfası sitemap'te; hastanelerin kendisi
    // artık standart profesyonel /hastaneler/... sayfasında (sitemap-hastaneler'de zaten var),
    // custom detay URL'leri oraya 301 yönlendiriyor → burada tekrar listelenmez.
    const devlet: SmUrl[] = [{ loc: `${BASE}/devlet-dis-hastaneleri`, changefreq: 'weekly', priority: 0.85 }];
    const tedaviDetay: SmUrl[] = TEDAVI_SLUGS.map(s => ({ loc: `${BASE}/tedavi-ucretleri/${s}`, changefreq: 'monthly', priority: 0.75 }));
    return [...statics, ...kategori, ...hastalik, ...blog, ...devlet, ...tedaviDetay];
  }

  // ── KLİNİKLER: tüm klinik detay + ilçe landing ──
  if (section === 'klinikler') {
    const rows = await fetchWithDate<{ il: string; ilce: string; slug: string }>('klinikler', 'il,ilce,slug', 'slug');
    const detay: SmUrl[] = rows.map(k => ({
      loc: `${BASE}/klinikler/${tr(k.il || 'turkiye')}/${tr(k.ilce || 'merkez')}/${k.slug}`,
      changefreq: 'monthly', priority: 0.65, lastmod: tarih(k.updated_at),
    }));
    // ilçe landing (benzersiz il+ilçe) — lastmod: ilçedeki en son güncellenen klinik
    const ilceMap = new Map<string, string | undefined>();
    rows.forEach(k => {
      if (!k.il) return;
      const key = `${k.il}|${k.ilce || 'Merkez'}`;
      ilceMap.set(key, enGec(ilceMap.get(key), tarih(k.updated_at)));
    });
    const ilce: SmUrl[] = Array.from(ilceMap.entries()).map(([key, lm]) => {
      const [il, ic] = key.split('|');
      return { loc: `${BASE}/klinikler/${tr(il)}/${tr(ic)}`, changefreq: 'weekly', priority: 0.68, lastmod: lm };
    });
    return [...ilce, ...detay];
  }

  // ── DİŞ TEDAVİLERİ: il/ilçe × uzmanlık/tedavi combo (yalnızca veri olanlar) ──
  if (section === 'dis-tedavileri') {
    const rows = await fetchWithDate<{ il: string; ilce: string; specs: string[] | null }>('klinikler', 'il,ilce,specs', 'il');
    const ilTarih: Record<string, string | undefined> = {};
    const ilceTarih: Record<string, string | undefined> = {};
    rows.forEach(k => {
      const t = tarih(k.updated_at); const key = `${k.il}|${k.ilce || 'Merkez'}`;
      ilTarih[k.il] = enGec(ilTarih[k.il], t); ilceTarih[key] = enGec(ilceTarih[key], t);
    });
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
    // Diş sağlığı problemleri — çözüm sunan uzmanlık o ilde varsa problem sayfası eklenir.
    const problemsFor = (set: Set<string>) => DENTAL_PROBLEMS.filter(p => { const c = canonicalDentalSpec(p.spec); return c && set.has(c); });
    const out: SmUrl[] = [];
    for (const [il, set] of Object.entries(ilSpecs)) {
      const ilP = tr(il); const lastmod = ilTarih[il];
      for (const spec of Array.from(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${tr(spec)}`, changefreq: 'weekly', priority: 0.7, lastmod });
      for (const t of treatmentsFor(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${t.slug}`, changefreq: 'weekly', priority: 0.72, lastmod });
      for (const p of problemsFor(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${p.slug}`, changefreq: 'weekly', priority: 0.68, lastmod });
    }
    for (const [key, set] of Object.entries(ilceSpecs)) {
      const [il, ic] = key.split('|'); const ilP = tr(il); const icP = tr(ic); const lastmod = ilceTarih[key];
      for (const spec of Array.from(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${icP}/${tr(spec)}`, changefreq: 'weekly', priority: 0.66, lastmod });
      for (const t of treatmentsFor(set)) out.push({ loc: `${BASE}/dis-tedavileri/${ilP}/${icP}/${t.slug}`, changefreq: 'weekly', priority: 0.66, lastmod });
    }
    return out;
  }

  // ── HASTANELER ──
  if (section === 'hastaneler') {
    const rows = await fetchWithDate<{ il: string; ilce: string; slug: string }>('hastaneler', 'il,ilce,slug', 'slug');
    return rows.map(h => ({ loc: `${BASE}/hastaneler/${tr(h.il || 'turkiye')}/${tr(h.ilce || 'merkez')}/${h.slug}`, changefreq: 'monthly', priority: 0.65, lastmod: tarih(h.updated_at) }));
  }

  // ── DOKTORLAR ──
  if (section === 'doktorlar') {
    const rows = await fetchWithDate<{ slug: string }>('doktorlar', 'slug', 'slug');
    return rows.map(d => ({ loc: `${BASE}/doktorlar/${d.slug}`, changefreq: 'monthly', priority: 0.6, lastmod: tarih(d.updated_at) }));
  }

  // ── ECZANELER ──
  if (section === 'eczaneler') {
    const rows = await fetchWithDate<{ slug: string }>('eczaneler', 'slug', 'slug');
    return rows.map(e => ({ loc: `${BASE}/eczaneler/${e.slug}`, changefreq: 'monthly', priority: 0.6, lastmod: tarih(e.updated_at) }));
  }

  return [];
}

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Kök sitemap index — bölüm alt-haritalarına işaret eder (ağaç kökü)
// lastmod opsiyonel: her istekte "şimdi" yazmak Google'ın lastmod'a güvenini bozuyordu.
export function renderSitemapIndex(sections: readonly string[], lastmods: Record<string, string | undefined> = {}): string {
  const body = sections.map(s => `  <sitemap>
    <loc>${BASE}/sitemap-${s}.xml</loc>${lastmods[s] ? `
    <lastmod>${lastmods[s]}</lastmod>` : ''}
  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export function renderUrlset(urls: SmUrl[]): string {
  const hasImages = urls.some(u => u.images && u.images.length);
  const body = urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `
    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority != null ? `
    <priority>${u.priority}</priority>` : ''}${(u.images || []).map(im => `
    <image:image>
      <image:loc>${esc(im.loc)}</image:loc>${im.caption ? `
      <image:caption>${esc(im.caption)}</image:caption>` : ''}${im.title ? `
      <image:title>${esc(im.title)}</image:title>` : ''}
    </image:image>`).join('')}
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${hasImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''}>
${body}
</urlset>`;
}
