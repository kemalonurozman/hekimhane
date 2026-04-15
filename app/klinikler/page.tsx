import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { KlinikFilters, Klinik } from '@/lib/types';
import KlinikCard from '@/components/KlinikCard';
import FilterPanel from '@/components/FilterPanel';

const PAGE_SIZE = 20;

// ── Dinamik SEO meta ──────────────────────────────────────────────
export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il       = searchParams.il || '';
  const ilce     = searchParams.ilce || '';
  const uzmanlik = searchParams.uzmanlik || '';
  const tip      = searchParams.tip || '';

  let title = 'Diş Klinikleri';
  const parts: string[] = [];
  if (uzmanlik) parts.push(uzmanlik);
  if (tip)      parts.push(tip);
  if (ilce)     parts.push(ilce);
  else if (il)  parts.push(il);
  if (parts.length) title = parts.join(', ') + ' — Diş Klinikleri';

  const desc = `${parts.join(', ')} bölgesindeki diş klinikleri, yorumlar ve iletişim bilgileri. Hekimhane'de hızlıca karşılaştırın.`;

  return {
    title,
    description: desc,
    openGraph: { title: `${title} | Hekimhane`, description: desc },
  };
}

// ── Server-side veri çekimi ───────────────────────────────────────
async function getKlinikler(filters: KlinikFilters) {
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  let query = supabase
    .from('klinikler')
    .select('*', { count: 'exact' })
    .order('rat', { ascending: false })
    .range(from, to);

  if (filters.il)       query = query.eq('il', filters.il);
  if (filters.ilce)     query = query.eq('ilce', filters.ilce);
  if (filters.tip)      query = query.eq('type', filters.tip);
  if (filters.uzmanlik) query = query.contains('specs', [filters.uzmanlik]);
  if (filters.minRat)   query = query.gte('rat', filters.minRat);
  if (filters.q)        query = query.ilike('name', `%${filters.q}%`);

  const { data, count, error } = await query;
  if (error) console.error('Klinik query error:', error);
  return { data: data || [], count: count || 0 };
}

// İl listesi için
async function getIller() {
  const { data } = await supabase
    .from('klinikler')
    .select('il')
    .not('il', 'is', null)
    .order('il');

  const unique = [...new Set((data || []).map(r => r.il).filter(Boolean))];
  return unique as string[];
}

// ── Sayfa Bileşeni ───────────────────────────────────────────────
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

  const [{ data: klinikler, count }, iller] = await Promise.all([
    getKlinikler(filters),
    getIller(),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Breadcrumb
  const breadcrumb = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Klinikler', href: '/klinikler' },
    ...(filters.il ? [{ label: filters.il, href: `/klinikler?il=${filters.il}` }] : []),
    ...(filters.ilce ? [{ label: filters.ilce, href: `/klinikler?il=${filters.il}&ilce=${filters.ilce}` }] : []),
  ];

  return (
    <div style={{ paddingTop: '66px' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          {breadcrumb.map((b, i) => (
            <span key={b.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {i > 0 && <i className="fa-solid fa-chevron-right" style={{ fontSize: '8px' }} />}
              {i === breadcrumb.length - 1
                ? <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{b.label}</span>
                : <Link href={b.href} style={{ color: 'var(--navy)', fontWeight: 500 }}>{b.label}</Link>
              }
            </span>
          ))}
        </div>
      </div>

      {/* Başlık */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)',
        padding: '32px 0',
      }}>
        <div className="container">
          <h1 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '6px'
          }}>
            {filters.uzmanlik
              ? `${filters.uzmanlik} Klinikleri`
              : filters.ilce
              ? `${filters.ilce} Diş Klinikleri`
              : filters.il
              ? `${filters.il} Diş Klinikleri`
              : 'Tüm Diş Klinikleri'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            {count.toLocaleString('tr')} klinik bulundu
          </p>
        </div>
      </div>

      {/* İçerik */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '24px',
        padding: '32px',
        alignItems: 'start',
      }}>
        {/* Filter Panel — client component */}
        <FilterPanel iller={iller} filters={filters} />

        {/* Sonuçlar */}
        <div>
          {klinikler.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 32px',
              background: 'white', borderRadius: '20px',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Sonuç bulunamadı</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Filtreleri değiştirerek tekrar deneyin.
              </p>
              <Link href="/klinikler" className="btn btn-navy" style={{ marginTop: '16px', display: 'inline-flex' }}>
                Filtreleri Temizle
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {klinikler.map(k => (
                  <KlinikCard key={k.id} klinik={k} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '8px',
                  marginTop: '32px', flexWrap: 'wrap',
                }}>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(p));
                    return (
                      <Link
                        key={p}
                        href={`/klinikler?${params.toString()}`}
                        style={{
                          width: '36px', height: '36px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '8px',
                          fontWeight: 600, fontSize: '14px',
                          background: filters.page === p ? 'var(--navy)' : 'white',
                          color: filters.page === p ? 'white' : 'var(--text)',
                          border: `1px solid ${filters.page === p ? 'var(--navy)' : 'var(--border)'}`,
                          transition: '0.15s',
                        }}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
