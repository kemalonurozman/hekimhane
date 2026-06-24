'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

interface Props {
  reviewId: string;
}

export default function YorumYanitla({ reviewId }: Props) {
  const [text, setText]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [open, setOpen]         = useState(false);

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);

    const supabase = createSupabaseBrowser();
    const { error } = await (supabase as any)
      .from('yorumlar')
      .update({ reply_text: text.trim(), reply_at: new Date().toISOString() })
      .eq('id', reviewId);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => window.location.reload(), 800);
    } else {
      alert(`Yanıt kaydedilemedi: ${error.message}`);
    }
  }

  if (saved) {
    return (
      <div style={{ padding: '14px 20px', background: '#F0FDF4', color: '#166534', fontSize: '13px', fontWeight: 600 }}>
        <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }} />
        Yanıtınız kaydedildi!
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 20px' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn btn-navy"
          style={{ fontSize: '13px', padding: '8px 16px', display: 'inline-flex', gap: '6px' }}
        >
          <i className="fa-solid fa-reply" /> Yanıtla
        </button>
      ) : (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
            <i className="fa-solid fa-reply" style={{ marginRight: '6px' }} />
            İşletme Yanıtı
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Bu yorum için resmi yanıtınızı yazın. Bu yanıt, yorum sayfasında herkese görünür olacaktır."
            rows={4}
            autoFocus
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: '1.5px solid var(--navy)', fontSize: '14px',
              outline: 'none', fontFamily: 'inherit', lineHeight: '1.6',
              resize: 'vertical', boxSizing: 'border-box', color: 'var(--text)',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="btn btn-navy"
              style={{ fontSize: '13px', padding: '8px 20px', opacity: (!text.trim() || saving) ? 0.6 : 1 }}
            >
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }} />Kaydediliyor...</>
                : <><i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }} />Yanıtı Yayınla</>
              }
            </button>
            <button
              onClick={() => { setOpen(false); setText(''); }}
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', color: 'var(--muted)' }}
            >
              İptal
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
            Bu yanıt işletmeniz adına yayınlanacak ve tüm kullanıcılara görünür olacaktır.
          </p>
        </div>
      )}
    </div>
  );
}
