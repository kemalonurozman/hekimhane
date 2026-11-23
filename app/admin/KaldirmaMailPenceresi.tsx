'use client';

/**
 * Admin → Kaldırma Talepleri → "Mail gönder" penceresi.
 * Talep sahibine (kaldırılan / açık / sonuçlanan) yöneticinin elle, tek tek gönderdiği e-posta:
 * hazır şablon seç → konu + metni düzenle → önizle → kendine deneme / gönder.
 * Alıcı sunucuda talepten çözülür; buradaki adres yalnız gösterim. Önizleme = giden e-posta
 * (aynı `epostaGovdesi`). Alt not (ret satırı dahil) düzenlenemez. Şablonlar: lib/kaldirma-sablonlari.ts
 * "Bu kişi e-posta istemiyor": yanıtla ret bildirene işaret koyar; sonra bu adrese elle gönderim kapanır.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { C } from './tema';
import {
  KALDIRMA_SABLONLARI, KALDIRMA_EPOSTA_SINIR as S, BAGLAM_ETIKET,
  baglamBul, epostaGovdesi, sahiplenAdresi, sablonAdi, type SablonKod, type SablonDegerleri,
} from '@/lib/kaldirma-sablonlari';

export interface EpostaKaydi {
  id: string; talep_id: string; kaldirilan_id: string | null;
  alici: string; sablon: string; konu: string; created_at: string;
}

export interface MailHedefi {
  talepId: string;
  kaldirilanId?: string | null;
  ad: string;
  email: string;
  profil: string;
  status: string;
  entityType: string;
  entityId: string | null;
  /** Yedekten geri yüklenebilecekse yedeğin silineceği an (ISO) */
  yedekSon: string | null;
}

const tarih = (s: string) => new Date(s).toLocaleString('tr', { dateStyle: 'medium', timeStyle: 'short' });
const gun = (s: string) => new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });

export default function KaldirmaMailPenceresi({ hedef, oncekiler, kontenjanAcik, migration, onKapat, onBitti }: {
  hedef: MailHedefi;
  oncekiler: EpostaKaydi[];
  kontenjanAcik: boolean;
  migration: boolean;
  onKapat: () => void;
  /** Gönderim ya da ret işareti başarılı → pencere kapanır, liste yenilenir */
  onBitti: (mesaj: string) => void;
}) {
  const baglam = baglamBul(hedef.status);
  const sablonlar = KALDIRMA_SABLONLARI.filter(s => s.baglamlar.includes(baglam));
  const degerler: SablonDegerleri = useMemo(() => ({
    ad: hedef.ad.trim(),
    profil: hedef.profil.trim() || 'Profil',
    sahiplenUrl: baglam !== 'kaldirildi' && hedef.entityId ? sahiplenAdresi(hedef.entityType, hedef.entityId) : null,
    yedekSon: baglam === 'kaldirildi' && hedef.yedekSon && new Date(hedef.yedekSon).getTime() > Date.now() ? gun(hedef.yedekSon) : null,
    kontenjanAcik,
  }), [hedef, baglam, kontenjanAcik]);

  const ilk = sablonlar.find(s => s.kod === (baglam === 'kaldirildi' ? 'veda' : 'alternatif')) || sablonlar[0];
  const [sablon, setSablon] = useState<SablonKod>(ilk.kod);
  const [konu, setKonu] = useState(() => ilk.konu(degerler));
  const [metin, setMetin] = useState(() => ilk.metin(degerler, baglam));
  const [duzenlendi, setDuzenlendi] = useState(false);
  const [busy, setBusy] = useState<'gonder' | 'deneme' | 'ret' | null>(null);
  const [durum, setDurum] = useState<{ ok: boolean; text: string } | null>(null);
  const [sunucuOnceki, setSunucuOnceki] = useState<EpostaKaydi[]>([]);
  const kutu = useRef<HTMLDivElement>(null);

  // Sayfa kaydırması kilit + Esc ile kapat
  useEffect(() => {
    const eski = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    kutu.current?.focus();
    return () => { document.body.style.overflow = eski; };
  }, []);
  useEffect(() => {
    const tus = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onKapat(); };
    window.addEventListener('keydown', tus);
    return () => window.removeEventListener('keydown', tus);
  }, [busy, onKapat]);

  function sablonSec(kod: SablonKod) {
    if (kod === sablon) return;
    if (duzenlendi && !window.confirm('Metinde yaptığınız değişiklikler silinecek. Şablon değiştirilsin mi?')) return;
    const s = KALDIRMA_SABLONLARI.find(x => x.kod === kod)!;
    setSablon(kod); setKonu(s.konu(degerler)); setMetin(s.metin(degerler, baglam)); setDuzenlendi(false); setDurum(null);
  }

  const tumOncekiler = useMemo(() => {
    const m = new Map<string, EpostaKaydi>();
    for (const r of [...oncekiler, ...sunucuOnceki]) m.set(r.id, r);
    return Array.from(m.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [oncekiler, sunucuOnceki]);

  const konuT = konu.trim(), metinT = metin.trim();
  const hata =
    konuT.length < S.konuMin ? 'Konu yazın.'
    : konuT.length > S.konuMax ? `Konu en fazla ${S.konuMax} karakter.`
    : metinT.length < S.metinMin ? 'Metin çok kısa.'
    : metinT.length > S.metinMax ? `Metin en fazla ${S.metinMax} karakter.`
    : sablon === 'serbest' && !duzenlendi ? 'Kendi metninizi yazın.'
    : null;

  async function gonder(deneme: boolean, tekrarOnay = tumOncekiler.length > 0, onayli = false): Promise<void> {
    if (hata) { setDurum({ ok: false, text: hata }); return; }
    if (!deneme && !onayli) {
      const son = tumOncekiler[0];
      const soru = son
        ? `Bu kişiye daha önce ${tumOncekiler.length} e-posta gönderildi (son: ${tarih(son.created_at)} · ${sablonAdi(son.sablon)}). O e-postada başka e-posta gönderilmeyeceği yazıyordu.\n\nYine de ${hedef.email} adresine gönderilsin mi?`
        : `${hedef.email} adresine “${konuT}” konulu e-posta gönderilecek. Devam edilsin mi?`;
      if (!window.confirm(soru)) return;
    }
    setBusy(deneme ? 'deneme' : 'gonder'); setDurum(null);
    try {
      const r = await fetch('/api/admin/kaldirma/eposta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talepId: hedef.talepId, kaldirilanId: hedef.kaldirilanId || null, sablon, konu: konuT, metin: metinT, deneme, tekrarOnay }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 409 && Array.isArray(d.tekrar) && d.tekrar.length) {
        // Sunucu, burada görünmeyen bir gönderim buldu (ör. aynı adres başka talepte) → göster, yeniden sor
        setSunucuOnceki(d.tekrar);
        setBusy(null);
        const son = d.tekrar[0] as EpostaKaydi;
        if (window.confirm(`Bu adrese ${tarih(son.created_at)} tarihinde “${son.konu}” gönderilmiş. Yine de gönderilsin mi?`)) await gonder(false, true, true);
        return;
      }
      if (!r.ok) { setDurum({ ok: false, text: d.error || 'Gönderilemedi.' }); setBusy(null); return; }
      if (deneme) { setDurum({ ok: true, text: d.mesaj || 'Deneme e-postası gönderildi.' }); setBusy(null); return; }
      setBusy(null);
      onBitti(d.mesaj || 'E-posta gönderildi.');
    } catch {
      setDurum({ ok: false, text: 'Bağlantı hatası.' }); setBusy(null);
    }
  }

  /** Yanıtla "e-posta istemiyorum" diyen kişiyi işaretle: bu adrese elle gönderim kapanır. */
  async function retIsaretle() {
    if (!window.confirm(`${hedef.email} “e-posta istemiyorum” dedi diye işaretlensin mi?\n\nBu adrese bir daha elle e-posta gönderilemez; otomatik “profil kaldırıldı” e-postasında tanıtım bölümü çıkmaz. İşaret sonradan kaldırılabilir.`)) return;
    setBusy('ret'); setDurum(null);
    try {
      const r = await fetch('/api/admin/kaldirma/eposta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aksiyon: 'ret', talepId: hedef.talepId }) });
      const d = await r.json().catch(() => ({}));
      setBusy(null);
      if (!r.ok) { setDurum({ ok: false, text: d.error || 'İşaretlenemedi.' }); return; }
      onBitti(d.mesaj || 'İşaretlendi.');
    } catch { setDurum({ ok: false, text: 'Bağlantı hatası.' }); setBusy(null); }
  }

  const secili = KALDIRMA_SABLONLARI.find(s => s.kod === sablon)!;
  const govde = useMemo(() => epostaGovdesi(metinT || ' ', baglam), [metinT, baglam]);
  const alan = { width: '100%', boxSizing: 'border-box' as const, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.soft, color: C.text, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' };
  const etiket = { display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '.4px', margin: '0 0 5px' } as const;

  return (
    <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onKapat(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(29,29,31,.38)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div ref={kutu} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="kmp-baslik"
        style={{ background: C.card, borderRadius: 16, width: '100%', maxWidth: 1060, margin: 'auto 0', boxShadow: '0 20px 60px rgba(0,0,0,.18)', outline: 'none', overflow: 'hidden' }}>

        {/* Başlık */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ minWidth: 0 }}>
            <h2 id="kmp-baslik" style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>E-posta gönder</h2>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, overflowWrap: 'anywhere' }}>
              Alıcı: <strong style={{ color: C.text }}>{hedef.ad}</strong> &lt;{hedef.email}&gt; · {hedef.profil} · <span style={{ color: C.navy, fontWeight: 600 }}>{BAGLAM_ETIKET[baglam]}</span>
            </div>
          </div>
          <button onClick={onKapat} disabled={!!busy} aria-label="Kapat"
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 22, lineHeight: 1, color: C.muted, cursor: 'pointer', padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          {migration && (
            <div style={{ background: 'rgba(217,48,37,.08)', border: '1px solid rgba(217,48,37,.25)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, color: C.red, fontSize: 12.5, lineHeight: 1.5 }}>
              Gönderim kaydı tablosu yok. <strong>supabase/migrations/2026-11-22_kaldirma_epostalari.sql</strong> dosyasını Supabase SQL Editor&apos;da çalıştırın. O zamana kadar yalnız “Kendime deneme gönder” çalışır (kayıt tutulamadan gerçek gönderim kapalı).
            </div>
          )}
          {tumOncekiler.length > 0 && (
            <div style={{ background: 'rgba(199,119,0,.09)', border: '1px solid rgba(199,119,0,.3)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, color: C.text, fontSize: 12.5, lineHeight: 1.5 }}>
              <strong style={{ color: C.amber }}>Bu kişiye daha önce e-posta gönderildi.</strong> İlk e-postada başka e-posta gönderilmeyeceği yazıyordu; yalnız gerçekten gerekiyorsa tekrar yazın.
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {tumOncekiler.slice(0, 5).map(r => <li key={r.id}>{tarih(r.created_at)} · {sablonAdi(r.sablon)} · “{r.konu}”{r.alici !== hedef.email.toLowerCase() ? ` · ${r.alici}` : ''}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, padding: '4px 20px 16px' }}>
          {/* Sol: şablon + düzenleme */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <div style={etiket}><span>HAZIR ŞABLON</span></div>
            <div role="radiogroup" aria-label="Şablon" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {sablonlar.map(s => {
                const aktif = s.kod === sablon;
                return (
                  <button key={s.kod} role="radio" aria-checked={aktif} onClick={() => sablonSec(s.kod)} disabled={!!busy}
                    style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                      border: `1px solid ${aktif ? C.navy : C.border}`, background: aktif ? 'rgba(26,51,94,.08)' : C.card, color: aktif ? C.navy : C.text }}>
                    {s.ad}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px', lineHeight: 1.5 }}>
              {secili.aciklama}
              {!kontenjanAcik && (secili.kod === 'ozellik' || secili.kod === 'veda') && ' Ücretsiz Pro kontenjanı dolu ya da okunamadı; Pro cümlesi eklenmedi.'}
            </p>

            <label htmlFor="kmp-konu" style={etiket}><span>KONU</span><span style={{ fontWeight: 500, color: konuT.length > S.konuMax ? C.red : C.dim }}>{konuT.length}/{S.konuMax}</span></label>
            <input id="kmp-konu" value={konu} maxLength={S.konuMax + 20} onChange={e => { setKonu(e.target.value); setDuzenlendi(true); }} style={{ ...alan, marginBottom: 12 }} />

            <label htmlFor="kmp-metin" style={etiket}><span>METİN</span><span style={{ fontWeight: 500, color: metinT.length > S.metinMax ? C.red : C.dim }}>{metinT.length}/{S.metinMax}</span></label>
            <textarea id="kmp-metin" value={metin} rows={16} onChange={e => { setMetin(e.target.value); setDuzenlendi(true); }}
              style={{ ...alan, lineHeight: 1.55, resize: 'vertical', minHeight: 220 }} />
            <p style={{ fontSize: 11.5, color: C.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
              Boş satır yeni paragraf, “• ” ile başlayan satır madde olur; bağlantılar tıklanır hâle gelir. En alttaki “bir kez gönderiyoruz” notu her e-postaya kendiliğinden eklenir.
            </p>
          </div>

          {/* Sağ: önizleme (giden e-postayla aynı gövde) */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <div style={etiket}><span>ÖNİZLEME</span></div>
            <div style={{ background: '#F6F8FB', border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 12px', maxHeight: 560, overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1A335E' }}>hekimhane<span style={{ color: '#B8892F' }}>.com.tr</span></div>
              <div style={{ background: '#fff', border: '1px solid #E5E5EA', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 10, paddingBottom: 8, borderBottom: '1px dashed #E5E5EA', overflowWrap: 'anywhere' }}>
                  Konu: <strong style={{ color: C.text }}>{konuT || '—'}</strong>
                </div>
                <h1 style={{ fontSize: 17, color: '#1A335E', margin: '0 0 14px', overflowWrap: 'anywhere' }}>{konuT}</h1>
                {/* epostaGovdesi tüm metni kaçışlar; yalnız kendi ürettiği etiketler HTML'dir */}
                <div style={{ overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: govde }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: 10.5, color: '#9CA3AF', margin: '12px 0 0' }}>Bu e-posta Hekimhane üzerinden gönderildi.</p>
            </div>
          </div>
        </div>

        {/* Alt: durum + düğmeler */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 20px 16px', display: 'grid', gap: 10 }}>
          {durum && (
            <div role="status" style={{ padding: '9px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, background: durum.ok ? 'rgba(30,142,90,.1)' : 'rgba(217,48,37,.1)', color: durum.ok ? C.green : C.red }}>{durum.text}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: C.muted, maxWidth: 460, lineHeight: 1.5 }}>
              Yalnız bu kişiye, tek e-posta gider; yanıtlar sizin adresinize gelir. Toplu ya da otomatik gönderim yok. Gönderim tarih ve şablonla kaydedilir.{' '}
              <button type="button" onClick={retIsaretle} disabled={!!busy || migration}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontWeight: 600, color: C.red, textDecoration: 'underline', cursor: busy || migration ? 'not-allowed' : 'pointer' }}>
                {busy === 'ret' ? 'İşaretleniyor…' : 'Bu kişi e-posta istemiyor'}
              </button>
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => gonder(true)} disabled={!!busy}
                style={{ fontSize: 12.5, fontWeight: 600, padding: '9px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer', fontFamily: 'inherit', opacity: busy ? 0.6 : 1 }}>
                {busy === 'deneme' ? 'Gönderiliyor…' : 'Kendime deneme gönder'}
              </button>
              <button onClick={() => gonder(false)} disabled={!!busy || migration}
                title={migration ? 'Önce gönderim kaydı migration’ını çalıştırın' : undefined}
                style={{ fontSize: 12.5, fontWeight: 600, padding: '9px 16px', borderRadius: 9, border: 'none', background: C.navy, color: 'white', cursor: migration ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: busy || migration ? 0.55 : 1 }}>
                {busy === 'gonder' ? 'Gönderiliyor…' : tumOncekiler.length ? 'Yine de gönder' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
