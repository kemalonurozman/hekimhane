'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { specToHref } from '@/lib/uzmanlik-data';
import AboneWidget from '@/components/AboneWidget';
import PremiumBadge from '@/components/PremiumBadge';

// ── Türkiye İl Merkez Koordinatları ──────────────────────────────
const IL_MERKEZ: Record<string, [number, number]> = {
  'Adana': [37.0, 35.3213], 'Adıyaman': [37.7648, 38.2786], 'Afyonkarahisar': [38.7507, 30.5567],
  'Ağrı': [39.7191, 43.0503], 'Amasya': [40.6499, 35.8353], 'Ankara': [39.9208, 32.8541],
  'Antalya': [36.8969, 30.7133], 'Artvin': [41.1828, 41.8183], 'Aydın': [37.8444, 27.8458],
  'Balıkesir': [39.6484, 27.8826], 'Bilecik': [40.1553, 29.9792], 'Bingöl': [38.8854, 40.4983],
  'Bitlis': [38.3938, 42.1232], 'Bolu': [40.7359, 31.6061], 'Burdur': [37.7265, 30.2908],
  'Bursa': [40.1826, 29.0665], 'Çanakkale': [40.1553, 26.4142], 'Çankırı': [40.6013, 33.6134],
  'Çorum': [40.5506, 34.9556], 'Denizli': [37.7765, 29.0864], 'Diyarbakır': [37.9144, 40.2306],
  'Edirne': [41.6818, 26.5623], 'Elazığ': [38.6810, 39.2264], 'Erzincan': [39.7500, 39.5000],
  'Erzurum': [39.9043, 41.2679], 'Eskişehir': [39.7767, 30.5206], 'Gaziantep': [37.0662, 37.3833],
  'Giresun': [40.9128, 38.3895], 'Gümüşhane': [40.4386, 39.5086], 'Hakkari': [37.5744, 43.7408],
  'Hatay': [36.4018, 36.3498], 'Isparta': [37.7648, 30.5566], 'İçel': [36.8121, 34.6415],
  'Mersin': [36.8121, 34.6415], 'İstanbul': [41.0082, 28.9784], 'İzmir': [38.4192, 27.1287],
  'Kars': [40.6013, 43.0975], 'Kastamonu': [41.3887, 33.7827], 'Kayseri': [38.7312, 35.4787],
  'Kırklareli': [41.7351, 27.2253], 'Kırşehir': [39.1425, 34.1709], 'Kocaeli': [40.8533, 29.8815],
  'Konya': [37.8714, 32.4846], 'Kütahya': [39.4167, 29.9833], 'Malatya': [38.3552, 38.3095],
  'Manisa': [38.6191, 27.4289], 'Kahramanmaraş': [37.5858, 36.9371], 'Mardin': [37.3212, 40.7245],
  'Muğla': [37.2153, 28.3636], 'Muş': [38.9462, 41.7539], 'Nevşehir': [38.6939, 34.6857],
  'Niğde': [37.9667, 34.6833], 'Ordu': [40.9862, 37.8797], 'Rize': [41.0201, 40.5234],
  'Sakarya': [40.6940, 30.4358], 'Samsun': [41.2867, 36.33], 'Siirt': [37.9333, 41.9500],
  'Sinop': [42.0231, 35.1531], 'Sivas': [39.7477, 37.0179], 'Tekirdağ': [40.9781, 27.5115],
  'Tokat': [40.3167, 36.5500], 'Trabzon': [41.0015, 39.7178], 'Tunceli': [39.1079, 39.5480],
  'Şanlıurfa': [37.1591, 38.7969], 'Uşak': [38.6823, 29.4082], 'Van': [38.4891, 43.4089],
  'Yozgat': [39.8181, 34.8147], 'Zonguldak': [41.4564, 31.7987], 'Aksaray': [38.3687, 34.0370],
  'Bayburt': [40.2552, 40.2249], 'Karaman': [37.1759, 33.2287], 'Kırıkkale': [39.8468, 33.5153],
  'Batman': [37.8812, 41.1351], 'Şırnak': [37.5164, 42.4611], 'Bartın': [41.6344, 32.3375],
  'Ardahan': [41.1105, 42.7022], 'Iğdır': [39.9167, 44.0333], 'Yalova': [40.6500, 29.2667],
  'Karabük': [41.2061, 32.6204], 'Kilis': [36.7184, 37.1212], 'Osmaniye': [37.0742, 36.2461],
  'Düzce': [40.8438, 31.1565],
};

// ── Tipler ────────────────────────────────────────────────────────
export interface YorumItem {
  id: string;
  author: string;
  rating: number;
  text?: string | null;
  date?: string | null;
  reply_text?: string | null;
  rating_temizlik?: number | null;
  rating_ilgi?: number | null;
  rating_hiz?: number | null;
  verified?: boolean;
}

export interface ProfilProps {
  entityType: 'klinik' | 'hastane' | 'doktor' | 'eczane';
  id: string;
  name: string;
  il?: string | null;
  ilce?: string | null;
  adres?: string | null;
  lat?: number;
  lng?: number;
  maps_url?: string | null;
  tel?: string | null;
  website?: string | null;
  logo?: string | null;
  cover?: string | null;
  rat?: number;
  rev?: number;
  specs?: string[] | null;
  claimed?: boolean;
  online?: boolean;
  acil?: boolean;
  premium?: boolean;
  verified?: boolean;
  type?: string | null;
  // doktor
  spec?: string | null;
  fee?: number;
  exp?: number;
  photo?: string | null;
  unvan?: string | null;
  bio?: string | null;
  okul?: string | null;
  sigorta?: string[] | null;
  conditions?: string[] | null;
  // hastane
  docs?: number;
  beds?: number;
  founded?: number | null;
  // eczane
  nobetci?: boolean;
  nobetci_bilgi?: string | null;
  pharmacist?: string | null;
  // sosyal medya & saatler
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  calisma_saatleri?: string | null;
  acik_24_saat?: boolean;
  // medya
  tour360url?: string | null;
  photo360?: string | null;
  photos?: string[] | null;
  video_url?: string | null;
  yorumlar: YorumItem[];
  breadcrumb: Array<{ label: string; href: string }>;
  listHref: string; // geri dön linki
}

// ── Yardımcı ─────────────────────────────────────────────────────
const TR_MONTHS_SHORT = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

/** "2026-05" → "Mayıs 2026",  "2026" → "2026",  diğer metin → aynen */
function formatVisitDate(d?: string | null): string {
  if (!d) return '';
  const m = d.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${TR_MONTHS_SHORT[parseInt(m[2], 10) - 1]} ${m[1]}`;
  return d;
}

function Stars({ rat, size = 13 }: { rat: number; size?: number }) {
  const rounded = Math.round(rat);
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <i key={i}
          className={`fa-${i <= rounded ? 'solid' : 'regular'} fa-star`}
          style={{ color: i <= rounded ? '#D4A843' : '#D1D5DB', fontSize: size, marginRight: 1 }}
        />
      ))}
    </span>
  );
}

function bayesian(reviews: YorumItem[]) {
  const C = 4.2, m = 8;
  if (!reviews.length) return C;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const w = (m * C + reviews.length * avg) / (m + reviews.length);
  return +w.toFixed(1);
}

/** YouTube/Vimeo URL veya iframe embed kodu → embed src'e dönüştürür */
function extractVideoSrc(val: string | null | undefined): string | null {
  if (!val) return null;
  const v = val.trim();
  // iframe HTML embed kodu → src'i çıkar
  if (v.startsWith('<')) {
    const match = v.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  }
  // YouTube izleme linki → embed
  const ytWatch = v.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?rel=0`;
  // Zaten embed URL'si
  if (v.includes('youtube.com/embed/')) return v;
  // YouTube shorts
  const ytShorts = v.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}?rel=0`;
  // Vimeo
  const vimeoMatch = v.match(/(?:^|vimeo\.com\/)(\d+)(?:$|[/?#])/);
  if (vimeoMatch && !v.includes('player.vimeo.com')) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (v.includes('player.vimeo.com')) return v;
  // Genel HTTP URL
  if (v.startsWith('http')) return v;
  return null;
}

/** iframe HTML embed kodu veya düz URL → iframe src'e dönüştürür */
function extractTourSrc(val: string | null | undefined): { src: string; isEmbed: boolean } | null {
  if (!val) return null;
  const v = val.trim();
  // Tam iframe HTML kodu geldiyse → src'i çıkar
  if (v.startsWith('<')) {
    const match = v.match(/src=["']([^"']+)["']/i);
    return match ? { src: match[1], isEmbed: true } : null;
  }
  // Düz URL
  if (v.startsWith('http')) return { src: v, isEmbed: false };
  return null;
}

function maskName(n?: string | null) {
  if (!n) return 'Hasta';
  return n.trim().split(/\s+/).map(w => w.length <= 2 ? w : w.slice(0, 2) + '…').join(' ');
}

const TABS = ['genel', 'konum', 'tur', 'video', 'yorumlar', 'randevu'] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, { icon: string; label: string }> = {
  genel:    { icon: 'fa-circle-info',      label: 'Genel' },
  konum:    { icon: 'fa-map-location-dot', label: 'Konum' },
  tur:      { icon: 'fa-vr-cardboard',     label: '360° Tur' },
  video:    { icon: 'fa-play-circle',      label: 'Video' },
  yorumlar: { icon: 'fa-star',             label: 'Yorumlar' },
  randevu:  { icon: 'fa-calendar-plus',    label: 'Randevu' },
};

// ── 360° Panorama Viewer (Pannellum CDN) ─────────────────────────
function Panorama360({ url, name }: { url: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    function boot() {
      const P = (window as any).pannellum;
      if (!P || !containerRef.current) return;
      viewerRef.current = P.viewer(containerRef.current, {
        type:       'equirectangular',
        panorama:   url,
        autoLoad:   true,
        autoRotate: -2,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        hfov: 100,
        title: name,
        strings: { loadButtonLabel: '360° Görünümü Başlat', loadingLabel: 'Yükleniyor...' },
      });
    }

    // CSS
    if (!document.getElementById('pannellum-css')) {
      const css = document.createElement('link');
      css.id   = 'pannellum-css';
      css.rel  = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(css);
    }

    if ((window as any).pannellum) { boot(); return; }

    const s = document.createElement('script');
    s.src   = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    s.onload = boot;
    document.head.appendChild(s);

    return () => {
      if (viewerRef.current?.destroy) { viewerRef.current.destroy(); viewerRef.current = null; }
    };
  }, [url, name]);

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div ref={containerRef} style={{ width: '100%', height: 400 }} />
      <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(27,58,105,.85)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none', zIndex: 10 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        360° Panorama
      </div>
    </div>
  );
}

// ── Harita Bileşeni (Leaflet CDN) ─────────────────────────────────
// Öncelik: 1) gerçek lat/lng  2) adres geocode (DB'ye kaydedilir)  3) il merkezi
type CoordSource = 'exact' | 'address' | 'city' | null;
function KonumHarita({ lat, lng, name, mapsUrl, adres, il, ilce, entityId, entityType }: {
  lat?: number | null; lng?: number | null; name: string; mapsUrl?: string | null;
  adres?: string | null; il?: string | null; ilce?: string | null;
  entityId?: string; entityType?: string;
}) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapObj  = useRef<any>(null);

  const hasExact = !!(lat && lng && lat !== 0 && lng !== 0);

  const [coords, setCoords]     = useState<{ lat: number; lng: number } | null>(
    hasExact ? { lat: lat!, lng: lng! } : null
  );
  const [source, setSource]     = useState<CoordSource>(hasExact ? 'exact' : null);
  const [geocoding, setGeocoding] = useState(!hasExact);

  // Eğer gerçek koordinat yoksa: önce adres, sonra il merkezi
  useEffect(() => {
    if (hasExact) { setGeocoding(false); return; }

    const nominatim = async (q: string) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({ q, format: 'json', limit: '1', countrycodes: 'tr' }),
          { headers: { 'User-Agent': 'Hekimhane/1.0 (rehber360com@gmail.com)' } }
        );
        const data = await res.json();
        if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } catch {}
      return null;
    };

    const simplifyAdres = (a: string) =>
      // "Fener Mah. Fener Cad. ... No: 9/11" → "Fener Mahallesi Fener Caddesi"
      a.replace(/\bMah\b\.?/gi, 'Mahallesi')
       .replace(/\bCad\b\.?/gi, 'Caddesi')
       .replace(/\bSok\b\.?/gi, 'Sokağı')
       .replace(/\bBulv\b\.?/gi, 'Bulvarı')
       .replace(/No\s*:\s*[\d/]+.*/gi, '')   // No: 9/11 ve sonrasını at
       .replace(/\bKat\s*:\s*\d+.*/gi, '')   // Kat: 1 ve sonrasını at
       .replace(/\bBlok.*/gi, '')             // Blok ve sonrasını at
       .trim();

    const tryGeocode = async () => {
      if (adres) {
        const simple = simplifyAdres(adres);
        // Deneme sırası: 1) sadeleştirilmiş adres+ilçe+il, 2) sadece ilçe+il, 3) name+ilçe+il
        const queries = [
          [simple, ilce, il, 'Türkiye'].filter(Boolean).join(', '),
          [adres, ilce, il, 'Türkiye'].filter(Boolean).join(', '),
          [name, ilce, il, 'Türkiye'].filter(Boolean).join(', '),
        ];
        for (const q of queries) {
          const result = await nominatim(q);
          if (result) {
            setCoords(result);
            setSource('address');
            setGeocoding(false);
            // Koordinatı DB'ye kaydet — liste haritası da güncellensin
            if (entityId && entityType) {
              const tableMap: Record<string, string> = {
                doktor: 'doktorlar', klinik: 'klinikler',
                hastane: 'hastaneler', eczane: 'eczaneler',
              };
              const table = tableMap[entityType];
              if (table) {
                const sb = createSupabaseBrowser();
                (sb as any).from(table)
                  .update({ lat: result.lat, lng: result.lng })
                  .eq('id', entityId)
                  .then(() => {/* sessizce kaydet */});
              }
            }
            return;
          }
          await new Promise(r => setTimeout(r, 300)); // rate limit
        }
      }
      // Adres geocode başarısız → il merkezi
      const center = il ? IL_MERKEZ[il] : null;
      if (center) {
        setCoords({ lat: center[0], lng: center[1] });
        setSource('city');
      }
      setGeocoding(false);
    };

    tryGeocode();
  }, []); // sadece mount'ta çalışır

  // Haritayı başlat veya güncelle
  useEffect(() => {
    if (!coords || !mapRef.current) return;

    function boot() {
      const L = (window as any).L;
      if (!L) return;
      if (mapObj.current) {
        mapObj.current.setView([coords!.lat, coords!.lng], source === 'city' ? 12 : 15);
        return;
      }
      const zoom = source === 'city' ? 12 : source === 'address' ? 14 : 15;
      const map = L.map(mapRef.current!, { scrollWheelZoom: false }).setView([coords!.lat, coords!.lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>', maxZoom: 18,
      }).addTo(map);
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#1B3A69;width:44px;height:44px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 14px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:18px;">📍</span></div>`,
        iconSize: [44, 44], iconAnchor: [22, 44], popupAnchor: [0, -48],
      });
      L.marker([coords!.lat, coords!.lng], { icon }).addTo(map)
        .bindPopup(`<strong style="font-size:13px;">${name}</strong>${mapsUrl ? `<br><a href="${mapsUrl}" target="_blank" style="font-size:12px;color:#1B3A69;">📍 Google Maps</a>` : ''}`).openPopup();
      setTimeout(() => map.invalidateSize(), 100);
      mapObj.current = map;
    }

    if ((window as any).L) { boot(); return; }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = boot;
    document.head.appendChild(s);
  }, [coords]);

  if (geocoding) return (
    <div style={{ height: 300, background: '#F3F4F6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexDirection: 'column', gap: 8 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13 }}>Konum belirleniyor...</span>
    </div>
  );

  if (!coords) return (
    <div style={{ height: 300, background: '#F3F4F6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexDirection: 'column', gap: 8 }}>
      <i className="fa-solid fa-map-location-dot" style={{ fontSize: 32 }} />
      <span style={{ fontSize: 13 }}>Konum bilgisi henüz eklenmemiş</span>
    </div>
  );

  return (
    <>
      {source === 'city' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 14px', background: '#FEF9EC', borderRadius: 10, border: '1px solid #F5D06A', fontSize: 12, color: '#92600A' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 13 }} />
          Tam adres bulunamadığı için {il} il merkezi gösteriliyor
        </div>
      )}
      <div ref={mapRef} style={{ height: 320, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }} />
    </>
  );
}

// ── Yorum Formu ───────────────────────────────────────────────────
const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const CURRENT_YEAR = new Date().getFullYear();
const VISIT_YEARS  = Array.from({ length: CURRENT_YEAR - 2017 }, (_, i) => CURRENT_YEAR - i);

function YorumForm({ entityId, entityType, onSubmit }: { entityId: string; entityType: string; onSubmit: (y: YorumItem) => void }) {
  const [open, setOpen]           = useState(false);
  const [star, setStar]           = useState(0);
  const [txt, setTxt]             = useState('');
  const [ad, setAd]               = useState('');
  const [soyad, setSoyad]         = useState('');
  const [email, setEmail]         = useState('');
  const [visitMonth, setVisitMonth] = useState('');
  const [visitYear, setVisitYear]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  function buildDateStr() {
    if (visitYear && visitMonth) return `${visitYear}-${String(TR_MONTHS.indexOf(visitMonth) + 1).padStart(2,'0')}`;
    if (visitYear) return visitYear;
    return new Date().toISOString().slice(0, 7);
  }

  async function submit() {
    if (!star) { showToast('Lütfen puan seçin!'); return; }
    if (txt.length < 20) { showToast('Deneyiminiz en az 20 karakter olmalı.'); return; }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) { showToast('Geçerli bir e-posta girin.'); return; }
    setSaving(true);
    const author = (ad + ' ' + (soyad ? soyad[0] + '.' : '')).trim() || 'Anonim';
    const supabase = createSupabaseBrowser();
    const { data, error } = await (supabase as any).from('yorumlar').insert({
      entity_type: entityType, entity_id: entityId,
      author, rating: star, text: txt,
      date: buildDateStr(),
      helpful: 0, verified: false,
    }).select().single();
    setSaving(false);
    if (error) { showToast('Hata oluştu, tekrar deneyin.'); return; }
    if (data) onSubmit(data as YorumItem);
    setOpen(false); setStar(0); setTxt(''); setAd(''); setSoyad(''); setEmail('');
    setVisitMonth(''); setVisitYear('');
    showToast('Yorumunuz eklendi, teşekkürler! ✅');
  }

  const starLabels = ['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'];

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#1B3A69', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {!open ? (
        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 18, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#065F46', marginBottom: 3 }}>Deneyiminizi paylaşın</div>
            <div style={{ fontSize: 13, color: '#047857' }}>Bu işletme hakkındaki deneyiminizi diğer hastalara aktarın.</div>
          </div>
          <button onClick={() => setOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#059669', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <i className="fa-solid fa-pencil" /> Deneyiminizi paylaşın
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Deneyiminizi Paylaşın</h3>
            <button onClick={() => setOpen(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#6B7280' }}>✕</button>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>Puanınız</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              {[1,2,3,4,5].map(v => (
                <span key={v} onClick={() => setStar(v)} style={{ fontSize: 34, cursor: 'pointer', color: v <= star ? '#D4A843' : '#D1D5DB', transition: 'color .15s' }}>★</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{star ? starLabels[star] : 'Puanlamak için yıldıza tıklayın'}</div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Deneyiminiz <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(en az 20 karakter)</span></div>
            <textarea value={txt} onChange={e => setTxt(e.target.value)}
              placeholder="Bu işletmeyle yaşadığınız deneyimi anlatın..." rows={4}
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #BBF7D0', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Adınız', val: ad, set: setAd, ph: 'Adınız' },
                { label: 'Soyadınız', val: soyad, set: setSoyad, ph: 'Soyadınız' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{f.label}</div>
                  <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #BBF7D0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>E-posta <span style={{ color: '#DC2626' }}>*</span></div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com"
              style={{ width: '100%', padding: '10px 14px', border: '2px solid #BBF7D0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Ziyaret Tarihi <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsiyonel)</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <select value={visitMonth} onChange={e => setVisitMonth(e.target.value)}
                style={{ padding: '10px 12px', border: '2px solid #BBF7D0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white', color: visitMonth ? 'inherit' : '#9CA3AF' }}>
                <option value="">Ay seçin</option>
                {TR_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={visitYear} onChange={e => setVisitYear(e.target.value)}
                style={{ padding: '10px 12px', border: '2px solid #BBF7D0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white', color: visitYear ? 'inherit' : '#9CA3AF' }}>
                <option value="">Yıl seçin</option>
                {VISIT_YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>

            <button onClick={submit} disabled={saving}
              style={{ width: '100%', background: '#059669', color: 'white', border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Gönderiliyor...' : <><i className="fa-solid fa-paper-plane" style={{ marginRight: 6 }} />Yorumu Gönder</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Randevu Talep Modalı ─────────────────────────────────────────
function RandevuModal({ name, open, onClose }: { name: string; open: boolean; onClose: () => void }) {
  const [email, setEmail]     = useState('');
  const [consent, setConsent] = useState(false);
  const [done, setDone]       = useState(false);
  const [saving, setSaving]   = useState(false);

  function submit() {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !re.test(email)) return;
    if (!consent) return;
    setSaving(true);
    setTimeout(() => { setSaving(false); setDone(true); }, 800);
  }

  if (!open) return null;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', padding: 32, position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>✕</button>
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Talebiniz Alındı!</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Randevu takvimi aktive edildiğinde e-posta ile bilgilendirileceksiniz.</p>
            <button onClick={onClose} style={{ marginTop: 16, padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Kapat</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 20, fontWeight: 800, marginBottom: 8, paddingRight: 28, lineHeight: 1.25 }}>
              {name} için randevu takvimini açmasını isteyin
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
              E-posta adresinizi bırakın, takvim aktive edilirse sizi bilgilendirelim.
            </p>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>E-posta Adresi <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresinizi yazınız"
              style={{ width: '100%', padding: '13px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: 'var(--muted)', marginBottom: 20, cursor: 'pointer', lineHeight: 1.6 }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: '#059669', flexShrink: 0 }} />
              <span><a href="/kosullar" style={{ color: '#059669', fontWeight: 600 }}>Kullanım Koşulları</a>'nı kabul ediyorum ve bildirim amacıyla verilerimin işlenmesine onay veriyorum.</span>
            </label>
            <button onClick={submit} disabled={!email || !consent || saving}
              style={{ width: '100%', padding: 13, background: '#059669', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: (!email || !consent) ? 'not-allowed' : 'pointer', opacity: (!email || !consent) ? 0.6 : 1, transition: '.2s' }}>
              {saving ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────────
export default function ProfilSayfasi(props: ProfilProps) {
  const { entityType, id, name, il, ilce, adres, lat, lng, maps_url, tel, website, logo, cover, rat = 0, specs, claimed, online, acil, premium, verified, type, spec, fee, exp, photo, unvan, bio, okul, sigorta, conditions, docs, beds, founded, nobetci, nobetci_bilgi, pharmacist, instagram_url, facebook_url, linkedin_url, calisma_saatleri, acik_24_saat, tour360url, photo360, photos, video_url, listHref, breadcrumb } = props;

  const [activeTab, setActiveTab] = useState<Tab>('genel');
  const [yorumlar, setYorumlar]   = useState<YorumItem[]>(props.yorumlar);
  const [randevuModal, setRandevuModal] = useState(false);
  const [lightboxIdx, setLightboxIdx]   = useState<number | null>(null);
  const [isOwner,  setIsOwner]  = useState(false);
  const [ownerEditUrl, setOwnerEditUrl] = useState('/panel');

  // Giriş yapan kullanıcı bu profilin sahibi mi?
  useEffect(() => {
    if (!claimed) return;
    const supabase = createSupabaseBrowser();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await (supabase as any)
        .from('claim_requests')
        .select('id')
        .eq('entity_id', id)
        .eq('entity_type', entityType)
        .eq('status', 'approved')
        .eq('email', user.email)
        .maybeSingle();
      if (data) {
        setIsOwner(true);
        setOwnerEditUrl('/panel');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, entityType, claimed]);

  const avg     = bayesian(yorumlar);
  const counts  = [0,0,0,0,0];
  yorumlar.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });

  // İkon / logo — doktor için SVG, diğerleri emoji
  const entityIconEmoji: Record<string, string> = { klinik: '🦷', hastane: '🏥', eczane: '💊' };
  const entityIconSvg = entityType === 'doktor' ? (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      <path d="M17 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>
  ) : null;
  const entityIcon = entityIconSvg ?? entityIconEmoji[entityType] ?? '🏥';

  const displayName = (entityType === 'doktor' && unvan)
    ? `${unvan} ${name}`
    : name;

  const typeLabel = entityType === 'klinik'  ? (type || 'Diş Kliniği')
    : entityType === 'hastane' ? (type || 'Hastane')
    : entityType === 'eczane'  ? 'Eczane'
    : (spec || 'Doktor');

  // Info grid satırları
  const infoRows = entityType === 'doktor'
    ? [
        { l: 'Uzmanlık', v: spec || '—' },
        { l: 'Şehir', v: il || '—' },
        { l: 'İlçe', v: ilce || '—' },
        { l: 'Deneyim', v: exp ? `${exp} yıl` : '—' },
        { l: 'Seans Ücreti', v: fee ? `${fee.toLocaleString('tr')} ₺` : '—' },
        { l: 'Puan', v: `${avg} / 5` },
      ]
    : entityType === 'eczane'
    ? [
        { l: 'Eczacı', v: pharmacist || '—' },
        { l: 'Şehir', v: il || '—' },
        { l: 'İlçe', v: ilce || '—' },
        { l: 'Telefon', v: tel || '—' },
        { l: 'Nöbetçi', v: nobetci ? 'Evet 🌙' : 'Hayır' },
      ]
    : entityType === 'hastane'
    ? [
        { l: 'Tür', v: type || '—' },
        { l: 'Şehir', v: il || '—' },
        { l: 'İlçe', v: ilce || '—' },
        { l: 'Doktor Sayısı', v: docs ? String(docs) : '—' },
        { l: 'Yatak Kapasitesi', v: beds ? String(beds) : '—' },
        { l: 'Kuruluş', v: founded ? String(founded) : '—' },
        { l: 'Puan', v: `${avg} / 5` },
      ]
    : [
        { l: 'Tür', v: type || '—' },
        { l: 'Şehir', v: il || '—' },
        { l: 'İlçe', v: ilce || '—' },
        { l: 'Telefon', v: tel || '—' },
        { l: 'Puan', v: `${avg} / 5` },
        { l: 'Uzmanlık', v: specs?.join(', ') || '—' },
      ];

  const sc: React.CSSProperties = { background: 'white', borderRadius: 20, marginBottom: 24, border: '1px solid var(--border)', overflow: 'hidden' };
  const scHd: React.CSSProperties = { padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const scBody: React.CSSProperties = { padding: 24 };

  return (
    <div style={{ paddingTop: 66 }}>

            {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          {breadcrumb.map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <i className="fa-solid fa-chevron-right" style={{ fontSize: 8 }} />}
              {i === breadcrumb.length - 1
                ? <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{b.label}</span>
                : <Link href={b.href} style={{ color: 'var(--navy)', fontWeight: 500 }}>{b.label}</Link>}
            </span>
          ))}
        </div>
      </div>

      {/* HERO ─────────────────────────────────────────────── */}
      <div style={{
        background: cover ? `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.4)),url(${cover}) center/cover` : 'var(--cream)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Mesh gradient (sadece cover yoksa) */}
        {!cover && (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 120% at 100% 0%,rgba(212,168,67,.07),transparent 55%),radial-gradient(ellipse 40% 80% at 0% 100%,rgba(27,58,105,.05),transparent 60%)', pointerEvents: 'none' }} />
        )}

        <div className="container" style={{ padding: '28px 16px 0', position: 'relative', zIndex: 1 }}>
          <div className="profil-hero-header">

            {/* Logo */}
            <div className="profil-logo-wrap">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: 112, height: 112, borderRadius: 22, background: (logo || photo) ? 'transparent' : 'var(--navy)', border: `4px solid white`, boxShadow: `0 0 0 3px ${premium ? '#D4A843' : 'var(--gold)'},0 8px 32px rgba(27,58,105,.2)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: entityIconSvg ? 0 : 48 }}>
                  {(logo || photo)
                    ? <img src={logo || photo!} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : entityIcon}
                </div>
                {premium && <PremiumBadge size="lg" />}
              </div>
            </div>

            {/* Bilgiler */}
            <div className="profil-info-col" style={{ paddingBottom: 28 }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--gold-light)', color: 'var(--gold2)', border: '1px solid rgba(212,168,67,.3)' }}>{typeLabel}</span>
                {acil   && <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>🚨 Acil</span>}
                {online && <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>📅 Online Randevu</span>}
                {nobetci && <span style={{ padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE' }}>🌙 Nöbetçi</span>}
                {premium && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', color: '#92400E', border: '1px solid #F59E0B' }}>
                    ⭐ Premium
                  </span>
                )}
                {claimed
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'linear-gradient(135deg,var(--navy),var(--navy2))', color: 'white' }}>✓ Sahiplenildi</span>
                  : <Link href={`/sahiplen?id=${id}&type=${entityType}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 0, borderRadius: 20, fontSize: 11, fontWeight: 700, overflow: 'hidden', border: '1.5px solid #D4A843', textDecoration: 'none' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#D4A843', color: '#1B3A69', fontWeight: 900, letterSpacing: '0.3px' }}>
                        <i className="fa-solid fa-flag" style={{ fontSize: 8 }} />ÜCRETSİZ
                      </span>
                      <span style={{ padding: '3px 9px', background: 'white', color: '#1B3A69', fontWeight: 700 }}>Sahiplenin</span>
                    </Link>
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 30, fontWeight: 800, color: cover ? 'white' : 'var(--text)', lineHeight: 1.2, margin: 0 }}>
                  {displayName}
                </h1>
                {premium && <PremiumBadge size="lg" variant="inline" />}
                {isOwner && (
                  <a href={ownerEditUrl}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(27,58,105,.1)', border: '1px solid rgba(27,58,105,.25)', color: 'var(--navy)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Düzenle
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: cover ? 'rgba(255,255,255,.85)' : 'var(--navy2)', fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)' }} />
                {[adres, ilce, il].filter(Boolean).join(', ') || '—'}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: cover ? 'rgba(255,255,255,.8)' : 'var(--muted)' }}>
                <span><Stars rat={avg} /> <strong style={{ color: cover ? 'white' : 'var(--text)', fontSize: 16 }}>{avg}</strong></span>
                {yorumlar.length > 0 && <span>{yorumlar.length} yorum</span>}
                {tel && <span>📞 {tel}</span>}
                {entityType === 'doktor' && fee ? <span>💰 {fee.toLocaleString('tr')} ₺</span> : null}
              </div>
            </div>

            {/* Aksiyon butonları — sahip veya ziyaretçi aynı butonları görür */}
            <div className="profil-action-col">
              {(
                <>
                  <button onClick={() => setActiveTab('randevu')}
                    style={{ padding: '11px 20px', borderRadius: 11, fontSize: 13.5, fontWeight: 700, background: 'var(--gold)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(212,168,67,.3)' }}>
                    <i className="fa-solid fa-calendar-check" /> Randevu Al
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {tel && (
                      <a href={`tel:${tel.replace(/\s/g,'')}`}
                        style={{ padding: '10px', borderRadius: 11, fontSize: 12.5, fontWeight: 700, background: 'white', color: 'var(--navy)', border: '1.5px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <i className="fa-solid fa-phone" /> Ara
                      </a>
                    )}
                    {maps_url && (
                      <a href={maps_url} target="_blank" rel="noopener"
                        style={{ padding: '10px', borderRadius: 11, fontSize: 12.5, fontWeight: 700, background: '#DCFCE7', color: '#15803D', border: '1.5px solid #BBF7D0', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <i className="fa-brands fa-google" /> Harita
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tab bar */}

          <div className="profil-tab-bar">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '14px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'transparent', borderBottom: `3px solid ${activeTab === tab ? 'var(--gold)' : 'transparent'}`, color: activeTab === tab ? 'var(--navy)' : 'var(--muted)', transition: '.2s', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
                <i className={`fa-solid ${TAB_LABELS[tab].icon}`} />
                {TAB_LABELS[tab].label}
                {tab === 'yorumlar' && (
                  <span style={{ background: 'rgba(27,58,105,.12)', padding: '2px 7px', borderRadius: 10, fontSize: 11, marginLeft: 2 }}>{yorumlar.length}</span>
                )}
                {tab === 'tur' && (
                  <span style={{ background: 'rgba(212,168,67,.2)', color: 'var(--gold)', padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700, marginLeft: 2 }}>YENİ</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BODY ─────────────────────────────────────────────── */}
      <div className="container profil-body-grid">

        {/* SOL KOLON */}
        <div>

          {/* ── GENEL TAB ── */}
          {activeTab === 'genel' && (
            <>
              {/* Klinik bilgileri */}
              <div style={sc}>
                <div style={scHd}><h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>
                  {entityType === 'doktor' ? 'Doktor Bilgileri' : entityType === 'eczane' ? 'Eczane Bilgileri' : entityType === 'hastane' ? 'Hastane Bilgileri' : 'Klinik Bilgileri'}
                </h3></div>
                <div style={scBody}>
                  <div className="profil-info-grid">
                    {infoRows.filter(r => r.v && r.v !== '—').map(r => (
                      <div key={r.l} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--muted)' }}>{r.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Uzmanlık alanları */}
              {specs && specs.length > 0 && (
                <div style={sc}>
                  <div style={scHd}><h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Uzmanlık Alanları</h3></div>
                  <div style={scBody}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {specs.map(s => (
                        <Link
                          key={s}
                          href={specToHref(s)}
                          style={{
                            display: 'inline-block',
                            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: 'var(--gold-light)', color: 'var(--navy)',
                            border: '1px solid rgba(212,168,67,.3)',
                            textDecoration: 'none',
                            transition: 'background .15s, border-color .15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,168,67,.25)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,168,67,.6)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-light)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,168,67,.3)'; }}
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Biyografi (doktor) ── */}
              {entityType === 'doktor' && bio && (
                <div style={sc}>
                  <div style={scHd}><h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Hakkında</h3></div>
                  <div style={scBody}>
                    {bio.split('\n\n').map((para, i) => (
                      <p key={i} style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, marginBottom: i < bio.split('\n\n').length - 1 ? 14 : 0 }}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Eğitim (doktor) ── */}
              {entityType === 'doktor' && okul && (
                <div style={sc}>
                  <div style={scHd}><h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Eğitim & Kariyer</h3></div>
                  <div style={scBody}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {okul.split('·').map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--navy),var(--navy2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <i className="fa-solid fa-graduation-cap" style={{ color: 'white', fontSize: 13 }} />
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, paddingTop: 5 }}>{item.trim()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Fotoğraf Galerisi ── */}
              {(() => {
                const galleryPhotos = (photos || []).filter(Boolean) as string[];
                const SLOTS = 6;
                const placeholders = Math.max(0, SLOTS - galleryPhotos.length);
                return (
                  <div style={sc}>
                    <div style={scHd}>
                      <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Fotoğraflar</h3>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {galleryPhotos.length > 0 ? `${galleryPhotos.length} fotoğraf` : 'Henüz fotoğraf eklenmemiş'}
                      </span>
                    </div>
                    <div style={scBody}>
                      <div className="profil-photo-grid">
                        {/* Gerçek fotoğraflar */}
                        {galleryPhotos.map((url, i) => (
                          <button key={i} onClick={() => setLightboxIdx(i)}
                            style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', display: 'block', border: '1px solid var(--border)', position: 'relative', padding: 0, cursor: 'zoom-in', background: 'none' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`${name} - ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background .2s' }}
                              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,.18)'}
                              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)'} />
                          </button>
                        ))}
                        {/* Placeholder slotlar */}
                        {Array.from({ length: placeholders }).map((_, i) => (
                          <div key={`ph-${i}`}
                            style={{ aspectRatio: '4/3', borderRadius: 12, border: '1.5px dashed #D1D5DB', background: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9CA3AF' }}>
                            <i className="fa-regular fa-image" style={{ fontSize: 22 }} />
                            <span style={{ fontSize: 11, fontWeight: 500 }}>Fotoğraf {galleryPhotos.length + i + 1}</span>
                          </div>
                        ))}
                      </div>
                      {galleryPhotos.length === 0 && claimed && (
                        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
                          İşletme sahibi fotoğraf ekleyebilir.<br />
                          <a href="/panel" style={{ color: 'var(--navy)', fontWeight: 600 }}>Panel üzerinden düzenleyin →</a>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── 360° Görünüm ── */}
              {(() => {
                const tourInfo = extractTourSrc(tour360url);
                const panoInfo = extractTourSrc(photo360);
                // photo360 gerçek equirectangular resim dosyasıysa (jpg/png) Pannellum kullan
                const isEquiRect = panoInfo && !panoInfo.isEmbed && /\.(jpg|jpeg|png|webp)/i.test(panoInfo.src);

                if (!tourInfo && !panoInfo) return null;

                // Aynı src ise ikinci kez gösterme
                const showPano = panoInfo && !(tourInfo && tourInfo.src === panoInfo.src);

                function IframeBlock({ src, label, mb }: { src: string; label: string; mb?: number }) {
                  return (
                    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: '#F3F4F6', aspectRatio: '16/9', marginBottom: mb ?? 0 }}>
                      <iframe
                        src={src}
                        title={`${name} — ${label}`}
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        allowFullScreen
                        allow="xr-spatial-tracking; fullscreen"
                      />
                      <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(27,58,105,.85)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none', zIndex: 10 }}>
                        <i className="fa-solid fa-vr-cardboard" style={{ fontSize: 11 }} /> {label}
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={sc}>
                    <div style={scHd}>
                      <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>360° Görünüm</h3>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        360°
                      </span>
                    </div>
                    <div style={scBody}>
                      {/* İpucu bandı */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EEF2FF', borderRadius: 10, padding: '9px 13px', marginBottom: 14, fontSize: 12, color: '#3730A3' }}>
                        <i className="fa-solid fa-circle-info" style={{ flexShrink: 0 }} />
                        Fareyi veya parmağınızı kullanarak mekanı 360° keşfedin.
                      </div>

                      {/* tour360url — iframe */}
                      {tourInfo && (
                        <IframeBlock src={tourInfo.src} label="Sanal Tur" mb={showPano ? 14 : 0} />
                      )}

                      {/* photo360 — equirectangular resim → Pannellum, iframe/URL → iframe */}
                      {showPano && (
                        isEquiRect
                          ? <Panorama360 url={panoInfo!.src} name={name} />
                          : <IframeBlock src={panoInfo!.src} label="360° Fotoğraf" />
                      )}

                      {/* Dışarıda aç */}
                      {(tourInfo || (showPano && !isEquiRect)) && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                          {tourInfo && (
                            <a href={tourInfo.src} target="_blank" rel="noopener"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'var(--navy)', color: 'white', textDecoration: 'none' }}>
                              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} /> Tam Ekran Aç
                            </a>
                          )}
                          {showPano && !isEquiRect && (
                            <a href={panoInfo!.src} target="_blank" rel="noopener"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#F0F4FF', color: 'var(--navy)', textDecoration: 'none' }}>
                              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} /> 360° Tam Ekran
                            </a>
                          )}
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 10, fontSize: 12, background: '#F0F4FF', color: 'var(--muted)' }}>
                            <i className="fa-solid fa-vr-cardboard" style={{ color: '#4F46E5', fontSize: 12 }} /> VR gözlük uyumlu
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Sigorta & Koşullar (doktor) ── */}
              {entityType === 'doktor' && (sigorta?.length || conditions?.length) ? (
                <div style={sc}>
                  <div style={scHd}><h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Sigorta & Tedavi Alanları</h3></div>
                  <div style={scBody}>
                    {sigorta && sigorta.length > 0 && (
                      <div style={{ marginBottom: conditions?.length ? 20 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--muted)', marginBottom: 10 }}>Kabul Edilen Sigortalar</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {sigorta.map(s => (
                            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                              <i className="fa-solid fa-shield-check" style={{ fontSize: 10 }} />{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {conditions && conditions.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--muted)', marginBottom: 10 }}>Tedavi Ettiği Durumlar</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {conditions.map(c => (
                            <span key={c} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: '#F9FBFF', color: 'var(--navy)', border: '1px solid var(--border)' }}>
                              {c.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Sahiplen CTA */}
              {!claimed && (
                <div className="profil-sahiplen-cta" style={{ background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', border: '1.5px solid #C7D2FE', borderRadius: 20, padding: '24px 28px' }}>
                  <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,var(--navy),var(--navy2))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(27,58,105,.25)' }}>
                    <i className="fa-solid fa-flag" style={{ color: 'white', fontSize: 20 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>Bu işletmenin sahibi misiniz?</div>
                    <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>Sayfayı sahiplenerek bilgileri güncelleyin, fotoğraf ekleyin ve müşterilerinize daha kolay ulaşın.</div>
                  </div>
                  <Link href={`/sahiplen?id=${id}&type=${entityType}`} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 0, borderRadius: 12, overflow: 'hidden', border: '2px solid #D4A843', textDecoration: 'none' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#D4A843', color: '#1B3A69', fontSize: 12, fontWeight: 900, letterSpacing: '0.5px' }}>
                      <i className="fa-solid fa-flag" style={{ fontSize: 11 }} />ÜCRETSİZ
                    </span>
                    <span style={{ padding: '10px 16px', background: 'var(--navy)', color: 'white', fontSize: 13, fontWeight: 700 }}>Sahiplenin</span>
                  </Link>
                </div>
              )}

              {/* Değerlendirmeler */}
              <div style={sc}>
                <div style={scHd}>
                  <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Değerlendirmeler</h3>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{yorumlar.length} yorum</span>
                </div>
                <div style={scBody}>
                  {/* Rating summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 52, fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{avg}</div>
                      <Stars rat={avg} size={18} />
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{yorumlar.length} değerlendirme</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5,4,3,2,1].map(star => {
                        const pct = yorumlar.length ? Math.round(counts[star-1] / yorumlar.length * 100) : 0;
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, width: 14, textAlign: 'right', color: 'var(--muted)' }}>{star}</div>
                            <div style={{ flex: 1, height: 7, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#D4A843', borderRadius: 4, transition: 'width .4s' }} />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', width: 28 }}>{pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Reviews */}
                  {yorumlar.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--muted)' }}>
                      <i className="fa-regular fa-comment" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                      Henüz yorum yok
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {yorumlar.slice(0, 5).map(r => (
                        <div key={r.id} style={{ background: '#F9FBFF', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{maskName(r.author)}</span>
                              {r.verified && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Doğrulandı</span>}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatVisitDate(r.date)}</span>
                          </div>
                          <Stars rat={r.rating} />
                          {(r.rating_temizlik || r.rating_ilgi || r.rating_hiz) && (
                            <div style={{ display: 'flex', gap: 12, margin: '6px 0', flexWrap: 'wrap' }}>
                              {r.rating_temizlik && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🧹 Temizlik: <strong>{r.rating_temizlik}</strong></span>}
                              {r.rating_ilgi && <span style={{ fontSize: 11, color: 'var(--muted)' }}>❤️ İlgi: <strong>{r.rating_ilgi}</strong></span>}
                              {r.rating_hiz && <span style={{ fontSize: 11, color: 'var(--muted)' }}>⚡ Hız: <strong>{r.rating_hiz}</strong></span>}
                            </div>
                          )}
                          {r.text && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginTop: 6 }}>{r.text}</p>}
                          {r.reply_text && (
                            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', borderLeft: '3px solid #86EFAC', marginTop: 10 }}>
                              <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginBottom: 4 }}>İşletme Yanıtı</div>
                              <p style={{ fontSize: 13, color: '#15803D', margin: 0 }}>{r.reply_text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── KONUM TAB ── */}
          {activeTab === 'konum' && (
            <div style={sc}>
              <div style={scHd}><h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Konum & Adres</h3></div>
              <div style={scBody}>
                {adres && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18, padding: '14px 16px', background: '#F4F9F8', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--navy)', marginTop: 2, fontSize: 16 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{adres}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{[ilce, il].filter(Boolean).join(' / ')}</div>
                    </div>
                  </div>
                )}
                <KonumHarita lat={lat} lng={lng} name={name} mapsUrl={maps_url} adres={adres} il={il} ilce={ilce} entityId={id} entityType={entityType} />
                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {maps_url && (
                    <a href={maps_url} target="_blank" rel="noopener" style={{ padding: '11px 20px', borderRadius: 11, fontSize: 13, fontWeight: 700, background: '#DCFCE7', color: '#15803D', border: '1.5px solid #BBF7D0', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-brands fa-google" /> Google Maps'te Aç
                    </a>
                  )}
                  {tel && (
                    <a href={`tel:${tel.replace(/\s/g,'')}`} style={{ padding: '11px 20px', borderRadius: 11, fontSize: 13, fontWeight: 700, background: 'white', color: 'var(--navy)', border: '1.5px solid var(--border)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-phone" /> {tel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── 360° TUR TAB ── */}
          {activeTab === 'tur' && (() => {
            const tourInfo = extractTourSrc(tour360url);
            const panoInfo = extractTourSrc(photo360);
            const isEquiRect = panoInfo && !panoInfo.isEmbed && /\.(jpg|jpeg|png|webp)/i.test(panoInfo.src);
            const showPano   = panoInfo && !(tourInfo && tourInfo.src === panoInfo.src);

            // İçerik yok → boş durum kartı
            if (!tourInfo && !panoInfo) return (
              <div style={sc}>
                <div style={scHd}>
                  <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>360° Sanal Tur</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F3F4F6', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} /> Henüz Eklenmedi
                  </span>
                </div>
                <div style={{ ...scBody, textAlign: 'center', padding: '48px 24px' }}>
                  {/* İkon */}
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: '#F3F4F6', border: '1.5px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                    360° Fotoğraf Henüz Yüklenmedi
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 24px' }}>
                    Bu işletme için henüz 360° sanal tur veya panorama fotoğrafı eklenmemiş.
                    {claimed
                      ? ' Panel üzerinden Matterport, Google Street View veya herhangi bir 360° iframe kodunu ekleyebilirsiniz.'
                      : ' İşletme sahibi panel üzerinden 360° içerik ekleyebilir.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {claimed && (
                      <a href="/panel"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'var(--navy)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                        <i className="fa-solid fa-pen" /> Panel'den Ekle
                      </a>
                    )}
                    {!claimed && (
                      <a href={`/sahiplen?id=${id}&type=${entityType}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'var(--navy)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                        <i className="fa-solid fa-flag" /> İşletmeyi Sahiplen
                      </a>
                    )}
                    <a href="/360-fotograf"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'linear-gradient(135deg,#D4A843,#B8860B)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 12px rgba(212,168,67,.35)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      Profesyonel Çekim Al
                    </a>
                  </div>
                </div>
              </div>
            );
            return (
              <div style={sc}>
                <div style={scHd}>
                  <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>360° Sanal Tur</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                    <i className="fa-solid fa-vr-cardboard" style={{ fontSize: 11 }} /> Sanal Tur
                  </span>
                </div>
                <div style={scBody}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#EEF2FF', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#3730A3' }}>
                    <i className="fa-solid fa-circle-info" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>Fareyi veya parmağınızı kullanarak 360° görünümde gezinin. Tam ekran için sağ alttaki simgeye tıklayın.</span>
                  </div>
                  {tourInfo && (
                    <>
                      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: '#F3F4F6', aspectRatio: '16/9' }}>
                        <iframe src={tourInfo.src} title="360° Sanal Tur"
                          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                          allowFullScreen allow="xr-spatial-tracking; fullscreen" />
                      </div>
                      <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <a href={tourInfo.src} target="_blank" rel="noopener"
                          style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#1B3A69', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-arrow-up-right-from-square" /> Tam Ekran Aç
                        </a>
                        <div style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, background: '#F0F4FF', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fa-solid fa-vr-cardboard" style={{ color: '#4F46E5' }} /> VR gözlük ile görüntüleyebilirsiniz
                        </div>
                      </div>
                    </>
                  )}
                  {showPano && (
                    <div style={{ marginTop: tourInfo ? 20 : 0 }}>
                      {isEquiRect
                        ? <Panorama360 url={panoInfo!.src} name={name} />
                        : (
                          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: '#F3F4F6', aspectRatio: '16/9' }}>
                            <iframe src={panoInfo!.src} title="360° Fotoğraf"
                              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                              allowFullScreen allow="xr-spatial-tracking; fullscreen" />
                          </div>
                        )
                      }
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── VİDEO TAB ── */}
          {activeTab === 'video' && (() => {
            const videoSrc = extractVideoSrc(video_url);
            if (!videoSrc) return (
              <div style={sc}>
                <div style={scHd}>
                  <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Video</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F3F4F6', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} /> Henüz Eklenmedi
                  </span>
                </div>
                <div style={{ ...scBody, textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: '#F3F4F6', border: '1.5px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Video Henüz Eklenmedi</div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 24px' }}>
                    Bu işletme için henüz tanıtım videosu eklenmemiş.
                    {claimed
                      ? ' Panel üzerinden YouTube veya Vimeo video linkini ya da embed kodunu ekleyebilirsiniz.'
                      : ' İşletme sahibi panel üzerinden video ekleyebilir.'}
                  </p>
                  {claimed && (
                    <a href="/panel" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--navy)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                      <i className="fa-solid fa-pen" /> Panel'den Ekle
                    </a>
                  )}
                  {!claimed && (
                    <a href={`/sahiplen?id=${id}&type=${entityType}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--navy)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                      <i className="fa-solid fa-flag" /> İşletmeyi Sahiplen
                    </a>
                  )}
                </div>
              </div>
            );
            // Video embed URL var → oynatıcı göster
            const isYoutube = videoSrc.includes('youtube.com/embed') || videoSrc.includes('youtu.be');
            const isVimeo   = videoSrc.includes('vimeo.com');
            const platform  = isYoutube ? 'YouTube' : isVimeo ? 'Vimeo' : 'Video';
            return (
              <div style={sc}>
                <div style={scHd}>
                  <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Tanıtım Videosu</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#DC2626' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#DC2626"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    {platform}
                  </span>
                </div>
                <div style={scBody}>
                  {/* Video player — 16:9 aspect ratio */}
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: '#000', aspectRatio: '16/9', marginBottom: 16 }}>
                    <iframe
                      src={videoSrc}
                      title={`${name} — Tanıtım Videosu`}
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  {/* Alt buton satırı */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href={video_url!} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'var(--navy)', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-arrow-up-right-from-square" /> {platform}'da Aç
                    </a>
                    <div style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, background: '#F3F4F6', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      HD kalitede izleyebilirsiniz
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── YORUMLAR TAB ── */}
          {activeTab === 'yorumlar' && (
            <>
              {isOwner ? (
                /* Sahip — yorum formu yerine bilgilendirme bandı */
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1px solid #93C5FD', borderRadius: 14, marginBottom: 4 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A', margin: '0 0 2px' }}>Bu sizin profiliniz</p>
                    <p style={{ fontSize: 12, color: '#3B82F6', margin: 0 }}>İşletme sahipleri kendi profillerine yorum yapamaz.</p>
                  </div>
                  <a href={ownerEditUrl}
                    style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: '#1D4ED8', color: 'white', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Profili Düzenle
                  </a>
                </div>
              ) : (
                <YorumForm entityId={id} entityType={entityType} onSubmit={y => setYorumlar(prev => [y, ...prev])} />
              )}
              <div style={sc}>
                <div style={scHd}>
                  <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Yorumlar</h3>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{yorumlar.length} yorum</span>
                </div>
                <div style={scBody}>
                  {yorumlar.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
                      <i className="fa-regular fa-comment" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                      Henüz yorum yok. İlk yorumu siz yapın!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {yorumlar.map(r => (
                        <div key={r.id} style={{ background: '#F9FBFF', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{maskName(r.author)}</span>
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatVisitDate(r.date)}</span>
                          </div>
                          <Stars rat={r.rating} />
                          {r.text && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginTop: 6 }}>{r.text}</p>}
                          {r.reply_text && (
                            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', borderLeft: '3px solid #86EFAC', marginTop: 10 }}>
                              <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginBottom: 4 }}>İşletme Yanıtı</div>
                              <p style={{ fontSize: 13, color: '#15803D', margin: 0 }}>{r.reply_text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── RANDEVU TAB ── */}
          {activeTab === 'randevu' && (
            <div style={sc}>
              <div style={scHd}>
                <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700 }}>Online Randevu Takvimi</h3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(156,163,175,.15)', border: '1px solid rgba(156,163,175,.25)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />
                  Etkin Değil
                </span>
              </div>
              <div style={{ ...scBody, textAlign: 'center', padding: '40px 24px' }}>
                <i className="fa-regular fa-calendar-xmark" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Online Randevu Takvimi Henüz Aktif Değil</div>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
                  Bu işletme için online randevu sistemi henüz aktive edilmemiş. E-posta adresinizi bırakın, aktive edildiğinde sizi bilgilendirelim.
                </p>
                <button onClick={() => setRandevuModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#059669', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
                  <i className="fa-solid fa-calendar-plus" /> Bir randevu talep et
                </button>
                <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
                  <AboneWidget
                    tip="hasta"
                    entityId={id} entityType={entityType} entityName={name}
                    description="Randevu sistemi aktive edildiğinde veya yeni duyurularda haberdar edilmek için abone olun."
                  />
                </div>
              </div>
            </div>
          )}

        </div>{/* /sol */}

        {/* SAĞ SIDEBAR ────────────────────────────────────── */}
        <div>

          {/* İletişim */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '20px 22px', marginBottom: 20 }}>
            <h4 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>İletişim & Konum</h4>
            {tel && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, alignItems: 'center' }}>
                <i className="fa-solid fa-phone" style={{ width: 18, color: 'var(--navy)', fontSize: 13 }} />
                <a href={`tel:${tel.replace(/\s/g,'')}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>{tel}</a>
              </div>
            )}
            {adres && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, alignItems: 'flex-start' }}>
                <i className="fa-solid fa-location-dot" style={{ width: 18, color: 'var(--navy)', fontSize: 13, marginTop: 1 }} />
                <span>{adres}</span>
              </div>
            )}
            {maps_url && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, alignItems: 'center' }}>
                <i className="fa-brands fa-google" style={{ width: 18, color: 'var(--navy)', fontSize: 13 }} />
                <a href={maps_url} target="_blank" rel="noopener" style={{ color: 'var(--navy)', fontWeight: 600 }}>Google Maps'te Gör</a>
              </div>
            )}
            {website && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, alignItems: 'center' }}>
                <i className="fa-solid fa-globe" style={{ width: 18, color: 'var(--navy)', fontSize: 13 }} />
                <a href={website} target="_blank" rel="noopener" style={{ color: 'var(--navy)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{website.replace(/^https?:\/\//, '')}</a>
              </div>
            )}
            {(acik_24_saat || calisma_saatleri) && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, alignItems: 'flex-start' }}>
                <i className="fa-regular fa-clock" style={{ width: 18, color: 'var(--navy)', fontSize: 13, marginTop: 2 }} />
                <div>
                  {acik_24_saat
                    ? <span style={{ fontWeight: 700, color: '#065F46', background: '#ECFDF5', padding: '1px 8px', borderRadius: 8, border: '1px solid #A7F3D0', fontSize: 12 }}>24 Saat Açık</span>
                    : (() => {
                        try {
                          const sch = JSON.parse(calisma_saatleri || '{}') as Record<string,{acik:boolean;baslangic:string;bitis:string}>;
                          const GUNLER = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
                          const rows = GUNLER.map(g => sch[g] ? { g, ...sch[g] } : null).filter(Boolean) as {g:string;acik:boolean;baslangic:string;bitis:string}[];
                          if (!rows.length) return <span style={{ color: 'var(--muted)', fontSize: 12 }}>Belirtilmemiş</span>;
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {rows.map(r => (
                                <div key={r.g} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                                  <span style={{ width: 76, fontWeight: 600, color: r.acik ? 'var(--text)' : 'var(--muted)' }}>{r.g}</span>
                                  {r.acik
                                    ? <span style={{ color: 'var(--text)' }}>{r.baslangic} – {r.bitis}</span>
                                    : <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Kapalı</span>
                                  }
                                </div>
                              ))}
                            </div>
                          );
                        } catch {
                          return <span style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{calisma_saatleri}</span>;
                        }
                      })()
                  }
                </div>
              </div>
            )}
            {(instagram_url || facebook_url || linkedin_url) && (
              <div style={{ display: 'flex', gap: 8, paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                {instagram_url && (
                  <a href={instagram_url} target="_blank" rel="noopener"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white', textDecoration: 'none', fontSize: 15 }}
                    title="Instagram">
                    <i className="fa-brands fa-instagram" />
                  </a>
                )}
                {facebook_url && (
                  <a href={facebook_url} target="_blank" rel="noopener"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: '#1877F2', color: 'white', textDecoration: 'none', fontSize: 15 }}
                    title="Facebook">
                    <i className="fa-brands fa-facebook-f" />
                  </a>
                )}
                {linkedin_url && (
                  <a href={linkedin_url} target="_blank" rel="noopener"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: '#0A66C2', color: 'white', textDecoration: 'none', fontSize: 15 }}
                    title="LinkedIn">
                    <i className="fa-brands fa-linkedin-in" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Abone Widget — sidebar */}
          <div style={{ marginBottom: 20 }}>
            <AboneWidget
              tip="hasta"
              entityId={id} entityType={entityType} entityName={name}
            />
          </div>

          {/* Kurum bilgisi */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '20px 22px', marginBottom: 20 }}>
            <h4 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Kurum Bilgisi</h4>
            {[
              { icon: 'fa-tooth',     v: typeLabel },
              { icon: 'fa-city',      v: il },
              { icon: 'fa-map-pin',   v: ilce },
            ].filter(r => r.v).map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, alignItems: 'center' }}>
                <i className={`fa-solid ${r.icon}`} style={{ width: 18, color: 'var(--navy)', fontSize: 13 }} />
                <span>{r.v}</span>
              </div>
            ))}
          </div>

          {/* Sigorta sidebar kartı (sadece doktor) */}
          {entityType === 'doktor' && sigorta && sigorta.length > 0 && (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '20px 22px', marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Sigorta</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sigorta.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <i className="fa-solid fa-shield-check" style={{ color: '#059669', fontSize: 13 }} />
                    <span style={{ fontWeight: 600 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Randevu widget */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', position: 'sticky', top: 84 }}>
            <div style={{ background: '#2D2D2D', padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 2 }}>Online Randevu</h4>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>randevu sistemi</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.6)', flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />Etkin Değil
                </span>
              </div>
            </div>
            <div style={{ padding: '20px 22px' }}>
              {/* Tarih strip (dekoratif) */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--muted)', marginBottom: 8 }}>Tarih</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, opacity: .4, pointerEvents: 'none' }}>
                {Array.from({ length: 5 }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() + i);
                  const days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
                  return (
                    <div key={i} style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>{days[d.getDay()]}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center', padding: '14px 8px 8px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
                <i className="fa-regular fa-calendar-xmark" style={{ fontSize: 24, color: '#D1D5DB', display: 'block', marginBottom: 8 }} />
                Bu işletme için online randevu takvimi henüz aktive edilmemiş.
              </div>
              <button onClick={() => setRandevuModal(true)}
                style={{ width: '100%', padding: 13, background: '#059669', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                <i className="fa-solid fa-calendar-plus" /> Randevu Talep Et
              </button>
            </div>
          </div>

        </div>{/* /sidebar */}
      </div>

      {/* Randevu modal */}
      <RandevuModal name={name} open={randevuModal} onClose={() => setRandevuModal(false)} />

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (() => {
        const galleryPhotos = (photos || []).filter(Boolean) as string[];
        const total = galleryPhotos.length;
        const prev = () => setLightboxIdx(i => i !== null ? (i - 1 + total) % total : null);
        const next = () => setLightboxIdx(i => i !== null ? (i + 1) % total : null);
        return (
          <div
            onClick={() => setLightboxIdx(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Kapat */}
            <button onClick={() => setLightboxIdx(null)}
              style={{ position: 'absolute', top: 18, right: 20, background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: '50%', width: 42, height: 42, color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              ✕
            </button>
            {/* Önceki */}
            {total > 1 && (
              <button onClick={e => { e.stopPropagation(); prev(); }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: '50%', width: 46, height: 46, color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ‹
              </button>
            )}
            {/* Sonraki */}
            {total > 1 && (
              <button onClick={e => { e.stopPropagation(); next(); }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: '50%', width: 46, height: 46, color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ›
              </button>
            )}
            {/* Fotoğraf */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryPhotos[lightboxIdx]}
              alt={`${name} - ${lightboxIdx + 1}`}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 8px 48px rgba(0,0,0,.6)', userSelect: 'none' }}
            />
            {/* Sayaç */}
            {total > 1 && (
              <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.65)', fontSize: 13, fontWeight: 600 }}>
                {lightboxIdx + 1} / {total}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
