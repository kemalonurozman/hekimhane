'use client';

import { useState } from 'react';
import Link from 'next/link';

/** Ad soyadı baş harflere indirir: "Elif Kaya" → "Elif K." — profilde tam ad gösterilmez. */
const kisalt = (ad: string) => {
  const p = ad.trim().split(/\s+/).filter(Boolean);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toLocaleUpperCase('tr')}.` : (p[0] || '');
};

export default function OnayliYorumFormu({ token, varsayilanAd, profil }: { token: string; varsayilanAd: string; profil: string | null }) {
  const [puan, setPuan] = useState(0);
  const [uzerinde, setUzerinde] = useState(0);
  const [metin, setMetin] = useState('');
  const [ad, setAd] = useState(kisalt(varsayilanAd));
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'tamam'>('bos');
  const [hata, setHata] = useState('');

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!puan) { setHata('Lütfen bir puan seçin.'); return; }
    if (metin.trim().length < 10) { setHata('Lütfen deneyiminizi birkaç cümleyle anlatın.'); return; }
    setDurum('gonderiliyor'); setHata('');
    try {
      const r = await fetch('/api/yorum/onayli', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token, rating: puan, text: metin, name: ad }) });
      const d = await r.json();
      if (!r.ok) { setDurum('bos'); setHata(d.error || 'Gönderilemedi.'); return; }
      setDurum('tamam');
    } catch { setDurum('bos'); setHata('Bağlantı hatası, lütfen tekrar deneyin.'); }
  }

  if (durum === 'tamam') {
    return (
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', textAlign: 'center', boxShadow: 'inset 0 0 0 1px #E6E8EC' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: '#0E1A2C' }}>Teşekkürler</div>
        <p style={{ margin: '10px 0 22px', fontSize: 15, lineHeight: 1.6, color: '#586273' }}>Değerlendirmeniz Onaylı hasta işaretiyle yayımlandı.</p>
        {profil && <Link href={profil} className="vt-dugme vt-dugme--koyu">Profile git</Link>}
      </div>
    );
  }
  const goster = uzerinde || puan;
  const etiket = ['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Çok iyi'][goster];
  return (
    <form onSubmit={gonder} style={{ background: '#fff', borderRadius: 24, padding: '28px 26px', boxShadow: 'inset 0 0 0 1px #E6E8EC', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0E1A2C', marginBottom: 10 }}>Puanınız</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onMouseLeave={() => setUzerinde(0)} role="radiogroup" aria-label="Puan">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" role="radio" aria-checked={puan === n} aria-label={`${n} yıldız`}
              onClick={() => { setPuan(n); setHata(''); }} onMouseEnter={() => setUzerinde(n)}
              style={{ padding: 2, border: 0, background: 'none', cursor: 'pointer', lineHeight: 0 }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill={n <= goster ? '#C9A04A' : '#E3E6EC'}><path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" /></svg>
            </button>
          ))}
          <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 600, color: '#586273', minWidth: 70 }}>{etiket}</span>
        </div>
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0E1A2C' }}>Deneyiminiz</span>
        <textarea value={metin} onChange={e => { setMetin(e.target.value); setHata(''); }} rows={5} maxLength={2000}
          placeholder="Karşılanma, bekleme süresi, iletişim, ortam… Ayrıntılı sağlık bilgisi yazmanız gerekmez."
          style={{ padding: '13px 14px', borderRadius: 14, border: '1px solid #DDE3EC', font: 'inherit', fontSize: 15, lineHeight: 1.55, resize: 'vertical', outline: 'none' }} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0E1A2C' }}>Görünecek adınız</span>
        <input value={ad} onChange={e => setAd(e.target.value)} maxLength={60}
          style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid #DDE3EC', font: 'inherit', fontSize: 15, outline: 'none' }} />
        <span style={{ fontSize: 12.5, color: '#8B93A1' }}>Varsayılan olarak adınız ve soyadınızın baş harfi görünür.</span>
      </label>
      {hata && <p role="alert" style={{ margin: 0, fontSize: 13.5, color: '#C0392B' }}>{hata}</p>}
      <button type="submit" disabled={durum === 'gonderiliyor'} className="vt-dugme vt-dugme--koyu" style={{ border: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
        {durum === 'gonderiliyor' ? 'Gönderiliyor…' : 'Değerlendirmeyi gönder'}
      </button>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#8B93A1' }}>
        Göndererek yorumunuzun işletmenin Hekimhane profilinde yayımlanmasını kabul edersiniz. Ayrıntılar: <Link href="/kvkk" style={{ color: '#12294D' }}>KVKK Aydınlatma Metni</Link>.
      </p>
    </form>
  );
}
