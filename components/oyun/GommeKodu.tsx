'use client';

// "Sitenize ekleyin" — oyunun iframe kodunu üretir ve kopyalatır.
// Logo ve bağlantı iframe'in içindedir (gömen site kaldıramaz); alttaki
// metin bağlantısı isteğe bağlıdır ve arama motorları için kaynak gösterir.

import { useState } from 'react';

const SITE = 'https://www.hekimhane.com.tr';

interface Props {
  slug: string;
  ad: string;
  aciklama: string;
}

const BOYUTLAR = [
  { ad: 'Standart', yukseklik: 680, genislik: 600 },
  { ad: 'Kompakt', yukseklik: 560, genislik: 460 },
];

export default function GommeKodu({ slug, ad, aciklama }: Props) {
  const [boyut, setBoyut] = useState(0);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [onizleme, setOnizleme] = useState(false);
  const b = BOYUTLAR[boyut];
  const src = `${SITE}/embed/oyun/${slug}`;

  const kod = [
    `<!-- ${ad} · Hekimhane -->`,
    `<iframe src="${src}" title="${ad} — ${aciklama}" width="100%" height="${b.yukseklik}" loading="lazy" style="display:block;width:100%;max-width:${b.genislik}px;height:${b.yukseklik}px;margin:0 auto;border:1px solid #E5E5EA;border-radius:16px"></iframe>`,
    `<p style="text-align:center;font-size:13px;margin:8px 0 0">Oyun: <a href="${SITE}/cocuk-dis-sagligi/oyunlar/${slug}">${ad} — Hekimhane</a></p>`,
  ].join('\n');

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(kod);
    } catch {
      const t = document.createElement('textarea');
      t.value = kod;
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); } catch { /* yoksay */ }
      t.remove();
    }
    setKopyalandi(true);
    window.setTimeout(() => setKopyalandi(false), 2200);
  }

  return (
    <div>
      <div className="gk-ust">
        <div className="gk-boyut" role="group" aria-label="Boyut">
          {BOYUTLAR.map((x, i) => (
            <button key={x.ad} type="button" aria-pressed={boyut === i} onClick={() => setBoyut(i)}>
              {x.ad} · {x.genislik}×{x.yukseklik}
            </button>
          ))}
        </div>
        <button type="button" className="gk-kopyala" onClick={kopyala}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {kopyalandi
              ? <path d="M5 12.5l4.5 4.5L19 7.5" />
              : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>}
          </svg>
          {kopyalandi ? 'Kopyalandı' : 'Kodu kopyala'}
        </button>
      </div>
      <pre className="gk-kod" aria-label="Gömme kodu">{kod}</pre>
      <span aria-live="polite" className="fo-gizli">{kopyalandi ? 'Kod panoya kopyalandı' : ''}</span>

      {onizleme ? (
        <div className="gk-onizleme">
          <p className="gk-onizleme__etiket">Sitenizde böyle görünür</p>
          <iframe
            src={`/embed/oyun/${slug}`}
            title={`${ad} — önizleme`}
            style={{ display: 'block', width: '100%', maxWidth: b.genislik, height: b.yukseklik, margin: '0 auto', border: '1px solid #E5E5EA', borderRadius: 16, background: '#fff' }}
          />
        </div>
      ) : (
        <button type="button" className="fo-dugme" style={{ marginTop: 12 }} onClick={() => setOnizleme(true)}>
          Sitenizde nasıl görüneceğine bakın
        </button>
      )}
    </div>
  );
}
