'use client';

/**
 * Makale kapak görseli — tek fotoğraf yükleyici.
 * Yükleme /api/panel/upload-photo üzerinden Supabase Storage'a gider ve
 * public URL döner; URL çağıran formun cover_image alanına yazılır.
 * Hem panel (açık tema) hem admin (koyu tema) kullanır.
 */
import { useRef, useState } from 'react';

const MAX_MB = 8;
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export default function MakaleGorselYukle({
  value, onChange, dark = false,
}: {
  value: string;
  onChange: (url: string) => void;
  dark?: boolean;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [surukle, setSurukle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const T = dark
    ? { border: 'rgba(255,255,255,.12)', bg: 'rgba(255,255,255,.03)', text: 'rgba(255,255,255,.92)', muted: 'rgba(255,255,255,.42)', aksan: '#D4A843' }
    : { border: '#E2E8F4', bg: '#F8FAFF', text: '#1A2744', muted: '#6B7A99', aksan: '#1B3A69' };

  async function yukle(file: File) {
    setHata('');
    if (!ALLOWED.includes(file.type)) { setHata('JPEG, PNG, WebP veya GIF yükleyin.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setHata(`Dosya ${MAX_MB} MB'dan büyük olamaz.`); return; }

    setYukleniyor(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/panel/upload-photo', { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.url) throw new Error(d?.error || 'Yükleme başarısız');
      onChange(d.url);
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Yükleme başarısız');
    } finally {
      setYukleniyor(false);
    }
  }

  const sec = () => inputRef.current?.click();

  return (
    <div>
      <input ref={inputRef} type="file" accept={ALLOWED.join(',')} style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) yukle(f); e.target.value = ''; }} />

      {value ? (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', background: T.bg }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Makale kapak görseli"
            style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: `1px solid ${T.border}` }}>
            <button type="button" onClick={sec} disabled={yukleniyor}
              style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: 'transparent', color: T.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {yukleniyor ? 'Yükleniyor…' : 'Değiştir'}
            </button>
            <button type="button" onClick={() => { onChange(''); setHata(''); }}
              style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,.35)', background: 'rgba(239,68,68,.08)', color: '#EF4444', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Kaldır
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={sec}
          onDragOver={e => { e.preventDefault(); setSurukle(true); }}
          onDragLeave={() => setSurukle(false)}
          onDrop={e => { e.preventDefault(); setSurukle(false); const f = e.dataTransfer.files?.[0]; if (f) yukle(f); }}
          style={{
            border: `1.5px dashed ${surukle ? T.aksan : T.border}`, borderRadius: 12,
            background: surukle ? (dark ? 'rgba(212,168,67,.08)' : '#EEF3FF') : T.bg,
            padding: '26px 18px', textAlign: 'center', cursor: 'pointer', transition: 'border-color .15s, background .15s',
          }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.6" strokeLinecap="round" style={{ marginBottom: 8 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
          </svg>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 4 }}>
            {yukleniyor ? 'Yükleniyor…' : 'Kapak görseli yükleyin'}
          </div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
            Sürükleyip bırakın veya tıklayın · JPEG, PNG, WebP · en fazla {MAX_MB} MB
          </div>
        </div>
      )}

      {hata && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#EF4444' }}>{hata}</div>
      )}
    </div>
  );
}
