export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { getBobathIller, BOBATH_TAG } from '@/lib/bobath';
import type { Doktor } from '@/lib/types';

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string> }): Promise<Metadata> {
  const q = searchParams.q?.trim();
  const title = q ? `"${q}" — Bobath Terapisti Arama` : 'Bobath Terapistleri — İl İl Fizyoterapist Listesi';
  const desc = 'Türkiye genelinde Bobath (NDT) yaklaşımıyla çalışan fizyoterapistler. İl il terapist listesi, uzmanlık ve iletişim.';
  return {
    title, description: desc,
    keywords: ['bobath terapisti', 'bobath fizyoterapist', 'ndt', 'nörogelişimsel tedavi', 'bobath terapisi'],
    alternates: { canonical: 'https://www.hekimhane.com.tr/bobath-terapistleri' },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: 'https://www.hekimhane.com.tr/bobath-terapistleri', type: 'website' },
  };
}

export default async function BobathPage({ searchParams }: { searchParams: Record<string, string> }) {
  noStore();
  const q = (searchParams.q || '').trim();
  const iller = await getBobathIller();

  let matched: Doktor[] = [];
  let shownIller = iller;
  if (q) {
    const ql = q.toLocaleLowerCase('tr');
    shownIller = iller.filter(h => h.il.toLocaleLowerCase('tr').includes(ql));
    const { data } = await supabase.from('doktorlar').select('*').contains('tags', [BOBATH_TAG])
      .or(`ad.ilike.%${q}%,soyad.ilike.%${q}%,il.ilike.%${q}%`).limit(60);
    matched = (data || []) as Doktor[];
  }

  const total = iller.reduce((s, h) => s + h.count, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Bobath Terapistleri', item: 'https://www.hekimhane.com.tr/bobath-terapistleri' },
      ] },
    ],
  };

  const card = { display: 'block', background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', textDecoration: 'none' as const };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '86px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16, display: 'flex', gap: 8 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <span style={{ color: 'white', fontWeight: 600 }}>Bobath Terapistleri</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Bobath Terapistleri
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 8, maxWidth: 720, lineHeight: 1.6 }}>
            Türkiye genelinde Bobath (NDT) yaklaşımıyla çalışan {total} fizyoterapist, {iller.length} ilde. İlinizi seçip terapistleri görüntüleyin.
          </p>
          <form style={{ marginTop: 16, display: 'flex', gap: 8, maxWidth: 460 }}>
            <input name="q" defaultValue={q} placeholder="İl veya terapist adı ara…"
              style={{ flex: 1, padding: '11px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.12)', color: 'white', fontSize: 14, outline: 'none', minWidth: 0 }} />
            <button style={{ padding: '11px 18px', borderRadius: 11, background: 'var(--gold)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Ara</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        {q && matched.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Terapistler ({matched.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
              {matched.map(d => (
                <Link key={d.id} href={`/doktorlar/${d.slug}`} style={card}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{d.unvan ? d.unvan + ' ' : ''}{d.ad} {d.soyad}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Bobath Terapisti · {d.spec}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{[d.ilce, d.il].filter(Boolean).join(', ')}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {shownIller.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '40px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            {q ? `"${q}" için sonuç bulunamadı.` : 'Kayıt bulunamadı.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
            {shownIller.map(h => (
              <Link key={h.ilSlug} href={`/bobath-terapistleri/${h.ilSlug}`} style={{ ...card, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--navy),var(--navy2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fa-solid fa-hand-holding-medical" style={{ color: 'white', fontSize: 16 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--navy)' }}>{h.il}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}><strong style={{ color: 'var(--navy2)' }}>{h.count}</strong> terapist</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
