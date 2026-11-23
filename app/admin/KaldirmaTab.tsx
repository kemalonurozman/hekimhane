'use client';

/**
 * Admin → Kaldırma Talepleri
 *   Talepler: profil yayında kalır; 48 saat içinde karar yoksa kendiliğinden duraklatılır.
 *     Neden sor (e-posta) · Duraklat · Yayında tut (reddet) · Kaldır (tam yedekle sil)
 *   Kaldırılan Profiller: yedeği olanlar tek tıkla geri yüklenir (kayıt + yorumlar + sahiplik).
 *   Her satırda "Mail gönder": talep sahibine elle, tek tek dostça e-posta (KaldirmaMailPenceresi).
 * Veri: /api/admin/kaldirma (+ /eposta)  ·  mantık: lib/profil-kaldirma.ts, lib/kaldirma-eposta.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { C } from './tema';
import KaldirmaMailPenceresi, { type EpostaKaydi, type MailHedefi } from './KaldirmaMailPenceresi';
import { sablonAdi } from '@/lib/kaldirma-sablonlari';

interface Talep {
  id: string; entity_type: string; entity_id: string; entity_name: string | null; il: string | null;
  ad_soyad: string; talep_eden: string; email: string; tel: string | null; aciklama: string | null;
  status: string; created_at: string; karar_son?: string | null; email_dogrulandi_at?: string | null;
  duraklatildi_at?: string | null; soru_metni?: string | null; soru_at?: string | null;
  karar_notu?: string | null; karar_at?: string | null; ip?: string | null;
}
interface Kaldirilan {
  id: string; entity_type: string; eski_entity_id: string | null; ad: string; il: string | null;
  talep_tarihi: string; kaldirma_tarihi: string; yedek_silinme?: string | null; geri_yuklendi_at?: string | null;
  talep_id?: string | null; yedekVar: boolean; yorumSayisi: number;
}
type Filtre = 'acik' | 'kapali' | 'kaldirilan';

const TUR: Record<string, string> = { klinik: 'Diş Kliniği', hastane: 'Hastane', doktor: 'Doktor', eczane: 'Eczane' };
const tarih = (s?: string | null) => (s ? new Date(s).toLocaleString('tr', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

function kalanSure(son?: string | null): { metin: string; doldu: boolean } {
  if (!son) return { metin: 'süre yok', doldu: false };
  const ms = new Date(son).getTime() - Date.now();
  if (ms <= 0) return { metin: 'süre doldu', doldu: true };
  const s = Math.floor(ms / 3600_000), d = Math.floor((ms % 3600_000) / 60_000);
  return { metin: `${s} sa ${d} dk kaldı`, doldu: false };
}

const DURUM: Record<string, { etiket: string; renk: string }> = {
  bekliyor:     { etiket: 'KARAR BEKLİYOR', renk: C.amber },
  duraklatildi: { etiket: 'DURAKLATILDI',   renk: C.orange },
  kaldirildi:   { etiket: 'KALDIRILDI',     renk: C.red },
  reddedildi:   { etiket: 'YAYINDA TUTULDU', renk: C.green },
};

export default function KaldirmaTab({ onChanged }: { onChanged: () => void }) {
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [kaldirilanlar, setKaldirilanlar] = useState<Kaldirilan[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [migration, setMigration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<Filtre>('acik');
  const [busy, setBusy] = useState<string | null>(null);
  const [notlar, setNotlar] = useState<Record<string, string>>({});
  const [acikPanel, setAcikPanel] = useState<Record<string, 'soru' | 'not' | undefined>>({});
  const [sonuc, setSonuc] = useState<{ ok: boolean; text: string } | null>(null);
  const [epostalar, setEpostalar] = useState<EpostaKaydi[]>([]);
  const [epostaMigration, setEpostaMigration] = useState(false);
  const [kontenjanKalan, setKontenjanKalan] = useState<number | null>(null);
  const [retler, setRetler] = useState<Record<string, string>>({});   // alici → işaret tarihi
  const [mailHedefi, setMailHedefi] = useState<MailHedefi | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [liste, eposta] = await Promise.all([
      fetch('/api/admin/kaldirma', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch('/api/admin/kaldirma/eposta', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
    ]);
    if (liste) { setTalepler(liste.talepler || []); setKaldirilanlar(liste.kaldirilanlar || []); setUrls(liste.urls || {}); setMigration(!!liste.migration); }
    else { setTalepler([]); setKaldirilanlar([]); }
    setEpostalar(eposta?.kayitlar || []); setEpostaMigration(!!eposta?.migration);
    setRetler(Object.fromEntries(((eposta?.retler || []) as { alici: string; created_at: string }[]).map(r => [r.alici, r.created_at])));
    setKontenjanKalan(typeof eposta?.kontenjanKalan === 'number' ? eposta.kontenjanKalan : null);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function gonder(body: Record<string, unknown>, anahtar: string, onay?: string) {
    if (onay && !window.confirm(onay)) return;
    setBusy(anahtar);
    try {
      const r = await fetch('/api/admin/kaldirma', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      setSonuc(r.ok ? { ok: true, text: d.mesaj + (d.mail === false ? ' · e-posta gönderilmedi' : '') } : { ok: false, text: d.error || 'İşlem başarısız' });
      if (r.ok) { setNotlar(p => { const n = { ...p }; delete n[anahtar]; return n; }); setAcikPanel(p => ({ ...p, [anahtar]: undefined })); await load(); onChanged(); }
    } catch { setSonuc({ ok: false, text: 'Bağlantı hatası.' }); }
    setBusy(null);
  }

  /** Bu talebe ya da aynı adrese giden e-postalar (yeniden eskiye). */
  const epostaGecmisi = (talepId: string, email: string) => {
    const a = email.trim().toLowerCase();
    return epostalar.filter(e => e.talep_id === talepId || e.alici === a);
  };
  /** Kaldırılan kaydın talebi: talep_id, yoksa (eski akış) tür + kimlik eşleşmesi. */
  const kaldirilanTalebi = (k: Kaldirilan) =>
    (k.talep_id && talepler.find(t => t.id === k.talep_id))
    || talepler.find(t => t.status === 'kaldirildi' && t.entity_type === k.entity_type && t.entity_id === k.eski_entity_id)
    || null;
  const mailAc = (t: Talep, k?: Kaldirilan) => {
    const yedekli = k || kaldirilanlar.find(x => x.talep_id === t.id && x.yedekVar && !x.geri_yuklendi_at);
    setSonuc(null);
    setMailHedefi({
      talepId: t.id, kaldirilanId: k?.id || null,
      ad: t.ad_soyad, email: t.email, profil: t.entity_name || k?.ad || 'Profil', status: t.status,
      entityType: t.entity_type, entityId: t.entity_id,
      yedekSon: yedekli?.yedekVar && !yedekli.geri_yuklendi_at ? yedekli.yedek_silinme || null : null,
    });
  };
  /** "E-posta istemiyor" işareti: elle gönderim kapalı, yalnız işareti kaldırma düğmesi. */
  const retDugmesi = (t: Talep, anahtar: string) => btn('İşareti kaldır', async () => {
    if (!window.confirm(`${t.email} için “e-posta istemiyor” işareti kaldırılsın mı? Yalnız kişi fikrini değiştirdiyse ya da işaret yanlışlıkla konduysa kaldırın.`)) return;
    setBusy(anahtar);
    try {
      const r = await fetch('/api/admin/kaldirma/eposta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aksiyon: 'ret', talepId: t.id, geriAl: true }) });
      const d = await r.json().catch(() => ({}));
      setSonuc(r.ok ? { ok: true, text: d.mesaj } : { ok: false, text: d.error || 'İşaret kaldırılamadı' });
      if (r.ok) await load();
    } catch { setSonuc({ ok: false, text: 'Bağlantı hatası.' }); }
    setBusy(null);
  }, 'cerceve', busy === anahtar);
  const retBilgisi = (email: string) => {
    const tarihi = retler[email.trim().toLowerCase()];
    return tarihi ? <span style={{ fontSize: 11.5, fontWeight: 600, color: C.red }}>E-posta istemiyor · {tarih(tarihi)}</span> : null;
  };
  const mailBilgisi = (liste: EpostaKaydi[]) => liste.length ? (
    <span style={{ fontSize: 11.5, fontWeight: 600, color: C.green }}>
      Mail gönderildi: {tarih(liste[0].created_at)} · {sablonAdi(liste[0].sablon)}{liste.length > 1 ? ` (toplam ${liste.length})` : ''}
    </span>
  ) : null;

  const acik = talepler.filter(t => t.status === 'bekliyor' || t.status === 'duraklatildi');
  const kapali = talepler.filter(t => t.status !== 'bekliyor' && t.status !== 'duraklatildi');

  const btn = (etiket: string, onClick: () => void, stil: 'dolu' | 'cerceve' | 'tehlike' | 'uyari', disabled = false) => (
    <button disabled={disabled} onClick={onClick}
      style={{ fontSize: 12.5, fontWeight: 600, padding: '8px 13px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.6 : 1,
        border: stil === 'cerceve' ? `1px solid ${C.border}` : 'none',
        background: stil === 'dolu' ? C.navy : stil === 'tehlike' ? C.red : stil === 'uyari' ? 'rgba(217,96,26,.12)' : 'transparent',
        color: stil === 'dolu' || stil === 'tehlike' ? 'white' : stil === 'uyari' ? C.orange : C.text }}>{etiket}</button>
  );

  const talepKarti = (t: Talep) => {
    const d = DURUM[t.status] || { etiket: t.status.toUpperCase(), renk: C.muted };
    const sure = kalanSure(t.karar_son);
    const b = busy === t.id;
    const acikMi = t.status === 'bekliyor' || t.status === 'duraklatildi';
    const panel = acikPanel[t.id];
    const gecmis = epostaGecmisi(t.id, t.email);
    const ret = !!retler[t.email.trim().toLowerCase()];
    const mailDugmesi = ret ? retDugmesi(t, t.id) : btn(gecmis.length ? 'Tekrar mail gönder' : 'Mail gönder', () => mailAc(t), 'cerceve', b);
    return (
      <div key={t.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${acikMi ? 'rgba(199,119,0,.35)' : C.border}`, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.navy, background: 'rgba(26,51,94,.08)', padding: '2px 8px', borderRadius: 8 }}>{TUR[t.entity_type] || t.entity_type}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t.entity_name || t.entity_id}</span>
              {urls[t.id] && <a href={urls[t.id]} target="_blank" rel="noopener" style={{ fontSize: 11.5, fontWeight: 600, color: C.navy }}>Profili aç ↗</a>}
              <span style={{ fontSize: 11.5, color: C.dim }}>{t.entity_id}</span>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Talep: {tarih(t.created_at)}{t.il ? ` · ${t.il}` : ''}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'grid', gap: 5, justifyItems: 'end' }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: d.renk, background: d.renk + '1F', borderRadius: 8, padding: '3px 9px' }}>{d.etiket}</span>
            {t.status === 'bekliyor' && <span style={{ fontSize: 12, fontWeight: 600, color: sure.doldu ? C.red : C.amber, fontVariantNumeric: 'tabular-nums' }}>Duraklatmaya: {sure.metin}</span>}
            {t.status === 'duraklatildi' && <span style={{ fontSize: 11.5, color: C.muted }}>Yayından alındı: {tarih(t.duraklatildi_at)}</span>}
          </div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 18px', fontSize: 12.5, color: C.muted, marginBottom: 10 }}>
            <span>Talep eden: <strong style={{ color: C.text }}>{t.ad_soyad}</strong> ({t.talep_eden === 'yetkili' ? 'yetkili kişi' : 'profil sahibi'})</span>
            <span>E-posta: <a href={`mailto:${t.email}`} style={{ color: C.navy, fontWeight: 600 }}>{t.email}</a> {t.email_dogrulandi_at ? <strong style={{ color: C.green }}>· doğrulandı</strong> : <span style={{ color: C.amber }}>· doğrulanmadı</span>}</span>
            <span>Cep: {t.tel ? <a href={`tel:${t.tel.replace(/\s/g, '')}`} style={{ color: C.navy, fontWeight: 600 }}>{t.tel}</a> : <em>yok (eski talep)</em>}</span>
            {t.ip && <span>IP: {t.ip}</span>}
            {mailBilgisi(gecmis)}
            {retBilgisi(t.email)}
          </div>
          <div style={{ background: C.soft, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, letterSpacing: '.4px', marginBottom: 3 }}>KALDIRMA NEDENİ</div>
            <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{t.aciklama || <em style={{ color: C.muted }}>Neden yazılmamış (eski talep) — “Neden sor” ile isteyin.</em>}</div>
          </div>
          {t.soru_metni && (
            <div style={{ background: 'rgba(26,51,94,.05)', border: '1px solid rgba(26,51,94,.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, fontSize: 13, color: C.text }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: C.navy, letterSpacing: '.4px', marginBottom: 3 }}>SORDUĞUNUZ · {tarih(t.soru_at)}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{t.soru_metni}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Yanıt e-posta kutunuza gelir.</div>
            </div>
          )}
          {t.karar_notu && !acikMi && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Karar notu ({tarih(t.karar_at)}): {t.karar_notu}</div>}

          {acikMi && (
            <>
              {panel && (
                <textarea value={notlar[t.id] || ''} onChange={e => setNotlar(p => ({ ...p, [t.id]: e.target.value }))} rows={3}
                  placeholder={panel === 'soru'
                    ? 'Talep sahibine sorunuz — örn. “Profilin neden kaldırılmasını istiyorsunuz? Doktor adına başvurduysanız yetki belgenizi ekleyin.”'
                    : 'Talep sahibine gidecek not (isteğe bağlı) — örn. “Bilgiler kamuya açık kaynaktan; düzeltme için profili sahiplenebilirsiniz.”'}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.soft, color: C.text, fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical', outline: 'none', marginBottom: 8 }} />
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {panel === 'soru'
                  ? btn('Soruyu gönder', () => gonder({ talepId: t.id, aksiyon: 'soru', not: notlar[t.id] }, t.id), 'dolu', b)
                  : btn('Neden sor', () => setAcikPanel(p => ({ ...p, [t.id]: 'soru' })), 'cerceve', b)}
                {t.status === 'bekliyor' && btn('Şimdi duraklat', () => gonder({ talepId: t.id, aksiyon: 'duraklat' }, t.id), 'uyari', b)}
                {panel === 'not'
                  ? btn('Yayında tut · gönder', () => gonder({ talepId: t.id, aksiyon: 'yayinda_tut', not: notlar[t.id] }, t.id), 'dolu', b)
                  : btn('Yayında tut (reddet)', () => setAcikPanel(p => ({ ...p, [t.id]: 'not' })), 'cerceve', b)}
                {mailDugmesi}
                {btn('Kaldır', () => gonder({ talepId: t.id, aksiyon: 'kaldir', not: notlar[t.id] }, t.id,
                  `${t.entity_name || 'Profil'} kaldırılacak. Kayıt, yorumlar ve sahiplik bilgisi yedeklenip silinir; Kaldırılan Profiller'den geri yüklenebilir. Devam edilsin mi?`), 'tehlike', b)}
              </div>
            </>
          )}
          {!acikMi && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{mailDugmesi}</div>}
        </div>
      </div>
    );
  };

  const kaldirilanSatiri = (k: Kaldirilan) => {
    const b = busy === k.id;
    const t = kaldirilanTalebi(k);
    const gecmis = t ? epostaGecmisi(t.id, t.email) : [];
    return (
      <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{k.ad} <span style={{ fontSize: 11.5, fontWeight: 500, color: C.dim }}>{TUR[k.entity_type] || k.entity_type} · {k.eski_entity_id || '—'}{k.il ? ` · ${k.il}` : ''}</span></div>
          <div style={{ fontSize: 11.5, color: C.muted }}>
            Kaldırıldı: {tarih(k.kaldirma_tarihi)} · talep {k.talep_tarihi}
            {k.geri_yuklendi_at ? <strong style={{ color: C.green }}> · geri yüklendi {tarih(k.geri_yuklendi_at)}</strong>
              : k.yedekVar ? <> · yedek {k.yorumSayisi} yorumla, {tarih(k.yedek_silinme)} tarihine kadar</>
              : <span style={{ color: C.red }}> · yedek yok (eski akış ya da süresi doldu)</span>}
          </div>
          {(gecmis.length > 0 || (t && retler[t.email.trim().toLowerCase()])) && (
            <div style={{ marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>{mailBilgisi(gecmis)}{t && retBilgisi(t.email)}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
          {!k.geri_yuklendi_at && (t
            ? (retler[t.email.trim().toLowerCase()] ? retDugmesi(t, k.id) : btn(gecmis.length ? 'Tekrar mail gönder' : 'Mail gönder', () => mailAc(t, k), 'cerceve', b))
            : <span style={{ fontSize: 11.5, color: C.muted }} title="Bu kayda bağlı kaldırma talebi bulunamadı">E-posta adresi yok</span>)}
          {!k.geri_yuklendi_at && (k.yedekVar
            ? btn('Geri yükle', () => gonder({ kaldirilanId: k.id, aksiyon: 'geri_yukle' }, k.id, `${k.ad} profili yedekten geri yüklenecek (kayıt + yorumlar + sahiplik). Devam edilsin mi?`), 'dolu', b)
            : <span style={{ fontSize: 11.5, color: C.muted, maxWidth: 260 }}>Yedeksiz kayıt elle eklenmeli (supabase/tek-seferlik).</span>)}
        </div>
      </div>
    );
  };

  const FILTRE: { key: Filtre; label: string; n: number; renk: string }[] = [
    { key: 'acik', label: 'Açık talepler', n: acik.length, renk: C.amber },
    { key: 'kapali', label: 'Sonuçlanan', n: kapali.length, renk: C.muted },
    { key: 'kaldirilan', label: 'Kaldırılan Profiller', n: kaldirilanlar.filter(k => !k.geri_yuklendi_at).length, renk: C.red },
  ];

  return (
    <div>
      {sonuc && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: sonuc.ok ? 'rgba(30,142,90,.12)' : 'rgba(217,48,37,.12)', color: sonuc.ok ? C.green : C.red }}>
          <span>{sonuc.text}</span>
          <button onClick={() => setSonuc(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }} aria-label="Kapat">×</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Kaldırma Talepleri</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0', maxWidth: 640 }}>Talep gelince profil yayında kalır. 48 saat içinde karar vermezseniz profil kendiliğinden duraklatılır (yayından alınır, silinmez). Kaldırılan profiller 30 gün yedekli tutulur ve geri yüklenebilir.</p>
        </div>
        <button onClick={load} style={{ fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'inherit' }}>Yenile</button>
      </div>
      {migration && (
        <div style={{ background: 'rgba(199,119,0,.1)', border: '1px solid rgba(199,119,0,.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, color: C.amber, fontSize: 13 }}>
          Veritabanı kolonları eksik. <strong>supabase/migrations/2026-10-26_kaldirma_karari.sql</strong> dosyasını Supabase SQL Editor&apos;da çalıştırın; o zamana kadar 48 saat kuralı ve yedekli kaldırma çalışmaz.
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {FILTRE.map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${filtre === f.key ? f.renk : C.border}`, background: filtre === f.key ? f.renk + '1A' : C.card, color: filtre === f.key ? f.renk : C.text }}>
            {f.label}<span style={{ fontSize: 11, fontWeight: 600, background: filtre === f.key ? f.renk : C.soft, color: filtre === f.key ? 'white' : C.muted, borderRadius: 10, padding: '1px 7px' }}>{f.n}</span>
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>Yükleniyor…</div>
        : filtre === 'kaldirilan'
          ? (kaldirilanlar.length
              ? <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>{kaldirilanlar.map(kaldirilanSatiri)}</div>
              : <div style={{ textAlign: 'center', padding: 60, color: C.muted, background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }}>Kaldırılan profil yok.</div>)
          : ((filtre === 'acik' ? acik : kapali).length
              ? (filtre === 'acik' ? acik : kapali).map(talepKarti)
              : <div style={{ textAlign: 'center', padding: 60, color: C.muted, background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }}>{filtre === 'acik' ? 'Açık kaldırma talebi yok.' : 'Sonuçlanan talep yok.'}</div>)}
      {mailHedefi && (
        <KaldirmaMailPenceresi
          hedef={mailHedefi}
          oncekiler={epostaGecmisi(mailHedefi.talepId, mailHedefi.email)}
          kontenjanAcik={kontenjanKalan !== null && kontenjanKalan > 0}
          migration={epostaMigration}
          onKapat={() => setMailHedefi(null)}
          onBitti={async mesaj => { setMailHedefi(null); setSonuc({ ok: true, text: mesaj }); await load(); }}
        />
      )}
    </div>
  );
}
