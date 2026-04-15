import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Klinik, Yorum } from '@/lib/types';

interface Props {
  params: { il: string; ilce: string; slug: string };
}

// Supabase'den klinik ve yorumları çek
async function getKlinik(slug: string): Promise<{ klinik: Klinik; yorumlar: Yorum[] } | null> {
  const { data: klinik } = await supabase
    .from('klinikler')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!klinik) return null;

  const { data: yorumlar } = await supabase
    .from('yorumlar')
    .select('*')
    .eq('entity_type', 'klinik')
    .eq('entity_id', klinik.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return { klinik, yorumlar: yorumlar || [] };
}

// Tüm slug'ları build sırasında üret (SSG)
export async function generateStaticParams() {
  const { data } = await supabase
    .from('klinikler')
    .select('il, ilce, slug')
    .not('slug', 'is', null);

  return (data || []).map(k => ({
    il:   (k.il || '').toLowerCase().replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c').replace(/\s+/g, '-'),
    ilce: (k.ilce || '').toLowerCase().replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c').replace(/\s+/g, '-'),
    slug: k.slug || '',
  }));
}

// Dinamik meta
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getKlinik(params.slug);
  if (!result) return { title: 'Klinik Bulunamadı' };

  const { klinik: k } = result;
  const title = `${k.name} — ${k.ilce || ''}, ${k.il || ''}`;
  const desc  = `${k.name} iletişim bilgileri, yorumlar ve randevu. ${k.adres || ''}`;

  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | Hekimhane`,
      description: desc,
      images: k.cover ? [k.cover] : [],
    },
  };
}

// Yıldız
function Stars({ rat, size = 14 }: { rat: number; size?: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <i
          key={i}
          className={`fa-${i <= Math.round(rat) ? 'solid' : 'regular'} fa-star`}
          style={{ color: 'var(--gold)', fontSize: size, marginRight: '1px' }}
        />
      ))}
    </span>
  );
}

// Profil sayfası
export default async function KlinikProfilPage({ params }: Props) {
  const result = await getKlinik(params.slug);
  if (!result) notFound();

  const { klinik: k, yorumlar } = result;

  return (
    <div style={{ paddingTop: '66px' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' }}>
          {[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Klinikler', href: '/klinikler' },
            ...(k.il ? [{ label: k.il, href: `/klinikler?il=${k.il}` }] : []),
            ...(k.ilce ? [{ label: k.ilce, href: `/klinikler?il=${k.il}&ilce=${k.ilce}` }] : []),
            { label: k.name, href: '#' },
          ].map((b, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {i > 0 && <i className="fa-solid fa-chevron-right" style={{ fontSize: '8px' }} />}
              {i === arr.length - 1
                ? <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{b.label}</span>
                : <Link href={b.href} style={{ color: 'var(--navy)', fontWeight: 500 }}>{b.label}</Link>
              }
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, var(--cream) 0%, #F0EDE8 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '36px 0 0',
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '28px', alignItems: 'end' }}>
          {/* İkon */}
          <div style={{
            width: '110px', height: '110px',
            borderRadius: '22px',
            background: k.logo ? 'transparent' : 'var(--navy)',
            border: '4px solid white',
            boxShadow: '0 0 0 3px var(--gold), 0 8px 32px rgba(27,58,105,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '48px',
            marginBottom: '28px',
            overflow: 'hidden',
          }}>
            {k.logo
              ? <img src={k.logo} alt={k.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '🦷'
            }
          </div>

          {/* Bilgiler */}
          <div style={{ paddingBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {k.type && <span className="badge badge-gold">{k.type}</span>}
              {k.acil && <span className="badge badge-red">🚨 Acil</span>}
              {k.online && <span className="badge badge-green">📅 Online Randevu</span>}
              {k.claimed && <span className="badge" style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>✓ Onaylı</span>}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '30px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px'
            }}>
              {k.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--navy2)', fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)' }} />
              {[k.adres, k.ilce, k.il].filter(Boolean).join(', ')}
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--muted)' }}>
              <span><strong style={{ color: 'var(--text)', fontSize: '18px' }}>{k.rat.toFixed(1)}</strong> <Stars rat={k.rat} /></span>
              {k.rev > 0 && <span>{k.rev} yorum</span>}
              {k.tel && <span>📞 {k.tel}</span>}
            </div>
          </div>

          {/* Aksiyonlar */}
          <div style={{ paddingBottom: '28px', display: 'flex', flexDirection: 'column', gap: '9px', minWidth: '200px' }}>
            {k.tel && (
              <a href={`tel:${k.tel.replace(/\s/g, '')}`} className="btn btn-primary">
                <i className="fa-solid fa-phone" /> Hemen Ara
              </a>
            )}
            {k.maps_url && (
              <a href={k.maps_url} target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: '12.5px' }}>
                <i className="fa-solid fa-map-location-dot" /> Haritada Gör
              </a>
            )}
            {k.website && (
              <a href={k.website} target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: '12.5px' }}>
                <i className="fa-solid fa-globe" /> Website
              </a>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '28px',
        padding: '32px',
        alignItems: 'start',
      }}>
        {/* Sol: Yorumlar + Sahiplenme CTA */}
        <div>
          {/* Uzmanlık */}
          {k.specs && k.specs.length > 0 && (
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '14px', color: 'var(--navy)' }}>
                Uzmanlık Alanları
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {k.specs.map(s => (
                  <span key={s} className="badge badge-navy" style={{ fontSize: '12px', padding: '5px 12px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sahiplen CTA */}
          {!k.claimed && (
            <div style={{
              background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)',
              border: '1.5px solid #C7D2FE',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex', alignItems: 'center', gap: '20px',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                background: 'linear-gradient(135deg, var(--navy), var(--navy2))',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className="fa-solid fa-flag" style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>
                  Bu işletmenin sahibi misiniz?
                </div>
                <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5 }}>
                  Sayfayı sahiplenerek bilgileri güncelleyin, fotoğraf ekleyin ve müşterilerinize daha kolay ulaşın.
                </div>
              </div>
              <Link href={`/sahiplen?id=${k.id}&type=klinik`} className="btn btn-navy" style={{ flexShrink: 0, fontSize: '13px' }}>
                <i className="fa-solid fa-flag" /> Sahiplen
              </Link>
            </div>
          )}

          {/* Yorumlar */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '20px', color: 'var(--navy)' }}>
              Yorumlar ({yorumlar.length})
            </h2>
            {yorumlar.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <p style={{ fontSize: '14px' }}>Henüz yorum yok. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {yorumlar.map(y => (
                  <div key={y.id} style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'var(--cream)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{y.author}</span>
                        <span style={{ marginLeft: '8px' }}><Stars rat={y.rating} size={12} /></span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{y.date}</span>
                    </div>
                    {y.text && <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>{y.text}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Bilgi kartı */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '14px', color: 'var(--navy)' }}>
              Kurum Bilgisi
            </h4>
            {[
              { icon: 'fa-tooth', label: k.type },
              { icon: 'fa-city', label: k.il },
              { icon: 'fa-map-pin', label: k.ilce },
              { icon: 'fa-location-dot', label: k.adres },
              { icon: 'fa-phone', label: k.tel },
              { icon: 'fa-globe', label: k.website, isLink: true },
            ].filter(r => r.label).map((row, i) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: '8px 0', borderBottom: '1px solid var(--border)',
                fontSize: '13px',
              }}>
                <i className={`fa-solid ${row.icon}`} style={{ color: 'var(--gold)', width: '16px', marginTop: '2px' }} />
                {row.isLink && row.label
                  ? <a href={row.label} target="_blank" rel="noopener" style={{ color: 'var(--navy)' }}>{row.label}</a>
                  : <span>{row.label}</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
