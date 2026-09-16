export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import KartClient from './KartClient';
import { bos, entityKartAlanlari } from '@/lib/hekimkart';

export interface KartData {
  slug: string;
  ad: string;
  soyad: string;
  unvan?: string | null;
  spec?: string | null;
  tel?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  photo_url?: string | null;   // hekimkartlar
  photo?: string | null;       // doktorlar (fallback)
  il?: string | null;
  ilce?: string | null;
  adres?: string | null;
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
  premium?: boolean;
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

interface EntityInfo {
  url: string | null;
  /** İşletmenin ham satırı — kartta boş bırakılan alanlar buradan tamamlanır. */
  satir?: Record<string, any> | null;
  adres?: string | null;
  rat?: number | null;
  rev?: number | null;
  verified?: boolean | null;
  premium?: boolean | null;
}

const ENTITY_TABLO: Record<string, string> = {
  klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler',
};

/** İşletme satırından profil URL'si (tip başına farklı şema). */
function entityUrl(entity_type: string, r: any): string | null {
  if (!r?.slug) return null;
  if (entity_type === 'klinik' || entity_type === 'hastane') {
    const kok = entity_type === 'klinik' ? 'klinikler' : 'hastaneler';
    return `/${kok}/${toUrlSegment(r.il || 'turkiye')}/${toUrlSegment(r.ilce || 'merkez')}/${r.slug}`;
  }
  if (entity_type === 'doktor') return `/doktorlar/${r.slug}`;
  if (entity_type === 'eczane') return `/eczaneler/${r.slug}`;
  return null;
}

/** entity_id + entity_type → profil URL'si + işletmenin tüm alanları */
async function resolveEntity(
  entity_id: string | null | undefined,
  entity_type: string | null | undefined,
): Promise<EntityInfo> {
  if (!entity_id || !entity_type) return { url: null };
  const tablo = ENTITY_TABLO[entity_type];
  if (!tablo) return { url: null };
  try {
    const { data } = await (supabase as any).from(tablo).select('*').eq('id', entity_id).single();
    if (!data) return { url: null };
    return {
      url: entityUrl(entity_type, data),
      satir: data,
      adres: data.adres ?? data.address ?? null,
      rat: data.rat, rev: data.rev, verified: data.verified, premium: data.premium,
    };
  } catch { /* entity bulunamazsa sessizce geç */ }
  return { url: null };
}

/**
 * Kart araması sonucu. `yonlendir` doluysa istenen adres artık geçerli değil
 * ama kartın yeni adresi biliniyor — çağıran taraf 308 ile oraya gönderir.
 */
interface KartSonuc { kart: KartData | null; yonlendir?: string }

/**
 * Bu işletmenin kayıtlı kartı var mı? (otomatik karta düşmeden önce bakılır —
 * sahip panelden adres değiştirdiyse işletme slug'ı yerine kartın gerçek
 * adresi kanonik olmalı.)
 */
async function isletmeninKarti(entityId: string | null | undefined): Promise<string | null> {
  if (!entityId) return null;
  try {
    const { data } = await (supabase as any)
      .from('hekimkartlar').select('slug').eq('entity_id', String(entityId)).limit(1).maybeSingle();
    return data?.slug || null;
  } catch { return null; }
}

/** Kartın eski adreslerinden biri mi? Kolon yoksa sessizce null döner. */
async function eskiAdrestenCoz(slug: string): Promise<string | null> {
  try {
    const { data } = await (supabase as any)
      .from('hekimkartlar').select('slug').contains('eski_sluglar', [slug]).limit(1).maybeSingle();
    return data?.slug || null;
  } catch { return null; }
}

async function getKart(slug: string): Promise<KartSonuc> {
  noStore();
  // 1. Önce hekimkartlar tablosuna bak
  const { data: kart } = await (supabase as any)
    .from('hekimkartlar')
    .select('*')
    .eq('slug', slug)
    .single();
  if (kart) {
    // Entity'den adres/puan/onay + boş kalan kart alanları (poster + banner için)
    const ent = await resolveEntity(kart.entity_id, kart.entity_type);
    // hekimhane_url: kaydedilmişse kullan, yoksa entity'den otomatik türet
    const savedUrl = kart.hekimhane_url?.trim() || null;
    // Kartta boş bırakılan alanlar işletme profilinden tamamlanır: sahibi
    // fotoğrafı/web sitesini profiline girmişse kartı çıplak görünmesin.
    const profilden = entityKartAlanlari(ent.satir);
    const tamamla: Record<string, any> = {};
    for (const [alan, deger] of Object.entries(profilden)) {
      if (!bos(deger) && bos((kart as any)[alan])) tamamla[alan] = deger;
    }
    // Herkese açık sayfaya gitmemesi gereken alanlar: kart sahibinin e-postası
    // (kişisel veri) ve adres geçmişi. KartClient'a verilen her şey HTML'e gömülür.
    const { user_email: _eposta, eski_sluglar: _gecmis, ...acikKart } = kart as any;
    return { kart: {
      ...acikKart,
      ...tamamla,
      hekimhane_url: savedUrl || ent.url,
      // kartta yoksa entity değerini kullan (fallback)
      adres:    kart.adres    ?? ent.adres    ?? null,
      rat:      kart.rat      ?? ent.rat      ?? undefined,
      rev:      kart.rev      ?? ent.rev      ?? undefined,
      verified: kart.verified ?? ent.verified ?? undefined,
      premium:  kart.premium  ?? ent.premium  ?? undefined,
    } as KartData };
  }

  // 1b. Kartın eski adresi mi? → yeni adrese yönlendir (basılı QR / paylaşılmış
  //     bağlantı ölmesin). Adres geçmişi `hekimkartlar.eski_sluglar`'da.
  const yeniAdres = await eskiAdrestenCoz(slug);
  if (yeniAdres) return { kart: null, yonlendir: yeniAdres };

  // 2. Fallback: doktorlar tablosu (eski sistem kartları)
  const { data: dok } = await supabase
    .from('doktorlar')
    .select('id,ad,soyad,spec,unvan,il,ilce,tel,photo,slug,rat,rev,bio,instagram_url,facebook_url,linkedin_url,clinic_name,verified,premium')
    .eq('slug', slug)
    .single();
  if (dok) {
    const kayitli = await isletmeninKarti((dok as any).id);
    if (kayitli && kayitli !== slug) return { kart: null, yonlendir: kayitli };
    return { kart: {
      ...(dok as any),
      photo_url: (dok as any).photo,
      hekimhane_url: `/doktorlar/${slug}`,
      entity_id: (dok as any).id,
      entity_type: 'doktor',
    } as KartData };
  }

  // 3. Fallback: klinik / hastane (slug ile) → otomatik HekimKart
  for (const t of [
    { table: 'klinikler',  type: 'klinik'  as const, base: (r: any) => `/klinikler/${toUrlSegment(r.il||'turkiye')}/${toUrlSegment(r.ilce||'merkez')}/${r.slug}` },
    { table: 'hastaneler', type: 'hastane' as const, base: (r: any) => `/hastaneler/${toUrlSegment(r.il||'turkiye')}/${toUrlSegment(r.ilce||'merkez')}/${r.slug}` },
  ]) {
    const { data: e } = await (supabase as any).from(t.table).select('*').eq('slug', slug).single();
    if (e) {
      const kayitli = await isletmeninKarti(e.id);
      if (kayitli && kayitli !== slug) return { kart: null, yonlendir: kayitli };
      return { kart: {
        ad: e.name || '', soyad: '',
        unvan: null,
        spec: (Array.isArray(e.specs) && e.specs[0]) || e.type || null,
        tel: e.tel || null,
        instagram_url: e.instagram_url || null,
        facebook_url: e.facebook_url || null,
        linkedin_url: e.linkedin_url || null,
        website_url: e.website || null,
        maps_url: e.maps_url || null,
        photo_url: e.logo || e.cover || null,
        il: e.il || null, ilce: e.ilce || null, adres: e.adres || null,
        clinic_name: null,
        bio: e.bio || null,
        rat: e.rat, rev: e.rev, verified: e.verified, premium: e.premium,
        slug: e.slug,
        entity_id: e.id, entity_type: t.type,
        hekimhane_url: t.base(e),
      } as KartData };
    }
  }

  // 4. Fallback: eczane
  const { data: ecz } = await (supabase as any).from('eczaneler').select('*').eq('slug', slug).single();
  if (ecz) {
    const kayitli = await isletmeninKarti(ecz.id);
    if (kayitli && kayitli !== slug) return { kart: null, yonlendir: kayitli };
    return { kart: {
      ad: ecz.name || '', soyad: '', spec: 'Eczane',
      tel: ecz.tel || null, il: ecz.il || null, ilce: ecz.ilce || null,
      adres: ecz.address || ecz.adres || null, clinic_name: null,
      photo_url: ecz.logo || null,
      premium: ecz.premium,
      slug: ecz.slug, entity_id: ecz.id, entity_type: 'eczane',
      hekimhane_url: `/eczaneler/${ecz.slug}`,
    } as KartData };
  }

  return { kart: null };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { kart: d } = await getKart(params.slug);
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

export interface KartYorum {
  id: string;
  author: string | null;
  rating: number;
  text: string | null;
  created_at: string;
  reply_text?: string | null;
}

async function getReviews(entity_type?: string | null, entity_id?: string | null): Promise<KartYorum[]> {
  if (!entity_type || !entity_id) return [];
  try {
    const { data } = await (supabase as any)
      .from('yorumlar')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', String(entity_id))
      .not('text', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30);
    return (data || []).filter((r: any) => !r.hidden && (r.text || '').trim().length > 0) as KartYorum[];
  } catch {
    return [];
  }
}

/** Panel önizlemesinde (iframe) site menüsü ve footer gizlenir — yalnız kart görünsün. */
const ONIZLEME_CSS = '.site-nav,.site-footer{display:none!important}';

export default async function HekimKartPage({ params, searchParams }: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { kart: d, yonlendir } = await getKart(params.slug);
  // Adres değişmiş: eski bağlantı kalıcı olarak yenisine taşınır (308)
  if (yonlendir) permanentRedirect(`/kart/${yonlendir}`);
  if (!d) notFound();
  const reviews = await getReviews(d.entity_type, d.entity_id);
  const onizleme = searchParams?.onizleme === '1';
  return (
    <>
      {/* dangerouslySetInnerHTML: <style> metin çocuğu hidrasyon uyumsuzluğu yapıyor (proje tuzağı) */}
      {onizleme && <style dangerouslySetInnerHTML={{ __html: ONIZLEME_CSS }} />}
      <KartClient kart={d} reviews={reviews} />
    </>
  );
}
