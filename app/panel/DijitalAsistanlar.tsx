'use client';

// Panel → Dijital Asistanlar: E-posta Asistanı, Randevu Talebi Asistanı, Soru-Cevap.
// İçerik Ozvelo'da yaşar; bu sayfalar /api/panel/ozvelo/ozet ile anlık özet gösterir
// (Hekimhane saklamaz) ve ayrıntı için "Ozvelo'da aç" ile ilgili Ozvelo ekranına
// şifresiz geçirir. Ortak "Ozvelo'ya giriş" düğmesi ve profil formundaki bilgi notu da burada.
import { useCallback, useEffect, useId, useState } from 'react';

const NAVY = '#1A335E', MUTED = '#6E6E73', BORDER = '#E5E5EA', TEXT = '#1D1D1F', GREEN = '#166534', RED = '#B42318';

export type OzveloHedef = 'genel' | 'gelen-kutusu' | 'eposta' | 'randevular' | 'soru-cevap' | 'bildirimler' | 'asistan';
export type BaglantiDurum = 'bekliyor' | 'aktif' | 'hata' | 'kapali';

const kart: React.CSSProperties = { background: 'white', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 22px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,.05)' };
export const dugmeStili = (birincil = true): React.CSSProperties => ({
  padding: '11px 18px', borderRadius: 12, border: birincil ? 'none' : `1px solid ${BORDER}`,
  background: birincil ? NAVY : 'white', color: birincil ? 'white' : NAVY,
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
});
const zaman = (s: string | null) => s ? new Date(s).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

/* ── Asistan durumu (panel menüsü, profil notu, sayfalar ortak) ───── */

export interface AsistanDurumu { acik: boolean; uygun: boolean; durum: BaglantiDurum | null; son_basari_at: string | null }

export function useAsistanDurumu(entityId: string | null | undefined, tazele: unknown = 0) {
  const [d, setD] = useState<AsistanDurumu | null>(null);
  useEffect(() => {
    let iptal = false;
    if (!entityId) { setD(null); return; }
    fetch(`/api/panel/ozvelo?entity_id=${encodeURIComponent(entityId)}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(j => { if (!iptal) setD(j ? { acik: !!j.acik, uygun: !!j.uygun, durum: j.baglanti?.durum ?? null, son_basari_at: j.baglanti?.son_basari_at ?? null } : null); })
      .catch(() => { if (!iptal) setD(null); });
    return () => { iptal = true; };
  }, [entityId, tazele]);
  return d;
}

/* ── Ozvelo markası ──────────────────────────────────────────────
   Simge Ozvelo'nun kendi çizimi (Ozvelo.com/ozvelo → components/brand.tsx Mark), renkleri değiştirilmez.
   Yatay logo: public/brand/ozvelo-lockup.svg (Ozvelo'nun sitesindeki dosyanın aynısı). */

export function OzveloIsaret({ boyut = 18 }: { boyut?: number }) {
  const id = `oz-g-${useId().replace(/:/g, '')}`;
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b4dff" /><stop offset="1" stopColor="#9a5cff" /></linearGradient></defs>
      <rect width="32" height="32" rx="7.2" fill={`url(#${id})`} />
      <path d="M22.40 16.28A6.8 6.8 0 1 1 15.72 9.60" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="20.41" cy="11.59" r="2.8" fill="#7ff0d6" />
    </svg>
  );
}

export function OzveloLogo({ yukseklik = 24 }: { yukseklik?: number }) {
  const genislik = Math.round(yukseklik * 5.01); // logo oranı 4189 : 836
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/ozvelo-lockup.svg" alt="Ozvelo" width={genislik} height={yukseklik} draggable={false} style={{ width: genislik, height: yukseklik, display: 'block' }} />;
}

/* ── "Ozvelo'ya giriş yap" ───────────────────────────────────────── */

/**
 * Hekimi şifre sormadan Ozvelo'daki ilgili ekrana geçirir (yeni sekme).
 * Sekme tıklama anında açılır: istek beklenip sonra açılsa açılır pencere engelleyicisi durdururdu.
 */
export function OzveloyaGit({ entityId, hedef = 'genel', etiket = "Ozvelo'ya giriş yap", birincil = true, devreDisi = false }: {
  entityId: string; hedef?: OzveloHedef; etiket?: string; birincil?: boolean; devreDisi?: boolean;
}) {
  const [calisiyor, setCalisiyor] = useState(false);
  const [hata, setHata] = useState('');
  async function git() {
    const sekme = window.open('about:blank', '_blank');
    setCalisiyor(true); setHata('');
    try {
      const r = await fetch('/api/panel/ozvelo/gecis', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity_id: entityId, hedef }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.url) { if (sekme) sekme.location.href = j.url; else window.location.href = j.url; }
      else { sekme?.close(); setHata(j.error || "Ozvelo'ya geçilemedi."); }
    } catch { sekme?.close(); setHata('Bağlantı hatası. Lütfen tekrar deneyin.'); }
    setCalisiyor(false);
  }
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      <button type="button" onClick={git} disabled={calisiyor || devreDisi}
        style={{ ...dugmeStili(birincil), display: 'inline-flex', alignItems: 'center', gap: 8, opacity: devreDisi ? 0.5 : 1, cursor: devreDisi ? 'not-allowed' : 'pointer' }}>
        <OzveloIsaret boyut={18} />
        {calisiyor ? 'Açılıyor…' : etiket}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
      </button>
      {hata && <span role="alert" style={{ fontSize: 12.5, color: RED }}>{hata}</span>}
    </span>
  );
}

/* ── Profil formundaki not: "bu bilgiler asistanınızı bilgilendirir" ──
   Yalnız doğru olduğu durumda söylenir: asistan açıksa "bilgilendirir", kapalıysa
   "açarsanız bilgilendirir"; bağlantı hiç kurulmamışsa (yakında) not çıkmaz. */

export function AsistanBilgiNotu({ entityId, tazele, onAsistanaGit }: { entityId: string; tazele?: unknown; onAsistanaGit: () => void }) {
  const d = useAsistanDurumu(entityId, tazele);
  if (!d || !d.acik || !d.uygun) return null;
  const etkin = d.durum && d.durum !== 'kapali';
  const sorun = d.durum === 'hata' || d.durum === 'bekliyor';
  return (
    <div role="note" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', margin: '14px 0 18px', padding: '12px 16px', borderRadius: 14, background: etkin ? '#F3F7FD' : '#FAFAFB', border: `1px solid ${etkin ? '#D6E2F3' : BORDER}` }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z" /><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z" />
      </svg>
      <div style={{ flex: '1 1 240px', minWidth: 0, fontSize: 13.5, lineHeight: 1.55, color: '#334155' }}>
        {etkin ? (
          <>
            <strong style={{ color: TEXT }}>Bu bilgiler yapay zekâ asistanınızı doğrudan bilgilendirir.</strong>{' '}
            Kaydettiğinizde Ozvelo&apos;daki asistanınız da güncellenir; hastalara verdiği yanıtlar buradaki bilgilere dayanır.
            {sorun
              ? <span style={{ display: 'block', marginTop: 4, color: RED }}>Son değişiklikler asistanınıza henüz ulaşmadı; kendiliğinden yeniden denenecek.</span>
              : d.son_basari_at && <span style={{ display: 'block', marginTop: 4, color: MUTED, fontSize: 12.5 }}>Asistanınız en son {zaman(d.son_basari_at)} tarihinde güncellendi.</span>}
          </>
        ) : (
          <>Yapay zekâ asistanını açarsanız bu sayfadaki bilgiler asistanınızı da bilgilendirir; hastalarınızın sorularını bu bilgilerle yanıtlar.</>
        )}
      </div>
      <button type="button" onClick={onAsistanaGit} style={{ ...dugmeStili(false), padding: '8px 14px', fontSize: 13 }}>
        {etkin ? 'Asistana git' : 'Asistanı aç'}
      </button>
    </div>
  );
}

/* ── Bölüm sayfaları ─────────────────────────────────────────────── */

export type Bolum = 'eposta' | 'randevu' | 'sss';

interface Ozet {
  kanallar: { site: boolean; eposta: boolean; whatsapp_bildirim: boolean };
  eposta: { bekleyen_taslak: number; yanitlanan_7g: number; son: { konu: string; kimden: string; tarih: string | null; durum: string }[] };
  randevu: { bekleyen: number; son_7g: number; son: { kisi: string; zaman: string | null; durum: string; kanal: string }[] };
  sss: { toplam: number; ornekler: { soru: string; cevap: string }[] };
  guncellendi_at: string | null;
}

const BOLUM: Record<Bolum, { baslik: string; ozet: string; maddeler: string[]; hedef: OzveloHedef; acEtiket: string }> = {
  eposta: {
    baslik: 'E-posta Asistanı',
    ozet: 'Muayenehanenize gelen e-postalar tek gelen kutusunda toplanır. Asistan her biri için yanıt taslağı hazırlar; siz onaylayınca gönderilir.',
    maddeler: ['Gelen e-postalar Ozvelo gelen kutusunda toplanır', 'Asistan, profil bilgilerinize göre yanıt taslağı hazırlar', 'Siz onaylamadan hiçbir yanıt gönderilmez'],
    hedef: 'eposta',
    acEtiket: "E-postaları Ozvelo'da aç",
  },
  randevu: {
    baslik: 'Randevu Talebi Asistanı',
    ozet: 'Hastalar web sitenizdeki sohbetten ya da e-postayla uygun saati seçip talep bırakır. Her yeni talep WhatsApp ve e-postayla size bildirilir.',
    maddeler: ['Hasta, çalışma saatlerinize göre uygun saati seçer', 'Yeni talep anında WhatsApp ve e-postanıza düşer', 'Talebi tek dokunuşla onaylar ya da reddedersiniz', 'Asistanın aldığı talepler Randevu Talepleri sekmesinde de görünür'],
    hedef: 'randevular',
    acEtiket: "Randevuları Ozvelo'da aç",
  },
  sss: {
    baslik: 'Soru-Cevap Bilgi Tabanı',
    ozet: 'Ücret politikası, otopark, hangi sigortaların geçtiği gibi sık sorulan soruların yanıtlarını bir kez yazarsınız; asistan her seferinde aynı tutarlı yanıtı verir.',
    maddeler: ['Ad, uzmanlık, adres ve çalışma saatleri profilinizden kendiliğinden gelir', 'Burada yalnız ek sorularınızı yazarsınız', 'Asistan tıbbi tavsiye vermez, teşhis koymaz; bu soruları size yönlendirir'],
    hedef: 'soru-cevap',
    acEtiket: "Soru-cevapları Ozvelo'da düzenle",
  },
};

const ROZET: Record<string, { metin: string; bg: string; fg: string }> = {
  'bekliyor': { metin: 'Bekliyor', bg: '#FFF8E6', fg: '#8A6100' },
  'taslak-hazir': { metin: 'Taslak hazır', bg: '#EFF4FB', fg: NAVY },
  'yanitlandi': { metin: 'Yanıtlandı', bg: '#F0FDF4', fg: GREEN },
  'insana-aktarildi': { metin: 'Size aktarıldı', bg: '#FEF3F2', fg: RED },
  'onaylandi': { metin: 'Onaylandı', bg: '#F0FDF4', fg: GREEN },
  'reddedildi': { metin: 'Reddedildi', bg: '#F1F1F4', fg: MUTED },
  'iptal': { metin: 'İptal', bg: '#F1F1F4', fg: MUTED },
  'tamamlandi': { metin: 'Tamamlandı', bg: '#F0FDF4', fg: GREEN },
};
const Rozet = ({ d }: { d: string }) => {
  const r = ROZET[d] || ROZET.bekliyor;
  return <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: r.bg, color: r.fg, whiteSpace: 'nowrap' }}>{r.metin}</span>;
};

function Sayac({ sayi, etiket }: { sayi: number; etiket: string }) {
  return (
    <div style={{ flex: '1 1 160px', padding: '14px 16px', borderRadius: 14, background: '#F7F8FA', border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{sayi}</div>
      <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{etiket}</div>
    </div>
  );
}

function Satir({ sol, alt, sag }: { sol: string; alt: string; sag: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sol}</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{alt}</div>
      </div>
      {sag}
    </div>
  );
}

export function AsistanBolumuTab({ bolum, aktifIsletme, onGit }: {
  bolum: Bolum;
  aktifIsletme: { id: string; ad: string } | null;
  onGit: (sekme: 'yzasistan' | 'randevu') => void;
}) {
  const b = BOLUM[bolum];
  const durum = useAsistanDurumu(aktifIsletme?.id);
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [ozetDurum, setOzetDurum] = useState<'yukleniyor' | 'tamam' | 'ulasilamadi' | 'etkin-degil' | 'kapali'>('yukleniyor');

  const yukle = useCallback(async () => {
    if (!aktifIsletme) return;
    setOzetDurum('yukleniyor');
    try {
      const r = await fetch(`/api/panel/ozvelo/ozet?entity_id=${encodeURIComponent(aktifIsletme.id)}`, { cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (j.durum === 'tamam') { setOzet(j.ozet); setOzetDurum('tamam'); }
      else setOzetDurum(j.durum === 'etkin-degil' || j.durum === 'kapali' ? j.durum : 'ulasilamadi');
    } catch { setOzetDurum('ulasilamadi'); }
  }, [aktifIsletme]);

  const aktif = durum?.durum === 'aktif';
  useEffect(() => { if (aktif) yukle(); }, [aktif, yukle]);

  const ust = (
    <>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.6px' }}>{b.baslik}</h1>
      <p style={{ fontSize: 14, color: MUTED, margin: '6px 0 16px', lineHeight: 1.6 }}>{b.ozet}</p>
    </>
  );

  if (!aktifIsletme) return <div style={{ maxWidth: 820 }}>{ust}<div style={kart}>Önce bir klinik ya da hekim profilini sahiplenin.</div></div>;
  if (!durum) return <div style={{ maxWidth: 820 }}>{ust}<div style={{ ...kart, textAlign: 'center', color: MUTED }}>Yükleniyor…</div></div>;

  // Asistan kapalı: ne işe yaradığını anlat, kurulum sayfasına götür (çıkmaz sokak yok)
  if (!aktif) {
    return (
      <div style={{ maxWidth: 820 }}>
        {ust}
        <div style={kart}>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13.5, color: '#475569', lineHeight: 1.75 }}>
            {b.maddeler.map(m => <li key={m}>{m}</li>)}
          </ul>
          <p style={{ fontSize: 13.5, color: TEXT, margin: '0 0 14px', lineHeight: 1.6 }}>
            {durum.durum === 'bekliyor' || durum.durum === 'hata'
              ? <><strong>{aktifIsletme.ad}</strong> için asistan hazırlanıyor. Hazır olduğunda bu sayfa dolar.</>
              : <>Bu asistan, <strong>{aktifIsletme.ad}</strong> için yapay zekâ asistanı açıldığında çalışır.</>}
          </p>
          <button type="button" style={dugmeStili()} onClick={() => onGit('yzasistan')}>Yapay Zekâ Asistanı&apos;na git</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820 }}>
      {ust}

      <div style={{ ...kart, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Ayrıntılar ve ayarlar Ozvelo&apos;da</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.55 }}>
            Aşağıdaki bilgiler Ozvelo&apos;daki asistanınızdan anlık alınır. Yanıtlamak, onaylamak ve ayar yapmak için Ozvelo&apos;ya şifresiz geçin.
          </div>
        </div>
        <OzveloyaGit entityId={aktifIsletme.id} hedef={b.hedef} etiket={b.acEtiket} />
      </div>

      {ozetDurum === 'yukleniyor' && <div style={{ ...kart, textAlign: 'center', color: MUTED }}>Ozvelo&apos;dan alınıyor…</div>}
      {ozetDurum === 'ulasilamadi' && (
        <div style={{ ...kart, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: '#475569' }}>Bilgiler şu an Ozvelo&apos;dan alınamadı. Ozvelo&apos;da açarak görebilirsiniz.</span>
          <button type="button" style={{ ...dugmeStili(false), padding: '8px 14px', fontSize: 13 }} onClick={yukle}>Tekrar dene</button>
        </div>
      )}

      {ozetDurum === 'tamam' && ozet && bolum === 'eposta' && (
        <>
          {!ozet.kanallar.eposta && (
            <div style={{ ...kart, background: '#FFFBF0', borderColor: '#F1DFAF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, color: '#5B4A1E', flex: '1 1 260px' }}>E-posta adresiniz henüz bağlanmadı. Bağladığınızda gelen e-postalar burada görünür.</span>
              <OzveloyaGit entityId={aktifIsletme.id} hedef="eposta" etiket="E-postamı bağla" birincil={false} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <Sayac sayi={ozet.eposta.bekleyen_taslak} etiket="Onayınızı bekleyen yanıt" />
            <Sayac sayi={ozet.eposta.yanitlanan_7g} etiket="Son 7 günde yanıtlanan" />
          </div>
          <div style={kart}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Son e-postalar</div>
            {ozet.eposta.son.length
              ? ozet.eposta.son.map((e, i) => <Satir key={i} sol={e.konu} alt={`${e.kimden} · ${zaman(e.tarih)}`} sag={<Rozet d={e.durum} />} />)
              : <div style={{ fontSize: 13.5, color: MUTED, paddingTop: 6 }}>Henüz e-posta yok.</div>}
          </div>
        </>
      )}

      {ozetDurum === 'tamam' && ozet && bolum === 'randevu' && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <Sayac sayi={ozet.randevu.bekleyen} etiket="Onayınızı bekleyen talep" />
            <Sayac sayi={ozet.randevu.son_7g} etiket="Son 7 günde gelen talep" />
          </div>
          <div style={kart}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Asistanın aldığı son talepler</div>
            {ozet.randevu.son.length
              ? ozet.randevu.son.map((t, i) => <Satir key={i} sol={t.kisi} alt={`${t.zaman ? zaman(t.zaman) : 'Saat belirtilmedi'} · ${t.kanal}`} sag={<Rozet d={t.durum} />} />)
              : <div style={{ fontSize: 13.5, color: MUTED, paddingTop: 6 }}>Henüz talep yok.</div>}
          </div>
          <div style={{ ...kart, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13.5, color: '#475569', flex: '1 1 260px', lineHeight: 1.55 }}>
              WhatsApp bildirimi: <strong style={{ color: ozet.kanallar.whatsapp_bildirim ? GREEN : RED }}>{ozet.kanallar.whatsapp_bildirim ? 'açık' : 'kapalı'}</strong>.
              {' '}Asistanın aldığı talepler Hekimhane&apos;deki Randevu Talepleri sekmesinde de listelenir.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!ozet.kanallar.whatsapp_bildirim && <OzveloyaGit entityId={aktifIsletme.id} hedef="bildirimler" etiket="Bildirimi aç" birincil={false} />}
              <button type="button" style={dugmeStili(false)} onClick={() => onGit('randevu')}>Randevu Talepleri</button>
            </div>
          </div>
        </>
      )}

      {ozetDurum === 'tamam' && ozet && bolum === 'sss' && (
        <div style={kart}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Asistanınızın bildiği ek sorular</div>
            <div style={{ fontSize: 13, color: MUTED }}>{ozet.sss.toplam} soru</div>
          </div>
          {ozet.sss.ornekler.length
            ? ozet.sss.ornekler.map((q, i) => (
              <div key={i} style={{ padding: '11px 0', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{q.soru}</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 3, lineHeight: 1.55 }}>{q.cevap}</div>
              </div>
            ))
            : <div style={{ fontSize: 13.5, color: MUTED, paddingTop: 6 }}>Henüz ek soru eklemediniz. Asistanınız şimdilik profil bilgilerinizle yanıt veriyor.</div>}
          <p style={{ fontSize: 12.5, color: MUTED, margin: '12px 0 0', lineHeight: 1.55 }}>
            Ad, uzmanlık, adres ve çalışma saatlerini burada değil, Profilimi Düzenle&apos;de değiştirin; asistanınız oradan güncellenir.
          </p>
        </div>
      )}

      {ozetDurum === 'tamam' && ozet?.guncellendi_at && (
        <div style={{ fontSize: 12, color: MUTED }}>Ozvelo verisi: {zaman(ozet.guncellendi_at)}</div>
      )}
    </div>
  );
}
