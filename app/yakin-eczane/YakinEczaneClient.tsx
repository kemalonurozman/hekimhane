'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatTel } from '@/lib/helpers';

interface Eczane {
  id: string;
  name: string;
  slug: string | null;
  il: string | null;
  ilce: string | null;
  address: string | null;
  tel: string | null;
}

type Durum = 'bekliyor' | 'araniyor' | 'hazir' | 'izin-yok' | 'hata';

function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function YakinEczaneClient() {
  const [durum, setDurum] = useState<Durum>('bekliyor');
  const [eczaneler, setEczaneler] = useState<Eczane[]>([]);
  const [konum, setKonum] = useState<{ il: string; ilce: string | null } | null>(null);

  function konumBul() {
    if (!('geolocation' in navigator)) {
      setDurum('izin-yok');
      return;
    }
    setDurum('araniyor');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/yakin-eczane?lat=${latitude}&lng=${longitude}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setEczaneler(data.eczaneler || []);
          setKonum(data.konum || null);
          setDurum('hazir');
        } catch {
          setDurum('hata');
        }
      },
      () => setDurum('izin-yok'),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  return (
    <main style={{
      background: '#F5F5F7', minHeight: '100vh', paddingTop: 64,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 70%, #7C3AED 100%)',
        padding: '64px 0 56px', color: 'white',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '1.4px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,.75)', margin: '0 0 14px',
          }}>
            Konum Bazlı Arama
          </p>
          <h1 style={{
            fontSize: 'clamp(30px, 4.5vw, 46px)', fontWeight: 700,
            letterSpacing: '-1.2px', margin: '0 0 14px', lineHeight: 1.1,
          }}>
            Yakınımdaki Eczaneler
          </h1>
          <p style={{
            color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 480,
            margin: '0 auto 32px', lineHeight: 1.6,
          }}>
            Konum izni verin, bulunduğunuz bölgedeki eczaneleri listeleyelim.
          </p>

          <button
            onClick={konumBul}
            disabled={durum === 'araniyor'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 34px', borderRadius: 14, border: 'none',
              background: 'white', color: '#6D28D9',
              fontSize: 15.5, fontWeight: 700, cursor: durum === 'araniyor' ? 'wait' : 'pointer',
              letterSpacing: '-.2px', fontFamily: 'inherit',
              boxShadow: '0 8px 28px rgba(0,0,0,.22)',
            }}
          >
            <IconPin />
            {durum === 'araniyor' ? 'Konum alınıyor…' : 'Konumumu Kullan'}
          </button>
        </div>
      </section>

      <div className="container" style={{ padding: '40px 20px 72px' }}>

        {durum === 'izin-yok' && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14,
            padding: '18px 22px', maxWidth: 560, margin: '0 auto',
            fontSize: 14, color: '#92400E', lineHeight: 1.6, textAlign: 'center',
          }}>
            Konum izni alınamadı. Tarayıcı ayarlarından konum iznini açıp tekrar deneyin
            veya <Link href="/eczaneler" style={{ color: '#92400E', fontWeight: 700 }}>şehre göre eczane arayın</Link>.
          </div>
        )}

        {durum === 'hata' && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14,
            padding: '18px 22px', maxWidth: 560, margin: '0 auto',
            fontSize: 14, color: '#B91C1C', textAlign: 'center',
          }}>
            Eczaneler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
          </div>
        )}

        {durum === 'hazir' && eczaneler.length === 0 && (
          <div style={{
            background: 'white', border: '1px solid #E5E5EA', borderRadius: 14,
            padding: '28px 22px', maxWidth: 560, margin: '0 auto',
            fontSize: 14, color: '#6E6E73', textAlign: 'center', lineHeight: 1.6,
          }}>
            Bulunduğunuz bölgede kayıtlı eczane bulunamadı.{' '}
            <Link href="/eczaneler" style={{ color: '#6D28D9', fontWeight: 600 }}>Şehre göre arayın</Link>.
          </div>
        )}

        {durum === 'hazir' && eczaneler.length > 0 && (
          <>
            <p style={{ fontSize: 14, color: '#6E6E73', margin: '0 0 20px', textAlign: 'center' }}>
              {konum ? (
                <>Bölgeniz: <strong style={{ color: '#1D1D1F' }}>{[konum.ilce, konum.il].filter(Boolean).join(', ')}</strong> — {eczaneler.length} eczane bulundu</>
              ) : (
                <><strong style={{ color: '#1D1D1F' }}>{eczaneler.length} eczane</strong> bulundu</>
              )}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 14, maxWidth: 1080, margin: '0 auto',
            }}>
              {eczaneler.map(e => (
                <div key={e.id} style={{
                  background: 'white', borderRadius: 16,
                  border: '1px solid #E5E5EA',
                  padding: '18px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,.05)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 15, color: '#1D1D1F',
                      letterSpacing: '-.2px', lineHeight: 1.3,
                    }}>
                      {e.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#8E8E93', marginTop: 3 }}>
                      {[e.ilce, e.il].filter(Boolean).join(', ')}
                    </div>
                  </div>

                  {e.address && (
                    <p style={{
                      fontSize: 13, color: '#6E6E73', margin: 0, lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {e.address}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    {e.tel && (
                      <a href={`tel:${e.tel.replace(/\D/g, '')}`} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', borderRadius: 10,
                        background: '#1B3A69', color: 'white',
                        fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '-.1px',
                      }}>
                        <IconPhone /> {formatTel(e.tel)}
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.name, e.address, e.ilce, e.il].filter(Boolean).join(' '))}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', borderRadius: 10,
                        background: '#F5F3FF', color: '#6D28D9',
                        fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '-.1px',
                      }}
                    >
                      <IconMap /> Haritada Aç
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {durum === 'bekliyor' && (
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: '#8E8E93', lineHeight: 1.7 }}>
              Konumunuz yalnızca bölgenizdeki eczaneleri bulmak için kullanılır,
              kaydedilmez ve paylaşılmaz.
            </p>
            <p style={{ fontSize: 14, color: '#8E8E93' }}>
              Konum vermek istemiyorsanız{' '}
              <Link href="/eczaneler" style={{ color: '#6D28D9', fontWeight: 600 }}>şehre göre arama</Link> yapabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
