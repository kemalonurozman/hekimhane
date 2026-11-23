'use client';

// Panel → Yapay Zekâ Asistanı. Hekimhane profil bilgileriyle çalışan, Ozvelo altyapılı asistan:
// etkinleştirme (açık aktarım onayıyla), eşitleme durumu, sitenize ekleme kodu, Ozvelo'ya şifresiz geçiş.
// Sunucu: /api/panel/ozvelo (+ /gecis). Bağlantı ayarları yoksa sekme "yakında" der.
import { useCallback, useEffect, useState } from 'react';
import { OzveloLogo, OzveloyaGit } from './DijitalAsistanlar';

const NAVY = '#1A335E', MUTED = '#6E6E73', BORDER = '#E5E5EA', TEXT = '#1D1D1F', GREEN = '#166534';

type Durum = 'bekliyor' | 'aktif' | 'hata' | 'kapali';
interface Gorunum {
  durum: Durum;
  son_basari_at: string | null;
  hata: string | null;
  sonraki_deneme_at: string | null;
  widget_kodu: string | null;
}
interface Yanit { acik: boolean; uygun: boolean; tabloVar?: boolean; tur?: 'klinik' | 'doktor'; baglanti: Gorunum | null }

const kart: React.CSSProperties = { background: 'white', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 22px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,.05)' };
const dugme = (birincil = true): React.CSSProperties => ({
  padding: '11px 18px', borderRadius: 12, border: birincil ? 'none' : `1px solid ${BORDER}`,
  background: birincil ? NAVY : 'white', color: birincil ? 'white' : NAVY,
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
});
const zaman = (s: string | null) => s ? new Date(s).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const ROZET: Record<Durum, { metin: string; bg: string; fg: string }> = {
  aktif:    { metin: 'Çalışıyor',      bg: '#F0FDF4', fg: GREEN },
  bekliyor: { metin: 'Hazırlanıyor',   bg: '#EFF4FB', fg: NAVY },
  hata:     { metin: 'Eşitlenemedi',   bg: '#FEF3F2', fg: '#B42318' },
  kapali:   { metin: 'Kapalı',         bg: '#F1F1F4', fg: MUTED },
};

const AKTARILAN = ['Ad, unvan ve uzmanlık', 'Hizmetler ve baktığınız hastalıklar', 'Şehir, ilçe, adres ve harita konumu', 'Telefon, WhatsApp ve web sitesi (iletişimi gizliyse gönderilmez)', 'Çalışma saatleri, diller, tanıtım ve eğitim', 'Profil fotoğrafları', 'Hesabınızın açılacağı e-posta adresi'];

function Kopyala({ metin }: { metin: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" style={{ ...dugme(false), padding: '8px 14px', fontSize: 13, color: ok ? GREEN : NAVY }}
      onClick={() => { try { navigator.clipboard.writeText(metin); setOk(true); setTimeout(() => setOk(false), 1800); } catch {} }}>
      {ok ? 'Kopyalandı' : 'Kodu kopyala'}
    </button>
  );
}

export type DijitalSekme = 'epostaasistan' | 'randevuasistan' | 'sssasistan';
const DIJITAL: { sekme: DijitalSekme; ad: string; aciklama: string }[] = [
  { sekme: 'epostaasistan', ad: 'E-posta Asistanı', aciklama: 'Gelen e-postalara yanıt taslağı hazırlar, siz onaylarsınız.' },
  { sekme: 'randevuasistan', ad: 'Randevu Talebi Asistanı', aciklama: 'Hastalar uygun saati seçer, talep WhatsApp ve e-postanıza düşer.' },
  { sekme: 'sssasistan', ad: 'Soru-Cevap Bilgi Tabanı', aciklama: 'Sık sorulan sorulara bir kez yazdığınız yanıtı verir.' },
];

export default function YapayZekaAsistaniTab({ aktifIsletme, onGit }: { aktifIsletme: { id: string; ad: string; tur: string } | null; onGit: (sekme: DijitalSekme | 'edit') => void }) {
  const [yanit, setYanit] = useState<Yanit | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [calisiyor, setCalisiyor] = useState<string | null>(null);
  const [onay, setOnay] = useState(false);
  const [mesaj, setMesaj] = useState<{ tur: 'hata' | 'bilgi'; metin: string } | null>(null);

  const yukle = useCallback(async () => {
    if (!aktifIsletme) { setYukleniyor(false); return; }
    setYukleniyor(true);
    try {
      const r = await fetch(`/api/panel/ozvelo?entity_id=${encodeURIComponent(aktifIsletme.id)}`, { cache: 'no-store' });
      setYanit(r.ok ? await r.json() : null);
    } catch { setYanit(null); }
    setYukleniyor(false);
  }, [aktifIsletme]);

  useEffect(() => { yukle(); }, [yukle]);

  async function islem(ad: 'etkinlestir' | 'esitle' | 'kapat') {
    if (!aktifIsletme) return;
    if (ad === 'kapat' && !window.confirm('Asistan kapatılsın mı? Sitenizdeki konuşma düğmesi çalışmayı bırakır; istediğiniz zaman yeniden açabilirsiniz.')) return;
    setCalisiyor(ad); setMesaj(null);
    try {
      const r = await fetch('/api/panel/ozvelo', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entity_id: aktifIsletme.id, islem: ad, onay: ad === 'etkinlestir' ? onay : undefined }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setMesaj({ tur: 'hata', metin: j.error || 'İşlem yapılamadı.' });
      else {
        if (j.uyari) setMesaj({ tur: 'hata', metin: `Bilgileriniz şu an gönderilemedi, birazdan kendiliğinden yeniden denenecek. (${j.uyari})` });
        else if (ad === 'esitle') setMesaj({ tur: 'bilgi', metin: 'Bilgileriniz asistanınıza gönderildi.' });
        setYanit(y => y ? { ...y, baglanti: j.baglanti } : y);
      }
    } catch { setMesaj({ tur: 'hata', metin: 'Bağlantı hatası. Lütfen tekrar deneyin.' }); }
    setCalisiyor(null);
  }

  const b = yanit?.baglanti || null;
  const etkin = !!b && b.durum !== 'kapali';

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: TEXT, margin: 0, letterSpacing: '-0.3px' }}>Yapay Zekâ Asistanı</h1>
        {b && !yukleniyor && (
          <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: ROZET[b.durum].bg, color: ROZET[b.durum].fg }}>{ROZET[b.durum].metin}</span>
        )}
      </div>
      <p style={{ fontSize: 14, color: MUTED, margin: '6px 0 16px', lineHeight: 1.6 }}>
        Hekimhane profilinizdeki bilgilerle çalışan asistan. Web sitenizde hastalarınızı karşılar, sorularını sizin bilgilerinizle yanıtlar ve randevu taleplerini size iletir. Profilinizi güncellediğinizde asistan da güncellenir.
      </p>

      {mesaj && (
        <div role={mesaj.tur === 'hata' ? 'alert' : 'status'} style={{ ...kart, padding: '12px 16px', background: mesaj.tur === 'hata' ? '#FEF3F2' : '#F0FDF4', borderColor: mesaj.tur === 'hata' ? '#FECDCA' : '#BBF7D0', color: mesaj.tur === 'hata' ? '#B42318' : GREEN, fontSize: 13.5 }}>
          {mesaj.metin}
        </div>
      )}

      {!aktifIsletme ? (
        <div style={kart}>Önce bir işletme profilini sahiplenin; asistan onaylı profiller için açılır.</div>
      ) : yukleniyor ? (
        <div style={{ ...kart, textAlign: 'center', color: MUTED }}>Yükleniyor…</div>
      ) : !yanit ? (
        <div style={kart}>Durum okunamadı. Sayfayı yenileyip tekrar deneyin.</div>
      ) : !yanit.uygun ? (
        <div style={kart}>
          <strong style={{ color: TEXT }}>{aktifIsletme.ad}</strong> için asistan şu an açılamıyor. Asistan klinik ve hekim profillerinde, profilin sahibi ya da yöneticisi tarafından açılır.
        </div>
      ) : !yanit.acik ? (
        <div style={{ ...kart, background: 'linear-gradient(135deg,#F5F8FF 0%,#FFFFFF 70%)', borderColor: '#DCE5F5' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Çok yakında</div>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.65, margin: '0 0 14px' }}>
            Asistanı bu sekmeden tek tıkla açabileceksiniz. Hazır olduğunda size haber vermemizi isterseniz demo talebi bırakın.
          </p>
          <a href="/booking#demo" style={{ ...dugme(), display: 'inline-block', textDecoration: 'none' }}>Demo talep edin</a>
        </div>
      ) : yanit.tabloVar === false ? (
        <div style={kart}>Asistan altyapısı kuruluyor. Kısa süre sonra tekrar deneyin.</div>
      ) : !etkin ? (
        <div style={kart}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{aktifIsletme.ad} için asistanı açın</div>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
            Asistan altyapısını Ozvelo sağlar. Açtığınızda aşağıdaki profil bilgileri Ozvelo&apos;ya aktarılır ve sizin adınıza bir Ozvelo hesabı oluşturulur. Hasta bilgileri, yorumlar ve ödeme bilgileri aktarılmaz.
          </p>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
            {AKTARILAN.map(m => <li key={m}>{m}</li>)}
          </ul>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 0 14px' }}>
            Asistan yapay zekâ olduğunu söyler, tıbbi tavsiye vermez ve teşhis koymaz. Ayrıntılar: <a href="/aydinlatma/profesyoneller" target="_blank" rel="noopener" style={{ color: NAVY, fontWeight: 600 }}>Aydınlatma metni</a>.
          </p>
          <div style={{ fontSize: 13.5, color: TEXT, fontWeight: 600, margin: '0 0 6px' }}>Açtığınızda Dijital Asistanlar altında şunlar çalışır:</div>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
            <li>Web sitenizde 7/24 sohbet</li>
            {DIJITAL.map(d => <li key={d.sekme}>{d.ad}: {d.aciklama.charAt(0).toLocaleLowerCase('tr-TR') + d.aciklama.slice(1)}</li>)}
          </ul>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: TEXT, lineHeight: 1.5, cursor: 'pointer', marginBottom: 14 }}>
            <input type="checkbox" checked={onay} onChange={e => setOnay(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }} />
            Yukarıdaki profil bilgilerimin asistan hizmeti için Ozvelo&apos;ya aktarılmasını onaylıyorum.
          </label>
          <button type="button" disabled={!onay || !!calisiyor} onClick={() => islem('etkinlestir')}
            style={{ ...dugme(), opacity: !onay || calisiyor ? 0.5 : 1, cursor: !onay || calisiyor ? 'not-allowed' : 'pointer' }}>
            {calisiyor === 'etkinlestir' ? 'Açılıyor…' : 'Asistanı aç'}
          </button>
        </div>
      ) : (
        <>
          <div style={kart}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{aktifIsletme.ad}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  {b!.durum === 'aktif' && <>Bilgileriniz son olarak {zaman(b!.son_basari_at)} tarihinde gönderildi.</>}
                  {b!.durum === 'bekliyor' && <>Bilgileriniz asistanınıza gönderiliyor.</>}
                  {b!.durum === 'hata' && <>Son gönderim başarısız oldu{b!.sonraki_deneme_at ? `; ${zaman(b!.sonraki_deneme_at)} civarı yeniden denenecek` : ''}.</>}
                </div>
                {b!.durum === 'hata' && b!.hata && <div style={{ fontSize: 12.5, color: '#B42318', marginTop: 4 }}>{b!.hata}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" style={dugme(false)} disabled={!!calisiyor} onClick={() => islem('esitle')}>
                  {calisiyor === 'esitle' ? 'Gönderiliyor…' : 'Şimdi eşitle'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ ...kart, background: 'linear-gradient(135deg,#F5F8FF 0%,#FFFFFF 70%)', borderColor: '#DCE5F5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                <OzveloLogo yukseklik={26} />
                <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginTop: 12 }}>Ozvelo&apos;ya giriş</div>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: '4px 0 0' }}>
                  Asistanınız Ozvelo altyapısında çalışır. Konuşmalar, e-postalar, randevu onayları, soru-cevaplar, karşılama cümlesi ve bildirim ayarları Ozvelo&apos;dadır. Bu düğme sizi şifre sormadan Ozvelo&apos;ya geçirir.
                </p>
              </div>
              <OzveloyaGit entityId={aktifIsletme.id} hedef="genel" devreDisi={b!.durum !== 'aktif'} />
            </div>
            <p style={{ fontSize: 12.5, color: MUTED, margin: '12px 0 0', lineHeight: 1.6 }}>
              Ad, uzmanlık, adres ve çalışma saatlerini Ozvelo&apos;da değil, <button type="button" onClick={() => onGit('edit')} style={{ background: 'none', border: 'none', padding: 0, color: NAVY, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>Profilimi Düzenle</button>&apos;de değiştirin: bu bilgiler asistanınızı doğrudan bilgilendirir.
            </p>
          </div>

          <div style={kart}>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Dijital asistanlarınız</div>
            {DIJITAL.map(d => (
              <div key={d.sekme} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{d.ad}</div>
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{d.aciklama}</div>
                </div>
                <button type="button" onClick={() => onGit(d.sekme)} style={{ ...dugme(false), padding: '7px 13px', fontSize: 13 }}>Aç</button>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0 0', borderTop: `1px solid ${BORDER}`, opacity: 0.6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Instagram, Facebook ve LinkedIn</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Mesajlarınız aynı gelen kutusunda.</div>
              </div>
              <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: '#F1F1F4', color: MUTED }}>Yakında</span>
            </div>
          </div>

          <div style={kart}>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Sitenize ekleyin</div>
            {b!.widget_kodu ? (
              <>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: '0 0 10px' }}>
                  Bu satırı web sitenizin &lt;/body&gt; etiketinden hemen önce yapıştırın. Bir kez eklemeniz yeterli; sonraki değişiklikler kendiliğinden gelir.
                </p>
                <pre style={{ margin: '0 0 10px', padding: '12px 14px', borderRadius: 12, background: '#0F1B2D', color: '#E2E8F0', fontSize: 12.5, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{b!.widget_kodu}</pre>
                <Kopyala metin={b!.widget_kodu} />
              </>
            ) : (
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                Kodunuz asistan hazır olduğunda burada görünür.
              </p>
            )}
          </div>

          <button type="button" onClick={() => islem('kapat')} disabled={!!calisiyor}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: 13, textDecoration: 'underline', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}>
            {calisiyor === 'kapat' ? 'Kapatılıyor…' : 'Asistanı kapat'}
          </button>
        </>
      )}
    </div>
  );
}
