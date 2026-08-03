export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBobathByIl } from '@/lib/bobath';

interface Props { params: { il: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getBobathByIl(params.il);
  if (!res) return { title: 'Sayfa Bulunamadı' };
  const title = `${res.il} Bobath Terapistleri — Fizyoterapist Listesi`;
  const desc = `${res.il} ilinde Bobath (NDT) yaklaşımıyla çalışan ${res.doctors.length} fizyoterapist. İletişim ve uzmanlık bilgileri.`;
  const canonical = `https://www.hekimhane.com.tr/bobath-terapistleri/${params.il}`;
  return {
    title, description: desc,
    keywords: [`${res.il} bobath terapisti`, `${res.il} fizyoterapist`, `${res.il} bobath fizyoterapist`],
    alternates: { canonical },
    openGraph: { title: `${title} | Hekimhane`, description: desc, url: canonical, type: 'website' },
  };
}

export default async function BobathIlPage({ params }: Props) {
  const res = await getBobathByIl(params.il);
  if (!res) notFound();
  const { il, doctors } = res;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.hekimhane.com.tr' },
        { '@type': 'ListItem', position: 2, name: 'Bobath Terapistleri', item: 'https://www.hekimhane.com.tr/bobath-terapistleri' },
        { '@type': 'ListItem', position: 3, name: il, item: `https://www.hekimhane.com.tr/bobath-terapistleri/${params.il}` },
      ] },
    ],
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: 'linear-gradient(150deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)', color: 'white', padding: '86px 16px 30px' }}>
        <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Sayfa</Link><span>›</span>
            <Link href="/bobath-terapistleri" style={{ color: 'inherit', textDecoration: 'none' }}>Bobath Terapistleri</Link><span>›</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{il}</span>
          </nav>
          <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 20, padding: '3px 11px', marginBottom: 12 }}>BOBATH TERAPİSTİ</div>
          <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            {il} Bobath Terapistleri
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>
            {doctors.length} fizyoterapist · Bobath (NDT) yaklaşımı
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 48px' }}>
        {/* Katıl çağrısı */}
        <div style={{ background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#854D0E', display: 'flex', gap: 10, alignItems: 'center' }}>
          <i className="fa-solid fa-circle-info" />
          <span>Bu listedeki terapist sizseniz, <Link href="/katil" style={{ color: '#854D0E', fontWeight: 700 }}>profilinizi sahiplenerek</Link> iletişim bilgilerinizi görünür yapabilir ve profilinizi yönetebilirsiniz.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
          {doctors.map(d => {
            const hidden = (d as any).contact_hidden !== false; // varsayılan gizli
            const email = (d as any).email as string | null;
            return (
              <div key={d.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                <Link href={`/doktorlar/${d.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{d.unvan ? d.unvan + ' ' : ''}{d.ad} {d.soyad}</div>
                </Link>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Bobath Terapisti · {d.spec}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{[d.ilce, d.il].filter(Boolean).join(', ')}</div>

                {hidden ? (
                  <div style={{ marginTop: 12, padding: '9px 11px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 10, fontSize: 12, color: '#64748B', display: 'flex', gap: 7, alignItems: 'center' }}>
                    <i className="fa-solid fa-lock" style={{ fontSize: 11 }} />
                    İletişim bilgileri gizli — terapist katıldığında görünür olur.
                  </div>
                ) : (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {d.tel && (
                      <a href={`tel:${d.tel.replace(/\s/g, '')}`} style={{ fontSize: 13, color: 'var(--navy)', textDecoration: 'none', display: 'flex', gap: 7, alignItems: 'center' }}>
                        <i className="fa-solid fa-phone" style={{ color: 'var(--gold)', fontSize: 12 }} /> {d.tel}
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} style={{ fontSize: 13, color: 'var(--navy)', textDecoration: 'none', display: 'flex', gap: 7, alignItems: 'center', wordBreak: 'break-all' }}>
                        <i className="fa-solid fa-envelope" style={{ color: 'var(--gold)', fontSize: 12 }} /> {email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
