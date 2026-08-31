'use client';
import { useState } from 'react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' };

const SEBEPLER = [
  'Artık ihtiyacım yok',
  'Ücreti bana uygun değil',
  'Beklediğim faydayı görmedim',
  'Teknik sorun yaşadım',
  'İşletmemi kapattım / devrettim',
  'Diğer',
];

/**
 * Pro abonelik iptal talebi formu. Stripe Müşteri Portalı'na erişemeyen ya da
 * portalı kullanmak istemeyen abone için ikinci, her zaman çalışan iptal yolu.
 * Kayıt /api/iletisim'e konu='abonelik-iptali' ile gider; admin'e ayrı başlıkla
 * e-posta düşer, aboneye de onay e-postası gönderilir.
 */
export default function AbonelikIptalForm() {
  const [f, setF] = useState({ ad: '', soyad: '', email: '', tel: '', isletme: '', sebep: '', mesaj: '' });
  const [website, setWebsite] = useState(''); // honeypot
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [hata, setHata] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<any>) => setF(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setHata('');
    if (`${f.ad} ${f.soyad}`.trim().length < 3) return setHata('Ad ve soyadınızı girin.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setHata('Aboneliğin kayıtlı olduğu e-posta adresini girin.');
    if (!f.isletme.trim()) return setHata('İşletme adını girin — hangi aboneliğin iptal edileceğini bulabilmemiz için gerekli.');
    setSaving(true);
    try {
      // Mesaj alanı API'de en az 10 karakter ister; sebep + not birleştirilir.
      const mesaj = `İptal sebebi: ${f.sebep || 'Belirtilmedi'}\n\n${f.mesaj.trim() || 'Ek not yok.'}`;
      const res = await fetch('/api/iletisim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, konu: 'abonelik-iptali', mesaj, website }),
      });
      const data = await res.json();
      if (!res.ok) { setHata(data.error || 'Gönderilemedi.'); return; }
      setDone(true);
    } catch {
      setHata('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 'clamp(28px, 6vw, 48px)', boxShadow: '0 2px 16px rgba(0,0,0,.04)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>İptal Talebiniz Alındı</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.7 }}>
          <strong>{f.isletme}</strong> için iptal talebiniz kaydedildi. Talebiniz <strong>1 iş günü</strong> içinde işleme alınır ve
          iptal tamamlandığında <strong>{f.email}</strong> adresine bilgi e-postası gönderilir.
          Aboneliğiniz, ödemesi yapılmış dönemin sonuna kadar açık kalır; sonrasında yeni ödeme alınmaz.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 'clamp(20px, 5vw, 40px)', boxShadow: '0 2px 16px rgba(0,0,0,.04)' }}>
      <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>İptal Talep Formu</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
        Formu doldurun; talebinizi 1 iş günü içinde işleme alıp size e-posta ile dönelim.
      </p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Honeypot */}
        <input type="text" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

        <div className="form-two-col">
          <div>
            <label style={labelStyle}>Adınız <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={f.ad} onChange={set('ad')} placeholder="Adınızı girin" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Soyadınız <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={f.soyad} onChange={set('soyad')} placeholder="Soyadınızı girin" required style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>İşletme adı <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="text" value={f.isletme} onChange={set('isletme')} placeholder="Aboneliğin bağlı olduğu klinik / işletme adı" required style={inputStyle} />
        </div>

        <div className="form-two-col">
          <div>
            <label style={labelStyle}>Kayıtlı e-posta <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="email" value={f.email} onChange={set('email')} placeholder="Panele giriş yaptığınız e-posta" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telefon <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(isteğe bağlı)</span></label>
            <input type="tel" value={f.tel} onChange={set('tel')} placeholder="05xx xxx xx xx" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>İptal sebebiniz <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(isteğe bağlı)</span></label>
          <select value={f.sebep} onChange={set('sebep')} style={{ ...inputStyle, background: 'white' }}>
            <option value="">Sebep seçin</option>
            {SEBEPLER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Eklemek istedikleriniz <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(isteğe bağlı)</span></label>
          <textarea value={f.mesaj} onChange={set('mesaj')} placeholder="Varsa iletmek istediğiniz detayı yazın..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {hata && <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{hata}</p>}

        <button type="submit" disabled={saving}
          style={{ padding: '13px 28px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? .7 : 1, fontFamily: 'inherit' }}>
          <i className="fa-solid fa-paper-plane" />
          {saving ? 'Gönderiliyor…' : 'İptal Talebini Gönder'}
        </button>
      </form>
    </div>
  );
}
