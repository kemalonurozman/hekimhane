'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

/* ── SVG ikonlar ─────────────────────────────────────────── */
function IcMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2"/>
      <path d="M2 7l8 5 8-5"/>
    </svg>
  );
}
function IcCheck() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2"/>
      <path d="M14 24l7 7 13-14" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#D97706" strokeWidth="1.4"/>
      <path d="M8 7v4M8 5.5v.5" stroke="#D97706" strokeWidth="1.4" strokeLinecap="round"/>
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
function IcLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="14" height="10" rx="2"/>
      <path d="M7 9V6a3 3 0 0 1 6 0v3"/>
    </svg>
  );
}
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ── Logo ────────────────────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <rect width="34" height="34" rx="10" fill="#1B3A69"/>
      <path d="M10 17h14M17 10v14" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
      <rect x="7" y="20" width="20" height="4" rx="2" fill="#D4A843"/>
    </svg>
  );
}

/* ── Google SVG ──────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.4z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.6 42.5 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.8 28.8c-.5-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.9l8.1-5.1z" fill="#FBBC04"/>
      <path d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.5 30.5 0 24 0 14.7 0 6.6 5.5 2.7 14.1l8.1 6.2C12.7 14.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────── */
function GirisContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/panel';
  const urlError     = searchParams.get('error');

  // Mod: 'magic' | 'password' | 'signup'
  const [mod,        setMod]        = useState<'magic' | 'password' | 'signup'>('magic');
  const [kullaniciTip, setKullaniciTip] = useState<'hasta' | 'isletme'>('hasta');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [password2,  setPassword2]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [showPw2,    setShowPw2]    = useState(false);
  const [sending,    setSending]    = useState(false);
  const [magicSent,  setMagicSent]  = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [emailError, setEmailError] = useState('');

  /** E-posta listesine kaydet (arka planda, hata bastırılır) */
  async function saveToAboneList(emailAddr: string, tip: 'hasta' | 'isletme', kaynak: string) {
    try {
      await fetch('/api/abone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddr, tip, kaynak }),
      });
    } catch {}
  }

  /* Google OAuth */
  async function handleGoogleGiris() {
    const supabase = createSupabaseBrowser();
    const callbackUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  }

  /* Magic Link */
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Lütfen e-posta adresinizi girin.'); return; }
    setSending(true);
    setEmailError('');
    const supabase = createSupabaseBrowser();
    const callbackUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl },
    });
    setSending(false);
    if (error) {
      if (error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('email rate')) {
        setEmailError('Çok fazla deneme yapıldı. Lütfen 1 saat bekleyin.');
      } else {
        setEmailError(error.message || 'Bir hata oluştu.');
      }
    } else {
      setMagicSent(true);
      saveToAboneList(email.trim(), kullaniciTip, 'giris');
    }
  }

  /* Şifre ile giriş */
  async function handlePasswordGiris(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setEmailError('E-posta ve şifre gerekli.'); return; }
    setSending(true);
    setEmailError('');
    try {
      const supabase = createSupabaseBrowser();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setSending(false);
      if (err) {
        const msg = err.message?.toLowerCase() ?? '';
        if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('credentials')) {
          setEmailError('E-posta veya şifre hatalı. Şifrenizi doğru girdiğinizden emin olun.');
        } else if (msg.includes('email not confirmed')) {
          setEmailError('E-posta adresi henüz doğrulanmamış. Gelen kutunuzu kontrol edin.');
        } else if (msg.includes('load failed') || msg.includes('failed to fetch') || msg.includes('network')) {
          setEmailError('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
        } else {
          setEmailError(err.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
        }
        return;
      }
      if (data?.session) {
        saveToAboneList(email.trim(), kullaniciTip, 'giris');
        router.replace(redirect);
      }
    } catch {
      setSending(false);
      setEmailError('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    }
  }

  /* Hesap oluştur */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setEmailError('E-posta ve şifre gerekli.'); return; }
    if (password.length < 6) { setEmailError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (password !== password2) { setEmailError('Şifreler eşleşmiyor.'); return; }
    setSending(true); setEmailError('');
    try {
      const supabase = createSupabaseBrowser();
      const callbackUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`;
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: callbackUrl },
      });
      setSending(false);
      if (err) {
        const msg = err.message?.toLowerCase() ?? '';
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          setEmailError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
        } else if (msg.includes('password')) {
          setEmailError('Şifre en az 6 karakter olmalıdır.');
        } else {
          setEmailError(err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
      } else {
        setSignupDone(true);
        saveToAboneList(email.trim(), kullaniciTip, 'kayit');
      }
    } catch {
      setSending(false);
      setEmailError('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    }
  }

  /* Ortak stil nesneleri */
  const card: React.CSSProperties = {
    background: 'white', borderRadius: 24,
    border: '1px solid var(--border)',
    boxShadow: '0 20px 60px rgba(27,58,105,.10)',
    padding: '44px 40px', width: '100%', maxWidth: 420,
    textAlign: 'center',
  };
  const btn: React.CSSProperties = {
    width: '100%', padding: '13px 20px', borderRadius: 13,
    border: '1.5px solid #E2E8F0', background: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    fontSize: 15, fontWeight: 600, color: '#1A2744',
    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
    transition: 'all .15s',
  };

  return (
    <div style={{
      minHeight: '100vh', paddingTop: 66,
      background: 'linear-gradient(135deg, #F0F4FF 0%, #E8EDF8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 16px',
    }}>
      <div style={card}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <LogoMark />
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--navy)', letterSpacing: '-0.3px' }}>Hekimhane</span>
        </div>

        {/* --- Hesap oluşturma başarılı --- */}
        {signupDone ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <IcCheck />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 10 }}>
              Hesabınız Oluşturuldu!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              <strong style={{ color: 'var(--navy)' }}>{email}</strong> adresine doğrulama bağlantısı gönderdik.
              Lütfen gelen kutunuzu kontrol edin ve bağlantıya tıklayarak hesabınızı onaylayın.
            </p>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', marginBottom: 20 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><IcInfo /></span>
              <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
                E-posta birkaç dakika sürebilir. Spam/Junk klasörünü de kontrol etmeyi unutmayın.
              </p>
            </div>
            <button onClick={() => { setSignupDone(false); setEmail(''); setPassword(''); setPassword2(''); setMod('password'); }}
              style={{ ...btn, color: 'var(--muted)', fontSize: 13, border: '1px solid var(--border)' }}>
              Giriş sayfasına dön
            </button>
          </div>
        ) :

        /* --- Magic link gönderildi durumu --- */
        magicSent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <IcCheck />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 10 }}>
              E-posta Gönderildi
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              <strong style={{ color: 'var(--navy)' }}>{email}</strong> adresine giriş bağlantısı gönderdik.
              Gelen kutunuzu kontrol edin ve bağlantıya tıklayın.
            </p>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', marginBottom: 20 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><IcInfo /></span>
              <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
                E-posta birkaç dakika sürebilir. Spam/Junk klasörünü de kontrol etmeyi unutmayın.
              </p>
            </div>
            <button
              onClick={() => { setMagicSent(false); setEmail(''); }}
              style={{ ...btn, color: 'var(--muted)', fontSize: 13, border: '1px solid var(--border)' }}
            >
              Farklı e-posta dene
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>
              Hoş Geldiniz
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              İşletmenizi sahiplenin, yorumlarınızı yönetin,<br />profilinizi güncelleyin.
            </p>

            {/* Hata (URL'den gelen) */}
            {urlError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, textAlign: 'left' }}>
                <IcWarning />
                <span style={{ color: '#DC2626', fontSize: 13 }}>Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.</span>
              </div>
            )}

            {/* Google ile giriş */}
            <button onClick={handleGoogleGiris} style={btn}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E0'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.10)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; }}
            >
              <GoogleIcon />
              Google ile Devam Et
            </button>

            {/* Ayraç */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>veya e-posta ile</span>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            </div>

            {/* Kullanıcı tipi seçici */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {([
                { key: 'hasta',    emoji: '👤', label: 'Hasta / Ziyaretçi' },
                { key: 'isletme',  emoji: '🏥', label: 'Doktor / İşletme' },
              ] as const).map(t => (
                <button key={t.key} type="button"
                  onClick={() => setKullaniciTip(t.key)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${kullaniciTip === t.key ? '#1B3A69' : '#E5E7EB'}`,
                    background: kullaniciTip === t.key ? '#EFF6FF' : 'white',
                    color: kullaniciTip === t.key ? '#1B3A69' : '#6B7280',
                    fontSize: 12, fontWeight: 700, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  <span>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Mod seçici: Magic Link / Şifre / Hesap Oluştur */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 18 }}>
              {([
                { key: 'magic',    label: 'Bağlantı' },
                { key: 'password', label: 'Giriş Yap' },
                { key: 'signup',   label: 'Kayıt Ol' },
              ] as const).map(m => (
                <button key={m.key}
                  onClick={() => { setMod(m.key); setEmailError(''); setPassword(''); setPassword2(''); }}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 12.5, fontWeight: 600, transition: 'all .15s',
                    background: mod === m.key ? 'white' : 'transparent',
                    color: mod === m.key ? 'var(--navy)' : '#9CA3AF',
                    boxShadow: mod === m.key ? '0 1px 4px rgba(0,0,0,.10)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={mod === 'magic' ? handleMagicLink : mod === 'signup' ? handleSignup : handlePasswordGiris} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>
                E-posta Adresi
              </label>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex', pointerEvents: 'none' }}>
                  <IcMail />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="ornek@email.com"
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
                    border: `1.5px solid ${emailError ? '#FCA5A5' : '#E5E7EB'}`,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#1B3A69')}
                  onBlur={e => (e.currentTarget.style.borderColor = emailError ? '#FCA5A5' : '#E5E7EB')}
                />
              </div>

              {/* Şifre alanı — password veya signup modunda */}
              {(mod === 'password' || mod === 'signup') && (
                <>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>
                    Şifre {mod === 'signup' && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(en az 6 karakter)</span>}
                  </label>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex', pointerEvents: 'none' }}>
                      <IcLock />
                    </span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setEmailError(''); }}
                      placeholder="••••••••"
                      style={{
                        width: '100%', padding: '12px 40px 12px 40px',
                        borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
                        border: `1.5px solid ${emailError ? '#FCA5A5' : '#E5E7EB'}`,
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#1B3A69')}
                      onBlur={e => (e.currentTarget.style.borderColor = emailError ? '#FCA5A5' : '#E5E7EB')}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </>
              )}

              {/* Şifre tekrar — yalnızca signup modunda */}
              {mod === 'signup' && (
                <>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>
                    Şifre Tekrar
                  </label>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex', pointerEvents: 'none' }}>
                      <IcLock />
                    </span>
                    <input
                      type={showPw2 ? 'text' : 'password'}
                      value={password2}
                      onChange={e => { setPassword2(e.target.value); setEmailError(''); }}
                      placeholder="••••••••"
                      style={{
                        width: '100%', padding: '12px 40px 12px 40px',
                        borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
                        border: `1.5px solid ${emailError && password2 && password !== password2 ? '#FCA5A5' : '#E5E7EB'}`,
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#1B3A69')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                    />
                    <button type="button" onClick={() => setShowPw2(!showPw2)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                      <EyeIcon open={showPw2} />
                    </button>
                  </div>
                </>
              )}

              {emailError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <IcWarning />
                  <span style={{ fontSize: 12, color: '#DC2626' }}>{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%', padding: '13px 20px', borderRadius: 13,
                  border: 'none', background: 'var(--navy)', color: 'white',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: sending ? 0.7 : 1,
                  transition: 'opacity .15s',
                  fontFamily: 'inherit',
                }}
              >
                {sending ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {mod === 'magic' ? 'Gönderiliyor...' : mod === 'signup' ? 'Hesap oluşturuluyor...' : 'Giriş yapılıyor...'}
                  </>
                ) : mod === 'magic' ? (
                  <>
                    <IcMail />
                    Giriş Bağlantısı Gönder
                  </>
                ) : mod === 'signup' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    Hesap Oluştur
                  </>
                ) : (
                  <>
                    <IcLock />
                    Giriş Yap
                  </>
                )}
              </button>
            </form>

            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 20, lineHeight: 1.7 }}>
              Devam ederek{' '}
              <a href="/gizlilik" style={{ color: 'var(--navy)' }}>Gizlilik Politikası</a>{'\''}nı ve{' '}
              <a href="/kosullar" style={{ color: 'var(--navy)' }}>Kullanım Koşulları</a>{'\''}nı
              kabul etmiş olursunuz.
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={null}>
      <GirisContent />
    </Suspense>
  );
}
