'use client';

// Admin › Yol Haritası — yapılacaklar (gruplu, sıralı) ve yapılanlar (tarihli) zaman çizelgesi.
// Veri /api/admin/yol-haritasi'den gelir (lib/yol-haritasi.ts). Buradan yalnız TİP import edilir:
// veri dosyası istemci paketine girmemeli (güvenlik notları içerir).
import { useEffect, useMemo, useState } from 'react';
import { C, YUZEY } from './tema';
import type { YapilacakGrup, Guncelleme, Kim, Alan, YapilacakDurum } from '@/lib/yol-haritasi';

interface Ozet { acik: number; sizde: number; yapiliyor: number; oncelikli: number; sonGuncelleme: string | null }

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function gunCoz(t: string) {
  const [y, m, d] = t.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return { gun: d, ay: AYLAR[dt.getMonth()], yil: y, haftaGunu: GUNLER[dt.getDay()], ayAnahtar: `${y}-${String(m).padStart(2, '0')}` };
}
const uzunTarih = (t: string) => { const g = gunCoz(t); return `${g.gun} ${g.ay} ${g.yil}`; };

const KIM: Record<Kim, { ad: string; renk: string; zemin: string }> = {
  siz:    { ad: 'Siz',    renk: C.navy,   zemin: 'rgba(26,51,94,.08)' },
  claude: { ad: 'Claude', renk: C.purple, zemin: 'rgba(109,74,214,.10)' },
  avukat: { ad: 'Avukat', renk: C.amber,  zemin: 'rgba(199,119,0,.10)' },
  ozvelo: { ad: 'Ozvelo', renk: C.cyan,   zemin: 'rgba(14,138,168,.10)' },
};

const DURUM: Record<YapilacakDurum, { ad: string; renk: string }> = {
  yapiliyor: { ad: 'Yapılıyor',     renk: C.blue },
  sirada:    { ad: 'Sırada',        renk: C.dim },
  kontrol:   { ad: 'Kontrol edin',  renk: C.amber },
};

const ALAN_RENK: Record<Alan, string> = {
  Site: C.navy, Panel: C.cyan, Admin: C.purple, Blog: C.orange, SEO: C.green,
  Yasal: C.amber, 'Güvenlik': C.red, 'Ödeme': C.gold, 'Tasarım': C.blue, 'Altyapı': C.muted,
};

function Cip({ renk, zemin, children }: { renk: string; zemin?: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, background: zemin || `${renk}14`, color: renk, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', lineHeight: '18px' }}>
      {children}
    </span>
  );
}

export default function YolHaritasiTab() {
  const [veri, setVeri] = useState<{ ozet: Ozet; yapilacaklar: YapilacakGrup[]; yapilanlar: Guncelleme[] } | null>(null);
  const [hata, setHata] = useState('');
  const [gorunum, setGorunum] = useState<'yapilacak' | 'yapilan'>('yapilacak');
  const [kimFiltre, setKimFiltre] = useState<Kim | 'hepsi'>('hepsi');
  const [alanFiltre, setAlanFiltre] = useState<Alan | 'hepsi'>('hepsi');
  const [ara, setAra] = useState('');

  useEffect(() => {
    try { const g = localStorage.getItem('hk_admin_yol_gorunum'); if (g === 'yapilan' || g === 'yapilacak') setGorunum(g); } catch {}
    (async () => {
      try {
        const r = await fetch('/api/admin/yol-haritasi', { cache: 'no-store' });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        setVeri(j);
      } catch (e: any) {
        setHata('Yol haritası yüklenemedi: ' + (e?.message || 'bilinmeyen hata'));
      }
    })();
  }, []);

  function gorunumSec(g: 'yapilacak' | 'yapilan') {
    setGorunum(g);
    try { localStorage.setItem('hk_admin_yol_gorunum', g); } catch {}
  }

  const gruplar = useMemo(() => {
    if (!veri) return [];
    return veri.yapilacaklar
      .map(g => ({ ...g, gorunen: g.maddeler.filter(m => kimFiltre === 'hepsi' || m.kim === kimFiltre) }))
      .filter(g => g.gorunen.length);
  }, [veri, kimFiltre]);

  const kimSayilari = useMemo(() => {
    const s: Record<string, number> = { hepsi: 0 };
    veri?.yapilacaklar.forEach(g => g.maddeler.forEach(m => { s.hepsi++; s[m.kim] = (s[m.kim] || 0) + 1; }));
    return s;
  }, [veri]);

  // Yapılanlar: filtre → ay → gün
  const aylar = useMemo(() => {
    if (!veri) return [];
    const q = ara.trim().toLocaleLowerCase('tr');
    const liste = veri.yapilanlar.filter(k =>
      (alanFiltre === 'hepsi' || k.alan === alanFiltre) &&
      (!q || [k.baslik, ...k.maddeler].some(v => v.toLocaleLowerCase('tr').includes(q))),
    );
    const ayMap = new Map<string, { baslik: string; gunler: Map<string, Guncelleme[]> }>();
    liste.forEach(k => {
      const g = gunCoz(k.tarih);
      if (!ayMap.has(g.ayAnahtar)) ayMap.set(g.ayAnahtar, { baslik: `${g.ay} ${g.yil}`, gunler: new Map() });
      const ay = ayMap.get(g.ayAnahtar)!;
      if (!ay.gunler.has(k.tarih)) ay.gunler.set(k.tarih, []);
      ay.gunler.get(k.tarih)!.push(k);
    });
    return Array.from(ayMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([anahtar, ay]) => ({
        anahtar, baslik: ay.baslik,
        sayi: Array.from(ay.gunler.values()).reduce((t, x) => t + x.length, 0),
        gunler: Array.from(ay.gunler.entries()).sort((a, b) => b[0].localeCompare(a[0])),
      }));
  }, [veri, alanFiltre, ara]);

  const alanlar = useMemo(() => {
    const s = new Map<Alan, number>();
    veri?.yapilanlar.forEach(k => s.set(k.alan, (s.get(k.alan) || 0) + 1));
    return Array.from(s.entries()).sort((a, b) => b[1] - a[1]);
  }, [veri]);

  const filtreDugme = (secili: boolean, renk: string): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 999, border: `1px solid ${secili ? renk : C.border}`,
    background: secili ? renk : C.card, color: secili ? '#fff' : C.text,
    fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  });

  if (hata) return <div style={{ ...YUZEY.kart, padding: 16, color: C.red, fontSize: 14, fontWeight: 600 }}>{hata}</div>;
  if (!veri) return <div style={{ padding: '80px 0', textAlign: 'center', color: C.muted, fontSize: 14 }}>Yol haritası yükleniyor…</div>;

  const { ozet } = veri;

  return (
    <div className="yh" style={{ maxWidth: 920 }}>
      {/* Başlık */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-.2px' }}>Yol Haritası</h1>
        <p style={{ fontSize: 13.5, color: C.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
          Sırayla yapılacaklar ve siteye eklenenler. Her güncellemede Claude tarafından yenilenir.
          {ozet.sonGuncelleme && <> Son güncelleme: <strong style={{ color: C.text, fontWeight: 600 }}>{uzunTarih(ozet.sonGuncelleme)}</strong>.</>}
        </p>
      </div>

      {/* Özet şeridi */}
      <div className="yh-ozet" style={{ ...YUZEY.kart, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, background: C.border, overflow: 'hidden', marginBottom: 20 }}>
        {[
          { etiket: 'Açık iş', deger: ozet.acik, renk: C.text },
          { etiket: 'Sizden beklenen', deger: ozet.sizde, renk: C.navy },
          { etiket: 'Öncelikli', deger: ozet.oncelikli, renk: C.red },
          { etiket: 'Yapılan güncelleme', deger: veri.yapilanlar.length, renk: C.green },
        ].map(k => (
          <div key={k.etiket} style={{ background: C.card, padding: '14px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: k.renk, letterSpacing: '-.25px', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{k.deger}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{k.etiket}</div>
          </div>
        ))}
      </div>

      {/* Bölümlü kontrol */}
      <div role="tablist" aria-label="Görünüm" style={{ display: 'inline-flex', padding: 3, borderRadius: 11, background: '#E8E8ED', marginBottom: 18 }}>
        {([['yapilacak', `Yapılacaklar · ${ozet.acik}`], ['yapilan', `Yapılanlar · ${veri.yapilanlar.length}`]] as const).map(([id, ad]) => {
          const secili = gorunum === id;
          return (
            <button key={id} role="tab" aria-selected={secili} onClick={() => gorunumSec(id)}
              style={{ padding: '7px 16px', borderRadius: 9, border: 'none', background: secili ? '#fff' : 'transparent', boxShadow: secili ? '0 1px 3px rgba(0,0,0,.12)' : 'none', color: secili ? C.text : C.muted, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
              {ad}
            </button>
          );
        })}
      </div>

      {gorunum === 'yapilacak' ? (
        <>
          <div className="yh-filtre" style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
            <button onClick={() => setKimFiltre('hepsi')} style={filtreDugme(kimFiltre === 'hepsi', C.navy)}>Tümü {kimSayilari.hepsi}</button>
            {(Object.keys(KIM) as Kim[]).filter(k => kimSayilari[k]).map(k => (
              <button key={k} onClick={() => setKimFiltre(k)} style={filtreDugme(kimFiltre === k, KIM[k].renk)}>
                {k === 'siz' ? 'Sizde' : `${KIM[k].ad}`} {kimSayilari[k]}
              </button>
            ))}
          </div>

          {/* Zaman çizelgesi: gruplar */}
          <ol className="yh-cizgi" style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
            {gruplar.map((g, gi) => {
              const sira = veri.yapilacaklar.findIndex(x => x.id === g.id) + 1;
              const yapiliyor = g.maddeler.some(m => m.durum === 'yapiliyor');
              return (
                <li key={g.id} className="yh-grup" style={{ position: 'relative', paddingLeft: 52, paddingBottom: gi < gruplar.length - 1 ? 26 : 0 }}>
                  {gi < gruplar.length - 1 && <span aria-hidden className="yh-dikey" style={{ position: 'absolute', left: 17, top: 36, bottom: 0, width: 2, background: C.border }} />}
                  <span aria-hidden className="yh-no" style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 36, borderRadius: 11, background: sira === 1 ? C.navy : C.card, border: `1px solid ${sira === 1 ? C.navy : C.border}`, color: sira === 1 ? '#fff' : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
                    {sira}
                  </span>

                  <div style={{ paddingTop: 6, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-.3px' }}>{g.baslik}</h2>
                      {sira === 1 && <Cip renk={C.navy}>Şimdi</Cip>}
                      {yapiliyor && <Cip renk={C.blue}><span className="yh-nabiz" style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue }} />Yapılıyor</Cip>}
                    </div>
                    <p style={{ fontSize: 13.5, color: C.muted, margin: '5px 0 0', lineHeight: 1.55 }}>{g.aciklama}</p>
                  </div>

                  <div style={{ ...YUZEY.kart, overflow: 'hidden' }}>
                    {g.gorunen.map((m, mi) => {
                      const no = g.maddeler.indexOf(m) + 1;
                      const d = DURUM[m.durum];
                      return (
                        <div key={mi} className="yh-madde" style={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) auto', gap: 12, padding: '13px 16px', borderTop: mi ? `1px solid ${C.border}` : 'none', alignItems: 'start' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.dim, fontVariantNumeric: 'tabular-nums', paddingTop: 2 }}>{sira}.{no}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {m.oncelikli && <span style={{ color: C.red, marginRight: 6, fontSize: 12, fontWeight: 600 }}>ÖNCELİKLİ</span>}
                              {m.baslik}
                            </div>
                            {m.aciklama && <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0', lineHeight: 1.55 }}>{m.aciklama}</p>}
                            <div className="yh-cipler-mobil" style={{ display: 'none', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                              <Cip renk={KIM[m.kim].renk} zemin={KIM[m.kim].zemin}>{KIM[m.kim].ad}</Cip>
                              <Cip renk={d.renk}><span style={{ width: 6, height: 6, borderRadius: '50%', background: d.renk }} />{d.ad}</Cip>
                            </div>
                          </div>
                          <div className="yh-cipler" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                            <Cip renk={KIM[m.kim].renk} zemin={KIM[m.kim].zemin}>{KIM[m.kim].ad}</Cip>
                            <Cip renk={d.renk}><span className={m.durum === 'yapiliyor' ? 'yh-nabiz' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: d.renk }} />{d.ad}</Cip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>
          {!gruplar.length && <p style={{ color: C.muted, fontSize: 14 }}>Bu filtrede açık iş yok.</p>}
        </>
      ) : (
        <>
          <div className="yh-filtre" style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setAlanFiltre('hepsi')} style={filtreDugme(alanFiltre === 'hepsi', C.navy)}>Tümü {veri.yapilanlar.length}</button>
            {alanlar.map(([a, n]) => (
              <button key={a} onClick={() => setAlanFiltre(a)} style={filtreDugme(alanFiltre === a, ALAN_RENK[a])}>{a} {n}</button>
            ))}
            <input value={ara} onChange={e => setAra(e.target.value)} placeholder="Güncellemelerde ara" aria-label="Güncellemelerde ara" className="yh-ara"
              style={{ marginLeft: 'auto', minWidth: 200, padding: '7px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, fontFamily: 'inherit', fontSize: 13.5, color: C.text }} />
          </div>

          {!aylar.length && <p style={{ color: C.muted, fontSize: 14 }}>Aramaya uyan güncelleme yok.</p>}

          {aylar.map(ay => (
            <section key={ay.anahtar} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-.3px' }}>{ay.baslik}</h2>
                <span style={{ fontSize: 12.5, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{ay.sayi} güncelleme</span>
              </div>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {ay.gunler.map(([tarih, kayitlar], gi) => {
                  const g = gunCoz(tarih);
                  const son = gi === ay.gunler.length - 1;
                  return (
                    <li key={tarih} className="yh-gun" style={{ display: 'grid', gridTemplateColumns: '84px 20px minmax(0, 1fr)', gap: 12, position: 'relative' }}>
                      <div className="yh-gun-tarih" style={{ textAlign: 'right', paddingTop: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>{g.gun} {g.ay.slice(0, 3)}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{g.haftaGunu}</div>
                      </div>
                      <div aria-hidden className="yh-gun-cizgi" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ position: 'absolute', top: 6, width: 10, height: 10, borderRadius: '50%', background: C.card, border: `2px solid ${C.green}`, zIndex: 1 }} />
                        {!son && <span style={{ position: 'absolute', top: 16, bottom: -6, width: 2, background: C.border }} />}
                      </div>
                      <div style={{ paddingBottom: son ? 0 : 18, minWidth: 0 }}>
                        <div className="yh-gun-tarih-mobil" style={{ display: 'none', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{g.gun} {g.ay} · <span style={{ fontWeight: 500, color: C.muted }}>{g.haftaGunu}</span></div>
                        <div style={{ ...YUZEY.kart, overflow: 'hidden' }}>
                          {kayitlar.map((k, ki) => (
                            <div key={ki} style={{ padding: '12px 16px', borderTop: ki ? `1px solid ${C.border}` : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <Cip renk={ALAN_RENK[k.alan]}>{k.alan}</Cip>
                                <strong style={{ fontSize: 14.5, color: C.text, fontWeight: 600, lineHeight: 1.4 }}>{k.baslik}</strong>
                              </div>
                              {k.maddeler.length > 0 && (
                                <ul style={{ margin: '7px 0 0', padding: '0 0 0 18px', color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
                                  {k.maddeler.map((md, mi) => <li key={mi}>{md}</li>)}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </>
      )}

      <style>{`
        @keyframes yhNabiz { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
        .yh-nabiz { animation: yhNabiz 1.6s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .yh-nabiz { animation: none } }
        @media (max-width: 640px) {
          .yh-ozet { grid-template-columns: repeat(2, minmax(0, 1fr)) !important }
          .yh-grup { padding-left: 0 !important }
          .yh-no { position: static !important; margin-bottom: 8px }
          .yh-dikey { display: none }
          .yh-madde { grid-template-columns: 30px minmax(0, 1fr) !important }
          .yh-cipler { display: none !important }
          .yh-cipler-mobil { display: flex !important }
          .yh-gun { grid-template-columns: 14px minmax(0, 1fr) !important; gap: 10px !important }
          .yh-gun-tarih { display: none }
          .yh-gun-tarih-mobil { display: block !important }
          .yh-ara { margin-left: 0 !important; min-width: 0 !important; width: 100% }
        }
      `}</style>
    </div>
  );
}
