export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/helpers';
import { getDevletHospitals, DEVLET_TAG } from '@/lib/devlet-dis';
import type { Doktor } from '@/lib/types';

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string> }): Promise<Metadata> {
  const q = searchParams.q?.trim();
  const title = q ? `"${q}" — Devlet Diş Hastaneleri Arama` : 'Devlet Ağız ve Diş Sağlığı Hastaneleri ve Doktorları';
  const desc = 'Türkiye genelindeki devlet ağız ve diş sağlığı hastaneleri (ADSH) ve bu hastanelerde görev yapan diş hekimleri. İl il hastane listesi, bölümler ve hekim kadrosu.';
  return {
    title, description: desc,
    keywords: ['devlet diş hastanesi', 'ağız ve diş sağlığı hastanesi', 'ADSH', 'devlet diş hekimi', 'devlet diş kliniği'],
    alternates: { canonical: 'https://www.hekimhane.com.tr/devlet-dis-hastaneleri' },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: 'https://www.hekimhane.com.tr/devlet-dis-hastaneleri', type: 'website' },
  };
}

export default async function DevletDisPage({ searchParams }: { searchParams: Record<string, string> }) {
  noStore();
  const q = (searchParams.q || '').trim();
  const hospitals = await getDevletHospitals();

  // Arama: hastane adı/il + doktor adı
  let matchedDoctors: Doktor[] = [];
  let shownHospitals = hospitals;
  if (q) {
    const ql = q.toLocaleLowerCase('tr');
    shownHospitals = hospitals.filter(h => `${h.name} ${h.il} ${h.ilce}`.toLocaleLowerCase('tr').includes(ql));
    const { data } = await supabase.from('doktorlar').select('*').contains('tags', [DEVLET_TAG])
      .or(`ad.ilike.%${q}%,soyad.ilike.%${q}%,spec.ilike.%${q}%`).limit(60);
    matchedDoctors = (data || []) as Doktor[];
  }

  const byIl: Record<string, typeof hospitals> = {};
  shownHospitals.forEach(h => (byIl[h.il] ||= []).push(h));
  const iller = Object.keys(byIl).sort((a, b) => a.localeCompare(b, 'tr'));
  const totalDocs = hospitals.reduce((s, h) => s + h.count, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Devlet Diş Hastaneleri', item: 'https://www.hekimhane.com.tr/devlet-dis-hastaneleri' },
      ] },
      { '@type': 'ItemList', name: 'Devlet Ağız ve Diş Sağlığı Hastaneleri', numberOfItems: hospitals.length,
        itemListElement: hospitals.slice(0, 30).map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: h.name, url: `https://www.hekimhane.com.tr/devlet-dis-hastaneleri/${h.ilSlug}/${h.slug}` })) },
    ],
  };

  const card = { display: 'block', background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', textDecoration: 'none' as const };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '22px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16, display: 'flex', gap: 8 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <span style={{ color: 'white', fontWeight: 600 }}>Devlet Diş Hastaneleri</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Devlet Ağız ve Diş Sağlığı Hastaneleri
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 8, maxWidth: 720, lineHeight: 1.6 }}>
            {hospitals.length} devlet ağız ve diş sağlığı hastanesi, {totalDocs} diş hekimi kadrosu. Hastaneyi seçip bölüm ve hekimlerini görüntüleyin.
          </p>
          <form style={{ marginTop: 16, display: 'flex', gap: 8, maxWidth: 460 }}>
            <input name="q" defaultValue={q} placeholder="Hastane, il veya hekim adı ara…"
              style={{ flex: 1, padding: '11px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.12)', color: 'white', fontSize: 14, outline: 'none', minWidth: 0 }} />
            <button style={{ padding: '11px 18px', borderRadius: 11, background: 'var(--gold)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Ara</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        {q && matchedDoctors.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 19, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Hekimler ({matchedDoctors.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
              {matchedDoctors.map(d => (
                <Link key={d.id} href={`/doktorlar/${d.slug}`} style={card}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{d.unvan ? d.unvan + ' ' : ''}{d.ad} {d.soyad}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{d.spec}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{d.clinic_name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {iller.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '40px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            {q ? `"${q}" için hastane bulunamadı.` : 'Kayıt bulunamadı.'}
          </div>
        ) : iller.map(il => (
          <section key={il} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>{il}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
              {byIl[il].map(h => (
                <Link key={h.slug} href={`/devlet-dis-hastaneleri/${h.ilSlug}/${h.slug}`} style={{ ...card, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--navy),var(--navy2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fa-solid fa-hospital" style={{ color: 'white', fontSize: 16 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 20, padding: '2px 9px' }}>DEVLET</span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.35 }}>{h.name.replace('T.C. Sağlık Bakanlığı ', '')}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{h.ilce}, {h.il} · <strong style={{ color: 'var(--navy2)' }}>{h.count} hekim</strong></div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
