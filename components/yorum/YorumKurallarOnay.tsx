'use client';

// Yorum formlarının ortak parçaları — profil formu, HekimKart formu ve onaylı hasta
// formu (/degerlendir) aynı bileşenleri kullanır. Metin ve sınırlar lib/yorum-kurallari.ts'te.
import Link from 'next/link';
import { GELISTIRME_NOKTALARI, YORUM_KURALLARI_YOL, YORUM_MIN_KARAKTER, YORUM_MAX_KARAKTER } from '@/lib/yorum-kurallari';
import { AYDINLATMA_YOL } from '@/lib/uyum';

const LACIVERT = '#1B3A69';

/** "Sizce hangi noktalar geliştirilebilir?" — isteğe bağlı, çoklu seçim; profilde yayınlanmaz. */
export function GelistirmeSecici({ secili, onChange }: { secili: string[]; onChange: (v: string[]) => void }) {
  const degistir = (v: string) => onChange(secili.includes(v) ? secili.filter(x => x !== v) : [...secili, v]);
  return (
    <fieldset style={{ border: '1px solid #E5E5EA', borderRadius: 14, padding: '14px 16px', margin: '0 0 14px', background: '#FAFAFB' }}>
      <legend style={{ padding: '0 6px', fontSize: 13, fontWeight: 700, color: '#1D1D1F' }}>
        Sizce hangi noktalar geliştirilebilir? <span style={{ fontWeight: 400, color: '#6E6E73' }}>(isteğe bağlı)</span>
      </legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {GELISTIRME_NOKTALARI.map(g => {
          const on = secili.includes(g.v);
          return (
            <button key={g.v} type="button" aria-pressed={on} onClick={() => degistir(g.v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                border: `1px solid ${on ? LACIVERT : '#D9DCE3'}`, background: on ? 'rgba(27,58,105,.08)' : '#FFFFFF', color: on ? LACIVERT : '#3A3A3C' }}>
              {on && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>}
              {g.ad}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: '#6E6E73', marginTop: 8, lineHeight: 1.5 }}>
        Seçimleriniz profilde yayınlanmaz; yalnızca hekime/işletmeye geri bildirim olarak iletilir.
      </div>
    </fieldset>
  );
}

/** Metin alanının altındaki karakter sayacı. */
export function KarakterSayaci({ uzunluk }: { uzunluk: number }) {
  const eksik = uzunluk < YORUM_MIN_KARAKTER;
  return (
    <div style={{ fontSize: 12, textAlign: 'right', marginTop: 4, color: eksik ? '#C0392B' : '#1E8E5A' }} aria-live="polite">
      {uzunluk}/{YORUM_MIN_KARAKTER} karakter (en az){uzunluk > YORUM_MAX_KARAKTER - 200 ? ` · en çok ${YORUM_MAX_KARAKTER}` : ''}
    </div>
  );
}

/**
 * Aydınlatma bilgisi (onay değil, bilgilendirme) + Yorum Yayınlama Kuralları onay kutusu.
 * Kutu önceden işaretli gelmez; işaretlenmeden gönderilemez (sunucu da kontrol eder).
 */
export function KurallarOnayKutusu({ onay, onChange, hata }: { onay: boolean; onChange: (v: boolean) => void; hata?: boolean }) {
  const bag = { color: LACIVERT, fontWeight: 600, textDecoration: 'underline' } as const;
  return (
    <div style={{ margin: '0 0 14px' }}>
      <div style={{ background: '#F2F6FC', border: '1px solid #DCE6F4', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: '#3A3A3C', lineHeight: 1.55, marginBottom: 10 }}>
        Kişisel verileriniz <Link href={AYDINLATMA_YOL.hasta} target="_blank" style={bag}>Hasta ve Ziyaretçi Aydınlatma Metni</Link> kapsamında işlenir.
        Lütfen yorumunuza kendinize veya başkasına ait ayrıntılı sağlık bilgisi, telefon ya da adres yazmayın.
      </div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, lineHeight: 1.5, color: hata ? '#C0392B' : '#1D1D1F' }}>
        <input type="checkbox" checked={onay} onChange={e => onChange(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: LACIVERT, outline: hata ? '2px solid #C0392B' : undefined }} />
        <span>
          <span style={{ color: '#C0392B' }}>* </span>
          <Link href={YORUM_KURALLARI_YOL} target="_blank" style={bag}>Yorum Yayınlama Kuralları</Link>&apos;nı okudum ve kabul ediyorum.
          Yorumum yönetici onayından sonra yayınlanır; kurallara aykırıysa yayınlanmayabilir veya kaldırılabilir.
        </span>
      </label>
    </div>
  );
}
