'use client';

// ─────────────────────────────────────────────────────────────────
//  Ana sayfa erken üye bandı → "Tanıdığınız bir hekime gönderin".
//  WhatsApp: wa.me ile hazır mesaj (telefonda uygulama açılır, kişi seçilir).
//  Instagram: web'den DM'e metin gönderme adresi yok → telefonda sistemin
//  paylaşım menüsü (Instagram oradan seçilir); bilgisayarda mesaj kopyalanır
//  ve Instagram mesajlar sayfası yeni sekmede açılır.
//  Bağlantı ana sayfadaki banda (#erken-uye) gider; kanal UTM ile ayrılır.
// ─────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { ERKEN_UYE_KOTA } from '@/lib/erken-uye-metin';

const SITE = 'https://www.hekimhane.com.tr';

function davetUrl(kanal: string) {
  return `${SITE}/?utm_source=${kanal}&utm_medium=davet&utm_campaign=erken-uye#erken-uye`;
}

function davetMetni(kalan: number, url: string) {
  return `Hekimhane, ilk ${ERKEN_UYE_KOTA} işletmeye Pro üyeliği ücretsiz veriyor; şu an ${kalan} yer kaldı. `
    + `Profilini sahiplenebilir ya da işletmeni ekleyebilirsin, kart bilgisi istenmiyor: ${url}`;
}

const telefonMu = () => typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function ErkenUyeDavet({ kalan }: { kalan: number }) {
  const [not, setNot] = useState('');

  function bildir(m: string) {
    setNot(m);
    window.setTimeout(() => setNot(''), 4500);
  }

  async function panoya(metin: string) {
    try { await navigator.clipboard.writeText(metin); return true; }
    catch {
      const t = document.createElement('textarea');
      t.value = metin;
      document.body.appendChild(t);
      t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* yoksay */ }
      t.remove();
      return ok;
    }
  }

  async function instagram() {
    const url = davetUrl('instagram');
    const metin = davetMetni(kalan, url);
    if (telefonMu() && 'share' in navigator) {
      try { await navigator.share({ text: metin }); } catch { /* vazgeçildi */ }
      return;
    }
    const ok = await panoya(metin);
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener');
    bildir(ok ? 'Mesaj kopyalandı. Instagram’da kişiyi seçip yapıştırın.' : url);
  }

  async function kopyala() {
    const ok = await panoya(davetMetni(kalan, davetUrl('kopya')));
    bildir(ok ? 'Mesaj ve bağlantı kopyalandı.' : davetUrl('kopya'));
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(davetMetni(kalan, davetUrl('whatsapp')))}`;

  return (
    <div className="eud">
      <p className="eud-baslik">Tanıdığınız bir hekime gönderin</p>
      <p className="eud-alt">Kayıt bağlantısı telefonundan tek dokunuşla açılır.</p>
      <div className="eud-dugmeler">
        <a className="eud-d eud-d--wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ile arkadaşınıza gönderin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.2z" />
          </svg>
          WhatsApp
        </a>
        <button type="button" className="eud-d eud-d--ig" onClick={instagram} aria-label="Instagram ile arkadaşınıza gönderin">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
          </svg>
          Instagram
        </button>
        <button type="button" className="eud-d eud-d--kopya" onClick={kopyala} aria-label="Davet mesajını ve bağlantıyı kopyala">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
          Bağlantıyı kopyala
        </button>
      </div>
      <p className="eud-not" aria-live="polite">{not}</p>
    </div>
  );
}
