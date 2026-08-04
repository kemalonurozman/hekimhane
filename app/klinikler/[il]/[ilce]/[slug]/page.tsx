import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Klinik, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';
import { maskReviewName } from '@/lib/helpers';
import { bookedSlots } from '@/lib/randevu-booked';
import { buildKlinikFaq } from '@/lib/faq';

export const dynamic = 'force-dynamic';

interface Props { params: { il: string; ilce: string; slug: string } }

const tr = (s: string) => (s||'').toLowerCase()
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

async function getData(slug: string) {
  noStore(); // Supabase sonucu bayat kalmasın (premium/edit anında yansısın)
  const { data: raw } = await supabase.from('klinikler').select('*').eq('slug', slug).single();
  const k = raw as Klinik | null;
  if (!k) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'klinik').eq('entity_id', k.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = ((rawYorumlar || []) as Yorum[]).filter((y: any) => !y.hidden);
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
  const tur = k.type || 'Diş Hekimi';
  const yer = [k.ilce, k.il].filter(Boolean).join(', ');
  const title = `${k.name} — ${yer} ${tur}`;
  const puan = (k.rat && k.rev) ? `${k.rat.toFixed(1)} ★ (${k.rev} değerlendirme). ` : '';
  const uzm = (k.specs || []).slice(0, 3).join(', ');
  const desc = `${k.name}, ${yer} bölgesinde ${tur.toLowerCase()}. ${puan}Adres, telefon, hasta yorumları ve online randevu bilgileri.${uzm ? ' Uzmanlık: ' + uzm + '.' : ''}`;
  const url = `https://www.hekimhane.com.tr/klinikler/${tr(k.il||'turkiye')}/${tr(k.ilce||'merkez')}/${k.slug}`;
  // cover "preset:..." ise gerçek foto değil → og image olarak logo kullan
  const coverImg = (k.cover && !k.cover.startsWith('preset:')) ? k.cover : null;
  const ogImg = coverImg || k.logo || null;
  return {
    title,
    description: desc.slice(0, 158),
    keywords: [k.name, `${k.il} ${tur}`, `${k.ilce} diş hekimi`, `${k.il} diş kliniği`, ...(k.specs || [])].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Hekimhane`,
      description: desc.slice(0, 158),
      url,
      type: 'website',
      images: ogImg ? [{ url: ogImg, alt: k.name }] : [],
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

  const canonical = `https://www.hekimhane.com.tr/klinikler/${trFn(k.il||'turkiye')}/${trFn(k.ilce||'merkez')}/${k.slug}`;
  const sameAs = [k.website, k.instagram_url, k.facebook_url, k.linkedin_url].filter(Boolean) as string[];

  const business = {
    '@type': 'Dentist',
    '@id': `${canonical}#business`,
    name: k.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: k.ilce || '',
      addressRegion: k.il || '',
      addressCountry: 'TR',
      streetAddress: k.adres || '',
    },
    telephone: k.tel || undefined,
    url: canonical,
    ...(sameAs.length ? { sameAs } : {}),
    ...(((k.cover && !k.cover.startsWith('preset:') ? k.cover : null) || k.logo) ? { image: (k.cover && !k.cover.startsWith('preset:') ? k.cover : null) || k.logo } : {}),
    ...(k.il ? { areaServed: { '@type': 'City', name: k.il } } : {}),
    ...(k.rat && k.rev ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: k.rat, reviewCount: k.rev, bestRating: 5, worstRating: 1 } } : {}),
    ...(k.lat && k.lng ? { geo: { '@type': 'GeoCoordinates', latitude: k.lat, longitude: k.lng } } : {}),
    ...((k.specs || []).length ? { medicalSpecialty: k.specs } : {}),
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
      { '@type': 'ListItem', position: 2, name: 'Diş Klinikleri', item: 'https://www.hekimhane.com.tr/klinikler' },
      ...(k.il   ? [{ '@type': 'ListItem', position: 3, name: k.il,   item: `https://www.hekimhane.com.tr/klinikler?il=${encodeURIComponent(k.il)}` }] : []),
      ...(k.ilce ? [{ '@type': 'ListItem', position: 4, name: k.ilce, item: `https://www.hekimhane.com.tr/klinikler/${trFn(k.il||'turkiye')}/${trFn(k.ilce)}` }] : []),
      { '@type': 'ListItem', position: (k.ilce ? 5 : k.il ? 4 : 3), name: k.name, item: canonical },
    ],
  };

  const faq = buildKlinikFaq({
    name: k.name, il: k.il, ilce: k.ilce, adres: k.adres, tel: k.tel,
    rat: k.rat, rev: k.rev, specs: k.specs, calisma_saatleri: k.calisma_saatleri,
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

  const jsonLd = { '@context': 'https://schema.org', '@graph': [business, breadcrumb, ...(faqPage ? [faqPage] : [])] };
  const rvBooked = (k as any).randevu_aktif ? [...await bookedSlots(k.id), ...(Array.isArray((k as any).randevu_bloke) ? (k as any).randevu_bloke.map(String) : [])] : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProfilSayfasi
      entityType="klinik"
      id={k.id} name={k.name}
      il={k.il} ilce={k.ilce} adres={k.adres}
      lat={k.lat} lng={k.lng} maps_url={k.maps_url}
      tel={k.tel} whatsapp={k.whatsapp} website={k.website}
      logo={k.logo} cover={k.cover} photos={k.photos} photo360={k.photo360}
      rat={k.rat} rev={k.rev}
      specs={k.specs} type={k.type}
      yabanciDiller={(k as any).yabanci_diller}
      claimed={k.claimed} online={k.online} acil={k.acil} premium={k.premium}
      tour360url={k.tour360url}
      video_url={k.video_url}
      instagram_url={k.instagram_url}
      facebook_url={k.facebook_url}
      linkedin_url={k.linkedin_url}
      calisma_saatleri={k.calisma_saatleri}
      acik_24_saat={k.acik_24_saat}
      randevuAktif={(k as any).randevu_aktif} randevuSlotDk={(k as any).randevu_slot_dk} bookedSlots={rvBooked}
      faq={faq}
      yorumlar={yorumlar}
      kartSlug={k.slug}
      listHref="/klinikler"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Klinikler', href: '/klinikler' },
        ...(k.il ? [{ label: k.il, href: `/klinikler?il=${encodeURIComponent(k.il)}` }] : []),
        ...(k.ilce ? [{ label: k.ilce, href: `/klinikler/${trFn(k.il||'turkiye')}/${trFn(k.ilce||'')}` }] : []),
        { label: k.name, href: '#' },
      ]}
    />
    </>
  );
}
