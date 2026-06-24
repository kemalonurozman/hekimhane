'use client';

import { useState } from 'react';

/* ── Küçük yıldız ikonları ───────────────────── */
function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= n ? '#D4A843' : '#D1D5DB'} style={{ display: 'inline', marginRight: 1 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

/* ── Çekim talebi formu ── */
function CekimTalepFormu({
  entityId, entityType, entityName, entityIl, entityIlce, onClose
}: {
  entityId?: string; entityType?: string; entityName?: string;
  entityIl?: string; entityIlce?: string; onClose?: () => void;
}) {
  const [form, setForm] = useState({
    isletme_adi: entityName || '',
    isletme_turu: entityType || '',
    il:   entityIl  || '',
    ilce: entityIlce || '',
    ad_soyad: '',
    tel:      '',
    email:    '',
    notlar:   '',
  });
  const [sending,  setSending]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const F = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isletme_adi || !form.ad_soyad || !form.tel) {
      setError('Lütfen zorunlu alanları (*) doldurun.');
      return;
    }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/cekim-talebi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, entity_id: entityId || null }),
      });
      if (!res.ok) throw new Error('Sunucu hatası');
      setSuccess(true);
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #E5E5EA', fontSize: 14, fontFamily: 'inherit',
    background: 'white', color: '#1C2B4A', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, display: 'block' };

  if (success) return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1C2B4A', marginBottom: 8 }}>Talebiniz Alındı!</h3>
      <p style={{ fontSize: 14, color: '#6E6E73', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 20px' }}>
        En kısa sürede ekibimiz sizi arayacak ve çekim süreci hakkında bilgi verecektir.
      </p>
      {onClose && (
        <button onClick={onClose} style={{ padding: '11px 28px', borderRadius: 11, background: '#1B3A69', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Tamam
        </button>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>İşletme Adı *</label>
          <input value={form.isletme_adi} onChange={e => F('isletme_adi', e.target.value)}
            placeholder="Klinik / Hastane adı" style={inp} required />
        </div>
        <div>
          <label style={lbl}>İl *</label>
          <input value={form.il} onChange={e => F('il', e.target.value)}
            placeholder="İstanbul" style={inp} />
        </div>
        <div>
          <label style={lbl}>İlçe</label>
          <input value={form.ilce} onChange={e => F('ilce', e.target.value)}
            placeholder="Kadıköy" style={inp} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Ad Soyad *</label>
          <input value={form.ad_soyad} onChange={e => F('ad_soyad', e.target.value)}
            placeholder="Ahmet Yılmaz" style={inp} required />
        </div>
        <div>
          <label style={lbl}>Telefon *</label>
          <input value={form.tel} onChange={e => F('tel', e.target.value)}
            placeholder="0532 xxx xx xx" style={inp} type="tel" required />
        </div>
        <div>
          <label style={lbl}>E-posta</label>
          <input value={form.email} onChange={e => F('email', e.target.value)}
            placeholder="ornek@email.com" style={inp} type="email" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Notlar / Eklemek istedikleriniz</label>
          <textarea value={form.notlar} onChange={e => F('notlar', e.target.value)}
            placeholder="Mekan büyüklüğü, uygun günler, vs."
            rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, color: '#991B1B' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={sending} style={{ padding: '13px 24px', borderRadius: 12, background: sending ? '#9CA3AF' : '#1B3A69', color: 'white', border: 'none', fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {sending
          ? <><svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg> Gönderiliyor…</>
          : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Çekim Talebi Gönder</>
        }
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   MODAL WRAPPER (iç sayfadan açılabilir)
═══════════════════════════════════════════════ */
function CekimTalebiModal({
  open, onClose,
  entityId, entityType, entityName, entityIl, entityIlce,
}: {
  open: boolean; onClose: () => void;
  entityId?: string; entityType?: string; entityName?: string;
  entityIl?: string; entityIlce?: string;
}) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9998, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C2B4A', margin: 0, marginBottom: 4 }}>360° Profesyonel Çekim Talebi</h2>
              <p style={{ fontSize: 13, color: '#6E6E73', margin: 0 }}>Ekibimiz en kısa sürede sizi arayacaktır.</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid #E5E5EA', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <CekimTalepFormu
            entityId={entityId} entityType={entityType}
            entityName={entityName} entityIl={entityIl} entityIlce={entityIlce}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   ANA SAYFA
═══════════════════════════════════════════════ */
export default function FotografCekimiPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const ozellikler = [
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
      baslik: 'Profesyonel Ekipman',
      aciklama: 'Endüstriyel 360° kameralar ve özel rig sistemleriyle milimetrik hassasiyette çekim.',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      baslik: 'Tam 360° Kapsam',
      aciklama: 'Bekleme odası, muayene odaları, koridorlar — tüm alanlar kusursuz sanal tura dönüştürülür.',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      baslik: 'Hızlı Teslimat',
      aciklama: 'Çekim sonrası 48 saat içinde profil sayfanıza yüklenmeye hazır dosyalar.',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      baslik: 'Hasta Güveni',
      aciklama: 'Sanal tur sunan klinikler %40 daha fazla randevu alıyor. Hastalar gelmeden önce ortamı görüyor.',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      baslik: 'Hekimhane Entegrasyonu',
      aciklama: 'Çekim dosyaları doğrudan profilinize eklenir. Ayrı bir teknik bilgiye ihtiyaç yok.',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B3A69" strokeWidth="1.6" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      baslik: 'Uygun Fiyat',
      aciklama: 'Şeffaf paketler, gizli maliyet yok. Küçük muayenehaneden büyük hastaneye her bütçeye uygun.',
    },
  ];

  const yorumlar = [
    { ad: 'Dr. Mehmet A.', unvan: 'Diş Kliniği Sahibi', puan: 5, metin: 'Harika bir deneyimdi. Ekip çok profesyoneldi ve 2 saat içinde tüm kliniği çektiler. Ertesi gün profil sayfamda hazırdı.' },
    { ad: 'Ayşe K.', unvan: 'Hastane Müdürü', puan: 5, metin: 'Hastaların "gelip görmek gibi" yorumları almaya başladık. Sanal tur gerçekten fark yaratıyor.' },
    { ad: 'Opr. Dr. Can B.', unvan: 'Ortopedi Uzmanı', puan: 5, metin: 'Çekim talebi verdim, aynı gün aradılar. Fiyat makul, kalite mükemmel. Kesinlikle tavsiye ederim.' },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #FBF8F2; }
        .cekm-hero { background: linear-gradient(135deg, #0F2348 0%, #1B3A69 60%, #0D3B5E 100%); color: white; padding: 80px 0 72px; text-align: center; }
        .cekm-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .cekm-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(212,168,67,.18); border: 1px solid rgba(212,168,67,.35); border-radius: 50px; padding: 5px 16px; font-size: 12px; font-weight: 700; color: #D4A843; letter-spacing: .6px; margin-bottom: 24px; }
        .cekm-h1 { font-size: clamp(28px,5vw,52px); font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 20px; }
        .cekm-sub { font-size: clamp(15px,2vw,18px); color: rgba(255,255,255,.72); line-height: 1.7; max-width: 540px; margin: 0 auto 36px; }
        .cekm-cta { display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; background: linear-gradient(135deg,#D4A843,#B8860B); color: white; border-radius: 14px; font-size: 16px; font-weight: 800; border: none; cursor: pointer; font-family: inherit; text-decoration: none; transition: opacity .2s, transform .15s; box-shadow: 0 4px 20px rgba(212,168,67,.4); }
        .cekm-cta:hover { opacity: .92; transform: translateY(-1px); }
        .cekm-features { padding: 72px 0; }
        .cekm-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .cekm-feat-card { background: white; border-radius: 18px; border: 1px solid #E5E5EA; padding: 28px 24px; }
        .cekm-feat-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg,#EFF6FF,#DBEAFE); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .cekm-feat-title { font-size: 16px; font-weight: 800; color: #1C2B4A; margin-bottom: 8px; }
        .cekm-feat-text { font-size: 13.5px; color: #6E6E73; line-height: 1.7; }
        .cekm-how { background: white; padding: 72px 0; border-top: 1px solid #E5E5EA; border-bottom: 1px solid #E5E5EA; }
        .cekm-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 40px; }
        .cekm-step { text-align: center; padding: 0 12px; }
        .cekm-step-num { width: 44px; height: 44px; border-radius: 50%; background: #1B3A69; color: white; font-size: 17px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .cekm-step-title { font-size: 14px; font-weight: 800; color: #1C2B4A; margin-bottom: 6px; }
        .cekm-step-text { font-size: 13px; color: #6E6E73; line-height: 1.6; }
        .cekm-yorumlar { padding: 72px 0; }
        .cekm-yorum-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
        .cekm-yorum-card { background: white; border-radius: 16px; border: 1px solid #E5E5EA; padding: 24px; }
        .cekm-yorum-text { font-size: 14px; color: #3A3A3C; line-height: 1.7; font-style: italic; margin-bottom: 16px; }
        .cekm-yorum-author { font-size: 13px; font-weight: 700; color: #1C2B4A; }
        .cekm-yorum-unvan { font-size: 12px; color: #6E6E73; }
        .cekm-cta-section { background: linear-gradient(135deg,#0F2348,#1B3A69); padding: 72px 0; text-align: center; color: white; }
        .cekm-form-box { background: white; border-radius: 20px; padding: 36px; max-width: 560px; margin: 40px auto 0; }
        .cekm-section-title { font-size: clamp(22px,4vw,34px); font-weight: 900; color: #1C2B4A; letter-spacing: -0.8px; text-align: center; }
        .cekm-section-sub { font-size: 15px; color: #6E6E73; text-align: center; margin-top: 10px; }
        @media (max-width: 768px) {
          .cekm-features-grid { grid-template-columns: 1fr 1fr; }
          .cekm-steps { grid-template-columns: 1fr 1fr; }
          .cekm-yorum-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .cekm-hero { padding: 56px 0 52px; }
          .cekm-features-grid { grid-template-columns: 1fr; }
          .cekm-steps { grid-template-columns: 1fr; }
          .cekm-form-box { padding: 24px 16px; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── HERO ── */}
      <section className="cekm-hero">
        <div className="cekm-container">
          <div className="cekm-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            PROFESYONEL 360° SAĞLIK MEKÂNLARI ÇEKİMİ
          </div>
          <h1 className="cekm-h1">
            Hastaların kapınıza gelmeden<br />
            <span style={{ color: '#D4A843' }}>önce ikna olmasını sağlayın</span>
          </h1>
          <p className="cekm-sub">
            Profesyonel 360° sanal tur ile kliniğinizi, hastanenizi veya muayenehenenizi
            dijital dünyada öne çıkarın. Hastalar gelmeden önce mekânı görüyor — güven artar, randevular dolup taşar.
          </p>
          <button className="cekm-cta" onClick={() => setModalOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            Ücretsiz Çekim Teklifi Al
          </button>
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section className="cekm-features">
        <div className="cekm-container">
          <h2 className="cekm-section-title">Neden Hekimhane 360° Çekim?</h2>
          <p className="cekm-section-sub">Sağlık mekanlarına özel, uçtan uca profesyonel hizmet</p>
          <div className="cekm-features-grid" style={{ marginTop: 40 }}>
            {ozellikler.map((o, i) => (
              <div key={i} className="cekm-feat-card">
                <div className="cekm-feat-icon">{o.icon}</div>
                <div className="cekm-feat-title">{o.baslik}</div>
                <div className="cekm-feat-text">{o.aciklama}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="cekm-how">
        <div className="cekm-container">
          <h2 className="cekm-section-title">Nasıl Çalışır?</h2>
          <p className="cekm-section-sub">Taahhüt talebi göndermenizden profil sayfanızda yayına girinceye kadar 4 adım</p>
          <div className="cekm-steps">
            {[
              { n: 1, title: 'Talebi Gönderin', text: 'Formu doldurun, ekibimiz sizi en geç 24 saat içinde arasın.' },
              { n: 2, title: 'Tarih Belirleyin', text: 'Size uygun gün ve saati ekibimizle birlikte ayarlayın.' },
              { n: 3, title: 'Çekim Yapılır', text: 'Profesyonel ekibimiz kliniğinize gelir, 1-3 saat içinde çekimi tamamlar.' },
              { n: 4, title: 'Profile Eklenir', text: '48 saat içinde 360° tur doğrudan Hekimhane profilinize eklenir.' },
            ].map(s => (
              <div key={s.n} className="cekm-step">
                <div className="cekm-step-num">{s.n}</div>
                <div className="cekm-step-title">{s.title}</div>
                <div className="cekm-step-text">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YORUMLAR ── */}
      <section className="cekm-yorumlar">
        <div className="cekm-container">
          <h2 className="cekm-section-title">Sağlık Profesyonelleri Ne Diyor?</h2>
          <div className="cekm-yorum-grid">
            {yorumlar.map((y, i) => (
              <div key={i} className="cekm-yorum-card">
                <Stars n={y.puan} />
                <p className="cekm-yorum-text" style={{ marginTop: 10 }}>"{y.metin}"</p>
                <div className="cekm-yorum-author">{y.ad}</div>
                <div className="cekm-yorum-unvan">{y.unvan}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM CTA ── */}
      <section className="cekm-cta-section">
        <div className="cekm-container">
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, margin: 0, marginBottom: 12, letterSpacing: '-0.8px' }}>
            Hemen Çekim Talebi Gönderin
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.7)', margin: 0 }}>
            Ücretsiz teklif alın — zorunluluk yok, ön ödeme yok.
          </p>
          <div className="cekm-form-box">
            <CekimTalepFormu />
          </div>
        </div>
      </section>

      {/* Modal */}
      <CekimTalebiModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
