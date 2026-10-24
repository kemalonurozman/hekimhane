'use client';

// Hekimhane Booking başvuru / demo talebi formu — /api/booking-bekleme'ye gönderir.
// Adres #demo ile açılırsa ("Demo talep edin" düğmesi) talep türü demo seçili gelir.
// Stiller app/booking/page.tsx içindeki .oz-form* sınıflarında.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import HkIcon from '@/components/HkIcon';
import { BOOKING_ROLLER, BOOKING_KANALLAR, BOOKING_HACIM } from '@/lib/booking';
import { IL_LISTE } from '@/lib/tr-il-ilce';

export default function BeklemeFormu() {
  const baslangic = useRef(Date.now());
  const [f, setF] = useState({
    ad: '', soyad: '', email: '', tel: '', rol: '', kurum_adi: '', il: '',
    cagri_hacmi: '', mesaj: '', website: '',
  });
  const [talep, setTalep] = useState<'kurulum' | 'demo'>('kurulum');
  const [kanallar, setKanallar] = useState<string[]>(['telefon', 'mesaj']);

  // "Demo talep edin" düğmesi #demo'ya gider → demo seçili gelsin
  useEffect(() => {
    const oku = () => { if (window.location.hash === '#demo') setTalep('demo'); else if (window.location.hash === '#basvuru') setTalep('kurulum'); };
    oku();
    window.addEventListener('hashchange', oku);
    return () => window.removeEventListener('hashchange', oku);
  }, []);
  const [izin, setIzin] = useState(false);
  const [bulten, setBulten] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [sonuc, setSonuc] = useState<null | { tekrar: boolean }>(null);

  const yaz = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(o => ({ ...o, [k]: e.target.value }));
  const kanalDegistir = (id: string) =>
    setKanallar(k => (k.includes(id) ? k.filter(x => x !== id) : [...k, id]));

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    if (!izin) { setHata('Devam etmek için iletişim onayını işaretleyin.'); return; }
    setGonderiliyor(true);
    try {
      const r = await fetch('/api/booking-bekleme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, talep, kanallar, izin, bulten, t: baslangic.current }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Kaydınız alınamadı.');
      setSonuc({ tekrar: !!j.tekrar });
      document.getElementById('basvuru')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kaydınız alınamadı.');
    } finally {
      setGonderiliyor(false);
    }
  }

  if (sonuc) {
    return (
      <div className="oz-form oz-form--tamam" role="status">
        <span className="oz-tamam-ikon"><HkIcon name="success" size={34} /></span>
        <h3>{sonuc.tekrar ? 'Talebinizi güncelledik' : `Teşekkürler${f.ad ? `, ${f.ad}` : ''}!`}</h3>
        <p>
          {sonuc.tekrar
            ? 'Bu e-posta adresiyle daha önce başvuru yapılmıştı; yeni bilgilerinizi kaydettik. Ekibimiz sizi arayacak.'
            : talep === 'demo'
              ? 'Demo talebinizi aldık. Ekibimiz sizi arayıp uygun bir saatte asistanı canlı olarak gösterecek.'
              : 'Başvurunuzu aldık. Ekibimiz kurulum hakkında bilgi vermek ve size yardımcı olmak için kısa süre içinde sizi arayacak.'}
        </p>
        <p className="oz-form__alt">Onay e-postası <strong>{f.email}</strong> adresine gönderildi.</p>
        <Link href="/neden-hekimhane" className="vt-dugme vt-dugme--acik" style={{ marginTop: 8 }}>Hekimhane’nin diğer araçları</Link>
      </div>
    );
  }

  return (
    <form className="oz-form" onSubmit={gonder} noValidate={false}>
      <span className="oz-etiket">Şimdi kullanımda</span>
      <h3 className="oz-form__baslik">Kurulum için sizi arayalım</h3>
      <p className="oz-form__aciklama">Telefon ve mesaj asistanı hazır. Formu doldurun; kurulumu anlatalım ya da canlı demo gösterelim.</p>

      <div className="oz-talep" role="radiogroup" aria-label="Talep türü">
        {([
          { id: 'kurulum', ad: 'Beni arayın', aciklama: 'Kurulum ve fiyat hakkında bilgi', ikon: 'phone' },
          { id: 'demo', ad: 'Demo istiyorum', aciklama: 'Asistanı canlı olarak görün', ikon: 'message' },
        ] as const).map(t => (
          <button key={t.id} type="button" role="radio" aria-checked={talep === t.id} onClick={() => setTalep(t.id)}
            className={talep === t.id ? 'oz-talep__secim is-secili' : 'oz-talep__secim'}>
            <HkIcon name={t.ikon} size={24} color="#12294D" />
            <span><strong>{t.ad}</strong><small>{t.aciklama}</small></span>
          </button>
        ))}
      </div>

      <div className="oz-form__izgara">
        <label className="oz-alan">
          <span>Adınız*</span>
          <input required autoComplete="given-name" value={f.ad} onChange={yaz('ad')} maxLength={60} />
        </label>
        <label className="oz-alan">
          <span>Soyadınız*</span>
          <input required autoComplete="family-name" value={f.soyad} onChange={yaz('soyad')} maxLength={60} />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>E-posta adresiniz*</span>
          <input required type="email" autoComplete="email" inputMode="email" value={f.email} onChange={yaz('email')} maxLength={160} />
        </label>
        <label className="oz-alan">
          <span>Telefon numaranız*</span>
          <input required type="tel" autoComplete="tel" inputMode="tel" placeholder="05xx xxx xx xx" value={f.tel} onChange={yaz('tel')} maxLength={30} />
        </label>
        <label className="oz-alan">
          <span>Kimsiniz?*</span>
          <select required value={f.rol} onChange={yaz('rol')}>
            <option value="" disabled>Seçin</option>
            {BOOKING_ROLLER.map(r => <option key={r.id} value={r.id}>{r.ad}</option>)}
          </select>
        </label>
        <label className="oz-alan">
          <span>Klinik / muayenehane adı</span>
          <input autoComplete="organization" value={f.kurum_adi} onChange={yaz('kurum_adi')} maxLength={160} />
        </label>
        <label className="oz-alan">
          <span>İl</span>
          <select value={f.il} onChange={yaz('il')}>
            <option value="">Seçin</option>
            {IL_LISTE.map(il => <option key={il} value={il}>{il}</option>)}
          </select>
        </label>

        <fieldset className="oz-alan oz-alan--tam oz-kanallar">
          <legend>Hangi kanallarla ilgileniyorsunuz?</legend>
          <div>
            {BOOKING_KANALLAR.map(k => {
              const secili = kanallar.includes(k.id);
              return (
                <button key={k.id} type="button" aria-pressed={secili} onClick={() => kanalDegistir(k.id)}
                  className={secili ? 'oz-kanal is-secili' : 'oz-kanal'}>
                  <span className="oz-kanal__kutu" aria-hidden="true">
                    {secili && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                  </span>
                  <span><strong>{k.ad}</strong><small>{k.aciklama}</small></span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="oz-alan oz-alan--tam">
          <span>Günde yaklaşık kaç çağrı alıyorsunuz?</span>
          <select value={f.cagri_hacmi} onChange={yaz('cagri_hacmi')}>
            <option value="">Seçin</option>
            {BOOKING_HACIM.map(h => <option key={h.id} value={h.id}>{h.ad}</option>)}
          </select>
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>Eklemek istedikleriniz</span>
          <textarea rows={3} value={f.mesaj} onChange={yaz('mesaj')} maxLength={800}
            placeholder="Örneğin kaç hekimle çalıştığınız, en yoğun saatleriniz ya da web siteniz" />
        </label>

        {/* Bot tuzağı — insanlar görmez */}
        <label className="oz-tuzak" aria-hidden="true">
          Web sitesi<input tabIndex={-1} autoComplete="off" value={f.website} onChange={yaz('website')} />
        </label>
      </div>

      <label className="oz-onay">
        <input type="checkbox" checked={izin} onChange={e => setIzin(e.target.checked)} required />
        <span>
          * Hekimhane Booking kurulumu, demo ve fiyat teklifi için benimle telefon ve e-postayla iletişime geçilmesini istiyorum.
          Bilgilerimin <Link href="/kvkk" target="_blank">KVKK Aydınlatma Metni</Link> kapsamında işlenmesini kabul ediyorum.
        </span>
      </label>
      <label className="oz-onay">
        <input type="checkbox" checked={bulten} onChange={e => setBulten(e.target.checked)} />
        <span>Hekimhane’nin hekimlere yönelik yeniliklerini ve e-bültenini almak istiyorum (isteğe bağlı).</span>
      </label>

      {hata && <p className="oz-hata" role="alert">{hata}</p>}

      <button type="submit" className="oz-gonder hk-cta-isik" disabled={gonderiliyor}>
        {gonderiliyor ? 'Gönderiliyor…' : talep === 'demo' ? 'Demo talep et' : 'Beni arayın'}
      </button>
      <p className="oz-form__alt">Bilgileriniz yalnızca Hekimhane Booking kurulumu, demo ve fiyat teklifi için kullanılır.</p>
    </form>
  );
}
