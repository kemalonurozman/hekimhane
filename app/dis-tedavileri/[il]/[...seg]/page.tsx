export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Klinik } from '@/lib/types';
import { toSlug } from '@/lib/helpers';
import { IL_KONUM } from '@/lib/il-koordinatlari';
import {
  DENTAL_SPECIALTIES, synonymsForSpec, specFilterValues, resolveSpecOrTreatment, buildDentalFaq, TREATMENTS, DENTAL_PROBLEMS,
} from '@/lib/uzmanlik-data';
import { rehberBySpec } from '@/lib/uzmanlik-rehberleri';
import KlinikCard from '@/components/KlinikCard';

interface Props { params: { il: string; seg: string[] } }

async function fetchAll<T = any>(build: () => any, max = 20000): Promise<T[]> {
  noStore();
  const PAGE = 1000; const out: T[] = [];
  for (let f = 0; f < max; f += PAGE) {
    const { data, error } = await build().range(f, f + PAGE - 1);
    if (error || !data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

async function resolveIl(ilSlug: string): Promise<string | null> {
  const rows = await fetchAll<{ il: string | null }>(() => supabase.from('klinikler').select('il').not('il', 'is', null));
  const set = Array.from(new Set(rows.map(r => r.il!).filter(Boolean)));
  for (const il of set) if (toSlug(il) === ilSlug) return il;
  return null;
}

async function resolveIlce(il: string, ilceSlug: string): Promise<string | null> {
  const rows = await fetchAll<{ ilce: string | null }>(() => supabase.from('klinikler').select('ilce').eq('il', il).not('ilce', 'is', null));
  const set = Array.from(new Set(rows.map(r => r.ilce!).filter(Boolean)));
  for (const ilce of set) if (toSlug(ilce) === ilceSlug) return ilce;
  return null;
}

interface YakinKlinik { klinik: Klinik; km: number; ayniIl: boolean }

/** İki il merkezi arası kuş uçuşu mesafe (km) */
function mesafeKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/**
 * Bölgede bu hizmeti etiketlemiş klinik yokken, hizmeti FİİLEN veren en yakın
 * klinikleri bulur: önce aynı ilin diğer ilçeleri, sonra il merkezleri arası
 * mesafeye göre en yakın iller. Uydurma etiket yazmadan gerçek alternatif sunar.
 */
async function enYakinlar(il: string, ilce: string | null, syn: string[], limit = 6): Promise<YakinKlinik[]> {
  const hepsi = await fetchAll<Klinik>(() =>
    supabase.from('klinikler').select('*').overlaps('specs', specFilterValues(syn)));

  const merkez = IL_KONUM[il];
  const out: YakinKlinik[] = [];

  for (const k of hepsi) {
    if (!k.il) continue;
    const ayniIl = k.il === il;
    if (ayniIl && ilce && k.ilce === ilce) continue;   // zaten kapsam içinde, boştu
    if (ayniIl && !ilce) continue;                     // il sayfasında olamaz (sorgu boş döndü)
    const hedef = IL_KONUM[k.il];
    const km = ayniIl ? 0 : (merkez && hedef ? mesafeKm(merkez, hedef) : 9999);
    out.push({ klinik: k, km, ayniIl });
  }

  return out
    .sort((a, b) =>
      Number(b.ayniIl) - Number(a.ayniIl) ||
      a.km - b.km ||
      (b.klinik.rev || 0) - (a.klinik.rev || 0) ||
      (b.klinik.rat || 0) - (a.klinik.rat || 0))
    .slice(0, limit);
}

async function getData(ilSlug: string, seg: string[]) {
  if (!seg || seg.length < 1 || seg.length > 2) return null;
  const il = await resolveIl(ilSlug);
  if (!il) return null;

  const uzmSlug = seg[seg.length - 1];
  const ilceSlug = seg.length === 2 ? seg[0] : null;
  const st = resolveSpecOrTreatment(uzmSlug);
  if (!st) return null;

  let ilce: string | null = null;
  if (ilceSlug) {
    ilce = await resolveIlce(il, ilceSlug);
    if (!ilce) return null;
  }

  const syn = synonymsForSpec(st.spec);
  let klinikler = await fetchAll<Klinik>(() => {
    let q = supabase.from('klinikler').select('*').eq('il', il).overlaps('specs', specFilterValues(syn));
    if (ilce) q = q.eq('ilce', ilce);
    return q;
  });

  // O yerde bu hizmetle etiketli klinik yoksa 404 verme: bölgedeki diş
  // kliniklerini DÜRÜST bir başlıkla listele (bkz. genelListe bayrağı).
  // Kliniklerin veri kaydına dokunulmaz — doğrulanmamış hizmet iddiası yazmayız,
  // sayfa "bu hizmet için başvurabileceğiniz klinikler" olarak sunulur.
  let genelListe = false;
  let yakin: YakinKlinik[] = [];
  if (klinikler.length === 0) {
    genelListe = true;

    // (a) Bu hizmeti FİİLEN etiketlemiş en yakın klinikler — önce aynı ilin
    //     diğer ilçeleri, sonra mesafeye göre komşu iller.
    yakin = await enYakinlar(il, ilce, syn);

    // (b) Kullanıcının bulunduğu yerdeki diş klinikleri (dürüst başlıkla)
    klinikler = await fetchAll<Klinik>(() => {
      let q = supabase.from('klinikler').select('*').eq('il', il);
      if (ilce) q = q.eq('ilce', ilce);
      return q;
    });
    // Ne yerel klinik ne de yakında etiketli klinik varsa sayfa gerçekten boş.
    if (klinikler.length === 0 && yakin.length === 0) return null;
  }

  // İç linkleme için bağlam
  const scopeRows = await fetchAll<{ specs: string[] | null }>(() => {
    let q = supabase.from('klinikler').select('specs').eq('il', il).not('specs', 'is', null);
    if (ilce) q = q.eq('ilce', ilce);
    return q;
  });
  const scopeSpecSet = new Set<string>();
  scopeRows.forEach(r => (r.specs || []).forEach(s => scopeSpecSet.add(s)));
  const relatedSpecs = DENTAL_SPECIALTIES.filter(item =>
    item !== st.spec && synonymsForSpec(item).some(s => scopeSpecSet.has(s)));

  return { il, ilce, ...st, klinikler, relatedSpecs, genelListe, yakin };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getData(params.il, params.seg);
  if (!d) return { title: 'Sayfa Bulunamadı' };
  const yer = d.ilce ? `${d.ilce}, ${d.il}` : d.il;
  const yerBaslik = d.ilce ? `${d.ilce} ${d.il}` : d.il;
  const title = d.problem
    ? `${yerBaslik} ${d.label} Tedavisi — Diş Klinikleri`
    : d.genelListe
    ? `${yerBaslik} ${d.label} — Başvurabileceğiniz Diş Klinikleri`
    : `${yerBaslik} ${d.label} — Diş Hekimleri`;
  const desc = d.problem
    ? `${yer} bölgesinde ${d.label} şikâyeti için başvurabileceğiniz diş klinikleri ve hekimleri. ${d.problem.ozet} Puan, yorum, adres ve online randevu bilgileri Hekimhane'de.`
    : d.genelListe
    ? `${yer} bölgesinde ${d.label} için başvurabileceğiniz ${d.klinikler.length} diş kliniği. Puanlar, hasta yorumları, adres ve telefon bilgileriyle karşılaştırın; işlemi klinikle teyit edin.`
    : `${yer} bölgesinde ${d.label} hizmeti veren ${d.klinikler.length} diş hekimi ve klinik. Puanlar, hasta yorumları, adres, telefon ve online randevu bilgileri Hekimhane'de.`;
  const canonical = `https://www.hekimhane.com.tr/dis-tedavileri/${params.il}/${params.seg.join('/')}`;
  return {
    title,
    description: desc,
    keywords: [`${yerBaslik} ${d.label}`, `${yerBaslik} diş hekimi`, d.label, `${d.il} ${d.label} fiyatları`, `${yerBaslik} diş kliniği`],
    alternates: { canonical },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

const chip = { padding: '8px 14px', borderRadius: 20, background: 'white', border: '1px solid var(--border)', color: 'var(--navy2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' as const };

export default async function DisTedaviPage({ params }: Props) {
  const d = await getData(params.il, params.seg);
  if (!d) notFound();
  const { il, ilce, label, spec, treatment, problem, klinikler, relatedSpecs, genelListe, yakin } = d;

  const ilPath = toSlug(il);
  const uzmPath = params.seg[params.seg.length - 1];
  const yer = ilce ? `${ilce}, ${il}` : il;
  const yerBaslik = ilce ? `${ilce} ${il}` : il;
  const sorted = [...klinikler].sort((a, b) => (b.rev || 0) - (a.rev || 0) || (b.rat || 0) - (a.rat || 0));
  const faq = buildDentalFaq({ il, ilce, label, count: sorted.length, genelListe });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
          { '@type': 'ListItem', position: 2, name: 'Diş Klinikleri', item: 'https://www.hekimhane.com.tr/klinikler' },
          { '@type': 'ListItem', position: 3, name: il, item: `https://www.hekimhane.com.tr/klinikler?il=${encodeURIComponent(il)}` },
          ...(ilce ? [{ '@type': 'ListItem', position: 4, name: ilce, item: `https://www.hekimhane.com.tr/klinikler?il=${encodeURIComponent(il)}&ilce=${encodeURIComponent(ilce)}` }] : []),
          { '@type': 'ListItem', position: ilce ? 5 : 4, name: `${yerBaslik} ${label}`, item: `https://www.hekimhane.com.tr/dis-tedavileri/${params.il}/${params.seg.join('/')}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${yerBaslik} ${label}`,
        numberOfItems: sorted.length,
        itemListElement: sorted.slice(0, 20).map((k, i) => ({
          '@type': 'ListItem', position: i + 1, name: k.name,
          url: k.slug ? `https://www.hekimhane.com.tr/klinikler/${toSlug(k.il || 'turkiye')}/${toSlug(k.ilce || 'merkez')}/${k.slug}` : undefined,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '86px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/klinikler" style={{ color: 'inherit', textDecoration: 'none' }}>Diş Klinikleri</Link><span>›</span>
            <Link href={`/klinikler?il=${encodeURIComponent(il)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{il}</Link>
            {ilce && (<><span>›</span><Link href={`/klinikler?il=${encodeURIComponent(il)}&ilce=${encodeURIComponent(ilce)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{ilce}</Link></>)}
            <span>›</span><span style={{ color: 'white', fontWeight: 600 }}>{label}</span>
          </nav>

          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            {problem ? <>{yerBaslik}&apos;da {label}</> : genelListe ? <>{yerBaslik}&apos;da {label} İçin Diş Klinikleri</> : <>{yerBaslik} {label}</>}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
            {treatment ? <>{treatment.ozet} </> : null}
            {problem ? <>{problem.ozet} </> : null}
            {problem
              ? <>{yer}&apos;da <strong>{label}</strong> şikâyetiniz için başvurabileceğiniz {sorted.length} diş kliniği ve hekimi. Puan, hasta yorumu ve iletişim bilgileriyle karşılaştırın.</>
              : genelListe
              ? <>{yer}&apos;da <strong>{label}</strong> için başvurabileceğiniz {sorted.length} diş kliniği. Puanları, hasta yorumları ve iletişim bilgileriyle karşılaştırın.</>
              : <>{yer}&apos;da <strong>{label}</strong> hizmeti veren {sorted.length} diş hekimi ve klinik. Puanları, hasta yorumları ve iletişim bilgileriyle karşılaştırın, size en uygun uzmanı bulun.</>}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
              <i className="fa-solid fa-tooth" style={{ color: 'var(--gold)' }} /> {sorted.length} sonuç
            </span>
            {problem?.hastalikSlug && (
              <Link href={`/hastaliklar/dis-sagligi/${problem.hastalikSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--gold)', color: 'var(--navy)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <i className="fa-solid fa-book-medical" /> {label} nedir? Rehber →
              </Link>
            )}
            {(() => { const rb = rehberBySpec(spec); return rb ? (
              <Link href={`/uzmanlik/${rb.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--gold)', color: 'var(--navy)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <i className="fa-solid fa-book-medical" /> {rb.kisaAd} rehberi →
              </Link>
            ) : null; })()}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        {/* Şeffaflık notu — liste, hizmeti etiketli klinikler değil bölgedeki
            diş klinikleri olduğunda kullanıcıya açıkça söylenir. */}
        {genelListe && (
          <div style={{ display: 'flex', gap: 12, background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px', marginBottom: 18 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--navy)' }}>Rehberimizde {yer} için <strong>{label}</strong> hizmetini ayrıca belirtmiş bir klinik kaydı henüz yok.</strong>{' '}
              {yakin.length > 0
                ? <>Aşağıda önce bu hizmeti veren <strong>en yakın klinikleri</strong>, ardından {yerBaslik}&apos;daki diş kliniklerini listeliyoruz. </>
                : <>Bu sayfada {yerBaslik}&apos;daki diş kliniklerini listeliyoruz. </>}
              Randevu öncesi bu işlemin yapılıp yapılmadığını klinikle teyit edin.
              {' '}Kliniğinizi yönetiyorsanız <Link href="/panel" style={{ color: 'var(--navy)', fontWeight: 700 }}>panelden hizmetlerinizi ekleyebilirsiniz</Link>.
            </div>
          </div>
        )}

        {/* Bu hizmeti fiilen veren en yakın klinikler — yalnızca yerelde
            etiketli kayıt yokken gösterilir. Bunlar gerçek etiketli kliniklerdir. */}
        {genelListe && yakin.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px' }}>
              {label} Hizmeti Veren En Yakın Klinikler
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
              {yerBaslik}&apos;da bu hizmeti belirtmiş klinik bulunmadığı için, rehberimizde{' '}
              <strong>{label}</strong> hizmetini veren en yakın klinikleri listeliyoruz.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {yakin.map(y => (
                <div key={y.klinik.id}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6, background: 'var(--gold-light,#FDF6E3)', border: '1px solid rgba(212,168,67,.35)', borderRadius: 20, padding: '3px 11px', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {y.ayniIl
                      ? <>{y.klinik.ilce ? `${y.klinik.ilce}, ` : ''}{y.klinik.il} — aynı il</>
                      : <>{y.klinik.il} — {yerBaslik}&apos;a yaklaşık {y.km} km</>}
                  </div>
                  <KlinikCard klinik={y.klinik} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sonuç listesi */}
        {genelListe && yakin.length > 0 && sorted.length > 0 && (
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px' }}>
            {yerBaslik}&apos;daki Diş Klinikleri
          </h2>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(k => <KlinikCard key={k.id} klinik={k} />)}
        </div>

        {/* İç linkleme: aynı yerde diğer uzmanlıklar */}
        {relatedSpecs.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
              {yerBaslik}'da Diğer Diş Tedavileri
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {relatedSpecs.map(s => (
                <Link key={s} href={ilce ? `/dis-tedavileri/${ilPath}/${toSlug(ilce)}/${toSlug(s)}` : `/dis-tedavileri/${ilPath}/${toSlug(s)}`} style={chip}>
                  {yerBaslik} {s}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* İç linkleme: popüler tedaviler (aynı yer) */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
            {yerBaslik}'da Popüler Tedaviler
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {TREATMENTS.filter(t => t.slug !== uzmPath).slice(0, 8).map(t => (
              <Link key={t.slug} href={ilce ? `/dis-tedavileri/${ilPath}/${toSlug(ilce)}/${t.slug}` : `/dis-tedavileri/${ilPath}/${t.slug}`} style={chip}>
                {yerBaslik} {t.name}
              </Link>
            ))}
          </div>
        </section>

        {/* İç linkleme: sık aranan diş problemleri (aynı yer) */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
            {yerBaslik}&apos;da Sık Aranan Diş Problemleri
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {DENTAL_PROBLEMS.filter(p => p.slug !== uzmPath).slice(0, 10).map(p => (
              <Link key={p.slug} href={ilce ? `/dis-tedavileri/${ilPath}/${toSlug(ilce)}/${p.slug}` : `/dis-tedavileri/${ilPath}/${p.slug}`} style={chip}>
                {yerBaslik} {p.ad}
              </Link>
            ))}
          </div>
        </section>

        {/* İç linkleme: diğer büyük şehirlerde aynı hizmet */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
            Diğer Şehirlerde {label}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Muğla'].filter(c => toSlug(c) !== ilPath).map(c => (
              <Link key={c} href={`/dis-tedavileri/${toSlug(c)}/${uzmPath}`} style={chip}>{c} {label}</Link>
            ))}
          </div>
        </section>

        {/* SSS — içerik zenginliği + FAQPage schema */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
            Sıkça Sorulan Sorular
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faq.map((f, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '16px 18px' }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{f.q}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
