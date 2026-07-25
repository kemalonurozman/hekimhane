export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { KlinikFilters, Klinik } from '@/lib/types';
import KlinikCard from '@/components/KlinikCard';
import ListingLayout from '@/components/ListingLayout';
import { resolveKonum } from '@/lib/il-koordinatlari';

const PAGE_SIZE = 20;
const TR = (s: string) => (s||'').toLowerCase()
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il = searchParams.il || ''; const ilce = searchParams.ilce || ''; const uzmanlik = searchParams.uzmanlik || ''; const tip = searchParams.tip || ''; const q = searchParams.q || '';
  const yer = ilce ? `${ilce}, ${il}` : il;
  const tipEtiket = tip === 'Diş Hekimi' ? 'Diş Hekimleri' : tip ? `${tip}` : 'Diş Klinikleri';

  let title: string;
  if (uzmanlik)  title = yer ? `${yer} ${uzmanlik} — Diş Klinikleri` : `${uzmanlik} — Diş Klinikleri`;
  else if (yer)  title = tip ? `${yer} ${tipEtiket}` : `${yer} Diş Klinikleri ve Diş Hekimleri`;
  else           title = tip ? `Türkiye ${tipEtiket} — İl İl Rehber` : `Türkiye Diş Klinikleri ve Diş Hekimleri — İl İl Rehber`;

  const konum = yer || 'Türkiye';
  const desc = `${konum} bölgesindeki ${uzmanlik ? uzmanlik + ' ' : ''}diş klinikleri ve diş hekimleri: hasta yorumları, puanlar, adres, telefon ve online randevu. Hekimhane'de karşılaştırın, size en yakın diş hekimini bulun.`;

  // Kanonik: yalnızca anlamlı filtreler (arama/sayfa hariç) → duplike içerik önlenir
  const qs = new URLSearchParams();
  if (il) qs.set('il', il); if (ilce) qs.set('ilce', ilce); if (tip) qs.set('tip', tip); if (uzmanlik) qs.set('uzmanlik', uzmanlik);
  const canonical = `https://hekimhane.com.tr/klinikler${qs.toString() ? `?${qs.toString()}` : ''}`;

  return {
    title,
    description: desc,
    keywords: [konum + ' diş kliniği', konum + ' diş hekimi', 'diş hekimi ara', 'diş kliniği', uzmanlik].filter(Boolean),
    alternates: { canonical },
    // İç arama sonuçlarını indeksleme (thin/duplicate)
    ...(q ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

async function getKlinikler(filters: KlinikFilters) {
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  let query = supabase.from('klinikler').select('*', { count: 'exact' })
    .order('rat', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (filters.il)       query = query.eq('il', filters.il);
  if (filters.ilce)     query = query.eq('ilce', filters.ilce);
  if (filters.tip)      query = query.eq('type', filters.tip);
  if (filters.uzmanlik) query = query.contains('specs', [filters.uzmanlik]);
  if (filters.minRat)   query = query.gte('rat', filters.minRat);
  if (filters.q)        query = query.ilike('name', `%${filters.q}%`);
  const { data, count, error } = await query;
  if (error) console.error(error);
  return { data: data || [], count: count || 0 };
}

// Şehir sayıları — aktif uzmanlik filtresi dikkate alınır
// Supabase tek sorguda en fazla 1000 satır döndürür; tüm satırları sayfalayarak topla.
async function fetchAllRows<T = any>(build: () => any, maxRows = 20000): Promise<T[]> {
  const PAGE = 1000; const out: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE) {
    const { data, error } = await build().range(from, from + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

async function getIller(uzmanlik?: string) {
  const rows = await fetchAllRows<{ il: string | null }>(() => {
    let q = supabase.from('klinikler').select('il').not('il', 'is', null);
    if (uzmanlik) q = (q as any).contains('specs', [uzmanlik]);
    return q;
  });
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([il, count]) => ({ value: il, label: il, count }));
}

// Uzmanlık sayıları — aktif il filtresi dikkate alınır
async function getUzmanliklar(il?: string) {
  const rows = await fetchAllRows<{ specs: string[] | null }>(() => {
    let q = supabase.from('klinikler').select('specs').not('specs', 'is', null);
    if (il) q = q.eq('il', il);
    return q;
  });
  const map: Record<string, number> = {};
  rows.forEach(r => (r.specs || []).forEach(s => { if (s) map[s] = (map[s] || 0) + 1; }));
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([uzmanlik, count]) => ({ value: uzmanlik, label: uzmanlik, count }));
}

// İlçe sayıları — yalnızca bir il seçiliyken doldurulur
async function getIlceler(il?: string) {
  if (!il) return [];
  const rows = await fetchAllRows<{ ilce: string | null }>(() =>
    supabase.from('klinikler').select('ilce').eq('il', il).not('ilce', 'is', null));
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.ilce) map[r.ilce] = (map[r.ilce] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([ilce, count]) => ({ value: ilce, label: ilce, count }));
}

async function getKonumlar(filters: KlinikFilters) {
  // Yalnızca gerçek koordinatı olan klinikler — null ve 0 değerleri hariç
  return fetchAllRows(() => {
    let q = supabase.from('klinikler')
      .select('id,name,lat,lng,tel,type,il,ilce,slug')
      .not('lat', 'is', null).not('lng', 'is', null)
      .neq('lat', 0).neq('lng', 0);
    if (filters.il)       q = q.eq('il', filters.il);
    if (filters.ilce)     q = q.eq('ilce', filters.ilce);
    if (filters.tip)      q = q.eq('type', filters.tip);
    if (filters.uzmanlik) q = (q as any).contains('specs', [filters.uzmanlik]);
    if (filters.q)        q = q.ilike('name', `%${filters.q}%`);
    return q;
  }, 6000);
}

export default async function KliniklerPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const filters: KlinikFilters = {
    il:       searchParams.il       || undefined,
    ilce:     searchParams.ilce     || undefined,
    uzmanlik: searchParams.uzmanlik || undefined,
    tip:      searchParams.tip      || undefined,
    minRat:   searchParams.minpuan  ? parseFloat(searchParams.minpuan) : undefined,
    q:        searchParams.q        || undefined,
    page:     searchParams.page     ? parseInt(searchParams.page) : 1,
  };

  const [{ data: klinikler, count }, illerWithCount, ilcelerWithCount, uzmanliklarWithCount, konumlar] = await Promise.all([
    getKlinikler(filters),
    getIller(filters.uzmanlik),
    getIlceler(filters.il),
    getUzmanliklar(filters.il),
    getKonumlar(filters),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // tip='Diş Hekimi' → bireysel diş hekimleri listesi (menüdeki "Diş Hekimleri")
  const tipEtiket = filters.tip === 'Diş Hekimi' ? 'Diş Hekimleri'
    : filters.tip === 'Çocuk Diş Hekimi' ? 'Çocuk Diş Hekimleri'
    : filters.tip ? `${filters.tip} Klinikleri`
    : null;
  const yer = filters.ilce || filters.il;

  const title = tipEtiket ? (yer ? `${yer} ${tipEtiket}` : `Tüm ${tipEtiket}`)
    : filters.uzmanlik ? `${filters.uzmanlik} Klinikleri`
    : filters.ilce ? `${filters.ilce} Diş Klinikleri`
    : filters.il   ? `${filters.il} Diş Klinikleri`
    : 'Tüm Diş Klinikleri';

  // ── SEO: BreadcrumbList + ItemList (listelenen klinikler) ──
  const bcItems = [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://hekimhane.com.tr' },
    { '@type': 'ListItem', position: 2, name: 'Diş Klinikleri', item: 'https://hekimhane.com.tr/klinikler' },
  ];
  if (filters.il)   bcItems.push({ '@type': 'ListItem', position: 3, name: filters.il, item: `https://hekimhane.com.tr/klinikler?il=${encodeURIComponent(filters.il)}` });
  if (filters.ilce) bcItems.push({ '@type': 'ListItem', position: 4, name: filters.ilce, item: `https://hekimhane.com.tr/klinikler?il=${encodeURIComponent(filters.il||'')}&ilce=${encodeURIComponent(filters.ilce)}` });

  const listItems = (klinikler || []).slice(0, 20).map((k, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: k.name,
    url: k.slug ? `https://hekimhane.com.tr/klinikler/${TR(k.il||'turkiye')}/${TR(k.ilce||'merkez')}/${k.slug}` : undefined,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: bcItems },
      { '@type': 'ItemList', name: title, numberOfItems: count, itemListElement: listItems },
    ],
  };

  return (
    <ListingLayout
      basePath="/klinikler"
      entityLabel="klinik"
      entityLabelPlural="klinik"
      color="#1B3A69"
      gradient="linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)"
      icon={
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C9.2 2 7 4 7 6.5c0 1.4.4 2.4.9 3.4.9 2 .8 5.2-.4 9.4-.3 1.3.8 2.2 1.7.7.4-.7.9-1.3 2.3-1.3 1.4 0 1.9.6 2.3 1.3.9 1.5 2 .6 1.7-.7-1.2-4.2-1.3-7.4-.4-9.4.5-1 .9-2 .9-3.4C16 4 13.8 2 12 2z"/>
        </svg>
      }
      iconBg="linear-gradient(135deg,var(--navy),var(--navy2))"
      title={title}
      count={count}
      cityCount={illerWithCount.length}
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Klinikler', href: '/klinikler' },
        ...(filters.il ? [{ label: filters.il, href: `/klinikler?il=${encodeURIComponent(filters.il)}` }] : []),
        ...(filters.ilce ? [{ label: filters.ilce, href: `/klinikler?il=${filters.il}&ilce=${filters.ilce}` }] : []),
      ]}
      filterSections={[
        { key: 'q',        label: 'Arama',    type: 'search',   placeholder: 'Klinik ara...' },
        { key: 'il',       label: 'Şehir',    type: 'radio',    options: illerWithCount },
        ...(filters.il && ilcelerWithCount.length > 1
          ? [{ key: 'ilce', label: 'İlçe', type: 'radio' as const, options: ilcelerWithCount }]
          : []),
        { key: 'uzmanlik', label: 'Uzmanlık', type: 'checkbox', options: uzmanliklarWithCount },
      ]}
      activeFilters={{ il: filters.il, ilce: filters.ilce, uzmanlik: filters.uzmanlik, tip: filters.tip, q: filters.q }}
      hasActiveFilters={!!(filters.il || filters.ilce || filters.uzmanlik || filters.tip || filters.q)}
      markers={konumlar.map(k => ({
        id: k.id, name: k.name, lat: k.lat, lng: k.lng, tel: k.tel, type: k.type,
        il: k.il, ilce: k.ilce,
        href: k.slug ? `/klinikler/${TR(k.il||'turkiye')}/${TR(k.ilce||'merkez')}/${k.slug}` : `/klinikler/${k.id}`,
      }))}
      totalPages={totalPages}
      currentPage={filters.page || 1}
      searchParams={searchParams}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {klinikler.length === 0 ? (
        <EmptyState href="/klinikler" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {klinikler.map(k => <KlinikCard key={k.id} klinik={k as Klinik} />)}
        </div>
      )}
    </ListingLayout>
  );
}

function EmptyState({ href }: { href: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 32px', background: 'white', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="22" cy="22" r="14" stroke="#C7D2E0" strokeWidth="3"/>
          <path d="M32 32 43 43" stroke="#C7D2E0" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Sonuç bulunamadı</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Filtreleri değiştirerek tekrar deneyin.</p>
      <a href={href} className="btn btn-navy" style={{ marginTop: 16, display: 'inline-flex' }}>Filtreleri Temizle</a>
    </div>
  );
}
