'use client';

import { useState } from 'react';

interface AboneWidgetProps {
  /** Abone tipi — 'hasta' (default) veya 'isletme' */
  tip?: 'hasta' | 'isletme';
  /** Hangi işletmeye bağlı (profil sayfasından geçilir) */
  entityId?: string;
  entityType?: string;
  entityName?: string;
  /** Görünüm: 'banner' = tam genişlik banner, 'compact' = küçük satır */
  variant?: 'banner' | 'compact';
  /** Açıklama metni override */
  description?: string;
}

export default function AboneWidget({
  tip = 'hasta',
  entityId,
  entityType,
  entityName,
  variant = 'banner',
  description,
}: AboneWidgetProps) {
  const [email,   setEmail]   = useState('');
  const [isim,    setIsim]    = useState('');
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);
  const [already, setAlready] = useState(false);
  const [err,     setErr]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { setErr('Geçerli bir e-posta girin.'); return; }
    setSending(true); setErr('');
    try {
      const res = await fetch('/api/abone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          isim:  isim.trim() || undefined,
          tip,
          kaynak: entityId ? 'profil' : 'form',
          entity_id:   entityId   || undefined,
          entity_type: entityType || undefined,
          entity_name: entityName || undefined,
        }),
      });
      const data = await res.json();
      if (data.already) { setAlready(true); }
      else if (data.ok)  { setDone(true); }
      else               { setErr(data.error || 'Bir hata oluştu.'); }
    } catch {
      setErr('Bağlantı hatası.');
    } finally {
      setSending(false);
    }
  };

  const inp: React.CSSProperties = {
    padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E5E5EA',
    fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white',
    color: '#1C2B4A', flex: 1, minWidth: 0,
  };

  if (done) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>
        Abone oldunuz! Güncellemelerden haberdar edileceksiniz.
      </span>
    </div>
  );

  if (already) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style={{ fontSize: 13, color: '#1D4ED8', fontWeight: 600 }}>
        Bu e-posta zaten kayıtlı. Bildirimleri alacaksınız.
      </span>
    </div>
  );

  if (variant === 'compact') return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <input value={email} onChange={e => { setEmail(e.target.value); setErr(''); }}
        placeholder="E-posta adresiniz" type="email" style={{ ...inp, minWidth: 200 }} />
      <button type="submit" disabled={sending}
        style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#1B3A69', color: 'white', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        {sending ? 'Kaydediliyor…' : 'Haberdar Ol'}
      </button>
      {err && <span style={{ fontSize: 12, color: '#DC2626', width: '100%' }}>{err}</span>}
    </form>
  );

  // Banner variant
  return (
    <div style={{ background: 'linear-gradient(135deg,#F0F4FF,#E8EEFF)', border: '1px solid #C7D2FE', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: '#1B3A69', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1C2B4A', marginBottom: 3 }}>
            {tip === 'isletme'
              ? (entityName ? `${entityName} — Güncellemelerden Haberdar Olun` : 'İşletme Güncellemeleri')
              : 'Sağlık Haberleri & Güncellemeler'}
          </div>
          <div style={{ fontSize: 12.5, color: '#6E6E73', lineHeight: 1.6 }}>
            {description || (tip === 'isletme'
              ? 'Yeni özellikler, fırsatlar ve hizmet güncellemeleri için abone olun.'
              : `${entityName ? `${entityName} adresindeki` : 'Sağlık'} yeniliklerden, kampanyalardan ve önemli duyurulardan haberdar olun.`
            )}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={isim} onChange={e => setIsim(e.target.value)}
          placeholder="Adınız (opsiyonel)" style={{ ...inp, flex: '0 1 160px' }} />
        <input value={email} onChange={e => { setEmail(e.target.value); setErr(''); }}
          placeholder="E-posta adresiniz *" type="email" required style={{ ...inp }} />
        <button type="submit" disabled={sending}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#1B3A69', color: 'white', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
          {sending
            ? <><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation: 'abone-spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg> Kaydediliyor…</>
            : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                Abone Ol
              </>
          }
        </button>
      </form>
      {err && <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>{err}</div>}
      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '10px 0 0' }}>İstediğiniz zaman abonelikten çıkabilirsiniz.</p>
      <style>{`@keyframes abone-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
