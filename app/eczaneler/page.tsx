export const dynamic = 'force-dynamic';
import HkIconAnim from '@/components/HkIconAnim';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { Eczane } from '@/lib/types';
import EczaneCard from '@/components/EczaneCard';
import ListingLayout from '@/components/ListingLayout';
import { eczaneListesi, type EczaneOzet } from '@/lib/eczane-liste';
import { eczaneIndeksi } from '@/lib/eczane-indeks';

const PAGE_SIZE = 30;

export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il = searchParams.il || ''; const ilce = searchParams.ilce || ''; const nobetci = searchParams.nobetci || '';
  const yer = ilce && il ? `${il} ${ilce}` : il;
  let title = 'Eczaneler';
  if (nobetci) title = yer ? `${yer} Nöbetçi Eczaneler` : 'Nöbetçi Eczaneler';
  else if (yer) title = `${yer} Eczaneleri`;
  const desc = `${yer || 'Türkiye'} bölgesindeki eczaneler ve nöbetçi eczane bilgileri. Hekimhane'de hızlıca bulun.`;
  const qs = new URLSearchParams();
  if (il) qs.set('il', il); if (ilce) qs.set('ilce', ilce); if (nobetci) qs.set('nobetci', nobetci);
  const canonical = `https://www.hekimhane.com.tr/eczaneler${qs.toString() ? `?${qs.toString()}` : ''}`;
  return { title, description: desc, alternates: { canonical }, openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical } };
}

/** Sayfadaki kayıtların tam satırları — indeksteki sırayla. */
async function sayfaKayitlari(ids: string[], ilceById: Record<string, string>): Promise<Eczane[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase.from('eczaneler').select('*').in('id', ids);
  if (error) console.error('eczaneler sayfa:', error.message);
  const byId = new Map(((data || []) as Eczane[]).map(e => [e.id, e]));
  return ids.map(id => byId.get(id)).filter(Boolean)
    // ilçesi boş kayıtlarda addan türetilen ilçe kartta da görünsün
    .map(e => (!e!.ilce && ilceById[e!.id] ? { ...e!, ilce: ilceById[e!.id] } : e!));
}

export default async function EczanelerPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const sayfa = Math.max(1, parseInt(searchParams.page || '1') || 1);
  const filters = {
    il:      searchParams.il      || undefined,
    ilce:    searchParams.ilce    || undefined,
    nobetci: searchParams.nobetci || undefined,
    q:       (searchParams.q || '').trim() || undefined,
    page:    sayfa,
  };

  // Veritabanına ulaşılamazsa sayfa boş liste ile yine açılır (graceful)
  let indeks: EczaneOzet[] = [];
  try { indeks = await eczaneIndeksi(); } catch (e) { console.error('eczane indeksi:', e); }
  const liste = eczaneListesi(indeks, { il: filters.il, ilce: filters.ilce, nobetci: !!filters.nobetci, q: filters.q }, sayfa, PAGE_SIZE);
  const eczaneler = await sayfaKayitlari(liste.ids, liste.ilceById);
  const count = liste.toplam;
  const illerWithCount = liste.iller;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const yer = filters.ilce && filters.il ? `${filters.il} ${filters.ilce}` : filters.il;
  const title = filters.nobetci ? (yer ? `${yer} Nöbetçi Eczaneler` : 'Nöbetçi Eczaneler')
    : yer ? `${yer} Eczaneleri`
    : 'Tüm Eczaneler';

  return (
    <>
    {/* Konum bazlı arama banner'ı — yükseklik 66px: ListingLayout'un kendi
        paddingTop:66 boşluğunu marginBottom:-66 ile telafi ediyoruz */}
    <div style={{
      background: '#F5F3FF', borderBottom: '1px solid #EDE9FE',
      marginTop: 64, marginBottom: -66, height: 66,
      position: 'relative', zIndex: 5,
      display: 'flex', alignItems: 'center', boxSizing: 'border-box',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, color: '#4C1D95', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
          Size en yakın eczaneyi mi arıyorsunuz?
        </span>
        <a href="/yakin-eczane" style={{
          padding: '7px 18px', borderRadius: 10, background: '#6D28D9', color: 'white',
          fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '-.1px',
        }}>
          Konumumla Bul
        </a>
      </div>
    </div>
    <ListingLayout
      basePath="/eczaneler"
      entityLabel="eczane"
      entityLabelPlural="eczane"
      color="#6D28D9"
      gradient="linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
      icon={<HkIconAnim name="pharmacy" size={36} playOnView />}
      iconBg="linear-gradient(135deg,#7C3AED,#6D28D9)"
      title={title}
      count={count}
      cityCount={illerWithCount.length}
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Eczaneler', href: '/eczaneler' },
        ...(filters.il ? [{ label: filters.il, href: `/eczaneler?il=${encodeURIComponent(filters.il)}` }] : []),
        ...(filters.il && filters.ilce ? [{ label: filters.ilce, href: `/eczaneler?il=${encodeURIComponent(filters.il)}&ilce=${encodeURIComponent(filters.ilce)}` }] : []),
        ...(filters.nobetci ? [{ label: 'Nöbetçi', href: '/eczaneler?nobetci=true' }] : []),
      ]}
      filterSections={[
        { key: 'q', label: 'Arama', type: 'search', placeholder: 'Eczane adı yazın…', oneriUrl: '/api/eczane-ara' },
        {
          key: 'nobetci',
          label: 'Nöbet Durumu',
          type: 'radio',
          options: [{ value: 'true', label: 'Nöbetçi Eczaneler' }],
        },
        { key: 'il', label: 'Şehir', type: 'radio', options: illerWithCount },
        // İlçe yalnız şehir seçiliyken ve o şehirde ilçesi bilinen eczane varken
        ...(filters.il && liste.ilceler.length > 0
          ? [{ key: 'ilce', label: `${filters.il} İlçeleri`, type: 'radio' as const, options: liste.ilceler }]
          : []),
      ]}
      activeFilters={{ il: filters.il, ilce: filters.ilce, nobetci: filters.nobetci, q: filters.q }}
      hasActiveFilters={!!(filters.il || filters.ilce || filters.nobetci || filters.q)}
      totalPages={totalPages}
      currentPage={sayfa}
      searchParams={searchParams}
    >
      {eczaneler.length === 0 ? (
        <EmptyState href="/eczaneler" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {eczaneler.map((e, i) => {
            // Liste il (şehir seçiliyse ilçe) sırasıyla gelir → grup değişince ara başlık
            const grup = filters.il ? (e.ilce || 'İlçesi belirtilmemiş') : (e.il || 'Şehri belirtilmemiş');
            const onceki = i > 0 ? (filters.il ? (eczaneler[i - 1].ilce || 'İlçesi belirtilmemiş') : (eczaneler[i - 1].il || 'Şehri belirtilmemiş')) : null;
            const grupSayisi = filters.il
              ? (filters.ilce ? count : liste.ilceler.find(x => x.value === e.ilce)?.count)
              : illerWithCount.find(x => x.value === e.il)?.count;
            return (
              <div key={e.id} style={{ display: 'contents' }}>
                {grup !== onceki && !filters.ilce && (
                  <div className="ecz-grup" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: i === 0 ? '0 4px 2px' : '14px 4px 2px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--ink, #1D1D1F)' }}>{grup}</h2>
                    {grupSayisi !== undefined && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{grupSayisi.toLocaleString('tr')} eczane</span>
                    )}
                  </div>
                )}
                <EczaneCard eczane={e} />
              </div>
            );
          })}
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
