export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Klinik } from '@/lib/types';
import { toSlug } from '@/lib/helpers';
import { DENTAL_SPECIALTIES, synonymsForSpec, TREATMENTS, buildDentalFaq } from '@/lib/uzmanlik-data';
import KlinikCard from '@/components/KlinikCard';

interface Props { params: { il: string; ilce: string } }

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

async function resolve(ilSlug: string, ilceSlug: string) {
  const ilRows = await fetchAll<{ il: string | null }>(() => supabase.from('klinikler').select('il').not('il', 'is', null));
  const il = Array.from(new Set(ilRows.map(r => r.il!).filter(Boolean))).find(x => toSlug(x) === ilSlug) || null;
  if (!il) return null;
  const ilceRows = await fetchAll<{ ilce: string | null }>(() => supabase.from('klinikler').select('ilce').eq('il', il).not('ilce', 'is', null));
  const ilce = Array.from(new Set(ilceRows.map(r => r.ilce!).filter(Boolean))).find(x => toSlug(x) === ilceSlug) || null;
  if (!ilce) return null;
  return { il, ilce };
}

async function getData(ilSlug: string, ilceSlug: string) {
  const r = await resolve(ilSlug, ilceSlug);
  if (!r) return null;
  const { il, ilce } = r;
  const klinikler = await fetchAll<Klinik>(() => supabase.from('klinikler').select('*').eq('il', il).eq('ilce', ilce));
  if (klinikler.length === 0) return null;
  const specSet = new Set<string>();
  klinikler.forEach(k => (k.specs || []).forEach(s => specSet.add(s)));
  const availSpecs = DENTAL_SPECIALTIES.filter(item => synonymsForSpec(item).some(s => specSet.has(s)));
  return { il, ilce, klinikler, availSpecs };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getData(params.il, params.ilce);
  if (!d) return { title: 'Sayfa Bulunamadı' };
  const title = `${d.ilce} ${d.il} Diş Klinikleri ve Diş Hekimleri`;
  const desc = `${d.ilce}, ${d.il} bölgesindeki ${d.klinikler.length} diş kliniği ve diş hekimi. Puanlar, hasta yorumları, adres, telefon ve online randevu bilgileriyle karşılaştırın.`;
  const canonical = `https://hekimhane.com.tr/klinikler/${params.il}/${params.ilce}`;
  return {
    title,
    description: desc,
    keywords: [`${d.ilce} diş kliniği`, `${d.ilce} diş hekimi`, `${d.ilce} ${d.il} diş`, `${d.il} diş kliniği`],
    alternates: { canonical },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

const chip = { padding: '8px 14px', borderRadius: 20, background: 'white', border: '1px solid var(--border)', color: 'var(--navy2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' as const };

export default async function IlceKlinikPage({ params }: Props) {
  const d = await getData(params.il, params.ilce);
  if (!d) notFound();
  const { il, ilce, klinikler, availSpecs } = d;
  const ilPath = toSlug(il); const ilcePath = toSlug(ilce);
  const sorted = [...klinikler].sort((a, b) => (b.rev || 0) - (a.rev || 0) || (b.rat || 0) - (a.rat || 0));
  const faq = buildDentalFaq({ il, ilce, label: 'diş hekimi', count: sorted.length });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://hekimhane.com.tr' },
          { '@type': 'ListItem', position: 2, name: 'Diş Klinikleri', item: 'https://hekimhane.com.tr/klinikler' },
          { '@type': 'ListItem', position: 3, name: il, item: `https://hekimhane.com.tr/klinikler?il=${encodeURIComponent(il)}` },
          { '@type': 'ListItem', position: 4, name: ilce, item: `https://hekimhane.com.tr/klinikler/${ilPath}/${ilcePath}` },
        ],
      },
      {
        '@type': 'ItemList', name: `${ilce} ${il} Diş Klinikleri`, numberOfItems: sorted.length,
        itemListElement: sorted.slice(0, 20).map((k, i) => ({
          '@type': 'ListItem', position: i + 1, name: k.name,
          url: k.slug ? `https://hekimhane.com.tr/klinikler/${toSlug(k.il || 'turkiye')}/${toSlug(k.ilce || 'merkez')}/${k.slug}` : undefined,
        })),
      },
      { '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '20px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/klinikler" style={{ color: 'inherit', textDecoration: 'none' }}>Diş Klinikleri</Link><span>›</span>
            <Link href={`/klinikler?il=${encodeURIComponent(il)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{il}</Link><span>›</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{ilce}</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            {ilce} Diş Klinikleri
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
            {ilce}, {il} bölgesindeki {sorted.length} diş kliniği ve diş hekimi. Puanları, hasta yorumları ve iletişim bilgileriyle karşılaştırın, size en yakın diş hekimini bulun.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
            <i className="fa-solid fa-tooth" style={{ color: 'var(--gold)' }} /> {sorted.length} klinik
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(k => <KlinikCard key={k.id} klinik={k} />)}
        </div>

        {availSpecs.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>{ilce}'de Diş Tedavileri</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {availSpecs.map(s => (
                <Link key={s} href={`/dis-tedavileri/${ilPath}/${ilcePath}/${toSlug(s)}`} style={chip}>{ilce} {s}</Link>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>{ilce}'de Popüler Tedaviler</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {TREATMENTS.slice(0, 8).map(t => (
              <Link key={t.slug} href={`/dis-tedavileri/${ilPath}/${ilcePath}/${t.slug}`} style={chip}>{ilce} {t.name}</Link>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Sıkça Sorulan Sorular</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faq.map((f, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '16px 18px' }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{f.q}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
