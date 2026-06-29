import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Klinik, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';

export const dynamic = 'force-dynamic';

interface Props { params: { il: string; ilce: string; slug: string } }

const tr = (s: string) => (s||'').toLowerCase()
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

async function getData(slug: string) {
  const { data: raw } = await supabase.from('klinikler').select('*').eq('slug', slug).single();
  const k = raw as Klinik | null;
  if (!k) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'klinik').eq('entity_id', k.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = (rawYorumlar || []) as Yorum[];
  return { k, yorumlar };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('klinikler').select('il,ilce,slug').not('slug','is',null);
  const rows = (data || []) as Pick<Klinik, 'il' | 'ilce' | 'slug'>[];
  return rows.map(k => ({ il: tr(k.il||'turkiye'), ilce: tr(k.ilce||'merkez'), slug: k.slug||'' }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getData(params.slug);
  if (!res) return { title: 'Klinik Bulunamadı' };
  const { k } = res;
  const title = `${k.name} — ${k.ilce||''}, ${k.il||''}`;
  const desc  = `${k.name} ${k.il||''} ${k.ilce||''} adres, iletişim, yorumlar ve randevu bilgileri. ${(k.specs||[]).slice(0,3).join(', ')}`;
  const url = `https://hekimhane.com.tr/klinikler/${tr(k.il||'turkiye')}/${tr(k.ilce||'merkez')}/${k.slug}`;
  return {
    title,
    description: desc.slice(0, 155),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Hekimhane`,
      description: desc.slice(0, 155),
      url,
      images: k.cover ? [{ url: k.cover, alt: k.name }] : [],
    },
  };
}

export default async function KlinikProfilPage({ params }: Props) {
  const res = await getData(params.slug);
  if (!res) notFound();
  const { k, yorumlar } = res;

  const trFn = (s: string) => (s||'').toLowerCase()
    .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
    .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: k.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: k.ilce || '',
      addressRegion: k.il || '',
      addressCountry: 'TR',
      streetAddress: k.adres || '',
    },
    telephone: k.tel || undefined,
    url: k.website || `https://hekimhane.com.tr/klinikler/${trFn(k.il||'turkiye')}/${trFn(k.ilce||'merkez')}/${k.slug}`,
    ...(k.rat && k.rev ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: k.rat, reviewCount: k.rev, bestRating: 5 } } : {}),
    ...(k.lat && k.lng ? { geo: { '@type': 'GeoCoordinates', latitude: k.lat, longitude: k.lng } } : {}),
    medicalSpecialty: (k.specs || []).join(', '),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProfilSayfasi
      entityType="klinik"
      id={k.id} name={k.name}
      il={k.il} ilce={k.ilce} adres={k.adres}
      lat={k.lat} lng={k.lng} maps_url={k.maps_url}
      tel={k.tel} website={k.website}
      logo={k.logo} cover={k.cover} photos={k.photos} photo360={k.photo360}
      rat={k.rat} rev={k.rev}
      specs={k.specs} type={k.type}
      claimed={k.claimed} online={k.online} acil={k.acil} premium={k.premium}
      tour360url={k.tour360url}
      video_url={k.video_url}
      instagram_url={k.instagram_url}
      facebook_url={k.facebook_url}
      linkedin_url={k.linkedin_url}
      calisma_saatleri={k.calisma_saatleri}
      acik_24_saat={k.acik_24_saat}
      yorumlar={yorumlar}
      listHref="/klinikler"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Klinikler', href: '/klinikler' },
        ...(k.il ? [{ label: k.il, href: `/klinikler?il=${encodeURIComponent(k.il)}` }] : []),
        ...(k.ilce ? [{ label: k.ilce, href: `/klinikler?il=${encodeURIComponent(k.il||'')}&ilce=${encodeURIComponent(k.ilce||'')}` }] : []),
        { label: k.name, href: '#' },
      ]}
    />
    </>
  );
}
