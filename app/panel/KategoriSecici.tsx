'use client';

// ─────────────────────────────────────────────────────────────────
//  Makale kategori seçici — yazdıkça gelen liste (Apple popover dili).
//  Seçenekler sunucudan gelir (lib/makale-kategori-sunucu.ts): blog,
//  hastalık rehberi kategorileri ve hekim branşları. Yalnız listeden
//  seçilebilir; seçilmezse yazı kategorisiz yayınlanır.
// ─────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from 'react';

export interface KategoriSecenek { ad: string; grup: 'Blog' | 'Hastalıklar' | 'Branşlar' }

const GRUPLAR: KategoriSecenek['grup'][] = ['Blog', 'Hastalıklar', 'Branşlar'];
const GRUP_ETIKET: Record<KategoriSecenek['grup'], string> = { Blog: 'Genel', Hastalıklar: 'Hastalıklar', Branşlar: 'Hekim branşları' };

/** Türkçe harf duyarsız karşılaştırma anahtarı */
const norm = (s: string) => s.toLocaleLowerCase('tr-TR')
  .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const CSS = `
.ks{position:relative;max-width:440px}
.ks-alan{display:flex;align-items:center;gap:9px;min-height:46px;padding:0 12px;border-radius:12px;border:1.5px solid #E2E8F4;background:#fff;cursor:text;transition:border-color .15s,box-shadow .15s}
.ks-alan:focus-within{border-color:#1A335E;box-shadow:0 0 0 3px rgba(26,51,94,.10)}
.ks-alan input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:inherit;font-size:14.5px;color:#111C2E;padding:11px 0}
.ks-alan input::placeholder{color:#9AA7BF}
.ks-cip{display:inline-flex;align-items:center;gap:7px;padding:6px 8px 6px 12px;border-radius:999px;background:rgba(26,51,94,.08);color:#1A335E;font-size:13.5px;font-weight:600}
.ks-cip button{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;border:none;background:rgba(26,51,94,.12);color:#1A335E;cursor:pointer;padding:0}
.ks-cip button:hover{background:rgba(26,51,94,.2)}
.ks-pop{position:absolute;z-index:40;top:calc(100% + 8px);left:0;right:0;max-height:320px;overflow-y:auto;padding:6px;border-radius:14px;background:rgba(255,255,255,.97);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:0.5px solid rgba(0,0,0,.10);box-shadow:0 12px 40px rgba(17,28,46,.16),0 2px 8px rgba(17,28,46,.06)}
.ks-grup{font-size:11px;font-weight:500;letter-spacing:.6px;text-transform:uppercase;color:#8A93A3;padding:10px 10px 4px}
.ks-satir{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:none;background:transparent;font:inherit;font-size:15px;font-weight:400;color:#111C2E;padding:9px 10px;border-radius:9px;cursor:pointer}
.ks-satir+.ks-satir{box-shadow:inset 0 0.5px 0 rgba(0,0,0,.06)}
.ks-satir.aktif{background:rgba(26,51,94,.07)}
.ks-satir b{font-weight:600}
.ks-satir .ks-tik{margin-left:auto;color:#1A335E}
.ks-bos{padding:14px 12px;font-size:13.5px;color:#6E6E73;line-height:1.55}
.ks-not{font-size:11.5px;color:#4A5568;margin-top:6px;line-height:1.55}
`;

function Vurgu({ ad, q }: { ad: string; q: string }) {
  if (!q) return <>{ad}</>;
  const i = norm(ad).indexOf(norm(q));
  if (i < 0) return <>{ad}</>;
  return <>{ad.slice(0, i)}<b>{ad.slice(i, i + q.length)}</b>{ad.slice(i + q.length)}</>;
}

export default function KategoriSecici({ secenekler, value, onChange }: {
  secenekler: KategoriSecenek[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [q, setQ] = useState('');
  const [acik, setAcik] = useState(false);
  const [imlec, setImlec] = useState(0);
  const kutu = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Dışarı tıklayınca kapan
  useEffect(() => {
    if (!acik) return;
    const kapat = (e: MouseEvent) => { if (kutu.current && !kutu.current.contains(e.target as Node)) setAcik(false); };
    document.addEventListener('mousedown', kapat);
    return () => document.removeEventListener('mousedown', kapat);
  }, [acik]);

  // Eşleşenler: baştan eşleşen > içeren; boşken yalnız genel kategoriler + öneri
  const sonuc = useMemo(() => {
    const n = norm(q.trim());
    return GRUPLAR.map(g => {
      const grup = secenekler.filter(s => s.grup === g);
      if (!n) return { grup: g, liste: g === 'Blog' ? grup : grup.slice(0, 4) };
      const basla = grup.filter(s => norm(s.ad).startsWith(n) || norm(s.ad).includes(' ' + n));
      const icer = grup.filter(s => !basla.includes(s) && norm(s.ad).includes(n));
      return { grup: g, liste: [...basla, ...icer].slice(0, 8) };
    }).filter(x => x.liste.length);
  }, [q, secenekler]);
  const duz = sonuc.flatMap(x => x.liste);

  function sec(ad: string) {
    onChange(ad); setQ(''); setAcik(false);
  }

  function tus(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAcik(true); setImlec(i => Math.min(i + 1, duz.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setImlec(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { if (acik && duz[imlec]) { e.preventDefault(); sec(duz[imlec].ad); } }
    else if (e.key === 'Escape') setAcik(false);
    else if (e.key === 'Backspace' && !q && value) onChange('');
  }

  let sira = -1;
  return (
    <div className="ks" ref={kutu}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ks-alan" onClick={() => { input.current?.focus(); setAcik(true); }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8A93A3" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        {value && (
          <span className="ks-cip">
            {value}
            <button type="button" aria-label="Kategoriyi kaldır" onClick={e => { e.stopPropagation(); onChange(''); input.current?.focus(); }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </span>
        )}
        <input ref={input} value={q}
          role="combobox" aria-expanded={acik} aria-controls="ks-liste" aria-autocomplete="list"
          placeholder={value ? '' : 'Yazmaya başlayın — ör. Kardiyoloji, Ortodonti'}
          onFocus={() => setAcik(true)}
          onChange={e => { setQ(e.target.value); setImlec(0); setAcik(true); }}
          onKeyDown={tus} />
      </div>

      {acik && (
        <div className="ks-pop" id="ks-liste" role="listbox">
          {duz.length === 0 ? (
            <div className="ks-bos">“{q.trim()}” için kategori yok. Seçmeden gönderirseniz yazı <strong>kategorisiz</strong> yayınlanır.</div>
          ) : sonuc.map(g => (
            <div key={g.grup}>
              <div className="ks-grup">{GRUP_ETIKET[g.grup]}</div>
              {g.liste.map(s => {
                sira++;
                const i = sira;
                return (
                  <button key={s.ad} type="button" role="option" aria-selected={value === s.ad}
                    className={`ks-satir${i === imlec ? ' aktif' : ''}`}
                    onMouseEnter={() => setImlec(i)}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => sec(s.ad)}>
                    <span><Vurgu ad={s.ad} q={q.trim()} /></span>
                    {value === s.ad && (
                      <svg className="ks-tik" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {!q.trim() && <div className="ks-bos" style={{ paddingTop: 8 }}>Hastalık ya da branş adı yazın; liste yazdıkça daralır.</div>}
        </div>
      )}
      <div className="ks-not">{value ? 'Yazı bu kategoride yayınlanır.' : 'İsteğe bağlı. Uygun kategori yoksa boş bırakın — yazı kategorisiz yayınlanır.'}</div>
    </div>
  );
}
