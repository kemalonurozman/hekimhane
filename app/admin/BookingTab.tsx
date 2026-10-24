'use client';

// Admin › Booking Başvuruları — kurulum için arama ve demo talepleri (satış takibi).
// Veri: /api/admin/booking-bekleme (service-role). Durum + not satır içinde kaydedilir.
import { useEffect, useMemo, useState } from 'react';
import { C, YUZEY } from './tema';
import { BOOKING_ROLLER, BOOKING_KANALLAR, BOOKING_HACIM, BOOKING_DURUMLAR, BOOKING_TALEPLER, BOOKING_URUNLER, etiketBul } from '@/lib/booking';

interface Kayit {
  id: string; ad: string; soyad: string; email: string; tel: string; rol: string; talep?: string | null; urun?: string | null;
  kurum_adi: string | null; il: string | null; kanallar: string[] | null; cagri_hacmi: string | null;
  mesaj: string | null; bulten: boolean; durum: string; admin_notu: string | null;
  created_at: string; updated_at: string;
}

const tarih = (s: string) => new Date(s).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function BookingTab() {
  const [kayitlar, setKayitlar] = useState<Kayit[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [durumFiltre, setDurumFiltre] = useState('hepsi');
  const [ara, setAra] = useState('');
  const [acik, setAcik] = useState<string | null>(null);
  const [notlar, setNotlar] = useState<Record<string, string>>({});
  const [kaydediliyor, setKaydediliyor] = useState<string | null>(null);

  async function yukle() {
    setYukleniyor(true); setHata('');
    try {
      const r = await fetch('/api/admin/booking-bekleme', { cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (j.tabloYok) { setHata(j.error); setKayitlar([]); }
      else if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      else setKayitlar(j.kayitlar || []);
    } catch (e: any) {
      setHata('Liste yüklenemedi: ' + (e?.message || 'bilinmeyen hata'));
    }
    setYukleniyor(false);
  }
  useEffect(() => { yukle(); }, []);

  async function guncelle(id: string, alanlar: { durum?: string; admin_notu?: string }) {
    setKaydediliyor(id);
    try {
      const r = await fetch('/api/admin/booking-bekleme', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...alanlar }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setKayitlar(ks => ks.map(k => (k.id === id ? { ...k, ...alanlar } as Kayit : k)));
    } catch (e: any) {
      alert('Kaydedilemedi: ' + (e?.message || 'hata'));
    }
    setKaydediliyor(null);
  }

  const sayilar = useMemo(() => {
    const s: Record<string, number> = { hepsi: kayitlar.length };
    kayitlar.forEach(k => { s[k.durum] = (s[k.durum] || 0) + 1; });
    return s;
  }, [kayitlar]);

  const liste = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr');
    return kayitlar.filter(k =>
      (durumFiltre === 'hepsi' || k.durum === durumFiltre) &&
      (!q || [k.ad, k.soyad, k.email, k.tel, k.kurum_adi, k.il].some(v => (v || '').toLocaleLowerCase('tr').includes(q))),
    );
  }, [kayitlar, durumFiltre, ara]);

  function csvIndir() {
    const bas = ['Tarih', 'Özellik', 'Talep', 'Ad', 'Soyad', 'E-posta', 'Telefon', 'Kim', 'Kurum', 'İl', 'Kanallar', 'Çağrı', 'Not', 'Bülten', 'Durum', 'Admin notu'];
    const satirlar = liste.map(k => [
      tarih(k.created_at), etiketBul(BOOKING_URUNLER, k.urun || 'booking'), etiketBul(BOOKING_TALEPLER, k.talep || 'kurulum'), k.ad, k.soyad, k.email, k.tel, etiketBul(BOOKING_ROLLER, k.rol), k.kurum_adi || '', k.il || '',
      (k.kanallar || []).map(x => etiketBul(BOOKING_KANALLAR, x)).join(' + '),
      k.cagri_hacmi ? etiketBul(BOOKING_HACIM, k.cagri_hacmi) : '', k.mesaj || '', k.bulten ? 'Evet' : 'Hayır',
      etiketBul(BOOKING_DURUMLAR, k.durum), k.admin_notu || '',
    ]);
    const csv = [bas, ...satirlar].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `booking-bekleme-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const girdi: React.CSSProperties = { padding: '8px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, fontFamily: 'inherit', fontSize: 13.5, color: C.text };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-.4px' }}>Booking Başvuruları</h1>
          <p style={{ fontSize: 13.5, color: C.muted, margin: '6px 0 0' }}>
            /booking sayfasından kurulum için aranmak ya da demo görmek isteyen hekim ve klinikler. <a href="/booking" target="_blank" style={{ color: C.navy }}>Sayfayı aç</a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={yukle} style={{ ...girdi, cursor: 'pointer', fontWeight: 600 }}>Yenile</button>
          <button onClick={csvIndir} disabled={!liste.length} style={{ ...girdi, cursor: 'pointer', fontWeight: 600, background: C.navy, color: '#fff', border: 'none' }}>CSV indir</button>
        </div>
      </div>

      {hata && <div style={{ ...YUZEY.kart, padding: 16, marginBottom: 16, color: C.amber, fontSize: 14, fontWeight: 600 }}>{hata}</div>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[{ id: 'hepsi', ad: 'Hepsi', renk: C.navy }, ...BOOKING_DURUMLAR].map(d => {
          const secili = durumFiltre === d.id;
          return (
            <button key={d.id} onClick={() => setDurumFiltre(d.id)}
              style={{ padding: '6px 12px', borderRadius: 999, border: `1px solid ${secili ? d.renk : C.border}`, background: secili ? d.renk : C.card, color: secili ? '#fff' : C.text, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {d.ad} <span style={{ opacity: .7, fontVariantNumeric: 'tabular-nums' }}>{sayilar[d.id] || 0}</span>
            </button>
          );
        })}
        <input value={ara} onChange={e => setAra(e.target.value)} placeholder="Ad, e-posta, telefon, kurum, il ara" style={{ ...girdi, marginLeft: 'auto', minWidth: 240 }} />
      </div>

      <div style={{ ...YUZEY.kart, overflow: 'hidden' }}>
        {yukleniyor ? (
          <p style={{ padding: 24, color: C.muted, fontSize: 14, margin: 0 }}>Yükleniyor…</p>
        ) : !liste.length ? (
          <p style={{ padding: 24, color: C.muted, fontSize: 14, margin: 0 }}>{kayitlar.length ? 'Filtreye uyan kayıt yok.' : 'Henüz kayıt yok.'}</p>
        ) : liste.map((k, i) => {
          const durum = BOOKING_DURUMLAR.find(d => d.id === k.durum);
          const genis = acik === k.id;
          return (
            <div key={k.id} style={{ borderTop: i ? `1px solid ${C.border}` : 'none' }}>
              <button onClick={() => setAcik(genis ? null : k.id)}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1.2fr) minmax(0,1fr) auto', gap: 12, alignItems: 'center', width: '100%', padding: '14px 18px', border: 'none', background: genis ? C.soft : 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, color: C.text }}>{k.ad} {k.soyad}{k.urun && k.urun !== 'booking' && <span style={{ padding: '2px 7px', borderRadius: 999, background: '#EEF3FA', color: C.navy, fontSize: 11, fontWeight: 700 }}>{etiketBul(BOOKING_URUNLER, k.urun)}</span>}{k.talep === 'demo' && <span style={{ padding: '2px 7px', borderRadius: 999, background: '#E1F2EE', color: '#0B5F55', fontSize: 11, fontWeight: 700 }}>Demo</span>}</strong>
                  <span style={{ fontSize: 12.5, color: C.muted }}>{etiketBul(BOOKING_ROLLER, k.rol)}{k.il ? ` · ${k.il}` : ''}</span>
                </span>
                <span style={{ minWidth: 0, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.kurum_adi || '—'}</span>
                <span style={{ fontSize: 12.5, color: C.muted }}>{tarih(k.created_at)}</span>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: `${durum?.renk || C.muted}1A`, color: durum?.renk || C.muted, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{durum?.ad || k.durum}</span>
              </button>
              {genis && (
                <div style={{ padding: '4px 18px 20px', background: C.soft, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
                  <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7 }}>
                    <div><b style={{ color: C.muted }}>E-posta:</b> <a href={`mailto:${k.email}`} style={{ color: C.navy }}>{k.email}</a></div>
                    <div><b style={{ color: C.muted }}>Telefon:</b> <a href={`tel:${k.tel.replace(/\s/g, '')}`} style={{ color: C.navy }}>{k.tel}</a></div>
                    <div><b style={{ color: C.muted }}>Kanallar:</b> {(k.kanallar || []).map(x => etiketBul(BOOKING_KANALLAR, x)).join(', ') || '—'}</div>
                    <div><b style={{ color: C.muted }}>Çağrı yoğunluğu:</b> {k.cagri_hacmi ? etiketBul(BOOKING_HACIM, k.cagri_hacmi) : '—'}</div>
                    <div><b style={{ color: C.muted }}>Bülten izni:</b> {k.bulten ? 'Evet' : 'Hayır'}</div>
                    {k.mesaj && <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}><b style={{ color: C.muted }}>Not:</b> {k.mesaj}</div>}
                    {k.updated_at !== k.created_at && <div style={{ marginTop: 6, fontSize: 12, color: C.muted }}>Son güncelleme: {tarih(k.updated_at)}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Durum
                      <select value={k.durum} disabled={kaydediliyor === k.id} onChange={e => guncelle(k.id, { durum: e.target.value })} style={{ ...girdi, display: 'block', width: '100%', marginTop: 4 }}>
                        {BOOKING_DURUMLAR.map(d => <option key={d.id} value={d.id}>{d.ad}</option>)}
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Admin notu
                      <textarea rows={3} value={notlar[k.id] ?? k.admin_notu ?? ''} onChange={e => setNotlar(n => ({ ...n, [k.id]: e.target.value }))}
                        style={{ ...girdi, display: 'block', width: '100%', marginTop: 4, resize: 'vertical' }} />
                    </label>
                    <button disabled={kaydediliyor === k.id || (notlar[k.id] ?? k.admin_notu ?? '') === (k.admin_notu ?? '')}
                      onClick={() => guncelle(k.id, { admin_notu: notlar[k.id] ?? '' })}
                      style={{ ...girdi, alignSelf: 'flex-start', cursor: 'pointer', fontWeight: 600, background: C.navy, color: '#fff', border: 'none' }}>
                      {kaydediliyor === k.id ? 'Kaydediliyor…' : 'Notu kaydet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
