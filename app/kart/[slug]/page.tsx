export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import KartClient from './KartClient';

export interface KartData {
  slug: string;
  ad: string;
  soyad: string;
  unvan?: string | null;
  spec?: string | null;
  tel?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  photo_url?: string | null;   // hekimkartlar
  photo?: string | null;       // doktorlar (fallback)
  il?: string | null;
  ilce?: string | null;
  clinic_name?: string | null;
  bio?: string | null;
  iban?: string | null;
  rezervasyon_url?: string | null;
  website_url?: string | null;
  maps_url?: string | null;
  entity_id?: string | null;
  entity_type?: string | null;
  rat?: number;
  rev?: number;
  verified?: boolean;
  /** Profil sayfası için Hekimhane URL'si — entity_id/entity_type'dan otomatik türetilir */
  hekimhane_url?: string | null;
}

/** Türkçe karakterleri slug'a çevirir (panel/page.tsx'teki tr() ile aynı) */
function toUrlSegment(s: string) {
  return (s || '').toLowerCase()
    .replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** entity_id + entity_type → Hekimhane profil URL'si */
async function resolveHekimhaneUrl(
  entity_id: string | null | undefined,
  entity_type: string | null | undefined,
): Promise<string | null> {
  if (!entity_id || !entity_type) return null;
  try {
    if (entity_type === 'klinik') {
      const { data } = await (supabase as any).from('klinikler').select('il,ilce,slug').eq('id', entity_id).single();
      if (data?.slug) return `/klinikler/${toUrlSegment(data.il || 'turkiye')}/${toUrlSegment(data.ilce || 'merkez')}/${data.slug}`;
    } else if (entity_type === 'hastane') {
      const { data } = await (supabase as any).from('hastaneler').select('il,ilce,slug').eq('id', entity_id).single();
      if (data?.slug) return `/hastaneler/${toUrlSegment(data.il || 'turkiye')}/${toUrlSegment(data.ilce || 'merkez')}/${data.slug}`;
    } else if (entity_type === 'doktor') {
      const { data } = await (supabase as any).from('doktorlar').select('slug').eq('id', entity_id).single();
      if (data?.slug) return `/doktorlar/${data.slug}`;
    } else if (entity_type === 'eczane') {
      const { data } = await (supabase as any).from('eczaneler').select('slug').eq('id', entity_id).single();
      if (data?.slug) return `/eczaneler/${data.slug}`;
    }
  } catch { /* entity bulunamazsa sessizce geç */ }
  return null;
}

async function getKart(slug: string): Promise<KartData | null> {
  noStore();
  // 1. Önce hekimkartlar tablosuna bak
  const { data: kart } = await (supabase as any)
    .from('hekimkartlar')
    .select('*')
    .eq('slug', slug)
    .single();
  if (kart) {
    // hekimhane_url: kaydedilmişse kullan, yoksa entity'den otomatik türet
    const savedUrl = kart.hekimhane_url?.trim() || null;
    const autoUrl  = savedUrl || await resolveHekimhaneUrl(kart.entity_id, kart.entity_type);
    return { ...kart, hekimhane_url: autoUrl } as KartData;
  }

  // 2. Fallback: doktorlar tablosu (eski sistem kartları)
  const { data: dok } = await supabase
    .from('doktorlar')
    .select('id,ad,soyad,spec,unvan,il,ilce,tel,photo,slug,rat,rev,bio,instagram_url,facebook_url,clinic_name,verified')
    .eq('slug', slug)
    .single();
  if (!dok) return null;
  return {
    ...(dok as any),
    photo_url: (dok as any).photo,
    hekimhane_url: `/doktorlar/${slug}`,
    entity_id: (dok as any).id,
    entity_type: 'doktor',
  } as KartData;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const d = await getKart(params.slug);
  if (!d) return { title: 'Kart Bulunamadı' };
  const name = `${d.unvan ? d.unvan + ' ' : ''}${d.ad} ${d.soyad}`.trim();
  const photo = d.photo_url || d.photo;
  return {
    title: `${name} — HekimKart`,
    description: `${name} dijital kartviziti. ${d.spec || ''} ${d.il || ''}`.trim(),
    openGraph: {
      title: name,
      description: `${d.spec || 'Sağlık Profesyoneli'} — ${d.il || 'Türkiye'}`,
      images: photo ? [photo] : [],
    },
  };
}

export default async function HekimKartPage({ params }: { params: { slug: string } }) {
  const d = await getKart(params.slug);
  if (!d) notFound();
  return <KartClient kart={d} />;
}
