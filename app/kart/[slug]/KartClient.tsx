'use client';

import { useState, useEffect } from 'react';
import type { KartData, KartYorum } from './page';

/* ── Yorum tarihi biçimlendir (YYYY-MM veya ISO) ── */
function fmtRevDate(raw?: string | null): string {
  if (!raw) return '';
  const AYLAR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const m = String(raw).match(/^(\d{4})-(\d{2})/);
  if (m) {
    const ay = parseInt(m[2], 10);
    return `${AYLAR[ay - 1] || ''} ${m[1]}`.trim();
  }
  return String(raw).slice(0, 4);
}

/* ── İkon ─────────────────────────────────────── */
function Ic({ d, size = 20, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  phone:   'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  map:     'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7A3 3 0 1 0 12 13a3 3 0 0 0 0-6z',
  comment: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  link:    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  check:   'M20 6 9 17l-5-5',
  share:   'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
  copy:     'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-4-4H8z M14 2v4h4 M10 12h4 M10 16h4 M10 8h1',
  bank:     'M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  globe:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  mappin:   'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  x:        'M18 6 6 18 M6 6l12 12',
};

function IgIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FbIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function HekimhaneLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 26, height: 26, background: '#1B3A69', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 21h18M9 21V7l6-4v18M9 11H3v10M15 11h6v10M9 7h6M12 11v4"/>
        </svg>
      </div>
      <span style={{ fontWeight: 800, fontSize: 15, color: '#1B3A69', letterSpacing: '-0.3px' }}>Hekimhane</span>
    </div>
  );
}

/* ── Yıldız bileşeni ──────────────────────────── */
function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill={(hover || value) >= n ? '#D4A843' : 'none'}
            stroke={(hover || value) >= n ? '#D4A843' : '#CBD5E1'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ANA COMPONENT
───────────────────────────────────────────────── */
export default function KartClient({ kart: d, reviews = [] }: { kart: KartData; reviews?: KartYorum[] }) {
  const [copied,      setCopied]      = useState(false);
  const [ibanCopied,  setIbanCopied]  = useState(false);
  const [pageUrl,     setPageUrl]     = useState('');
  const [showQr,      setShowQr]      = useState(false);
  const [qrMode,      setQrMode]      = useState<'card'|'review'>('card');
  const [showReview,  setShowReview]  = useState(false);
  const [downloading, setDownloading] = useState<'pdf'|'jpg'|null>(null);
  const [posterDl,    setPosterDl]    = useState<'a5'|'a6'|null>(null);

  // Yorum formu state
  const [revName,     setRevName]     = useState('');
  const [revRating,   setRevRating]   = useState(0);
  const [revText,     setRevText]     = useState('');
  const [revMonth,    setRevMonth]    = useState('');
  const [revYear,     setRevYear]     = useState('');
  const [revSending,  setRevSending]  = useState(false);
  const [revDone,     setRevDone]     = useState(false);
  const [revErr,      setRevErr]      = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
    // QR ile doğrudan yorum: ?yorum=1 veya #yorum → yorum formunu aç
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('yorum') === '1' || window.location.hash === '#yorum') setShowReview(true);
    } catch { /* noop */ }
  }, []);

  const fullName    = `${d.ad} ${d.soyad}`.trim();
  const displayName = d.unvan ? `${d.unvan} ${fullName}` : fullName;
  const photo       = d.photo_url || d.photo;
  const profilePath = (d.hekimhane_url && d.hekimhane_url.trim()) ? d.hekimhane_url.trim() : null;

  const handleCopy = () => {
    if (!pageUrl) return;
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleIbanCopy = () => {
    if (!d.iban) return;
    navigator.clipboard.writeText(d.iban).then(() => {
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2000);
    });
  };

  const handleReviewSubmit = async () => {
    if (revRating === 0) { setRevErr('Lütfen bir puan seçin.'); return; }
    if (!revText.trim()) { setRevErr('Yorum metni zorunludur.'); return; }
    setRevSending(true); setRevErr('');
    try {
      const body: Record<string, unknown> = {
        entity_id:     d.entity_id     || null,
        entity_type:   d.entity_type   || null,
        hekimhane_url: d.hekimhane_url || null,  // sunucu tarafında çözülmüş URL
        slug:          d.slug,
        name:          revName.trim() || 'Anonim',
        rating:        revRating,
        text:          revText.trim(),
        date:          buildRevDate(),
      };
      const r = await fetch('/api/yorum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) { const e = await r.json(); setRevErr(e.error || 'Bir hata oluştu.'); setRevSending(false); return; }
      setRevDone(true);
    } catch { setRevErr('Bağlantı hatası.'); }
    setRevSending(false);
  };

  const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const CUR_YEAR  = new Date().getFullYear();
  const REV_YEARS = Array.from({ length: CUR_YEAR - 2017 }, (_, i) => CUR_YEAR - i);

  function buildRevDate() {
    if (revYear && revMonth) return `${revYear}-${String(TR_MONTHS.indexOf(revMonth) + 1).padStart(2,'0')}`;
    if (revYear) return revYear;
    return new Date().toISOString().slice(0, 7);
  }

  const openReview = () => {
    setRevName(''); setRevRating(0); setRevText(''); setRevMonth(''); setRevYear('');
    setRevDone(false); setRevErr(''); setRevSending(false);
    setShowReview(true);
  };

  const handleDownload = async (type: 'jpg' | 'pdf') => {
    setDownloading(type);
    try {
      const fileName = `${displayName.replace(/\s+/g, '-')}-HekimKart`;
      const html2canvas = (await import('html2canvas')).default;

      if (type === 'jpg') {
        // JPG — ekrandaki Linktree kartının görüntüsü
        const el = document.getElementById('kp-card-main');
        if (!el) return;
        const hideEls = el.querySelectorAll<HTMLElement>('.kp-dl, .kp-footer');
        hideEls.forEach(e => { e.style.display = 'none'; });
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
        hideEls.forEach(e => { e.style.display = ''; });
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      } else {
        // PDF — baskıya hazır A5 dikey poster
        const sheet = document.getElementById('kp-a5-sheet');
        if (!sheet) return;
        sheet.style.display = 'flex';
        sheet.style.height = 'auto';   // içerik tam sığsın; sabit yükseklik alt kısmı kırpıyordu
        // QR görselinin yüklenmesini bekle (baskıda boş çıkmasın)
        const qrImg = sheet.querySelector('img');
        if (qrImg && !(qrImg as HTMLImageElement).complete) {
          await new Promise(res => { (qrImg as HTMLImageElement).onload = res; (qrImg as HTMLImageElement).onerror = res; setTimeout(res, 3000); });
        }
        const canvas = await html2canvas(sheet, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#0F2A55', logging: false });
        sheet.style.display = 'none';
        sheet.style.height = '738px';  // eski haline döndür
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        // A5 dikey: 148 × 210 mm — görseli sayfaya oranını koruyarak sığdır (kırpma/taşma yok)
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
        const pw = 148, ph = 210, ar = canvas.width / canvas.height;
        let w = pw, h = pw / ar;
        if (h > ph) { h = ph; w = ph * ar; }
        pdf.setFillColor(15, 42, 85);
        pdf.rect(0, 0, pw, ph, 'F');
        pdf.addImage(imgData, 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h);
        pdf.save(`${fileName}-A5.pdf`);
      }
    } catch (e) {
      console.error('Download error:', e);
      const el = document.getElementById('kp-card-main');
      if (el) el.querySelectorAll<HTMLElement>('.kp-dl, .kp-footer').forEach(e => { e.style.display = ''; });
      const sheet = document.getElementById('kp-a5-sheet');
      if (sheet) sheet.style.display = 'none';
    } finally {
      setDownloading(null);
    }
  };

  // Ofis için A5/A6 "Değerlendirme" posteri (yorum QR'lı) → PDF
  const handleReviewPoster = async (fmt: 'a5' | 'a6') => {
    if (posterDl) return;
    setPosterDl(fmt);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const sheet = document.getElementById('kp-review-sheet');
      if (!sheet) return;
      sheet.style.display = 'flex';   // sabit 520×738 (A5 oranı) — içerik tam oturur
      const qrImg = sheet.querySelector('img');
      if (qrImg && !(qrImg as HTMLImageElement).complete) {
        await new Promise(res => { (qrImg as HTMLImageElement).onload = res; (qrImg as HTMLImageElement).onerror = res; setTimeout(res, 3000); });
      }
      const canvas = await html2canvas(sheet, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#065F46', logging: false });
      sheet.style.display = 'none';
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const [pw, ph] = fmt === 'a5' ? [148, 210] : [105, 148]; // mm — A5/A6 aynı oran
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: fmt });
      pdf.addImage(imgData, 'JPEG', 0, 0, pw, ph);
      pdf.save(`${displayName.replace(/\s+/g, '-')}-Degerlendirme-${fmt.toUpperCase()}.pdf`);
    } catch (e) {
      console.error('Review poster error:', e);
      const sheet = document.getElementById('kp-review-sheet');
      if (sheet) sheet.style.display = 'none';
    } finally {
      setPosterDl(null);
    }
  };

  // Baskı/QR için sabit production URL (SSR↔client tutarlı; QR asla localhost'a bakmaz)
  const cardUrl = `https://hekimhane.com.tr/kart/${d.slug}`;
  const cardUrlShort = `hekimhane.com.tr/kart/${d.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(cardUrl)}&color=1B3A69&bgcolor=FFFFFF&margin=14&format=png`;
  const qrUrlLarge = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${encodeURIComponent(cardUrl)}&color=1B3A69&bgcolor=FFFFFF&margin=12&format=png`;

  // Doğrudan yorum: ?yorum=1 ile açılan kart yorum formunu otomatik gösterir
  const reviewUrl = `${cardUrl}?yorum=1`;
  const reviewUrlShort = `${cardUrlShort}?yorum=1`;
  const qrReview = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reviewUrl)}&color=047857&bgcolor=FFFFFF&margin=14&format=png`;
  const qrReviewLarge = `https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=${encodeURIComponent(reviewUrl)}&color=065F46&bgcolor=FFFFFF&margin=12&format=png`;

  // Instagram handle
  const igHandle = d.instagram_url
    ? d.instagram_url.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@').replace(/\/$/, '')
    : '';

  // IBAN görüntüle: boşluk grupla
  const ibanDisplay = d.iban ? d.iban.replace(/(.{4})/g, '$1 ').trim() : '';

  // 5★ yorumlarda Google'a yönlendirme için hedef URL:
  // maps_url varsa onu kullan (işletmenin Google Haritalar konumu),
  // yoksa isim + şehir ile Google Haritalar araması oluştur.
  const googleTarget = (d.maps_url && d.maps_url.trim())
    ? d.maps_url.trim()
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [displayName, d.clinic_name, d.ilce, d.il].filter(Boolean).join(' ')
      )}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F2A55; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif; }

        .kp { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20px 16px 48px; background: linear-gradient(160deg,#0F2A55 0%,#1B3A69 50%,#163D6E 100%); }
        .kp-top { width:100%; max-width:420px; display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .kp-card { width:100%; max-width:420px; background:white; border-radius:28px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,.4); }

        /* Hero */
        .kp-hero { background:linear-gradient(135deg,#0F2A55,#1B3A69 60%,#2d5496); padding:32px 24px 22px; display:flex; flex-direction:column; align-items:center; gap:12px; position:relative; overflow:hidden; }
        .kp-hero::before { content:''; position:absolute; top:-40px; right:-40px; width:140px; height:140px; border-radius:50%; background:rgba(212,168,67,.12); }
        .kp-hero::after  { content:''; position:absolute; bottom:-25px; left:-25px; width:90px; height:90px; border-radius:50%; background:rgba(255,255,255,.05); }

        .kp-avatar { width:108px; height:108px; border-radius:50%; border:3px solid #D4A843; object-fit:cover; position:relative; z-index:1; background:rgba(255,255,255,.12); }
        .kp-avatar-ph { width:108px; height:108px; border-radius:50%; border:3px solid rgba(212,168,67,.5); background:rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; color:white; font-size:38px; font-weight:700; position:relative; z-index:1; }

        .kp-name { font-size:20px; font-weight:800; color:white; text-align:center; letter-spacing:-0.3px; line-height:1.2; position:relative; z-index:1; }
        .kp-spec { font-size:13px; color:rgba(255,255,255,.72); text-align:center; position:relative; z-index:1; }
        .kp-clinic { font-size:12px; color:rgba(255,255,255,.52); text-align:center; position:relative; z-index:1; }
        .kp-bio { font-size:12px; color:rgba(255,255,255,.6); text-align:center; line-height:1.55; max-width:320px; position:relative; z-index:1; }

        .kp-badges { display:flex; align-items:center; gap:7px; flex-wrap:wrap; justify-content:center; position:relative; z-index:1; }
        .kp-b-verified { display:flex; align-items:center; gap:4px; background:rgba(5,150,105,.85); color:white; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
        .kp-b-loc { display:flex; align-items:center; gap:4px; background:rgba(255,255,255,.12); color:rgba(255,255,255,.8); font-size:11px; padding:3px 10px; border-radius:20px; }
        .kp-b-rat { display:flex; align-items:center; gap:4px; background:rgba(212,168,67,.2); color:#D4A843; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; border:1px solid rgba(212,168,67,.3); }

        /* Linkler */
        .kp-links { padding:18px 18px 6px; display:flex; flex-direction:column; gap:9px; }
        .kp-btn { display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:15px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; border:none; transition:transform .15s,box-shadow .15s; width:100%; }
        .kp-btn:active { transform:scale(.97); }
        .kp-icon { width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .kp-lbl { display:flex; flex-direction:column; }
        .kp-lbl-sub { font-size:10.5px; opacity:.72; font-weight:500; margin-bottom:1px; }

        .kp-btn--phone   { background:linear-gradient(135deg,#1B3A69,#2d5496); color:white; box-shadow:0 4px 16px rgba(27,58,105,.3); }
        .kp-btn--ig      { background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); color:white; box-shadow:0 4px 16px rgba(131,58,180,.25); }
        .kp-btn--fb      { background:linear-gradient(135deg,#1877F2,#0D5EC7); color:white; box-shadow:0 4px 16px rgba(24,119,242,.25); }
        .kp-btn--linkedin { background:linear-gradient(135deg,#0A66C2,#004182); color:white; box-shadow:0 4px 16px rgba(10,102,194,.25); }
        .kp-btn--linkedin:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(0,0,0,.2); }
        .kp-btn--iban     { background:#F0FDF4; color:#065F46; border:1.5px solid #6EE7B7; }
        .kp-btn--review   { background:#FFFBEB; color:#92400E; border:1.5px solid #FDE68A; }
        .kp-btn--rezerv   { background:linear-gradient(135deg,#059669,#0D9488); color:white; box-shadow:0 4px 16px rgba(5,150,105,.25); }
        .kp-btn--website  { background:#F8F4FF; color:#5B21B6; border:1.5px solid #C4B5FD; }
        .kp-btn--maps     { background:#FFF7F0; color:#C2410C; border:1.5px solid #FDBA74; }
        .kp-btn--phone:hover,.kp-btn--ig:hover,.kp-btn--fb:hover,.kp-btn--rezerv:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(0,0,0,.2); }
        .kp-btn--iban:hover    { background:#DCFCE7; }
        .kp-btn--review:hover  { background:#FEF3C7; }
        .kp-btn--website:hover { background:#EDE9FE; }
        .kp-btn--maps:hover    { background:#FFF0E6; }

        .kp-divider { height:1px; background:#F0F2F8; margin:4px 18px; }

        /* Alt araçlar */
        .kp-footer { padding:10px 18px 18px; display:flex; gap:9px; }
        .kp-tool { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:13px; background:#F5F7FF; border:1px solid #E2E8F0; color:#1B3A69; font-size:12.5px; font-weight:600; cursor:pointer; font-family:inherit; transition:background .15s; }

        /* Ofis değerlendirme posteri */
        .kp-review-poster { margin:12px 18px 0; padding:14px; border-radius:16px; background:#ECFDF5; border:1px solid #A7F3D0; }
        .kp-rp-head { display:flex; flex-direction:column; gap:3px; margin-bottom:11px; }
        .kp-rp-badge { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:800; color:#047857; }
        .kp-rp-sub { font-size:11px; color:#5f8a75; line-height:1.45; }
        .kp-rp-btns { display:flex; gap:9px; }
        .kp-rp-btn { flex:1; padding:11px; border-radius:12px; background:linear-gradient(135deg,#047857,#059669); border:none; color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; box-shadow:0 3px 12px rgba(5,150,105,.25); transition:transform .15s; }
        .kp-rp-btn:hover { transform:translateY(-1px); }
        .kp-rp-btn:disabled { opacity:.6; cursor:default; }
        /* QR modal mod seçici */
        .qr-tabs { display:flex; gap:6px; margin-bottom:14px; background:#F1F5F9; padding:4px; border-radius:12px; }
        .qr-tab { flex:1; padding:8px; border-radius:9px; border:none; background:transparent; color:#64748B; font-size:12.5px; font-weight:700; cursor:pointer; font-family:inherit; }
        .qr-tab--on { background:#fff; color:#1B3A69; box-shadow:0 1px 4px rgba(0,0,0,.08); }
        .kp-tool:hover { background:#EEF2FF; }
        .kp-tool--ok  { background:#F0FDF4; border-color:#86EFAC; color:#166534; }

        /* QR Modal */
        .qr-bd { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:24px; }
        .qr-box { background:white; border-radius:24px; padding:28px 24px 22px; max-width:320px; width:100%; text-align:center; box-shadow:0 24px 80px rgba(0,0,0,.4); }
        .qr-box h3 { font-size:17px; font-weight:800; color:#1B3A69; margin-bottom:5px; }
        .qr-box p  { font-size:12px; color:#6B7A99; margin-bottom:15px; line-height:1.5; }
        .qr-img  { border:1px solid #E2E8F0; border-radius:14px; padding:10px; display:inline-flex; margin-bottom:12px; }
        .qr-url  { font-size:10.5px; color:#8B9CC0; word-break:break-all; margin-bottom:14px; }
        .qr-close { width:100%; padding:11px; border-radius:12px; background:#1B3A69; border:none; color:white; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }

        /* Yorum Modal */
        .rev-bd  { position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(8px); display:flex; align-items:flex-end; justify-content:center; z-index:1000; padding:0; }
        @media (min-width:480px) { .rev-bd { align-items:center; padding:24px; } }
        .rev-box { background:white; border-radius:28px 28px 0 0; padding:28px 22px 36px; width:100%; max-width:460px; box-shadow:0 -12px 60px rgba(0,0,0,.25); }
        @media (min-width:480px) { .rev-box { border-radius:24px; } }
        .rev-box h3 { font-size:18px; font-weight:800; color:#1B3A69; margin-bottom:4px; text-align:center; }
        .rev-box .rev-sub { font-size:12.5px; color:#6B7A99; text-align:center; margin-bottom:20px; }
        .rev-inp { width:100%; padding:12px 14px; border-radius:12px; border:1.5px solid #E2E8F0; font-size:14px; font-family:inherit; color:#1B3A69; outline:none; resize:none; }
        .rev-inp:focus { border-color:#1B3A69; }
        .rev-submit { width:100%; padding:14px; border-radius:14px; background:#1B3A69; border:none; color:white; font-size:14.5px; font-weight:800; cursor:pointer; font-family:inherit; margin-top:14px; }
        .rev-submit:disabled { opacity:.5; cursor:not-allowed; }

        /* QR Bölümü — her zaman görünür */
        .kp-reviews { border-top:1px solid #F0F2F8; padding:16px 18px 4px; }
        .kp-reviews-head { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:12px; }
        .kp-reviews-title { font-size:14px; font-weight:800; color:#1B3A69; letter-spacing:-.2px; }
        .kp-reviews-count { font-size:11.5px; font-weight:600; color:#9BA8C0; }
        .kp-reviews-list { display:flex; flex-direction:column; gap:12px; }
        .kp-review { background:#FAFBFF; border:1px solid #EEF1F7; border-radius:14px; padding:12px 13px; }
        .kp-review-top { display:flex; align-items:center; gap:10px; }
        .kp-review-av { width:34px; height:34px; border-radius:50%; background:#1B3A69; color:white; font-size:14px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .kp-review-name { font-size:13px; font-weight:700; color:#243B5E; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .kp-review-stars { display:flex; gap:1px; margin-top:2px; }
        .kp-review-date { font-size:10.5px; font-weight:600; color:#A0AABA; flex-shrink:0; white-space:nowrap; }
        .kp-review-text { font-size:12.8px; color:#4A5468; line-height:1.55; margin-top:9px; word-break:break-word; }
        .kp-review-reply { font-size:12px; color:#475569; line-height:1.5; margin-top:10px; padding:9px 11px; background:#F1F5F9; border-radius:10px; border-left:3px solid #1B3A69; }
        .kp-review-reply-lbl { display:inline-block; font-size:9.5px; font-weight:800; letter-spacing:.6px; text-transform:uppercase; color:#1B3A69; margin-right:6px; }
        .kp-qr-section { border-top:1px solid #F0F2F8; padding:18px 18px 16px; display:flex; flex-direction:column; align-items:center; gap:10px; background:#FAFBFF; }
        .kp-qr-label { font-size:10px; font-weight:700; letter-spacing:.9px; text-transform:uppercase; color:#9BA8C0; }
        .kp-qr-wrap { border:1.5px solid #E2E8F0; border-radius:14px; padding:10px; background:white; display:inline-flex; }
        .kp-qr-url { font-size:9.5px; color:#A0AABA; word-break:break-all; text-align:center; max-width:280px; line-height:1.5; }

        /* İndirme düğmeleri */
        .kp-dl { padding:10px 18px 18px; display:flex; gap:9px; }
        .kp-dl-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:11px; border-radius:13px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:inherit; border:none; transition:opacity .15s; }
        .kp-dl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .kp-dl-btn--jpg { background:#1B3A69; color:white; }
        .kp-dl-btn--pdf { background:#D4A843; color:white; }
        .kp-dl-btn--jpg:hover:not(:disabled) { opacity:.88; }
        .kp-dl-btn--pdf:hover:not(:disabled) { opacity:.88; }

        /* Hekimhane Banner */
        .kp-hh-banner { margin:6px 18px 14px; border-radius:16px; overflow:hidden; background:linear-gradient(135deg,#0F2A55 0%,#1B3A69 60%,#2d5496 100%); text-decoration:none; display:flex; align-items:center; gap:12px; padding:14px 16px; transition:opacity .15s; }
        .kp-hh-banner:hover { opacity:.88; }
        .kp-hh-icon { width:40px; height:40px; border-radius:10px; background:rgba(212,168,67,.18); border:1px solid rgba(212,168,67,.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .kp-hh-text { flex:1; min-width:0; }
        .kp-hh-sub  { font-size:10px; color:rgba(255,255,255,.55); text-transform:uppercase; letter-spacing:.8px; font-weight:600; margin-bottom:2px; }
        .kp-hh-main { font-size:13.5px; font-weight:700; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .kp-hh-arr  { color:rgba(255,255,255,.4); flex-shrink:0; }

        /* Powered by */
        .kp-pw { margin-top:18px; display:flex; align-items:center; gap:6px; font-size:11px; color:rgba(255,255,255,.45); }

        @media (max-width:440px) {
          .kp { padding:14px 12px 40px; }
          .kp-avatar,.kp-avatar-ph { width:92px; height:92px; }
          .kp-name { font-size:18px; }
        }
      ` }} />

      <div className="kp">
        {/* Üst bar */}
        <div className="kp-top">
          <HekimhaneLogo />
          <button onClick={handleCopy} className={`kp-tool${copied ? ' kp-tool--ok' : ''}`} style={{ flex: 'none', padding: '8px 14px', fontSize: 12 }}>
            {copied ? <><Ic d={ICONS.check} size={13} /> Kopyalandı</> : <><Ic d={ICONS.share} size={13} /> Paylaş</>}
          </button>
        </div>

        <div className="kp-card" id="kp-card-main">
          {/* Hero */}
          <div className="kp-hero">
            {photo
              ? <img src={photo} alt={fullName} className="kp-avatar" />
              : <div className="kp-avatar-ph">{d.ad?.[0]?.toUpperCase() || 'H'}</div>
            }

            <div className="kp-name">{displayName}</div>

            {(d.spec || d.clinic_name) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                {d.spec        && <div className="kp-spec">{d.spec}</div>}
                {d.clinic_name && <div className="kp-clinic">{d.clinic_name}</div>}
              </div>
            )}

            {d.bio && <div className="kp-bio">{d.bio}</div>}

            <div className="kp-badges">
              {d.premium && (
                <span className="kp-b-verified">
                  <Ic d={ICONS.check} size={10} color="white" /> Onaylı Hekim
                </span>
              )}
              {(d.il || d.ilce) && (
                <span className="kp-b-loc">
                  <Ic d={ICONS.map} size={10} color="rgba(255,255,255,.8)" />
                  {[d.ilce, d.il].filter(Boolean).join(', ')}
                </span>
              )}
              {d.rat && d.rat > 0 ? (
                <span className="kp-b-rat">
                  <Ic d={ICONS.star} size={10} color="#D4A843" />
                  {d.rat.toFixed(1)}
                  {d.rev && d.rev > 0 && <span style={{ fontWeight: 400, opacity: .8 }}>({d.rev})</span>}
                </span>
              ) : null}
            </div>
          </div>

          {/* Linkler */}
          <div className="kp-links">
            {d.tel && (
              <a href={`tel:${d.tel.replace(/\s/g, '')}`} className="kp-btn kp-btn--phone">
                <span className="kp-icon"><Ic d={ICONS.phone} size={17} color="white" /></span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub">Doğrudan Ara</span>
                  <span>{d.tel}</span>
                </span>
              </a>
            )}

            {d.instagram_url && (
              <a href={d.instagram_url} target="_blank" rel="noopener noreferrer" className="kp-btn kp-btn--ig">
                <span className="kp-icon"><IgIcon size={17} /></span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub">Instagram</span>
                  <span>{igHandle || 'Profilime Git'}</span>
                </span>
              </a>
            )}

            {d.facebook_url && (
              <a href={d.facebook_url} target="_blank" rel="noopener noreferrer" className="kp-btn kp-btn--fb">
                <span className="kp-icon"><FbIcon size={17} /></span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub">Facebook</span>
                  <span>Sayfamı Ziyaret Et</span>
                </span>
              </a>
            )}

            {d.linkedin_url && (
              <a href={d.linkedin_url} target="_blank" rel="noopener noreferrer" className="kp-btn kp-btn--linkedin">
                <span className="kp-icon"><LinkedInIcon size={17} /></span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub">LinkedIn</span>
                  <span>Profilime Bağlan</span>
                </span>
              </a>
            )}

            {/* Rezervasyon */}
            {d.rezervasyon_url && (
              <a href={d.rezervasyon_url} target="_blank" rel="noopener noreferrer" className="kp-btn kp-btn--rezerv">
                <span className="kp-icon"><Ic d={ICONS.calendar} size={17} color="white" /></span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub">Online Randevu</span>
                  <span>Randevu Al</span>
                </span>
              </a>
            )}

            {/* Web Sitesi */}
            {d.website_url && (
              <a href={d.website_url} target="_blank" rel="noopener noreferrer" className="kp-btn kp-btn--website">
                <span className="kp-icon" style={{ background: '#EDE9FE' }}>
                  <Ic d={ICONS.globe} size={17} color="#5B21B6" />
                </span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub" style={{ color: '#6D28D9' }}>Web Sitesi</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                    {d.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </span>
              </a>
            )}

            {/* Google Maps */}
            {d.maps_url && (
              <a href={d.maps_url} target="_blank" rel="noopener noreferrer" className="kp-btn kp-btn--maps">
                <span className="kp-icon" style={{ background: '#FFF0E6' }}>
                  <Ic d={ICONS.mappin} size={17} color="#EA4335" />
                </span>
                <span className="kp-lbl">
                  <span className="kp-lbl-sub" style={{ color: '#C2410C' }}>Konum</span>
                  <span>Harita'da Görüntüle</span>
                </span>
              </a>
            )}

            {/* IBAN butonu — sadece IBAN dolu ise göster */}
            {d.iban && (
              <>
                <div className="kp-divider" />
                <button onClick={handleIbanCopy} className="kp-btn kp-btn--iban" style={{ textAlign: 'left' }}>
                  <span className="kp-icon" style={{ background: '#D1FAE5' }}>
                    {ibanCopied
                      ? <Ic d={ICONS.check} size={17} color="#059669" />
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3"/>
                        </svg>
                    }
                  </span>
                  <span className="kp-lbl" style={{ flex: 1, minWidth: 0 }}>
                    <span className="kp-lbl-sub" style={{ color: '#047857' }}>
                      {ibanCopied ? 'IBAN Kopyalandı!' : 'IBAN — Kopyalamak için dokun'}
                    </span>
                    <span style={{ fontSize: 13, letterSpacing: '0.5px', fontFeatureSettings: '"tnum"', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ibanDisplay}
                    </span>
                  </span>
                </button>
              </>
            )}

            <div className="kp-divider" />

            {/* Yorum Yaz — her zaman göster */}
            <button onClick={openReview} className="kp-btn kp-btn--review" style={{ textAlign: 'left' }}>
              <span className="kp-icon" style={{ background: '#FEF3C7' }}>
                <Ic d={ICONS.comment} size={17} color="#92400E" />
              </span>
              <span className="kp-lbl">
                <span className="kp-lbl-sub" style={{ color: '#B45309' }}>Değerlendirme</span>
                <span>Yorum Yaz</span>
              </span>
            </button>

          </div>

          {/* Hekimhane Profil Banner — her zaman görünür, entity'ye bağlıysa link aktif */}
          {profilePath ? (
            <a href={profilePath} className="kp-hh-banner" target="_self">
              <span className="kp-hh-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 21h18M9 21V7l6-4v18M9 11H3v10M15 11h6v10M9 7h6M12 11v4"/>
                </svg>
              </span>
              <span className="kp-hh-text">
                <div className="kp-hh-sub">Hekimhane Profili</div>
                <div className="kp-hh-main">
                  Tam Profili Görüntüle
                  {d.rat && d.rat > 0 ? ` · ★ ${d.rat.toFixed(1)}${d.rev && d.rev > 0 ? ` (${d.rev} yorum)` : ''}` : ''}
                </div>
              </span>
              <span className="kp-hh-arr">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </span>
            </a>
          ) : (
            <div className="kp-hh-banner" style={{ cursor: 'default' }}>
              <span className="kp-hh-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 21h18M9 21V7l6-4v18M9 11H3v10M15 11h6v10M9 7h6M12 11v4"/>
                </svg>
              </span>
              <span className="kp-hh-text">
                <div className="kp-hh-sub">Hekimhane</div>
                <div className="kp-hh-main">Türkiye&apos;nin Sağlık Rehberi</div>
              </span>
            </div>
          )}

          {/* Yorumlar — mevcut değerlendirmeler varsa göster */}
          {reviews.length > 0 && (
            <div className="kp-reviews">
              <div className="kp-reviews-head">
                <span className="kp-reviews-title">Değerlendirmeler</span>
                <span className="kp-reviews-count">{reviews.length} yorum</span>
              </div>
              <div className="kp-reviews-list">
                {reviews.map((rv) => (
                  <div key={rv.id} className="kp-review">
                    <div className="kp-review-top">
                      <div className="kp-review-av">{(rv.author || 'A').trim().charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="kp-review-name">{rv.author?.trim() || 'Anonim'}</div>
                        <div className="kp-review-stars">
                          {[1,2,3,4,5].map(n => (
                            <svg key={n} width="13" height="13" viewBox="0 0 24 24"
                              fill={n <= (rv.rating || 0) ? '#F5A623' : '#E2E8F0'}>
                              <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="kp-review-date">{fmtRevDate(rv.created_at)}</div>
                    </div>
                    {rv.text && <div className="kp-review-text">{rv.text}</div>}
                    {rv.reply_text && (
                      <div className="kp-review-reply">
                        <span className="kp-review-reply-lbl">Yanıt</span>
                        {rv.reply_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Bölümü — her zaman kartın içinde görünür */}
          <div className="kp-qr-section">
            <div className="kp-qr-label">Bu kartı paylaşmak için QR kodu okutun</div>
            <div className="kp-qr-wrap">
              {pageUrl
                ? <img src={qrUrl} alt="QR Kod" width={150} height={150} style={{ borderRadius: 6, display: 'block' }} />
                : <div style={{ width: 150, height: 150, background: '#F0F4FF', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7A99', fontSize: 11 }}>Yükleniyor…</div>
              }
            </div>
            <div className="kp-qr-url">{pageUrl || `hekimhane.com.tr/kart/${d.slug}`}</div>
          </div>

          {/* İndirme düğmeleri */}
          <div className="kp-dl">
            <button className="kp-dl-btn kp-dl-btn--jpg" onClick={() => handleDownload('jpg')} disabled={downloading !== null}>
              {downloading === 'jpg' ? '…' : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                JPG İndir
              </>}
            </button>
            <button className="kp-dl-btn kp-dl-btn--pdf" onClick={() => handleDownload('pdf')} disabled={downloading !== null}>
              {downloading === 'pdf' ? '…' : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <path d="M9 15v-4h2a2 2 0 0 1 0 4H9"/><path d="M14 15v-4"/><path d="M19 11v4"/><path d="M17 11h2"/>
                </svg>
                A5 PDF (Baskı)
              </>}
            </button>
          </div>

          {/* Ofis için — Değerlendirme (yorum) posteri: QR okutan hasta doğrudan yorum formuna gider */}
          <div className="kp-review-poster">
            <div className="kp-rp-head">
              <span className="kp-rp-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#059669"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>
                Ofis için değerlendirme posteri
              </span>
              <span className="kp-rp-sub">Masaüstü/duvar için yazdır — QR okutan hasta doğrudan yorum bırakır</span>
            </div>
            <div className="kp-rp-btns">
              <button className="kp-rp-btn" onClick={() => handleReviewPoster('a5')} disabled={posterDl !== null}>
                {posterDl === 'a5' ? '…' : 'A5 İndir (PDF)'}
              </button>
              <button className="kp-rp-btn" onClick={() => handleReviewPoster('a6')} disabled={posterDl !== null}>
                {posterDl === 'a6' ? '…' : 'A6 İndir (PDF)'}
              </button>
            </div>
          </div>

          {/* Linki Kopyala — footer */}
          <div className="kp-footer">
            <button className={`kp-tool${copied ? ' kp-tool--ok' : ''}`} onClick={handleCopy}>
              {copied ? <><Ic d={ICONS.check} size={14} /> Kopyalandı</> : <><Ic d={ICONS.link} size={14} /> Linki Kopyala</>}
            </button>
            <button className="kp-tool" onClick={() => setShowQr(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                <path d="M14 17h.01 M17 14h.01 M20 14h.01 M14 14h.01 M17 17h.01 M20 17h.01 M17 20h.01 M20 20h.01"/>
              </svg>
              Büyük QR
            </button>
          </div>
        </div>

        <div className="kp-pw">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 21h18M9 21V7l6-4v18M9 11H3v10M15 11h6v10M9 7h6M12 11v4"/>
          </svg>
          Hekimhane ile oluşturuldu
        </div>
      </div>

      {/* ── A5 DİKEY BASKI POSTERİ (gizli; yalnızca PDF'e aktarılır) ── */}
      <div id="kp-a5-sheet" style={{
        display: 'none', position: 'absolute', left: -9999, top: 0,
        width: 520, height: 738, boxSizing: 'border-box',
        background: 'linear-gradient(165deg,#0F2A55 0%,#1B3A69 55%,#163D6E 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        color: 'white', overflow: 'hidden',
        flexDirection: 'column', alignItems: 'center',
        padding: '30px 34px 26px', textAlign: 'center',
      }}>
        {/* Marka */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ display: 'inline-flex' }}>
            <svg width="30" height="30" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#fff" /><path d="M20 8.2c-2.9 0-4.3-1.5-6.9-1.5-2.4 0-4.2 1.9-4.2 4.9 0 2.3.9 4.3 1.5 6.4.5 1.9.7 3.6.9 5.6.2 2 .5 4.1 1.1 5.8.5 1.4 1.2 2.4 2.2 2.4 1.1 0 1.6-1.2 1.9-2.9.3-1.7.5-3.6 1.1-5.1.2-.6.6-1.1 1.3-1.1s1.1.5 1.3 1.1c.6 1.5.8 3.4 1.1 5.1.3 1.7.8 2.9 1.9 2.9 1 0 1.7-1 2.2-2.4.6-1.7.9-3.8 1.1-5.8.2-2 .4-3.7.9-5.6.6-2.1 1.5-4.1 1.5-6.4 0-3-1.8-4.9-4.2-4.9C24.3 6.7 22.9 8.2 20 8.2Z" fill="#1B3A69" /></svg>
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.8px' }}>hekimhane<span style={{ color: '#E7BE5C' }}>.com.tr</span></span>
        </div>

        {/* Fotoğraf / baş harf */}
        <div style={{
          width: 104, height: 104, borderRadius: '50%', overflow: 'hidden',
          border: '4px solid rgba(255,255,255,.9)', boxShadow: '0 8px 30px rgba(0,0,0,.3)',
          background: '#25457c', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, fontWeight: 800, color: 'rgba(255,255,255,.9)', marginBottom: 10, flexShrink: 0,
        }}>
          {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (d.ad?.[0]?.toUpperCase() || 'H')}
        </div>

        {/* İsim + uzmanlık */}
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.2 }}>{displayName}</div>
        {d.spec && <div style={{ fontSize: 15, fontWeight: 600, color: '#E7BE5C', marginTop: 6 }}>{d.spec}</div>}
        {d.clinic_name && <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginTop: 4 }}>{d.clinic_name}</div>}

        {/* Güven satırı — onay rozeti (yalnızca Pro/premium hesap) + puan (varsa) */}
        {(d.premium || (d.rat && d.rat > 0)) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {d.premium && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#6EE7B7', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)', borderRadius: 20, padding: '4px 11px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                Onaylı Hekim
              </span>
            )}
            {d.rat && d.rat > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: '#E7BE5C', background: 'rgba(231,190,92,.12)', border: '1px solid rgba(231,190,92,.3)', borderRadius: 20, padding: '4px 11px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#E7BE5C"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>
                {d.rat.toFixed(1)}{d.rev && d.rev > 0 ? ` · ${d.rev} değerlendirme` : ''}
              </span>
            )}
          </div>
        )}

        {/* Adres (tam) veya il/ilçe */}
        {(d.adres || d.il || d.ilce) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 5, marginTop: 10, maxWidth: 400, fontSize: 12, color: 'rgba(255,255,255,.62)', lineHeight: 1.45 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            <span>{d.adres?.trim() || [d.ilce, d.il].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* QR kartı */}
        <div style={{ background: 'white', borderRadius: 20, padding: '14px 18px 11px', marginTop: 14, boxShadow: '0 10px 40px rgba(0,0,0,.25)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrlLarge} alt="QR" style={{ width: 176, height: 176, display: 'block' }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1B3A69', marginTop: 11, letterSpacing: '.2px' }}>Karekodu okutun</div>
          <div style={{ fontSize: 10.5, color: '#6B7A99', marginTop: 3 }}>Randevu · İletişim · Değerlendirme</div>
        </div>

        {/* Telefon — doğrudan iletişim */}
        {d.tel && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, fontSize: 17, fontWeight: 800, letterSpacing: '.4px', color: '#fff' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E7BE5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>
            {d.tel}
          </div>
        )}

        {/* Esnek boşluk — alt grubu poster tabanına yaslar */}
        <div style={{ flex: 1, minHeight: 14 }} />

        {/* Alt grup: URL · CTA · footer — standart aralıklarla */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* Kısa URL */}
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.9)', letterSpacing: '.2px' }}>{cardUrlShort}</div>

          {/* Alt CTA şeridi */}
          <div style={{
            width: '100%', background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 14, padding: '12px 14px', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.92)',
          }}>
            Deneyiminizi değerlendirin — kodu okutup yorum bırakın
          </div>

          {/* Footer */}
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '.4px' }}>
            Türkiye Diş Hekimi &amp; Klinik Rehberi
          </div>
        </div>
      </div>

      {/* ── OFİS DEĞERLENDİRME POSTERİ (gizli; A5/A6 PDF'e aktarılır) ── */}
      <div id="kp-review-sheet" style={{
        display: 'none', position: 'absolute', left: -9999, top: 0,
        width: 520, height: 738, boxSizing: 'border-box',
        background: 'linear-gradient(165deg,#065F46 0%,#047857 55%,#0E7C5A 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        color: 'white', overflow: 'hidden', flexDirection: 'column', alignItems: 'center',
        padding: '44px 38px 32px', textAlign: 'center',
      }}>
        {/* Marka */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#fff" /><path d="M20 8.2c-2.9 0-4.3-1.5-6.9-1.5-2.4 0-4.2 1.9-4.2 4.9 0 2.3.9 4.3 1.5 6.4.5 1.9.7 3.6.9 5.6.2 2 .5 4.1 1.1 5.8.5 1.4 1.2 2.4 2.2 2.4 1.1 0 1.6-1.2 1.9-2.9.3-1.7.5-3.6 1.1-5.1.2-.6.6-1.1 1.3-1.1s1.1.5 1.3 1.1c.6 1.5.8 3.4 1.1 5.1.3 1.7.8 2.9 1.9 2.9 1 0 1.7-1 2.2-2.4.6-1.7.9-3.8 1.1-5.8.2-2 .4-3.7.9-5.6.6-2.1 1.5-4.1 1.5-6.4 0-3-1.8-4.9-4.2-4.9C24.3 6.7 22.9 8.2 20 8.2Z" fill="#047857" /></svg>
          <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.6px' }}>hekimhane<span style={{ color: '#FCD34D' }}>.com.tr</span></span>
        </div>

        {/* 5 yıldız */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[1,2,3,4,5].map(n => (
            <svg key={n} width="30" height="30" viewBox="0 0 24 24" fill="#FCD34D"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>
          ))}
        </div>

        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.15 }}>Deneyiminizi<br />Değerlendirin</div>
        <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.85)', marginTop: 12, maxWidth: 380, lineHeight: 1.5 }}>
          Karekodu telefonunuzla okutun, memnuniyetinizi<br />birkaç saniyede paylaşın.
        </div>

        {/* Hekim/klinik */}
        <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700 }}>{displayName}</div>
        {d.clinic_name && <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.72)', marginTop: 2 }}>{d.clinic_name}</div>}

        {/* QR — yorum */}
        <div style={{ background: 'white', borderRadius: 24, padding: '20px 22px 16px', marginTop: 20, boxShadow: '0 12px 44px rgba(0,0,0,.28)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrReviewLarge} alt="Yorum QR" style={{ width: 210, height: 210, display: 'block' }} />
          <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', marginTop: 12 }}>Karekodu Okutun</div>
          <div style={{ fontSize: 10.5, color: '#6B7A99', marginTop: 3 }}>Doğrudan yorum ekranı açılır</div>
        </div>

        <div style={{ flex: 1, minHeight: 12 }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.9)', letterSpacing: '.2px' }}>{reviewUrlShort}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', letterSpacing: '.4px' }}>Türkiye Diş Hekimi &amp; Klinik Rehberi</div>
        </div>
      </div>

      {/* QR Modal */}
      {showQr && (
        <div className="qr-bd" onClick={() => setShowQr(false)}>
          <div className="qr-box" onClick={e => e.stopPropagation()}>
            <div className="qr-tabs">
              <button className={`qr-tab${qrMode === 'card' ? ' qr-tab--on' : ''}`} onClick={() => setQrMode('card')}>Kartvizit</button>
              <button className={`qr-tab${qrMode === 'review' ? ' qr-tab--on' : ''}`} onClick={() => setQrMode('review')}>Yorum</button>
            </div>
            <h3>{qrMode === 'card' ? 'Kartvizit QR' : 'Değerlendirme QR'}</h3>
            <p>{qrMode === 'card'
              ? <>{displayName} dijital kartvizitine<br />telefon kameranızla ulaşın</>
              : <>Karekodu okutan hasta doğrudan<br />yorum bırakma ekranına gider</>}</p>
            <div className="qr-img">
              <img src={qrMode === 'card' ? qrUrl : qrReview} alt="QR Kod" width={210} height={210} style={{ borderRadius: 8, display: 'block' }} />
            </div>
            <div className="qr-url">{qrMode === 'card' ? cardUrlShort : reviewUrlShort}</div>
            <button className="qr-close" onClick={() => setShowQr(false)}>Kapat</button>
          </div>
        </div>
      )}

      {/* Yorum Modal */}
      {showReview && (
        <div className="rev-bd" onClick={() => setShowReview(false)}>
          <div className="rev-box" onClick={e => e.stopPropagation()}>
            {/* Kapat */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <button onClick={() => setShowReview(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Ic d={ICONS.x} size={15} color="#64748B" />
              </button>
            </div>

            {revDone ? (
              /* Başarılı mesajı */
              <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Ic d={ICONS.check} size={28} color="#059669" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1B3A69', marginBottom: 8 }}>Yorumunuz Alındı!</h3>
                <p style={{ fontSize: 13.5, color: '#6B7A99', lineHeight: 1.6 }}>
                  Değerlendirmeniz için teşekkürler.<br />
                  Yorumunuz incelendikten sonra yayınlanacak.
                </p>

                {revRating === 5 ? (
                  /* 5 yıldız — hem HekimKart'a hem Google'a yönlendir */
                  <>
                    <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#B45309', marginBottom: 4 }}>
                        Deneyiminiz mükemmeldi! ⭐️
                      </div>
                      <div style={{ fontSize: 12.5, color: '#92400E', lineHeight: 1.55 }}>
                        Bu değerlendirmenizi Google&apos;da da paylaşarak daha fazla kişiye ulaşmamıza yardımcı olabilirsiniz.
                      </div>
                    </div>
                    <a href={googleTarget} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, padding: '13px 24px', borderRadius: 12, background: '#fff', border: '1.5px solid #E2E8F0', color: '#1B3A69', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/></svg>
                      Google&apos;da Değerlendir
                    </a>
                    <button onClick={() => setShowReview(false)}
                      style={{ marginTop: 10, padding: '10px 24px', borderRadius: 12, background: 'transparent', border: 'none', color: '#6B7A99', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Şimdilik geç
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowReview(false)}
                    style={{ marginTop: 22, padding: '12px 32px', borderRadius: 12, background: '#1B3A69', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Kapat
                  </button>
                )}
              </div>
            ) : (
              /* Yorum formu */
              <>
                <h3>Değerlendirme Yap</h3>
                <div className="rev-sub">{displayName} için puan ve yorum bırakın</div>

                {/* Yıldız puanlama — etiket alanı sabit yükseklikte (kayma olmaz) */}
                <div style={{ marginBottom: 18 }}>
                  <StarRating value={revRating} onChange={setRevRating} />
                  <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12.5, color: '#D4A843', fontWeight: 700, minHeight: 18, lineHeight: '18px' }}>
                    {revRating > 0 ? ['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][revRating] : ''}
                  </div>
                </div>

                {/* Ad (opsiyonel) */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B7A99', letterSpacing: '.3px', textTransform: 'uppercase', marginBottom: 5 }}>Adınız (opsiyonel)</label>
                  <input
                    className="rev-inp"
                    value={revName}
                    onChange={e => setRevName(e.target.value)}
                    placeholder="Anonim olarak gönderin veya adınızı yazın"
                  />
                </div>

                {/* Ziyaret tarihi */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B7A99', letterSpacing: '.3px', textTransform: 'uppercase', marginBottom: 5 }}>
                    Ziyaret Tarihi <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(opsiyonel)</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <select
                      value={revMonth}
                      onChange={e => setRevMonth(e.target.value)}
                      style={{ padding: '11px 12px', borderRadius: 11, border: '1.5px solid #E2E8F0', fontSize: 13.5, fontFamily: 'inherit', color: revMonth ? '#1B3A69' : '#94A3B8', background: 'white', outline: 'none' }}
                    >
                      <option value="">Ay seçin</option>
                      {TR_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={revYear}
                      onChange={e => setRevYear(e.target.value)}
                      style={{ padding: '11px 12px', borderRadius: 11, border: '1.5px solid #E2E8F0', fontSize: 13.5, fontFamily: 'inherit', color: revYear ? '#1B3A69' : '#94A3B8', background: 'white', outline: 'none' }}
                    >
                      <option value="">Yıl seçin</option>
                      {REV_YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* Yorum metni */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B7A99', letterSpacing: '.3px', textTransform: 'uppercase', marginBottom: 5 }}>Yorumunuz *</label>
                  <textarea
                    className="rev-inp"
                    value={revText}
                    onChange={e => setRevText(e.target.value)}
                    placeholder="Deneyiminizi paylaşın…"
                    rows={4}
                  />
                </div>

                {revErr && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '9px 13px', color: '#991B1B', fontSize: 12.5, marginBottom: 8 }}>
                    {revErr}
                  </div>
                )}

                <button className="rev-submit" onClick={handleReviewSubmit} disabled={revSending}>
                  {revSending
                    ? 'Gönderiliyor…'
                    : 'Yorumu Gönder'
                  }
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
