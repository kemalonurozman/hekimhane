'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export default function HesapAktivasyon() {
  const router = useRouter();
  const [token, setToken]     = useState('');
  const [phase, setPhase]     = useState<'loading' | 'form' | 'invalid' | 'done'>('loading');
  const [email, setEmail]     = useState('');
  const [entity, setEntity]   = useState<string | null>(null);
  const [pw, setPw]           = useState('');
  const [pw2, setPw2]         = useState('');
  const [err, setErr]         = useState('');
  const [busy, setBusy]       = useState(false);

  // Token'ı doğrula, e-postayı ön-doldur (GET token'ı tüketmez → mail önden-yükleme sorunu yok)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token') || '';
    setToken(t);
    if (!t) { setErr('Geçersiz bağlantı.'); setPhase('invalid'); return; }
    (async () => {
      try {
        const res = await fetch(`/api/hesap/aktivasyon?token=${encodeURIComponent(t)}`);
        const j = await res.json();
        if (j.ok) { setEmail(j.email); setEntity(j.entity_name || null); setPhase('form'); }
        else { setErr(j.error || 'Bağlantı geçersiz.'); setPhase('invalid'); }
      } catch { setErr('Bağlantı doğrulanamadı.'); setPhase('invalid'); }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (pw.length < 6) { setErr('Şifre en az 6 karakter olmalı.'); return; }
    if (pw !== pw2)    { setErr('Şifreler eşleşmiyor.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/hesap/aktivasyon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      });
      const j = await res.json();
      if (!j.ok) { setErr(j.error || 'Şifre belirlenemedi.'); setBusy(false); return; }
      // Şifre belirlendi → otomatik giriş
      const supabase = createSupabaseBrowser();
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: j.email, password: pw });
      if (signErr) {
        // Giriş başarısızsa yine de giriş sayfasına yönlendir (e-posta dolu)
        setPhase('done');
        setTimeout(() => router.replace(`/giris?email=${encodeURIComponent(j.email)}`), 1500);
        return;
      }
      setPhase('done');
      setTimeout(() => router.replace('/panel'), 1200);
    } catch { setErr('Bir hata oluştu, tekrar deneyin.'); setBusy(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 11, border: '1px solid #E5E5EA',
    background: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2', padding: 20, paddingTop: 84, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 22, border: '1px solid #EEE7DA', boxShadow: '0 12px 40px rgba(27,58,105,.10)', overflow: 'hidden' }}>
        {/* Başlık bandı */}
        <div style={{ background: 'linear-gradient(150deg,#0F2A55,#1B3A69)', padding: '26px 28px 22px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 40 40"><path d="M20 8.2c-2.9 0-4.3-1.5-6.9-1.5-2.4 0-4.2 1.9-4.2 4.9 0 2.3.9 4.3 1.5 6.4.5 1.9.7 3.6.9 5.6.2 2 .5 4.1 1.1 5.8.5 1.4 1.2 2.4 2.2 2.4 1.1 0 1.6-1.2 1.9-2.9.3-1.7.5-3.6 1.1-5.1.2-.6.6-1.1 1.3-1.1s1.1.5 1.3 1.1c.6 1.5.8 3.4 1.1 5.1.3 1.7.8 2.9 1.9 2.9 1 0 1.7-1 2.2-2.4.6-1.7.9-3.8 1.1-5.8.2-2 .4-3.7.9-5.6.6-2.1 1.5-4.1 1.5-6.4 0-3-1.8-4.9-4.2-4.9C24.3 6.7 22.9 8.2 20 8.2Z" fill="#1B3A69" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>Hekimhane</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 4px' }}>Hesabını Etkinleştir</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', margin: 0, lineHeight: 1.5 }}>
            {entity ? `${entity} için ` : ''}şifreni belirle, panele giriş yap.
          </p>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {phase === 'loading' && (
            <div style={{ textAlign: 'center', color: '#6E6E73', fontSize: 13.5, padding: '20px 0' }}>Bağlantı doğrulanıyor…</div>
          )}

          {phase === 'invalid' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </div>
              <p style={{ fontSize: 14, color: '#1D1D1F', fontWeight: 600, margin: '0 0 6px' }}>{err}</p>
              <a href="/giris" style={{ display: 'inline-block', marginTop: 12, padding: '11px 22px', borderRadius: 11, background: '#1B3A69', color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>Giriş Sayfasına Git</a>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <p style={{ fontSize: 14.5, color: '#1D1D1F', fontWeight: 700, margin: '0 0 4px' }}>Şifren belirlendi!</p>
              <p style={{ fontSize: 12.5, color: '#6E6E73', margin: 0 }}>Panele yönlendiriliyorsun…</p>
            </div>
          )}

          {phase === 'form' && (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 5 }}>E-posta</label>
              <input value={email} readOnly style={{ ...inputStyle, background: '#F4F6FB', color: '#3A3A3C', marginBottom: 14 }} />

              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 5 }}>Yeni Şifre</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="En az 6 karakter" autoComplete="new-password" style={{ ...inputStyle, marginBottom: 14 }} />

              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 5 }}>Yeni Şifre (Tekrar)</label>
              <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Şifreyi tekrar girin" autoComplete="new-password" style={{ ...inputStyle, marginBottom: 6 }} />

              {err && <div style={{ fontSize: 12.5, color: '#DC2626', fontWeight: 600, margin: '8px 0 0' }}>{err}</div>}

              <button type="submit" disabled={busy}
                style={{ width: '100%', marginTop: 18, padding: '13px', borderRadius: 12, background: '#1B3A69', color: '#fff', border: 'none', fontSize: 14.5, fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.65 : 1, fontFamily: 'inherit' }}>
                {busy ? 'İşleniyor…' : 'Şifreyi Belirle & Panele Gir'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
