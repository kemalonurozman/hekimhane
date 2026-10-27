'use client';

// ─────────────────────────────────────────────────────────────────
//  Paylaşım düğmeleri — Facebook, Instagram, X, LinkedIn, WhatsApp,
//  bağlantıyı kopyala. Instagram'ın web paylaşım adresi yok: telefonda
//  sistemin paylaşım menüsü açılır (Instagram oradan seçilir), bilgisayarda
//  bağlantı kopyalanır. Dış betik/izleyici yok — düz paylaşım bağlantıları.
// ─────────────────────────────────────────────────────────────────
import { useState } from 'react';

const IKON: Record<string, JSX.Element> = {
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3z" /></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43z" /></svg>,
  linkedin: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zm7 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4V9.5z" /></svg>,
  whatsapp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden><path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.3l-4.5 1.2z" /><path d="M9.2 8.6c-.3.6-.2 1.6.6 2.8.9 1.3 2 2.2 3.2 2.6.9.3 1.5 0 1.8-.5l.3-.6-1.5-.8-.6.6c-.6-.2-1.5-.9-1.9-1.6l.5-.7-.7-1.6-.6.1c-.4 0-.8.3-1.1.7z" fill="currentColor" stroke="none" /></svg>,
  kopya: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>,
  tamam: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>,
};

const RENK: Record<string, string> = {
  facebook: '#1877F2', instagram: '#C13584', x: '#111111', linkedin: '#0A66C2', whatsapp: '#1FA855', kopya: '#1A335E',
};

const CSS = `
.pd{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pd-baslik{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted,#6E6E73);margin-right:4px}
.pd-d{width:42px;height:42px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#fff;border:1px solid var(--border,#E5E5EA);color:var(--pd-renk);cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s,color .15s;text-decoration:none;padding:0}
.pd-d:hover{background:var(--pd-renk);color:#fff;border-color:transparent;transform:translateY(-1px);box-shadow:0 6px 16px rgba(17,28,46,.14)}
.pd-d:focus-visible{outline:2px solid var(--pd-renk);outline-offset:2px}
.pd-not{font-size:12.5px;color:var(--muted,#6E6E73);flex-basis:100%;min-height:18px}
@media (prefers-reduced-motion: reduce){.pd-d{transition:none}.pd-d:hover{transform:none}}
`;

export default function PaylasDugmeleri({ url, baslik, etiket = 'Paylaş' }: { url: string; baslik: string; etiket?: string }) {
  const [not, setNot] = useState('');
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(baslik);

  const bildir = (m: string) => { setNot(m); setTimeout(() => setNot(''), 4000); };

  async function kopyala(mesaj = 'Bağlantı kopyalandı.') {
    try { await navigator.clipboard.writeText(url); bildir(mesaj); }
    catch { bildir(url); }
  }

  async function instagram() {
    // Telefonda sistem paylaşım menüsü (Instagram, Hikâye, DM oradan seçilir)
    if (typeof navigator !== 'undefined' && 'share' in navigator && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try { await navigator.share({ title: baslik, url }); return; } catch { /* vazgeçildi */ return; }
    }
    kopyala('Bağlantı kopyalandı — Instagram hikâyenize ya da gönderinize yapıştırabilirsiniz.');
  }

  const baglanti = (ad: string, href: string, aria: string) => (
    <a key={ad} className="pd-d" href={href} target="_blank" rel="noopener noreferrer" aria-label={aria} title={aria}
      style={{ ['--pd-renk' as string]: RENK[ad] } as React.CSSProperties}>{IKON[ad]}</a>
  );

  return (
    <div className="pd">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="pd-baslik">{etiket}</span>
      {baglanti('facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`, 'Facebook’ta paylaş')}
      <button type="button" className="pd-d" onClick={instagram} aria-label="Instagram’da paylaş" title="Instagram’da paylaş"
        style={{ ['--pd-renk' as string]: RENK.instagram } as React.CSSProperties}>{IKON.instagram}</button>
      {baglanti('x', `https://twitter.com/intent/tweet?url=${u}&text=${t}`, 'X’te paylaş')}
      {baglanti('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, 'LinkedIn’de paylaş')}
      {baglanti('whatsapp', `https://wa.me/?text=${encodeURIComponent(`${baslik} ${url}`)}`, 'WhatsApp ile gönder')}
      <button type="button" className="pd-d" onClick={() => kopyala()} aria-label="Bağlantıyı kopyala" title="Bağlantıyı kopyala"
        style={{ ['--pd-renk' as string]: RENK.kopya } as React.CSSProperties}>{not && !not.startsWith('http') ? IKON.tamam : IKON.kopya}</button>
      <span className="pd-not" aria-live="polite">{not}</span>
    </div>
  );
}
