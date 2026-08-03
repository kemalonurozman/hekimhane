import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Eczane, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';
import { bookedSlots } from '@/lib/randevu-booked';
import { buildEczaneFaq } from '@/lib/faq';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

async function getData(slug: string) {
  noStore(); // Supabase sonucu bayat kalmasın (premium/edit anında yansısın)
  const { data: raw } = await supabase.from('eczaneler').select('*').eq('slug', slug).single();
  const e = raw as Eczane | null;
  if (!e) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'eczane').eq('entity_id', e.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = ((rawYorumlar || []) as Yorum[]).filter((y: any) => !y.hidden);
  return { e, yorumlar };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('eczaneler').select('slug').not('slug', 'is', null);
  const rows = (data || []) as Pick<Eczane, 'slug'>[];
  return rows.map(e => ({ slug: e.slug || '' }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getData(params.slug);
  if (!res) return { title: 'Eczane Bulunamadı' };
  const { e } = res;
  const title = `${e.name} — ${e.ilce || ''}, ${e.il || ''}`;
  const desc  = `${e.name} eczanesi iletişim, yorumlar ve adres bilgileri. ${e.address || ''} ${e.il || ''}`;
  return { title, description: desc, openGraph: { title: `${title} | Hekimhane`, description: desc } };
}

export default async function EczaneProfilPage({ params }: Props) {
  const res = await getData(params.slug);
  if (!res) notFound();
  const { e, yorumlar } = res;

  const canonical = `https://www.hekimhane.com.tr/eczaneler/${e.slug}`;
  const sameAs = [e.instagram_url, e.facebook_url, e.linkedin_url].filter(Boolean) as string[];

  const pharmacy = {
    '@type': 'Pharmacy',
    '@id': `${canonical}#pharmacy`,
    name: e.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: e.ilce || '',
      addressRegion: e.il || '',
      addressCountry: 'TR',
      streetAddress: e.address || '',
    },
    telephone: e.tel || undefined,
    url: canonical,
    ...(sameAs.length ? { sameAs } : {}),
    ...(e.acik_24_saat ? { openingHours: 'Mo-Su 00:00-23:59' } : {}),
    ...(e.il ? { areaServed: { '@type': 'City', name: e.il } } : {}),
    ...(e.lat && e.lng ? { geo: { '@type': 'GeoCoordinates', latitude: e.lat, longitude: e.lng } } : {}),
    ...(e.rat && e.rev ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: e.rat, reviewCount: e.rev, bestRating: 5, worstRating: 1 } } : {}),
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
      { '@type': 'ListItem', position: 2, name: 'Eczaneler', item: 'https://www.hekimhane.com.tr/eczaneler' },
      ...(e.il ? [{ '@type': 'ListItem', position: 3, name: e.il, item: `https://www.hekimhane.com.tr/eczaneler?il=${encodeURIComponent(e.il)}` }] : []),
      { '@type': 'ListItem', position: e.il ? 4 : 3, name: e.name, item: canonical },
    ],
  };

  const faq = buildEczaneFaq({
    name: e.name, il: e.il, ilce: e.ilce, adres: e.address, tel: e.tel,
    pharmacist: e.pharmacist, nobetci: e.nobetci, acik_24_saat: e.acik_24_saat,
    rat: e.rat, rev: e.rev, calisma_saatleri: e.calisma_saatleri,
  });
  const faqPage = faq.length ? {
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    mainEntity: faq.map(f => ({
      '@type': 'Question',
      name: f.soru,
      acceptedAnswer: { '@type': 'Answer', text: f.cevap },
    })),
  } : null;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [pharmacy, breadcrumb, ...(faqPage ? [faqPage] : [])] };
  const rvBooked = (e as any).randevu_aktif ? await bookedSlots(e.id) : [];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <ProfilSayfasi
      entityType="eczane"
      id={e.id} name={e.name}
      il={e.il} ilce={e.ilce} adres={e.address}
      lat={e.lat} lng={e.lng}
      tel={e.tel} whatsapp={e.whatsapp}
      rat={e.rat} rev={e.rev}
      nobetci={e.nobetci}
      pharmacist={e.pharmacist}
      claimed={e.claimed} premium={e.premium}
      photos={e.photos} photo360={e.photo360} tour360url={e.tour360url} video_url={e.video_url}
      instagram_url={e.instagram_url}
      facebook_url={e.facebook_url}
      linkedin_url={e.linkedin_url}
      calisma_saatleri={e.calisma_saatleri}
      acik_24_saat={e.acik_24_saat}
      randevuAktif={(e as any).randevu_aktif} randevuSlotDk={(e as any).randevu_slot_dk} bookedSlots={rvBooked}
      faq={faq}
      yorumlar={yorumlar}
      kartSlug={e.slug}
      listHref="/eczaneler"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Eczaneler', href: '/eczaneler' },
        ...(e.il ? [{ label: e.il, href: `/eczaneler?il=${encodeURIComponent(e.il)}` }] : []),
        { label: e.name, href: '#' },
      ]}
    />
    </>
  );
}
