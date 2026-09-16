'use client';

import { useEffect, useState } from 'react';
import {
  ASISTAN_YETKILERI, ASISTAN_VARSAYILAN, ASISTAN_YAPAMAZ, MAKS_ASISTAN,
  asistanYetkileri, asistanDavetEden, asistanRolu, yetkileriDuzenle,
  type AsistanYetki, type AsistanSekme,
} from '@/lib/asistan';

const NAVY = '#1B3A69', GOLD = '#D4A843', MUTED = '#6E6E73', BORDER = '#E5E5EA', TEXT = '#1D1D1F', BG = '#F5F5F7';

interface Asistan { id: string; email: string; ad: string | null; eklenme: string; yetkiler: AsistanYetki[]; durum: 'aktif' | 'davet_bekliyor' }
interface Yonetilen { entity_id: string; entity_type: string; entity_name: string; asistanlar: Asistan[] }
interface AsistanOlunan { claim_id: string; entity_id: string; entity_name: string; yetkiler: AsistanYetki[]; davet_eden: string | null }

const SEKME_ADI: Record<AsistanSekme, string> = { randevu: 'Randevu Talepleri', hastalar: 'Hastalarım', yorumlar: 'Yorumlar' };

/** Yetki seçimi — onay kutulu kartlar. Bağımlılık (randevu girişi → hasta kayıtları) otomatik uygulanır. */
function YetkiSecici({ secili, onChange, kucuk = false }: { secili: AsistanYetki[]; onChange: (y: AsistanYetki[]) => void; kucuk?: boolean }) {
  const degistir = (k: AsistanYetki) => {
    const var_ = secili.includes(k);
    let yeni = var_ ? secili.filter(x => x !== k) : [...secili, k];
    // "Hasta kayıtları" kaldırılırsa ona bağlı "Takvim ve randevu girişi" de kalkar
    if (var_) for (const y of ASISTAN_YETKILERI) if (y.gerektirir === k) yeni = yeni.filter(x => x !== y.key);
    onChange(yetkileriDuzenle(yeni));
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: kucuk ? 'repeat(auto-fill,minmax(210px,1fr))' : 'repeat(auto-fill,minmax(240px,1fr))', gap: 8 }}>
      {ASISTAN_YETKILERI.map(y => {
        const on = secili.includes(y.key);
        return (
          <label key={y.key}
            style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: kucuk ? '8px 10px' : '10px 12px', borderRadius: 11, cursor: 'pointer',
              border: `1.5px solid ${on ? NAVY : BORDER}`, background: on ? '#F2F6FD' : 'white', transition: 'all .12s' }}>
            <input type="checkbox" checked={on} onChange={() => degistir(y.key)}
              style={{ marginTop: 2, width: 16, height: 16, accentColor: NAVY, flexShrink: 0 }} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: on ? NAVY : TEXT }}>{y.baslik}</span>
              {!kucuk && <span style={{ display: 'block', fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 2 }}>{y.aciklama}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Asistanın erişebildiği alanlar — sekmeye gitme düğmeleriyle. Genel Bakış'ta da kullanılır. */
export function AsistanErisimKarti({ kayitlar, onGit, onAyril, ayriliyor }: {
  kayitlar: { id: string; entity_name?: string | null; role?: string | null }[];
  onGit: (sekme: AsistanSekme) => void;
  onAyril?: (id: string, ad: string) => void;
  ayriliyor?: string | null;
}) {
  if (!kayitlar.length) return null;
  return (
    <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.6px', color: '#0F766E', background: '#CCFBF1', borderRadius: 6, padding: '2px 7px' }}>ASİSTAN</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Asistan olarak eriştiğiniz işletmeler</span>
      </div>
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {kayitlar.map(k => {
          const yetkiler = asistanYetkileri(k.role);
          const sekmeler = Array.from(new Set(ASISTAN_YETKILERI.filter(y => yetkiler.includes(y.key)).map(y => y.sekme)));
          const davetci = asistanDavetEden(k.role);
          return (
            <div key={k.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 13, padding: '13px 15px', background: '#FBFCFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, overflowWrap: 'anywhere' }}>{k.entity_name || 'İşletme'}</div>
                  {davetci && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>Ekleyen: {davetci}</div>}
                </div>
                {onAyril && (
                  <button onClick={() => onAyril(k.id, k.entity_name || 'İşletme')} disabled={ayriliyor === k.id}
                    style={{ padding: '6px 11px', borderRadius: 9, border: '1px solid #FCA5A5', background: 'transparent', color: '#B91C1C', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {ayriliyor === k.id ? '…' : 'Asistanlıktan ayrıl'}
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '.5px', textTransform: 'uppercase', margin: '11px 0 6px' }}>Erişebildiğiniz alanlar</div>
              <ul style={{ margin: 0, paddingLeft: 17, fontSize: 12.5, color: TEXT, lineHeight: 1.65 }}>
                {ASISTAN_YETKILERI.filter(y => yetkiler.includes(y.key)).map(y => (
                  <li key={y.key}><strong>{y.baslik}</strong> <span style={{ color: MUTED }}>— {y.aciklama}</span></li>
                ))}
              </ul>
              {sekmeler.length > 0 && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 11 }}>
                  {sekmeler.map(s => (
                    <button key={s} onClick={() => onGit(s)}
                      style={{ padding: '7px 13px', borderRadius: 9, border: 'none', background: NAVY, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {SEKME_ADI[s]} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AsistanlarTab({ aktifEntityId, onGit }: { aktifEntityId: string; onGit: (sekme: AsistanSekme) => void }) {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yonetilen, setYonetilen] = useState<Yonetilen[]>([]);
  const [asistanOlunan, setAsistanOlunan] = useState<AsistanOlunan[]>([]);
  const [hata, setHata] = useState('');

  // Ekleme formu
  const [entityId, setEntityId] = useState('');
  const [email, setEmail] = useState('');
  const [ad, setAd] = useState('');
  const [yetkiler, setYetkiler] = useState<AsistanYetki[]>(ASISTAN_VARSAYILAN);
  const [ekleniyor, setEkleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tur: 'ok' | 'hata'; metin: string } | null>(null);

  // Satır düzenleme: id → taslak yetkiler
  const [taslak, setTaslak] = useState<Record<string, AsistanYetki[]>>({});
  const [kaydediliyor, setKaydediliyor] = useState<string | null>(null);
  const [kaldiriliyor, setKaldiriliyor] = useState<string | null>(null);

  async function yukle() {
    try {
      const r = await fetch('/api/panel/asistan', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) { setHata(d.error || 'Asistanlar yüklenemedi.'); return; }
      setYonetilen(d.yonetilen || []);
      setAsistanOlunan(d.asistanOlunan || []);
      setEntityId(p => p || ((d.yonetilen || []).find((y: Yonetilen) => y.entity_id === aktifEntityId)?.entity_id) || (d.yonetilen?.[0]?.entity_id ?? ''));
    } catch { setHata('Bağlantı hatası.'); }
    finally { setYukleniyor(false); }
  }
  useEffect(() => { yukle(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  async function ekle() {
    setMesaj(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setMesaj({ tur: 'hata', metin: 'Geçerli bir e-posta adresi girin.' }); return; }
    if (!yetkiler.length) { setMesaj({ tur: 'hata', metin: 'En az bir yetki seçin.' }); return; }
    setEkleniyor(true);
    try {
      const r = await fetch('/api/panel/asistan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, email: email.trim(), ad: ad.trim(), yetkiler }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setMesaj({ tur: 'ok', metin: d.yeniHesap
          ? `Davet gönderildi. ${email.trim()} hesabını oluşturunca seçtiğiniz alanlara erişebilecek.`
          : `${email.trim()} asistan olarak eklendi ve bilgilendirildi; paneline girdiğinde erişimi hazır.` });
        setEmail(''); setAd(''); setYetkiler(ASISTAN_VARSAYILAN);
        await yukle();
      } else setMesaj({ tur: 'hata', metin: d.error || 'Asistan eklenemedi.' });
    } catch { setMesaj({ tur: 'hata', metin: 'Bağlantı hatası.' }); }
    setEkleniyor(false);
  }

  async function yetkiKaydet(id: string) {
    const y = taslak[id]; if (!y) return;
    setKaydediliyor(id);
    try {
      const r = await fetch('/api/panel/asistan', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, yetkiler: y }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setYonetilen(p => p.map(e => ({ ...e, asistanlar: e.asistanlar.map(a => a.id === id ? { ...a, yetkiler: d.yetkiler } : a) })));
        setTaslak(p => { const n = { ...p }; delete n[id]; return n; });
      } else alert(d.error || 'Yetkiler kaydedilemedi.');
    } catch { alert('Bağlantı hatası.'); }
    setKaydediliyor(null);
  }

  async function kaldir(id: string, kim: string, kendisi = false) {
    const soru = kendisi
      ? `"${kim}" işletmesindeki asistanlığınızdan ayrılmak istiyor musunuz? Erişiminiz hemen kapanır.`
      : `${kim} asistanlıktan kaldırılsın mı? Erişimi hemen kapanır; hesabı ve daha önce yaptığı kayıtlar silinmez.`;
    if (!window.confirm(soru)) return;
    setKaldiriliyor(id);
    try {
      const r = await fetch('/api/panel/asistan', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        if (kendisi) { window.location.reload(); return; }
        await yukle();
      } else alert(d.error || 'Kaldırılamadı.');
    } catch { alert('Bağlantı hatası.'); }
    setKaldiriliyor(null);
  }

  const kutu: React.CSSProperties = { background: 'white', borderRadius: 18, border: `1px solid ${BORDER}`, padding: 22, marginBottom: 18 };
  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 11, border: `1px solid ${BORDER}`, fontSize: 14, fontFamily: 'inherit', color: TEXT, background: 'white', outline: 'none' };

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.6px' }}>Asistanlar</h1>
      <p style={{ fontSize: 13.5, color: MUTED, margin: '6px 0 22px', lineHeight: 1.55 }}>
        Sekreter, resepsiyon veya klinik asistanınıza hesabınızın <strong style={{ color: TEXT }}>yalnızca seçtiğiniz bölümlerine</strong> erişim verin —
        örneğin randevu girişleri ve düzenlemeleri. Şifrenizi paylaşmanıza gerek kalmaz; her asistan kendi hesabıyla girer.
      </p>

      {yukleniyor ? (
        <div style={{ ...kutu, textAlign: 'center', color: MUTED, fontSize: 14 }}>Yükleniyor…</div>
      ) : hata ? (
        <div style={{ ...kutu, color: '#B91C1C', fontSize: 14 }}>{hata}</div>
      ) : (
        <>
          {asistanOlunan.length > 0 && (
            <AsistanErisimKarti
              kayitlar={asistanOlunan.map(a => ({ id: a.claim_id, entity_name: a.entity_name, role: asistanRolu(a.davet_eden || '', a.yetkiler) }))}
              onGit={onGit}
              onAyril={(id, isim) => kaldir(id, isim, true)}
              ayriliyor={kaldiriliyor}
            />
          )}

          {yonetilen.length === 0 ? (
            asistanOlunan.length === 0 && (
              <div style={{ ...kutu, color: MUTED, fontSize: 14, textAlign: 'center' }}>Asistan eklemek için önce bir işletmenin sahipliğini onaylatın.</div>
            )
          ) : (
            <>
              {/* Yetki rehberi */}
              <div style={{ ...kutu, background: '#FBFCFE' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 8 }}>Verebileceğiniz yetkiler</div>
                    <ul style={{ margin: 0, paddingLeft: 17, fontSize: 12.8, color: TEXT, lineHeight: 1.65 }}>
                      {ASISTAN_YETKILERI.map(y => <li key={y.key}><strong>{y.baslik}</strong> <span style={{ color: MUTED }}>— {y.aciklama}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#B91C1C', letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 8 }}>Asistan hiçbir zaman</div>
                    <ul style={{ margin: 0, paddingLeft: 17, fontSize: 12.8, color: TEXT, lineHeight: 1.65 }}>
                      {ASISTAN_YAPAMAZ.map(m => <li key={m}>{m}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Yeni asistan */}
              <div style={kutu}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Asistan ekle</div>
                {yonetilen.length > 1 && (
                  <label style={{ display: 'block', marginBottom: 10 }}>
                    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: MUTED, marginBottom: 4 }}>İşletme</span>
                    <select value={entityId} onChange={e => setEntityId(e.target.value)} style={inp}>
                      {yonetilen.map(y => <option key={y.entity_id} value={y.entity_id}>{y.entity_name}</option>)}
                    </select>
                  </label>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginBottom: 14 }}>
                  <label>
                    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: MUTED, marginBottom: 4 }}>E-posta</span>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setMesaj(null); }} placeholder="asistan@ornek.com" autoComplete="off" style={inp} />
                  </label>
                  <label>
                    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: MUTED, marginBottom: 4 }}>Ad soyad (isteğe bağlı)</span>
                    <input value={ad} onChange={e => setAd(e.target.value)} placeholder="Ayşe Yılmaz" style={inp} />
                  </label>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: MUTED, marginBottom: 6 }}>Nerelere erişebilsin?</div>
                <YetkiSecici secili={yetkiler} onChange={setYetkiler} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                  <button onClick={ekle} disabled={ekleniyor || !entityId}
                    style={{ padding: '11px 20px', borderRadius: 11, border: 'none', background: NAVY, color: 'white', fontSize: 13.5, fontWeight: 700, cursor: ekleniyor ? 'default' : 'pointer', fontFamily: 'inherit', opacity: ekleniyor ? .6 : 1 }}>
                    {ekleniyor ? 'Ekleniyor…' : 'Asistan ekle ve davet gönder'}
                  </button>
                  <span style={{ fontSize: 12, color: MUTED }}>Hesabı yoksa hesap oluşturma daveti gider. İşletme başına en fazla {MAKS_ASISTAN} asistan.</span>
                </div>
                {mesaj && (
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: mesaj.tur === 'ok' ? '#166534' : '#B91C1C' }}>{mesaj.metin}</div>
                )}
              </div>

              {/* Mevcut asistanlar */}
              {yonetilen.map(y => (
                <div key={y.entity_id} style={kutu}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{y.entity_name}</span>
                    <span style={{ fontSize: 12, color: MUTED }}>· {y.asistanlar.length}/{MAKS_ASISTAN} asistan</span>
                  </div>
                  {y.asistanlar.length === 0 ? (
                    <div style={{ fontSize: 13, color: MUTED }}>Henüz asistan eklenmemiş.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {y.asistanlar.map(a => {
                        const secili = taslak[a.id] ?? a.yetkiler;
                        const degisti = !!taslak[a.id] && taslak[a.id].join(',') !== a.yetkiler.join(',');
                        return (
                          <div key={a.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 13, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                              <span style={{ width: 32, height: 32, borderRadius: '50%', background: BG, color: NAVY, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {(a.ad || a.email).charAt(0).toLocaleUpperCase('tr')}
                              </span>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{a.ad || a.email}</div>
                                <div style={{ fontSize: 11.5, color: MUTED, overflowWrap: 'anywhere' }}>{a.ad ? `${a.email} · ` : ''}eklendi {new Date(a.eklenme).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 9px',
                                background: a.durum === 'aktif' ? '#DCFCE7' : '#FEF3C7', color: a.durum === 'aktif' ? '#166534' : '#92400E', border: `1px solid ${a.durum === 'aktif' ? '#86EFAC' : '#FDE68A'}` }}>
                                {a.durum === 'aktif' ? 'Aktif' : 'Davet bekliyor'}
                              </span>
                              <button onClick={() => kaldir(a.id, a.ad || a.email)} disabled={kaldiriliyor === a.id}
                                style={{ padding: '6px 11px', borderRadius: 9, border: '1px solid #FCA5A5', background: 'white', color: '#B91C1C', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {kaldiriliyor === a.id ? '…' : 'Kaldır'}
                              </button>
                            </div>
                            <YetkiSecici kucuk secili={secili} onChange={v => setTaslak(p => ({ ...p, [a.id]: v }))} />
                            {degisti && (
                              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <button onClick={() => yetkiKaydet(a.id)} disabled={kaydediliyor === a.id || !secili.length}
                                  style={{ padding: '8px 15px', borderRadius: 9, border: 'none', background: secili.length ? NAVY : '#9CA3AF', color: 'white', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                  {kaydediliyor === a.id ? 'Kaydediliyor…' : secili.length ? 'Yetkileri kaydet' : 'En az bir yetki seçin'}
                                </button>
                                <button onClick={() => setTaslak(p => { const n = { ...p }; delete n[a.id]; return n; })}
                                  style={{ padding: '8px 13px', borderRadius: 9, border: `1px solid ${BORDER}`, background: 'white', color: MUTED, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                  Vazgeç
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </>
      )}
      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6 }}>
        <span style={{ color: GOLD, fontWeight: 700 }}>Not:</span> Yetkiler sunucuda uygulanır — asistan, izin verilmeyen bir bölüme bağlantıyla ya da doğrudan istekle de erişemez.
      </div>
    </div>
  );
}
