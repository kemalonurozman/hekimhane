'use client';

// Admin › Deneme Hesabı — kurulum/sıfırlama, gönderilecek giriş bağlantısı ve profil adresi.
// Kurallar: lib/demo.ts · sunucu: /api/admin/demo (lib/demo-sunucu.ts).
import { useEffect, useState } from 'react';
import { C, YUZEY } from './tema';
import { DEMO_AD } from '@/lib/demo';

interface Durum { kurulu: boolean; profilUrl: string; girisUrl: string | null; sonSifirlama: string | null }

const tarihYaz = (t: string | null) => {
  if (!t) return '—';
  try { return new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(t)); }
  catch { return t; }
};

function KopyaSatiri({ etiket, deger, aciklama }: { etiket: string; deger: string; aciklama: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  return (
    <div style={{ padding: '14px 0', borderTop: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{etiket}</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>{aciklama}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input readOnly value={deger} onFocus={e => e.currentTarget.select()}
          style={{ flex: '1 1 260px', minWidth: 0, fontSize: 13, padding: '9px 11px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.soft, color: C.text, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }} />
        <button onClick={async () => { try { await navigator.clipboard.writeText(deger); setKopyalandi(true); setTimeout(() => setKopyalandi(false), 1800); } catch { /* seçili kalır */ } }}
          style={{ fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.navy, cursor: 'pointer' }}>
          {kopyalandi ? 'Kopyalandı' : 'Kopyala'}
        </button>
        <a href={deger} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.navy, textDecoration: 'none' }}>Aç</a>
      </div>
    </div>
  );
}

export default function DenemeHesabiTab() {
  const [durum, setDurum] = useState<Durum | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [uyarilar, setUyarilar] = useState<string[]>([]);
  const [calisiyor, setCalisiyor] = useState<null | 'kur' | 'yeni-baglanti'>(null);

  const yukle = async () => {
    setHata(null);
    try {
      const r = await fetch('/api/admin/demo', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Okunamadı');
      setDurum(j);
    } catch (e: any) { setHata(e?.message || 'Okunamadı'); }
  };
  useEffect(() => { yukle(); }, []);

  const calistir = async (islem: 'kur' | 'yeni-baglanti') => {
    if (islem === 'yeni-baglanti' && !confirm('Yeni bağlantı oluşturulsun mu? Daha önce gönderdiğiniz bağlantı çalışmaz hâle gelir.')) return;
    if (islem === 'kur' && durum?.kurulu && !confirm('Deneme hesabı örnek hâline döndürülsün mü? Ziyaretçilerin yaptığı değişiklikler silinir.')) return;
    setCalisiyor(islem); setHata(null); setUyarilar([]);
    try {
      const r = await fetch('/api/admin/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ islem }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'İşlem yapılamadı');
      setDurum(j.durum); setUyarilar(j.uyarilar || []);
    } catch (e: any) { setHata(e?.message || 'İşlem yapılamadı'); }
    setCalisiyor(null);
  };

  const dugme = (birincil: boolean): React.CSSProperties => ({
    fontSize: 13.5, fontWeight: 600, padding: '10px 16px', borderRadius: 10, cursor: calisiyor ? 'wait' : 'pointer',
    border: birincil ? 'none' : `1px solid ${C.border}`, background: birincil ? C.navy : C.card, color: birincil ? '#fff' : C.navy,
    opacity: calisiyor ? .6 : 1,
  });

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.3px', color: C.text, margin: '0 0 6px' }}>Deneme Hesabı</h1>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 20px', lineHeight: 1.6 }}>
        <strong style={{ color: C.text }}>{DEMO_AD}</strong> · Ankara / Çankaya — gerçek olmadığını söyleyen bir diş kliniği profili ve ona bağlı panel.
        Listelerde, aramada, site haritasında ve Google&apos;da görünmez. Panelin denemesini görmek isteyene aşağıdaki giriş bağlantısını gönderin; şifre gerekmez.
      </p>

      {hata && <div role="alert" style={{ ...YUZEY.kart, borderColor: '#F5C9C2', background: '#FFF4F2', color: C.red, padding: '12px 14px', fontSize: 13.5, marginBottom: 14 }}>{hata}</div>}
      {uyarilar.length > 0 && (
        <div style={{ ...YUZEY.kart, background: '#FFF8E6', borderColor: '#F1DFAE', color: '#6B5418', padding: '12px 14px', fontSize: 13, marginBottom: 14, lineHeight: 1.55 }}>
          {uyarilar.map(u => <div key={u}>{u}</div>)}
        </div>
      )}

      <div style={{ ...YUZEY.kart, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
            background: durum?.kurulu ? 'rgba(30,142,90,.10)' : C.soft, color: durum?.kurulu ? C.green : C.muted }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: durum?.kurulu ? C.green : C.dim }} />
            {durum === null && !hata ? 'Okunuyor…' : durum?.kurulu ? 'Kurulu' : 'Kurulmadı'}
          </span>
          {durum?.kurulu && <span style={{ fontSize: 12.5, color: C.muted }}>Son sıfırlama: {tarihYaz(durum.sonSifirlama)} · her gece 03:00&apos;te kendiliğinden sıfırlanır</span>}
        </div>

        {durum?.kurulu && durum.girisUrl && (
          <KopyaSatiri etiket="Panel giriş bağlantısı (gönderilecek)" deger={durum.girisUrl}
            aciklama="Bağlantıyı açan kişi deneme paneline şifresiz girer. Yayıldığını düşünürseniz “Yeni bağlantı” ile eskisini geçersiz kılın." />
        )}
        {durum?.kurulu && (
          <KopyaSatiri etiket="Deneme profil sayfası" deger={durum.profilUrl}
            aciklama="Ziyaretçinin gördüğü profil. Üstünde “Bu bir deneme profilidir” bandı vardır; randevu formu çalışır ama kimseye bildirim gitmez." />
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: durum?.kurulu ? `1px solid ${C.border}` : undefined }}>
          <button disabled={!!calisiyor} onClick={() => calistir('kur')} style={dugme(true)}>
            {calisiyor === 'kur' ? 'Hazırlanıyor…' : durum?.kurulu ? 'Şimdi sıfırla' : 'Deneme hesabını kur'}
          </button>
          {durum?.kurulu && (
            <button disabled={!!calisiyor} onClick={() => calistir('yeni-baglanti')} style={dugme(false)}>
              {calisiyor === 'yeni-baglanti' ? 'Oluşturuluyor…' : 'Yeni bağlantı oluştur'}
            </button>
          )}
        </div>
      </div>

      <div style={{ ...YUZEY.kart, padding: '16px 20px', marginTop: 14 }}>
        <div style={{ ...YUZEY.bolumBasligi, marginBottom: 8 }}>Deneme hesabında kapalı olanlar</div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
          E-posta gönderme (hasta maili, yorum daveti), ödeme ve abonelik, yönetici/asistan daveti, fotoğraf ve dosya yükleme, makale gönderme, yapay zekâ asistanı ve MCP anahtarı,
          sahipliği bırakma. Profilde ad, telefon, adres, bağlantılar ve görseller değiştirilemez. Örnek kayıtlarda hasta e-postası yoktur; deneme profiline yorum alınmaz.
        </p>
      </div>
    </div>
  );
}
