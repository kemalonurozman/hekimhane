// Yasal metin sayfaları için ortak iskelet (sözleşmeler, çerez politikası vb.).
// Server Component — metin statik, etkileşim yok.
import Link from 'next/link';
import { YASAL_GUNCELLEME } from '@/lib/sirket';

/** string → paragraf · string[] → madde listesi · {tablo} → iki/üç sütunlu tablo */
export type YasalBlok = string | string[] | { tablo: { baslik: string[]; satirlar: string[][] } };
export interface YasalBolum { baslik: string; icerik: YasalBlok[] }

const DIGER = [
  ['KVKK Aydınlatma Metni', '/kvkk'],
  ['Gizlilik Politikası', '/gizlilik'],
  ['Çerez Politikası', '/cerez'],
  ['Kullanım Şartları', '/kullanim'],
  ['Mesafeli Satış Sözleşmesi', '/mesafeli-satis-sozlesmesi'],
  ['Ön Bilgilendirme Formu', '/on-bilgilendirme-formu'],
  ['İptal ve İade Koşulları', '/iptal-iade'],
] as const;

/** **kalın** işaretini <strong>'a çevirir (metinler sabit — kullanıcı girdisi yok). */
function zengin(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') ? <strong key={i} style={{ color: 'var(--ink)', fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p);
}

export default function YasalSayfa({ baslik, ozet, bolumler, yol, children }: {
  baslik: string; ozet: string; bolumler: YasalBolum[]; yol: string; children?: React.ReactNode;
}) {
  return (
    <div style={{ paddingTop: 66, background: 'var(--canvas)', minHeight: '100vh' }}>
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingTop: 18, paddingBottom: 26 }}>
          <nav aria-label="Sayfa yolu" style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 14 }}>
            <Link href="/" style={{ color: 'var(--ink-tertiary)', textDecoration: 'none' }}>Ana Sayfa</Link>
            <span aria-hidden="true">›</span>
            <span style={{ color: 'var(--ink-secondary)' }}>{baslik}</span>
          </nav>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: '36px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>{baslik}</h1>
          <p style={{ margin: '8px 0 0', maxWidth: 720, fontSize: 15, lineHeight: '24px', color: 'var(--ink-secondary)' }}>{ozet}</p>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--ink-tertiary)' }}>Son güncelleme: {YASAL_GUNCELLEME}</p>
        </div>
      </div>

      <div className="container yasal-izgara" style={{ paddingTop: 28, paddingBottom: 56 }}>
        <style>{`
          .yasal-izgara { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 28px; align-items: start; }
          .yasal-tablo { width: 100%; border-collapse: collapse; font-size: 13.5px; }
          .yasal-tablo th, .yasal-tablo td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--border); }
          .yasal-tablo th { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--ink-tertiary); background: var(--canvas); }
          .yasal-tablo-sar { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; margin: 4px 0 14px; }
          @media (max-width: 900px) { .yasal-izgara { grid-template-columns: minmax(0, 1fr); } }
          @media (max-width: 640px) { .yasal-tablo { font-size: 13px; min-width: 520px; } }
        `}</style>
        <div style={{ minWidth: 0 }}>
          {children}
          {bolumler.map((b, i) => (
            <section key={i} id={`b${i + 1}`} style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', marginBottom: 14 }}>
              <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--brand)' }}>{b.baslik}</h2>
              {b.icerik.map((blok, j) => {
                if (typeof blok === 'string') {
                  return <p key={j} style={{ margin: '0 0 10px', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-secondary)' }}>{zengin(blok)}</p>;
                }
                if (Array.isArray(blok)) {
                  return (
                    <ul key={j} style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-secondary)' }}>
                      {blok.map((m, k) => <li key={k} style={{ marginBottom: 4 }}>{zengin(m)}</li>)}
                    </ul>
                  );
                }
                return (
                  <div key={j} className="yasal-tablo-sar">
                    <table className="yasal-tablo">
                      <thead><tr>{blok.tablo.baslik.map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {blok.tablo.satirlar.map((r, k) => (
                          <tr key={k}>{r.map((c, m) => <td key={m} style={{ color: m === 0 ? 'var(--ink)' : 'var(--ink-secondary)', fontWeight: m === 0 ? 600 : 400 }}>{zengin(c)}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </section>
          ))}
        </div>

        <aside style={{ position: 'sticky', top: 90, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--ink-tertiary)', marginBottom: 8 }}>Yasal metinler</div>
          {DIGER.map(([ad, href]) => (
            <Link key={href} href={href} style={{
              display: 'block', padding: '7px 0', fontSize: 14, textDecoration: 'none',
              color: href === yol ? 'var(--brand)' : 'var(--ink-secondary)', fontWeight: href === yol ? 700 : 500,
            }}>{ad}</Link>
          ))}
        </aside>
      </div>
    </div>
  );
}

/** Satıcı / veri sorumlusu künyesi kutusu. */
export function KunyeKutusu({ baslik, satirlar }: { baslik: string; satirlar: { etiket: string; deger: string }[] }) {
  return (
    <div style={{ background: 'var(--tint-50)', border: '1px solid var(--tint-200)', borderRadius: 16, padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 10 }}>{baslik}</div>
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', fontSize: 14 }}>
        {satirlar.map(s => (
          <div key={s.etiket} style={{ display: 'contents' }}>
            <dt style={{ color: 'var(--ink-tertiary)' }}>{s.etiket}</dt>
            <dd style={{ margin: 0, color: 'var(--ink)', fontWeight: 600 }}>{s.deger}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
