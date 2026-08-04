import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Hastane, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';
import { maskReviewName } from '@/lib/helpers';
import { bookedSlots } from '@/lib/randevu-booked';

export const dynamic = 'force-dynamic';

interface Props { params: { il: string; ilce: string; slug: string } }

const tr = (s: string) => (s||'').toLowerCase()
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

async function getData(slug: string) {
  noStore(); // Supabase sonucu bayat kalmasın (premium/edit anında yansısın)
  const { data: raw } = await supabase.from('hastaneler').select('*').eq('slug', slug).single();
  const h = raw as Hastane | null;
  if (!h) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'hastane').eq('entity_id', h.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = ((rawYorumlar || []) as Yorum[]).filter((y: any) => !y.hidden);
  return { h, yorumlar };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('hastaneler').select('il,ilce,slug').not('slug','is',null);
  const rows = (data || []) as Pick<Hastane, 'il' | 'ilce' | 'slug'>[];
  return rows.map(h => ({ il: tr(h.il||'turkiye'), ilce: tr(h.ilce||'merkez'), slug: h.slug||'' }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getData(params.slug);
  if (!res) return { title: 'Hastane Bulunamadı' };
  const { h } = res;
  const title = `${h.name} — ${h.ilce||''}, ${h.il||''}`;
  const desc  = `${h.name} ${h.il||''} ${h.ilce||''} adres, iletişim bilgileri ve yorumlar. ${h.type||'Hastane'}.`;
  const url   = `https://www.hekimhane.com.tr/hastaneler/${tr(h.il||'turkiye')}/${tr(h.ilce||'merkez')}/${h.slug}`;
  return {
    title,
    description: desc.slice(0, 155),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Hekimhane`,
      description: desc.slice(0, 155),
      url,
      images: (h.cover && !h.cover.startsWith('preset:')) ? [{ url: h.cover, alt: h.name }] : [],
    },
  };
}

export default async function HastaneProfilPage({ params }: Props) {
  const res = await getData(params.slug);
  if (!res) notFound();
  const { h, yorumlar } = res;

  const canonical = `https://www.hekimhane.com.tr/hastaneler/${tr(h.il||'turkiye')}/${tr(h.ilce||'merkez')}/${h.slug}`;
  const sameAs = [h.website, h.instagram_url, h.facebook_url, h.linkedin_url].filter(Boolean) as string[];

  const hospital = {
    '@type': 'Hospital',
    '@id': `${canonical}#hospital`,
    name: h.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: h.ilce || '',
      addressRegion: h.il || '',
      addressCountry: 'TR',
      streetAddress: h.adres || '',
    },
    telephone: h.tel || undefined,
    numberOfBeds: h.beds || undefined,
    url: canonical,
    ...(sameAs.length ? { sameAs } : {}),
    ...((h.cover && !h.cover.startsWith('preset:') ? h.cover : h.logo) ? { image: (h.cover && !h.cover.startsWith('preset:') ? h.cover : h.logo) } : {}),
    ...(h.il ? { areaServed: { '@type': 'City', name: h.il } } : {}),
    ...(h.rat && h.rev ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: h.rat, reviewCount: h.rev, bestRating: 5, worstRating: 1 } } : {}),
    ...(h.lat && h.lng ? { geo: { '@type': 'GeoCoordinates', latitude: h.lat, longitude: h.lng } } : {}),
    ...(yorumlar.filter(y => (y.text || '').trim()).length ? {
      review: yorumlar.filter(y => (y.text || '').trim()).slice(0, 5).map(y => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: maskReviewName(y.author) },
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
      { '@type': 'ListItem', position: 2, name: 'Hastaneler', item: 'https://www.hekimhane.com.tr/hastaneler' },
      ...(h.il   ? [{ '@type': 'ListItem', position: 3, name: h.il,   item: `https://www.hekimhane.com.tr/hastaneler?il=${encodeURIComponent(h.il)}` }] : []),
      ...(h.ilce ? [{ '@type': 'ListItem', position: 4, name: h.ilce, item: `https://www.hekimhane.com.tr/hastaneler?il=${encodeURIComponent(h.il||'')}&ilce=${encodeURIComponent(h.ilce||'')}` }] : []),
      { '@type': 'ListItem', position: (h.ilce ? 5 : h.il ? 4 : 3), name: h.name, item: canonical },
    ],
  };

  const jsonLd = { '@context': 'https://schema.org', '@graph': [hospital, breadcrumb] };
  const rvBooked = (h as any).randevu_aktif ? [...await bookedSlots(h.id), ...(Array.isArray((h as any).randevu_bloke) ? (h as any).randevu_bloke.map(String) : [])] : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProfilSayfasi
      entityType="hastane"
      id={h.id} name={h.name}
      il={h.il} ilce={h.ilce} adres={h.adres}
      lat={h.lat} lng={h.lng} maps_url={h.maps_url}
      tel={h.tel} whatsapp={h.whatsapp} website={h.website}
      logo={h.logo} photos={h.photos} photo360={h.photo360}
      rat={h.rat} rev={h.rev}
      specs={h.specs} type={h.type}
      claimed={h.claimed} premium={h.premium}
      docs={h.docs} beds={h.beds} founded={h.founded}
      tour360url={h.tour360url}
      video_url={h.video_url}
      instagram_url={h.instagram_url}
      facebook_url={h.facebook_url}
      linkedin_url={h.linkedin_url}
      calisma_saatleri={h.calisma_saatleri}
      acik_24_saat={h.acik_24_saat}
      randevuAktif={(h as any).randevu_aktif} randevuSlotDk={(h as any).randevu_slot_dk} bookedSlots={rvBooked}
      yorumlar={yorumlar}
      kartSlug={h.slug}
      listHref="/hastaneler"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Hastaneler', href: '/hastaneler' },
        ...(h.il ? [{ label: h.il, href: `/hastaneler?il=${encodeURIComponent(h.il)}` }] : []),
        ...(h.ilce ? [{ label: h.ilce, href: `/hastaneler?il=${encodeURIComponent(h.il||'')}&ilce=${encodeURIComponent(h.ilce||'')}` }] : []),
        { label: h.name, href: '#' },
      ]}
    />
    </>
  );
}
