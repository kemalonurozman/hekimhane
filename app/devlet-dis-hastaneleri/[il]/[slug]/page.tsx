export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHospitalWithDoctors } from '@/lib/devlet-dis';

interface Props { params: { il: string; slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getHospitalWithDoctors(params.il, params.slug);
  if (!res) return { title: 'Sayfa Bulunamadı' };
  const { hospital } = res;
  const shortName = hospital.name.replace('T.C. Sağlık Bakanlığı ', '');
  const title = `${shortName} — Diş Hekimleri Kadrosu`;
  const desc = `${shortName} (${hospital.il}) bünyesinde görev yapan ${hospital.count} diş hekimi ve bölümleri. Ağız ve diş sağlığı hastanesi hekim kadrosu ve iletişim.`;
  const canonical = `https://www.hekimhane.com.tr/devlet-dis-hastaneleri/${params.il}/${params.slug}`;
  return {
    title, description: desc,
    keywords: [`${shortName}`, `${hospital.il} devlet diş hastanesi`, `${hospital.il} ağız ve diş sağlığı hastanesi`, `${hospital.il} devlet diş hekimi`],
    alternates: { canonical },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

export default async function HastaneDoktorlariPage({ params }: Props) {
  const res = await getHospitalWithDoctors(params.il, params.slug);
  if (!res) notFound();
  const { hospital, doctors } = res;
  const shortName = hospital.name.replace('T.C. Sağlık Bakanlığı ', '');

  // Bölüme (spec) göre grupla
  const byBolum: Record<string, typeof doctors> = {};
  doctors.forEach(d => (byBolum[d.spec || 'Diğer'] ||= []).push(d));
  const bolumler = Object.keys(byBolum).sort((a, b) => a.localeCompare(b, 'tr'));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Devlet Diş Hastaneleri', item: 'https://www.hekimhane.com.tr/devlet-dis-hastaneleri' },
        { '@type': 'ListItem', position: 3, name: hospital.il, item: `https://www.hekimhane.com.tr/devlet-dis-hastaneleri?q=${encodeURIComponent(hospital.il)}` },
        { '@type': 'ListItem', position: 4, name: shortName, item: `https://www.hekimhane.com.tr/devlet-dis-hastaneleri/${params.il}/${params.slug}` },
      ] },
      { '@type': ['Hospital', 'Dentist'], name: hospital.name, address: { '@type': 'PostalAddress', addressRegion: hospital.il, addressLocality: hospital.ilce, addressCountry: 'TR' },
        employee: doctors.slice(0, 50).map(d => ({ '@type': 'Person', name: `${d.unvan ? d.unvan + ' ' : ''}${d.ad} ${d.soyad}`.trim(), jobTitle: d.spec })) },
    ],
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '22px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/devlet-dis-hastaneleri" style={{ color: 'inherit', textDecoration: 'none' }}>Devlet Diş Hastaneleri</Link><span>›</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{shortName}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 20, padding: '3px 11px' }}>DEVLET HASTANESİ</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>{shortName}</h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>
            <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', marginRight: 6 }} />{hospital.ilce}, {hospital.il} · {doctors.length} diş hekimi · {bolumler.length} bölüm
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 48px' }}>
        {bolumler.map(bolum => (
          <section key={bolum} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-tooth" style={{ color: 'var(--gold)', fontSize: 15 }} /> {bolum}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>({byBolum[bolum].length})</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
              {byBolum[bolum].map(d => (
                <Link key={d.id} href={`/doktorlar/${d.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'white', border: '1px solid var(--border)', borderRadius: 13, padding: '12px 14px', textDecoration: 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy),var(--navy2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                    {(d.ad || '?')[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.ad} {d.soyad}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{d.unvan || 'Dt.'}{d.verified ? ' · ✓ Onaylı' : ''}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
