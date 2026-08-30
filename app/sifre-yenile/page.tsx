'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

/**
 * Şifre yenileme — e-postadaki tek kullanımlık bağlantıdan gelinir
 * (?token_hash=...). Token gönderim anında değil, form gönderilince doğrulanır:
 * sayfayı açıp bırakmak token'ı tüketmez.
 */
function SifreYenileContent() {
  const router = useRouter();
  const tokenHash = useSearchParams().get('token_hash') || '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [hata, setHata] = useState('');
  const [durum, setDurum] = useState<'form' | 'calisiyor' | 'tamam'>('form');
  // verifyOtp bir kez başarılı olduysa token tüketilmiştir; hatada yalnızca
  // updateUser'ı tekrar deneriz.
  const [oturumHazir, setOturumHazir] = useState(false);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    if (pw.length < 6) { setHata('Şifre en az 6 karakter olmalıdır.'); return; }
    if (pw !== pw2) { setHata('Şifreler eşleşmiyor.'); return; }
    setDurum('calisiyor');

    const supabase = createSupabaseBrowser();
    try {
      if (!oturumHazir) {
        const { error: vErr } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
        if (vErr) {
          setHata('Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin.');
          setDurum('form');
          return;
        }
        setOturumHazir(true);
      }
      const { error: uErr } = await supabase.auth.updateUser({ password: pw });
      if (uErr) {
        const m = uErr.message?.toLowerCase() || '';
        setHata(m.includes('different from the old')
          ? 'Yeni şifre eski şifrenizle aynı olamaz.'
          : (uErr.message || 'Şifre güncellenemedi. Lütfen tekrar deneyin.'));
        setDurum('form');
        return;
      }
      setDurum('tamam');
      setTimeout(() => router.replace('/panel'), 2200);
    } catch {
      setHata('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      setDurum('form');
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 42px', borderRadius: 12, fontSize: 15,
    border: `1.5px solid ${hata ? '#FCA5A5' : '#E2E8F0'}`, background: '#F8FAFC',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 66, background: '#EEF2F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 12px 44px rgba(27,58,105,.13)', padding: '40px 34px', width: '100%', maxWidth: 400, textAlign: 'center', margin: '24px 16px' }}>

        <div style={{ width: 52, height: 52, borderRadius: 15, background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>

        {!tokenHash ? (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.5px', margin: '0 0 10px' }}>Bağlantı eksik</h1>
            <p style={{ color: '#86868B', fontSize: 14, lineHeight: 1.6, margin: '0 0 22px' }}>
              Bu sayfaya e-postanızdaki şifre sıfırlama bağlantısıyla ulaşmanız gerekiyor.
            </p>
            <a href="/giris" style={{ display: 'inline-block', padding: '12px 26px', borderRadius: 12, background: '#1B3A69', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Giriş sayfasına dön</a>
          </>
        ) : durum === 'tamam' ? (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.5px', margin: '0 0 10px' }}>Şifreniz güncellendi</h1>
            <p style={{ color: '#86868B', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Giriş yapıldı — panelinize yönlendiriliyorsunuz…
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.5px', margin: '0 0 8px' }}>Yeni şifre belirleyin</h1>
            <p style={{ color: '#86868B', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              Hesabınız için yeni bir şifre oluşturun.
            </p>

            <form onSubmit={gonder} style={{ textAlign: 'left' }}>
              {(['Yeni Şifre', 'Yeni Şifre (Tekrar)'] as const).map((etiket, i) => (
                <div key={etiket}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#48484A', marginBottom: 8 }}>
                    {etiket} {i === 0 && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(en az 6 karakter)</span>}
                  </label>
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex', pointerEvents: 'none' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input
                      type={show ? 'text' : 'password'}
                      value={i === 0 ? pw : pw2}
                      onChange={e => { (i === 0 ? setPw : setPw2)(e.target.value); setHata(''); }}
                      placeholder="••••••••"
                      style={inp}
                      autoComplete="new-password"
                    />
                    {i === 0 && (
                      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                        {show
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {hata && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: 12.5, color: '#DC2626', lineHeight: 1.5 }}>
                    {hata}{hata.includes('geçersiz') && <>{' '}<a href="/giris" style={{ color: '#1B3A69', fontWeight: 700 }}>Yeni bağlantı iste</a></>}
                  </span>
                </div>
              )}

              <button type="submit" disabled={durum === 'calisiyor'}
                style={{ width: '100%', padding: '13px 20px', borderRadius: 13, border: 'none', background: '#1B3A69', color: 'white', fontSize: 15, fontWeight: 700, cursor: durum === 'calisiyor' ? 'not-allowed' : 'pointer', opacity: durum === 'calisiyor' ? 0.65 : 1, fontFamily: 'inherit', marginTop: 4 }}>
                {durum === 'calisiyor' ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function SifreYenilePage() {
  return (
    <Suspense fallback={null}>
      <SifreYenileContent />
    </Suspense>
  );
}
