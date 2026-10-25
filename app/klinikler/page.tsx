export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { fetchAllRows } from '@/lib/fetch-all';
import { puansiz } from '@/lib/profil-puani';
import { gercekOnayIsaretle } from '@/lib/sahiplik';
import { puanKolonuVar, profilSirasi } from '@/lib/profil-puani-sunucu';
import HkIconAnim from '@/components/HkIconAnim';
import type { Metadata } from 'next';
import { unstable_noStore as noStore, unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { KlinikFilters, Klinik, Doktor } from '@/lib/types';
import KlinikCard from '@/components/KlinikCard';
import DoktorCard from '@/components/DoktorCard';
import ListingLayout from '@/components/ListingLayout';
import { resolveKonum, IL_KONUM } from '@/lib/il-koordinatlari';
import { synonymsForSpec, specFilterValues, canonicalDentalSpec, kanonikEtiket } from '@/lib/uzmanlik-data';
import { toSlug } from '@/lib/helpers';

const PAGE_SIZE = 20;

// Uzmanlık filtresi — sinonim-duyarlı: "Dolgu" gibi evrensel işlemlerde genel diş
// klinikleri de eşleşir; kendi sinonimi olmayan uzmanlıklar tam eşleşme gibi davranır.
const uzmanlikOverlap = (uzmanlik: string) => specFilterValues(synonymsForSpec(uzmanlik));
// Kurum türü — özel=klinikler tablosu; devlet/üniversite=doktorlar tablosu (etiketle)
const DEVLET_TAG = 'devlet-dis-hastanesi';
const UNI_TAG = 'universite-dis-hastanesi';
// Arama metni → kelimeler. Her kelime ayrı ayrı eşleşmeli (VE), böylece "ahmet yıl" yazınca
// adı Ahmet, soyadı Yıl… olan hekime kadar daralır. PostgREST .or() sözdizimini bozan
// karakterler (virgül, parantez, %, *) ayıklanır.
function aramaKelimeleri(q?: string): string[] {
  return (q || '').replace(/[,()%*\\"']/g, ' ').split(/\s+/).filter(Boolean).slice(0, 5);
}
// Kelime BAŞI eşleşmesi: "y" yazınca adında herhangi bir yerde y geçenler değil, bir kelimesi
// y ile başlayanlar gelir ("Dt.Ahmet" gibi noktaya bitişik yazımlar için ".w" de sayılır).
const basla = (kolon: string, w: string) => `${kolon}.ilike.${w}%,${kolon}.ilike.% ${w}%,${kolon}.ilike.%.${w}%`;
function hekimAra(q: any, metin?: string) {
  for (const w of aramaKelimeleri(metin)) {
    // Branş yalnız 3+ harfte aranır — tek harf her şeyi eşleştirmesin. Kurum adı aranmaz:
    // "Mehmet … Hastanesi"ndeki tüm hekimler "mehmet" aramasına düşüyordu.
    const ek = w.length >= 3 ? `,spec.ilike.%${w}%` : '';
    q = q.or(`${basla('ad', w)},${basla('soyad', w)}${ek}`);
  }
  return q;
}
function klinikAra(q: any, metin?: string) {
  for (const w of aramaKelimeleri(metin)) q = q.or(basla('name', w));
  return q;
}

const KURUM_VALS = ['ozel', 'devlet', 'universite', 'hepsi'] as const;
// Yabancı dil filtresi (klinikler.yabanci_diller ile eşleşir)
const KLINIK_DIL_SECENEKLERI = ['Türkçe', 'İngilizce', 'Fransızca', 'Arapça', 'Rusça', 'Ukraynaca', 'Azerice']
  .map(d => ({ value: d, label: d }));
const TR = (s: string) => (s||'').toLowerCase().replace(/\u0307/g, '')
  .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
  .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/\s+/g,'-');

// Türkçe-duyarlı normalize (arama eşleştirme için): İ/I/ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c
// Not: JS toLowerCase('İ') = 'i̇' (birleşik nokta) sorununu önlemek için önce harf haritası uygulanır.
const TRMAP: Record<string, string> = { 'İ':'i','I':'i','ı':'i','Ş':'s','ş':'s','Ğ':'g','ğ':'g','Ü':'u','ü':'u','Ö':'o','ö':'o','Ç':'c','ç':'c' };
const norm = (s = '') => s.split('').map(c => TRMAP[c] ?? c).join('').toLowerCase().replace(/̇/g, '').trim();

export async function generateMetadata(
  { searchParams }: { searchParams: Record<string, string> }
): Promise<Metadata> {
  const il = searchParams.il || ''; const ilce = searchParams.ilce || ''; const uzmanlik = searchParams.uzmanlik || ''; const tip = searchParams.tip || ''; const q = searchParams.q || '';
  const yer = ilce ? `${ilce}, ${il}` : il;
  const tipEtiket = tip === 'Diş Hekimi' ? 'Diş Hekimleri' : tip ? `${tip}` : 'Diş Klinikleri';

  let title: string;
  if (uzmanlik)  title = yer ? `${yer} ${uzmanlik} — Diş Klinikleri` : `${uzmanlik} — Diş Klinikleri`;
  else if (yer)  title = tip ? `${yer} ${tipEtiket}` : `${yer} Diş Klinikleri ve Diş Hekimleri`;
  else           title = tip ? `Türkiye ${tipEtiket} — İl İl Rehber` : `Türkiye Diş Klinikleri ve Diş Hekimleri — İl İl Rehber`;

  const konum = yer || 'Türkiye';
  const desc = `${konum} bölgesindeki ${uzmanlik ? uzmanlik + ' ' : ''}diş klinikleri ve diş hekimleri: hasta yorumları, puanlar, adres, telefon ve online randevu. Hekimhane'de karşılaştırın, size en yakın diş hekimini bulun.`;

  // Kanonik: yalnızca anlamlı filtreler (arama/sayfa hariç) → duplike içerik önlenir
  const qs = new URLSearchParams();
  if (il) qs.set('il', il); if (ilce) qs.set('ilce', ilce); if (tip) qs.set('tip', tip); if (uzmanlik) qs.set('uzmanlik', uzmanlik);
  let canonical = `https://www.hekimhane.com.tr/klinikler${qs.toString() ? `?${qs.toString()}` : ''}`;
  // SEO: ?uzmanlik= serbest metin olabilir. Bilinen diş uzmanlığı değilse indeksleme;
  // il+uzmanlık için asıl sayfa statik /dis-tedavileri/<il>/<uzmanlik> → oraya canonical (kopya içerik önlenir).
  let noindex = !!q;
  if (uzmanlik) {
    const k = kanonikEtiket(uzmanlik);
    const c = canonicalDentalSpec(uzmanlik) || (k ? canonicalDentalSpec(k) : null);
    if (!c) noindex = true;
    else if (il && !ilce && !tip) canonical = `https://www.hekimhane.com.tr/dis-tedavileri/${toSlug(il)}/${toSlug(c)}`;
    else { qs.set('uzmanlik', c); canonical = `https://www.hekimhane.com.tr/klinikler?${qs.toString()}`; }
  }

  return {
    title,
    description: desc,
    keywords: [konum + ' diş kliniği', konum + ' diş hekimi', 'diş hekimi ara', 'diş kliniği', uzmanlik].filter(Boolean),
    alternates: { canonical },
    // İç arama sonuçlarını indeksleme (thin/duplicate)
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

/** Doktor satırlarındaki "Onaylı" rozeti = gerçek sahiplik; içe aktarılan `verified` sütunu değil. */
async function doktorOnayla<T extends { kind: 'klinik' | 'doktor'; data: any }>(items: T[]): Promise<T[]> {
  const docs = items.filter(it => it.kind === 'doktor').map(it => it.data as Doktor);
  if (!docs.length) return items;
  const onayli = new Map((await gercekOnayIsaretle(docs)).map(d => [d.id, d]));
  return items.map(it => it.kind === 'doktor' ? { ...it, data: onayli.get(it.data.id) || it.data } : it);
}

async function getKlinikler(filters: KlinikFilters) {
  noStore();
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  // Sıra: Pro → profil puanı → hasta puanı
  let query = profilSirasi(supabase.from('klinikler').select('*', { count: 'exact' }), await puanKolonuVar(supabase))
    .range(from, from + PAGE_SIZE - 1);
  if (filters.il)       query = query.eq('il', filters.il);
  if (filters.ilce)     query = query.eq('ilce', filters.ilce);
  if (filters.tip)      query = query.eq('type', filters.tip);
  if (filters.uzmanlik) query = (query as any).overlaps('specs', uzmanlikOverlap(filters.uzmanlik));
  if (filters.dil && filters.dil !== 'Türkçe')      query = (query as any).contains('yabanci_diller', JSON.stringify([filters.dil]));
  if (filters.minRat)   query = query.gte('rat', filters.minRat);
  if (filters.q) {
    const nq = norm(filters.q);
    // Önce il/ilçe adı olarak çöz (Türkçe-normalleştirilmiş): "izmir" → il=İzmir
    const geo = await fetchAllRows<{ il: string | null; ilce: string | null }>(
      () => supabase.from('klinikler').select('il,ilce').not('il', 'is', null));
    const ilByNorm = new Map<string, string>();
    const ilceByNorm = new Map<string, string>();
    for (const r of geo) {
      if (r.il && !ilByNorm.has(norm(r.il))) ilByNorm.set(norm(r.il), r.il);
      if (r.ilce && !ilceByNorm.has(norm(r.ilce))) ilceByNorm.set(norm(r.ilce), r.ilce);
    }
    const match = (m: Map<string, string>, key: string) =>
      m.get(key) || (key.length >= 3 ? Array.from(m.entries()).find(([n]) => n.startsWith(key))?.[1] : undefined);
    const geoOf = (s: string): { col: 'il' | 'ilce'; val: string } | null => {
      const t = norm(s);
      const gi = match(ilByNorm, t);   if (gi) return { col: 'il', val: gi };
      const gc = match(ilceByNorm, t); if (gc) return { col: 'ilce', val: gc };
      return null;
    };
    const mIl = match(ilByNorm, nq);
    const mIlce = mIl ? undefined : match(ilceByNorm, nq);
    if (mIl)        query = query.eq('il', mIl);
    else if (mIlce) query = query.eq('ilce', mIlce);
    else {
      // İsim + konum birlikte: "şahan çanakkale" → konum = il/ilçe, name ~ isim
      const words = filters.q.trim().split(/\s+/).filter(Boolean);
      let split: { col: 'il' | 'ilce'; val: string; name: string } | null = null;
      for (let i = 1; i < words.length && !split; i++) {
        const head = words.slice(0, i).join(' ');
        const tail = words.slice(i).join(' ');
        const gTail = geoOf(tail); // doğal sıra "isim yer" → önce sonu dene
        const gHead = geoOf(head);
        if (gTail)      split = { ...gTail, name: head };
        else if (gHead) split = { ...gHead, name: tail };
      }
      if (split) query = query.eq(split.col, split.val).or(`name.ilike.%${split.name}%,adres.ilike.%${split.name}%`);
      else       query = query.or(`name.ilike.%${filters.q}%,adres.ilike.%${filters.q}%`);
    }
  }
  const { data, count, error } = await query;
  if (error) console.error(error);
  return { data: data || [], count: count || 0 };
}

// Şehir sayıları — aktif uzmanlik filtresi dikkate alınır
// Supabase tek sorguda en fazla 1000 satır döndürür → lib/fetch-all.ts fetchAllRows

// Filtre sayaçları + harita yavaş değişir → 1 saat önbellek. Önce GROUP BY RPC,
// yoksa tüm satırları çekip JS'te sayma (graceful).
const getIller = unstable_cache(async (uzmanlik?: string) => {
  const rpc = await supabase.rpc('klinik_il_counts', { p_uzmanlik: uzmanlik || null });
  if (!rpc.error && rpc.data) return (rpc.data as { deger: string; adet: number }[]).map(r => ({ value: r.deger, label: r.deger, count: Number(r.adet) }));
  const rows = await fetchAllRows<{ il: string | null }>(() => {
    let q = supabase.from('klinikler').select('il').not('il', 'is', null);
    if (uzmanlik) q = (q as any).overlaps('specs', uzmanlikOverlap(uzmanlik));
    return q;
  });
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([il, count]) => ({ value: il, label: il, count }));
}, ['klinik-iller-v1'], { revalidate: 3600, tags: ['facets'] });

const getUzmanliklar = unstable_cache(async (il?: string) => {
  const rpc = await supabase.rpc('klinik_uzmanlik_counts', { p_il: il || null });
  if (!rpc.error && rpc.data) return (rpc.data as { deger: string; adet: number }[]).map(r => ({ value: r.deger, label: r.deger, count: Number(r.adet) }));
  const rows = await fetchAllRows<{ specs: string[] | null }>(() => {
    let q = supabase.from('klinikler').select('specs').not('specs', 'is', null);
    if (il) q = q.eq('il', il);
    return q;
  });
  const map: Record<string, number> = {};
  rows.forEach(r => (r.specs || []).forEach(s => { if (s) map[s] = (map[s] || 0) + 1; }));
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([uzmanlik, count]) => ({ value: uzmanlik, label: uzmanlik, count }));
}, ['klinik-uzmanliklar-v2'], { revalidate: 3600, tags: ['facets'] });

const getIlceler = unstable_cache(async (il?: string) => {
  if (!il) return [];
  const rpc = await supabase.rpc('klinik_ilce_counts', { p_il: il });
  if (!rpc.error && rpc.data) return (rpc.data as { deger: string; adet: number }[]).map(r => ({ value: r.deger, label: r.deger, count: Number(r.adet) }));
  const rows = await fetchAllRows<{ ilce: string | null }>(() =>
    supabase.from('klinikler').select('ilce').eq('il', il).not('ilce', 'is', null));
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.ilce) map[r.ilce] = (map[r.ilce] || 0) + 1; });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([ilce, count]) => ({ value: ilce, label: ilce, count }));
}, ['klinik-ilceler-v1'], { revalidate: 3600, tags: ['facets'] });

const getKonumlar = unstable_cache(async (filters: KlinikFilters) => {
  return fetchAllRows(() => {
    let q = supabase.from('klinikler')
      .select('id,name,lat,lng,tel,type,il,ilce,slug')
      .not('lat', 'is', null).not('lng', 'is', null)
      .neq('lat', 0).neq('lng', 0);
    if (filters.il)       q = q.eq('il', filters.il);
    if (filters.ilce)     q = q.eq('ilce', filters.ilce);
    if (filters.tip)      q = q.eq('type', filters.tip);
    if (filters.uzmanlik) q = (q as any).overlaps('specs', uzmanlikOverlap(filters.uzmanlik));
    if (filters.dil && filters.dil !== 'Türkçe')      q = (q as any).contains('yabanci_diller', JSON.stringify([filters.dil]));
    if (filters.q)        q = q.ilike('name', `%${filters.q}%`);
    return q;
  }, 6000);
}, ['klinik-konumlar-v1'], { revalidate: 3600, tags: ['facets'] });

// ── Devlet/Üniversite kovası — doktorlar tablosundan (etiketli) ──
async function getDoktorBucket(filters: KlinikFilters, tag: string) {
  noStore();
  const from = ((filters.page || 1) - 1) * PAGE_SIZE;
  let q = profilSirasi(supabase.from('doktorlar').select('*', { count: 'exact' })
    .contains('tags', [tag]), await puanKolonuVar(supabase)).range(from, from + PAGE_SIZE - 1);
  if (filters.il)       q = q.eq('il', filters.il);
  if (filters.ilce)     q = q.eq('ilce', filters.ilce);
  if (filters.uzmanlik) q = q.eq('spec', filters.uzmanlik);
  if (filters.q)        q = hekimAra(q, filters.q);
  const { data, count, error } = await q;
  if (error) console.error(error);
  return { data: (data || []) as Doktor[], count: count || 0 };
}

// Kurum seçeneği sayıları (filtre etiketleri için)
async function getKurumCounts() {
  noStore();
  const [k, dev, uni] = await Promise.all([
    supabase.from('klinikler').select('id', { count: 'exact', head: true }),
    supabase.from('doktorlar').select('id', { count: 'exact', head: true }).contains('tags', [DEVLET_TAG]),
    supabase.from('doktorlar').select('id', { count: 'exact', head: true }).contains('tags', [UNI_TAG]),
  ]);
  const ozel = k.count || 0, devlet = dev.count || 0, universite = uni.count || 0;
  return { ozel, devlet, universite, hepsi: ozel + devlet + universite };
}

// Doktor kovası için il/uzmanlık facet sayıları
async function getDoktorIller(tag: string, uzmanlik?: string) {
  const rows = await fetchAllRows<{ il: string | null }>(() => {
    let q = (supabase.from('doktorlar').select('il').contains('tags', [tag]).not('il', 'is', null) as any);
    if (uzmanlik) q = q.eq('spec', uzmanlik);
    return q;
  });
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.il) map[r.il] = (map[r.il] || 0) + 1; });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], 'tr')).map(([il, count]) => ({ value: il, label: il, count }));
}
async function getDoktorUzmanliklar(tag: string, il?: string) {
  const rows = await fetchAllRows<{ spec: string | null }>(() => {
    let q = (supabase.from('doktorlar').select('spec').contains('tags', [tag]).not('spec', 'is', null) as any);
    if (il) q = q.eq('il', il);
    return q;
  });
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.spec) map[r.spec] = (map[r.spec] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([spec, count]) => ({ value: spec, label: spec, count }));
}
// Doktor kovası harita işaretleri (koordinatsızlara il merkezi)
async function getDoktorKonumlar(tag: string, filters: KlinikFilters) {
  const rows = await fetchAllRows<any>(() => {
    let q = (supabase.from('doktorlar').select('id,ad,soyad,lat,lng,tel,spec,il,ilce,slug').contains('tags', [tag]).not('il', 'is', null) as any);
    if (filters.il)   q = q.eq('il', filters.il);
    if (filters.ilce) q = q.eq('ilce', filters.ilce);
    if (filters.uzmanlik) q = q.eq('spec', filters.uzmanlik);
    return q;
  }, 6000);
  return rows.map((d: any) => {
    if (d.lat && d.lng && d.lat !== 0 && d.lng !== 0) return d;
    const center = d.il ? IL_KONUM[d.il] : null;
    if (!center) return null;
    return { ...d, lat: center.lat, lng: center.lng };
  }).filter(Boolean);
}

async function getDoktorIlceler(tag: string, il?: string) {
  if (!il) return [];
  const rows = await fetchAllRows<{ ilce: string | null }>(() =>
    supabase.from('doktorlar').select('ilce').contains('tags', [tag]).eq('il', il).not('ilce', 'is', null));
  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.ilce) map[r.ilce] = (map[r.ilce] || 0) + 1; });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], 'tr')).map(([ilce, count]) => ({ value: ilce, label: ilce, count }));
}

// "Hepsi" — klinik + devlet + üniversite tek listede (rat'a göre pencere sayfalama)
async function getHepsi(filters: KlinikFilters) {
  noStore();
  const need = (filters.page || 1) * PAGE_SIZE;
  const applyK = (q: any) => {
    if (filters.il) q = q.eq('il', filters.il);
    if (filters.ilce) q = q.eq('ilce', filters.ilce);
    if (filters.uzmanlik) q = (q as any).overlaps('specs', uzmanlikOverlap(filters.uzmanlik));
    if (filters.q) q = klinikAra(q, filters.q);
    return q;
  };
  const applyD = (q: any) => {
    if (filters.il) q = q.eq('il', filters.il);
    if (filters.ilce) q = q.eq('ilce', filters.ilce);
    if (filters.uzmanlik) q = q.eq('spec', filters.uzmanlik);
    if (filters.q) q = hekimAra(q, filters.q);
    return q;
  };
  const puanli = await puanKolonuVar(supabase);
  const [kl, dv, uni, kc, dc, uc] = await Promise.all([
    applyK(profilSirasi(supabase.from('klinikler').select('*'), puanli).range(0, need - 1)),
    applyD(profilSirasi(supabase.from('doktorlar').select('*').contains('tags', [DEVLET_TAG]), puanli).range(0, need - 1)),
    applyD(profilSirasi(supabase.from('doktorlar').select('*').contains('tags', [UNI_TAG]), puanli).range(0, need - 1)),
    applyK(supabase.from('klinikler').select('id', { count: 'exact', head: true })),
    applyD(supabase.from('doktorlar').select('id', { count: 'exact', head: true }).contains('tags', [DEVLET_TAG])),
    applyD(supabase.from('doktorlar').select('id', { count: 'exact', head: true }).contains('tags', [UNI_TAG])),
  ]);
  const aranan = aramaKelimeleri(filters.q).join(' ').toLocaleLowerCase('tr');
  const adBaslar = (x: { kind: 'klinik' | 'doktor'; data: any }) => {
    const ad = (x.kind === 'klinik' ? String(x.data.name || '') : `${x.data.ad || ''} ${x.data.soyad || ''}`).toLocaleLowerCase('tr');
    return ad.replace(/^(uzm\.?|dr\.?|dt\.?|prof\.?|doç\.?|diş hekimi)\s*/g, '').startsWith(aranan) || ad.startsWith(aranan);
  };
  const merged = [
    ...((kl.data || []) as Klinik[]).map(k => ({ kind: 'klinik' as const, rat: k.rat || 0, pro: k.premium ? 1 : 0, puan: Number((k as any).profil_puani) || 0, data: k })),
    ...((dv.data || []) as Doktor[]).map(d => ({ kind: 'doktor' as const, rat: d.rat || 0, pro: (d as any).premium ? 1 : 0, puan: Number((d as any).profil_puani) || 0, data: d })),
    ...((uni.data || []) as Doktor[]).map(d => ({ kind: 'doktor' as const, rat: d.rat || 0, pro: (d as any).premium ? 1 : 0, puan: Number((d as any).profil_puani) || 0, data: d })),
  ].sort((a, b) => {
    // Arama varken en iyi eşleşme üstte: adı yazılanla başlayan kayıt, türü ne olursa olsun öne gelir
    if (aranan) {
      const pa = adBaslar(a), pb = adBaslar(b);
      if (pa !== pb) return pa ? -1 : 1;
    }
    // Profil puanı yüksek olanlar önde (puan ziyaretçiye gösterilmez). Pro sırayı ETKİLEMEZ (Eki 2026).
    if (a.puan !== b.puan) return b.puan - a.puan;
    // Özel klinikler önceliklidir → her zaman üstte; sonra devlet/üniversite hastanesi
    // hekimleri. Grup içinde puana göre sıralanır.
    if (a.kind !== b.kind) return a.kind === 'klinik' ? -1 : 1;
    return b.rat - a.rat;
  });
  const start = ((filters.page || 1) - 1) * PAGE_SIZE;
  return { items: merged.slice(start, start + PAGE_SIZE), count: (kc.count || 0) + (dc.count || 0) + (uc.count || 0) };
}

// ── En yakın konum fallback: sonuç 0 ise boş bırakma ──
function mesafeKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Belirli bir konum için özel+devlet+üniversite hekimlerini birleşik getirir (özel önce).
async function fallbackFetch(f: KlinikFilters, limit: number): Promise<{ kind: 'klinik' | 'doktor'; data: any }[]> {
  const applyK = (q: any) => { if (f.il) q = q.eq('il', f.il); if (f.ilce) q = q.eq('ilce', f.ilce); if (f.uzmanlik) q = q.overlaps('specs', uzmanlikOverlap(f.uzmanlik)); return q; };
  const applyD = (q: any) => { if (f.il) q = q.eq('il', f.il); if (f.ilce) q = q.eq('ilce', f.ilce); if (f.uzmanlik) q = q.eq('spec', f.uzmanlik); return q; };
  const [kl, dv, uni] = await Promise.all([
    applyK(supabase.from('klinikler').select('*').order('rat', { ascending: false }).range(0, limit - 1)),
    applyD(supabase.from('doktorlar').select('*').contains('tags', [DEVLET_TAG]).order('rat', { ascending: false }).range(0, limit - 1)),
    applyD(supabase.from('doktorlar').select('*').contains('tags', [UNI_TAG]).order('rat', { ascending: false }).range(0, limit - 1)),
  ]);
  return [
    ...((kl.data || []) as Klinik[]).map(k => ({ kind: 'klinik' as const, data: k })),
    ...((dv.data || []) as Doktor[]).map(d => ({ kind: 'doktor' as const, data: d })),
    ...((uni.data || []) as Doktor[]).map(d => ({ kind: 'doktor' as const, data: d })),
  ];
}

// İlçede yoksa il geneli, ilde yoksa en yakın il — hiçbir zaman boş bırakma.
async function getFallback(filters: KlinikFilters, limit = 5): Promise<{ items: { kind: 'klinik' | 'doktor'; data: any }[]; note: string } | null> {
  noStore();
  // 1) İlçe düş → il geneli
  if (filters.ilce && filters.il) {
    const r = await fallbackFetch({ ...filters, ilce: undefined, page: 1 }, limit);
    if (r.length) return { items: r.slice(0, limit), note: `"${filters.ilce}" için sonuç yok — ${filters.il} genelindeki en yakın hekimler` };
  }
  // 2) İl geneli de boşsa → en yakın iller
  const baseIl = filters.il;
  if (baseIl && IL_KONUM[baseIl]) {
    const merkez = IL_KONUM[baseIl];
    const yakinIller = Object.keys(IL_KONUM).filter(x => x !== baseIl)
      .map(x => ({ il: x, km: mesafeKm(merkez, IL_KONUM[x]) })).sort((a, b) => a.km - b.km);
    for (const n of yakinIller.slice(0, 10)) {
      const r = await fallbackFetch({ ...filters, il: n.il, ilce: undefined, page: 1 }, limit);
      if (r.length) return { items: r.slice(0, limit), note: `"${filters.ilce || baseIl}" için sonuç yok — en yakın ${n.il} ilindeki hekimler (~${Math.round(n.km)} km)` };
    }
  }
  return null;
}

export default async function KliniklerPage(
  { searchParams }: { searchParams: Record<string, string> }
) {
  const kurumSel = (KURUM_VALS as readonly string[]).includes(searchParams.kurum) ? searchParams.kurum : 'hepsi';   // ilk açılış: Hepsi (özel + devlet + üniversite)
  const filters: KlinikFilters = {
    il:       searchParams.il       || undefined,
    ilce:     searchParams.ilce     || undefined,
    uzmanlik: searchParams.uzmanlik || undefined,
    tip:      searchParams.tip      || undefined,
    kurum:    kurumSel,
    minRat:   searchParams.minpuan  ? parseFloat(searchParams.minpuan) : undefined,
    dil:      searchParams.dil       || undefined,
    q:        searchParams.q        || undefined,
    page:     searchParams.page     ? parseInt(searchParams.page) : 1,
  };

  // Kurum moduna göre veri kaynağı: özel=klinikler, devlet/üniversite=doktorlar, hepsi=birleşik
  const isDoc = kurumSel === 'devlet' || kurumSel === 'universite';
  const docTag = kurumSel === 'universite' ? UNI_TAG : DEVLET_TAG;

  let items: { kind: 'klinik' | 'doktor'; data: any }[] = [];
  let count = 0;
  if (kurumSel === 'ozel') {
    const r = await getKlinikler(filters);
    items = (r.data as Klinik[]).map(k => ({ kind: 'klinik' as const, data: k }));
    count = r.count;
  } else if (isDoc) {
    const r = await getDoktorBucket(filters, docTag);
    items = r.data.map(d => ({ kind: 'doktor' as const, data: d }));
    count = r.count;
  } else {
    const r = await getHepsi(filters);
    items = r.items.map(it => ({ kind: it.kind, data: it.data }));
    count = r.count;
  }
  items = await doktorOnayla(items);

  const [illerWithCount, ilcelerWithCount, uzmanliklarWithCount, konumlar, kurumCounts] = await Promise.all([
    isDoc ? getDoktorIller(docTag, filters.uzmanlik) : getIller(filters.uzmanlik),
    isDoc ? getDoktorIlceler(docTag, filters.il) : getIlceler(filters.il),
    isDoc ? getDoktorUzmanliklar(docTag, filters.il) : getUzmanliklar(filters.il),
    isDoc ? getDoktorKonumlar(docTag, filters) : getKonumlar(filters),
    getKurumCounts(),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Sonuç 0 ve konum filtresi varsa → en yakın hekimleri getir (boş bırakma)
  const fallback = (items.length === 0 && (filters.il || filters.ilce))
    ? await getFallback(filters, 5)
    : null;
  if (fallback) fallback.items = await doktorOnayla(fallback.items);

  // tip='Diş Hekimi' → bireysel diş hekimleri listesi (menüdeki "Diş Hekimleri")
  const tipEtiket = filters.tip === 'Diş Hekimi' ? 'Diş Hekimleri'
    : filters.tip === 'Çocuk Diş Hekimi' ? 'Çocuk Diş Hekimleri'
    : filters.tip ? `${filters.tip} Klinikleri`
    : null;
  const yer = filters.ilce || filters.il;

  const kurumEtiket = kurumSel === 'devlet' ? 'Devlet Diş Hekimleri'
    : kurumSel === 'universite' ? 'Üniversite Diş Hekimleri'
    : null;   // hepsi (varsayılan) → genel başlık

  const title = kurumEtiket ? (yer ? `${yer} ${kurumEtiket}` : kurumEtiket)
    : tipEtiket ? (yer ? `${yer} ${tipEtiket}` : `Tüm ${tipEtiket}`)
    : filters.uzmanlik ? `${filters.uzmanlik} Klinikleri`
    : filters.ilce ? `${filters.ilce} Diş Klinikleri`
    : filters.il   ? `${filters.il} Diş Klinikleri`
    : 'Tüm Diş Klinikleri';

  // ── SEO: BreadcrumbList + ItemList (listelenen klinikler) ──
  const bcItems = [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
    { '@type': 'ListItem', position: 2, name: 'Diş Klinikleri', item: 'https://www.hekimhane.com.tr/klinikler' },
  ];
  if (filters.il)   bcItems.push({ '@type': 'ListItem', position: 3, name: filters.il, item: `https://www.hekimhane.com.tr/klinikler?il=${encodeURIComponent(filters.il)}` });
  if (filters.ilce) bcItems.push({ '@type': 'ListItem', position: 4, name: filters.ilce, item: `https://www.hekimhane.com.tr/klinikler?il=${encodeURIComponent(filters.il||'')}&ilce=${encodeURIComponent(filters.ilce)}` });

  const listItems = items.slice(0, 20).map((it, i) => {
    const d = it.data;
    const name = it.kind === 'klinik' ? d.name : `${d.ad || ''} ${d.soyad || ''}`.trim();
    const url = it.kind === 'klinik'
      ? (d.slug ? `https://www.hekimhane.com.tr/klinikler/${TR(d.il||'turkiye')}/${TR(d.ilce||'merkez')}/${d.slug}` : undefined)
      : (d.slug ? `https://www.hekimhane.com.tr/doktorlar/${d.slug}` : undefined);
    return { '@type': 'ListItem', position: i + 1, name, url };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: bcItems },
      { '@type': 'ItemList', name: title, numberOfItems: count, itemListElement: listItems },
    ],
  };

  return (
    <ListingLayout
      basePath="/klinikler"
      entityLabel="klinik"
      entityLabelPlural={kurumSel === 'ozel' ? 'klinik' : isDoc ? 'hekim' : 'klinik ve hekim'}
      color="#1A335E"
      gradient="linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)"
      icon={<HkIconAnim name="dentistry" size={36} playOnView />}
      iconBg="linear-gradient(135deg,var(--navy),var(--navy2))"
      title={title}
      count={count}
      cityCount={illerWithCount.length}
      breadcrumb={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Klinikler', href: '/klinikler' },
        ...(filters.il ? [{ label: filters.il, href: `/klinikler?il=${encodeURIComponent(filters.il)}` }] : []),
        ...(filters.ilce ? [{ label: filters.ilce, href: `/klinikler?il=${filters.il}&ilce=${filters.ilce}` }] : []),
      ]}
      filterSections={[
        { key: 'q',        label: 'Arama',    type: 'search',   placeholder: 'Klinik veya hekim ara...' },
        { key: 'kurum',    label: 'Kurum',    type: 'radio',    hideAll: true, options: [
          { value: 'ozel',       label: 'Özel',       count: kurumCounts.ozel },
          { value: 'devlet',     label: 'Devlet',     count: kurumCounts.devlet },
          { value: 'universite', label: 'Üniversite', count: kurumCounts.universite },
          { value: 'hepsi',      label: 'Hepsi',      count: kurumCounts.hepsi },
        ].filter(o => o.count > 0 || o.value === kurumSel) },
        { key: 'il',       label: 'Şehir',    type: 'radio',    options: illerWithCount },
        ...(filters.il && ilcelerWithCount.length > 1
          ? [{ key: 'ilce', label: 'İlçe', type: 'radio' as const, options: ilcelerWithCount }]
          : []),
        { key: 'uzmanlik', label: 'Uzmanlık', type: 'checkbox', options: uzmanliklarWithCount },
        { key: 'dil',      label: 'Konuşulan Dil', type: 'radio', render: 'chips', options: KLINIK_DIL_SECENEKLERI },
      ]}
      activeFilters={{ kurum: kurumSel, il: filters.il, ilce: filters.ilce, uzmanlik: filters.uzmanlik, tip: filters.tip, dil: filters.dil, q: filters.q }}
      hasActiveFilters={!!(filters.il || filters.ilce || filters.uzmanlik || filters.tip || filters.dil || filters.q || kurumSel !== 'hepsi')}
      markers={konumlar.map((k: any) => {
        const isKlinik = !isDoc;
        const nm = isKlinik ? k.name : `${k.ad || ''} ${k.soyad || ''}`.trim();
        const href = isKlinik
          ? (k.slug ? `/klinikler/${TR(k.il||'turkiye')}/${TR(k.ilce||'merkez')}/${k.slug}` : `/klinikler/${k.id}`)
          : (k.slug ? `/doktorlar/${k.slug}` : `/doktorlar/${k.id}`);
        return { id: k.id, name: nm, lat: k.lat, lng: k.lng, tel: k.tel, type: isKlinik ? k.type : k.spec, il: k.il, ilce: k.ilce, href };
      })}
      totalPages={totalPages}
      currentPage={filters.page || 1}
      searchParams={searchParams}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {items.length === 0 ? (
        fallback ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FBF4DD', border: '1px solid #E9CE7E', borderRadius: 14, padding: '13px 16px' }}>
              <i className="fa-solid fa-location-dot" style={{ color: '#B8860B', marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: '#6B5B2E', lineHeight: 1.55 }}>{fallback.note}</span>
            </div>
            {fallback.items.map(it => it.kind === 'klinik'
              ? <KlinikCard key={`fk-${it.data.id}`} klinik={puansiz(it.data as Klinik)} />
              : <DoktorCard key={`fd-${it.data.id}`} doktor={puansiz(it.data as Doktor)} />)}
          </div>
        ) : (
          <EmptyState href="/klinikler" />
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(it => it.kind === 'klinik'
            ? <KlinikCard key={`k-${it.data.id}`} klinik={puansiz(it.data as Klinik)} />
            : <DoktorCard key={`d-${it.data.id}`} doktor={puansiz(it.data as Doktor)} />)}
        </div>
      )}
    </ListingLayout>
  );
}

function EmptyState({ href }: { href: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 32px', background: 'white', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="22" cy="22" r="14" stroke="#C7D2E0" strokeWidth="3"/>
          <path d="M32 32 43 43" stroke="#C7D2E0" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Sonuç bulunamadı</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Filtreleri değiştirerek tekrar deneyin.</p>
      <a href={href} className="btn btn-navy" style={{ marginTop: 16, display: 'inline-flex' }}>Filtreleri Temizle</a>
    </div>
  );
}
