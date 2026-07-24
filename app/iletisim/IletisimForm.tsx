'use client';
import { useState } from 'react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' };

export default function IletisimForm() {
  const [f, setF] = useState({ ad: '', soyad: '', email: '', tel: '', konu: '', mesaj: '' });
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setHata('Geçerli bir e-posta girin.');
    if (f.mesaj.trim().length < 10) return setHata('Mesajınız en az 10 karakter olmalı.');
    setSaving(true);
    try {
      const res = await fetch('/api/iletisim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, website }),
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
        <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Mesajınız Alındı</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.6 }}>
          En geç 24 saat içinde <strong>{f.email}</strong> adresinden size dönüş yapacağız.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 'clamp(20px, 5vw, 40px)', boxShadow: '0 2px 16px rgba(0,0,0,.04)' }}>
      <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Mesaj Gönderin</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>En geç 24 saat içinde dönüş yapıyoruz.</p>

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

        <div className="form-two-col">
          <div>
            <label style={labelStyle}>E-posta <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="email" value={f.email} onChange={set('email')} placeholder="ornek@mail.com" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telefon <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(isteğe bağlı)</span></label>
            <input type="tel" value={f.tel} onChange={set('tel')} placeholder="05xx xxx xx xx" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Konu</label>
          <select value={f.konu} onChange={set('konu')} style={{ ...inputStyle, background: 'white' }}>
            <option value="">Konu seçin</option>
            <option value="isletme">İşletme Ekleme / Güncelleme</option>
            <option value="hata">Hata Bildirimi</option>
            <option value="sikayet">Yorum / İçerik Şikayeti</option>
            <option value="reklam">Reklam / İş Birliği</option>
            <option value="diger">Diğer</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Mesajınız <span style={{ color: '#EF4444' }}>*</span></label>
          <textarea value={f.mesaj} onChange={set('mesaj')} placeholder="Mesajınızı buraya yazın..." rows={5} required style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {hata && <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{hata}</p>}

        <button type="submit" disabled={saving}
          style={{ padding: '13px 28px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? .7 : 1 }}>
          <i className="fa-solid fa-paper-plane" />
          {saving ? 'Gönderiliyor…' : 'Mesajı Gönder'}
        </button>
      </form>
    </div>
  );
}
