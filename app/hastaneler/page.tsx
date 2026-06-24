export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { Hastane } from '@/lib/types';
import HastaneCard from '@/components/HastaneCard';
import ListingLayout from '@/components/ListingLayout';
import { resolveKonum } from '@/lib/il-koordinatlari';

const PAGE_SIZE = 20;
const TR = (s: string) => (s||'').toLowerCase()
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il  = searchParams.il  || '';
  const tip = searchParams.tip || '';
  let title = 'Hastaneler';
  const parts: string[] = [];
  if (tip) parts.push(tip);
  if (il)  parts.push(il);
  if (parts.length) title = parts.join(', ') + ' — Hastaneler';
  const desc = `${parts.join(', ')} bölgesindeki hastaneler, yorumlar ve iletişim bilgileri. Hekimhane'de karşılaştırın.`;
  return { title, description: desc, openGraph: { title: `${title} | Hekimhane`, description: desc } };
}

async function getHastaneler(filters: Record<string, string | undefined> & { page?: number }) {
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  let query = supabase.from('hastaneler').select('*', { count: 'exact' })
    .order('rat', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (filters.il)   query = query.eq('il', filters.il);
  if (filters.ilce) query = query.eq('ilce', filters.ilce);
  if (filters.tip)  query = query.eq('type', filters.tip);
  if (filters.q)    query = query.ilike('name', `%${filters.q}%`);
  const { data, count, error } = await query;
  if (error) console.error(error);
  return { data: (data || []) as Hastane[], count: count || 0 };
}

// Şehir sayıları — aktif tip filtresi varsa sadece o türden sayar
async function getIller(tip?: string) {
  let query = supabase.from('hastaneler').select('il').not('il', 'is', null).limit(100000);
  if (tip) query = query.eq('type', tip);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { il: string | null }) => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([il, count]) => ({ value: il, label: il, count }));
}

// Tür sayıları — aktif il filtresi varsa sadece o şehirden sayar
async function getTipler(il?: string) {
  let query = supabase.from('hastaneler').select('type').not('type', 'is', null).limit(100000);
  if (il) query = query.eq('il', il);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { type: string | null }) => { if (r.type) map[r.type] = (map[r.type] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ value: type, label: type, count }));
}

async function getKonumlar(filters: Record<string, string | undefined>) {
  let query = supabase.from('hastaneler')
    .select('id,name,lat,lng,tel,type,il,ilce,slug')
    .not('lat', 'is', null).not('lng', 'is', null)
    .neq('lat', 0).neq('lng', 0);
  if (filters.il)   query = query.eq('il', filters.il);
  if (filters.ilce) query = query.eq('ilce', filters.ilce);
  if (filters.tip)  query = query.eq('type', filters.tip);
  if (filters.q)    query = query.ilike('name', `%${filters.q}%`);
  const { data } = await query.limit(5000);
  return data || [];
}

export default async function HastanelerPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const filters = {
    il:   searchParams.il   || undefined,
    ilce: searchParams.ilce || undefined,
    tip:  searchParams.tip  || undefined,
    q:    searchParams.q    || undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  const [{ data: hastaneler, count }, illerWithCount, tiplerWithCount, konumlar] = await Promise.all([
    getHastaneler(filters),
    getIller(filters.tip),
    getTipler(filters.il),
    getKonumlar(filters),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const title = filters.ilce ? `${filters.ilce} Hastaneleri`
    : filters.il  ? `${filters.il} Hastaneleri`
    : filters.tip ? `${filters.tip}`
    : 'Tüm Hastaneler';

  return (
    <ListingLayout
      basePath="/hastaneler"
      entityLabel="hastane"
      entityLabelPlural="hastane"
      color="#065F46"
      gradient="linear-gradient(135deg, #065F46 0%, #047857 100%)"
      icon={
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
      }
      iconBg="linear-gradient(135deg,#065F46,#047857)"
      title={title}
      count={count}
      cityCount={illerWithCount.length}
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Hastaneler', href: '/hastaneler' },
        ...(filters.il ? [{ label: filters.il, href: `/hastaneler?il=${encodeURIComponent(filters.il)}` }] : []),
      ]}
      filterSections={[
        { key: 'q', label: 'Arama', type: 'search', placeholder: 'Hastane ara...' },
        { key: 'il',  label: 'Şehir', type: 'radio', options: illerWithCount },
        { key: 'tip', label: 'Tür',   type: 'radio', options: tiplerWithCount },
      ]}
      activeFilters={{ il: filters.il, ilce: filters.ilce, tip: filters.tip, q: filters.q }}
      hasActiveFilters={!!(filters.il || filters.ilce || filters.tip || filters.q)}
      markers={konumlar.map(h => ({
        id: h.id, name: h.name, lat: h.lat, lng: h.lng, tel: h.tel, type: h.type,
        il: h.il, ilce: h.ilce,
        href: h.slug ? `/hastaneler/${TR(h.il||'turkiye')}/${TR(h.ilce||'merkez')}/${h.slug}` : `/hastaneler/${h.id}`,
      }))}
      totalPages={totalPages}
      currentPage={filters.page || 1}
      searchParams={searchParams}
    >
      {hastaneler.length === 0 ? (
        <EmptyState href="/hastaneler" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hastaneler.map(h => <HastaneCard key={h.id} hastane={h} />)}
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
