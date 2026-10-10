'use client';

// Çerez / izleme tercihleri — KVKK Kurulu "Çerez Uygulamaları Hakkında Rehber" (2022) ile uyumlu:
//  • Zorunlu olmayan hiçbir şey ziyaretçi açıkça kabul etmeden çalışmaz (varsayılan: kapalı).
//  • "Reddet" ile "Kabul et" aynı katmanda, aynı görünürlükte.
//  • Tercih sonradan değiştirilebilir (footer → "Çerez tercihleri").
// Sitede zorunlu olmayan tek kalem ziyaret istatistiğidir (Vercel Analytics + Speed Insights);
// ikisi de bu bileşenin içinden, yalnızca onay varsa yüklenir.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const ANAHTAR = 'hk_cerez_tercih';
const SURUM = 1;
type Tercih = { analitik: boolean; surum: number; tarih: string };

function oku(): Tercih | null {
  try {
    const t = JSON.parse(localStorage.getItem(ANAHTAR) || 'null');
    return t && t.surum === SURUM && typeof t.analitik === 'boolean' ? t : null;
  } catch { return null; }
}

/** Footer vb. yerlerden tercih penceresini yeniden açar. */
export function cerezTercihleriniAc() {
  try { window.dispatchEvent(new Event('hk-cerez-ac')); } catch { /* yoksay */ }
}

export default function CerezOnay() {
  const [tercih, setTercih] = useState<Tercih | null>(null);
  const [goster, setGoster] = useState(false);
  const [ayrinti, setAyrinti] = useState(false);
  const [analitik, setAnalitik] = useState(false);
  // Gömülü randevu modülü başka sitelerin içinde açılır — pencere orada gösterilmez
  const gomulu = (usePathname() || '').startsWith('/embed');

  useEffect(() => {
    const t = oku();
    setTercih(t);
    setAnalitik(t?.analitik ?? false);
    if (!t) setGoster(true);
    const ac = () => { const g = oku(); setAnalitik(g?.analitik ?? false); setAyrinti(true); setGoster(true); };
    window.addEventListener('hk-cerez-ac', ac);
    return () => window.removeEventListener('hk-cerez-ac', ac);
  }, []);

  const kaydet = (a: boolean) => {
    const t: Tercih = { analitik: a, surum: SURUM, tarih: new Date().toISOString() };
    try { localStorage.setItem(ANAHTAR, JSON.stringify(t)); } catch { /* özel pencere: yalnız bu oturum */ }
    setTercih(t); setAnalitik(a); setGoster(false); setAyrinti(false);
  };

  const dugme: React.CSSProperties = {
    flex: '1 1 0', minWidth: 120, height: 44, padding: '0 16px', borderRadius: 12, fontSize: 14, fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
  };

  return (
    <>
      {tercih?.analitik && <><Analytics /><SpeedInsights /></>}

      {goster && !gomulu && (
        <div role="dialog" aria-modal="false" aria-label="Çerez tercihleri" className="hk-cerez">
          <style>{`
            .hk-cerez { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9000; max-width: 560px; margin: 0 auto;
              background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 18px; padding: 18px 20px 16px;
              box-shadow: 0 1px 2px rgba(14,26,44,.06), 0 18px 44px -14px rgba(18,41,77,.32);
              font-family: var(--font-sans); animation: hk-cerez-gir .35s cubic-bezier(.2,.8,.2,1); }
            @keyframes hk-cerez-gir { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
            @media (prefers-reduced-motion: reduce) { .hk-cerez { animation: none; } }
          `}</style>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1F', marginBottom: 6 }}>Gizliliğiniz sizin kararınız</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#4A4A4F' }}>
            Sitenin çalışması için gerekli kayıtları kullanıyoruz. İzin verirseniz, siteyi geliştirmek için kimliğinizi
            belirlemeyen ziyaret istatistikleri de tutarız. Ayrıntılar: <Link href="/cerez" style={{ color: '#1A335E', fontWeight: 600 }}>Çerez Politikası</Link>.
          </p>

          {ayrinti && (
            <div style={{ marginTop: 14, borderTop: '1px solid #F0F0F5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #F0F0F5' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1D1D1F' }}>Zorunlu</div>
                  <div style={{ fontSize: 12.5, color: '#6E6E73', lineHeight: 1.5, marginTop: 2 }}>Oturum açma, güvenlik ve bu tercihin hatırlanması. Site bunlar olmadan çalışmaz.</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8E8E93', whiteSpace: 'nowrap', paddingTop: 2 }}>Her zaman açık</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1D1D1F' }}>Ziyaret istatistikleri</div>
                  <div style={{ fontSize: 12.5, color: '#6E6E73', lineHeight: 1.5, marginTop: 2 }}>Hangi sayfaların ne kadar ziyaret edildiği ve sayfa hızı. Çerez bırakmaz, reklam için kullanılmaz.</div>
                </div>
                <input type="checkbox" checked={analitik} onChange={e => setAnalitik(e.target.checked)}
                  aria-label="Ziyaret istatistiklerine izin ver" style={{ width: 20, height: 20, marginTop: 2, accentColor: '#1A335E' }} />
              </label>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {/* Reddet ve Kabul et aynı boyut ve ağırlıkta — biri diğerinden daha kolay olmamalı */}
            <button type="button" onClick={() => kaydet(false)} style={{ ...dugme, background: '#FFFFFF', color: '#1A335E', border: '1.5px solid #1A335E' }}>Reddet</button>
            {ayrinti
              ? <button type="button" onClick={() => kaydet(analitik)} style={{ ...dugme, background: '#FFFFFF', color: '#1A335E', border: '1.5px solid #1A335E' }}>Seçimi kaydet</button>
              : <button type="button" onClick={() => setAyrinti(true)} style={{ ...dugme, background: '#FFFFFF', color: '#1A335E', border: '1.5px solid #C1CEE2' }}>Tercihler</button>}
            <button type="button" onClick={() => kaydet(true)} style={{ ...dugme, background: '#FFFFFF', color: '#1A335E', border: '1.5px solid #1A335E' }}>Kabul et</button>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer bağlantısı — tercih penceresini yeniden açar. */
export function CerezTercihBaglantisi({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <button type="button" onClick={cerezTercihleriniAc} className={className}
      style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left', ...style }}>
      Çerez tercihleri
    </button>
  );
}
