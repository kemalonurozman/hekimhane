'use client';

// Tek form, iki mod:
//  • duzelt → "Bilgileri düzelt" (doktor/yetkili; e-posta zorunlu, kaynak isteğe bağlı)
//  • hatali → "Hatalı bilgi mi gördünüz? Bildirin." (hasta; tek seçim listesi, e-posta isteğe bağlı)
// Metinler uyum belgesinden (lib/uyum.ts). Sağlık bilgisi istenmez.
import { useState } from 'react';
import Link from 'next/link';
import HkIcon from '@/components/HkIcon';
import { BILDIRIM_NOTU, HATALI_BILGI_KONULARI, UYUM_SURE } from '@/lib/uyum';

interface Props { mod: 'duzelt' | 'hatali'; entityId: string; entityType: string; entityName: string; baslangicKonu?: string }

const Tik = () => <span className="kf-tik" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>;

export default function BildirimForm({ mod, entityId, entityType, entityName, baslangicKonu }: Props) {
  const konular = HATALI_BILGI_KONULARI.filter(k => mod === 'duzelt' ? k.v !== 'yorum' : true);
  const [f, setF] = useState({ konu: konular.some(k => k.v === baslangicKonu) ? String(baslangicKonu) : '', aciklama: '', kaynak: '', email: '', ad_soyad: '' });
  const [hatalar, setHatalar] = useState<Partial<Record<keyof typeof f, string>>>({});
  const [saving, setSaving] = useState(false);
  const [hata, setHata] = useState('');
  const [tamam, setTamam] = useState(false);
  const [hp, setHp] = useState('');

  const degis = (k: keyof typeof f) => (v: string) => {
    setF(x => ({ ...x, [k]: v }));
    setHatalar(h => (h[k] ? { ...h, [k]: undefined } : h));
  };
  const cls = (k: keyof typeof f) => 'kf-in' + (hatalar[k] ? ' hata' : f[k].trim() ? ' dolu' : '');

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    const h: typeof hatalar = {};
    if (!f.konu) h.konu = 'Hangi bilgi olduğunu seçin';
    if (f.aciklama.trim().length < 5) h.aciklama = mod === 'duzelt' ? 'Doğru bilgiyi yazın' : 'Kısa bir açıklama yazın';
    const epostaVar = f.email.trim() !== '';
    if ((mod === 'duzelt' || epostaVar) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) h.email = 'Geçerli bir e-posta girin';
    setHatalar(h);
    const ilk = (Object.keys(h) as (keyof typeof f)[])[0];
    if (ilk) { document.getElementById(`bf-${ilk}`)?.focus(); return; }
    setSaving(true); setHata('');
    try {
      const r = await fetch('/api/profil/bildirim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mod, entity_id: entityId, entity_type: entityType, ...f, website: hp }),
      });
      const j = await r.json();
      setSaving(false);
      if (!r.ok) { setHata(j.error || 'Gönderilemedi.'); return; }
      setTamam(true);
    } catch { setSaving(false); setHata('Bağlantı hatası, lütfen tekrar deneyin.'); }
  }

  if (tamam) {
    return (
      <div className="kf-grup__kutu" style={{ padding: 'clamp(28px,5vw,44px) 24px' }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 10, textAlign: 'center' }}>
          <HkIcon name="success" size={56} />
          <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: '#0E1A2C' }}>
            {mod === 'duzelt' ? 'Talebinizi aldık' : 'Bildiriminiz alındı'}
          </h2>
          <p style={{ margin: 0, maxWidth: 440, fontSize: 15, lineHeight: 1.65, color: '#586273' }}>
            {mod === 'duzelt'
              ? <>Düzeltmeler editör kontrolünden sonra en geç {UYUM_SURE.inceleme_is_gunu} iş günü içinde yayına alınır. Sonucu <strong style={{ color: '#0E1A2C' }}>{f.email.trim()}</strong> adresine bildireceğiz.</>
              : <>Teşekkürler. <strong style={{ color: '#0E1A2C' }}>{entityName}</strong> profili için bildiriminiz editörlerimiz tarafından incelenecek.</>}
          </p>
          <Link href="/" className="kf-geri" style={{ marginTop: 10, padding: '10px 18px' }}>Ana sayfa</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} style={{ display: 'block' }} noValidate>
      {mod === 'duzelt' ? (
        <>
          <h1 className="kf-baslik">Bilgileri düzeltin</h1>
          <p className="kf-alt">Profilinizdeki bir bilgi yanlış veya eskiyse bize bildirin. Profili <Link href={`/sahiplen?id=${entityId}&type=${entityType}`} style={{ color: '#12294D', fontWeight: 600 }}>sahiplenirseniz</Link> bilgilerinizi kendiniz de güncelleyebilirsiniz.</p>
        </>
      ) : (
        <>
          <h1 className="kf-baslik">Hatalı bilgi mi gördünüz?</h1>
          <p className="kf-alt"><strong>{entityName}</strong> profilinde yanlış veya güncel olmayan bir bilgi gördüyseniz bize bildirin.</p>
        </>
      )}

      <section className="kf-grup">
        <h2 className="kf-grup__baslik">{mod === 'duzelt' ? 'Düzeltme' : 'Bildirim'}</h2>
        <div className="kf-grup__kutu">
          <div className="kf-alan">
            <label htmlFor="bf-konu">Hangi bilgi<span className="z" aria-hidden="true">*</span></label>
            <select id="bf-konu" className={cls('konu')} value={f.konu} aria-invalid={!!hatalar.konu} onChange={e => degis('konu')(e.target.value)}>
              <option value="">Seçin…</option>
              {konular.map(k => <option key={k.v} value={k.v}>{k.ad}</option>)}
            </select>
            {hatalar.konu && <p className="kf-hata" role="alert">{hatalar.konu}</p>}
          </div>
          <div className="kf-alan">
            <label htmlFor="bf-aciklama">{mod === 'duzelt' ? 'Doğru bilgi' : 'Açıklama'}<span className="z" aria-hidden="true">*</span></label>
            <textarea id="bf-aciklama" rows={4} className={cls('aciklama')} value={f.aciklama} aria-invalid={!!hatalar.aciklama}
              placeholder={mod === 'duzelt' ? 'Olması gereken bilgiyi yazın' : 'Neyin hatalı olduğunu kısaca yazın'}
              onChange={e => degis('aciklama')(e.target.value)} />
            {hatalar.aciklama && <p className="kf-hata" role="alert">{hatalar.aciklama}</p>}
            <p className="kf-not" style={{ margin: '6px 0 0', textAlign: 'left' }}>{BILDIRIM_NOTU}</p>
          </div>
          {mod === 'duzelt' && (
            <div className="kf-alan">
              <label htmlFor="bf-kaynak">Kaynak veya belge<span className="o">isteğe bağlı</span></label>
              <div className="kf-giris">
                <input id="bf-kaynak" className={cls('kaynak')} value={f.kaynak} placeholder="Muayenehane sitesi, hastane sayfası gibi" onChange={e => degis('kaynak')(e.target.value)} />
                <Tik />
              </div>
            </div>
          )}
          <div className="kf-iki">
            <div className="kf-alan">
              <label htmlFor="bf-email">E-posta{mod === 'duzelt' ? <span className="z" aria-hidden="true">*</span> : <span className="o">isteğe bağlı</span>}</label>
              <div className="kf-giris">
                <input id="bf-email" type="email" className={cls('email')} value={f.email} autoComplete="email" placeholder="ornek@email.com" aria-invalid={!!hatalar.email} onChange={e => degis('email')(e.target.value)} />
                <Tik />
              </div>
              {hatalar.email && <p className="kf-hata" role="alert">{hatalar.email}</p>}
              <p className="kf-not" style={{ margin: '6px 0 0', textAlign: 'left' }}>{mod === 'duzelt' ? 'Sonuç bildirimi için.' : 'Yalnızca sonucu bildirmek isterseniz.'}</p>
            </div>
            <div className="kf-alan">
              <label htmlFor="bf-ad_soyad">Ad soyad<span className="o">isteğe bağlı</span></label>
              <div className="kf-giris">
                <input id="bf-ad_soyad" className={cls('ad_soyad')} value={f.ad_soyad} autoComplete="name" placeholder="Adınız Soyadınız" onChange={e => degis('ad_soyad')(e.target.value)} />
                <Tik />
              </div>
            </div>
          </div>
          <input type="text" name="website" value={hp} onChange={e => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
        </div>
      </section>

      {hata && <div className="kf-hatakutu" role="alert"><strong style={{ display: 'block', marginBottom: 2 }}>Gönderim başarısız</strong>{hata}</div>}
      <button type="submit" disabled={saving} className="kf-gonder hk-cta-isik">
        {saving ? 'Gönderiliyor…' : mod === 'duzelt' ? 'Düzeltme talebini gönder' : 'Bildir'}
      </button>
    </form>
  );
}
