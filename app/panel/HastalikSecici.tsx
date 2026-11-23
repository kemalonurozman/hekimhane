'use client';

/**
 * "Baktığınız hastalıklar" seçici (doktor paneli, Detaylar sekmesi).
 * Sıra: Uzmanlık (branş) → Uzmanlık Alanları → bu seçici. Öneriler hekimin branşına göre gelir;
 * arama kutusu tüm listede çalışır, listede olmayan konu serbest yazılabilir.
 * Seçimler doktorlar.conditions (text[]) kolonuna kısa ad olarak yazılır.
 */
import { useMemo, useState } from 'react';
import {
  HASTALIK_SECENEKLERI, bransaUygunHastaliklar, hastalikAnahtari, hastalikAra, hastalikKategorileri,
} from '@/lib/hastalik-secenekleri';

const T = { navy: '#1A335E', border: '#E2E8F4', muted: '#4A5568', text: '#111C2E', bg: '#F0F4FF', gold: '#B8892F' };
const EN_FAZLA = 30;
const ONERI_ILK = 18;

export default function HastalikSecici({
  value, onChange, spec,
}: {
  value: string[] | string | null | undefined;
  onChange: (v: string[]) => void;
  spec?: string | null;
}) {
  const [q, setQ] = useState('');
  const [tumunu, setTumunu] = useState(false);        // tüm kategoriler açık gezinme
  const [oneriTum, setOneriTum] = useState(false);    // branş önerilerinin tamamı
  const [acikKat, setAcikKat] = useState<string | null>(null);
  const [not, setNot] = useState('');

  const secili: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === 'string' && value.trim() ? value.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : [];
  const seciliAnahtar = new Set(secili.map(hastalikAnahtari));
  const dolu = secili.length >= EN_FAZLA;

  const oneriler = useMemo(() => bransaUygunHastaliklar(spec), [spec]);
  const sonuc = useMemo(() => hastalikAra(q), [q]);
  const kategoriler = useMemo(() => (tumunu ? hastalikKategorileri() : []), [tumunu]);

  function ekleCikar(ad: string) {
    const k = hastalikAnahtari(ad);
    if (seciliAnahtar.has(k)) { onChange(secili.filter(s => hastalikAnahtari(s) !== k)); setNot(''); return; }
    if (dolu) { setNot(`En fazla ${EN_FAZLA} konu seçebilirsiniz.`); return; }
    onChange([...secili, ad]); setNot('');
  }

  function serbestEkle() {
    const t = q.replace(/\s+/g, ' ').trim();
    if (!t) return;
    const tam = HASTALIK_SECENEKLERI.find(o => hastalikAnahtari(o.ad) === hastalikAnahtari(t));
    if (!seciliAnahtar.has(hastalikAnahtari(tam?.ad || t))) ekleCikar(tam?.ad || t);
    setNot(tam ? '' : `“${t}” hazır listede yok — profilinizde etiket olarak görünür.`);
    setQ('');
  }

  const chip = (ad: string, isSel: boolean, onClick: () => void, key?: string) => (
    <button key={key || ad} type="button" onClick={onClick} aria-pressed={isSel}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
        border: `1.5px solid ${isSel ? T.navy : 'rgba(0,0,0,.16)'}`, background: isSel ? T.navy : 'white', color: isSel ? 'white' : '#3A3A3C',
      }}>
      {isSel && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {ad}
    </button>
  );

  const goster = oneriTum ? oneriler : oneriler.slice(0, ONERI_ILK);
  const tamEsles = q.trim() && HASTALIK_SECENEKLERI.some(o => hastalikAnahtari(o.ad) === hastalikAnahtari(q));

  return (
    <div>
      <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55, margin: '0 0 10px' }}>
        Baktığınız hastalık ve şikâyetleri işaretleyin; hastalar profilinizde görür, ilgili sağlık yazılarına bağlanır. En fazla {EN_FAZLA} konu.
      </p>

      {secili.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, padding: '10px 12px', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '.5px', width: '100%', marginBottom: 4 }}>Seçili ({secili.length}/{EN_FAZLA})</span>
          {secili.map(ad => (
            <span key={ad} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(26,51,94,.1)', color: T.navy, border: '1px solid rgba(26,51,94,.2)' }}>
              {ad.replace(/-/g, ' ')}
              <button type="button" title="Kaldır" onClick={() => ekleCikar(ad)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* Arama / serbest yazım */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={q} onChange={e => { setQ(e.target.value); setNot(''); }}
          onKeyDown={e => { if (e.key !== 'Enter') return; e.preventDefault(); if (sonuc[0] && !tamEsles) { ekleCikar(sonuc[0].ad); setQ(''); } else serbestEkle(); }}
          placeholder="Hastalık ara ya da yazın (ör. migren, bel fıtığı, panik atak)"
          style={{ flex: 1, padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13.5, fontFamily: 'inherit', color: T.text, outline: 'none', background: 'white', boxSizing: 'border-box', minWidth: 0 }} />
        {q.trim() && !tamEsles && (
          <button type="button" onClick={serbestEkle}
            style={{ flexShrink: 0, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${T.navy}`, background: 'white', color: T.navy, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>
            “{q.trim().length > 18 ? q.trim().slice(0, 18) + '…' : q.trim()}” ekle
          </button>
        )}
      </div>
      {not && <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 10px', marginBottom: 10 }}>{not}</div>}

      {q.trim() ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 6 }}>
          {sonuc.length === 0
            ? <span style={{ fontSize: 12.5, color: T.muted }}>Listede eşleşme yok. Yukarıdaki düğmeyle “{q.trim()}” konusunu kendiniz ekleyebilirsiniz.</span>
            : sonuc.map(o => chip(o.ad, seciliAnahtar.has(hastalikAnahtari(o.ad)), () => ekleCikar(o.ad)))}
        </div>
      ) : (
        <>
          {oneriler.length > 0 ? (
            <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '12px 14px', background: '#FAFBFF', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.gold, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 9 }}>
                Uzmanlığınıza göre öneriler{spec ? ` · ${spec}` : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {goster.map(o => chip(o.ad, seciliAnahtar.has(hastalikAnahtari(o.ad)), () => ekleCikar(o.ad)))}
              </div>
              {oneriler.length > ONERI_ILK && (
                <button type="button" onClick={() => setOneriTum(v => !v)}
                  style={{ marginTop: 10, background: 'none', border: 'none', color: T.navy, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  {oneriTum ? 'Daha az göster' : `Tümünü göster (${oneriler.length})`}
                </button>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: T.muted, margin: '0 0 8px' }}>
              {spec ? `“${spec}” için hazır öneri bulunamadı — arama kutusunu kullanın ya da aşağıdan tüm konulara göz atın.` : 'Önce “Uzmanlık” alanını doldurursanız size uygun konular önerilir.'}
            </p>
          )}

          <button type="button" onClick={() => setTumunu(v => !v)}
            style={{ background: 'none', border: 'none', color: T.navy, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', padding: '2px 0' }}>
            {tumunu ? '▾ Tüm konuları gizle' : `▸ Tüm hastalıklara göz at (${HASTALIK_SECENEKLERI.length})`}
          </button>

          {tumunu && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {kategoriler.map(g => {
                const acik = acikKat === g.kategori;
                const n = g.ogeler.filter(o => seciliAnahtar.has(hastalikAnahtari(o.ad))).length;
                return (
                  <div key={g.kategori} style={{ border: `1.5px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    <button type="button" onClick={() => setAcikKat(acik ? null : g.kategori)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: acik ? T.bg : 'white', fontSize: 13, fontWeight: 600, color: T.text }}>
                      <span>{g.kategori} <span style={{ color: T.muted, fontWeight: 500 }}>({g.ogeler.length})</span></span>
                      {n > 0 && <span style={{ background: T.navy, color: 'white', borderRadius: 9, fontSize: 10, fontWeight: 600, padding: '1px 7px' }}>{n}</span>}
                    </button>
                    {acik && (
                      <div style={{ padding: '10px 13px', display: 'flex', flexWrap: 'wrap', gap: 7, background: T.bg }}>
                        {g.ogeler.map(o => chip(o.ad, seciliAnahtar.has(hastalikAnahtari(o.ad)), () => ekleCikar(o.ad)))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
