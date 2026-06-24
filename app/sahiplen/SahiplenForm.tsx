'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

interface Props {
  entityId: string;
  entityType: string;
  entityName: string;
  isClaimed?: boolean;
}

/* ── SVG ikonlar ─────────────────────────────────────────── */
function IcCheck() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="26" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2"/>
      <path d="M18 28l7 7 13-14" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcSpin() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin .9s linear infinite' }}>
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2.2"/>
      <path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
function IcSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 2.5 1 7l5.5 2 2 5.5z"/>
      <path d="M6.5 9 15.5 2.5"/>
    </svg>
  );
}
function IcWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#DC2626" strokeWidth="1.4"/>
      <path d="M8 5v4M8 10.5v.5" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
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

  async function handleGoogleGiris() {
    const supabase  = createSupabaseBrowser();
    const returnUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: returnUrl } });
  }

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

    const supabase = createSupabaseBrowser();
    const name     = user!.user_metadata?.full_name || user!.user_metadata?.name || '';
    const { error: dbError } = await (supabase as any).from('claim_requests').insert({
      entity_id:     entityId,
      entity_type:   entityType,
      entity_name:   entityName,
      claimant_name: name,
      phone:         loggedForm.tel.trim(),
      email:         user!.email,
      role:          [loggedForm.unvan.trim(), loggedForm.mesaj.trim()].filter(Boolean).join(' — ') || null,
      status:        isClaimed ? 'dispute' : 'pending',
    });

    setSaving(false);
    if (dbError) { setError(`Hata: ${dbError.message}`); }
    else {
      // Abone listesine ekle (fire-and-forget)
      if (user!.email) saveToAboneList(user!.email, name || undefined);
      setSubmitted(true);
    }
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
    const supabase = createSupabaseBrowser();
    const { error: dbError } = await (supabase as any).from('claim_requests').insert({
      entity_id:     entityId,
      entity_type:   entityType,
      entity_name:   entityName,
      claimant_name: guestForm.ad_soyad.trim(),
      phone:         guestForm.tel.trim(),
      email:         guestForm.email.trim(),
      role:          [guestForm.unvan.trim(), guestForm.mesaj.trim()].filter(Boolean).join(' — ') || null,
      status:        isClaimed ? 'dispute' : 'pending',
    });

    setSaving(false);
    if (dbError) { setError(`Hata: ${dbError.message}`); }
    else {
      // Abone listesine ekle (fire-and-forget)
      if (guestForm.email.trim()) saveToAboneList(guestForm.email.trim(), guestForm.ad_soyad.trim() || undefined);
      setSubmitted(true);
    }
  }

  /* ── Ortak stiller ── */
  const inp = (hasErr?: boolean): React.CSSProperties => ({
    width: '100%', padding: '13px 16px', borderRadius: 12, fontFamily: 'inherit',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
    border: `1.5px solid ${hasErr ? '#FCA5A5' : '#E5E7EB'}`,
    transition: 'border-color .15s, box-shadow .15s', background: 'white',
  });
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 700,
    color: '#374151', marginBottom: 7, letterSpacing: '.01em',
  };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#1B3A69';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(27,58,105,.08)';
  };
  const blur  = (hasErr: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = hasErr ? '#FCA5A5' : '#E5E7EB';
    e.currentTarget.style.boxShadow   = 'none';
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin .9s linear infinite', display: 'inline-block' }}>
          <circle cx="10" cy="10" r="8" stroke="#E5E7EB" strokeWidth="2.5"/>
          <path d="M10 2a8 8 0 0 1 8 8" stroke="#1B3A69" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Başarı ── */
  if (submitted) {
    const displayEmail = user ? user.email! : guestForm.email;
    return (
      <div style={{ textAlign: 'center', padding: '56px 32px', background: '#F0FDF4', borderRadius: 20, border: '2px solid #86EFAC' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><IcCheck /></div>
        <h2 style={{ fontWeight: 800, fontSize: 24, color: '#166534', marginBottom: 12 }}>Talebiniz Alındı!</h2>
        <p style={{ color: '#15803D', fontSize: 15, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>
          <strong>{entityName}</strong> için {isClaimed ? 'itiraz talebiniz' : 'sahiplenme talebiniz'} başarıyla iletildi.
          En kısa sürede <strong>{displayEmail}</strong> adresinize dönüş yapacağız.
        </p>
        <button onClick={() => router.back()}
          style={{ padding: '12px 28px', background: '#1B3A69', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          ← Geri Dön
        </button>
      </div>
    );
  }

  /* ── Dispute onay ekranı (işletme zaten sahiplenilmiş) ── */
  if (isClaimed && !disputeConfirmed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* İşletme kartı */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="10" cy="7" r="3.5"/><path d="M3 19v-.5a7 7 0 0 1 14 0v.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#1B3A69', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>Sahiplenilecek İşletme</div>
            <div style={{ fontWeight: 800, color: '#1B3A69', fontSize: 16 }}>{entityName}</div>
            <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 1 }}>{ENTITY_LABEL[entityType] || entityType}</div>
          </div>
        </div>

        {/* Uyarı kartı */}
        <div style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D', borderRadius: 16, padding: '24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L20.5 19H1.5L11 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 9v5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="16" r="1" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#92400E', marginBottom: 6 }}>Bu İşletme Zaten Sahiplenilmiş</div>
              <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.7, margin: 0 }}>
                <strong>{entityName}</strong> başka bir kullanıcı tarafından sahiplenilmiş.
                Eğer bu işletmenin gerçek sahibi sizseniz, mevcut sahipliğe itiraz eden bir talep gönderebilirsiniz.
                Ekibimiz her iki tarafla iletişime geçerek doğrulama yapacaktır.
              </p>
            </div>
          </div>

          {/* Süreç adımları */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 10, letterSpacing: '0.4px', textTransform: 'uppercase' }}>İtiraz Süreci</div>
            {[
              { n: '1', t: 'İtiraz talebinizi gönderin' },
              { n: '2', t: 'Ekibimiz her iki tarafla iletişime geçer' },
              { n: '3', t: 'Belgeler incelenerek doğrulama yapılır' },
              { n: '4', t: 'Sonuç e-posta ile bildirilir (2–5 iş günü)' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: '#78350F' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F59E0B', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                {s.t}
              </div>
            ))}
          </div>
        </div>

        {/* Onay checkbox */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '16px 18px', background: disputeChecked ? '#F0FDF4' : '#F9FAFB', border: `1.5px solid ${disputeChecked ? '#86EFAC' : '#E5E7EB'}`, borderRadius: 14, transition: 'all .2s' }}>
          <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
            <input type="checkbox" checked={disputeChecked} onChange={e => setDisputeChecked(e.target.checked)}
              style={{ position: 'absolute', opacity: 0, width: 20, height: 20, cursor: 'pointer' }} />
            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${disputeChecked ? '#16A34A' : '#D1D5DB'}`, background: disputeChecked ? '#16A34A' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
              {disputeChecked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: disputeChecked ? '#166534' : '#374151', marginBottom: 3 }}>
              Bu işletmenin gerçek sahibi benim
            </div>
            <div style={{ fontSize: 12, color: disputeChecked ? '#15803D' : '#6B7280', lineHeight: 1.6 }}>
              Mevcut sahipliğin hatalı olduğunu ve bu işletmenin yasal sahibinin ben olduğumu beyan ediyorum.
              Yanlış beyan hukuki sorumluluk doğurabilir.
            </div>
          </div>
        </label>

        {/* Devam et butonu */}
        <button type="button" disabled={!disputeChecked}
          onClick={() => setDisputeConfirmed(true)}
          style={{
            padding: '15px', borderRadius: 13, border: 'none',
            background: disputeChecked ? '#DC2626' : '#E5E7EB',
            color: disputeChecked ? 'white' : '#9CA3AF',
            fontSize: 15, fontWeight: 700,
            cursor: disputeChecked ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            transition: 'background .2s, color .2s',
          }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 2L16 9M16 9L9 16M16 9H2"/>
          </svg>
          İtiraz Talebine Devam Et
        </button>

        {/* Geri dön */}
        <button type="button" onClick={() => window.history.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
          İşletme sayfasına geri dön
        </button>
      </div>
    );
  }

  /* ── İşletme başlığı (her iki formda ortak) ── */
  const entityCard = (
    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="10" cy="7" r="3.5"/><path d="M3 19v-.5a7 7 0 0 1 14 0v.5"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#1B3A69', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>Sahiplenilecek İşletme</div>
        <div style={{ fontWeight: 800, color: '#1B3A69', fontSize: 16 }}>{entityName}</div>
        <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 1 }}>{ENTITY_LABEL[entityType] || entityType}</div>
      </div>
    </div>
  );

  /* ── Hata kutusu (ortak) ── */
  const errorBox = error ? (
    <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}><IcWarning /></span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#DC2626', marginBottom: 2 }}>Gönderim başarısız</div>
        <div style={{ fontSize: 12, color: '#DC2626', opacity: .8 }}>{error}</div>
      </div>
    </div>
  ) : null;

  /* ════════════════════════════════════════
     A) GİRİŞ YAPILMIŞ
  ════════════════════════════════════════ */
  if (user) {
    const name   = user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
    const avatar = user.user_metadata?.avatar_url;

    /* Profil kartı (her zaman görünür) */
    const profilKart = (
      <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {avatar
          ? <img src={avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} /> // eslint-disable-line @next/next/no-img-element
          : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: 18, fontWeight: 700 }}>{name.charAt(0).toUpperCase()}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#15803D', marginTop: 2 }}>{user.email}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', background: '#DCFCE7', border: '1px solid #86EFAC', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          Giriş Yapıldı
        </span>
      </div>
    );

    /* ── Mod seçilmemişse: seçim ekranı ── */
    if (!mod) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {entityCard}
          {profilKart}

          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: -8 }}>Bu işletmeyi kim adına sahipleniyorsunuz?</div>

          {/* Seçim butonları */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Kendi adıma */}
            <button type="button" onClick={() => setMod('self')}
              style={{ padding: '20px 16px', borderRadius: 14, border: '2px solid #BFDBFE', background: '#EFF6FF', cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s, box-shadow .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1B3A69'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 3px rgba(27,58,105,.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#BFDBFE'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="7" r="3.5"/><path d="M3 18v-.5a7 7 0 0 1 14 0v.5"/></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1B3A69', marginBottom: 4 }}>Benim Adıma Sahiplen</div>
              <div style={{ fontSize: 12, color: '#3B82F6', lineHeight: 1.5 }}>Giriş yaptığım hesap ({user.email}) ile sahiplen</div>
            </button>

            {/* Başkası adına */}
            <button type="button" onClick={() => setMod('other')}
              style={{ padding: '20px 16px', borderRadius: 14, border: '2px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s, box-shadow .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6B7280'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 3px rgba(0,0,0,.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="3"/><circle cx="14" cy="7" r="3"/><path d="M1 17v-.5a6 6 0 0 1 11.3-2.8"/><path d="M13 13l2 2 4-4"/></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#374151', marginBottom: 4 }}>Farklı Kişi Adına Sahiplen</div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>İşletme sahibi farklıysa bilgilerini gir</div>
            </button>
          </div>
        </div>
      );
    }

    /* ── mod = 'self': kendi adına form ── */
    if (mod === 'self') {
      return (
        <form onSubmit={handleLoggedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {entityCard}
          {profilKart}

          {/* Geri */}
          <button type="button" onClick={() => setMod(null)}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, padding: 0, marginBottom: -8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
            Geri
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Ünvan <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="text" value={loggedForm.unvan} placeholder="Sahip, Yönetici, Müdür..."
                onChange={e => { setLoggedForm(f => ({ ...f, unvan: e.target.value })); setUnvanError(''); }}
                onFocus={focus} onBlur={blur(!!unvanError)} style={inp(!!unvanError)} />
              {unvanError && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{unvanError}</span>}
            </div>
            <div>
              <label style={lbl}>Telefon <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="tel" value={loggedForm.tel} placeholder="0500 000 00 00"
                onChange={e => { setLoggedForm(f => ({ ...f, tel: e.target.value })); setTelError(''); }}
                onFocus={focus} onBlur={blur(!!telError)} style={inp(!!telError)} />
              {telError && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{telError}</span>}
            </div>
          </div>

          <div>
            <label style={lbl}>Ek Mesaj <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(isteğe bağlı)</span></label>
            <textarea value={loggedForm.mesaj} rows={4}
              placeholder="Bu işletmenin sahibi olduğunuzu kanıtlayan bilgiler (vergi no, ruhsat no vb.) ekleyebilirsiniz..."
              onChange={e => setLoggedForm(f => ({ ...f, mesaj: e.target.value }))}
              onFocus={focus} onBlur={blur(false)}
              style={{ ...inp(false), resize: 'vertical', lineHeight: 1.6, minHeight: 100 }} />
          </div>

          {errorBox}

          <button type="submit" disabled={saving}
            style={{ padding: '16px', borderRadius: 13, border: 'none', background: saving ? '#6B7280' : '#1B3A69', color: 'white', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            {saving ? <><IcSpin />Gönderiliyor...</> : <><IcSend />{isClaimed ? 'İtiraz Talebini Gönder' : 'Sahiplenme Talebini Gönder'}</>}
          </button>
          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
            Bilgileriniz yalnızca doğrulama amacıyla kullanılacak ve üçüncü taraflarla paylaşılmayacaktır.
          </p>
        </form>
      );
    }

    /* ── mod = 'other': başkası adına — tam form ── */
    return (
      <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {entityCard}

        {/* Geri */}
        <button type="button" onClick={() => setMod(null)}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, padding: 0, marginBottom: -8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
          Geri
        </button>

        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 7 }} />
          İşletmeyi farklı bir kişi adına sahipleniyorsunuz. Lütfen gerçek işletme sahibinin bilgilerini girin.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={lbl}>Ad Soyad <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={guestForm.ad_soyad} placeholder="Adınız Soyadınız"
              onChange={e => setGuestForm(f => ({ ...f, ad_soyad: e.target.value }))}
              onFocus={focus} onBlur={blur(!!guestErrors.ad_soyad)} style={inp(!!guestErrors.ad_soyad)} />
            {guestErrors.ad_soyad && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{guestErrors.ad_soyad}</span>}
          </div>
          <div>
            <label style={lbl}>Ünvan <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(isteğe bağlı)</span></label>
            <input type="text" value={guestForm.unvan} placeholder="Sahip, Yönetici, Müdür..."
              onChange={e => setGuestForm(f => ({ ...f, unvan: e.target.value }))}
              onFocus={focus} onBlur={blur(false)} style={inp(false)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={lbl}>Telefon <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="tel" value={guestForm.tel} placeholder="0500 000 00 00"
              onChange={e => setGuestForm(f => ({ ...f, tel: e.target.value }))}
              onFocus={focus} onBlur={blur(!!guestErrors.tel)} style={inp(!!guestErrors.tel)} />
            {guestErrors.tel && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{guestErrors.tel}</span>}
          </div>
          <div>
            <label style={lbl}>E-posta <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="email" value={guestForm.email} placeholder="ornek@email.com"
              onChange={e => setGuestForm(f => ({ ...f, email: e.target.value }))}
              onFocus={focus} onBlur={blur(!!guestErrors.email)} style={inp(!!guestErrors.email)} />
            {guestErrors.email && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{guestErrors.email}</span>}
          </div>
        </div>

        <div>
          <label style={lbl}>Ek Mesaj <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(isteğe bağlı)</span></label>
          <textarea value={guestForm.mesaj} rows={4}
            placeholder="Bu işletmenin sahibi olduğunu kanıtlayan bilgiler (vergi no, ruhsat no vb.) ekleyebilirsiniz..."
            onChange={e => setGuestForm(f => ({ ...f, mesaj: e.target.value }))}
            onFocus={focus} onBlur={blur(false)}
            style={{ ...inp(false), resize: 'vertical', lineHeight: 1.6, minHeight: 100 }} />
        </div>

        {errorBox}

        <button type="submit" disabled={saving}
          style={{ padding: '16px', borderRadius: 13, border: 'none', background: saving ? '#6B7280' : '#1B3A69', color: 'white', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          {saving ? <><IcSpin />Gönderiliyor...</> : <><IcSend />Sahiplenme Talebini Gönder</>}
        </button>
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
          Bilgileriniz yalnızca doğrulama amacıyla kullanılacak ve üçüncü taraflarla paylaşılmayacaktır.
        </p>
      </form>
    );
  }

  /* ════════════════════════════════════════
     B) GİRİŞ YAPILMAMIŞ — tam form
  ════════════════════════════════════════ */
  return (
    <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {entityCard}

      {/* Google ile giriş önerisi */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontSize: 13, color: '#92400E', marginBottom: 12, lineHeight: 1.6 }}>
          Google hesabınızla giriş yaparsanız ad ve e-posta otomatik doldurulur, form daha hızlı tamamlanır.
        </p>
        <button type="button" onClick={handleGoogleGiris}
          style={{ width: '100%', padding: '11px', borderRadius: 11, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1A2744' }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.4z" fill="#4285F4"/>
            <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.6 42.5 14.7 48 24 48z" fill="#34A853"/>
            <path d="M10.8 28.8c-.5-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.9l8.1-5.1z" fill="#FBBC04"/>
            <path d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.5 30.5 0 24 0 14.7 0 6.6 5.5 2.7 14.1l8.1 6.2C12.7 14.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
          </svg>
          Google ile Giriş Yap
        </button>
        <p style={{ fontSize: 11, color: '#B45309', textAlign: 'center', marginTop: 8 }}>veya aşağıdan bilgilerinizi girin</p>
      </div>

      {/* Ad Soyad + Ünvan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={lbl}>Ad Soyad <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="text" value={guestForm.ad_soyad} placeholder="Adınız Soyadınız"
            onChange={e => setGuestForm(f => ({ ...f, ad_soyad: e.target.value }))}
            onFocus={focus} onBlur={blur(!!guestErrors.ad_soyad)} style={inp(!!guestErrors.ad_soyad)} />
          {guestErrors.ad_soyad && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{guestErrors.ad_soyad}</span>}
        </div>
        <div>
          <label style={lbl}>Ünvan <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(isteğe bağlı)</span></label>
          <input type="text" value={guestForm.unvan} placeholder="Sahip, Yönetici, Müdür..."
            onChange={e => setGuestForm(f => ({ ...f, unvan: e.target.value }))}
            onFocus={focus} onBlur={blur(false)} style={inp(false)} />
        </div>
      </div>

      {/* Tel + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={lbl}>Telefon <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="tel" value={guestForm.tel} placeholder="0500 000 00 00"
            onChange={e => setGuestForm(f => ({ ...f, tel: e.target.value }))}
            onFocus={focus} onBlur={blur(!!guestErrors.tel)} style={inp(!!guestErrors.tel)} />
          {guestErrors.tel && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{guestErrors.tel}</span>}
        </div>
        <div>
          <label style={lbl}>E-posta <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="email" value={guestForm.email} placeholder="ornek@email.com"
            onChange={e => setGuestForm(f => ({ ...f, email: e.target.value }))}
            onFocus={focus} onBlur={blur(!!guestErrors.email)} style={inp(!!guestErrors.email)} />
          {guestErrors.email && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>{guestErrors.email}</span>}
        </div>
      </div>

      {/* Mesaj */}
      <div>
        <label style={lbl}>Ek Mesaj <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(isteğe bağlı)</span></label>
        <textarea value={guestForm.mesaj} rows={4}
          placeholder="İşletmenizle ilgili eklemek istediklerinizi yazabilirsiniz. Bu işletmenin sahibi olduğunuzu kanıtlayan bilgiler (vergi no, ruhsat no vb.) ekleyebilirsiniz..."
          onChange={e => setGuestForm(f => ({ ...f, mesaj: e.target.value }))}
          onFocus={focus} onBlur={blur(false)}
          style={{ ...inp(false), resize: 'vertical', lineHeight: 1.6, minHeight: 100 }} />
      </div>

      {errorBox}

      <button type="submit" disabled={saving}
        style={{ padding: '16px', borderRadius: 13, border: 'none', background: saving ? '#6B7280' : '#1B3A69', color: 'white', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'background .15s' }}>
        {saving ? <><IcSpin />Gönderiliyor...</> : <><IcSend />Sahiplenme Talebini Gönder</>}
      </button>

      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
        Bilgileriniz yalnızca doğrulama amacıyla kullanılacak ve üçüncü taraflarla paylaşılmayacaktır.
      </p>
    </form>
  );
}
