'use client';

// ─────────────────────────────────────────────────────────────────
//  Ofis için "Deneyiminizi değerlendirin" posteri — tek kaynak.
//  HekimKart (KartClient) ve panel Yorumlar sekmesi aynı sayfayı basar.
//  Sayfa 520×738 px (A5/A6 oranı); PDF'e html2canvas + jsPDF ile aktarılır.
//  QR, hastayı doğrudan kartın yorum formuna götürür (?yorum=1).
// ─────────────────────────────────────────────────────────────────
import { forwardRef, type CSSProperties } from 'react';
import { Logo } from '@/components/Logo';

export const POSTER_GEN = 520;
export const POSTER_YUK = 738;

const NAVY = '#12294D';
const ALTIN = '#C9A04A';
const FONT = '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';

export interface PosterBilgi {
  /** Hekim / işletme adı (ünvanla) */
  ad: string;
  /** Çalıştığı kurum (varsa) */
  kurum?: string | null;
  /** Tam yorum adresi — QR bunu kodlar */
  yorumUrl: string;
}

/** QR görseli (api.qrserver.com — HekimKart'taki QR'larla aynı servis). */
export function yorumQr(url: string, boyut = 560): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${boyut}x${boyut}&data=${encodeURIComponent(url)}&color=12294D&bgcolor=FFFFFF&margin=10&format=png`;
}

/** Ekranda/baskıda görünen kısa adres: "hekimhane.com.tr/kart/slug" */
export function kisaAdres(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\?.*$/, '');
}

function Yildiz({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={ALTIN} aria-hidden>
      <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
    </svg>
  );
}

const ADIMLAR = ['Telefon kameranızı açın', 'Karekodu okutun', 'Yorumunuzu yazın'];

/** Posterin kendisi (tam boyut). `gizli` → ekran dışında, yalnız PDF için. */
export const PosterSayfa = forwardRef<HTMLDivElement, PosterBilgi & { gizli?: boolean; style?: CSSProperties }>(
  function PosterSayfa({ ad, kurum, yorumUrl, gizli, style }, ref) {
    return (
      <div ref={ref} aria-hidden={gizli || undefined} style={{
        ...(gizli ? { position: 'absolute', left: -10000, top: 0, display: 'none' } : { display: 'flex' }),
        width: POSTER_GEN, height: POSTER_YUK, boxSizing: 'border-box', overflow: 'hidden',
        flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        background: '#FFFFFF', color: NAVY, fontFamily: FONT,
        ...style,
      }}>
        {/* Üst bant */}
        <div style={{
          width: '100%', boxSizing: 'border-box', padding: '28px 40px 66px',
          background: `linear-gradient(170deg, ${NAVY} 0%, #1B3A69 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#FFFFFF',
        }}>
          <Logo size={30} dark />
          <div style={{ display: 'flex', gap: 5, marginTop: 22 }}>
            {[1, 2, 3, 4, 5].map(n => <Yildiz key={n} size={24} />)}
          </div>
          <div style={{ fontSize: 35, fontWeight: 600, letterSpacing: '-0.55px', lineHeight: 1.08, marginTop: 14 }}>
            Deneyiminizi<br />değerlendirin
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.78)', lineHeight: 1.5, marginTop: 10, maxWidth: 360 }}>
            Görüşünüz, bizi araştıran diğer hastalara yol gösterir.
          </div>
        </div>

        {/* QR kartı — bandın üstüne biner */}
        <div style={{
          marginTop: -50, background: '#FFFFFF', borderRadius: 22, padding: '16px 16px 12px',
          border: '1px solid #E5E5EA', boxShadow: '0 14px 40px rgba(18,41,77,.16)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={yorumQr(yorumUrl)} alt="Yorum karekodu" crossOrigin="anonymous"
            style={{ width: 196, height: 196, display: 'block' }} />
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: ALTIN, marginTop: 9 }}>
            Karekodu okutun
          </div>
        </div>

        {/* Hekim / işletme */}
        <div style={{ marginTop: 18, padding: '0 40px', fontSize: 20, fontWeight: 600, letterSpacing: '-0.25px', lineHeight: 1.25 }}>{ad}</div>
        {kurum && <div style={{ marginTop: 3, padding: '0 40px', fontSize: 13, color: '#586273', lineHeight: 1.4 }}>{kurum}</div>}

        {/* 3 adım */}
        <div style={{ display: 'flex', gap: 10, width: '100%', boxSizing: 'border-box', padding: '0 34px', marginTop: 18 }}>
          {ADIMLAR.map((a, i) => (
            <div key={a} style={{
              flex: 1, background: '#F6F8FB', borderRadius: 14, padding: '11px 8px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 8, background: NAVY, color: '#DEC283',
                fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.3, color: NAVY }}>{a}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 10 }} />

        {/* Alt bilgi */}
        <div style={{ width: '100%', boxSizing: 'border-box', padding: '12px 40px 22px', borderTop: '1px solid #EEF0F4' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: NAVY, letterSpacing: '.1px' }}>{kisaAdres(yorumUrl)}</div>
          <div style={{ fontSize: 10, color: '#8A93A3', marginTop: 4, lineHeight: 1.45 }}>
            Yorumlar yayınlanmadan önce Hekimhane tarafından incelenir.
          </div>
        </div>
      </div>
    );
  },
);

/** Gizli poster öğesini A5 ya da A6 PDF olarak indirir. */
export async function posterPdfIndir(el: HTMLElement, fmt: 'a5' | 'a6', dosyaAdi: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const onceki = el.style.display;
  el.style.display = 'flex';
  try {
    // QR yüklenmeden çekilirse baskıda boş kare çıkar
    const img = el.querySelector('img') as HTMLImageElement | null;
    if (img && !img.complete) {
      await new Promise(res => { img.onload = res; img.onerror = res; setTimeout(res, 4000); });
    }
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#FFFFFF', logging: false });
    const { jsPDF } = await import('jspdf');
    const [pw, ph] = fmt === 'a5' ? [148, 210] : [105, 148]; // mm
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: fmt });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pw, ph);
    pdf.save(`${dosyaAdi.replace(/[\s/\\:*?"<>|.,]+/g, '-').replace(/^-|-$/g, '')}-Degerlendirme-${fmt.toUpperCase()}.pdf`);
  } finally {
    el.style.display = onceki;
  }
}
