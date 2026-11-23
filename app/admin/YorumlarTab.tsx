'use client';

/**
 * Admin → Yorumlar: işletmelere yazılan TÜM yorumlar tek yerde.
 *   Bekleyen      → yeni yorum, admin onaylamadan yayınlanmaz
 *   Belge istendi → admin yorumcudan ziyaret belgesi istedi (istek + alındı kaydı kartta durur)
 *   Yayında       → onaylanmış yorumlar (son 300)
 *   Kaldırılan    → yayına alınmışken sonradan yayından kaldırılanlar (tamamı) — yeniden yayınla / kalıcı sil
 *   Reddedilen    → kayıt durur, kimse görmez
 * Kimin yazdığı: ad soyad + e-posta (yalnız burada görünür).
 * Veri: /api/admin/reported-yorumlar?tip=onay · aksiyon: /api/admin/yorum-action
 */

import { useState, useEffect, useCallback } from 'react';
import { C } from './tema';
import { YORUM_ONAY_BEKLIYOR, YORUM_ONAY_BELGE, YORUM_ONAY_RED } from '@/lib/yorum-onay';
import { gelistirmeAdi } from '@/lib/yorum-kurallari';

interface YorumSatiri {
  id: string;
  entity_type: string;
  entity_id: string;
  author: string | null;
  author_email?: string | null;
  rating: number;
  text: string | null;
  date?: string | null;
  created_at: string;
  verified?: boolean | null;
  hidden?: boolean | null;
  report_status?: string | null;
  admin_note?: string | null;
  belge_istendi_at?: string | null;
  belge_alindi_at?: string | null;
  belge_notu?: string | null;
  reply_text?: string | null;
  gelistirme?: string[] | null;
  kurallar_onay_at?: string | null;
  kurallar_surum?: string | null;
}

type Filtre = 'bekleyen' | 'belge' | 'yayinda' | 'kaldirilan' | 'red' | 'tumu';
type Aksiyon = 'approve' | 'reject' | 'request_docs' | 'docs_received' | 'hide' | 'unhide' | 'delete';

const TUR: Record<string, { label: string; color: string }> = {
  klinik:  { label: 'Diş Kliniği', color: C.cyan },
  hastane: { label: 'Hastane',     color: C.purple },
  doktor:  { label: 'Doktor',      color: C.green },
  eczane:  { label: 'Eczane',      color: C.orange },
};

const Ic = ({ d, size = 14 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const IK = {
  check:   'M20 6L9 17l-5-5',
  x:       'M18 6L6 18M6 6l12 12',
  doc:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  inbox:   'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  eye:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff:  'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22',
  trash:   'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  mail:    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  link:    'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
};

function Yildiz({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < n ? C.gold : 'none'} stroke={i < n ? C.gold : C.dim} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function durumu(r: YorumSatiri): { key: Filtre; etiket: string; renk: string } {
  if (r.report_status === YORUM_ONAY_BEKLIYOR) return { key: 'bekleyen', etiket: 'ONAY BEKLİYOR', renk: C.amber };
  if (r.report_status === YORUM_ONAY_BELGE)    return { key: 'belge', etiket: r.belge_alindi_at ? 'BELGE ALINDI' : 'BELGE İSTENDİ', renk: r.belge_alindi_at ? C.blue : C.orange };
  if (r.report_status === YORUM_ONAY_RED)      return { key: 'red', etiket: 'REDDEDİLDİ', renk: C.muted };
  if (r.hidden)                                return { key: 'kaldirilan', etiket: 'YAYINDAN KALDIRILDI', renk: C.red };
  return { key: 'yayinda', etiket: 'YAYINDA', renk: C.green };
}

const tarih = (s?: string | null) => (s ? new Date(s).toLocaleString('tr', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function YorumlarTab({ onChanged }: { onChanged: () => void }) {
  const [rows, setRows]       = useState<YorumSatiri[]>([]);
  const [names, setNames]     = useState<Record<string, string>>({});
  const [urls, setUrls]       = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre]   = useState<Filtre>('bekleyen');
  const [arama, setArama]     = useState('');
  const [busy, setBusy]       = useState<string | null>(null);
  const [notlar, setNotlar]   = useState<Record<string, string>>({});   // yorumId → belge notu / karar notu
  const [belgeAcik, setBelgeAcik] = useState<Record<string, boolean>>({});
  const [sonuc, setSonuc]     = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reported-yorumlar?tip=onay', { cache: 'no-store' });
      const data = res.ok ? await res.json() : { reviews: [], names: {}, urls: {} };
      setRows(data.reviews || []); setNames(data.names || {}); setUrls(data.urls || {});
    } catch { setRows([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(r: YorumSatiri, action: Aksiyon) {
    if (action === 'delete' && !window.confirm('Bu yorum KALICI olarak silinecek. Geri alınamaz. Devam edilsin mi?')) return;
    if (action === 'unhide' && !window.confirm('Yorum yeniden yayına alınacak ve profilde görünecek. Devam edilsin mi?')) return;
    if (action === 'reject' && !window.confirm('Yorum reddedilecek; yayınlanmaz, kayıt burada durur. Devam edilsin mi?')) return;
    if (action === 'request_docs' && !(notlar[r.id] || '').trim() && !window.confirm('Belge notu boş. Genel bir belge talebi (randevu kaydı / fiş / muayene belgesi) gönderilsin mi?')) return;
    setBusy(r.id);
    try {
      const res = await fetch('/api/admin/yorum-action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yorumId: r.id, action, note: notlar[r.id] || '', notify: action === 'approve' }),
      });
      const data = await res.json();
      if (!res.ok) { setSonuc({ ok: false, text: data.error || 'İşlem başarısız' }); setBusy(null); return; }
      const AD: Record<Aksiyon, string> = {
        approve: 'Yorum onaylandı ve yayına alındı', reject: 'Yorum reddedildi', request_docs: 'Belge talebi gönderildi',
        docs_received: 'Belge alındı olarak işaretlendi', hide: 'Yorum yayından kaldırıldı · Yayından kaldırılanlar listesinde', unhide: 'Yorum yeniden yayına alındı', delete: 'Yorum kalıcı olarak silindi',
      };
      const ek = action === 'request_docs'
        ? (data.yorumcuMail?.sent ? ` · ${data.yorumcuMail.to}` : ` · e-posta gönderilemedi: ${data.yorumcuMail?.reason || '?'}`)
        : action === 'approve' && data.mail?.sent ? ` · işletmeye bildirildi (${data.mail.to})` : '';
      setSonuc({ ok: true, text: AD[action] + ek });
      setNotlar(p => { const n = { ...p }; delete n[r.id]; return n; });
      setBelgeAcik(p => ({ ...p, [r.id]: false }));
      await load(); onChanged();
    } catch { setSonuc({ ok: false, text: 'İşlem başarısız. Bağlantıyı kontrol edin.' }); }
    setBusy(null);
  }

  const say = (k: Filtre) => rows.filter(r => durumu(r).key === k).length;
  const q = arama.trim().toLocaleLowerCase('tr');
  const liste = rows
    .filter(r => filtre === 'tumu' || durumu(r).key === filtre)
    .filter(r => !q || [r.author, r.author_email, r.text, names[`${r.entity_type}:${r.entity_id}`]].some(v => (v || '').toLocaleLowerCase('tr').includes(q)));

  const FILTRELER: { key: Filtre; label: string; renk: string }[] = [
    { key: 'bekleyen', label: 'Bekleyen',      renk: C.amber },
    { key: 'belge',    label: 'Belge istendi', renk: C.orange },
    { key: 'yayinda',  label: 'Yayında',       renk: C.green },
    { key: 'kaldirilan', label: 'Yayından kaldırılan', renk: C.red },
    { key: 'red',      label: 'Reddedilen',    renk: C.muted },
    { key: 'tumu',     label: 'Tümü',          renk: C.navy },
  ];

  const dugme = (etiket: string, ikon: string, onClick: () => void, stil: 'dolu' | 'cerceve' | 'tehlike', disabled: boolean) => (
    <button disabled={disabled} onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '8px 13px', borderRadius: 9, cursor: 'pointer', opacity: disabled ? 0.6 : 1, fontFamily: 'inherit',
        border: stil === 'cerceve' ? `1px solid ${C.border}` : stil === 'tehlike' ? '1px solid rgba(217,48,37,.3)' : 'none',
        background: stil === 'dolu' ? C.navy : 'transparent', color: stil === 'dolu' ? 'white' : stil === 'tehlike' ? C.red : C.text }}>
      <Ic d={ikon} size={13} /> {etiket}
    </button>
  );

  const kart = (r: YorumSatiri) => {
    const d = durumu(r);
    const key = `${r.entity_type}:${r.entity_id}`;
    const ad = names[key] || r.entity_id;
    const url = urls[key];
    const tur = TUR[r.entity_type] || { label: r.entity_type, color: C.muted };
    const b = busy === r.id;
    const bekliyor = d.key === 'bekleyen' || d.key === 'belge';
    return (
      <div key={r.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${bekliyor ? 'rgba(199,119,0,.35)' : C.border}`, overflow: 'hidden', marginBottom: 12 }}>
        {/* Üst: işletme + durum */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: tur.color, background: tur.color + '1A', padding: '2px 8px', borderRadius: 8 }}>{tur.label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{ad}</span>
              {url && <a href={url} target="_blank" rel="noopener" style={{ color: C.navy, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 600 }}><Ic d={IK.link} size={12} /> Profil</a>}
            </div>
            <div style={{ fontSize: 11.5, color: C.muted }}>
              Gönderim: {tarih(r.created_at)}{r.date ? ` · Ziyaret: ${r.date}` : ''}{r.verified ? ' · Onaylı hasta bağlantısı' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <Yildiz n={r.rating} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: d.renk, background: d.renk + '1F', borderRadius: 8, padding: '3px 9px' }}>{d.etiket}</span>
          </div>
        </div>

        <div style={{ padding: '14px 18px' }}>
          {/* Kimin yazdığı */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: C.muted, marginBottom: 8 }}>
            <span>Yazan: <strong style={{ color: C.text }}>{r.author || 'Anonim'}</strong></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Ic d={IK.mail} size={12} />
              {r.author_email ? <a href={`mailto:${r.author_email}`} style={{ color: C.navy, fontWeight: 600 }}>{r.author_email}</a> : <em>e-posta kaydı yok</em>}
            </span>
          </div>
          {r.text && <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>“{r.text}”</p>}
          {!!r.gelistirme?.length && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', margin: '0 0 12px' }}>
              <span style={{ fontSize: 11.5, color: C.muted }}>Geliştirilebilir (yayınlanmaz):</span>
              {r.gelistirme.map(g => <span key={g} style={{ fontSize: 11.5, fontWeight: 600, color: C.orange, background: 'rgba(217,96,26,.08)', border: '1px solid rgba(217,96,26,.2)', borderRadius: 8, padding: '2px 8px' }}>{gelistirmeAdi(g)}</span>)}
            </div>
          )}
          <div style={{ fontSize: 11.5, color: C.muted, margin: '0 0 12px' }}>
            {r.kurallar_onay_at ? `Yorum kuralları kabul edildi: ${tarih(r.kurallar_onay_at)}${r.kurallar_surum ? ` · sürüm ${r.kurallar_surum}` : ''}` : 'Yorum kuralları kabul kaydı yok (eski yorum)'}
          </div>
          {r.reply_text && <div style={{ fontSize: 12.5, color: C.muted, margin: '0 0 12px', paddingLeft: 10, borderLeft: `2px solid ${C.border}` }}>İşletme yanıtı: {r.reply_text}</div>}

          {/* Belge kaydı — istek ve alındı bilgisi yorumda durur */}
          {(r.belge_istendi_at || r.belge_alindi_at || r.belge_notu) && (
            <div style={{ background: 'rgba(217,96,26,.06)', border: '1px solid rgba(217,96,26,.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: C.orange, letterSpacing: '0.4px', marginBottom: 4 }}>BELGE KAYDI</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>
                {r.belge_istendi_at && <div>Belge istendi: <strong>{tarih(r.belge_istendi_at)}</strong>{r.author_email ? ` → ${r.author_email}` : ''}</div>}
                {r.belge_alindi_at && <div>Belge alındı: <strong>{tarih(r.belge_alindi_at)}</strong></div>}
                {r.belge_notu && <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{r.belge_notu}</div>}
              </div>
            </div>
          )}
          {r.admin_note && d.key !== 'belge' && (
            <div style={{ background: C.soft, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, letterSpacing: '0.4px', marginBottom: 3 }}>YÖNETİCİ NOTU</div>
              <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{r.admin_note}</p>
            </div>
          )}

          {/* Aksiyonlar */}
          {bekliyor ? (
            <>
              {belgeAcik[r.id] && (
                <textarea value={notlar[r.id] || ''} onChange={e => setNotlar(p => ({ ...p, [r.id]: e.target.value }))} rows={2}
                  placeholder={d.key === 'belge' && !r.belge_alindi_at
                    ? 'Alınan belge notu (isteğe bağlı) — örn. “Randevu SMS ekran görüntüsü e-postayla geldi.”'
                    : 'Hangi belge isteniyor? — örn. “Randevu kaydı veya fiş görseli (kişisel bilgileri kapatabilirsiniz).” E-postada bu metin gider.'}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.soft, color: C.text, fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical', outline: 'none', marginBottom: 8 }} />
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dugme('Onayla · Yayınla', IK.check, () => act(r, 'approve'), 'dolu', b)}
                {d.key === 'bekleyen' && (belgeAcik[r.id]
                  ? dugme('Belge talebini gönder', IK.mail, () => act(r, 'request_docs'), 'cerceve', b || !r.author_email)
                  : dugme('Belge iste', IK.doc, () => setBelgeAcik(p => ({ ...p, [r.id]: true })), 'cerceve', b || !r.author_email))}
                {d.key === 'belge' && !r.belge_alindi_at && (belgeAcik[r.id]
                  ? dugme('Alındı olarak kaydet', IK.inbox, () => act(r, 'docs_received'), 'cerceve', b)
                  : dugme('Belge alındı', IK.inbox, () => setBelgeAcik(p => ({ ...p, [r.id]: true })), 'cerceve', b))}
                {dugme('Reddet', IK.x, () => act(r, 'reject'), 'tehlike', b)}
              </div>
              {!r.author_email && d.key === 'bekleyen' && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>E-posta kaydı olmadığı için belge istenemiyor.</div>}
            </>
          ) : d.key === 'yayinda' ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dugme('Yayından kaldır', IK.eyeOff, () => act(r, 'hide'), 'cerceve', b)}
              {dugme('Kalıcı sil', IK.trash, () => act(r, 'delete'), 'tehlike', b)}
            </div>
          ) : d.key === 'kaldirilan' ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dugme('Yeniden yayınla', IK.eye, () => act(r, 'unhide'), 'cerceve', b)}
              {dugme('Tamamen kaldır · Kalıcı sil', IK.trash, () => act(r, 'delete'), 'tehlike', b)}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.key === 'red' && dugme('Yine de onayla', IK.check, () => act(r, 'approve'), 'cerceve', b)}
              {dugme('Kalıcı sil', IK.trash, () => act(r, 'delete'), 'tehlike', b)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {sonuc && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: sonuc.ok ? 'rgba(30,142,90,.12)' : 'rgba(217,48,37,.12)', color: sonuc.ok ? C.green : C.red, border: `1px solid ${sonuc.ok ? 'rgba(30,142,90,.3)' : 'rgba(217,48,37,.3)'}` }}>
          <span>{sonuc.text}</span>
          <button onClick={() => setSonuc(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }} aria-label="Kapat">×</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Yorumlar</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>İşletmelere yazılan yorumlar siz onaylamadan yayınlanmaz. Gerekirse yorumcudan belge isteyin; istek ve alındı kaydı yorumda durur.</p>
        </div>
        <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Ic d={IK.refresh} size={13} /> Yenile
        </button>
      </div>

      {/* Filtre + arama */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        {FILTRELER.map(f => {
          const n = f.key === 'tumu' ? rows.length : say(f.key);
          const aktif = filtre === f.key;
          return (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                border: `1px solid ${aktif ? f.renk : C.border}`, background: aktif ? f.renk + '1A' : C.card, color: aktif ? f.renk : C.text }}>
              {f.label}
              <span style={{ fontSize: 11, fontWeight: 600, background: aktif ? f.renk : C.soft, color: aktif ? 'white' : C.muted, borderRadius: 10, padding: '1px 7px', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
            </button>
          );
        })}
        <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Ara: işletme, yazan, e-posta, metin"
          style={{ marginLeft: 'auto', minWidth: 220, padding: '8px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 14 }}>Yükleniyor…</div>
      ) : liste.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 14, background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }}>
          {filtre === 'bekleyen' ? 'Onay bekleyen yorum yok.' : 'Bu filtrede yorum yok.'}
        </div>
      ) : liste.map(kart)}
    </div>
  );
}
