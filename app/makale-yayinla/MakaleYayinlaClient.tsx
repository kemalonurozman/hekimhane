'use client';

import { useState } from 'react';
import { MAKALE_FIYAT, KDV_ORANI, KDV_TUTAR, TOPLAM, PAKET_ICERIK, tl } from '@/lib/makale-fiyat';

/* ── İkonlar (emoji yok, hepsi inline SVG) ── */
const IcoLink = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IcoTarget = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IcoBadge = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" />
  </svg>
);
const IcoInfinity = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round">
    <path d="M6.5 8.5a3.5 3.5 0 1 0 0 7c2.5 0 3.5-3.5 5.5-3.5s3 3.5 5.5 3.5a3.5 3.5 0 1 0 0-7c-2.5 0-3.5 3.5-5.5 3.5S9 8.5 6.5 8.5z" />
  </svg>
);
const Check = ({ c = '#059669' }: { c?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ═══════════════════════════════════════════════
   SİPARİŞ FORMU
═══════════════════════════════════════════════ */
function SiparisFormu() {
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
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div className="mky-ok-circle">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1C2B4A', marginBottom: 10 }}>Siparişiniz alındı</h3>
      <p style={{ fontSize: 14.5, color: '#6E6E73', lineHeight: 1.75, maxWidth: 400, margin: '0 auto' }}>
        Proforma faturanızı en geç <strong>1 iş günü içinde</strong> {f.email} adresine göndereceğiz.
        Ödeme havale/EFT ile yapılır; ödeme sonrası makale hazırlığına başlanır.
      </p>
    </div>
  );

  return (
    <form onSubmit={submit} className="mky-form">
      <div className="mky-fieldset-title">Makale bilgileri</div>
      <div className="mky-grid">
        <div className="mky-full">
          <label className="mky-lbl">Makale konusu / başlığı *</label>
          <input className="mky-inp" value={f.konu} onChange={e => S('konu', e.target.value)}
            placeholder="Örn. İmplant tedavisinde iyileşme süreci" required />
        </div>
        <div className="mky-full">
          <label className="mky-lbl">Bağlantı verilecek web sitesi</label>
          <input className="mky-inp" value={f.website} onChange={e => S('website', e.target.value)}
            placeholder="https://www.klinigim.com" />
          <div className="mky-hint">Makale metnine en fazla 3 harici bağlantı eklenir — fiyata dahildir.</div>
        </div>
      </div>

      <div className="mky-fieldset-title" style={{ marginTop: 22 }}>Fatura bilgileri</div>
      <div className="mky-grid">
        <div className="mky-full">
          <label className="mky-lbl">Firma / Klinik ünvanı *</label>
          <input className="mky-inp" value={f.firma} onChange={e => S('firma', e.target.value)}
            placeholder="Örn. Beyaz Diş Ağız ve Diş Sağlığı Polikliniği" required />
        </div>
        <div>
          <label className="mky-lbl">Yetkili ad soyad *</label>
          <input className="mky-inp" value={f.ad_soyad} onChange={e => S('ad_soyad', e.target.value)}
            placeholder="Ahmet Yılmaz" required />
        </div>
        <div>
          <label className="mky-lbl">E-posta *</label>
          <input className="mky-inp" type="email" value={f.email} onChange={e => S('email', e.target.value)}
            placeholder="fatura@klinigim.com" required />
        </div>
        <div>
          <label className="mky-lbl">Telefon *</label>
          <input className="mky-inp" type="tel" value={f.tel} onChange={e => S('tel', e.target.value)}
            placeholder="0532 000 00 00" required />
        </div>
        <div>
          <label className="mky-lbl">VKN / TCKN *</label>
          <input className="mky-inp" value={f.vkn} onChange={e => S('vkn', e.target.value)}
            placeholder="1234567890" required />
        </div>
        <div>
          <label className="mky-lbl">Vergi dairesi</label>
          <input className="mky-inp" value={f.vergi_dairesi} onChange={e => S('vergi_dairesi', e.target.value)}
            placeholder="Kadıköy" />
        </div>
        <div>
          <label className="mky-lbl">Posta kodu</label>
          <input className="mky-inp" value={f.posta_kodu} onChange={e => S('posta_kodu', e.target.value)}
            placeholder="34710" />
        </div>
        <div className="mky-full">
          <label className="mky-lbl">Adres *</label>
          <input className="mky-inp" value={f.adres} onChange={e => S('adres', e.target.value)}
            placeholder="Bağdat Cad. No: 112/2" required />
        </div>
        <div className="mky-full">
          <label className="mky-lbl">İl *</label>
          <input className="mky-inp" value={f.il} onChange={e => S('il', e.target.value)}
            placeholder="İstanbul" required />
        </div>
        <div className="mky-full">
          <label className="mky-lbl">Not (isteğe bağlı)</label>
          <textarea className="mky-inp" rows={3} value={f.not} onChange={e => S('not', e.target.value)}
            placeholder="Metni siz mi hazırlayacaksınız, biz mi yazalım? Varsa özel isteklerinizi yazın." />
        </div>
      </div>

      {/* Honeypot — gerçek kullanıcı doldurmaz */}
      <div style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label>Bu alanı boş bırakın</label>
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      {err && <div className="mky-err">{err}</div>}

      <button type="submit" className="mky-submit" disabled={sending}>
        {sending ? 'Gönderiliyor…' : 'Sipariş ver ve proforma fatura al'}
      </button>
      <p className="mky-legal">
        Gönderdikten sonra e-posta ile proforma fatura alırsınız. Ödeme banka havalesi ile yapılır.
        Sipariş, ödeme tamamlanana kadar sizi bağlamaz.
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   SORU FORMU
═══════════════════════════════════════════════ */
function SoruFormu() {
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

  if (ok) return (
    <div style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div className="mky-ok-circle">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h3 style={{ fontSize: 19, fontWeight: 800, color: '#1C2B4A', marginBottom: 8 }}>Sorunuz iletildi</h3>
      <p style={{ fontSize: 14, color: '#6E6E73', lineHeight: 1.7 }}>24 saat içinde size dönüş yapacağız.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="mky-form">
      <div className="mky-grid">
        <div>
          <label className="mky-lbl">Ad soyad *</label>
          <input className="mky-inp" value={f.ad_soyad} onChange={e => S('ad_soyad', e.target.value)} placeholder="Ahmet Yılmaz" required />
        </div>
        <div>
          <label className="mky-lbl">E-posta *</label>
          <input className="mky-inp" type="email" value={f.email} onChange={e => S('email', e.target.value)} placeholder="ahmet@klinigim.com" required />
        </div>
        <div className="mky-full">
          <label className="mky-lbl">Firma / Klinik</label>
          <input className="mky-inp" value={f.firma} onChange={e => S('firma', e.target.value)} placeholder="Firma veya klinik adı" />
        </div>
        <div className="mky-full">
          <label className="mky-lbl">Mesaj *</label>
          <textarea className="mky-inp" rows={4} value={f.mesaj} onChange={e => S('mesaj', e.target.value)}
            placeholder="Makalenin konusu hakkında bilgi verin veya aklınıza takılan soruyu sorun…" required />
        </div>
      </div>

      <div style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label>Bu alanı boş bırakın</label>
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      {err && <div className="mky-err">{err}</div>}
      <button type="submit" className="mky-submit" disabled={sending}>
        {sending ? 'Gönderiliyor…' : 'Sorumu gönder'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   ANA SAYFA
═══════════════════════════════════════════════ */
export default function MakaleYayinlaClient({
  klinikSayisi, hekimSayisi, makaleSayisi, aylikZiyaretci,
}: {
  klinikSayisi: number; hekimSayisi: number; makaleSayisi: number; aylikZiyaretci: string;
}) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nedenler = [
    { ico: IcoLink,     baslik: 'SEO bağlantıları',    metin: 'Makale metnine en fazla 3 harici bağlantı ekleyebilirsiniz. Sitenizin otoritesini ve organik trafiğini artırın.' },
    { ico: IcoTarget,   baslik: 'Doğru hedef kitle',   metin: 'Hekimhane ziyaretçileri diş hekimi, klinik ve tedavi arayan hastalar — yani tam olarak sizin hedef kitleniz.' },
    { ico: IcoBadge,    baslik: 'Profesyonel sunum',   metin: 'İçeriğiniz güvenilir bir sağlık rehberi bağlamında, şeffaf biçimde etiketlenerek yayımlanır.' },
    { ico: IcoInfinity, baslik: 'Kalıcı yayın',        metin: 'Makale sitede kalıcı olarak kalır. Tek seferlik ödeme, aylık ücret yok.' },
  ];

  const adimlar = [
    { n: 1, t: 'Bize ulaşın',       m: 'Aşağıdaki formu doldurun veya info@hekimhane.com.tr adresine yazın. Konuyu ve isteklerinizi iletin.' },
    { n: 2, t: 'İçerik hazırlığı',  m: 'Metni siz gönderirsiniz ya da biz yazarız. Düzen, görsel ve bağlantıları biz ekleriz.' },
    { n: 3, t: 'İnceleme ve yayın', m: 'Editör ekibimiz makaleyi inceler ve yayımlar. İş ortağı içeriği olarak şeffafça işaretlenir.' },
    { n: 4, t: 'Öne çıkarma',       m: 'Makale ana sayfada, blog bölümünde ve ilgili uzmanlık sayfalarında öne çıkarılır — fiyata dahil.' },
  ];

  const dahil = PAKET_ICERIK;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #FBF8F2; }
        .mky-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

        .mky-hero { background: linear-gradient(135deg, #0F2348 0%, #1B3A69 60%, #0D3B5E 100%); color: white; padding: 76px 0 68px; text-align: center; }
        .mky-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(212,168,67,.18); border: 1px solid rgba(212,168,67,.35); border-radius: 50px; padding: 5px 16px; font-size: 11.5px; font-weight: 700; color: #D4A843; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 22px; }
        .mky-h1 { font-size: clamp(28px,5vw,50px); font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 18px; }
        .mky-sub { font-size: clamp(15px,2vw,18px); color: rgba(255,255,255,.72); line-height: 1.7; max-width: 560px; margin: 0 auto 34px; }
        .mky-cta { display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; background: linear-gradient(135deg,#D4A843,#B8860B); color: white; border-radius: 14px; font-size: 16px; font-weight: 800; border: none; cursor: pointer; font-family: inherit; transition: opacity .2s, transform .15s; box-shadow: 0 4px 20px rgba(212,168,67,.4); }
        .mky-cta:hover { opacity: .92; transform: translateY(-1px); }
        .mky-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 700px; margin: 46px auto 0; }
        .mky-stat-n { font-size: clamp(24px,3.6vw,34px); font-weight: 900; color: #D4A843; letter-spacing: -1px; }
        .mky-stat-l { font-size: 12.5px; color: rgba(255,255,255,.6); margin-top: 4px; letter-spacing: .3px; }

        .mky-section { padding: 72px 0; }
        .mky-section-white { background: white; border-top: 1px solid #E5E5EA; border-bottom: 1px solid #E5E5EA; }
        .mky-title { font-size: clamp(22px,4vw,34px); font-weight: 900; color: #1C2B4A; letter-spacing: -0.8px; text-align: center; }
        .mky-subtitle { font-size: 15px; color: #6E6E73; text-align: center; margin-top: 10px; }

        .mky-neden-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 22px; margin-top: 40px; }
        .mky-card { background: white; border-radius: 18px; border: 1px solid #E5E5EA; padding: 26px 22px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
        .mky-card-ico { width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg,#EFF6FF,#DBEAFE); display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
        .mky-card-t { font-size: 16px; font-weight: 800; color: #1C2B4A; margin-bottom: 8px; letter-spacing: -.2px; }
        .mky-card-m { font-size: 13.5px; color: #6E6E73; line-height: 1.7; }

        .mky-steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-top: 40px; }
        .mky-step { text-align: center; padding: 0 10px; }
        .mky-step-n { width: 44px; height: 44px; border-radius: 50%; background: #1B3A69; color: white; font-size: 17px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .mky-step-t { font-size: 14.5px; font-weight: 800; color: #1C2B4A; margin-bottom: 6px; }
        .mky-step-m { font-size: 13px; color: #6E6E73; line-height: 1.65; }

        .mky-price-wrap { max-width: 620px; margin: 40px auto 0; }
        .mky-price-card { background: white; border: 2px solid #1B3A69; border-radius: 22px; padding: 34px 32px; box-shadow: 0 8px 32px rgba(27,58,105,.10); position: relative; }
        .mky-price-tag { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,#D4A843,#B8860B); color: white; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 6px 18px; border-radius: 50px; white-space: nowrap; }
        .mky-price-name { font-size: 19px; font-weight: 900; color: #1C2B4A; text-align: center; letter-spacing: -.4px; }
        .mky-price-desc { font-size: 13.5px; color: #6E6E73; text-align: center; line-height: 1.7; margin-top: 8px; }
        .mky-price-big { font-size: 46px; font-weight: 900; color: #1B3A69; letter-spacing: -2px; text-align: center; margin-top: 20px; line-height: 1; }
        .mky-price-kdv { font-size: 13px; color: #6E6E73; text-align: center; margin-top: 8px; }
        .mky-price-list { list-style: none; padding: 0; margin: 26px 0 0; border-top: 1px solid #E5E5EA; padding-top: 22px; }
        .mky-price-list li { display: flex; gap: 10px; font-size: 14px; color: #3A3A3C; line-height: 1.6; margin-bottom: 11px; }
        .mky-price-note { font-size: 12.5px; color: #6E6E73; text-align: center; margin-top: 22px; line-height: 1.6; }

        .mky-preview { max-width: 680px; margin: 40px auto 0; background: white; border: 1px solid #E5E5EA; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.05); }
        .mky-preview-bar { background: #F5F5F7; border-bottom: 1px solid #E5E5EA; padding: 10px 16px; display: flex; align-items: center; gap: 6px; }
        .mky-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mky-preview-body { padding: 28px 30px 32px; }
        .mky-partner-strip { background: #FDF6E3; border: 1px solid #F0DFB4; border-radius: 12px; padding: 12px 16px; margin-bottom: 22px; }
        .mky-partner-t { font-size: 11px; font-weight: 800; color: #B8860B; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
        .mky-partner-m { font-size: 12.5px; color: #6E6E73; line-height: 1.6; }
        .mky-prev-h { font-size: 25px; font-weight: 900; color: #1C2B4A; letter-spacing: -.8px; line-height: 1.25; }
        .mky-prev-meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 12.5px; color: #6E6E73; margin-top: 12px; }
        .mky-prev-line { height: 9px; border-radius: 5px; background: #F0F0F3; margin-top: 14px; }
        .mky-prev-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 20px; font-size: 13.5px; font-weight: 700; color: #1B3A69; background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 10px; padding: 9px 14px; }

        .mky-order { background: linear-gradient(135deg,#0F2348,#1B3A69); padding: 76px 0; }
        .mky-order-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; margin-top: 38px; }
        .mky-box { background: white; border-radius: 20px; padding: 32px; position: relative; }
        .mky-summary { background: white; border-radius: 20px; padding: 26px 24px; position: sticky; top: 90px; }
        .mky-sum-t { font-size: 12px; font-weight: 800; color: #6E6E73; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
        .mky-sum-row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; color: #3A3A3C; margin-bottom: 10px; }
        .mky-sum-total { display: flex; justify-content: space-between; gap: 12px; font-size: 17px; font-weight: 900; color: #1B3A69; border-top: 1px solid #E5E5EA; padding-top: 14px; margin-top: 14px; letter-spacing: -.4px; }

        .mky-fieldset-title { font-size: 12px; font-weight: 800; color: #1B3A69; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; }
        .mky-form { position: relative; }
        .mky-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mky-full { grid-column: 1 / -1; }
        .mky-lbl { font-size: 12px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 5px; display: block; }
        .mky-inp { width: 100%; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #E5E5EA; font-size: 14px; font-family: inherit; background: white; color: #1C2B4A; outline: none; resize: vertical; }
        .mky-inp:focus { border-color: #1B3A69; }
        .mky-hint { font-size: 12px; color: #6E6E73; margin-top: 5px; }
        .mky-err { background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; font-size: 13.5px; border-radius: 10px; padding: 11px 14px; margin-top: 16px; }
        .mky-submit { width: 100%; margin-top: 20px; padding: 15px 24px; border-radius: 13px; border: none; background: linear-gradient(135deg,#D4A843,#B8860B); color: white; font-size: 15.5px; font-weight: 800; font-family: inherit; cursor: pointer; transition: opacity .2s; }
        .mky-submit:hover { opacity: .92; }
        .mky-submit:disabled { opacity: .55; cursor: default; }
        .mky-legal { font-size: 12px; color: #6E6E73; line-height: 1.6; margin-top: 14px; text-align: center; }
        .mky-ok-circle { width: 62px; height: 62px; border-radius: 50%; background: linear-gradient(135deg,#D1FAE5,#A7F3D0); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }

        .mky-contact { max-width: 620px; margin: 38px auto 0; }
        .mky-mail { text-align: center; font-size: 14px; color: #6E6E73; margin-top: 20px; }
        .mky-mail a { color: #1B3A69; font-weight: 700; text-decoration: none; }

        @media (max-width: 900px) {
          .mky-neden-grid { grid-template-columns: 1fr 1fr; }
          .mky-order-grid { grid-template-columns: 1fr; }
          .mky-summary { position: static; }
        }
        @media (max-width: 560px) {
          .mky-hero { padding: 54px 0 50px; }
          .mky-neden-grid, .mky-steps, .mky-grid { grid-template-columns: 1fr; }
          .mky-stats { grid-template-columns: 1fr; gap: 22px; }
          .mky-box, .mky-price-card { padding: 24px 18px; }
          .mky-preview-body { padding: 22px 18px 26px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="mky-hero">
        <div className="mky-container">
          <div className="mky-badge">İş Ortağı İçeriği</div>
          <h1 className="mky-h1">
            Hekimhane&apos;de<br />
            <span style={{ color: '#D4A843' }}>makale yayınlayın</span>
          </h1>
          <p className="mky-sub">
            Her ay sağlık bilgisi arayan on binlerce hastaya ulaşın.
            Makaleniz Hekimhane&apos;de kalıcı olarak yer alır — tek seferlik ödeme, aylık ücret yok.
          </p>
          <button className="mky-cta" onClick={() => scrollTo('siparis')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            Makale sipariş et
          </button>

          <div className="mky-stats">
            <div>
              <div className="mky-stat-n">{aylikZiyaretci}</div>
              <div className="mky-stat-l">aylık ziyaretçi</div>
            </div>
            <div>
              <div className="mky-stat-n">{tl(klinikSayisi)}+</div>
              <div className="mky-stat-l">klinik ve muayenehane</div>
            </div>
            <div>
              <div className="mky-stat-n">{tl(hekimSayisi)}+</div>
              <div className="mky-stat-l">veritabanındaki hekim</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEDEN ── */}
      <section className="mky-section">
        <div className="mky-container">
          <h2 className="mky-title">Neden Hekimhane&apos;de yayın yapmalısınız?</h2>
          <p className="mky-subtitle">Hekimhane, Türkiye&apos;nin diş hekimi ve klinik rehberidir.</p>
          <div className="mky-neden-grid">
            {nedenler.map((n, i) => (
              <div key={i} className="mky-card">
                <div className="mky-card-ico">{n.ico}</div>
                <div className="mky-card-t">{n.baslik}</div>
                <div className="mky-card-m">{n.metin}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="mky-section mky-section-white">
        <div className="mky-container">
          <h2 className="mky-title">Nasıl çalışıyor?</h2>
          <p className="mky-subtitle">Talebinizden yayına kadar dört adım</p>
          <div className="mky-steps">
            {adimlar.map(a => (
              <div key={a.n} className="mky-step">
                <div className="mky-step-n">{a.n}</div>
                <div className="mky-step-t">{a.t}</div>
                <div className="mky-step-m">{a.m}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FİYAT — TEK PAKET ── */}
      <section className="mky-section" id="fiyat">
        <div className="mky-container">
          <h2 className="mky-title">Fiyat</h2>
          <p className="mky-subtitle">Tek paket, tek fiyat. Ek modül yok, sürpriz kalem yok.</p>

          <div className="mky-price-wrap">
            <div className="mky-price-card">
              <div className="mky-price-tag">Her şey dahil</div>
              <div className="mky-price-name">İş Ortağı Makalesi</div>
              <div className="mky-price-desc">
                Makale Hekimhane&apos;de kalıcı olarak yayında kalır. Tek seferlik ödeme.
              </div>
              <div className="mky-price-big">{tl(MAKALE_FIYAT)} ₺</div>
              <div className="mky-price-kdv">
                KDV hariç · KDV (%{Math.round(KDV_ORANI * 100)}) dahil toplam <strong>{tl(TOPLAM)} ₺</strong>
              </div>

              <ul className="mky-price-list">
                {dahil.map((d, i) => (
                  <li key={i}><Check />{d}</li>
                ))}
              </ul>

              <p className="mky-price-note">
                Fiyat KDV hariçtir. Fatura, sipariş ödemesi yapıldıktan sonra düzenlenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAKALE NASIL GÖRÜNÜYOR ── */}
      <section className="mky-section mky-section-white">
        <div className="mky-container">
          <h2 className="mky-title">Makale nasıl görünüyor?</h2>
          <p className="mky-subtitle">Her iş ortağı makalesi şeffaf biçimde etiketlenir.</p>

          <div className="mky-preview">
            <div className="mky-preview-bar">
              <span className="mky-dot" style={{ background: '#FF5F57' }} />
              <span className="mky-dot" style={{ background: '#FEBC2E' }} />
              <span className="mky-dot" style={{ background: '#28C840' }} />
              <span style={{ fontSize: 11.5, color: '#8E8E93', marginLeft: 10 }}>hekimhane.com.tr/blog/makaleniz</span>
            </div>
            <div className="mky-preview-body">
              <div className="mky-partner-strip">
                <div className="mky-partner-t">İş Ortağı İçeriği</div>
                <div className="mky-partner-m">
                  Bu makale ticari bir iş ortağı ile iş birliği içinde hazırlanmıştır.
                  İçerik, okuyucuya değer sunmak amacıyla düzenlenmiştir.
                </div>
              </div>
              <div className="mky-prev-h">Makalenizin başlığı</div>
              <div className="mky-prev-meta">
                <strong style={{ color: '#1C2B4A' }}>Kliniğiniz</strong>
                <span>·</span><span>17 Mart 2026</span>
                <span>·</span><span>5 dakikalık okuma</span>
              </div>
              <div className="mky-prev-line" style={{ width: '100%' }} />
              <div className="mky-prev-line" style={{ width: '94%' }} />
              <div className="mky-prev-line" style={{ width: '88%' }} />
              <div className="mky-prev-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="2.2" strokeLinecap="round"><path d="M7 17L17 7M17 7H8M17 7v9" /></svg>
                www.klinigim.com — metin içinden doğrudan bağlantı
              </div>
            </div>
          </div>

          <p className="mky-subtitle" style={{ marginTop: 22 }}>
            Şu an Hekimhane blogunda {makaleSayisi} yayımlanmış makale bulunuyor.
          </p>
        </div>
      </section>

      {/* ── SİPARİŞ ── */}
      <section className="mky-order" id="siparis">
        <div className="mky-container">
          <h2 className="mky-title" style={{ color: 'white' }}>Makale sipariş edin</h2>
          <p className="mky-subtitle" style={{ color: 'rgba(255,255,255,.68)' }}>
            Bilgileri doldurun, e-posta ile proforma fatura gönderelim.
          </p>

          <div className="mky-order-grid">
            <div className="mky-box"><SiparisFormu /></div>

            <div className="mky-summary">
              <div className="mky-sum-t">Sipariş özeti</div>
              <div className="mky-sum-row">
                <span>İş Ortağı Makalesi</span>
                <strong style={{ color: '#1C2B4A', whiteSpace: 'nowrap' }}>{tl(MAKALE_FIYAT)} ₺</strong>
              </div>
              <div className="mky-sum-row" style={{ color: '#6E6E73' }}>
                <span>KDV (%{Math.round(KDV_ORANI * 100)})</span>
                <span style={{ whiteSpace: 'nowrap' }}>{tl(KDV_TUTAR)} ₺</span>
              </div>
              <div className="mky-sum-total">
                <span>Toplam</span>
                <span style={{ whiteSpace: 'nowrap' }}>{tl(TOPLAM)} ₺</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0' }}>
                {dahil.slice(0, 5).map((d, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#6E6E73', lineHeight: 1.55, marginBottom: 8 }}>
                    <Check c="#1B3A69" />{d}
                  </li>
                ))}
                <li style={{ fontSize: 12.5, color: '#6E6E73', paddingLeft: 24 }}>ve dahası — hepsi fiyata dahil.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SORU ── */}
      <section className="mky-section">
        <div className="mky-container">
          <h2 className="mky-title">Sorunuz mu var?</h2>
          <p className="mky-subtitle">Bize yazın, 24 saat içinde dönüş yapalım.</p>
          <div className="mky-contact">
            <div className="mky-card" style={{ padding: 28 }}>
              <SoruFormu />
            </div>
            <p className="mky-mail">
              Ya da doğrudan <a href="mailto:info@hekimhane.com.tr">info@hekimhane.com.tr</a> adresine yazın.
            </p>
            <p className="mky-mail" style={{ marginTop: 10 }}>
              Hekimhane&apos;de onaylı işletmeniz varsa yazınızı{' '}
              <a href="/panel">panelinizdeki Makalelerim</a> sekmesinden de gönderebilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
