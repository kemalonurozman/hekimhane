'use client';

import { useState } from 'react';

interface Props {
  reviewId: string;
  reportStatus?: string | null;   // null | 'pending' | 'resolved' | 'dismissed'
  reportReason?: string | null;
}

// Şikayet durumuna göre rozet
function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: 'Şikayet inceleniyor', bg: '#FEF3C7', color: '#92400E' },
    resolved:  { label: 'Kaldırıldı / gizlendi', bg: '#DCFCE7', color: '#166534' },
    dismissed: { label: 'Şikayet reddedildi', bg: '#F3F4F6', color: '#4B5563' },
  };
  const m = s[status];
  if (!m) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: m.bg, color: m.color }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      {m.label}
    </span>
  );
}

export default function YorumSikayet({ reviewId, reportStatus, reportReason }: Props) {
  const [open, setOpen]     = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  // Sonuçlanmış (resolved/dismissed) şikayetlerde sadece durum rozeti göster
  if (reportStatus === 'resolved' || reportStatus === 'dismissed') {
    return (
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <StatusBadge status={reportStatus} />
      </div>
    );
  }

  // Bekleyen şikayet — rozet + gerekçe
  if (reportStatus === 'pending' && !done) {
    return (
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <StatusBadge status="pending" />
        {reportReason && (
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0' }}>
            Gerekçeniz: “{reportReason}” — yönetici en kısa sürede değerlendirecek.
          </p>
        )}
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <StatusBadge status="pending" />
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0' }}>
          Şikayetiniz alındı. Yönetici değerlendirdikten sonra sonuç burada görünecek.
        </p>
      </div>
    );
  }

  async function submit() {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/panel/report-yorum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yorumId: reviewId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Şikayet gönderilemedi.'); setSaving(false); return; }
      setDone(true);
    } catch {
      alert('Şikayet gönderilemedi. Bağlantınızı kontrol edin.');
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '6px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'white', color: '#B91C1C', cursor: 'pointer' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Bu yorumu şikayet et
        </button>
      ) : (
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#B91C1C', marginBottom: 8 }}>
            Bu yorumu neden şikayet ediyorsunuz?
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Örn. Bu yorum işletmemize ait değil / hakaret içeriyor / sahte bir yorum. Gerekçenizi kısaca açıklayın."
            rows={3}
            autoFocus
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #FCA5A5', fontSize: 14, outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', color: 'var(--text)' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={submit}
              disabled={!reason.trim() || saving}
              style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 10, border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer', opacity: (!reason.trim() || saving) ? 0.6 : 1 }}
            >
              {saving ? 'Gönderiliyor…' : 'Şikayeti Gönder'}
            </button>
            <button
              onClick={() => { setOpen(false); setReason(''); }}
              style={{ fontSize: 13, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', color: 'var(--muted)' }}
            >
              Vazgeç
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            Şikayetiniz yöneticiye iletilir. Yorumun görünürlüğüne yalnızca yönetici karar verir.
          </p>
        </div>
      )}
    </div>
  );
}
