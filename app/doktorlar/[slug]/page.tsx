import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Doktor, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

async function getData(slug: string) {
  const { data: raw } = await supabase.from('doktorlar').select('*').eq('slug', slug).single();
  const d = raw as Doktor | null;
  if (!d) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'doktor').eq('entity_id', d.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = (rawYorumlar || []) as Yorum[];
  return { d, yorumlar };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('doktorlar').select('slug').not('slug','is',null);
  const rows = (data || []) as Pick<Doktor, 'slug'>[];
  return rows.map(d => ({ slug: d.slug||'' }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getData(params.slug);
  if (!res) return { title: 'Doktor Bulunamadı' };
  const { d } = res;
  const fullN  = `${d.unvan ? d.unvan + ' ' : ''}${d.ad} ${d.soyad}`.trim();
  const title  = `${fullN} — ${d.spec||'Doktor'}, ${d.il||''}`;
  const desc   = `${fullN} ${d.spec||'Doktor'} ${d.il||''} randevu, iletişim ve yorumlar. ${d.bio ? d.bio.slice(0,80) : ''}`.trim();
  const url    = `https://www.hekimhane.com.tr/doktorlar/${d.slug}`;
  return {
    title,
    description: desc.slice(0, 155),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Hekimhane`,
      description: desc.slice(0, 155),
      url,
      images: d.photo ? [{ url: d.photo, alt: fullN }] : [],
    },
  };
}

export default async function DoktorProfilPage({ params }: Props) {
  const res = await getData(params.slug);
  if (!res) notFound();
  const { d, yorumlar } = res;

  const fullName = `${d.ad} ${d.soyad}`.trim();
  const displayLabel = d.unvan ? `${d.unvan} ${fullName}` : fullName;
  const canonical = `https://www.hekimhane.com.tr/doktorlar/${d.slug}`;
  const sameAs = [d.instagram_url, d.facebook_url, d.linkedin_url].filter(Boolean) as string[];

  const physician = {
    '@type': 'Physician',
    '@id': `${canonical}#physician`,
    name: displayLabel,
    ...(d.spec ? { medicalSpecialty: d.spec } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: d.ilce || '',
      addressRegion: d.il || '',
      addressCountry: 'TR',
    },
    telephone: d.tel || undefined,
    url: canonical,
    ...(d.photo ? { image: d.photo } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(d.clinic_name ? { worksFor: { '@type': 'MedicalClinic', name: d.clinic_name } } : {}),
    ...(d.il ? { areaServed: { '@type': 'City', name: d.il } } : {}),
    ...(d.lat && d.lng ? { geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng } } : {}),
    ...(d.rat && d.rev ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: d.rat, reviewCount: d.rev, bestRating: 5, worstRating: 1 } } : {}),
    ...(yorumlar.filter(y => (y.text || '').trim()).length ? {
      review: yorumlar.filter(y => (y.text || '').trim()).slice(0, 5).map(y => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: y.author || 'Anonim' },
        reviewRating: { '@type': 'Rating', ratingValue: y.rating, bestRating: 5, worstRating: 1 },
        reviewBody: y.text,
        ...(y.date ? { datePublished: y.date } : {}),
      })),
    } : {}),
  };

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
      { '@type': 'ListItem', position: 2, name: 'Doktorlar', item: 'https://www.hekimhane.com.tr/doktorlar' },
      ...(d.spec ? [{ '@type': 'ListItem', position: 3, name: d.spec, item: `https://www.hekimhane.com.tr/doktorlar?spec=${encodeURIComponent(d.spec)}` }] : []),
      { '@type': 'ListItem', position: d.spec ? 4 : 3, name: displayLabel, item: canonical },
    ],
  };

  const jsonLd = { '@context': 'https://schema.org', '@graph': [physician, breadcrumb] };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProfilSayfasi
      entityType="doktor"
      id={d.id}
      name={fullName}
      il={d.il} ilce={d.ilce}
      adres={d.clinic_name}
      lat={d.lat} lng={d.lng}
      tel={d.tel}
      photo={d.photo} photos={d.photos} photo360={d.photo360}
      rat={d.rat} rev={d.rev}
      spec={d.spec}
      specs={d.tags && d.tags.length ? d.tags : undefined}
      fee={d.fee} exp={d.exp}
      online={d.online}
      premium={d.premium} verified={d.verified}
      unvan={d.unvan}
      bio={d.bio}
      okul={d.okul}
      sigorta={d.sigorta}
      conditions={d.conditions}
      tour360url={d.tour360url}
      video_url={d.video_url}
      instagram_url={d.instagram_url}
      facebook_url={d.facebook_url}
      linkedin_url={d.linkedin_url}
      calisma_saatleri={d.calisma_saatleri}
      acik_24_saat={d.acik_24_saat}
      yorumlar={yorumlar}
      kartSlug={d.slug}
      listHref="/doktorlar"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Doktorlar', href: '/doktorlar' },
        ...(d.spec ? [{ label: d.spec, href: `/doktorlar?spec=${encodeURIComponent(d.spec)}` }] : []),
        { label: displayLabel, href: '#' },
      ]}
    />
    </>
  );
}
