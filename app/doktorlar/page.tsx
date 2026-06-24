export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { Doktor } from '@/lib/types';
import DoktorCard from '@/components/DoktorCard';
import ListingLayout from '@/components/ListingLayout';
import { IL_KONUM } from '@/lib/il-koordinatlari';

const PAGE_SIZE = 20;

export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il = searchParams.il || ''; const spec = searchParams.spec || '';
  let title = 'Doktorlar';
  const parts: string[] = [];
  if (spec) parts.push(spec); if (il) parts.push(il);
  if (parts.length) title = parts.join(', ') + ' — Doktorlar';
  const desc = `${parts.join(', ')} bölgesindeki doktorlar, yorumlar ve randevu bilgileri. Hekimhane'de bulun.`;
  return { title, description: desc, openGraph: { title: `${title} | Hekimhane`, description: desc } };
}

// Diş Hekimleri Klinikler bölümünde yer aldığı için Doktorlar'dan hariç tutulur
const DIS_HEKIMI_SPECS = ['Diş Hekimi', 'Diş Hekimliği', 'Dişçi'];

async function getDoktorlar(filters: Record<string, string | undefined> & { page?: number }) {
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  let query = supabase.from('doktorlar').select('*', { count: 'exact' })
    .order('rat', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  // Diş hekimlerini hariç tut
  query = (query as any).not('spec', 'in', `(${DIS_HEKIMI_SPECS.map(s => `"${s}"`).join(',')})`);
  if (filters.il)     query = query.eq('il', filters.il);
  if (filters.ilce)   query = query.eq('ilce', filters.ilce);
  if (filters.spec)   query = query.eq('spec', filters.spec);
  if (filters.online) query = query.eq('online', true);
  if (filters.q)      query = query.or(`ad.ilike.%${filters.q}%,soyad.ilike.%${filters.q}%,spec.ilike.%${filters.q}%`);
  const { data, count, error } = await query;
  if (error) console.error(error);
  return { data: (data || []) as Doktor[], count: count || 0 };
}

async function getIller(spec?: string) {
  // il + count — aktif spec filtresi varsa sadece o uzmanlıktan sayar
  let query = (supabase.from('doktorlar').select('il').not('il', 'is', null).limit(100000) as any)
    .not('spec', 'in', `(${DIS_HEKIMI_SPECS.map(s => `"${s}"`).join(',')})`);
  if (spec) query = query.eq('spec', spec);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { il: string | null }) => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([il, count]) => ({ value: il, label: il, count }));
}

async function getUzmanliklar(il?: string) {
  // spec + count — diş hekimliği hariç, aktif il filtresi varsa sadece o şehirden sayar
  let query = (supabase.from('doktorlar').select('spec').not('spec', 'is', null).limit(100000) as any)
    .not('spec', 'in', `(${DIS_HEKIMI_SPECS.map(s => `"${s}"`).join(',')})`);
  if (il) query = query.eq('il', il);
  const { data } = await query;
  const map: Record<string, number> = {};
  (data || []).forEach((r: { spec: string | null }) => { if (r.spec) map[r.spec] = (map[r.spec] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([spec, count]) => ({ value: spec, label: spec, count }));
}

async function getKonumlar(filters: Record<string, string | undefined>) {
  // Koordinatsız doktorları da dahil et — il merkezi fallback için
  let query = (supabase.from('doktorlar')
    .select('id,ad,soyad,lat,lng,tel,spec,il,ilce,slug')
    .not('il', 'is', null) as any)
    .not('spec', 'in', `(${DIS_HEKIMI_SPECS.map(s => `"${s}"`).join(',')})`);
  if (filters.il)   query = query.eq('il', filters.il);
  if (filters.ilce) query = query.eq('ilce', filters.ilce);
  if (filters.spec) query = query.eq('spec', filters.spec);
  if (filters.q)    query = query.or(`ad.ilike.%${filters.q}%,soyad.ilike.%${filters.q}%`);
  const { data } = await query.limit(5000);

  // Koordinatsızlara il merkezi ata
  return (data || []).map((d: any) => {
    if (d.lat && d.lng && d.lat !== 0 && d.lng !== 0) return d;
    const center = d.il ? IL_KONUM[d.il] : null;
    if (!center) return null;
    return { ...d, lat: center.lat, lng: center.lng };
  }).filter(Boolean);
}

export default async function DoktorlarPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const filters = {
    il:     searchParams.il     || undefined,
    ilce:   searchParams.ilce   || undefined,
    spec:   searchParams.spec   || undefined,
    online: searchParams.online || undefined,
    q:      searchParams.q      || undefined,
    page:   searchParams.page   ? parseInt(searchParams.page) : 1,
  };

  const [{ data: doktorlar, count }, illerWithCount, uzmanliklarWithCount, konumlar] = await Promise.all([
    getDoktorlar(filters),
    getIller(filters.spec),
    getUzmanliklar(filters.il),
    getKonumlar(filters),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const toplamDoktor = illerWithCount.reduce((s, i) => s + i.count, 0);

  // Diş hekimi spec'i ile gelinmişse kliniklere yönlendir
  const isDisHekimi = filters.spec && DIS_HEKIMI_SPECS.includes(filters.spec);

  const title = filters.spec && !isDisHekimi ? `${filters.spec} Doktorları`
    : filters.il ? `${filters.il} Doktorları`
    : 'Tüm Doktorlar';

  return (
    <>
      {isDisHekimi && (
        <div style={{ background: '#FEF9EC', border: '1px solid #F59E0B', borderRadius: 12, padding: '14px 20px', margin: '72px 32px 0', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <span>
            <strong>Diş hekimleri</strong> artık <a href="/klinikler" style={{ color: '#1B3A69', fontWeight: 700 }}>Klinikler</a> bölümünde listelenmiştir.
          </span>
        </div>
      )}
    <ListingLayout
      basePath="/doktorlar"
      entityLabel="doktor"
      entityLabelPlural="doktor"
      color="#92400E"
      gradient="linear-gradient(135deg, #92400E 0%, #B45309 100%)"
      icon={
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4"/>
          <path d="M5 21v-1a7 7 0 0 1 7-7 7 7 0 0 1 7 7v1"/>
          <path d="M16 11h3M17.5 9.5v3"/>
        </svg>
      }
      iconBg="linear-gradient(135deg,#92400E,#B45309)"
      title={title}
      count={count}
      cityCount={illerWithCount.length}
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Doktorlar', href: '/doktorlar' },
        ...(filters.spec ? [{ label: filters.spec, href: `/doktorlar?spec=${encodeURIComponent(filters.spec)}` }] : []),
        ...(filters.il ? [{ label: filters.il, href: `/doktorlar?il=${encodeURIComponent(filters.il)}` }] : []),
      ]}
      filterSections={[
        { key: 'q', label: 'Arama', type: 'search', placeholder: 'Doktor veya uzmanlık ara...' },
        { key: 'spec', label: 'Uzmanlık Alanı', type: 'radio', options: uzmanliklarWithCount },
        { key: 'il',   label: 'Şehir',           type: 'radio', options: illerWithCount },
      ]}
      activeFilters={{ il: filters.il, ilce: filters.ilce, spec: filters.spec, q: filters.q }}
      hasActiveFilters={!!(filters.il || filters.ilce || filters.spec || filters.q || filters.online)}
      markers={konumlar.map(d => ({
        id: d.id,
        name: `${d.ad} ${d.soyad}`.trim(),
        lat: d.lat, lng: d.lng, tel: d.tel, type: d.spec,
        il: d.il, ilce: d.ilce,
        href: d.slug ? `/doktorlar/${d.slug}` : `/doktorlar/${d.id}`,
      }))}
      totalPages={totalPages}
      currentPage={filters.page || 1}
      searchParams={searchParams}
    >
      {doktorlar.length === 0 ? (
        <EmptyState href="/doktorlar" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {doktorlar.map(d => <DoktorCard key={d.id} doktor={d} />)}
        </div>
      )}
    </ListingLayout>
    </>
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
