'use client';

// ─────────────────────────────────────────────────────────────────
//  Panel → Yorumlar: yorum toplama kartı.
//  A) Ofis için değerlendirme posteri (A5/A6 PDF, canlı önizleme)
//  B) Hastalarınıza e-posta ile yorum daveti (/api/panel/yorum-daveti)
//  Poster tek kaynak: components/yorum/DegerlendirmePosteri (HekimKart da kullanır).
// ─────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from 'react';
import { PosterSayfa, posterPdfIndir, POSTER_GEN, POSTER_YUK } from '@/components/yorum/DegerlendirmePosteri';
import {
  davetAdresleri, davetKonusu, varsayilanDavetNotu,
  DAVET_TEK_SEFER_MAX, DAVET_NOT_MAX, DAVET_TEKRAR_GUN,
} from '@/lib/yorum-daveti';

const C = {
  navy: '#1A335E', gold: '#B8892F', white: '#FFFFFF', border: '#E2E8F4',
  muted: '#4A5568', text: '#111C2E', soft: '#F6F8FB', green: '#047857', red: '#B42318',
};

interface Bilgi {
  ad: string; kurum: string | null; yorumUrl: string;
  davetler: { email: string; tarih: string; durum: string }[];
  bugun: number; gunlukMax: number;
}

function Ikon({ d, size = 16, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: 'none' }}>
      <path d={d} />
    </svg>
  );
}
const IK = {
  baski: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',
  indir: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  posta: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  tik: 'M20 6 9 17l-5-5',
  gonder: 'M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7z',
};

/** Posterin küçültülmüş canlı önizlemesi. */
function Onizleme({ olcek, ad, kurum, yorumUrl }: { olcek: number; ad: string; kurum: string | null; yorumUrl: string }) {
  return (
    <div style={{
      width: POSTER_GEN * olcek, height: POSTER_YUK * olcek, overflow: 'hidden', borderRadius: 8,
      boxShadow: '0 1px 2px rgba(17,28,46,.08), 0 8px 24px rgba(17,28,46,.12)', background: '#fff', flex: 'none',
    }}>
      <div style={{ transform: `scale(${olcek})`, transformOrigin: 'top left', width: POSTER_GEN, height: POSTER_YUK, pointerEvents: 'none' }}>
        <PosterSayfa ad={ad} kurum={kurum} yorumUrl={yorumUrl} />
      </div>
    </div>
  );
}

const etiket: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: C.muted };
const alan: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`,
  fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit', color: C.text, background: C.white, outline: 'none', resize: 'vertical',
};

export default function YorumToplaKarti({ entityId, entityType }: { entityId: string; entityType: string }) {
  const [bilgi, setBilgi] = useState<Bilgi | null>(null);
  const [hata, setHata] = useState('');
  const [indiriliyor, setIndiriliyor] = useState<'a5' | 'a6' | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  const [adresler, setAdresler] = useState('');
  const [not, setNot] = useState('');
  const [onay, setOnay] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sonuc, setSonuc] = useState<{ tur: 'ok' | 'hata'; metin: string } | null>(null);
  const [gecmisAcik, setGecmisAcik] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  async function yukle() {
    try {
      const r = await fetch(`/api/panel/yorum-daveti?entity_id=${encodeURIComponent(entityId)}&entity_type=${encodeURIComponent(entityType)}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setHata(j.error || 'Bilgiler alınamadı'); return; }
      setBilgi(j as Bilgi);
      setNot(n => n || varsayilanDavetNotu((j as Bilgi).ad));
    } catch {
      setHata('Bağlantı hatası');
    }
  }
  useEffect(() => { yukle(); }, [entityId, entityType]);  // eslint-disable-line react-hooks/exhaustive-deps

  const { gecerli, gecersiz } = useMemo(() => davetAdresleri(adresler), [adresler]);
  const kalan = bilgi ? Math.max(0, bilgi.gunlukMax - bilgi.bugun) : 0;
  const fazla = gecerli.length > Math.min(DAVET_TEK_SEFER_MAX, kalan);
  const gonderilebilir = !!bilgi && gecerli.length > 0 && !gecersiz.length && !fazla && onay && !gonderiliyor;

  async function indir(fmt: 'a5' | 'a6') {
    if (!bilgi || !posterRef.current || indiriliyor) return;
    setIndiriliyor(fmt);
    try { await posterPdfIndir(posterRef.current, fmt, bilgi.ad); }
    catch (e) { console.error('Poster PDF hatası:', e); }
    finally { setIndiriliyor(null); }
  }

  async function kopyala() {
    if (!bilgi) return;
    try { await navigator.clipboard.writeText(bilgi.yorumUrl); setKopyalandi(true); setTimeout(() => setKopyalandi(false), 2000); } catch { /* noop */ }
  }

  async function gonder() {
    if (!gonderilebilir) return;
    setGonderiliyor(true); setSonuc(null);
    try {
      const r = await fetch('/api/panel/yorum-daveti', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, entity_type: entityType, adresler: gecerli, not, onay }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setSonuc({ tur: 'hata', metin: j.error || `Gönderilemedi (${r.status})` });
      } else {
        const parca = [`${j.gonderilen?.length || 0} hastaya davet gönderildi.`];
        if (j.atlanan?.length) parca.push(`${j.atlanan.length} adres son ${DAVET_TEKRAR_GUN} günde zaten davet aldığı için atlandı.`);
        if (j.basarisiz?.length) parca.push(`${j.basarisiz.length} adrese gönderilemedi: ${j.basarisiz.join(', ')}`);
        setSonuc({ tur: 'ok', metin: parca.join(' ') });
        setAdresler(''); setOnay(false);
        yukle();
      }
    } catch {
      setSonuc({ tur: 'hata', metin: 'Bağlantı hatası. Tekrar deneyin.' });
    } finally {
      setGonderiliyor(false);
    }
  }

  const kart: React.CSSProperties = { background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.05)', padding: 20, minWidth: 0 };
  const dugme = (birincil: boolean, pasif = false): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', minHeight: 40,
    borderRadius: 11, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: pasif ? 'not-allowed' : 'pointer',
    border: birincil ? 'none' : `1px solid ${C.border}`,
    background: birincil ? (pasif ? '#9CA3AF' : C.navy) : C.white, color: birincil ? '#fff' : C.navy,
  });

  if (hata) return (
    <div style={{ ...kart, marginBottom: 18, fontSize: 13, color: C.muted }}>Yorum toplama araçları yüklenemedi: {hata}</div>
  );
  if (!bilgi) return (
    <div style={{ ...kart, marginBottom: 18, fontSize: 13, color: C.muted }}>Yorum toplama araçları yükleniyor…</div>
  );

  return (
    <div className="ytk" style={{ marginBottom: 22 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: '-0.3px' }}>Daha fazla yorum toplayın</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>
          Muayenehanenize poster koyun ya da hastalarınıza e-postayla davet gönderin. İkisi de hastayı doğrudan yorum ekranına götürür.
        </div>
      </div>

      <div className="ytk-izgara">
        {/* ── A) Poster ── */}
        <section style={kart}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#EEF2F9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ikon d={IK.baski} color={C.navy} />
            </span>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Ofis için değerlendirme posteri</div>
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, margin: '0 0 16px' }}>
            Bekleme salonu, resepsiyon ya da masaüstü için yazdırın. Karekodu okutan hasta yorum ekranına gider.
          </p>

          <div className="ytk-posterler">
            {([['a5', 0.34, 'A5', '148 × 210 mm · duvar, resepsiyon'], ['a6', 0.25, 'A6', '105 × 148 mm · masaüstü, dosya']] as const).map(([fmt, olcek, ad, aciklama]) => (
              <div key={fmt} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div className="ytk-poster-kutu" style={{ height: POSTER_YUK * 0.34, display: 'flex', alignItems: 'flex-end' }}>
                  <Onizleme olcek={olcek} ad={bilgi.ad} kurum={bilgi.kurum} yorumUrl={bilgi.yorumUrl} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ad}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{aciklama}</div>
                </div>
                <button type="button" onClick={() => indir(fmt)} disabled={indiriliyor !== null}
                  style={{ ...dugme(true, indiriliyor !== null), width: '100%' }}>
                  <Ikon d={IK.indir} color="#fff" />
                  {indiriliyor === fmt ? 'Hazırlanıyor…' : `${ad} indir (PDF)`}
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 12px', background: C.soft, borderRadius: 12, minWidth: 0 }}>
            <Ikon d={IK.link} color={C.muted} size={14} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bilgi.yorumUrl}</span>
            <button type="button" onClick={kopyala} style={{ ...dugme(false), minHeight: 32, padding: '6px 12px', fontSize: 12 }}>
              {kopyalandi ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
            </button>
          </div>
        </section>

        {/* ── B) E-posta daveti ── */}
        <section style={kart}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#EEF2F9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ikon d={IK.posta} color={C.navy} />
            </span>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Hastalarınıza e-posta gönderin</div>
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, margin: '0 0 16px' }}>
            E-posta Hekimhane&apos;den, gönderen adı <strong style={{ color: C.text }}>{bilgi.ad}</strong> olarak gider. Hasta yanıtlarsa size ulaşır.
          </p>

          <label style={{ display: 'block' }}>
            <span style={etiket}>E-posta adresleri</span>
            <textarea rows={3} value={adresler} onChange={e => { setAdresler(e.target.value); setSonuc(null); }}
              placeholder="ornek@gmail.com, hasta@hotmail.com — virgülle ya da alt alta"
              style={{ ...alan, marginTop: 6 }} />
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, marginTop: 6, color: C.muted }}>
            <span><strong style={{ color: C.text }}>{gecerli.length}</strong> adres</span>
            {gecersiz.length > 0 && <span style={{ color: C.red }}>Geçersiz: {gecersiz.slice(0, 3).join(', ')}{gecersiz.length > 3 ? '…' : ''}</span>}
            {gecerli.length > DAVET_TEK_SEFER_MAX && <span style={{ color: C.red }}>Tek seferde en fazla {DAVET_TEK_SEFER_MAX} adres</span>}
            {gecerli.length <= DAVET_TEK_SEFER_MAX && gecerli.length > kalan && <span style={{ color: C.red }}>Bugün en fazla {kalan} davet daha gönderebilirsiniz</span>}
            <span style={{ marginLeft: 'auto' }}>Bugün kalan: {kalan}/{bilgi.gunlukMax}</span>
          </div>

          <label style={{ display: 'block', marginTop: 14 }}>
            <span style={etiket}>Kişisel notunuz</span>
            <textarea rows={4} value={not} maxLength={DAVET_NOT_MAX} onChange={e => setNot(e.target.value)} style={{ ...alan, marginTop: 6 }} />
          </label>
          <div style={{ fontSize: 11.5, color: C.muted, textAlign: 'right', marginTop: 3 }}>{not.length}/{DAVET_NOT_MAX}</div>

          {/* Hastanın göreceği e-posta */}
          <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: C.soft, borderBottom: `1px solid ${C.border}`, fontSize: 12, lineHeight: 1.6, color: C.muted, minWidth: 0 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ color: C.text }}>Kimden:</strong> {bilgi.ad} · Hekimhane</div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ color: C.text }}>Konu:</strong> {davetKonusu(bilgi.ad)}</div>
            </div>
            <div style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Deneyiminizi değerlendirir misiniz?</div>
              <div style={{ fontSize: 15, letterSpacing: 3, color: '#C9A04A', marginTop: 4 }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              {not.trim() && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: C.soft, borderLeft: '3px solid #C9A04A', borderRadius: 8, fontSize: 12, color: C.text, textAlign: 'left', whiteSpace: 'pre-line', maxHeight: 90, overflow: 'hidden' }}>{not.trim()}</div>
              )}
              <div style={{ display: 'inline-block', marginTop: 10, padding: '8px 16px', background: '#12294D', color: '#fff', borderRadius: 9, fontSize: 12, fontWeight: 600 }}>Değerlendirmemi yaz</div>
            </div>
          </div>

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 14, fontSize: 12.5, color: C.text, lineHeight: 1.5, cursor: 'pointer' }}>
            <input type="checkbox" checked={onay} onChange={e => setOnay(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flex: 'none' }} />
            <span>Bu adresler, e-posta ile iletişim için bana izin veren hastalarıma ait.</span>
          </label>

          {sonuc && (
            <div style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 10, fontSize: 12.5, lineHeight: 1.5,
              background: sonuc.tur === 'ok' ? '#ECFDF3' : '#FEF3F2', color: sonuc.tur === 'ok' ? C.green : C.red,
              border: `1px solid ${sonuc.tur === 'ok' ? '#ABEFC6' : '#FECDCA'}`,
            }}>{sonuc.metin}</div>
          )}

          <button type="button" onClick={gonder} disabled={!gonderilebilir} style={{ ...dugme(true, !gonderilebilir), width: '100%', marginTop: 14, minHeight: 46, fontSize: 14 }}>
            <Ikon d={IK.gonder} color="#fff" />
            {gonderiliyor ? 'Gönderiliyor…' : gecerli.length ? `${gecerli.length} hastaya davet gönder` : 'Davet gönder'}
          </button>
          <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, margin: '8px 0 0' }}>
            Aynı adrese {DAVET_TEKRAR_GUN} gün içinde ikinci davet gönderilmez. Yorumlar yayınlanmadan önce Hekimhane tarafından incelenir.
          </p>

          {bilgi.davetler.length > 0 && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <button type="button" onClick={() => setGecmisAcik(a => !a)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: C.navy }}>
                Gönderilen davetler ({bilgi.davetler.length}) {gecmisAcik ? '‹' : '›'}
              </button>
              {gecmisAcik && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
                  {bilgi.davetler.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: i ? `0.5px solid ${C.border}` : 'none', fontSize: 12, minWidth: 0 }}>
                      <span style={{ flex: 1, minWidth: 0, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</span>
                      <span style={{ color: C.muted, flex: 'none' }}>{new Date(d.tarih).toLocaleDateString('tr-TR')}</span>
                      <span style={{ flex: 'none', fontSize: 11, fontWeight: 600, color: d.durum === 'gonderildi' ? C.green : C.red }}>
                        {d.durum === 'gonderildi' ? 'Gönderildi' : 'Gönderilemedi'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* PDF için tam boyut, ekran dışı */}
      <PosterSayfa ref={posterRef} gizli ad={bilgi.ad} kurum={bilgi.kurum} yorumUrl={bilgi.yorumUrl} />

      <style dangerouslySetInnerHTML={{ __html: YTK_CSS }} />
    </div>
  );
}

// dangerouslySetInnerHTML: <style> metin çocuğu hidrasyon uyumsuzluğu yapıyor (proje tuzağı)
const YTK_CSS = `
.ytk-izgara{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}
.ytk-posterler{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
@media (max-width:1240px){.ytk-izgara{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.ytk-posterler{grid-template-columns:minmax(0,1fr);gap:22px}.ytk-poster-kutu{height:auto!important}}
`;
