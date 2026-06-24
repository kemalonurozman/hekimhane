'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.4z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.6 42.5 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.8 28.8c-.5-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.9l8.1-5.1z" fill="#FBBC04"/>
      <path d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.5 30.5 0 24 0 14.7 0 6.6 5.5 2.7 14.1l8.1 6.2C12.7 14.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
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

function AdminGirisContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const redirect    = searchParams.get('redirect') || '/admin';

  const [email,    setEmail]    = useState('kemalonurozman@gmail.com');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleGoogleGiris() {
    const supabase   = createSupabaseBrowser();
    const callbackUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl, queryParams: { access_type: 'offline', prompt: 'consent' } },
    });
  }

  async function handlePasswordGiris(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError('E-posta ve şifre gerekli.'); return; }
    setLoading(true);
    setError('');
    const supabase = createSupabaseBrowser();
    let data, err;
    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      data = result.data;
      err  = result.error;
    } catch {
      setLoading(false);
      setError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
      return;
    }
    setLoading(false);
    if (err) {
      if (err.message?.toLowerCase().includes('invalid login') || err.message?.toLowerCase().includes('invalid credentials')) {
        setError('E-posta veya şifre hatalı. Şifre henüz ayarlanmamış olabilir.');
      } else if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError('E-posta adresi onaylanmamış.');
      } else {
        setError(err.message || 'Giriş başarısız.');
      }
      return;
    }
    if (data?.session) {
      router.replace(redirect);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1628 0%, #0F2041 50%, #091529 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(212,168,67,.04)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(27,58,105,.15)', filter: 'blur(50px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #1B3A69, #0F2A55)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.4)' }}>
              <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
                <path d="M10 17h14M17 10v14" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                <rect x="7" y="20" width="20" height="4" rx="2" fill="#D4A843"/>
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Hekimhane</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>Admin Yönetim Sistemi</div>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.25)', borderRadius: 20, padding: '5px 14px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#D4A843', letterSpacing: '0.5px' }}>YÖNETİCİ GİRİŞİ</span>
          </div>
        </div>

        {/* Kart */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-0.3px', textAlign: 'center' }}>Güvenli Giriş</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 24, textAlign: 'center' }}>Yönetim paneline giriş yapın</p>

          {/* Google */}
          <button onClick={handleGoogleGiris} style={{ width: '100%', padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'inherit', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'; }}>
            <GoogleIcon /> Google ile Giriş Yap
          </button>

          {/* Ayraç */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 500 }}>veya şifre ile</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
          </div>

          {/* Şifre formu */}
          <form onSubmit={handlePasswordGiris} style={{ textAlign: 'left' }}>
            {/* E-posta */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-posta</label>
            <input
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@email.com"
              style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.05)', color: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)')}
            />

            {/* Şifre */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Şifre</label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 40px 11px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.05)', color: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)')}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', padding: 0, display: 'flex' }}>
                <EyeIcon open={showPw} />
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 9, padding: '9px 12px', fontSize: 12, color: '#EF4444', marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 11, border: 'none', background: loading ? 'rgba(212,168,67,.5)' : '#D4A843', color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .15s' }}>
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Giriş yapılıyor...
                </>
              ) : 'Giriş Yap'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>← Ana Sayfaya Dön</a>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}

export default function AdminGirisPage() {
  return (
    <Suspense fallback={null}>
      <AdminGirisContent />
    </Suspense>
  );
}
