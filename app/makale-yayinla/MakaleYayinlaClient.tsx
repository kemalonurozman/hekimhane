'use client';

// /makale-yayinla formları — sipariş (proforma) ve soru. Tanıtım bölümleri page.tsx'te
// (özellik sayfası dili). Form durumu, doğrulama ve /api/makale-talebi çağrıları değişmedi;
// yalnız görünüm oz-form / oz-alan sınıflarına taşındı (app/globals.css → "Özellik sayfası dili").
import { useState } from 'react';
import HkIcon from '@/components/HkIcon';

const IPUCU: React.CSSProperties = { fontSize: 12.5, color: '#6E6E73', marginTop: -2 };
const GRUP: React.CSSProperties = { display: 'block', margin: '0 0 14px' };

/* ═══════════════════════════════════════════════
   SİPARİŞ FORMU
═══════════════════════════════════════════════ */
export function SiparisFormu() {
  const [f, setF] = useState({
    konu: '', website: '',
    firma: '', ad_soyad: '', email: '', tel: '',
    vkn: '', vergi_dairesi: '', adres: '', il: '', posta_kodu: '',
    not: '',
  });
  const [hp, setHp] = useState('');            // honeypot
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  const S = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.konu.trim() || !f.firma.trim() || !f.ad_soyad.trim() || !f.email.trim() || !f.vkn.trim() || !f.adres.trim() || !f.il.trim()) {
      setErr('Lütfen yıldızlı (*) alanların tümünü doldurun.');
      return;
    }
    setSending(true); setErr('');
    try {
      const res = await fetch('/api/makale-talebi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip: 'siparis', ...f, hp }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Sunucu hatası');
      setOk(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  if (ok) return (
    <div className="oz-form oz-form--tamam" role="status">
      <span className="oz-tamam-ikon"><HkIcon name="success" size={34} /></span>
      <h3>Siparişiniz alındı</h3>
      <p>
        Proforma faturanızı en geç <strong>1 iş günü içinde</strong> {f.email} adresine göndereceğiz.
        Ödeme havale/EFT ile yapılır; ödeme sonrası makale hazırlığına başlanır.
      </p>
    </div>
  );

  return (
    <form onSubmit={submit} className="oz-form">
      <span className="oz-etiket">Proforma fatura</span>
      <h3 className="oz-form__baslik">Sipariş formu</h3>
      <p className="oz-form__aciklama">Yıldızlı (*) alanlar zorunludur.</p>

      <span className="vt-ustyazi" style={GRUP}>Makale bilgileri</span>
      <div className="oz-form__izgara">
        <label className="oz-alan oz-alan--tam">
          <span>Makale konusu / başlığı *</span>
          <input value={f.konu} onChange={e => S('konu', e.target.value)}
            placeholder="Örn. İmplant tedavisinde iyileşme süreci" required />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>Bağlantı verilecek web sitesi</span>
          <input value={f.website} onChange={e => S('website', e.target.value)}
            placeholder="https://www.klinigim.com" />
          <small style={IPUCU}>Makale metnine en fazla 3 harici bağlantı eklenir — fiyata dahildir.</small>
        </label>
      </div>

      <span className="vt-ustyazi" style={{ ...GRUP, marginTop: 26 }}>Fatura bilgileri</span>
      <div className="oz-form__izgara">
        <label className="oz-alan oz-alan--tam">
          <span>Firma / Klinik ünvanı *</span>
          <input value={f.firma} onChange={e => S('firma', e.target.value)}
            placeholder="Örn. Beyaz Diş Ağız ve Diş Sağlığı Polikliniği" required />
        </label>
        <label className="oz-alan">
          <span>Yetkili ad soyad *</span>
          <input value={f.ad_soyad} onChange={e => S('ad_soyad', e.target.value)}
            placeholder="Ahmet Yılmaz" required />
        </label>
        <label className="oz-alan">
          <span>E-posta *</span>
          <input type="email" value={f.email} onChange={e => S('email', e.target.value)}
            placeholder="fatura@klinigim.com" required />
        </label>
        <label className="oz-alan">
          <span>Telefon *</span>
          <input type="tel" value={f.tel} onChange={e => S('tel', e.target.value)}
            placeholder="0532 000 00 00" required />
        </label>
        <label className="oz-alan">
          <span>VKN / TCKN *</span>
          <input value={f.vkn} onChange={e => S('vkn', e.target.value)}
            placeholder="1234567890" required />
        </label>
        <label className="oz-alan">
          <span>Vergi dairesi</span>
          <input value={f.vergi_dairesi} onChange={e => S('vergi_dairesi', e.target.value)}
            placeholder="Kadıköy" />
        </label>
        <label className="oz-alan">
          <span>Posta kodu</span>
          <input value={f.posta_kodu} onChange={e => S('posta_kodu', e.target.value)}
            placeholder="34710" />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>Adres *</span>
          <input value={f.adres} onChange={e => S('adres', e.target.value)}
            placeholder="Bağdat Cad. No: 112/2" required />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>İl *</span>
          <input value={f.il} onChange={e => S('il', e.target.value)}
            placeholder="İstanbul" required />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>Not (isteğe bağlı)</span>
          <textarea rows={3} value={f.not} onChange={e => S('not', e.target.value)}
            placeholder="Metni siz mi hazırlayacaksınız, biz mi yazalım? Varsa özel isteklerinizi yazın." />
        </label>
      </div>

      {/* Honeypot — gerçek kullanıcı doldurmaz */}
      <div className="oz-tuzak" aria-hidden="true">
        <label>Bu alanı boş bırakın</label>
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      {err && <p className="oz-hata" role="alert">{err}</p>}

      <button type="submit" className="oz-gonder hk-cta-isik" disabled={sending}>
        {sending ? 'Gönderiliyor…' : 'Sipariş ver ve proforma fatura al'}
      </button>
      <p className="oz-form__alt">
        Gönderdikten sonra e-posta ile proforma fatura alırsınız. Ödeme banka havalesi ile yapılır.
        Sipariş, ödeme tamamlanana kadar sizi bağlamaz.
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   SORU FORMU
═══════════════════════════════════════════════ */
export function SoruFormu() {
  const [f, setF] = useState({ ad_soyad: '', email: '', firma: '', mesaj: '' });
  const [hp, setHp] = useState('');
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const S = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.ad_soyad.trim() || !f.email.trim() || f.mesaj.trim().length < 10) {
      setErr('Ad soyad, e-posta ve en az 10 karakterlik bir mesaj gerekli.');
      return;
    }
    setSending(true); setErr('');
    try {
      const res = await fetch('/api/makale-talebi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip: 'soru', ...f, hp }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Sunucu hatası');
      setOk(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  // Açık zeminde: koyu bant gölgesi yerine ince çerçeve
  const KART: React.CSSProperties = { boxShadow: 'inset 0 0 0 1px #E6E8EC, 0 30px 60px -40px rgba(18,41,77,.35)' };

  if (ok) return (
    <div className="oz-form oz-form--tamam" role="status" style={KART}>
      <span className="oz-tamam-ikon"><HkIcon name="success" size={34} /></span>
      <h3>Sorunuz iletildi</h3>
      <p>24 saat içinde size dönüş yapacağız.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="oz-form" style={KART}>
      <div className="oz-form__izgara">
        <label className="oz-alan">
          <span>Ad soyad *</span>
          <input value={f.ad_soyad} onChange={e => S('ad_soyad', e.target.value)} placeholder="Ahmet Yılmaz" required />
        </label>
        <label className="oz-alan">
          <span>E-posta *</span>
          <input type="email" value={f.email} onChange={e => S('email', e.target.value)} placeholder="ahmet@klinigim.com" required />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>Firma / Klinik</span>
          <input value={f.firma} onChange={e => S('firma', e.target.value)} placeholder="Firma veya klinik adı" />
        </label>
        <label className="oz-alan oz-alan--tam">
          <span>Mesaj *</span>
          <textarea rows={4} value={f.mesaj} onChange={e => S('mesaj', e.target.value)}
            placeholder="Makalenin konusu hakkında bilgi verin veya aklınıza takılan soruyu sorun…" required />
        </label>
      </div>

      <div className="oz-tuzak" aria-hidden="true">
        <label>Bu alanı boş bırakın</label>
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      {err && <p className="oz-hata" role="alert">{err}</p>}
      <button type="submit" className="oz-gonder hk-cta-isik" disabled={sending}>
        {sending ? 'Gönderiliyor…' : 'Sorumu gönder'}
      </button>
    </form>
  );
}
