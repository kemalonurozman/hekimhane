'use client';

// Footer bülten kaydı — e-posta + AÇIK izin kutusu (ticari elektronik ileti onayı).
// İzin işaretlenmeden kayıt yapılmaz; onay metni Aydınlatma Metni'ne bağlanır.
import { useState } from 'react';
import Link from 'next/link';

export default function FooterBulten() {
  const [email, setEmail] = useState('');
  const [izin, setIzin] = useState(false);
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'tamam' | 'kayitli'>('bos');
  const [hata, setHata] = useState('');

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setHata('Geçerli bir e-posta girin.'); return; }
    if (!izin) { setHata('Lütfen e-posta izni kutusunu işaretleyin.'); return; }
    setDurum('gonderiliyor'); setHata('');
    try {
      const r = await fetch('/api/abone', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), tip: 'hasta', kaynak: 'footer', izin: true }) });
      const d = await r.json();
      if (d.already) setDurum('kayitli');
      else if (d.ok) setDurum('tamam');
      else { setDurum('bos'); setHata(d.error || 'Kayıt yapılamadı.'); }
    } catch { setDurum('bos'); setHata('Bağlantı hatası.'); }
  }

  if (durum === 'tamam' || durum === 'kayitli') {
    return <p style={{ margin: '14px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--on-deep-heading)' }}>
      {durum === 'tamam' ? 'Kaydınız alındı, teşekkürler.' : 'Bu e-posta zaten kayıtlı.'}
    </p>;
  }
  return (
    <form onSubmit={gonder} noValidate>
      <div className="hk-footer__bulten">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setHata(''); }} placeholder="E-posta adresiniz" aria-label="E-posta adresiniz" />
        <button type="submit" disabled={durum === 'gonderiliyor'}>{durum === 'gonderiliyor' ? 'Kaydediliyor…' : 'Abone ol'}</button>
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 12, lineHeight: 1.5, color: 'var(--on-deep)', opacity: .85, cursor: 'pointer' }}>
        <input type="checkbox" checked={izin} onChange={e => { setIzin(e.target.checked); setHata(''); }} style={{ marginTop: 2, flexShrink: 0 }} />
        <span>Hekimhane&apos;den e-posta ile bilgilendirme almayı kabul ediyorum; dilediğim an vazgeçebilirim. <Link href="/kvkk" style={{ color: 'var(--on-deep-heading)', textDecoration: 'underline' }}>Aydınlatma Metni</Link></span>
      </label>
      {hata && <p role="alert" style={{ margin: '8px 0 0', fontSize: 12.5, color: '#FFB4AB' }}>{hata}</p>}
    </form>
  );
}
