export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { Eczane } from '@/lib/types';
import EczaneCard from '@/components/EczaneCard';
import ListingLayout from '@/components/ListingLayout';
import { resolveKonum } from '@/lib/il-koordinatlari';

const PAGE_SIZE = 30;

export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il = searchParams.il || ''; const nobetci = searchParams.nobetci || '';
  let title = 'Eczaneler';
  if (nobetci) title = 'Nöbetçi Eczaneler'; else if (il) title = `${il} Eczaneleri`;
  const desc = `${il || 'Türkiye'} bölgesindeki eczaneler ve nöbetçi eczane bilgileri. Hekimhane'de hızlıca bulun.`;
  return { title, description: desc, openGraph: { title: `${title} | Hekimhane`, description: desc } };
}

async function getEczaneler(filters: Record<string, string | undefined> & { page?: number }) {
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  let query = supabase.from('eczaneler').select('*', { count: 'exact' })
    .order('nobetci', { ascending: false }).order('name', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (filters.il)      query = query.eq('il', filters.il);
  if (filters.ilce)    query = query.eq('ilce', filters.ilce);
  if (filters.nobetci) query = query.eq('nobetci', true);
  if (filters.q)       query = query.ilike('name', `%${filters.q}%`);
  const { data, count, error } = await query;
  if (error) console.error(error);
  return { data: (data || []) as Eczane[], count: count || 0 };
}

// Şehir sayıları — aktif nobetci filtresi dikkate alınır
async function getIller(nobetci?: string) {
  let query = supabase.from('eczaneler').select('il').not('il', 'is', null).limit(100000);
  if (nobetci) query = query.eq('nobetci', true);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { il: string | null }) => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([il, count]) => ({ value: il, label: il, count }));
}

async function getKonumlar(filters: Record<string, string | undefined>) {
  let query = supabase.from('eczaneler')
    .select('id,name,lat,lng,tel,nobetci,il,ilce,slug')
    .not('lat', 'is', null).not('lng', 'is', null)
    .neq('lat', 0).neq('lng', 0);
  if (filters.il)      query = query.eq('il', filters.il);
  if (filters.ilce)    query = query.eq('ilce', filters.ilce);
  if (filters.nobetci) query = query.eq('nobetci', true);
  if (filters.q)       query = query.ilike('name', `%${filters.q}%`);
  const { data } = await query.limit(5000);
  return data || [];
}

export default async function EczanelerPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const filters = {
    il:      searchParams.il      || undefined,
    ilce:    searchParams.ilce    || undefined,
    nobetci: searchParams.nobetci || undefined,
    q:       searchParams.q       || undefined,
    page:    searchParams.page    ? parseInt(searchParams.page) : 1,
  };

  const [{ data: eczaneler, count }, illerWithCount, konumlar] = await Promise.all([
    getEczaneler(filters),
    getIller(filters.nobetci),
    getKonumlar(filters),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const title = filters.nobetci ? 'Nöbetçi Eczaneler'
    : filters.ilce ? `${filters.ilce} Eczaneleri`
    : filters.il   ? `${filters.il} Eczaneleri`
    : 'Tüm Eczaneler';

  return (
    <ListingLayout
      basePath="/eczaneler"
      entityLabel="eczane"
      entityLabelPlural="eczane"
      color="#6D28D9"
      gradient="linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
      icon={
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/>
          <path d="m8.5 8.5 7 7"/>
        </svg>
      }
      iconBg="linear-gradient(135deg,#7C3AED,#6D28D9)"
      title={title}
      count={count}
      cityCount={illerWithCount.length}
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Eczaneler', href: '/eczaneler' },
        ...(filters.il ? [{ label: filters.il, href: `/eczaneler?il=${encodeURIComponent(filters.il)}` }] : []),
        ...(filters.nobetci ? [{ label: 'Nöbetçi', href: '/eczaneler?nobetci=true' }] : []),
      ]}
      filterSections={[
        { key: 'q', label: 'Arama', type: 'search', placeholder: 'Eczane ara...' },
        {
          key: 'nobetci',
          label: 'Nöbet Durumu',
          type: 'radio',
          options: [{ value: 'true', label: 'Nöbetçi Eczaneler' }],
        },
        { key: 'il', label: 'Şehir', type: 'radio', options: illerWithCount },
      ]}
      activeFilters={{ il: filters.il, ilce: filters.ilce, nobetci: filters.nobetci, q: filters.q }}
      hasActiveFilters={!!(filters.il || filters.ilce || filters.nobetci || filters.q)}
      markers={konumlar.map(e => ({
        id: e.id, name: e.name, lat: e.lat, lng: e.lng, tel: e.tel,
        type: e.nobetci ? 'Nöbetçi' : 'Eczane',
        il: e.il, ilce: e.ilce,
        href: e.slug ? `/eczaneler/${e.slug}` : `/eczaneler/${e.id}`,
      }))}
      totalPages={totalPages}
      currentPage={filters.page || 1}
      searchParams={searchParams}
    >
      {eczaneler.length === 0 ? (
        <EmptyState href="/eczaneler" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {eczaneler.map(e => <EczaneCard key={e.id} eczane={e} />)}
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
