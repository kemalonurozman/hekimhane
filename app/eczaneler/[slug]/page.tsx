import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Eczane, Yorum } from '@/lib/types';
import ProfilSayfasi from '@/components/ProfilSayfasi';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

async function getData(slug: string) {
  const { data: raw } = await supabase.from('eczaneler').select('*').eq('slug', slug).single();
  const e = raw as Eczane | null;
  if (!e) return null;
  const { data: rawYorumlar } = await supabase.from('yorumlar').select('*')
    .eq('entity_type', 'eczane').eq('entity_id', e.id)
    .order('created_at', { ascending: false }).limit(50);
  const yorumlar = (rawYorumlar || []) as Yorum[];
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

  return (
    <ProfilSayfasi
      entityType="eczane"
      id={e.id} name={e.name}
      il={e.il} ilce={e.ilce} adres={e.address}
      lat={e.lat} lng={e.lng}
      tel={e.tel}
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
      yorumlar={yorumlar}
      listHref="/eczaneler"
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Eczaneler', href: '/eczaneler' },
        ...(e.il ? [{ label: e.il, href: `/eczaneler?il=${encodeURIComponent(e.il)}` }] : []),
        { label: e.name, href: '#' },
      ]}
    />
  );
}
