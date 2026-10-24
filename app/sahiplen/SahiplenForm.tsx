'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import HkIcon from '@/components/HkIcon';
import type { User } from '@supabase/supabase-js';

interface Props {
  entityId: string;
  entityType: string;
  entityName: string;
  isClaimed?: boolean;
}

/* ── Küçük yardımcı bileşenler (modül düzeyinde: yeniden oluşmaz, odak kaybolmaz) ── */
function IcSpin() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'sh-spin .9s linear infinite' }} aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.2"/>
      <path d="M9 2a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}
function IcBack() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M9 2L4 7l5 5"/></svg>
  );
}

/** Bu bileşenin yerel stilleri (kf- sınıflarında karşılığı olmayan parçalar). */
function YerelStil() {
  return (
    <style>{`
      @keyframes sh-spin { to { transform: rotate(360deg); } }
      .sh-sec { display: block; width: 100%; padding: 18px; border: 1.5px solid transparent; border-radius: 16px; background: #F2F3F5; font: inherit; text-align: left; cursor: pointer; transition: background .2s, border-color .2s, box-shadow .2s; }
      .sh-sec:hover { background: #fff; border-color: #B9C6DE; box-shadow: 0 8px 22px -14px rgba(18,41,77,.35); }
      .sh-sec:focus-visible { outline: none; background: #fff; border-color: #12294D; box-shadow: 0 0 0 4px rgba(18,41,77,.12); }
      .sh-sec__ikon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: #12294D; margin-bottom: 12px; }
      .sh-sec b { display: block; font-size: 15px; font-weight: 700; color: #0E1A2C; margin-bottom: 3px; }
      .sh-sec span { display: block; font-size: 13px; line-height: 1.5; color: #6E6E73; }
      .sh-metin { align-self: flex-start; display: inline-flex; align-items: center; gap: 5px; padding: 4px 2px; border: 0; background: none; font: inherit; font-size: 14px; font-weight: 600; color: #586273; cursor: pointer; }
      .sh-metin:hover { color: #12294D; }
      .sh-profil { display: flex; align-items: center; gap: 13px; }
      .sh-onay { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
      .sh-onay input { width: 20px; height: 20px; margin: 2px 0 0; flex: none; accent-color: #12294D; cursor: pointer; }
      .sh-onay b { display: block; font-size: 15px; font-weight: 700; color: #0E1A2C; margin-bottom: 3px; }
      .sh-onay span { display: block; font-size: 13px; line-height: 1.6; color: #586273; }
      .sh-uyari { display: flex; align-items: flex-start; gap: 14px; }
      .sh-uyari__ikon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; background: #FFF3D6; flex: none; }
      .sh-uyari h2 { margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #0E1A2C; }
      .sh-uyari p { margin: 0; font-size: 14px; line-height: 1.65; color: #586273; }
      .sh-surec { padding: 16px; border-radius: 16px; background: #F2F3F5; }
      .sh-surec h3 { margin: 0 0 12px; font-size: 12.5px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #6E6E73; }
      .sh-surec .kf-adim { align-items: center; }
      .sh-tamam { display: grid; justify-items: center; gap: 10px; padding: 12px 0; text-align: center; }
      .sh-tamam h2 { margin: 6px 0 0; font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -.03em; color: #0E1A2C; }
      .sh-tamam p { margin: 0 0 12px; max-width: 420px; font-size: 15px; line-height: 1.65; color: #586273; }
      .sh-tamam p strong { color: #0E1A2C; }
      .sh-tamam button { border: 0; cursor: pointer; font-family: inherit; }
    `}</style>
  );
}

/** Sayfa başlığı — küçük, sade. Başarı ekranında gösterilmez. */
function Baslik() {
  return (
    <>
      <h1 className="kf-baslik">İşletmeyi sahiplenin</h1>
      <p className="kf-alt">Birkaç bilgiyle işletmenizi talep edin; ekibimiz doğrulayıp onaylasın.</p>
    </>
  );
}

function Grup({ baslik, children }: { baslik?: string; children: React.ReactNode }) {
  return (
    <section className="kf-grup">
      {baslik && <h2 className="kf-grup__baslik">{baslik}</h2>}
      <div className="kf-grup__kutu">{children}</div>
    </section>
  );
}

function Etiket({ id, children, zorunlu, opsiyonel }: { id: string; children: React.ReactNode; zorunlu?: boolean; opsiyonel?: boolean }) {
  return (
    <label htmlFor={id}>
      {children}
      {zorunlu && <span className="z" aria-hidden="true">*</span>}
      {opsiyonel && <span className="o">isteğe bağlı</span>}
    </label>
  );
}

function Hata({ id, mesaj }: { id: string; mesaj?: string }) {
  return mesaj ? <p className="kf-hata" id={id} role="alert">{mesaj}</p> : null;
}

interface GirdiProps {
  id: string;
  label: string;
  tip?: 'text' | 'tel' | 'email';
  deger: string;
  degis: (v: string) => void;
  yer?: string;
  zorunlu?: boolean;
  opsiyonel?: boolean;
  hata?: string;
  ac?: string;
}
function Girdi({ id, label, tip = 'text', deger, degis, yer, zorunlu, opsiyonel, hata, ac }: GirdiProps) {
  const dolu = deger.trim() !== '';
  const cls = 'kf-in' + (hata ? ' hata' : dolu ? ' dolu' : '');
  return (
    <div className="kf-alan">
      <Etiket id={id} zorunlu={zorunlu} opsiyonel={opsiyonel}>{label}</Etiket>
      <div className="kf-giris">
        <input
          id={id} type={tip} value={deger} placeholder={yer} autoComplete={ac}
          className={cls}
          aria-required={zorunlu || undefined}
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? `${id}-h` : undefined}
          onChange={e => degis(e.target.value)}
        />
        <span className="kf-tik" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
      </div>
      <Hata id={`${id}-h`} mesaj={hata} />
    </div>
  );
}

function Metin({ id, label, deger, degis, yer }: { id: string; label: string; deger: string; degis: (v: string) => void; yer?: string }) {
  return (
    <div className="kf-alan">
      <Etiket id={id} opsiyonel>{label}</Etiket>
      <textarea
        id={id} value={deger} rows={4} placeholder={yer}
        className={'kf-in' + (deger.trim() !== '' ? ' dolu' : '')}
        onChange={e => degis(e.target.value)}
      />
    </div>
  );
}

const ENTITY_LABEL: Record<string, string> = {
  klinik:  'Diş Kliniği',
  hastane: 'Hastane',
  eczane:  'Eczane',
  doktor:  'Doktor',
};

/* ─────────────────────────────────────────────────────────── */
export default function SahiplenForm({ entityId, entityType, entityName, isClaimed = false }: Props) {
  const router = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Giriş yapılmış kullanıcı için minimal form ── */
  const [loggedForm, setLoggedForm] = useState({ tel: '', unvan: '', mesaj: '' });
  const [telError,   setTelError]   = useState('');
  const [unvanError, setUnvanError] = useState('');

  /* ── Giriş yapılmamış kullanıcı için tam form ── */
  const [guestForm, setGuestForm] = useState({
    ad_soyad: '', tel: '', email: '', unvan: '', mesaj: '',
  });
  const [guestErrors, setGuestErrors] = useState<Partial<typeof guestForm>>({});

  /* ── Sahiplenme modu (giriş yapılmışsa) ── */
  const [mod, setMod] = useState<'self' | 'other' | null>(null);

  /* ── Dispute onay adımı (zaten sahiplenilmiş işletme) ── */
  const [disputeConfirmed, setDisputeConfirmed] = useState(false);
  const [disputeChecked,   setDisputeChecked]   = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  /* ── Oturum kontrolü ── */
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  /* ── Giriş yapılmış: gönder ── */
  async function saveToAboneList(email: string, isim?: string) {
    try {
      await fetch('/api/abone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          isim:        isim || undefined,
          tip:         'isletme',
          kaynak:      'sahiplenme',
          entity_id:   entityId   || undefined,
          entity_type: entityType || undefined,
          entity_name: entityName || undefined,
        }),
      });
    } catch { /* fire-and-forget */ }
  }

  async function handleLoggedSubmit(e: React.FormEvent) {
    e.preventDefault();
    let hasErr = false;
    if (!loggedForm.unvan.trim()) { setUnvanError('Ünvan zorunludur'); hasErr = true; } else { setUnvanError(''); }
    if (!loggedForm.tel.trim())   { setTelError('Telefon zorunludur'); hasErr = true; } else { setTelError(''); }
    if (hasErr) return;
    setSaving(true); setError('');

    const name = user!.user_metadata?.full_name || user!.user_metadata?.name || '';
    try {
      const r = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id:     entityId,
          entity_type:   entityType,
          entity_name:   entityName,
          claimant_name: name,
          phone:         loggedForm.tel.trim(),
          email:         user!.email,
          role:          [loggedForm.unvan.trim(), loggedForm.mesaj.trim()].filter(Boolean).join(' — ') || null,
          status:        isClaimed ? 'dispute' : 'pending',
        }),
      });
      const res = await r.json();
      setSaving(false);
      if (!r.ok) { setError(`Hata: ${res.error || 'Talep gönderilemedi.'}`); return; }
    } catch {
      setSaving(false); setError('Bağlantı hatası, tekrar deneyin.'); return;
    }
    // Abone listesine ekle (fire-and-forget)
    if (user!.email) saveToAboneList(user!.email, name || undefined);
    setSubmitted(true);
  }

  /* ── Giriş yapılmamış: gönder ── */
  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<typeof guestForm> = {};
    if (!guestForm.ad_soyad.trim()) errs.ad_soyad = 'Ad soyad zorunludur';
    if (!guestForm.tel.trim())      errs.tel      = 'Telefon zorunludur';
    if (!guestForm.email.trim())    errs.email    = 'E-posta zorunludur';
    setGuestErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true); setError('');
    try {
      const r = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id:     entityId,
          entity_type:   entityType,
          entity_name:   entityName,
          claimant_name: guestForm.ad_soyad.trim(),
          phone:         guestForm.tel.trim(),
          email:         guestForm.email.trim(),
          role:          [guestForm.unvan.trim(), guestForm.mesaj.trim()].filter(Boolean).join(' — ') || null,
          status:        isClaimed ? 'dispute' : 'pending',
        }),
      });
      const res = await r.json();
      setSaving(false);
      if (!r.ok) { setError(`Hata: ${res.error || 'Talep gönderilemedi.'}`); return; }
    } catch {
      setSaving(false); setError('Bağlantı hatası, tekrar deneyin.'); return;
    }
    // Abone listesine ekle (fire-and-forget)
    if (guestForm.email.trim()) saveToAboneList(guestForm.email.trim(), guestForm.ad_soyad.trim() || undefined);
    setSubmitted(true);
  }

  const gonderYazi = isClaimed ? 'İtiraz Talebini Gönder' : 'Sahiplenme Talebini Gönder';
  const mesajYer = (baskasi: boolean) =>
    `Bu işletmenin sahibi ${baskasi ? 'olduğunu' : 'olduğunuzu'} kanıtlayan bilgiler (vergi no, ruhsat no vb.) ekleyebilirsiniz...`;

  /* Guest alanı değişince o alanın hatasını temizle */
  const guestDegis = (alan: keyof typeof guestForm) => (v: string) => {
    setGuestForm(f => ({ ...f, [alan]: v }));
    setGuestErrors(er => (er[alan] ? { ...er, [alan]: undefined } : er));
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <YerelStil />
        <Baslik />
        <div className="kf-grup__kutu" style={{ justifyItems: 'center', color: '#586273', padding: 40 }} role="status" aria-label="Yükleniyor">
          <IcSpin />
        </div>
      </>
    );
  }

  /* ── Başarı ── */
  if (submitted) {
    const displayEmail = user ? user.email! : guestForm.email;
    return (
      <>
        <YerelStil />
        <div className="kf-grup__kutu" style={{ padding: 'clamp(28px,5vw,44px) 24px' }}>
          <div className="sh-tamam">
            <HkIcon name="success" size={56} />
            <h2>Talebiniz alındı</h2>
            <p>
              <strong>{entityName}</strong> için {isClaimed ? 'itiraz talebiniz' : 'sahiplenme talebiniz'} başarıyla iletildi.
              En kısa sürede <strong>{displayEmail}</strong> adresinize dönüş yapacağız.
            </p>
            <button type="button" onClick={() => router.back()} className="vt-dugme oz-dugme--altin hk-cta-isik">
              Geri dön
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── Dispute onay ekranı (işletme zaten sahiplenilmiş) ── */
  if (isClaimed && !disputeConfirmed) {
    return (
      <>
        <YerelStil />
        <Baslik />

        <Grup>
          <div className="sh-uyari">
            <span className="sh-uyari__ikon"><HkIcon name="warning" size={24} /></span>
            <div>
              <h2>Bu işletme zaten sahiplenilmiş</h2>
              <p>
                <strong>{entityName}</strong> başka bir kullanıcı tarafından sahiplenilmiş.
                Eğer bu işletmenin gerçek sahibi sizseniz, mevcut sahipliğe itiraz eden bir talep gönderebilirsiniz.
                Ekibimiz her iki tarafla iletişime geçerek doğrulama yapacaktır.
              </p>
            </div>
          </div>

          <div className="sh-surec">
            <h3>İtiraz süreci</h3>
            {[
              'İtiraz talebinizi gönderin',
              'Ekibimiz her iki tarafla iletişime geçer',
              'Belgeler incelenerek doğrulama yapılır',
              'Sonuç e-posta ile bildirilir (çoğunlukla birkaç saat, en geç 24 saat)',
            ].map((t, i) => (
              <div key={t} className="kf-adim"><b>{i + 1}</b><span>{t}</span></div>
            ))}
          </div>

          <label className="sh-onay">
            <input type="checkbox" checked={disputeChecked} onChange={e => setDisputeChecked(e.target.checked)} />
            <div>
              <b>Bu işletmenin gerçek sahibi benim</b>
              <span>
                Mevcut sahipliğin hatalı olduğunu ve bu işletmenin yasal sahibinin ben olduğumu beyan ediyorum.
                Yanlış beyan hukuki sorumluluk doğurabilir.
              </span>
            </div>
          </label>
        </Grup>

        <button type="button" disabled={!disputeChecked} onClick={() => setDisputeConfirmed(true)}
          className="kf-gonder"
          style={{ background: '#12294D', color: '#fff', cursor: disputeChecked ? 'pointer' : 'not-allowed', opacity: disputeChecked ? 1 : .4 }}>
          İtiraz Talebine Devam Et
        </button>

        <p className="kf-not">
          <button type="button" className="sh-metin" onClick={() => window.history.back()} style={{ margin: '0 auto' }}>
            <IcBack />İşletme sayfasına geri dön
          </button>
        </p>
      </>
    );
  }

  /* ── Hata kutusu (ortak) ── */
  const errorBox = error ? (
    <div className="kf-hatakutu" role="alert">
      <strong style={{ display: 'block', marginBottom: 2 }}>Gönderim başarısız</strong>
      {error}
    </div>
  ) : null;

  const gonder = (
    <>
      {errorBox}
      <button type="submit" disabled={saving} className="kf-gonder hk-cta-isik">
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          {saving ? <><IcSpin />Gönderiliyor...</> : gonderYazi}
        </span>
      </button>
      <p className="kf-not">Bilgileriniz yalnızca doğrulama amacıyla kullanılacak ve üçüncü taraflarla paylaşılmayacaktır.</p>
    </>
  );

  const tamForm = (baskasi: boolean) => (
    <form onSubmit={handleGuestSubmit} style={{ display: 'block' }}>
      {baskasi && (
        <button type="button" className="sh-metin" onClick={() => setMod(null)} style={{ marginBottom: 14 }}>
          <IcBack />Geri
        </button>
      )}
      <Grup baslik={baskasi ? 'İşletme sahibinin bilgileri' : 'Bilgileriniz'}>
        {baskasi && (
          <p className="kf-ipucu">
            <HkIcon name="info" size={16} accent={false} />
            <span>İşletmeyi farklı bir kişi adına sahipleniyorsunuz. Lütfen gerçek işletme sahibinin bilgilerini girin.</span>
          </p>
        )}
        <div className="kf-iki">
          <Girdi id="sh-ad" label="Ad Soyad" zorunlu ac="name" yer="Adınız Soyadınız"
            deger={guestForm.ad_soyad} degis={guestDegis('ad_soyad')} hata={guestErrors.ad_soyad} />
          <Girdi id="sh-unvan" label="Ünvan" opsiyonel yer="Sahip, Yönetici, Müdür..."
            deger={guestForm.unvan} degis={guestDegis('unvan')} />
        </div>
        <div className="kf-iki">
          <Girdi id="sh-tel" label="Telefon" tip="tel" zorunlu ac="tel" yer="0500 000 00 00"
            deger={guestForm.tel} degis={guestDegis('tel')} hata={guestErrors.tel} />
          <Girdi id="sh-email" label="E-posta" tip="email" zorunlu ac="email" yer="ornek@email.com"
            deger={guestForm.email} degis={guestDegis('email')} hata={guestErrors.email} />
        </div>
      </Grup>
      <Grup baslik="Ek bilgi">
        <Metin id="sh-mesaj" label="Ek Mesaj" yer={mesajYer(baskasi)}
          deger={guestForm.mesaj} degis={guestDegis('mesaj')} />
      </Grup>
      {gonder}
    </form>
  );

  /* ════════════════════════════════════════
     A) GİRİŞ YAPILMIŞ
  ════════════════════════════════════════ */
  if (user) {
    const name   = user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
    const avatar = user.user_metadata?.avatar_url;

    /* Profil kartı (her zaman görünür) */
    const profilKart = (
      <Grup baslik="Hesabınız">
        <div className="sh-profil">
          {avatar
            ? <img src={avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} /> // eslint-disable-line @next/next/no-img-element
            : <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: '50%', background: '#12294D', flexShrink: 0, color: '#EBCF8D', fontSize: 17, fontWeight: 700 }} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0E1A2C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
          <span className="vt-ucretsiz" style={{ flexShrink: 0 }}>Giriş yapıldı</span>
        </div>
      </Grup>
    );

    /* ── Mod seçilmemişse: seçim ekranı ── */
    if (!mod) {
      return (
        <>
          <YerelStil />
          <Baslik />
          {profilKart}
          <Grup baslik="Bu işletmeyi kim adına sahipleniyorsunuz?">
            <div className="kf-iki">
              <button type="button" className="sh-sec" onClick={() => setMod('self')}>
                <span className="sh-sec__ikon"><HkIcon name="user-account" size={22} color="#fff" accent="#EBCF8D" /></span>
                <b>Benim adıma</b>
                <span>Giriş yaptığım hesap ile sahiplen</span>
              </button>
              <button type="button" className="sh-sec" onClick={() => setMod('other')}>
                <span className="sh-sec__ikon"><HkIcon name="doctor-profile" size={22} color="#fff" accent="#EBCF8D" /></span>
                <b>Farklı kişi adına</b>
                <span>İşletme sahibi farklıysa bilgilerini girin</span>
              </button>
            </div>
          </Grup>
        </>
      );
    }

    /* ── mod = 'self': kendi adına form ── */
    if (mod === 'self') {
      return (
        <>
          <YerelStil />
          <Baslik />
          <form onSubmit={handleLoggedSubmit} style={{ display: 'block' }}>
            {profilKart}
            <button type="button" className="sh-metin" onClick={() => setMod(null)} style={{ marginBottom: 14, marginTop: -8 }}>
              <IcBack />Geri
            </button>
            <Grup baslik="Bilgileriniz">
              <div className="kf-iki">
                <Girdi id="sh-l-unvan" label="Ünvan" zorunlu yer="Sahip, Yönetici, Müdür..."
                  deger={loggedForm.unvan} hata={unvanError}
                  degis={v => { setLoggedForm(f => ({ ...f, unvan: v })); setUnvanError(''); }} />
                <Girdi id="sh-l-tel" label="Telefon" tip="tel" zorunlu ac="tel" yer="0500 000 00 00"
                  deger={loggedForm.tel} hata={telError}
                  degis={v => { setLoggedForm(f => ({ ...f, tel: v })); setTelError(''); }} />
              </div>
            </Grup>
            <Grup baslik="Ek bilgi">
              <Metin id="sh-l-mesaj" label="Ek Mesaj" yer={mesajYer(false)}
                deger={loggedForm.mesaj} degis={v => setLoggedForm(f => ({ ...f, mesaj: v }))} />
            </Grup>
            {gonder}
          </form>
        </>
      );
    }

    /* ── mod = 'other': başkası adına — tam form ── */
    return (
      <>
        <YerelStil />
        <Baslik />
        {tamForm(true)}
      </>
    );
  }

  /* ════════════════════════════════════════
     B) GİRİŞ YAPILMAMIŞ — tam form
  ════════════════════════════════════════ */
  return (
    <>
      <YerelStil />
      <Baslik />
      {tamForm(false)}
    </>
  );
}
