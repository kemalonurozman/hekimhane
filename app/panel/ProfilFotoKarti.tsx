'use client';

/**
 * Profil fotoğrafı kartı — Profil Düzenle → Profil Bilgileri sekmesinin en üstü.
 * Sürükle-bırak (masaüstü) ya da dokun-seç (telefonda kamera / fotoğraf arşivi).
 * Yükleme ve kayıt üst bileşende (EditProfileTab → profilFotoYukle): fotoğraf
 * seçilince yüklenir ve profil kaydına hemen yazılır, ayrıca "Kaydet" gerekmez.
 */
import { useRef, useState } from 'react';

const C = {
  navy: '#1A335E',
  text: '#1D1D1F',
  muted: '#6E6E73',
  dim: '#AEAEB2',
  line: '#E5E5EA',
  soft: '#F5F5F7',
  green: '#1F8A4C',
  red: '#C4291C',
};

export type FotoDurum = { tur: 'yukleniyor' | 'kaydedildi' | 'hata'; metin?: string } | null;

export default function ProfilFotoKarti({ url, tip, durum, puanli, onDosya, onKaldir }: {
  url: string;
  tip: string;                       // klinik | hastane | doktor | eczane
  durum: FotoDurum;
  puanli: boolean;                   // profil puanına katkı yazılsın mı (klinik + doktor)
  onDosya: (f: File) => void;
  onKaldir: () => void;
}) {
  const [surukle, setSurukle] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const doktor = tip === 'doktor';
  const yukleniyor = durum?.tur === 'yukleniyor';
  const var_ = !!url;

  const sec = () => { if (!yukleniyor) inp.current?.click(); };
  const al = (f?: File | null) => { if (f && (f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))) onDosya(f); };

  const baslik = doktor ? 'Profil fotoğrafınız' : 'Logo veya profil fotoğrafı';
  const maddeler = doktor ? [
    'Hastalar randevu almadan önce kiminle görüşeceğini görmek ister. Yüzünüzü görmek güven verir.',
    'Fotoğraf profilinizde, arama sonuçlarında ve HekimKart’ınızda ilk görünen şeydir.',
    'Aydınlık, net, yüzünüzün ortada olduğu bir fotoğraf seçin. Önlük ya da sade bir kıyafet iyi görünür.',
  ] : [
    'Hastalar gidecekleri yeri önceden tanımak ister. Tanıdık bir logo ya da giriş fotoğrafı güven verir.',
    'Bu görsel profilinizde, arama sonuçlarında ve HekimKart’ınızda ilk görünen şeydir.',
    'Kare, net ve kenarları boş bırakılmış bir logo ya da aydınlık bir fotoğraf seçin.',
  ];

  return (
    <section
      onDragOver={e => { e.preventDefault(); if (!surukle) setSurukle(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSurukle(false); }}
      onDrop={e => { e.preventDefault(); setSurukle(false); if (!yukleniyor) al(e.dataTransfer.files?.[0]); }}
      style={{
        position: 'relative', borderRadius: 18, padding: '22px 20px',
        background: surukle ? 'rgba(26,51,94,.05)' : 'linear-gradient(180deg,#FBFBFD 0%,#FFFFFF 100%)',
        border: `1px solid ${surukle ? C.navy : C.line}`,
        boxShadow: surukle ? '0 0 0 4px rgba(26,51,94,.08)' : '0 1px 3px rgba(0,0,0,.04)',
        transition: 'background .2s, border-color .2s, box-shadow .2s',
      }}>
      <input ref={inp} type="file" accept="image/*,.heic,.heif" hidden
        onChange={e => { al(e.target.files?.[0]); e.target.value = ''; }} />

      <div className="pf-ust" style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
        {/* Görsel / bırakma alanı */}
        <button type="button" onClick={sec} aria-label={var_ ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}
          className="pf-gorsel"
          style={{
            position: 'relative', flexShrink: 0, width: 132, height: 132, padding: 0,
            borderRadius: doktor ? '50%' : 30, cursor: yukleniyor ? 'wait' : 'pointer',
            border: var_ ? 'none' : `1.5px dashed ${surukle ? C.navy : '#C7C7CC'}`,
            background: var_ ? C.soft : (surukle ? 'rgba(26,51,94,.06)' : C.soft),
            boxShadow: var_ ? '0 8px 24px rgba(16,24,40,.12), 0 0 0 4px #fff, 0 0 0 5px #E5E5EA' : 'none',
            overflow: 'visible', fontFamily: 'inherit', transition: 'transform .2s',
          }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {var_ ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: doktor ? 'cover' : 'contain', background: '#fff', opacity: yukleniyor ? .35 : 1, transition: 'opacity .2s' }} />
            ) : !yukleniyor && (
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: surukle ? C.navy : C.muted }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  {doktor
                    ? <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>
                    : <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></>}
                </svg>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{surukle ? 'Bırakın' : 'Fotoğraf ekle'}</span>
              </span>
            )}
            {yukleniyor && (
              <svg width="30" height="30" viewBox="0 0 18 18" fill="none" style={{ position: 'absolute', animation: 'spin .9s linear infinite' }}>
                <circle cx="9" cy="9" r="7" stroke="rgba(26,51,94,.15)" strokeWidth="2" />
                <path d="M9 2a7 7 0 0 1 7 7" stroke={C.navy} strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>
          {/* Kamera rozeti (iOS profil düzenleme gibi) */}
          {!yukleniyor && (
            <span style={{
              position: 'absolute', right: doktor ? 4 : -6, bottom: doktor ? 4 : -6, width: 38, height: 38, borderRadius: '50%',
              background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 3px #fff, 0 4px 10px rgba(26,51,94,.3)',
            }}>
              {var_ ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              )}
            </span>
          )}
        </button>

        {/* Metin */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: C.navy }}>En önemli adım</span>
            {puanli && !var_ && (
              <span style={{ fontSize: 11, fontWeight: 600, color: C.green, background: 'rgba(31,138,76,.1)', padding: '2px 8px', borderRadius: 20 }}>+10 profil puanı</span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-0.25px', color: C.text, lineHeight: 1.2 }}>
            İyi bir profil, iyi bir fotoğrafla başlar.
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: C.muted, lineHeight: 1.5 }}>
            {baslik} profilinizin vitrinidir.{' '}
            <span className="pf-masaustu">Fotoğrafı bu alana sürükleyip bırakın ya da seçin.</span>
            <span className="pf-telefon">Dokunun; fotoğraf çekin ya da arşivinizden seçin.</span>
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={sec} disabled={yukleniyor}
              style={{
                padding: '10px 18px', minHeight: 42, borderRadius: 999, border: 'none',
                background: C.navy, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                cursor: yukleniyor ? 'wait' : 'pointer', opacity: yukleniyor ? .6 : 1,
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              {yukleniyor ? 'Yükleniyor…' : var_ ? 'Fotoğrafı değiştir' : 'Fotoğraf seç'}
            </button>
            {var_ && !yukleniyor && (
              <button type="button" onClick={onKaldir}
                style={{ padding: '10px 14px', minHeight: 42, borderRadius: 999, border: 'none', background: 'transparent', color: C.red, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
                Kaldır
              </button>
            )}
            {durum?.tur === 'kaydedildi' && (
              <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.green, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {durum.metin || 'Kaydedildi'}
              </span>
            )}
            {durum?.tur === 'hata' && (
              <span role="alert" style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>{durum.metin || 'Yüklenemedi, tekrar deneyin.'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Neden önemli */}
      <ul style={{ listStyle: 'none', margin: '20px 0 0', padding: '16px 0 0', borderTop: `1px solid ${C.line}`, display: 'grid', gap: 10 }}>
        {maddeler.map((m, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
            <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 7, background: 'rgba(26,51,94,.07)', color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
              {i === 0 ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
              ) : i === 1 ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              )}
            </span>
            <span>{m}</span>
          </li>
        ))}
      </ul>
      <p style={{ margin: '12px 0 0', fontSize: 12, color: C.dim, lineHeight: 1.5 }}>
        JPEG, PNG, HEIC ya da WebP · en fazla 15 MB · seçtiğiniz anda profilinize kaydedilir.
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        .pf-telefon{display:none}
        .pf-gorsel:hover{transform:scale(1.02)}
        .pf-gorsel:active{transform:scale(.98)}
        @media (hover:none),(max-width:640px){.pf-telefon{display:inline}.pf-masaustu{display:none}}
        @media (max-width:560px){.pf-ust{flex-direction:column;text-align:center}.pf-ust>div:last-child>div{justify-content:center}}
      ` }} />
    </section>
  );
}
