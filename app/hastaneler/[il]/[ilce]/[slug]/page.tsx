import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Hastane, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';

export const dynamic = 'force-dynamic';

interface Props { params: { il: string; ilce: string; slug: string } }

const tr = (s: string) => (s||'').toLowerCase()
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

async function getData(slug: string) {
  const { data: raw } = await supabase.from('hastaneler').select('*').eq('slug', slug).single();
  const h = raw as Hastane | null;
  if (!h) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'hastane').eq('entity_id', h.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = (rawYorumlar || []) as Yorum[];
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
  const desc  = `${h.name} iletişim, yorumlar ve randevu bilgileri. ${h.adres||''}`;
  return { title, description: desc, openGraph: { title: `${title} | Hekimhane`, description: desc, images: h.cover ? [h.cover] : [] } };
}

export default async function HastaneProfilPage({ params }: Props) {
  const res = await getData(params.slug);
  if (!res) notFound();
  const { h, yorumlar } = res;

  return (
    <ProfilSayfasi
      entityType="hastane"
      id={h.id} name={h.name}
      il={h.il} ilce={h.ilce} adres={h.adres}
      lat={h.lat} lng={h.lng} maps_url={h.maps_url}
      tel={h.tel} website={h.website}
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
      yorumlar={yorumlar}
      listHref="/hastaneler"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Hastaneler', href: '/hastaneler' },
        ...(h.il ? [{ label: h.il, href: `/hastaneler?il=${encodeURIComponent(h.il)}` }] : []),
        ...(h.ilce ? [{ label: h.ilce, href: `/hastaneler?il=${encodeURIComponent(h.il||'')}&ilce=${encodeURIComponent(h.ilce||'')}` }] : []),
        { label: h.name, href: '#' },
      ]}
    />
  );
}
