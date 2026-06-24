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
  const il = searchParams.il || ''; const ilce = searchParams.ilce || ''; const uzmanlik = searchParams.uzmanlik || ''; const tip = searchParams.tip || '';
  let title = 'Diş Klinikleri';
  const parts: string[] = [];
  if (uzmanlik) parts.push(uzmanlik); if (tip) parts.push(tip); if (ilce) parts.push(ilce); else if (il) parts.push(il);
  if (parts.length) title = parts.join(', ') + ' — Diş Klinikleri';
  const desc = `${parts.join(', ')} bölgesindeki diş klinikleri, yorumlar ve iletişim bilgileri. Hekimhane'de hızlıca karşılaştırın.`;
  return { title, description: desc, openGraph: { title: `${title} | Hekimhane`, description: desc } };
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
async function getIller(uzmanlik?: string) {
  let query = supabase.from('klinikler').select('il').not('il', 'is', null).limit(100000);
  if (uzmanlik) query = (query as any).contains('specs', [uzmanlik]);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { il: string | null }) => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([il, count]) => ({ value: il, label: il, count }));
}

// Uzmanlık sayıları — aktif il filtresi dikkate alınır
async function getUzmanliklar(il?: string) {
  let query = supabase.from('klinikler').select('specs').not('specs', 'is', null).limit(100000);
  if (il) query = query.eq('il', il);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { specs: string[] | null }) => {
    (r.specs || []).forEach(s => { if (s) map[s] = (map[s] || 0) + 1; });
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([uzmanlik, count]) => ({ value: uzmanlik, label: uzmanlik, count }));
}

async function getKonumlar(filters: KlinikFilters) {
  // Yalnızca gerçek koordinatı olan klinikler — null ve 0 değerleri hariç
  let query = supabase.from('klinikler')
    .select('id,name,lat,lng,tel,type,il,ilce,slug')
    .not('lat', 'is', null).not('lng', 'is', null)
    .neq('lat', 0).neq('lng', 0);
  if (filters.il)       query = query.eq('il', filters.il);
  if (filters.ilce)     query = query.eq('ilce', filters.ilce);
  if (filters.tip)      query = query.eq('type', filters.tip);
  if (filters.uzmanlik) query = (query as any).contains('specs', [filters.uzmanlik]);
  if (filters.q)        query = query.ilike('name', `%${filters.q}%`);
  const { data } = await query.limit(5000);
  return data || [];
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

  const [{ data: klinikler, count }, illerWithCount, uzmanliklarWithCount, konumlar] = await Promise.all([
    getKlinikler(filters),
    getIller(filters.uzmanlik),
    getUzmanliklar(filters.il),
    getKonumlar(filters),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const title = filters.uzmanlik ? `${filters.uzmanlik} Klinikleri`
    : filters.ilce ? `${filters.ilce} Diş Klinikleri`
    : filters.il   ? `${filters.il} Diş Klinikleri`
    : 'Tüm Diş Klinikleri';

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
