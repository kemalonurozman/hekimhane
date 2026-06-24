'use client';

/**
 * HekimhaneAI — Ana sayfa AI Sağlık Asistanı widget'ı
 * Hekimhane veritabanı + hastalık bilgisi + Claude AI
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Mesaj {
  rol: 'kullanici' | 'asistan';
  icerik: string;
  zaman: Date;
}

const ORNEK_SORULAR = [
  'Hangi doktora gitmeliyim?',
  '3 haftadır ses kısıklığım var',
  'İstanbul\'da kardiyolog arıyorum',
  'Diyabet belirtileri neler?',
  'Randevu öncesi ne yapmalıyım?',
  'Göğüs ağrısı ne zaman tehlikeli?',
];

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 20 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#1B3A69',
          animation: `aiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  );
}

// Satır içi token'ları parse eder: **bold**, [link](url), 📞 tel, düz metin
function renderInline(metin: string): React.ReactNode[] {
  // [text](url) | **bold** | 📞 0312 123 45 67
  const tokenRe = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|📞\s*([\d\s()+\-]{7,20})/g;
  const parcalar: React.ReactNode[] = [];
  let son = 0;
  let m: RegExpExecArray | null;

  while ((m = tokenRe.exec(metin)) !== null) {
    if (m.index > son) parcalar.push(metin.slice(son, m.index));

    if (m[1] !== undefined && m[2] !== undefined) {
      // Markdown link: [text](url)
      const href = m[2];
      // Tüm linkler yeni sekmede açılır — AI sohbeti kapanmasın
      parcalar.push(
        <a
          key={m.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1B3A69', fontWeight: 600, textDecoration: 'underline',
            textDecorationColor: 'rgba(27,58,105,.35)',
            textUnderlineOffset: 2,
          }}
        >
          {m[1]}
        </a>
      );
    } else if (m[3] !== undefined) {
      // Bold: **text**
      parcalar.push(<strong key={m.index}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      // Telefon numarası: tıklanabilir tel: linki
      const numara = m[4].trim();
      const temizNo = numara.replace(/\s/g, '');
      parcalar.push(
        <a
          key={m.index}
          href={`tel:${temizNo}`}
          style={{
            color: '#2D6A4F', fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#ECFDF5', borderRadius: 6,
            padding: '1px 7px', fontSize: 13,
          }}
        >
          📞 {numara}
        </a>
      );
    }

    son = m.index + m[0].length;
  }

  if (son < metin.length) parcalar.push(metin.slice(son));
  return parcalar;
}

// Markdown-lite renderer: bold, links, listeler, başlıklar
function MesajIcerik({ icerik }: { icerik: string }) {
  const satirlar = icerik.split('\n');
  return (
    <div style={{ lineHeight: 1.65, fontSize: 14.5 }}>
      {satirlar.map((satir, i) => {
        const t = satir.trim();
        if (t === '' || t === '---') return <br key={i} />;

        // ── Başlık satırı (## veya ###) ─────────────────────────────
        if (/^#{1,3}\s/.test(t)) {
          const baslikMetin = t.replace(/^#{1,3}\s*/, '');
          return (
            <div key={i} style={{
              fontWeight: 700, fontSize: 14, margin: '14px 0 5px',
              color: '#1D1D1F', letterSpacing: '-.2px',
            }}>
              {renderInline(baslikMetin)}
            </div>
          );
        }

        // ── Acil uyarı ───────────────────────────────────────────────
        if (t.startsWith('🚨')) {
          return (
            <div key={i} style={{
              fontWeight: 700, fontSize: 15, margin: '8px 0 4px',
              color: '#C0392B',
            }}>
              {renderInline(t)}
            </div>
          );
        }

        // ── Ayraç çizgi ──────────────────────────────────────────────
        if (t === '---' || t === '—') {
          return <hr key={i} style={{ border: 'none', borderTop: '1px solid #E5E5EA', margin: '12px 0' }} />;
        }

        // ── Liste satırı (-, •, ✓, *, sayı.) ───────────────────────
        const listeEsles = t.match(/^([-•*✓✔]|\d+\.)\s+([\s\S]+)$/);
        if (listeEsles) {
          const icerik2 = listeEsles[2];
          const isCheckmark = listeEsles[1] === '✓' || listeEsles[1] === '✔';
          return (
            <div key={i} style={{ display: 'flex', gap: 8, margin: '4px 0', alignItems: 'flex-start' }}>
              <span style={{
                color: isCheckmark ? '#2D6A4F' : '#1B3A69',
                flexShrink: 0, marginTop: 3, fontSize: 11, lineHeight: 1,
              }}>
                {isCheckmark ? '✓' : '●'}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>{renderInline(icerik2)}</span>
            </div>
          );
        }

        // ── Kategori başlığı (Hekimhane'de ... mevcut:) ─────────────
        if (/Hekimhane.?de .+mevcut/i.test(t) || /^(Doktorlar|Klinikler|Hastaneler|Eczaneler):/i.test(t)) {
          return (
            <div key={i} style={{
              fontWeight: 700, fontSize: 13, letterSpacing: '.2px',
              color: '#1B3A69', margin: '12px 0 6px',
              paddingBottom: 4, borderBottom: '1px solid #EEF2FF',
            }}>
              {renderInline(t)}
            </div>
          );
        }

        // ── Normal paragraf ──────────────────────────────────────────
        return <div key={i} style={{ marginBottom: 2 }}>{renderInline(t)}</div>;
      })}
    </div>
  );
}

export default function HekimhaneAI() {
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [girdi, setGirdi] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [acik, setAcik] = useState(false);
  const [apiHata, setApiHata] = useState(false);
  const mesajKonteynerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const konteynerRef = useRef<HTMLDivElement>(null);

  // Sadece YENİ mesaj eklenince chat kutusu içinde scroll — sayfa KESİNLİKLE kaymaz
  useEffect(() => {
    const el = mesajKonteynerRef.current;
    if (!el) return;
    // requestAnimationFrame: DOM güncellendikten sonra, sayfa scroll'u etkilemeden
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [mesajlar.length]); // ← sadece mesaj SAYISI değişince (içerik/streaming'de tetiklenmez)

  // Panel açılınca input'a odaklan — preventScroll: sayfa kaymaz
  useEffect(() => {
    if (acik) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 150);
    }
  }, [acik]);

  const mesajGonder = useCallback(async (metin?: string) => {
    const sorgu = (metin || girdi).trim();
    if (!sorgu || yukleniyor) return;

    setGirdi('');
    setApiHata(false);

    const yeniMesaj: Mesaj = { rol: 'kullanici', icerik: sorgu, zaman: new Date() };
    setMesajlar(prev => [...prev, yeniMesaj]);
    setYukleniyor(true);

    // Geçmiş konuşmayı API formatına çevir
    const gecmis = mesajlar.slice(-6).map(m => ({
      role: m.rol === 'kullanici' ? 'user' : 'assistant',
      content: m.icerik,
    }));

    try {
      const res = await fetch('/api/ai-yardim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj: sorgu, gecmis }),
      });

      if (!res.ok) {
        const hata = await res.json().catch(() => ({}));
        if (hata.hata?.includes('ANTHROPIC_API_KEY')) {
          setApiHata(true);
        }
        throw new Error(hata.hata || 'Bağlantı hatası');
      }

      // Streaming okuma
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let tamMesin = '';

      // Asistan mesajı placeholder
      setMesajlar(prev => [...prev, { rol: 'asistan', icerik: '', zaman: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        tamMesin += decoder.decode(value, { stream: true });

        setMesajlar(prev => {
          const kopya = [...prev];
          kopya[kopya.length - 1] = { ...kopya[kopya.length - 1], icerik: tamMesin };
          return kopya;
        });
      }
    } catch (err) {
      console.error(err);
      if (!apiHata) {
        setMesajlar(prev => [...prev, {
          rol: 'asistan',
          icerik: 'Şu an yanıt verilemiyor. Lütfen biraz sonra tekrar deneyin.',
          zaman: new Date(),
        }]);
      }
    } finally {
      setYukleniyor(false);
    }
  }, [girdi, yukleniyor, mesajlar, apiHata]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      mesajGonder();
    }
  };

  const temizle = () => {
    setMesajlar([]);
    setGirdi('');
    setApiHata(false);
  };

  return (
    <>
      <style>{`
        @keyframes aiDot {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes aiSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(27,58,105,.35); }
          50%       { box-shadow: 0 0 0 10px rgba(27,58,105,0); }
        }
        .ai-panel {
          animation: aiSlideIn .22s ease-out;
        }
        .ai-ornek-chip:hover {
          background: #EEF2FF !important;
          border-color: #1B3A69 !important;
          color: #1B3A69 !important;
        }
        .ai-gonder-btn:hover:not(:disabled) {
          background: #163060 !important;
        }
        .ai-gonder-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .ai-textarea:focus {
          outline: none;
        }
        .ai-acma-btn {
          animation: aiPulse 2.5s ease-in-out 3;
        }
      `}</style>

      {/* ── Kapalı durum — büyük banner ── */}
      {!acik && (
        <div
          onClick={() => setAcik(true)}
          style={{
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #1B3A69 0%, #0F2347 60%, #1B3A69 100%)',
            borderRadius: 20,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform .15s, box-shadow .15s',
            boxShadow: '0 4px 24px rgba(27,58,105,.25)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(27,58,105,.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(27,58,105,.25)';
          }}
        >
          {/* Dekor daire */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 80, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(212,168,67,.07)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, zIndex: 1 }}>
            {/* AI ikonu */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(145deg, #D4A843, #B8902E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 16px rgba(212,168,67,.4)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
                <circle cx="18" cy="6" r="3" fill="white" stroke="none" />
                <path d="M16.5 6h3M18 4.5v3" stroke="#D4A843" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-.4px' }}>
                  Hekimhane AI
                </p>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '.8px',
                  padding: '2px 7px', borderRadius: 6,
                  background: 'rgba(212,168,67,.25)', color: '#D4A843',
                  textTransform: 'uppercase',
                }}>
                  BETA
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 13.5, margin: 0 }}>
                Belirtilerinizi yazın — uzman önerin, gerçek klinik ve doktor bilgisi
              </p>
            </div>
          </div>

          {/* Örnek sorular */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, zIndex: 1 }}>
            {ORNEK_SORULAR.slice(0, 3).map(s => (
              <span
                key={s}
                onClick={e => { e.stopPropagation(); setAcik(true); setTimeout(() => mesajGonder(s), 200); }}
                className="ai-ornek-chip"
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,.2)',
                  color: 'rgba(255,255,255,.8)', fontSize: 12.5, fontWeight: 500,
                  background: 'rgba(255,255,255,.08)',
                  cursor: 'pointer', transition: 'all .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: '#D4A843', color: 'white',
            fontSize: 13.5, fontWeight: 700,
            whiteSpace: 'nowrap', zIndex: 1, flexShrink: 0,
          }}>
            Sormaya Başla
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      {/* ── Açık durum — chat paneli ── */}
      {acik && (
        <div
          ref={konteynerRef}
          className="ai-panel"
          style={{
            borderRadius: 20,
            border: '1.5px solid #E5E5EA',
            background: 'white',
            overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0,0,0,.1)',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1B3A69 0%, #0F2347 100%)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(145deg, #D4A843, #B8902E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" />
                  <circle cx="18" cy="6" r="3" fill="white" stroke="none" />
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>Hekimhane AI</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#4ADE80', display: 'inline-block',
                  }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,.55)', fontSize: 11.5 }}>
                  Türkiye sağlık rehberi asistanı
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {mesajlar.length > 0 && (
                <button onClick={temizle} title="Temizle" style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2" />
                  </svg>
                </button>
              )}
              <button onClick={() => setAcik(false)} title="Küçült" style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* API Key uyarısı */}
          {apiHata && (
            <div style={{
              background: '#FEF3C7', borderBottom: '1px solid #FCD34D',
              padding: '10px 20px', fontSize: 13, color: '#92400E',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span><strong>ANTHROPIC_API_KEY</strong> .env.local dosyasına eklenmemiş. <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: '#92400E', fontWeight: 700 }}>console.anthropic.com</a>'dan alabilirsiniz.</span>
            </div>
          )}

          {/* Mesaj alanı — scroll SADECE bu kutu içinde kalır, sayfa kesinlikle kaymaz */}
          <div
            ref={mesajKonteynerRef}
            style={{
              height: 380, overflowY: 'auto',
              padding: '20px 20px 10px',
              background: '#FAFAFA',
              display: 'flex', flexDirection: 'column', gap: 16,
              overscrollBehavior: 'contain', // ← scroll sayfaya sızmaz
            }}
          >
            {/* Karşılama */}
            {mesajlar.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: 'linear-gradient(145deg, #EEF2FF, #DBEAFE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1D1D1F', margin: '0 0 6px', letterSpacing: '-.3px' }}>
                  Hekimhane AI&apos;a Hoş Geldiniz
                </h3>
                <p style={{ color: '#6E6E73', fontSize: 13.5, margin: '0 0 24px', lineHeight: 1.6 }}>
                  Belirtilerinizi yazın, hangi doktora gitmeniz gerektiğini ve<br />
                  yakınınızdaki uzmanları birlikte bulalım.
                </p>
                {/* Örnek sorular */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {ORNEK_SORULAR.map(s => (
                    <button
                      key={s}
                      onClick={() => mesajGonder(s)}
                      className="ai-ornek-chip"
                      style={{
                        padding: '7px 14px', borderRadius: 20,
                        border: '1.5px solid #E5E5EA', background: 'white',
                        fontSize: 12.5, color: '#3A3A3C', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all .15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mesajlar */}
            {mesajlar.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.rol === 'kullanici' ? 'flex-end' : 'flex-start',
                gap: 10, alignItems: 'flex-start',
              }}>
                {m.rol === 'asistan' && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(145deg, #1B3A69, #0F2347)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                )}

                <div style={{
                  maxWidth: '78%',
                  padding: '11px 14px',
                  borderRadius: m.rol === 'kullanici' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.rol === 'kullanici'
                    ? 'linear-gradient(135deg, #1B3A69, #0F2347)'
                    : 'white',
                  color: m.rol === 'kullanici' ? 'white' : '#1D1D1F',
                  boxShadow: '0 1px 4px rgba(0,0,0,.07)',
                  border: m.rol === 'asistan' ? '1px solid #E5E5EA' : 'none',
                }}>
                  {m.rol === 'asistan'
                    ? <MesajIcerik icerik={m.icerik} />
                    : <span style={{ fontSize: 14.5 }}>{m.icerik}</span>
                  }
                </div>
              </div>
            ))}

            {/* Yazıyor göstergesi */}
            {yukleniyor && mesajlar[mesajlar.length - 1]?.rol !== 'asistan' && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(145deg, #1B3A69, #0F2347)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                  background: 'white', border: '1px solid #E5E5EA',
                  boxShadow: '0 1px 4px rgba(0,0,0,.07)',
                }}>
                  <TypingDots />
                </div>
              </div>
            )}

          </div>

          {/* Uyarı bandı */}
          <div style={{
            background: '#F0F9FF', borderTop: '1px solid #E0F2FE',
            padding: '6px 20px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 11.5, color: '#0369A1' }}>
              Genel bilgi amaçlıdır, tıbbi teşhis yerine geçmez. Acil durumlarda <strong>112</strong>&apos;yi arayın.
            </span>
          </div>

          {/* Input alanı */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #E5E5EA',
            background: 'white',
            display: 'flex', gap: 10, alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              className="ai-textarea"
              value={girdi}
              onChange={e => setGirdi(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Belirtilerinizi veya sorunuzu yazın..."
              disabled={yukleniyor}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid #E5E5EA',
                borderRadius: 12, padding: '10px 14px',
                fontSize: 14.5, fontFamily: 'inherit', color: '#1D1D1F',
                lineHeight: 1.5, maxHeight: 100,
                transition: 'border-color .15s',
                background: yukleniyor ? '#F5F5F7' : 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#1B3A69'}
              onBlur={e => e.target.style.borderColor = '#E5E5EA'}
            />
            <button
              onClick={() => mesajGonder()}
              disabled={!girdi.trim() || yukleniyor}
              className="ai-gonder-btn"
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none',
                background: '#1B3A69', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background .15s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Footer linkler */}
          <div style={{
            padding: '8px 16px 12px',
            display: 'flex', gap: 12, flexWrap: 'wrap',
            borderTop: '1px solid #F2F2F7',
          }}>
            {[
              { href: '/doktorlar', label: 'Doktor Bul' },
              { href: '/klinikler', label: 'Klinik Bul' },
              { href: '/hastaliklar', label: 'Hastalık Rehberi' },
              { href: '/eczaneler', label: 'Eczane Bul' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: 12, color: '#1B3A69', fontWeight: 600,
                textDecoration: 'none', letterSpacing: '-.1px',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {link.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
