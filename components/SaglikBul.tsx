'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ILLER = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay',
  'Manisa', 'Kayseri', 'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van',
  'Aydın', 'Denizli', 'Muğla', 'Eskişehir', 'Trabzon', 'Malatya',
  'Erzurum', 'Ordu', 'Sakarya', 'Tekirdağ', 'Rize',
];

const HIZLI_BELIRTILER = [
  'Baş ağrısı', 'Sırt ağrısı', 'Yorgunluk', 'Tansiyon',
  'Diş ağrısı', 'Göz sorunu', 'Cilt problemi', 'Mide ağrısı',
];

type Adim = 'belirti' | 'sehir' | 'sonuc';

interface Oneri {
  uzmanlik: string;
  aciklama: string;
  link: string;
}

export default function SaglikBul() {
  const router = useRouter();
  const [adim, setAdim] = useState<Adim>('belirti');
  const [belirti, setBelirti] = useState('');
  const [sehir, setSehir] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oneriler, setOneriler] = useState<Oneri[]>([]);
  const [hata, setHata] = useState('');

  async function analizEt() {
    if (!belirti.trim()) return;
    setAdim('sehir');
  }

  async function doktorBul() {
    if (!sehir) return;
    setYukleniyor(true);
    setHata('');

    try {
      const res = await fetch('/api/ai-yardim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesaj: `Şikayetim: ${belirti}. Hangi uzman doktora gitmeliyim? Kısa yanıt ver: sadece 2-3 uzmanlık alanı öner, her biri için tek satır açıklama. Format: UZMANLİK: açıklama`,
        }),
      });

      if (!res.ok) throw new Error('Sunucu hatası');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      // Parse the AI response into suggestions
      const lines = fullText.split('\n').filter(l => l.includes(':'));
      const parsed: Oneri[] = lines.slice(0, 3).map(line => {
        const [uzm, ...rest] = line.split(':');
        const uzmanlik = uzm.replace(/^\*+/, '').replace(/\*+$/, '').trim();
        const aciklama = rest.join(':').trim();
        const link = `/doktorlar?il=${encodeURIComponent(sehir)}&uzmanlik=${encodeURIComponent(uzmanlik)}`;
        return { uzmanlik, aciklama, link };
      }).filter(o => o.uzmanlik.length > 0 && o.uzmanlik.length < 60);

      if (parsed.length === 0) {
        // Fallback: genel doktor önerisi
        setOneriler([{
          uzmanlik: 'Uzman Doktor',
          aciklama: fullText.slice(0, 200),
          link: `/doktorlar?il=${encodeURIComponent(sehir)}`,
        }]);
      } else {
        setOneriler(parsed);
      }
      setAdim('sonuc');
    } catch {
      setHata('Öneri alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  }

  function sifirla() {
    setAdim('belirti');
    setBelirti('');
    setSehir('');
    setOneriler([]);
    setHata('');
  }

  return (
    <section style={{
      background: 'white',
      borderTop: '1px solid #E5E5EA',
      borderBottom: '1px solid #E5E5EA',
      padding: '64px 0',
    }}>
      <div className="container">
        <div className="saglik-bul-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Sol: Açıklama */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1.4px',
              textTransform: 'uppercase', color: '#D4A843', margin: '0 0 16px',
            }}>
              AI Destekli Doktor Eşleştirme
            </p>
            <h2 style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700,
              letterSpacing: '-1px', lineHeight: 1.1, color: '#1D1D1F',
              margin: '0 0 16px',
            }}>
              Şikayetinizi Anlatın,<br />
              <span style={{ color: '#1B3A69' }}>Doktorunuzu Bulun</span>
            </h2>
            <p style={{
              color: '#6E6E73', fontSize: 16, lineHeight: 1.65,
              margin: '0 0 28px', letterSpacing: '.05px',
            }}>
              Hangi belirtilere sahip olduğunuzu yazın. Yapay zeka size en uygun
              uzmanlık alanını ve yakınızda bulunan doktorları önerir.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { baslik: 'Belirtilerinizi Yazın', aciklama: 'Şikayetlerinizi kısaca anlatın' },
                { baslik: 'Şehrinizi Seçin', aciklama: 'Size en yakın doktorları bulalım' },
                { baslik: 'Uzmanı Bulun', aciklama: 'AI destekli öneri ile doğru doktora gidin' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: adim === ['belirti', 'sehir', 'sonuc'][i] ? '#1B3A69' : '#F2F2F7',
                    color: adim === ['belirti', 'sehir', 'sonuc'][i] ? 'white' : '#AEAEB2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2,
                    transition: 'all .25s',
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1D1D1F', letterSpacing: '-.1px' }}>{item.baslik}</div>
                    <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>{item.aciklama}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: Form */}
          <div style={{
            background: '#F5F5F7', borderRadius: 20,
            padding: 32, border: '1px solid #E5E5EA',
          }}>

            {/* Adım 1: Belirti */}
            {adim === 'belirti' && (
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F', margin: '0 0 6px', letterSpacing: '-.3px' }}>
                  Şikayetiniz nedir?
                </h3>
                <p style={{ fontSize: 13, color: '#8E8E93', margin: '0 0 20px' }}>
                  Belirtilerinizi kısaca açıklayın veya aşağıdan seçin.
                </p>

                {/* Hızlı seçimler */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {HIZLI_BELIRTILER.map(b => (
                    <button
                      key={b}
                      onClick={() => setBelirti(b)}
                      style={{
                        padding: '6px 14px', borderRadius: 20,
                        border: `1.5px solid ${belirti === b ? '#1B3A69' : '#E5E5EA'}`,
                        background: belirti === b ? '#1B3A69' : 'white',
                        color: belirti === b ? 'white' : '#3A3A3C',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        transition: 'all .15s', letterSpacing: '-.1px',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <textarea
                  value={belirti}
                  onChange={e => setBelirti(e.target.value)}
                  placeholder="Örn: 3 gündür devam eden şiddetli baş ağrısı ve bulantı var..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: 12, border: '1.5px solid #E5E5EA',
                    background: 'white', fontSize: 14,
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    resize: 'none', outline: 'none', boxSizing: 'border-box',
                    color: '#1D1D1F', lineHeight: 1.5,
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1B3A69'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E5EA'; }}
                />

                <button
                  onClick={analizEt}
                  disabled={!belirti.trim()}
                  style={{
                    width: '100%', marginTop: 14,
                    padding: '13px 0', borderRadius: 12,
                    background: belirti.trim() ? '#1B3A69' : '#E5E5EA',
                    color: belirti.trim() ? 'white' : '#AEAEB2',
                    fontWeight: 600, fontSize: 15, border: 'none',
                    cursor: belirti.trim() ? 'pointer' : 'not-allowed',
                    letterSpacing: '-.2px', transition: 'all .15s',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Devam Et
                </button>
              </div>
            )}

            {/* Adım 2: Şehir */}
            {adim === 'sehir' && (
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F', margin: '0 0 6px', letterSpacing: '-.3px' }}>
                  Hangi şehirdesiniz?
                </h3>
                <p style={{ fontSize: 13, color: '#8E8E93', margin: '0 0 20px' }}>
                  Size en yakın doktorları gösterelim.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, maxHeight: 200, overflow: 'auto' }}>
                  {ILLER.map(il => (
                    <button
                      key={il}
                      onClick={() => setSehir(il)}
                      style={{
                        padding: '6px 14px', borderRadius: 20,
                        border: `1.5px solid ${sehir === il ? '#1B3A69' : '#E5E5EA'}`,
                        background: sehir === il ? '#1B3A69' : 'white',
                        color: sehir === il ? 'white' : '#3A3A3C',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        transition: 'all .15s', letterSpacing: '-.1px',
                      }}
                    >
                      {il}
                    </button>
                  ))}
                </div>

                {hata && (
                  <p style={{ color: '#DC2626', fontSize: 13, margin: '0 0 12px' }}>{hata}</p>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={sifirla}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 12,
                      background: 'white', border: '1.5px solid #E5E5EA',
                      color: '#6E6E73', fontWeight: 500, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Geri
                  </button>
                  <button
                    onClick={doktorBul}
                    disabled={!sehir || yukleniyor}
                    style={{
                      flex: 2, padding: '12px 0', borderRadius: 12,
                      background: sehir && !yukleniyor ? '#1B3A69' : '#E5E5EA',
                      color: sehir && !yukleniyor ? 'white' : '#AEAEB2',
                      fontWeight: 600, fontSize: 15, border: 'none',
                      cursor: sehir && !yukleniyor ? 'pointer' : 'not-allowed',
                      letterSpacing: '-.2px', transition: 'all .15s',
                      fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {yukleniyor ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Analiz ediliyor...
                      </>
                    ) : 'Doktor Bul'}
                  </button>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Adım 3: Sonuç */}
            {adim === 'sonuc' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1F', margin: 0, letterSpacing: '-.3px' }}>
                    Size önerilen uzmanlar
                  </h3>
                  <button
                    onClick={sifirla}
                    style={{
                      background: 'none', border: 'none', color: '#8E8E93',
                      fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      padding: '4px 8px', borderRadius: 8,
                    }}
                  >
                    Yeniden Ara
                  </button>
                </div>

                <p style={{ fontSize: 13, color: '#8E8E93', margin: '0 0 16px', fontStyle: 'italic' }}>
                  "{belirti}" — {sehir}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {oneriler.map((o, i) => (
                    <a
                      key={i}
                      href={o.link}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'white', borderRadius: 14,
                        border: '1.5px solid #E5E5EA',
                        padding: '14px 16px', textDecoration: 'none',
                        transition: 'border-color .15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#1B3A69')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E5EA')}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1D1D1F', letterSpacing: '-.1px' }}>
                          {o.uzmanlik}
                        </div>
                        {o.aciklama && (
                          <div style={{ fontSize: 12.5, color: '#6E6E73', marginTop: 3, lineHeight: 1.4 }}>
                            {o.aciklama.slice(0, 80)}
                          </div>
                        )}
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 12 }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>

                <a
                  href={`/doktorlar?il=${encodeURIComponent(sehir)}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '11px 0', borderRadius: 12,
                    background: '#F2F2F7', color: '#1B3A69',
                    fontWeight: 600, fontSize: 14, textDecoration: 'none',
                    letterSpacing: '-.1px',
                  }}
                >
                  {sehir} Tüm Doktorları Gör
                </a>

                <p style={{ fontSize: 11.5, color: '#AEAEB2', margin: '12px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
                  Bu öneriler bilgi amaçlıdır. Tanı için mutlaka bir doktora başvurun.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobil responsive */}
      <style>{`
        @media (max-width: 768px) {
          .saglik-bul-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
