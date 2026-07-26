export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Klinik } from '@/lib/types';
import { toSlug } from '@/lib/helpers';
import { DENTAL_SPECIALTIES, synonymsForSpec } from '@/lib/uzmanlik-data';
import KlinikCard from '@/components/KlinikCard';

interface Props { params: { il: string; uzmanlik: string } }

const DENTAL_ITEMS = DENTAL_SPECIALTIES;
const synonymsFor = synonymsForSpec;

async function fetchAll<T = any>(build: () => any, max = 20000): Promise<T[]> {
  noStore();
  const PAGE = 1000; const out: T[] = [];
  for (let f = 0; f < max; f += PAGE) {
    const { data, error } = await build().range(f, f + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

/** il slug → gerçek il adı (klinikler'de var olan) */
async function resolveIl(ilSlug: string): Promise<string | null> {
  const rows = await fetchAll<{ il: string | null }>(() => supabase.from('klinikler').select('il').not('il', 'is', null));
  const set = Array.from(new Set(rows.map(r => r.il!).filter(Boolean)));
  for (const il of set) if (toSlug(il) === ilSlug) return il;
  return null;
}

/** uzmanlik slug → kanonik diş uzmanlığı adı */
function resolveSpec(uzmSlug: string): string | null {
  for (const item of DENTAL_ITEMS) if (toSlug(item) === uzmSlug) return item;
  return null;
}

async function getData(ilSlug: string, uzmSlug: string) {
  const il = await resolveIl(ilSlug);
  const spec = resolveSpec(uzmSlug);
  if (!il || !spec) return null;
  const syn = synonymsFor(spec);
  const klinikler = await fetchAll<Klinik>(() =>
    supabase.from('klinikler').select('*').eq('il', il).overlaps('specs', syn));
  // Bu ildeki diğer diş uzmanlıkları (iç linkleme için)
  const ilRows = await fetchAll<{ specs: string[] | null }>(() =>
    supabase.from('klinikler').select('specs').eq('il', il).not('specs', 'is', null));
  const ilSpecSet = new Set<string>();
  ilRows.forEach(r => (r.specs || []).forEach(s => ilSpecSet.add(s)));
  const relatedSpecs = DENTAL_ITEMS.filter(item =>
    item !== spec && synonymsFor(item).some(s => ilSpecSet.has(s)));
  return { il, spec, klinikler, relatedSpecs };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const il = await resolveIl(params.il);
  const spec = resolveSpec(params.uzmanlik);
  if (!il || !spec) return { title: 'Sayfa Bulunamadı' };
  const title = `${il} ${spec} — Diş Hekimleri`;
  const desc = `${il}'da ${spec} alanında hizmet veren diş hekimleri ve klinikler. Adres, telefon, hasta yorumları ve online randevu bilgileri Hekimhane'de.`;
  const canonical = `https://hekimhane.com.tr/dis-tedavileri/${params.il}/${params.uzmanlik}`;
  return {
    title,
    description: desc,
    keywords: [`${il} ${spec}`, `${il} diş hekimi`, spec, `${il} ${spec} fiyatları`, `${il} diş kliniği`],
    alternates: { canonical },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

export default async function DisTedaviPage({ params }: Props) {
  const res = await getData(params.il, params.uzmanlik);
  if (!res) notFound();
  const { il, spec, klinikler, relatedSpecs } = res;

  const ilPath = toSlug(il);
  const sorted = [...klinikler].sort((a, b) => (b.rev || 0) - (a.rev || 0) || (b.rat || 0) - (a.rat || 0));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://hekimhane.com.tr' },
          { '@type': 'ListItem', position: 2, name: 'Diş Klinikleri', item: 'https://hekimhane.com.tr/klinikler' },
          { '@type': 'ListItem', position: 3, name: il, item: `https://hekimhane.com.tr/klinikler?il=${encodeURIComponent(il)}` },
          { '@type': 'ListItem', position: 4, name: `${il} ${spec}`, item: `https://hekimhane.com.tr/dis-tedavileri/${params.il}/${params.uzmanlik}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${il} ${spec}`,
        numberOfItems: sorted.length,
        itemListElement: sorted.slice(0, 20).map((k, i) => ({
          '@type': 'ListItem', position: i + 1, name: k.name,
          url: k.slug ? `https://hekimhane.com.tr/klinikler/${toSlug(k.il || 'turkiye')}/${toSlug(k.ilce || 'merkez')}/${k.slug}` : undefined,
        })),
      },
    ],
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '20px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/klinikler" style={{ color: 'inherit', textDecoration: 'none' }}>Diş Klinikleri</Link><span>›</span>
            <Link href={`/klinikler?il=${encodeURIComponent(il)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{il}</Link><span>›</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{spec}</span>
          </nav>

          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            {il} {spec}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 8, maxWidth: 720, lineHeight: 1.6 }}>
            {il}'da <strong>{spec}</strong> alanında hizmet veren {sorted.length} diş hekimi ve klinik. Puanları, hasta yorumları ve iletişim bilgileriyle karşılaştırın, size en uygun uzmanı bulun.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
            <i className="fa-solid fa-tooth" style={{ color: 'var(--gold)' }} /> {sorted.length} sonuç
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        {/* Sonuç listesi */}
        {sorted.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              {il}'da {spec} alanında henüz kayıt yok.<br />
              <Link href={`/klinikler?il=${encodeURIComponent(il)}`} style={{ color: 'var(--navy)', fontWeight: 700 }}>{il}'daki tüm diş hekimlerini</Link> görüntüleyin.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.map(k => <KlinikCard key={k.id} klinik={k} />)}
          </div>
        )}

        {/* İç linkleme: bu ildeki diğer uzmanlıklar */}
        {relatedSpecs.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
              {il}'da Diğer Diş Tedavileri
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {relatedSpecs.map(s => (
                <Link key={s} href={`/dis-tedavileri/${ilPath}/${toSlug(s)}`}
                  style={{ padding: '8px 14px', borderRadius: 20, background: 'white', border: '1px solid var(--border)', color: 'var(--navy2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  {il} {s}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* İç linkleme: diğer büyük illerde aynı uzmanlık */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
            Diğer Şehirlerde {spec}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Muğla'].filter(c => toSlug(c) !== ilPath).map(c => (
              <Link key={c} href={`/dis-tedavileri/${toSlug(c)}/${params.uzmanlik}`}
                style={{ padding: '8px 14px', borderRadius: 20, background: 'white', border: '1px solid var(--border)', color: 'var(--navy2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {c} {spec}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
