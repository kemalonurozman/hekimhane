'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';
import { SPEC_GRUPLARI } from '@/lib/uzmanlik-data';
import { HERO_BACKGROUNDS, coverPresetKey } from '@/lib/hero-backgrounds';
import { IL_LISTE, ILCELER } from '@/lib/tr-il-ilce';
import MakalelerimTab from './MakalelerimTab';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

/* ═══════════════════════════════════════════════
   SVG İkonlar (emoji yok, inline SVG)
═══════════════════════════════════════════════ */
function Ic({ d, size = 18, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const icons = {
  dashboard:  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  profile:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11A4 4 0 1 0 12 3a4 4 0 0 0 0 8z',
  building:   'M6 2h12a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2z M9 22V12h6v10 M9 6h1 M14 6h1 M9 10h1 M14 10h1',
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  clock:      'M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M12 6v6l4 2',
  check:      'M20 6 9 17l-5-5',
  plus:       'M12 5v14 M5 12h14',
  logout:     'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  eye:        'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9A3 3 0 1 0 12 15a3 3 0 0 0 0-6z',
  edit:       'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  shield:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  bell:       'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  mail:       'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  phone:      'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  map:        'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7A3 3 0 1 0 12 13a3 3 0 0 0 0-6z',
  trend:      'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  list:       'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01',
  info:       'M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M12 8h.01 M12 12v4',
  link:       'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  code:       'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  users:      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11A4 4 0 1 0 9 3a4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  calendar:   'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
};

// Görsel dosyayı tarayıcıda JPEG'e çevirir + küçültür (HEIC/PNG/BMP/TIFF… → JPEG).
// PDF ve SVG olduğu gibi döner; çözülemeyen türlerde orijinal gönderilir (sunucu kabul eder).
async function dosyayiHazirla(file: File): Promise<File> {
  if (file.type === 'application/pdf' || file.type === 'image/svg+xml') return file;
  if (file.type === 'image/jpeg' && file.size < 1.2 * 1024 * 1024) return file;   // zaten küçük JPEG
  try {
    const bitmap = await createImageBitmap(file);
    const maxW = 1600;
    const scale = Math.min(1, maxW / bitmap.width);
    const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d'); if (!ctx) { (bitmap as any).close?.(); return file; }
    ctx.drawImage(bitmap, 0, 0, w, h); (bitmap as any).close?.();
    const blob: Blob | null = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch { return file; }   // HEIC (Chrome) vb. çözülemedi → orijinali gönder
}

const T = {
  navy:   '#1B3A69',
  navy2:  '#0F2A55',
  gold:   '#D4A843',
  bg:     '#F0F4FF',
  white:  '#FFFFFF',
  border: '#E2E8F4',
  muted:  '#6B7A99',
  text:   '#1A2744',
  green:  '#059669',
  amber:  '#F59E0B',
  red:    '#EF4444',
};

interface ClaimRequest {
  id: string;
  entity_type: string;
  entity_name: string;
  entity_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  ad_soyad: string;
  email: string;
  tel: string;
  unvan: string | null;
  mesaj: string | null;
}

function Badge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending:  { label: 'İncelemede', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    approved: { label: 'Onaylandı',  bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
    rejected: { label: 'Reddedildi', bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function EntityTypeLabel({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    klinik:  { label: 'Diş Kliniği', color: '#0891B2' },
    hastane: { label: 'Hastane',     color: '#7C3AED' },
    doktor:  { label: 'Doktor',      color: '#059669' },
    eczane:  { label: 'Eczane',      color: '#EA580C' },
  };
  const s = map[type] || { label: type, color: T.muted };
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>;
}

function StatCard({ label, value, iconKey, color }: { label: string; value: string | number; iconKey: string; color: string }) {
  return (
    <div style={{ background: T.white, borderRadius: 16, padding: '18px 20px', border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.06 }} />
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>
        <Ic d={icons[iconKey as keyof typeof icons] ?? icons.dashboard} size={18} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   URL yardımcısı (Türkçe → slug)
═══════════════════════════════════════════════ */
function tr(s: string) {
  return (s || '').toLowerCase()
    .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
    .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c')
    .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
}

async function resolveProfileUrl(supabase: any, entityType: string, entityId: string): Promise<string | null> {
  try {
    if (entityType === 'klinik') {
      const { data } = await supabase.from('klinikler').select('il,ilce,slug').eq('id', entityId).single();
      if (data?.slug) return `/klinikler/${tr(data.il||'turkiye')}/${tr(data.ilce||'merkez')}/${data.slug}`;
    } else if (entityType === 'hastane') {
      const { data } = await supabase.from('hastaneler').select('il,ilce,slug').eq('id', entityId).single();
      if (data?.slug) return `/hastaneler/${tr(data.il||'turkiye')}/${tr(data.ilce||'merkez')}/${data.slug}`;
    } else if (entityType === 'doktor') {
      const { data } = await supabase.from('doktorlar').select('slug').eq('id', entityId).single();
      if (data?.slug) return `/doktorlar/${data.slug}`;
    } else if (entityType === 'eczane') {
      const { data } = await supabase.from('eczaneler').select('slug').eq('id', entityId).single();
      if (data?.slug) return `/eczaneler/${data.slug}`;
    }
  } catch {}
  return null;
}

/* ═══════════════════════════════════════════════
   ANA PANEL
═══════════════════════════════════════════════ */
export default function PanelPage() {
  const router = useRouter();
  const [user,   setUser]   = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,    setTab]    = useState<'dashboard' | 'claims' | 'profile' | 'new' | 'edit' | 'yorumlar' | 'hekimkart' | 'randevu' | 'randevumodul' | 'hastalar' | 'makaleler'>('dashboard');
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [profileUrls, setProfileUrls] = useState<Record<string, string>>({});
  const [premiumMap, setPremiumMap] = useState<Record<string, boolean>>({});
  const [premiumMsg, setPremiumMsg] = useState<'success' | 'cancel' | null>(null);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [selectedEditClaim, setSelectedEditClaim] = useState<ClaimRequest | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sbLight, setSbLight] = useState(false);   // sidebar teması: false=gece, true=açık

  useEffect(() => { try { setSbLight(localStorage.getItem('hk_panel_theme') === 'light'); } catch {} }, []);
  const toggleTheme = () => setSbLight(v => { const n = !v; try { localStorage.setItem('hk_panel_theme', n ? 'light' : 'dark'); } catch {} return n; });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/giris?redirect=/panel'); return; }
      // Admin ise admin paneline yönlendir
      if (session.user.email === ADMIN_EMAIL) { router.replace('/admin'); return; }
      setUser(session.user);
      setLoading(false);
      loadClaims(session.user.email || '');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) router.replace('/giris?redirect=/panel');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadClaims(email: string) {
    if (!email) return;
    setClaimsLoading(true);
    const supabase = createSupabaseBrowser();
    // Talepler service-role API üzerinden okunur (claim_requests RLS'ine takılmadan)
    let list: ClaimRequest[] = [];
    try {
      const res = await fetch('/api/panel/my-claims', { cache: 'no-store' });
      if (res.ok) { const d = await res.json(); list = d.claims || []; }
    } catch { /* boş liste */ }
    setClaims(list);
    setClaimsLoading(false);

    // Onaylı işletmelerin gerçek profil URL'lerini çek
    const approved = list.filter(c => c.status === 'approved' && c.entity_id && c.entity_id !== 'new');
    const urls: Record<string, string> = {};
    await Promise.all(approved.map(async c => {
      const url = await resolveProfileUrl(supabase, c.entity_type, c.entity_id!);
      if (url) urls[c.id] = url;
    }));
    setProfileUrls(urls);

    // Premium durumlarını çek (rozet / yükseltme butonu için)
    const TBL: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
    const pmap: Record<string, boolean> = {};
    await Promise.all(approved.map(async c => {
      const t = TBL[c.entity_type]; if (!t || !c.entity_id) return;
      try {
        const { data } = await supabase.from(t).select('premium').eq('id', c.entity_id).maybeSingle();
        pmap[c.id] = !!(data as any)?.premium;
      } catch { /* geç */ }
    }));
    setPremiumMap(pmap);
  }

  async function handleUpgrade(claimId: string, entity_type: string, entity_id: string) {
    setUpgradingId(claimId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type, entity_id }),
      });
      const j = await res.json();
      if (j.url) { window.location.href = j.url; return; }
      alert(j.error || 'Ödeme başlatılamadı.');
    } catch { alert('Ödeme başlatılamadı.'); }
    setUpgradingId(null);
  }

  async function handleRelease(claimId: string, entityName: string) {
    if (!window.confirm(`"${entityName}" işletmesinin sahipliğini bırakmak istediğinize emin misiniz?\n\nSahiplik kalkacak, işletme "sahiplenilmemiş" duruma dönecek ve premium/online randevu kapanacaktır. Dilerseniz daha sonra yeniden sahiplenebilirsiniz.`)) return;
    setReleasingId(claimId);
    try {
      const res = await fetch('/api/panel/release-claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      });
      const j = await res.json();
      if (res.ok && j.success) {
        await loadClaims(user?.email || '');
      } else {
        alert(j.error || 'Sahiplik bırakılamadı.');
      }
    } catch { alert('Sahiplik bırakılamadı.'); }
    setReleasingId(null);
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace('/giris');
  }

  // Stripe checkout dönüşü: ?premium=success | cancel
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('premium');
      if (p === 'success' || p === 'cancel') {
        setPremiumMsg(p);
        window.history.replaceState(null, '', '/panel');
        if (p === 'success') setTimeout(() => setPremiumMsg(null), 8000);
      }
    } catch { /* noop */ }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div style={{ textAlign: 'center', color: T.muted }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ animation: 'spin .9s linear infinite', display: 'block', margin: '0 auto 12px' }}>
            <circle cx="16" cy="16" r="13" stroke="#E5E7EB" strokeWidth="3"/>
            <path d="M16 3a13 13 0 0 1 13 13" stroke={T.navy} strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Yükleniyor...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }


  const approvedClaims = claims.filter(c => c.status === 'approved');
  const pendingClaims  = claims.filter(c => c.status === 'pending');

  const navItems = [
    { key: 'dashboard'  as const, label: 'Genel Bakış',       icon: 'dashboard' },
    { key: 'claims'     as const, label: 'Başvurularım',      icon: 'list' },
    { key: 'randevu'    as const, label: 'Randevu Talepleri', icon: 'bell' },
    { key: 'hastalar'   as const, label: 'Hastalarım',        icon: 'users' },
    { key: 'randevumodul' as const, label: 'Randevu Takvimi',  icon: 'calendar' },
    { key: 'edit'       as const, label: 'Profilimi Düzenle', icon: 'edit' },
    { key: 'hekimkart'  as const, label: 'HekimKart',         icon: 'bell' },
    { key: 'yorumlar'   as const, label: 'Yorumlar',          icon: 'star' },
    { key: 'makaleler'  as const, label: 'Makalelerim',       icon: 'edit' },
    { key: 'profile'    as const, label: 'Hesabım',           icon: 'profile' },
    { key: 'new'        as const, label: 'Yeni Başvuru',      icon: 'plus' },
  ];

  // Sidebar sekmeleri gruplandı (bölüm başlıklarıyla)
  const navGroups: { title: string; keys: (typeof navItems)[number]['key'][] }[] = [
    { title: 'Genel',     keys: ['dashboard'] },
    { title: 'İşletmem',  keys: ['edit', 'hekimkart', 'yorumlar'] },
    { title: 'Randevu & Hasta', keys: ['randevu', 'randevumodul', 'hastalar'] },
    { title: 'İçerik',    keys: ['makaleler'] },
    { title: 'Başvuru',   keys: ['claims', 'new'] },
    { title: 'Hesap',     keys: ['profile'] },
  ];

  // Sidebar teması — gece (varsayılan) veya açık
  const S = sbLight ? {
    bg: 'linear-gradient(180deg,#FFFFFF 0%,#F4F6F9 100%)', divider: '#EAECEF',
    brand: '#1D1D1F', portal: '#9AA0A6',
    userName: '#1D1D1F', userMail: '#9AA0A6', avatarBg: '#EEF1F5', avatarText: T.navy, avatarBorder: '#E5E5EA',
    section: '#9AA0A6', itemText: '#4B5563', itemActiveBg: 'rgba(27,58,105,.09)', itemActiveText: T.navy,
    iconIdle: '#A2A8B0', iconActive: T.navy, hover: 'rgba(0,0,0,.04)', logout: '#9AA0A6',
    borderRight: '1px solid #EAECEF',
  } : {
    bg: `linear-gradient(180deg, ${T.navy2} 0%, ${T.navy} 100%)`, divider: 'rgba(255,255,255,.08)',
    brand: 'white', portal: 'rgba(255,255,255,.35)',
    userName: 'white', userMail: 'rgba(255,255,255,.4)', avatarBg: 'rgba(255,255,255,.15)', avatarText: 'white', avatarBorder: 'rgba(255,255,255,.2)',
    section: 'rgba(255,255,255,.32)', itemText: 'rgba(255,255,255,.6)', itemActiveBg: 'rgba(212,168,67,.16)', itemActiveText: 'white',
    iconIdle: 'rgba(255,255,255,.55)', iconActive: T.gold, hover: 'rgba(255,255,255,.05)', logout: 'rgba(255,255,255,.4)',
    borderRight: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* ── MOBİL ÜST BAR ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, height: 48, zIndex: 150,
          background: T.navy, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px'
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>İşletme Portalı</span>
          <button onClick={() => setMobileMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      )}

      {/* ── MOBİL BACKDROP ── */}
      {isMobile && mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 190 }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{ position: 'fixed', top: isMobile ? 112 : 64, left: 0, bottom: 0, width: 240, background: S.bg, borderRight: isMobile ? 'none' : S.borderRight, display: isMobile ? (mobileMenuOpen ? 'flex' : 'none') : 'flex', flexDirection: 'column', zIndex: isMobile ? 200 : 100 }}>
        <div style={{ padding: '24px 22px 20px', borderBottom: `1px solid ${S.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: T.navy, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 14, color: 'white' }}>H</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: S.brand, letterSpacing: '-0.3px' }}>Hekimhane</span>
          </div>
          <div style={{ fontSize: 11, color: S.portal, fontWeight: 500 }}>İşletme Portalı</div>
        </div>

        <div style={{ padding: '14px 22px 12px', borderBottom: `1px solid ${S.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${S.avatarBorder}` }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: S.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.avatarText }}>
                <Ic d={icons.profile} size={16} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.userName, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Kullanıcı'}
              </div>
              <div style={{ fontSize: 11, color: S.userMail, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 12px 16px', overflowY: 'auto' }}>
          {navGroups.map((g, gi) => (
            <div key={g.title} style={{ marginBottom: gi < navGroups.length - 1 ? 12 : 0 }}>
              <div style={{ padding: '10px 12px 6px', fontSize: 10, fontWeight: 700, color: S.section, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{g.title}</div>
              {g.keys.map(k => {
                const item = navItems.find(n => n.key === k)!;
                const active = tab === item.key;
                return (
                  <button key={item.key} onClick={() => { setTab(item.key); setMobileMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 11px', marginBottom: 1, borderRadius: 9, background: active ? S.itemActiveBg : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: active ? S.itemActiveText : S.itemText, fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'inherit', transition: 'background .12s, color .12s' }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = S.hover; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                    <span style={{ flexShrink: 0, color: active ? S.iconActive : S.iconIdle, display: 'flex' }}><Ic d={icons[item.icon as keyof typeof icons]} size={16} /></span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    {item.key === 'claims' && pendingClaims.length > 0 && (
                      <span style={{ flexShrink: 0, background: T.amber, color: 'white', borderRadius: 20, minWidth: 18, height: 18, padding: '0 6px', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{pendingClaims.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${S.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: S.logout, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0, transition: 'color .15s' }}>
            <Ic d={icons.logout} size={14} /> Çıkış Yap
          </button>
          <button onClick={toggleTheme} title={sbLight ? 'Gece moduna geç' : 'Açık moda geç'}
            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${S.divider}`, background: 'transparent', cursor: 'pointer', color: S.itemText, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {sbLight
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: isMobile ? 0 : 240, flex: 1, minWidth: 0, padding: isMobile ? '124px 16px 80px' : '96px 36px 32px', background: T.bg, minHeight: '100vh' }}>
        {premiumMsg && (
          <div style={{ marginBottom: 18, padding: '14px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
            background: premiumMsg === 'success' ? '#F0FDF4' : '#FFF7ED',
            border: `1px solid ${premiumMsg === 'success' ? '#86EFAC' : '#FED7AA'}`,
            color: premiumMsg === 'success' ? '#166534' : '#9A3412', fontSize: 13.5, fontWeight: 600 }}>
            {premiumMsg === 'success'
              ? '👑 Ödemeniz alındı! Premium üyeliğiniz birkaç saniye içinde aktifleşir (aktifleşmezse sayfayı yenileyin).'
              : 'Ödeme iptal edildi. Dilediğinizde tekrar deneyebilirsiniz.'}
            <button onClick={() => setPremiumMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', fontFamily: 'inherit' }}>×</button>
          </div>
        )}
        {tab === 'dashboard' && <DashboardTab user={user} claims={claims} approvedClaims={approvedClaims} pendingClaims={pendingClaims} claimsLoading={claimsLoading} onTabChange={setTab} profileUrls={profileUrls} onEditClaim={(c) => { setSelectedEditClaim(c); setTab('edit'); }} premiumMap={premiumMap} onUpgrade={handleUpgrade} upgradingId={upgradingId} onRelease={handleRelease} releasingId={releasingId} />}
        {tab === 'claims'    && <ClaimsTab claims={claims} loading={claimsLoading} onNewClaim={() => setTab('new')} profileUrls={profileUrls} onDeleted={() => loadClaims(user?.email || '')} />}
        {tab === 'profile'   && <ProfileTab user={user} />}
        {tab === 'new'       && <NewClaimTab user={user} onSuccess={() => { loadClaims(user?.email || ''); setTab('claims'); }} />}
        {tab === 'edit'      && <EditProfileTab approvedClaims={approvedClaims} selectedClaim={selectedEditClaim} onSelectClaim={setSelectedEditClaim} isMobile={isMobile} />}
        {tab === 'hekimkart' && <HekimKartTab approvedClaims={approvedClaims} profileUrls={profileUrls} user={user} />}
        {tab === 'yorumlar'  && <YorumlarTab approvedClaims={approvedClaims} />}
        {tab === 'randevu'   && <RandevuTalepleriTab approvedClaims={approvedClaims} />}
        {tab === 'randevumodul' && <RandevuModulTab approvedClaims={approvedClaims} />}
        {tab === 'hastalar'  && <HastalarTab approvedClaims={approvedClaims} />}
        {tab === 'makaleler' && <MakalelerimTab hasEntity={approvedClaims.some(c => c.entity_id && c.entity_id !== 'new')} />}
      </main>

      {/* ── MOBİL ALT NAVİGASYON ── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, zIndex: 150,
          background: 'white', borderTop: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'stretch'
        }}>
          {navItems.filter(n => ['dashboard','randevu','edit','yorumlar','profile'].includes(n.key)).map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setMobileMenuOpen(false); }}
              style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, fontFamily: 'inherit',
                color: tab === item.key ? T.navy : T.muted,
                borderTop: tab === item.key ? `2px solid ${T.navy}` : '2px solid transparent',
              }}>
              <Ic d={icons[item.icon as keyof typeof icons]} size={18} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.3 }}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (max-width: 767px) {
          .panel-grid-2 { flex-direction: column !important; }
          .panel-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .panel-2col { grid-template-columns: 1fr !important; }
          .panel-form-grid { grid-template-columns: 1fr !important; }
          .panel-approved-row { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function DashboardTab({ user, claims, approvedClaims, pendingClaims, claimsLoading, onTabChange, profileUrls, onEditClaim, premiumMap, onUpgrade, upgradingId, onRelease, releasingId }: { user: User | null; claims: ClaimRequest[]; approvedClaims: ClaimRequest[]; pendingClaims: ClaimRequest[]; claimsLoading: boolean; onTabChange: (t: any) => void; profileUrls: Record<string, string>; onEditClaim: (c: ClaimRequest) => void; premiumMap: Record<string, boolean>; onUpgrade: (claimId: string, entityType: string, entityId: string) => void; upgradingId: string | null; onRelease: (claimId: string, entityName: string) => void; releasingId: string | null }) {
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Kullanıcı';
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Hoş Geldiniz, {name.split(' ')[0]}</h1>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>İşletme başvurularınızı ve hesap durumunuzu buradan takip edebilirsiniz.</p>
      </div>

      <div className="panel-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Toplam Başvuru"   value={claimsLoading ? '—' : claims.length}         iconKey="list"     color={T.navy} />
        <StatCard label="Onaylı İşletme"  value={claimsLoading ? '—' : approvedClaims.length} iconKey="check"    color={T.green} />
        <StatCard label="İncelemede"       value={claimsLoading ? '—' : pendingClaims.length}  iconKey="clock"    color={T.amber} />
        <StatCard label="Hesap Durumu"     value="Aktif"                                        iconKey="shield"   color="#7C3AED" />
      </div>

      {approvedClaims.length > 0 && (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '14px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: T.green }}><Ic d={icons.check} size={16} /></span>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Onaylı İşletmeleriniz</span>
          </div>
          <div style={{ padding: '16px 22px' }}>
            {approvedClaims.map(c => (
              <div key={c.id} className="panel-approved-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', background: '#F0FDF4', borderRadius: 12, marginBottom: 10, border: '1px solid #86EFAC' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 3 }}>{c.entity_name}</div>
                  <EntityTypeLabel type={c.entity_type} />
                </div>
                <div className="panel-approved-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Badge status="approved" />
                  {profileUrls[c.id] && (
                    <a href={profileUrls[c.id]} target="_blank" rel="noopener"
                      style={{ padding: '7px 14px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                      title="Profilinizin ziyaretçilere nasıl göründüğünü yeni sekmede görün">
                      <Ic d={icons.eye} size={13} />
                      Ziyaretçi Görünümü
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                  {c.entity_id && c.entity_id !== 'new' && (
                    <button onClick={() => onEditClaim(c)}
                      style={{ padding: '7px 14px', background: T.gold, color: 'white', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                      <Ic d={icons.edit} size={13} /> Düzenle
                    </button>
                  )}
                  {c.entity_id && c.entity_id !== 'new' && !premiumMap[c.id] && (
                    <button onClick={() => onUpgrade(c.id, c.entity_type, c.entity_id!)} disabled={upgradingId === c.id}
                      style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#1B3A69,#0F2A55)', color: 'white', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', cursor: upgradingId === c.id ? 'default' : 'pointer', opacity: upgradingId === c.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                      {upgradingId === c.id ? '…' : <>👑 Premium&apos;a Yükselt</>}
                    </button>
                  )}
                  {c.entity_id && c.entity_id !== 'new' && (
                    <button onClick={() => onRelease(c.id, c.entity_name || 'İşletme')} disabled={releasingId === c.id}
                      title="Bu işletmenin sahipliğini bırak — profil sahiplenilmemiş duruma döner"
                      style={{ padding: '7px 14px', background: 'transparent', color: '#B91C1C', borderRadius: 9, fontSize: 12, fontWeight: 700, border: '1px solid #FCA5A5', cursor: releasingId === c.id ? 'default' : 'pointer', opacity: releasingId === c.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                      {releasingId === c.id ? '…' : <><Ic d={icons.logout} size={13} /> Sahipliği Bırak</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingClaims.length > 0 && (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '14px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: T.amber }}><Ic d={icons.clock} size={16} /></span>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>İncelemede Olan Başvurular</span>
          </div>
          <div style={{ padding: '16px 22px' }}>
            {pendingClaims.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#FFFBEB', borderRadius: 12, marginBottom: 10, border: '1px solid #FDE68A' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 3 }}>{c.entity_name || 'Yeni İşletme Başvurusu'}</div>
                  <EntityTypeLabel type={c.entity_type} />
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <Badge status="pending" />
              </div>
            ))}
          </div>
        </div>
      )}

      {claimsLoading && (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: '52px 32px', textAlign: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ animation: 'spin .9s linear infinite', display: 'block', margin: '0 auto 14px' }}>
            <circle cx="16" cy="16" r="13" stroke="#E5E7EB" strokeWidth="3"/>
            <path d="M16 3a13 13 0 0 1 13 13" stroke={T.navy} strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>İşletmeleriniz yükleniyor...</p>
        </div>
      )}

      {!claimsLoading && claims.length === 0 && (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: '52px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: T.navy }}>
            <Ic d={icons.building} size={28} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>Henüz başvurunuz yok</h2>
          <p style={{ fontSize: 13, color: T.muted, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.7 }}>
            İşletmenizi Hekimhane'ye ekleyin veya mevcut profilinizin sahipliğini talep edin.
          </p>
          <button onClick={() => onTabChange('new')} style={{ padding: '13px 28px', background: T.navy, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Ic d={icons.plus} size={15} /> Başvuru Oluştur
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BAŞVURULARIM
═══════════════════════════════════════════════ */
function ClaimsTab({ claims, loading, onNewClaim, profileUrls, onDeleted }: { claims: ClaimRequest[]; loading: boolean; onNewClaim: () => void; profileUrls: Record<string, string>; onDeleted: () => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(c: ClaimRequest) {
    const onay = c.status === 'approved'
      ? `"${c.entity_name}" için ONAYLI sahipliğinizi kaldırıp başvuruyu silmek istediğinize emin misiniz? İşletme yeniden sahiplenilebilir hale gelir.`
      : `"${c.entity_name || 'Bu başvuru'}" başvurunuzu iptal edip silmek istediğinize emin misiniz?`;
    if (!window.confirm(onay)) return;
    setDeletingId(c.id);
    try {
      const res = await fetch('/api/panel/delete-claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: c.id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) { alert(j.error || 'Başvuru silinemedi.'); setDeletingId(null); return; }
      onDeleted();
    } catch {
      alert('Bağlantı hatası, tekrar deneyin.');
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.4px' }}>Başvurularım</h1>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>Tüm işletme başvurularınızı buradan takip edebilirsiniz.</p>
        </div>
        <button onClick={onNewClaim} style={{ padding: '10px 20px', background: T.navy, color: 'white', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Ic d={icons.plus} size={14} /> Yeni Başvuru
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: T.muted, fontSize: 14 }}>Yükleniyor...</div>
      ) : claims.length === 0 ? (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: '48px', textAlign: 'center', color: T.muted }}>
          <p style={{ fontWeight: 600 }}>Henüz başvurunuz bulunmuyor.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {claims.map(c => (
            <div key={c.id} style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.border}`, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: c.entity_type === 'klinik' ? '#E0F2FE' : c.entity_type === 'hastane' ? '#EDE9FE' : c.entity_type === 'eczane' ? '#FFF7ED' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.entity_type === 'klinik' ? '#0891B2' : c.entity_type === 'hastane' ? '#7C3AED' : c.entity_type === 'eczane' ? '#EA580C' : '#059669' }}>
                <Ic d={icons.building} size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{c.entity_name || 'Yeni İşletme Başvurusu'}</span>
                  <EntityTypeLabel type={c.entity_type} />
                </div>
                <div style={{ fontSize: 11, color: T.muted }}>
                  {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {c.mesaj && (
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 8, background: T.bg, borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>{c.mesaj}</div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge status={c.status} />
                {c.status === 'approved' && profileUrls[c.id] && (
                  <a href={profileUrls[c.id]} target="_blank" rel="noopener"
                    style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ic d={icons.eye} size={12} /> Ziyaretçi Görünümü
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
                <button onClick={() => handleDelete(c)} disabled={deletingId === c.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: deletingId === c.id ? 'default' : 'pointer', color: T.red, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0, opacity: deletingId === c.id ? 0.6 : 1 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  {deletingId === c.id ? 'Siliniyor…' : (c.status === 'approved' ? 'Sahipliği Kaldır' : 'İptal Et & Sil')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginTop: 20, display: 'flex', gap: 10 }}>
        <span style={{ color: '#2563EB', flexShrink: 0, marginTop: 1 }}><Ic d={icons.info} size={16} /></span>
        <p style={{ fontSize: 12, color: '#1D4ED8', lineHeight: 1.7, margin: 0 }}>
          <strong>İncelemede:</strong> Başvurunuz ekibimiz tarafından inceleniyor. Genellikle 1–2 iş günü içinde sonuçlanır ve e-posta ile bilgilendirilirsiniz.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HESABIM
═══════════════════════════════════════════════ */
function ProfileTab({ user }: { user: User | null }) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.4px' }}>Hesabım</h1>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>Hesap bilgilerinizi görüntüleyin.</p>
      </div>

      <div className="panel-2col" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: '28px', textAlign: 'center' }}>
          {meta.avatar_url ? (
            <img src={meta.avatar_url} alt="" style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${T.border}`, margin: '0 auto 14px', display: 'block' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: T.navy }}>
              <Ic d={icons.profile} size={32} />
            </div>
          )}
          <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{meta.full_name || meta.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{user.email}</div>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', border: '1px solid #86EFAC', fontSize: 11, fontWeight: 700, color: '#166534' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
            Aktif Hesap
          </div>
        </div>

        <div>
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 22px', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Hesap Bilgileri</span>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Ad Soyad',   value: meta.full_name || meta.name || '—', icon: 'profile' },
                { label: 'E-posta',    value: user.email || '—',                  icon: 'mail' },
                { label: 'Üye Olundu', value: new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), icon: 'clock' },
                { label: 'Son Giriş',  value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—', icon: 'shield' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.bg}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.navy, flexShrink: 0 }}>
                    <Ic d={icons[row.icon as keyof typeof icons]} size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{row.label}</div>
                    <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginTop: 1 }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 10 }}>
            <span style={{ color: T.amber, flexShrink: 0, marginTop: 1 }}><Ic d={icons.info} size={16} /></span>
            <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.7, margin: 0 }}>
              Profil bilgilerinizi güncellemek için lütfen <strong>info@hekimhane.com.tr</strong> adresine e-posta gönderin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   YENİ BAŞVURU
═══════════════════════════════════════════════ */
interface SuggEntity { id: string; name: string; il: string | null; ilce: string | null; claimed: boolean; }

function NewClaimTab({ user, onSuccess }: { user: User | null; onSuccess: () => void }) {
  const router = useRouter();
  const [step,    setStep]    = useState<'type' | 'form' | 'done'>('type');
  const [typeVal, setTypeVal] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');

  /* ── Autocomplete state ── */
  const [suggestions,    setSuggestions]    = useState<SuggEntity[]>([]);
  const [showSugg,       setShowSugg]       = useState(false);
  const [searching,      setSearching]      = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<SuggEntity | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggRef     = useRef<HTMLDivElement>(null);

  const meta = user?.user_metadata || {};
  const [form, setForm] = useState({
    isletme_adi: '', ad_soyad: meta.full_name || meta.name || '', tel: '',
    email: user?.email || '', unvan: '', il: '', ilce: '', adres: '', mesaj: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  /* ── İşletme ismi yazıldığında arama ── */
  async function searchEntities(q: string) {
    if (q.trim().length < 2) { setSuggestions([]); setShowSugg(false); return; }
    setSearching(true);
    const supabase = createSupabaseBrowser();
    const TABLE_MAP: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
    const table = TABLE_MAP[typeVal];
    if (!table) { setSearching(false); return; }

    let results: SuggEntity[] = [];
    if (typeVal === 'doktor') {
      const { data } = await (supabase as any).from('doktorlar')
        .select('id, ad, soyad, il, ilce, verified')
        .or(`ad.ilike.%${q}%,soyad.ilike.%${q}%`)
        .limit(8);
      results = (data || []).map((d: any) => ({
        id: d.id, name: `${d.ad || ''} ${d.soyad || ''}`.trim(),
        il: d.il, ilce: d.ilce, claimed: !!d.verified,
      }));
    } else {
      const { data } = await (supabase as any).from(table)
        .select('id, name, il, ilce, claimed')
        .ilike('name', `%${q}%`)
        .limit(8);
      results = (data || []).map((d: any) => ({
        id: d.id, name: d.name, il: d.il, ilce: d.ilce, claimed: !!d.claimed,
      }));
    }
    setSuggestions(results);
    setShowSugg(results.length > 0);
    setSearching(false);
  }

  function handleNameChange(val: string) {
    setForm(f => ({ ...f, isletme_adi: val }));
    setSelectedEntity(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchEntities(val), 300);
  }

  /* Dışarı tıklayınca kapat */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggRef.current && !suggRef.current.contains(e.target as Node)) setShowSugg(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const TYPES = [
    { key: 'klinik',  label: 'Diş Kliniği', desc: 'Muayenehane, klinik, poliklinik',        color: '#0891B2', bg: '#E0F2FE' },
    { key: 'hastane', label: 'Hastane',      desc: 'Özel, devlet veya üniversite hastanesi', color: '#7C3AED', bg: '#EDE9FE' },
    { key: 'doktor',  label: 'Doktor',       desc: 'Uzman hekim veya aile hekimi profili',   color: '#059669', bg: '#ECFDF5' },
    { key: 'eczane',  label: 'Eczane',       desc: 'Serbest ya da nöbetçi eczane',           color: '#EA580C', bg: '#FFF7ED' },
  ];

  const ILLER = ['Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul','İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale','Kırklareli','Kırşehir','Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Şanlıurfa','Şırnak','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak'];

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.isletme_adi.trim()) e.isletme_adi = 'İşletme adı zorunludur';
    if (!form.ad_soyad.trim())   e.ad_soyad    = 'Ad soyad zorunludur';
    if (!form.tel.trim())        e.tel         = 'Telefon zorunludur';
    if (!form.email.trim())      e.email       = 'E-posta zorunludur';
    if (!form.il.trim())         e.il          = 'Şehir zorunludur';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    /* Ortak validasyon — her iki durumda da ad soyad + tel zorunlu */
    const e: Partial<typeof form> = {};
    if (!form.ad_soyad.trim()) e.ad_soyad = 'Ad soyad zorunludur';
    if (!form.tel.trim())      e.tel      = 'Telefon zorunludur';
    if (!form.email.trim())    e.email    = 'E-posta zorunludur';
    /* Yeni işletme ise ek alanlar */
    if (!selectedEntity) {
      if (!form.isletme_adi.trim()) e.isletme_adi = 'İşletme adı zorunludur';
      if (!form.il.trim())          e.il          = 'Şehir zorunludur';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true); setSaveErr('');

    // Not: claim_requests'e tarayıcıdan (anon) insert RLS özyinelemesine
    // takılıyor → /api/claim (service-role) üzerinden yazılır; bu route
    // admin + talep sahibine bildirim maili de gönderir.
    const payload = selectedEntity
      ? {
          entity_id:     selectedEntity.id,
          entity_type:   typeVal,
          entity_name:   selectedEntity.name,
          claimant_name: form.ad_soyad.trim(),
          phone:         form.tel.trim(),
          email:         form.email.trim(),
          role:          [form.unvan.trim() || null, form.mesaj || null, selectedEntity.claimed ? 'SAHİPLENME İTİRAZI' : 'SAHİPLENME TALEBİ'].filter(Boolean).join(' | ') || null,
          status:        selectedEntity.claimed ? 'dispute' : 'pending',
        }
      : {
          entity_id:     'new',
          entity_type:   typeVal,
          entity_name:   form.isletme_adi.trim(),
          claimant_name: form.ad_soyad.trim(),
          phone:         form.tel.trim(),
          email:         form.email.trim(),
          role:          [form.unvan.trim() || null, form.il ? (form.ilce ? `${form.il} / ${form.ilce}` : form.il) : null, form.adres ? `Adres: ${form.adres}` : null, form.mesaj || null, 'YENİ İŞLETME BAŞVURUSU'].filter(Boolean).join(' | ') || null,
          status:        'pending',
        };
    try {
      const res = await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) { setSaveErr(`Hata: ${data.error || 'Talep gönderilemedi.'}`); } else { setStep('done'); onSuccess(); }
    } catch {
      setSaving(false);
      setSaveErr('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  }

  const inp = (field: keyof typeof form): React.CSSProperties => ({ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${errors[field] ? '#FCA5A5' : T.border}`, fontSize: 13.5, fontFamily: 'inherit', color: T.text, outline: 'none', background: 'white', transition: 'border-color .15s', boxSizing: 'border-box' });
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 };
  const errMsg = (f: keyof typeof form) => errors[f] ? <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>{errors[f]}</div> : null;
  const fFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = T.navy; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,58,105,.08)'; };
  const fBlur  = (field: keyof typeof form) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = errors[field] ? '#FCA5A5' : T.border; e.currentTarget.style.boxShadow = 'none'; };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.4px' }}>Yeni Başvuru</h1>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>İşletmenizi Hekimhane'ye ekleyin veya mevcut profilinizin sahipliğini talep edin.</p>
      </div>

      {step === 'type' && (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>İşletme Türünü Seçin</span>
          </div>
          <div className="panel-form-grid" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {TYPES.map(t => (
              <button key={t.key} onClick={() => { setTypeVal(t.key); setStep('form'); }}
                style={{ padding: '20px', borderRadius: 14, border: `2px solid ${T.border}`, background: T.white, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.color; (e.currentTarget as HTMLButtonElement).style.background = t.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = T.border; (e.currentTarget as HTMLButtonElement).style.background = T.white; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ic d={icons.building} size={22} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'form' && (
        <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setStep('type')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 13, fontFamily: 'inherit' }}>← Geri</button>
            <span style={{ color: T.border }}>|</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{TYPES.find(t => t.key === typeVal)?.label} Başvurusu</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #E8F0FE' }}>İşletme Bilgileri</div>
            <div className="panel-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: '1/-1' }} ref={suggRef}>
                <label style={lbl}>İşletme / Klinik Adı <span style={{ color: T.red }}>*</span></label>

                {/* Seçilmiş mevcut işletme kartı */}
                {selectedEntity ? (
                  <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1D4ED8' }}>{selectedEntity.name}</div>
                      {(selectedEntity.il || selectedEntity.ilce) && (
                        <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>
                          {[selectedEntity.ilce, selectedEntity.il].filter(Boolean).join(', ')}
                        </div>
                      )}
                      <div style={{ fontSize: 11, marginTop: 6, color: selectedEntity.claimed ? '#D97706' : '#059669', fontWeight: 600 }}>
                        {selectedEntity.claimed ? '⚠ Bu işletme sahiplenilmiş — itiraz talebi gönderebilirsiniz' : '✓ Sistemde kayıtlı — sahiplenme talebi gönderebilirsiniz'}
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedEntity(null); setForm(f => ({ ...f, isletme_adi: '' })); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 12, padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={form.isletme_adi}
                      placeholder="Kliniğinizin adını yazın..."
                      style={{ ...inp('isletme_adi'), paddingRight: searching ? 38 : 14 }}
                      onChange={e => handleNameChange(e.target.value)}
                      onFocus={e => { fFocus(e); if (suggestions.length > 0) setShowSugg(true); }}
                      autoComplete="off"
                    />
                    {/* Arama spinner */}
                    {searching && (
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'panelSpin .8s linear infinite' }}>
                          <circle cx="7" cy="7" r="5.5" stroke="#E5E7EB" strokeWidth="2"/>
                          <path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="#1B3A69" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </span>
                    )}

                    {/* Öneri listesi */}
                    {showSugg && suggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.1)', marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #F3F4F6' }}>
                          Sistemde bulunan işletmeler
                        </div>
                        {suggestions.map((s, i) => (
                          <button key={s.id} type="button"
                            onClick={() => {
                              setSelectedEntity(s);
                              setForm(f => ({ ...f, isletme_adi: s.name }));
                              setShowSugg(false);
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', borderBottom: i < suggestions.length - 1 ? '1px solid #F9FAFB' : 'none', transition: 'background .1s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFF')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2744' }}>{s.name}</div>
                              {(s.il || s.ilce) && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{[s.ilce, s.il].filter(Boolean).join(', ')}</div>}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: s.claimed ? '#FEF3C7' : '#DCFCE7', color: s.claimed ? '#D97706' : '#16A34A', whiteSpace: 'nowrap', marginLeft: 8 }}>
                              {s.claimed ? 'Sahiplenilmiş' : 'Kayıtlı'}
                            </span>
                          </button>
                        ))}
                        <div style={{ padding: '9px 14px', fontSize: 11.5, color: '#6B7280', borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                          İşletmeniz listede yoksa yazmaya devam edin → yeni işletme olarak eklenir.
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {errMsg('isletme_adi')}
                <style>{`@keyframes panelSpin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
              </div>
              {/* Yeni işletme ise şehir/ilçe/adres göster */}
              {!selectedEntity && (<>
                <div>
                  <label style={lbl}>Şehir <span style={{ color: T.red }}>*</span></label>
                  <select value={form.il} style={{ ...inp('il'), cursor: 'pointer' }} onChange={e => setForm(f => ({ ...f, il: e.target.value }))} onFocus={fFocus} onBlur={fBlur('il')}>
                    <option value="">Seçiniz</option>
                    {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
                  </select>
                  {errMsg('il')}
                </div>
                <div>
                  <label style={lbl}>İlçe</label>
                  <input type="text" value={form.ilce} placeholder="Kadıköy" style={inp('ilce')} onChange={e => setForm(f => ({ ...f, ilce: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Adres</label>
                  <input type="text" value={form.adres} placeholder="Sokak, bina no, kat..." style={inp('adres')} onChange={e => setForm(f => ({ ...f, adres: e.target.value }))} />
                </div>
              </>)}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 14, marginTop: 8, paddingBottom: 8, borderBottom: '2px solid #E8F0FE' }}>Yetkili Bilgileri</div>
            <div className="panel-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Ad Soyad <span style={{ color: T.red }}>*</span></label>
                <input type="text" value={form.ad_soyad} placeholder="Adınız Soyadınız" style={inp('ad_soyad')} onChange={e => setForm(f => ({ ...f, ad_soyad: e.target.value }))} onFocus={fFocus} onBlur={fBlur('ad_soyad')} />
                {errMsg('ad_soyad')}
              </div>
              <div>
                <label style={lbl}>Ünvan</label>
                <input type="text" value={form.unvan} placeholder="Sahip, Yönetici..." style={inp('unvan')} onChange={e => setForm(f => ({ ...f, unvan: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Telefon <span style={{ color: T.red }}>*</span></label>
                <input type="tel" value={form.tel} placeholder="05xx xxx xx xx" style={inp('tel')} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} onFocus={fFocus} onBlur={fBlur('tel')} />
                {errMsg('tel')}
              </div>
              <div>
                <label style={lbl}>E-posta <span style={{ color: T.red }}>*</span></label>
                <input type="email" value={form.email} placeholder="ornek@email.com" style={inp('email')} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onFocus={fFocus} onBlur={fBlur('email')} />
                {errMsg('email')}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Ek Bilgi</label>
                <textarea value={form.mesaj} rows={3} placeholder="Eklemek istedikleriniz..." style={{ ...inp('mesaj'), resize: 'vertical', lineHeight: 1.6 }} onChange={e => setForm(f => ({ ...f, mesaj: e.target.value }))} />
              </div>
            </div>

            {saveErr && <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: T.red }}>{saveErr}</div>}

            {selectedEntity ? (
              <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#1D4ED8', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
                {selectedEntity.claimed ? 'İtiraz / Sahiplenme Talebi Gönder' : 'Bu İşletmeyi Sahiplen'}
              </button>
            ) : (
              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: saving ? '#9CA3AF' : T.navy, color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
                {saving ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
            )}
          </form>
        </div>
      )}

      {step === 'done' && (
        <div style={{ background: T.white, borderRadius: 16, border: '2px solid #86EFAC', padding: '56px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: T.green }}>
            <Ic d={icons.check} size={28} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#166534', marginBottom: 8 }}>Başvurunuz Alındı!</h2>
          <p style={{ fontSize: 14, color: '#15803D', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            Başvurunuz ekibimize iletildi. 1–2 iş günü içinde <strong>{form.email}</strong> adresine dönüş yapılacaktır.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROFİLİMİ DÜZENLE
═══════════════════════════════════════════════ */
type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'tel' | 'url' | 'number' | 'checkbox' | 'tags' | 'specpicker';
  placeholder?: string;
  fullWidth?: boolean;
};

/* ═══════════════════════════════════════════════
   SpecPicker — Uzmanlık Seçici Bileşeni
   entityType: hangi gruplara filtrelenecek
   value: seçili uzmanlıklar (string[])
   onChange: yeni dizi
═══════════════════════════════════════════════ */
function SpecPicker({
  value,
  onChange,
  entityType,
}: {
  value: string | string[];
  onChange: (v: string[]) => void;
  entityType: string;
}) {
  const [openGroup, setOpenGroup]     = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');

  // String veya dizi her iki formattan da başlatılabilir
  const selected: string[] = Array.isArray(value)
    ? value
    : typeof value === 'string' && value.trim()
    ? value.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const filteredGroups = SPEC_GRUPLARI.filter(g =>
    g.entityTypes.includes(entityType as 'doktor' | 'klinik' | 'hastane'),
  );

  function toggle(spec: string) {
    if (selected.includes(spec)) {
      onChange(selected.filter(v => v !== spec));
    } else {
      onChange([...selected, spec]);
    }
  }

  function addManual() {
    const trimmed = manualInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setManualInput('');
  }

  return (
    <div>
      {/* ─ Seçili chipler ─ */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, padding: '10px 12px', background: '#F0F4FF', borderRadius: 10, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px', width: '100%', marginBottom: 4 }}>
            Seçili ({selected.length})
          </span>
          {selected.map(spec => (
            <span key={spec} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: 'rgba(27,58,105,.1)', color: T.navy,
              border: '1px solid rgba(27,58,105,.2)',
            }}>
              {spec}
              <button
                type="button"
                onClick={() => toggle(spec)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 0, lineHeight: 1, fontSize: 14, display: 'flex', alignItems: 'center' }}
                title="Kaldır"
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* ─ Kategori grupları ─ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {filteredGroups.map(grup => {
          const groupSelected = grup.items.filter(item => selected.includes(item));
          const isOpen = openGroup === grup.ad;
          return (
            <div key={grup.ad} style={{ border: `1.5px solid ${isOpen ? grup.renk + '44' : T.border}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color .15s' }}>
              {/* Grup başlığı */}
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : grup.ad)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: isOpen ? grup.bg : 'white',
                  fontSize: 13, fontWeight: 600,
                  color: isOpen ? grup.renk : T.text,
                  transition: 'background .15s, color .15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {groupSelected.length > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 18, height: 18, borderRadius: 9, fontSize: 10, fontWeight: 800,
                      background: grup.renk, color: 'white', padding: '0 5px',
                    }}>
                      {groupSelected.length}
                    </span>
                  )}
                  {grup.ad}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d={isOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
                </svg>
              </button>

              {/* Grup içeriği */}
              {isOpen && (
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${grup.renk}22`, background: grup.bg }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {grup.items.map(item => {
                      const isSelected = selected.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggle(item)}
                          style={{
                            padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: `1.5px solid ${isSelected ? grup.renk : 'rgba(0,0,0,.18)'}`,
                            background: isSelected ? grup.renk : 'white',
                            color: isSelected ? 'white' : '#3A3A3C',
                            cursor: 'pointer', transition: 'all .15s',
                          }}
                        >
                          {isSelected && (
                            <svg style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─ Elle giriş ─ */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          type="text"
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addManual(); } }}
          placeholder="Listede yoksa kendi uzmanlık alanını yaz..."
          style={{
            flex: 1, padding: '9px 13px', borderRadius: 9,
            border: `1.5px solid ${T.border}`, fontSize: 13,
            fontFamily: 'inherit', color: T.text, outline: 'none',
            background: 'white',
          }}
        />
        <button
          type="button"
          onClick={addManual}
          style={{
            padding: '9px 16px', borderRadius: 9, background: T.navy, color: 'white',
            border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Ekle
        </button>
      </div>
    </div>
  );
}

const ENTITY_FIELDS: Record<string, FieldDef[]> = {
  klinik: [
    { key: 'name',     label: 'Klinik Adı',                        type: 'text',     placeholder: 'Özel Xyz Kliniği',     fullWidth: true },
    { key: 'sorumlu_hekim', label: 'Sorumlu Hekim (Ad Soyad)',    type: 'text',     placeholder: 'Dr. Ahmet Yılmaz — işletme adından farklı', fullWidth: true },
    { key: 'type',     label: 'Klinik Türü',                       type: 'text',     placeholder: 'Diş Kliniği, Poliklinik...' },
    { key: 'il',       label: 'İl',                                 type: 'text',     placeholder: 'İstanbul' },
    { key: 'ilce',     label: 'İlçe',                               type: 'text',     placeholder: 'Kadıköy' },
    { key: 'adres',    label: 'Adres',                              type: 'text',     placeholder: 'Sokak, bina no, kat...', fullWidth: true },
    { key: 'tel',      label: 'Telefon',                            type: 'tel',      placeholder: '0212 xxx xx xx' },
    { key: 'website',  label: 'Website',                            type: 'url',      placeholder: 'https://example.com' },
    { key: 'maps_url', label: 'Google Maps Bağlantısı',             type: 'url',      placeholder: 'https://maps.google.com/...', fullWidth: true },
    { key: 'specs',    label: 'Uzmanlık Alanları', type: 'specpicker', fullWidth: true },
    { key: 'online',    label: 'Online Randevu',                     type: 'checkbox' },
    { key: 'acil',      label: 'Acil Servis',                        type: 'checkbox' },
    { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/hesap_adi' },
    { key: 'facebook_url',  label: 'Facebook',  type: 'url', placeholder: 'https://facebook.com/sayfa_adi' },
    { key: 'linkedin_url',  label: 'LinkedIn',  type: 'url', placeholder: 'https://linkedin.com/company/...' },
    { key: 'tour360url', label: '360° Sanal Tur — URL veya iframe kodu', type: 'textarea', placeholder: 'https://matterport.com/...\nveya <iframe src="https://..." ...></iframe> embed kodunu buraya yapıştırın', fullWidth: true },
    { key: 'video_url',  label: 'Tanıtım Videosu — YouTube / Vimeo / embed kodu', type: 'textarea', placeholder: 'https://youtube.com/watch?v=...\nveya https://vimeo.com/...\nveya <iframe src="https://www.youtube.com/embed/..." ...></iframe>', fullWidth: true },
  ],
  hastane: [
    { key: 'name',     label: 'Hastane Adı',                        type: 'text',     placeholder: 'Özel Xyz Hastanesi',   fullWidth: true },
    { key: 'sorumlu_hekim', label: 'Sorumlu Hekim / Başhekim (Ad Soyad)', type: 'text', placeholder: 'Dr. Ahmet Yılmaz — işletme adından farklı', fullWidth: true },
    { key: 'type',     label: 'Hastane Türü',                       type: 'text',     placeholder: 'Özel, Devlet, Üniversite' },
    { key: 'il',       label: 'İl',                                  type: 'text',     placeholder: 'İstanbul' },
    { key: 'ilce',     label: 'İlçe',                                type: 'text',     placeholder: 'Kadıköy' },
    { key: 'adres',    label: 'Adres',                               type: 'text',     placeholder: 'Sokak, bina no, kat...', fullWidth: true },
    { key: 'tel',      label: 'Telefon',                             type: 'tel',      placeholder: '0212 xxx xx xx' },
    { key: 'website',  label: 'Website',                             type: 'url',      placeholder: 'https://example.com' },
    { key: 'maps_url', label: 'Google Maps Bağlantısı',              type: 'url',      placeholder: 'https://maps.google.com/...', fullWidth: true },
    { key: 'docs',     label: 'Doktor Sayısı',                       type: 'number',   placeholder: '50' },
    { key: 'beds',     label: 'Yatak Sayısı',                        type: 'number',   placeholder: '200' },
    { key: 'founded',  label: 'Kuruluş Yılı',                        type: 'number',   placeholder: '1990' },
    { key: 'specs',     label: 'Uzmanlık Alanları', type: 'specpicker', fullWidth: true },
    { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/hesap_adi' },
    { key: 'facebook_url',  label: 'Facebook',  type: 'url', placeholder: 'https://facebook.com/sayfa_adi' },
    { key: 'linkedin_url',  label: 'LinkedIn',  type: 'url', placeholder: 'https://linkedin.com/company/...' },
    { key: 'tour360url', label: '360° Sanal Tur — URL veya iframe kodu', type: 'textarea', placeholder: 'https://matterport.com/...\nveya <iframe src="https://..." ...></iframe> embed kodunu buraya yapıştırın', fullWidth: true },
    { key: 'video_url',  label: 'Tanıtım Videosu — YouTube / Vimeo / embed kodu', type: 'textarea', placeholder: 'https://youtube.com/watch?v=...\nveya https://vimeo.com/...\nveya <iframe src="https://www.youtube.com/embed/..." ...></iframe>', fullWidth: true },
  ],
  doktor: [
    { key: 'ad',          label: 'Ad',                                    type: 'text',    placeholder: 'Ahmet' },
    { key: 'soyad',       label: 'Soyad',                                  type: 'text',    placeholder: 'Yılmaz' },
    { key: 'unvan',       label: 'Ünvan',                                   type: 'text',    placeholder: 'Doç. Dr., Uzm. Dr.' },
    { key: 'spec',        label: 'Uzmanlık',                                type: 'text',    placeholder: 'Kardiyoloji' },
    { key: 'il',          label: 'İl',                                      type: 'text',    placeholder: 'İstanbul' },
    { key: 'ilce',        label: 'İlçe',                                    type: 'text',    placeholder: 'Kadıköy' },
    { key: 'clinic_name', label: 'Çalıştığı Klinik / Hastane',              type: 'text',    placeholder: 'Özel Xyz Hastanesi', fullWidth: true },
    { key: 'tel',         label: 'Telefon',                                 type: 'tel',     placeholder: '0212 xxx xx xx' },
    { key: 'fee',         label: 'Muayene Ücreti (₺)',                      type: 'number',  placeholder: '500' },
    { key: 'okul',        label: 'Mezun Olduğu Okul',                       type: 'text',    placeholder: 'İstanbul Üniversitesi Tıp Fakültesi', fullWidth: true },
    { key: 'sigorta',     label: 'Kabul Edilen Sigortalar',                 type: 'text',    placeholder: 'SGK, Özel Sigorta', fullWidth: true },
    { key: 'bio',         label: 'Biyografi',                               type: 'textarea', placeholder: 'Doktor hakkında kısa bilgi...', fullWidth: true },
    { key: 'tags',        label: 'Alt Uzmanlık Alanları',                    type: 'specpicker', fullWidth: true },
    { key: 'online',      label: 'Online Konsültasyon',                      type: 'checkbox' },
    { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/hesap_adi' },
    { key: 'facebook_url',  label: 'Facebook',  type: 'url', placeholder: 'https://facebook.com/sayfa_adi' },
    { key: 'linkedin_url',  label: 'LinkedIn',  type: 'url', placeholder: 'https://linkedin.com/in/...' },
    { key: 'tour360url', label: '360° Sanal Tur — URL veya iframe kodu',    type: 'textarea', placeholder: 'https://matterport.com/...\nveya <iframe src="https://..." ...></iframe> embed kodunu buraya yapıştırın', fullWidth: true },
    { key: 'video_url',  label: 'Tanıtım Videosu — YouTube / Vimeo / embed kodu', type: 'textarea', placeholder: 'https://youtube.com/watch?v=...\nveya https://vimeo.com/...\nveya <iframe src="https://www.youtube.com/embed/..." ...></iframe>', fullWidth: true },
  ],
  eczane: [
    { key: 'name',        label: 'Eczane Adı',        type: 'text',    placeholder: 'Xyz Eczanesi',  fullWidth: true },
    { key: 'pharmacist',  label: 'Eczacı Adı',        type: 'text',    placeholder: 'Ahmet Yılmaz' },
    { key: 'il',          label: 'İl',                type: 'text',    placeholder: 'İstanbul' },
    { key: 'ilce',        label: 'İlçe',              type: 'text',    placeholder: 'Kadıköy' },
    { key: 'address',     label: 'Adres',             type: 'text',    placeholder: 'Sokak, kapı no', fullWidth: true },
    { key: 'tel',         label: 'Telefon',           type: 'tel',     placeholder: '0212 xxx xx xx' },
    { key: 'chamber',     label: 'Eczacılar Odası No', type: 'text',   placeholder: '12345' },
    { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/hesap_adi' },
    { key: 'facebook_url',  label: 'Facebook',  type: 'url', placeholder: 'https://facebook.com/sayfa_adi' },
    { key: 'linkedin_url',  label: 'LinkedIn',  type: 'url', placeholder: 'https://linkedin.com/company/...' },
    { key: 'tour360url', label: '360° Sanal Tur — URL veya iframe kodu', type: 'textarea', placeholder: 'https://matterport.com/...\nveya <iframe src="https://..." ...></iframe> embed kodunu buraya yapıştırın', fullWidth: true },
    { key: 'video_url',  label: 'Tanıtım Videosu — YouTube / Vimeo / embed kodu', type: 'textarea', placeholder: 'https://youtube.com/watch?v=...\nveya https://vimeo.com/...\nveya <iframe src="https://www.youtube.com/embed/..." ...></iframe>', fullWidth: true },
  ],
};

function arrayToTags(val: unknown): string {
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'string') return val;
  return '';
}

/* ═══════════════════════════════════════════════
   YORUMLAR TAB
═══════════════════════════════════════════════ */
interface Yorum { id: string; entity_id: string; entity_type: string; author: string; rating: number; text: string; created_at: string; reply_text?: string | null; reply_at?: string | null; }

// ── Randevu Talepleri (işletme sahibi görünümü) ──────────────────
interface RandevuTalep {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  ad_soyad: string;
  tel: string;
  email: string | null;
  tercih: string | null;
  mesaj: string | null;
  status: string;
  sahip_notu?: string | null;
  randevu_slot?: string | null;
  created_at: string;
}
const RANDEVU_DURUM: Record<string, { label: string; bg: string; color: string; border: string }> = {
  yeni:       { label: 'Yeni',        bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  arandi:     { label: 'Arandı',      bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  tamamlandi: { label: 'Tamamlandı',  bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
  iptal:      { label: 'İptal',       bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' },
};

function RandevuTalepleriTab({ approvedClaims }: { approvedClaims: ClaimRequest[] }) {
  const [talepler, setTalepler] = useState<RandevuTalep[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notDraft, setNotDraft] = useState<Record<string, string>>({});   // id → düzenlenen not
  const [notSaving, setNotSaving] = useState<string | null>(null);
  const [mailOpen, setMailOpen] = useState<string | null>(null);          // mail composer açık talep id
  const [mailKonu, setMailKonu] = useState('');
  const [mailMesaj, setMailMesaj] = useState('');
  const [mailState, setMailState] = useState<'idle' | 'sending' | 'done' | 'err'>('idle');
  const [mailMsg, setMailMsg] = useState('');
  const [ertelId, setErtelId] = useState<string | null>(null);
  const [ertelTarih, setErtelTarih] = useState('');
  const [ertelSaat, setErtelSaat] = useState('');
  const [ertelMsg, setErtelMsg] = useState('');

  const hasEntities = approvedClaims.some(c => c.entity_id && c.entity_id !== 'new');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/panel/randevu-talepleri');
        const d = res.ok ? await res.json() : { talepler: [] };
        setTalepler(d.talepler || []);
      } catch { setTalepler([]); }
      setLoading(false);
    })();
  }, []);

  async function setStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch('/api/panel/randevu-talepleri', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) setTalepler(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch { /* yoksay */ }
    setUpdating(null);
  }

  async function saveNot(id: string) {
    const not = notDraft[id] ?? '';
    setNotSaving(id);
    try {
      const res = await fetch('/api/panel/randevu-talepleri', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sahip_notu: not }),
      });
      if (res.ok) {
        setTalepler(prev => prev.map(t => t.id === id ? { ...t, sahip_notu: not } : t));
        setNotDraft(p => { const n = { ...p }; delete n[id]; return n; });
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Not kaydedilemedi.');
      }
    } catch { alert('Bağlantı hatası.'); }
    setNotSaving(null);
  }

  async function ertele(id: string) {
    if (!ertelTarih || !ertelSaat) { setErtelMsg('Tarih ve saat seçin.'); return; }
    const slot = `${ertelTarih} ${ertelSaat}`;
    setUpdating(id); setErtelMsg('');
    try {
      const res = await fetch('/api/panel/randevu-talepleri', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, randevu_slot: slot }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        setTalepler(prev => prev.map(t => t.id === id ? { ...t, randevu_slot: slot, tercih: slot } : t));
        setErtelId(null); setErtelTarih(''); setErtelSaat('');
      } else setErtelMsg(d.error || 'Ertelenemedi');
    } catch { setErtelMsg('Bağlantı hatası'); }
    setUpdating(null);
  }

  async function sendHastaMail(talepId: string) {
    if (mailMesaj.trim().length < 5) { setMailState('err'); setMailMsg('Mesaj en az 5 karakter olmalı.'); return; }
    setMailState('sending'); setMailMsg('');
    try {
      const res = await fetch('/api/panel/hasta-mail', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talepId, konu: mailKonu.trim() || null, mesaj: mailMesaj.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) { setMailState('done'); setMailMsg('Mail gönderildi.'); setTimeout(() => { setMailOpen(null); setMailState('idle'); setMailKonu(''); setMailMesaj(''); setMailMsg(''); }, 1400); }
      else { setMailState('err'); setMailMsg(d.error || 'Gönderilemedi.'); }
    } catch { setMailState('err'); setMailMsg('Bağlantı hatası.'); }
  }

  // Aynı telefon numarasıyla kaç talep var (hasta geçmişi göstergesi)
  const telCount: Record<string, number> = {};
  talepler.forEach(t => { const k = (t.tel || '').replace(/\D/g, ''); if (k) telCount[k] = (telCount[k] || 0) + 1; });

  const entityNames = Array.from(new Set(talepler.map(t => t.entity_name)));
  const shown = talepler
    .filter(t => selectedEntity === 'all' || t.entity_name === selectedEntity)
    .filter(t => statusFilter === 'all' || t.status === statusFilter);
  const yeniCount = talepler.filter(t => t.status === 'yeni').length;

  const fmtDate = (s: string) => { try { return new Date(s).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; } };

  // Apple tarzı sade palet (yalnızca bu sayfa)
  const A = { page: '#F5F5F7', card: '#FFFFFF', text: '#1D1D1F', muted: '#86868B', line: '#E5E5EA', accent: T.navy, green: '#34C759' };
  const seg = (['all', 'yeni', 'arandi', 'tamamlandi'] as const);

  const IcS = ({ d, size = 15, color = A.muted, sw = 1.8 }: { d: string; size?: number; color?: string; sw?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
    </svg>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: A.text, margin: 0, letterSpacing: '-0.6px' }}>Randevu Talepleri</h1>
        <p style={{ fontSize: 14, color: A.muted, marginTop: 5, letterSpacing: '-0.1px' }}>İşletmenize gelen randevu taleplerini buradan görüp yönetin.</p>
      </div>

      {!hasEntities ? (
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: A.page, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <IcS d={icons.bell} size={24} color={A.muted} />
          </div>
          <div style={{ fontSize: 15, color: A.text, fontWeight: 600 }}>Henüz işletmeniz yok</div>
          <div style={{ fontSize: 13.5, color: A.muted, marginTop: 4 }}>Talepleri görebilmek için önce bir işletmenizin sahipliğini onaylatın.</div>
        </div>
      ) : loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: A.muted, fontSize: 14 }}>Yükleniyor…</div>
      ) : (
        <>
          {/* Segmented filtre + işletme seçici */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', background: A.page, borderRadius: 11, padding: 3, gap: 2 }}>
              {seg.map(f => {
                const n = f === 'all' ? talepler.length : talepler.filter(t => t.status === f).length;
                const lbl = f === 'all' ? 'Tümü' : (RANDEVU_DURUM[f]?.label || f);
                const on = statusFilter === f;
                return (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    style={{ padding: '7px 15px', borderRadius: 8, fontSize: 13, fontWeight: on ? 700 : 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                      background: on ? A.card : 'transparent', color: on ? A.text : A.muted, boxShadow: on ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                    {lbl} <span style={{ color: on ? A.muted : '#B0B0B5', fontWeight: 600 }}>{n}</span>
                  </button>
                );
              })}
            </div>
            {entityNames.length > 1 && (
              <select value={selectedEntity} onChange={e => setSelectedEntity(e.target.value)}
                style={{ marginLeft: 'auto', padding: '9px 13px', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', border: `1px solid ${A.line}`, background: A.card, color: A.text, outline: 'none' }}>
                <option value="all">Tüm işletmeler</option>
                {entityNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </div>

          {shown.length === 0 ? (
            <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: A.page, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <IcS d="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={23} color={A.muted} />
              </div>
              <div style={{ fontSize: 15, color: A.text, fontWeight: 600 }}>{talepler.length === 0 ? 'Henüz randevu talebi yok' : 'Bu filtrede talep yok'}</div>
              <div style={{ fontSize: 13.5, color: A.muted, marginTop: 4 }}>{talepler.length === 0 ? 'Talepler geldiğinde burada görünecek.' : 'Başka bir filtre deneyin.'}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {shown.map(t => {
                const d = RANDEVU_DURUM[t.status] || RANDEVU_DURUM.yeni;
                const isYeni = t.status === 'yeni';
                return (
                  <div key={t.id} style={{ background: A.card, borderRadius: 16, border: `1px solid ${A.line}`, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: A.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 700, color: A.accent }}>
                          {(t.ad_soyad || '?').trim().charAt(0).toLocaleUpperCase('tr')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15.5, fontWeight: 600, color: A.text, letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.ad_soyad}</div>
                          <div style={{ fontSize: 12, color: A.muted, marginTop: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                            {fmtDate(t.created_at)}
                            {telCount[(t.tel || '').replace(/\D/g, '')] > 1 && (
                              <span title="Bu telefon numarasından birden fazla talep" style={{ fontSize: 10.5, fontWeight: 700, color: A.accent, background: 'rgba(27,58,105,.08)', borderRadius: 6, padding: '1px 6px' }}>
                                {telCount[(t.tel || '').replace(/\D/g, '')]} talep
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: isYeni ? '#1D7A3E' : A.muted, background: isYeni ? 'rgba(52,199,89,.12)' : A.page, borderRadius: 20, padding: '4px 11px' }}>
                        {isYeni && <span style={{ width: 6, height: 6, borderRadius: '50%', background: A.green }} />}{d.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 13.5, color: A.text, marginBottom: (t.tercih || t.mesaj) ? 12 : 14 }}>
                      <a href={`tel:${t.tel}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: A.accent, fontWeight: 600, textDecoration: 'none' }}>
                        <IcS d={icons.phone} size={14} color={A.accent} />{t.tel}
                      </a>
                      {t.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: A.muted }}><IcS d={icons.mail} size={14} />{t.email}</span>}
                      {entityNames.length > 1 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: A.muted }}><IcS d={icons.building} size={14} />{t.entity_name}</span>}
                    </div>

                    {(t.tercih || t.mesaj) && (
                      <div style={{ fontSize: 13.5, color: A.text, background: A.page, borderRadius: 12, padding: '11px 14px', marginBottom: 14, lineHeight: 1.5 }}>
                        {t.tercih && <div><span style={{ color: A.muted }}>Tercih · </span>{t.tercih}</div>}
                        {t.mesaj && <div style={{ marginTop: t.tercih ? 3 : 0 }}><span style={{ color: A.muted }}>Not · </span>{t.mesaj}</div>}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {t.status !== 'arandi' && (
                        <button onClick={() => setStatus(t.id, 'arandi')} disabled={updating === t.id}
                          style={{ padding: '8px 15px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: A.page, color: A.accent, border: 'none' }}>Arandı</button>
                      )}
                      {t.status !== 'tamamlandi' && (
                        <button onClick={() => setStatus(t.id, 'tamamlandi')} disabled={updating === t.id}
                          style={{ padding: '8px 15px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: A.accent, color: '#fff', border: 'none' }}>Tamamlandı</button>
                      )}
                      {t.status !== 'yeni' && (
                        <button onClick={() => setStatus(t.id, 'yeni')} disabled={updating === t.id}
                          style={{ padding: '8px 15px', borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', background: 'transparent', color: A.muted, border: `1px solid ${A.line}` }}>Yeni&apos;ye al</button>
                      )}
                      {t.email && (
                        <button onClick={() => { setMailOpen(mailOpen === t.id ? null : t.id); setMailKonu(''); setMailMesaj(''); setMailState('idle'); setMailMsg(''); }}
                          style={{ padding: '8px 15px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: 'transparent', color: A.accent, border: `1px solid ${A.line}`, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <IcS d={icons.mail} size={13} color={A.accent} />Mail gönder
                        </button>
                      )}
                      <button onClick={() => { const o = ertelId === t.id; setErtelId(o ? null : t.id); setErtelMsg(''); const p = (t.randevu_slot || '').split(' '); setErtelTarih(o ? '' : (p[0] || '')); setErtelSaat(o ? '' : (p[1] || '')); }}
                        style={{ padding: '8px 15px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: 'transparent', color: A.muted, border: `1px solid ${A.line}` }}>Ertele</button>
                      {t.status !== 'iptal' && (
                        <button onClick={() => { if (confirm('Bu randevuyu iptal etmek istiyor musunuz? Hastaya e-posta bırakmışsa bilgilendirilir.')) setStatus(t.id, 'iptal'); }} disabled={updating === t.id}
                          style={{ padding: '8px 15px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: 'transparent', color: '#C0392B', border: '1px solid #F3C9C4' }}>İptal et</button>
                      )}
                    </div>

                    {/* Erteleme formu */}
                    {ertelId === t.id && (
                      <div style={{ marginTop: 12, background: A.page, borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: A.text, marginBottom: 8 }}>Yeni tarih ve saat</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <input type="date" value={ertelTarih} min={new Date().toISOString().split('T')[0]} onChange={e => { setErtelTarih(e.target.value); setErtelMsg(''); }}
                            style={{ flex: '1 1 150px', padding: '10px 12px', borderRadius: 10, border: `1px solid ${A.line}`, fontSize: 13.5, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none' }} />
                          <input type="time" value={ertelSaat} onChange={e => { setErtelSaat(e.target.value); setErtelMsg(''); }}
                            style={{ flex: '1 1 110px', padding: '10px 12px', borderRadius: 10, border: `1px solid ${A.line}`, fontSize: 13.5, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                          <button onClick={() => ertele(t.id)} disabled={updating === t.id}
                            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: A.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Ertele ve bildir</button>
                          <button onClick={() => setErtelId(null)}
                            style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: A.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Vazgeç</button>
                          {ertelMsg && <span style={{ fontSize: 12.5, fontWeight: 600, color: '#C0392B' }}>{ertelMsg}</span>}
                        </div>
                      </div>
                    )}

                    {/* Mail composer */}
                    {mailOpen === t.id && (
                      <div style={{ marginTop: 12, background: A.page, borderRadius: 12, padding: 12 }}>
                        <input value={mailKonu} onChange={e => setMailKonu(e.target.value)} placeholder="Konu (boş bırakılırsa otomatik)"
                          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 9, border: `1px solid ${A.line}`, fontSize: 13, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none', marginBottom: 7 }} />
                        <textarea value={mailMesaj} onChange={e => setMailMesaj(e.target.value)} rows={3} placeholder={`${t.ad_soyad} adlı hastaya mesajınız…`}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 9, border: `1px solid ${A.line}`, fontSize: 13, fontFamily: 'inherit', color: A.text, background: A.card, resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                          <button onClick={() => sendHastaMail(t.id)} disabled={mailState === 'sending'}
                            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: A.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: mailState === 'sending' ? 'default' : 'pointer', fontFamily: 'inherit', opacity: mailState === 'sending' ? .6 : 1 }}>
                            {mailState === 'sending' ? 'Gönderiliyor…' : 'Gönder'}
                          </button>
                          <button onClick={() => setMailOpen(null)}
                            style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: A.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Vazgeç</button>
                          {mailMsg && <span style={{ fontSize: 12.5, fontWeight: 600, color: mailState === 'done' ? '#1D7A3E' : '#C0392B' }}>{mailMsg}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: A.muted, marginTop: 7 }}>Hasta e-postası: {t.email} · yanıtlarsa size ulaşır.</div>
                      </div>
                    )}

                    {/* Sahip notu — yalnızca sizin gördüğünüz */}
                    <div style={{ marginTop: 12 }}>
                      <textarea
                        value={notDraft[t.id] ?? (t.sahip_notu || '')}
                        onChange={e => setNotDraft(p => ({ ...p, [t.id]: e.target.value }))}
                        placeholder="Bu hasta hakkında özel notunuz… (yalnızca siz görürsünüz)"
                        rows={2}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: `1px dashed ${A.line}`, fontSize: 13, fontFamily: 'inherit', color: A.text, background: A.card, resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
                      {(notDraft[t.id] !== undefined && notDraft[t.id] !== (t.sahip_notu || '')) && (
                        <button onClick={() => saveNot(t.id)} disabled={notSaving === t.id}
                          style={{ marginTop: 7, padding: '6px 13px', borderRadius: 9, border: 'none', background: A.accent, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {notSaving === t.id ? 'Kaydediliyor…' : 'Notu kaydet'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RANDEVU MODÜLÜ TAB — sitene ekle (Apple tarzı)
═══════════════════════════════════════════════ */
function RandevuModulTab({ approvedClaims }: { approvedClaims: ClaimRequest[] }) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notifyMode, setNotifyMode] = useState<'same' | 'custom'>('same');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySaving, setNotifySaving] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [takvimAktif, setTakvimAktif] = useState(false);
  const [slotDk, setSlotDk] = useState(30);
  const [takvimSaving, setTakvimSaving] = useState(false);
  const [takvimMsg, setTakvimMsg] = useState('');
  const [calismaSaatleri, setCalismaSaatleri] = useState('');
  const [acik24, setAcik24] = useState(false);
  const [bloke, setBloke] = useState<string[]>([]);          // "YYYY-MM-DD" veya "YYYY-MM-DD HH:MM"
  const [blokeTarih, setBlokeTarih] = useState('');
  const [blokeOffset, setBlokeOffset] = useState(0); // gün şeridi kaydırma penceresi (7'şer gün)
  const [blokeMod, setBlokeMod] = useState<'hafta' | 'ay' | 'yil'>('hafta'); // gün seçim görünümü
  const _bugun = new Date(); _bugun.setHours(0, 0, 0, 0);
  const [ayCursor, setAyCursor] = useState<{ y: number; m: number }>({ y: _bugun.getFullYear(), m: _bugun.getMonth() }); // Ay görünümü
  const [yilCursor, setYilCursor] = useState<number>(_bugun.getFullYear()); // Yıl görünümü
  const [rangeStart, setRangeStart] = useState('');    // seçim başlangıç ISO (tek gün de olabilir)
  const [rangeEnd, setRangeEnd] = useState('');        // seçim bitiş ISO ('' ise tek gün seçili)
  const [saatDuzenle, setSaatDuzenle] = useState(false); // seçili tek günün saatlerini tek tek düzenle
  const [blokeSaving, setBlokeSaving] = useState(false);
  const [blokeMsg, setBlokeMsg] = useState('');
  const entities = approvedClaims.filter(c => c.entity_id && c.entity_id !== 'new');

  // Seçili işletmenin bildirim e-postasını + randevu takvim ayarını yükle
  useEffect(() => {
    const e = entities[idx] || entities[0];
    if (!e) return;
    const TM: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
    const tbl = TM[e.entity_type]; if (!tbl) return;
    const sb = createSupabaseBrowser();
    sb.from(tbl).select('randevu_email,randevu_aktif,randevu_slot_dk,calisma_saatleri,acik_24_saat,randevu_bloke').eq('id', e.entity_id!).maybeSingle().then(({ data }) => {
      const d = (data as any) || {};
      const v = String(d.randevu_email || '').trim();
      if (v) { setNotifyMode('custom'); setNotifyEmail(v); } else { setNotifyMode('same'); setNotifyEmail(''); }
      setTakvimAktif(d.randevu_aktif === true);
      setSlotDk(Number(d.randevu_slot_dk) || 30);
      setCalismaSaatleri(String(d.calisma_saatleri || ''));
      setAcik24(d.acik_24_saat === true);
      setBloke(Array.isArray(d.randevu_bloke) ? d.randevu_bloke.map(String) : []);
      setBlokeTarih('');
      setNotifyMsg(''); setTakvimMsg(''); setBlokeMsg('');
    });
  }, [idx, approvedClaims.length]);  // eslint-disable-line react-hooks/exhaustive-deps

  const A = { page: '#F5F5F7', card: '#FFFFFF', text: '#1D1D1F', muted: '#86868B', line: '#E5E5EA', accent: T.navy, green: '#34C759' };

  if (entities.length === 0) {
    return (
      <div style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: A.text, margin: 0, letterSpacing: '-0.6px' }}>Randevu Takvimi</h1>
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: '48px 24px', textAlign: 'center', marginTop: 22, color: A.muted, fontSize: 14 }}>
          Randevu takvimini kullanmak için önce bir işletmenizin sahipliğini onaylatın.
        </div>
      </div>
    );
  }

  const ent = entities[idx] || entities[0];
  const src = `https://www.hekimhane.com.tr/embed/randevu?type=${ent.entity_type}&id=${ent.entity_id}`;
  const kod = `<iframe src="${src}" width="100%" height="640" style="border:0;max-width:480px" loading="lazy" title="Randevu Al"></iframe>`;
  const kopyala = () => { try { navigator.clipboard.writeText(kod); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };

  async function saveNotify() {
    const val = notifyMode === 'custom' ? notifyEmail.trim() : '';
    if (notifyMode === 'custom' && !val.includes('@')) { setNotifyMsg('Geçerli bir e-posta girin.'); return; }
    setNotifySaving(true); setNotifyMsg('');
    try {
      const res = await fetch('/api/panel/update-entity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: ent.entity_type, entityId: ent.entity_id, fields: { randevu_email: val || null } }),
      });
      const j = await res.json().catch(() => ({}));
      setNotifyMsg(res.ok && j.success ? 'Kaydedildi' : (j.error || 'Kaydedilemedi'));
    } catch { setNotifyMsg('Bağlantı hatası'); }
    setNotifySaving(false);
  }

  async function saveTakvim() {
    setTakvimSaving(true); setTakvimMsg('');
    try {
      const res = await fetch('/api/panel/update-entity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: ent.entity_type, entityId: ent.entity_id, fields: { randevu_aktif: takvimAktif, randevu_slot_dk: slotDk } }),
      });
      const j = await res.json().catch(() => ({}));
      setTakvimMsg(res.ok && j.success ? 'Kaydedildi' : (j.error || 'Kaydedilemedi'));
    } catch { setTakvimMsg('Bağlantı hatası'); }
    setTakvimSaving(false);
  }

  // Bir günün TÜM çalışma-saati slotları (bloke bakılmaz) — panelde kapat/aç için
  function gunSaatleri(iso: string): string[] {
    if (!iso) return [];
    const dt = new Date(iso + 'T00:00:00'); const gun = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][dt.getDay()];
    let o = '09:00', c = '18:00', acikGun = true;
    if (acik24) { o = '08:00'; c = '22:00'; }
    else {
      let sch: Record<string, { acik?: boolean; baslangic?: string; bitis?: string }> = {};
      try { sch = calismaSaatleri ? JSON.parse(calismaSaatleri) : {}; } catch { sch = {}; }
      if (sch && sch[gun]) { acikGun = sch[gun].acik !== false; o = sch[gun].baslangic || '09:00'; c = sch[gun].bitis || '18:00'; }
      else if (calismaSaatleri) { acikGun = false; } else { acikGun = dt.getDay() !== 0; }
    }
    if (!acikGun) return [];
    let t = (+o.split(':')[0]) * 60 + (+o.split(':')[1]); const end = (+c.split(':')[0]) * 60 + (+c.split(':')[1]); const dk = slotDk || 30; const out: string[] = [];
    while (t + dk <= end) { out.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0')); t += dk; }
    return out;
  }
  const gunKapali = !!blokeTarih && bloke.includes(blokeTarih);
  const toggleSlot = (slot: string) => { const k = `${blokeTarih} ${slot}`; setBloke(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]); setBlokeMsg(''); };
  const toggleGun = () => { setBloke(p => p.includes(blokeTarih) ? p.filter(x => x !== blokeTarih) : [...p.filter(x => !x.startsWith(blokeTarih + ' ')), blokeTarih]); setBlokeMsg(''); };

  async function saveBloke(arr: string[] = bloke) {
    setBlokeSaving(true); setBlokeMsg('');
    try {
      const res = await fetch('/api/panel/update-entity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: ent.entity_type, entityId: ent.entity_id, fields: { randevu_bloke: arr } }),
      });
      const j = await res.json().catch(() => ({}));
      setBlokeMsg(res.ok && j.success ? 'Kaydedildi' : (j.error || 'Kaydedilemedi'));
    } catch { setBlokeMsg('Bağlantı hatası'); }
    setBlokeSaving(false);
  }

  // İki tarih arasındaki tüm günleri tek seferde kapat/aç (aralık seçimi).
  function isoAralik(a: string, b: string): string[] {
    const [s, e] = a <= b ? [a, b] : [b, a];
    const out: string[] = []; const d = new Date(s + 'T00:00:00'); const son = new Date(e + 'T00:00:00');
    while (d <= son) { out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); d.setDate(d.getDate() + 1); }
    return out;
  }
  async function applyRange(close: boolean) {
    if (!rangeStart) return;
    const isos = isoAralik(rangeStart, rangeEnd || rangeStart);   // bitiş yoksa tek gün
    const set = new Set(isos);
    // Önce bu günlere ait tüm kayıtları (tam gün + tek tek saat) temizle
    let next = bloke.filter(x => !set.has(x.slice(0, 10)));
    if (close) next = [...next, ...isos];   // her günü tam-gün kapalı işaretle
    setBloke(next);
    setRangeStart(''); setRangeEnd(''); setSaatDuzenle(false); setBlokeTarih('');
    await saveBloke(next);
  }

  const IcS = ({ d, size = 15, color = A.muted, sw = 1.8 }: { d: string; size?: number; color?: string; sw?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
    </svg>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: A.text, margin: 0, letterSpacing: '-0.6px' }}>Randevu Takvimi</h1>
        <p style={{ fontSize: 14, color: A.muted, marginTop: 5, letterSpacing: '-0.1px' }}>Takvim doluluk/boşluk durumunu yönetin: günleri açıp kapatın, kapalı saatleri ve tarih aralıklarını ayarlayın. Kendi sitenizden de randevu alabilirsiniz.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        {/* Kod kartı */}
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
          {entities.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: A.muted, marginBottom: 6 }}>İşletme</label>
              <select value={idx} onChange={e => setIdx(Number(e.target.value))}
                style={{ width: '100%', padding: '11px 13px', borderRadius: 11, border: `1px solid ${A.line}`, fontSize: 14, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none' }}>
                {entities.map((c, i) => <option key={c.id} value={i}>{c.entity_name}</option>)}
              </select>
            </div>
          )}

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: A.muted, marginBottom: 6 }}>Siteye ekleme kodu</label>
          <textarea readOnly value={kod} onFocus={e => e.currentTarget.select()}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 86, padding: '13px 15px', borderRadius: 12, border: `1px solid ${A.line}`, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12.5, lineHeight: 1.55, color: A.text, background: A.page, resize: 'vertical', outline: 'none' }} />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <button onClick={kopyala}
              style={{ padding: '10px 18px', borderRadius: 11, border: 'none', background: copied ? A.green : A.accent, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <IcS d={copied ? icons.check : 'M9 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z M5 15H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1'} size={15} color="#fff" />
              {copied ? 'Kopyalandı' : 'Kodu Kopyala'}
            </button>
            <a href="/randevu-modulu" target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 18px', borderRadius: 11, border: `1px solid ${A.line}`, background: A.card, color: A.text, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              Nasıl çalışır?
            </a>
          </div>
          <p style={{ fontSize: 12.5, color: A.muted, lineHeight: 1.55, margin: '14px 0 0' }}>
            Kodu WordPress, Wix veya kendi sitenize yapıştırın. Ziyaretçiler sitenizden randevu bıraksın; talepler size e-posta olarak da iletilir.
          </p>
        </div>

        {/* Randevu takvimi (slot bazlı) */}
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: A.text, letterSpacing: '-0.2px' }}>Randevu takvimi (slot bazlı)</div>
          <p style={{ fontSize: 13, color: A.muted, margin: '4px 0 14px', lineHeight: 1.5 }}>
            Açık olduğunda hastalar; çalışma saatlerinize göre <strong>uygun saati seçip</strong> randevu alır (dolu saatler gizlenir). Kapalıysa serbest tarih/saat tercihi bırakırlar.
          </p>

          <div onClick={() => { setTakvimAktif(v => !v); setTakvimMsg(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: takvimAktif ? 'rgba(52,199,89,.08)' : A.page, border: `1px solid ${takvimAktif ? 'rgba(52,199,89,.4)' : A.line}`, cursor: 'pointer' }}>
            <div style={{ width: 42, height: 26, borderRadius: 13, background: takvimAktif ? A.green : '#C7C7CC', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: takvimAktif ? 18 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .2s' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: A.text }}>Slot bazlı randevu {takvimAktif ? 'açık' : 'kapalı'}</div>
              <div style={{ fontSize: 12, color: A.muted, marginTop: 1 }}>Hastalar uygun saati listeden seçsin</div>
            </div>
          </div>

          {takvimAktif && (
            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: A.muted, marginBottom: 6 }}>Randevu aralığı</label>
              <select value={slotDk} onChange={e => { setSlotDk(Number(e.target.value)); setTakvimMsg(''); }}
                style={{ width: '100%', padding: '11px 13px', borderRadius: 11, border: `1px solid ${A.line}`, fontSize: 14, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none' }}>
                {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} dakika</option>)}
              </select>
              <div style={{ display: 'flex', gap: 9, padding: '11px 13px', background: '#F0F9FF', borderRadius: 10, border: '1px solid #BAE6FD', marginTop: 12 }}>
                <IcS d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M12 16v-4 M12 8h.01" size={15} color="#0369A1" />
                <p style={{ fontSize: 12, color: '#075985', lineHeight: 1.55, margin: 0 }}>
                  Saatler <strong>Profili Düzenle → Çalışma Saatleri</strong>’nden okunur. Orada gün/saatlerinizi ayarlayın; slotlar buna göre oluşur.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <button onClick={saveTakvim} disabled={takvimSaving}
              style={{ padding: '10px 20px', borderRadius: 11, border: 'none', background: A.accent, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: takvimSaving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: takvimSaving ? .6 : 1 }}>
              {takvimSaving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            {takvimMsg && <span style={{ fontSize: 13, fontWeight: 600, color: takvimMsg === 'Kaydedildi' ? '#1D7A3E' : '#C0392B' }}>{takvimMsg}</span>}
          </div>
        </div>

        {/* Kapalı / Dolu Saatler (yalnız takvim açıkken) */}
        {takvimAktif && (
          <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: A.text, letterSpacing: '-0.2px' }}>Kapalı / dolu saatler</div>
            <p style={{ fontSize: 13, color: A.muted, margin: '4px 0 14px', lineHeight: 1.5 }}>
              Bir gün seçin; müsait olmadığınız saatleri <strong>kapatın</strong> (kırmızı) — bu saatler hastalara gösterilmez. Gerçek randevular zaten otomatik dolar.
            </p>

            {(() => {
              const GUN_KISA = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
              const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
              const AY_TAM = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
              const isoOf = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const kapaliVar = (iso: string) => bloke.some(x => x === iso || x.startsWith(iso + ' '));
              const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
              const bugunIso = isoOf(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
              const bugunYM = bugun.getFullYear() * 12 + bugun.getMonth();
              // Ay içinde herhangi bir kapalı kaydı var mı? (yıl/ay rozeti için)
              const ayKapaliSayisi = (y: number, m: number) => {
                const pre = `${y}-${String(m + 1).padStart(2, '0')}-`;
                const set = new Set<string>();
                bloke.forEach(x => { if (x.startsWith(pre)) set.add(x.slice(0, 10)); });
                return set.size;
              };
              const btn = (label: string, mod: 'hafta' | 'ay' | 'yil') => (
                <button onClick={() => { setBlokeMod(mod); setRangeStart(''); setRangeEnd(''); setSaatDuzenle(false); setBlokeTarih(''); setBlokeMsg(''); }}
                  style={{ padding: '6px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, background: blokeMod === mod ? A.card : 'transparent', color: blokeMod === mod ? A.accent : A.muted, boxShadow: blokeMod === mod ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .12s' }}>{label}</button>
              );
              return (
                <>
                  {/* Mod seçici: Hafta · Ay · Yıl */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: A.muted }}>Gün seç</label>
                    <div style={{ display: 'inline-flex', background: A.page, borderRadius: 11, padding: 3, gap: 2 }}>
                      {btn('Hafta', 'hafta')}{btn('Ay', 'ay')}{btn('Yıl', 'yil')}
                    </div>
                  </div>

                  {/* HAFTA — 7 günlük şerit */}
                  {blokeMod === 'hafta' && (() => {
                    const days = Array.from({ length: 7 }, (_, i) => {
                      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + blokeOffset + i);
                      return { iso: isoOf(d.getFullYear(), d.getMonth(), d.getDate()), dow: d.getDay(), gun: d.getDate(), ay: d.getMonth() };
                    });
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => setBlokeOffset(o => Math.max(0, o - 7))} disabled={blokeOffset === 0} aria-label="Önceki günler"
                          style={{ flexShrink: 0, width: 34, height: 52, borderRadius: 11, border: `1px solid ${A.line}`, background: A.card, color: blokeOffset === 0 ? A.line : A.muted, cursor: blokeOffset === 0 ? 'default' : 'pointer', fontSize: 18, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                          {days.map(({ iso, dow, gun, ay }) => {
                            const aktif = blokeTarih === iso; const kv = kapaliVar(iso); const bg = iso === bugunIso;
                            return (
                              <button key={iso} onClick={() => { setBlokeTarih(iso); setBlokeMsg(''); }} title={iso}
                                style={{ position: 'relative', padding: '8px 2px', borderRadius: 12, border: `1.5px solid ${aktif ? A.accent : A.line}`, background: aktif ? A.accent : A.card, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all .12s' }}>
                                <span style={{ fontSize: 10.5, fontWeight: 600, color: aktif ? 'rgba(255,255,255,.75)' : A.muted, letterSpacing: '.3px' }}>{GUN_KISA[dow]}</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: aktif ? '#fff' : A.text, lineHeight: 1 }}>{gun}</span>
                                <span style={{ fontSize: 9.5, color: aktif ? 'rgba(255,255,255,.65)' : A.muted }}>{AY_KISA[ay]}</span>
                                {bg && <span style={{ fontSize: 8.5, fontWeight: 700, color: aktif ? '#fff' : A.accent, letterSpacing: '.3px' }}>BUGÜN</span>}
                                {kv && !aktif && <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} />}
                              </button>
                            );
                          })}
                        </div>
                        <button onClick={() => setBlokeOffset(o => o + 7)} aria-label="Sonraki günler"
                          style={{ flexShrink: 0, width: 34, height: 52, borderRadius: 11, border: `1px solid ${A.line}`, background: A.card, color: A.muted, cursor: 'pointer', fontSize: 18, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                      </div>
                    );
                  })()}

                  {/* AY — takvim ızgarası (Pzt→Paz) + tarih aralığı seçimi */}
                  {blokeMod === 'ay' && (() => {
                    const { y, m } = ayCursor;
                    const ilk = new Date(y, m, 1); const bosOncesi = (ilk.getDay() + 6) % 7; // Pzt=0
                    const gunSayisi = new Date(y, m + 1, 0).getDate();
                    const hucreler: ({ iso: string; gun: number; gecmis: boolean } | null)[] = [];
                    for (let i = 0; i < bosOncesi; i++) hucreler.push(null);
                    for (let d = 1; d <= gunSayisi; d++) { const iso = isoOf(y, m, d); hucreler.push({ iso, gun: d, gecmis: iso < bugunIso }); }
                    const buAyMi = (y * 12 + m) === bugunYM;
                    const raMin = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd) : rangeStart;
                    const raMax = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart) : rangeStart;
                    const fmtKisa = (iso: string) => { const [, mm, dd] = iso.split('-'); return `${Number(dd)} ${AY_KISA[Number(mm) - 1]}`; };
                    const tekGun = !!rangeStart && !rangeEnd;
                    const seciliIsos = rangeStart ? isoAralik(rangeStart, rangeEnd || rangeStart) : [];
                    const gunSayi = seciliIsos.length;
                    const anyKapali = seciliIsos.some(d => bloke.includes(d));
                    const allKapali = gunSayi > 0 && seciliIsos.every(d => bloke.includes(d));
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <button onClick={() => setAyCursor(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })} disabled={y * 12 + m <= bugunYM} aria-label="Önceki ay"
                            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: (y * 12 + m <= bugunYM) ? A.line : A.muted, cursor: (y * 12 + m <= bugunYM) ? 'default' : 'pointer', fontSize: 17, fontFamily: 'inherit' }}>‹</button>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: A.text }}>{AY_TAM[m]} {y}</div>
                          <button onClick={() => setAyCursor(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })} aria-label="Sonraki ay"
                            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: A.muted, cursor: 'pointer', fontSize: 17, fontFamily: 'inherit' }}>›</button>
                        </div>
                        <div style={{ fontSize: 11.5, color: A.muted, marginBottom: 8, lineHeight: 1.5 }}>
                          Bir güne tıklayın; aralık için ikinci güne tıklayın. Seçince kapat/aç düğmesi çıkar.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(g => <div key={g} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: A.muted, padding: '2px 0' }}>{g}</div>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                          {hucreler.map((c, i) => {
                            if (!c) return <div key={'b' + i} />;
                            const kv = kapaliVar(c.iso); const tumGun = bloke.includes(c.iso); const bg = c.iso === bugunIso;
                            const uc = c.iso === rangeStart || c.iso === rangeEnd;   // seçim uç noktası
                            const ic = !!rangeStart && ((rangeEnd && c.iso >= raMin! && c.iso <= raMax!) || c.iso === rangeStart);  // seçim içi
                            const arka = uc ? A.accent : (ic ? '#E8EEF7' : (tumGun ? '#FEF2F2' : A.card));
                            const yazi = c.gecmis ? A.line : (uc ? '#fff' : (ic ? A.accent : (tumGun ? '#B91C1C' : A.text)));
                            const kenar = (uc || ic || bg) ? A.accent : A.line;
                            return (
                              <button key={c.iso} disabled={c.gecmis} title={c.iso}
                                onClick={() => {
                                  if (c.gecmis) return;
                                  setBlokeMsg(''); setSaatDuzenle(false);
                                  if (!rangeStart || (rangeStart && rangeEnd)) { setRangeStart(c.iso); setRangeEnd(''); }
                                  else if (c.iso === rangeStart) { setRangeStart(''); setRangeEnd(''); }   // aynı güne tekrar → seçimi kaldır
                                  else { setRangeEnd(c.iso); }
                                }}
                                style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 10, border: `1.5px solid ${kenar}`, background: arka, color: yazi, cursor: c.gecmis ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: c.gecmis ? .5 : 1 }}>
                                {c.gun}
                                {kv && !uc && !ic && !tumGun && <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: '#DC2626' }} />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Airbnb tarzı otomatik aksiyon çubuğu — gün/aralık seçilince çıkar */}
                        {rangeStart && (
                          <div style={{ marginTop: 14, background: A.card, border: `1px solid ${A.line}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', boxShadow: '0 6px 20px rgba(0,0,0,.08)' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: A.text }}>
                                {tekGun ? fmtKisa(rangeStart) : `${fmtKisa(raMin!)} – ${fmtKisa(raMax!)}`}
                              </div>
                              <div style={{ fontSize: 11.5, color: A.muted, marginTop: 1 }}>
                                {tekGun ? (allKapali ? 'Bu gün kapalı' : 'Bu gün açık') : `${gunSayi} gün${allKapali ? ' · tümü kapalı' : (anyKapali ? ' · bazıları kapalı' : '')}`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              {tekGun && !saatDuzenle && (
                                <button onClick={() => { setBlokeTarih(rangeStart); setSaatDuzenle(true); }}
                                  style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: A.text, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Saat saat düzenle</button>
                              )}
                              {!allKapali && (
                                <button onClick={() => applyRange(true)} disabled={blokeSaving}
                                  style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#B91C1C', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: blokeSaving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: blokeSaving ? .6 : 1 }}>
                                  {blokeSaving ? 'Kaydediliyor…' : (tekGun ? 'Bu tarihi kapat' : `${gunSayi} günü kapat`)}
                                </button>
                              )}
                              {anyKapali && (
                                <button onClick={() => applyRange(false)} disabled={blokeSaving}
                                  style={{ padding: '10px 18px', borderRadius: 10, border: allKapali ? 'none' : `1px solid ${A.line}`, background: allKapali ? '#059669' : A.card, color: allKapali ? '#fff' : A.text, fontSize: 13.5, fontWeight: 700, cursor: blokeSaving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: blokeSaving ? .6 : 1 }}>
                                  {tekGun ? 'Bu tarihi aç' : `${gunSayi} günü aç`}
                                </button>
                              )}
                              <button onClick={() => { setRangeStart(''); setRangeEnd(''); setSaatDuzenle(false); setBlokeTarih(''); }} aria-label="Seçimi temizle"
                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'transparent', color: A.muted, fontSize: 17, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>✕</button>
                            </div>
                          </div>
                        )}
                        {!buAyMi && !rangeStart && <button onClick={() => setAyCursor({ y: bugun.getFullYear(), m: bugun.getMonth() })} style={{ marginTop: 8, background: 'none', border: 'none', color: A.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Bu aya dön</button>}
                      </div>
                    );
                  })()}

                  {/* YIL — 12 ay; aya tıkla → Ay görünümü */}
                  {blokeMod === 'yil' && (() => {
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <button onClick={() => setYilCursor(v => Math.max(bugun.getFullYear(), v - 1))} disabled={yilCursor <= bugun.getFullYear()} aria-label="Önceki yıl"
                            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: yilCursor <= bugun.getFullYear() ? A.line : A.muted, cursor: yilCursor <= bugun.getFullYear() ? 'default' : 'pointer', fontSize: 17, fontFamily: 'inherit' }}>‹</button>
                          <div style={{ fontSize: 15, fontWeight: 800, color: A.text }}>{yilCursor}</div>
                          <button onClick={() => setYilCursor(v => v + 1)} aria-label="Sonraki yıl"
                            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${A.line}`, background: A.card, color: A.muted, cursor: 'pointer', fontSize: 17, fontFamily: 'inherit' }}>›</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {AY_TAM.map((ad, mi) => {
                            const gecmis = (yilCursor * 12 + mi) < bugunYM;
                            const say = ayKapaliSayisi(yilCursor, mi);
                            const buAy = (yilCursor * 12 + mi) === bugunYM;
                            return (
                              <button key={ad} onClick={() => { if (!gecmis) { setAyCursor({ y: yilCursor, m: mi }); setBlokeMod('ay'); } }} disabled={gecmis}
                                style={{ position: 'relative', padding: '16px 8px', borderRadius: 12, border: `1.5px solid ${buAy ? A.accent : A.line}`, background: A.card, color: gecmis ? A.line : A.text, cursor: gecmis ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, opacity: gecmis ? .5 : 1, textAlign: 'center' }}>
                                {ad}
                                {say > 0 && <span style={{ position: 'absolute', top: 7, right: 7, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#DC2626', color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{say}</span>}
                                {buAy && <div style={{ fontSize: 9, fontWeight: 700, color: A.accent, marginTop: 3, letterSpacing: '.3px' }}>BU AY</div>}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 11.5, color: A.muted, marginTop: 10, lineHeight: 1.5 }}>Kırmızı rozet o aydaki kapalı gün sayısıdır. Düzenlemek için aya tıklayın.</div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}

            {blokeTarih && (blokeMod === 'hafta' || saatDuzenle) && (() => {
              const saatler = gunSaatleri(blokeTarih);
              return (
                <div style={{ marginTop: 14 }}>
                  <button onClick={toggleGun}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `1px solid ${gunKapali ? '#FCA5A5' : A.line}`, background: gunKapali ? '#FEF2F2' : A.card, color: gunKapali ? '#B91C1C' : A.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
                    {gunKapali ? '● Tüm gün kapalı — geri aç' : 'Tüm günü kapat'}
                  </button>

                  {gunKapali ? (
                    <div style={{ fontSize: 13, color: A.muted }}>Bu gün tamamen kapalı; hiç randevu alınmaz.</div>
                  ) : saatler.length === 0 ? (
                    <div style={{ fontSize: 13, color: A.muted }}>Bu gün çalışma saatlerinizde kapalı. (Çalışma Saatleri’nden ayarlanır.)</div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(66px, 1fr))', gap: 8 }}>
                        {saatler.map(s => {
                          const kapali = bloke.includes(`${blokeTarih} ${s}`);
                          return (
                            <button key={s} onClick={() => toggleSlot(s)}
                              title={kapali ? 'Kapalı — açmak için tıklayın' : 'Açık — kapatmak için tıklayın'}
                              style={{ padding: '9px 4px', borderRadius: 9, border: `1px solid ${kapali ? '#FCA5A5' : '#BBF7D0'}`, background: kapali ? '#FEF2F2' : '#F0FDF4', color: kapali ? '#B91C1C' : '#166534', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: kapali ? 'line-through' : 'none' }}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 11.5, color: A.muted, marginTop: 8 }}>Yeşil = açık · Kırmızı = kapalı. Tıklayarak değiştirin.</div>
                    </>
                  )}
                </div>
              );
            })()}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button onClick={() => saveBloke()} disabled={blokeSaving}
                style={{ padding: '10px 20px', borderRadius: 11, border: 'none', background: A.accent, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: blokeSaving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: blokeSaving ? .6 : 1 }}>
                {blokeSaving ? 'Kaydediliyor…' : 'Kapalı saatleri kaydet'}
              </button>
              {blokeMsg && <span style={{ fontSize: 13, fontWeight: 600, color: blokeMsg === 'Kaydedildi' ? '#1D7A3E' : '#C0392B' }}>{blokeMsg}</span>}
              {bloke.length > 0 && <span style={{ fontSize: 12, color: A.muted }}>{bloke.length} kapalı kayıt</span>}
            </div>
          </div>
        )}

        {/* Bildirim e-postası ayarı */}
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: A.text, letterSpacing: '-0.2px' }}>Randevu bildirim e-postası</div>
          <p style={{ fontSize: 13, color: A.muted, margin: '4px 0 14px', lineHeight: 1.5 }}>Yeni randevu talepleri hangi e-posta adresine gelsin?</p>
          <div style={{ display: 'inline-flex', background: A.page, borderRadius: 11, padding: 3, gap: 2, marginBottom: 14 }}>
            {([['same', 'Hesabımla aynı'], ['custom', 'Farklı adres']] as const).map(([m, lbl]) => {
              const on = notifyMode === m;
              return (
                <button key={m} onClick={() => { setNotifyMode(m); setNotifyMsg(''); }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 700 : 500,
                    background: on ? A.card : 'transparent', color: on ? A.text : A.muted, boxShadow: on ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
                  {lbl}
                </button>
              );
            })}
          </div>
          {notifyMode === 'custom' && (
            <input type="email" value={notifyEmail} onChange={e => { setNotifyEmail(e.target.value); setNotifyMsg(''); }}
              placeholder="ornek@mail.com" autoComplete="email"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: `1px solid ${A.line}`, fontSize: 14, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none', marginBottom: 12 }} />
          )}
          {notifyMode === 'same' && (
            <p style={{ fontSize: 12.5, color: A.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Bildirimler, işletmeyi sahiplendiğiniz hesabın e-posta adresine gönderilir.</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={saveNotify} disabled={notifySaving}
              style={{ padding: '10px 20px', borderRadius: 11, border: 'none', background: A.accent, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: notifySaving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: notifySaving ? .6 : 1 }}>
              {notifySaving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            {notifyMsg && <span style={{ fontSize: 13, fontWeight: 600, color: notifyMsg === 'Kaydedildi' ? '#1D7A3E' : '#C0392B' }}>{notifyMsg}</span>}
          </div>
        </div>

        {/* Canlı önizleme */}
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: A.muted, marginBottom: 12 }}>Önizleme</div>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${A.line}`, background: A.page }}>
            <iframe src={src} style={{ width: '100%', height: 560, border: 0, display: 'block' }} title="Randevu önizleme" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HASTALARIM TAB — telefona göre hasta listesi + geçmiş + kalıcı not
═══════════════════════════════════════════════ */
function HastalarTab({ approvedClaims }: { approvedClaims: ClaimRequest[] }) {
  const [talepler, setTalepler] = useState<RandevuTalep[]>([]);
  const [notlar, setNotlar] = useState<Record<string, { entity_id: string; tel: string; notlar: string | null; etiketler?: string[] }>>({}); // key: entity_id|tel
  const [draftEtiket, setDraftEtiket] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [openTel, setOpenTel] = useState<string | null>(null);
  const [draftNot, setDraftNot] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [view, setView] = useState<'hastalar' | 'ajanda'>('hastalar');
  type EntCfg = { name: string; calisma: string; slotDk: number; acik24: boolean; bloke: string[]; aktif: boolean };
  const [cfgMap, setCfgMap] = useState<Record<string, EntCfg>>({});   // entity_id → config
  const [calEntity, setCalEntity] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [calSaving, setCalSaving] = useState(false);
  const [addSlot, setAddSlot] = useState<{ iso: string; time: string } | null>(null);
  const [addAd, setAddAd] = useState('');
  const [addTel, setAddTel] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  type Islem = { id: string; entity_id: string; tel: string; tarih: string | null; islem: string; notlar: string | null; ucret: number | null };
  const [islemler, setIslemler] = useState<Record<string, Islem[]>>({});   // key: entity_id|tel
  const [isTarih, setIsTarih] = useState('');
  const [isAd, setIsAd] = useState('');
  const [isNot, setIsNot] = useState('');
  const [isUcret, setIsUcret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  type Dosya = { id: string; entity_id: string; tel: string; ad: string | null; tip: string | null; boyut: number | null; created_at: string };
  const [dosyalar, setDosyalar] = useState<Record<string, Dosya[]>>({});   // key: entity_id|tel
  const [uploading, setUploading] = useState(false);
  const [silTel, setSilTel] = useState('');   // silinmekte olan hasta telefonu (spinner)

  const hasEntities = approvedClaims.some(c => c.entity_id && c.entity_id !== 'new');
  const A = { page: '#F5F5F7', card: '#FFFFFF', text: '#1D1D1F', muted: '#86868B', line: '#E5E5EA', accent: T.navy, green: '#34C759' };
  const TAGS: { ad: string; bg: string; fg: string }[] = [
    { ad: 'Yeni hasta', bg: '#EFF6FF', fg: '#1D4ED8' },
    { ad: 'Tedavi sürüyor', bg: '#FEF3C7', fg: '#92400E' },
    { ad: 'VIP', bg: '#F3E8FF', fg: '#7C3AED' },
    { ad: 'Takip', bg: '#ECFDF5', fg: '#065F46' },
    { ad: 'Borçlu', bg: '#FEF2F2', fg: '#B91C1C' },
  ];
  const tagStil = (ad: string) => TAGS.find(t => t.ad === ad) || { bg: '#F1F1F4', fg: '#4B5563' };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          fetch('/api/panel/randevu-talepleri').then(r => r.ok ? r.json() : { talepler: [] }),
          fetch('/api/panel/hasta-notu').then(r => r.ok ? r.json() : { hastalar: [] }),
          fetch('/api/panel/hasta-islem').then(r => r.ok ? r.json() : { islemler: [] }),
          fetch('/api/panel/hasta-dosya').then(r => r.ok ? r.json() : { dosyalar: [] }),
        ]);
        setTalepler(r1.talepler || []);
        const nm: Record<string, any> = {};
        (r2.hastalar || []).forEach((h: any) => { nm[`${h.entity_id}|${String(h.tel).replace(/\D/g, '')}`] = h; });
        setNotlar(nm);
        const im: Record<string, Islem[]> = {};
        (r3.islemler || []).forEach((x: Islem) => { const k = `${x.entity_id}|${String(x.tel).replace(/\D/g, '')}`; (im[k] = im[k] || []).push(x); });
        setIslemler(im);
        const dm: Record<string, Dosya[]> = {};
        (r4.dosyalar || []).forEach((x: Dosya) => { const k = `${x.entity_id}|${String(x.tel).replace(/\D/g, '')}`; (dm[k] = dm[k] || []).push(x); });
        setDosyalar(dm);

        // İşletmelerin randevu ayarlarını çek (takvim için)
        const ents = approvedClaims.filter(c => c.entity_id && c.entity_id !== 'new');
        const TM: Record<string, string> = { klinik: 'klinikler', hastane: 'hastaneler', doktor: 'doktorlar', eczane: 'eczaneler' };
        const sb = createSupabaseBrowser();
        const cm: Record<string, EntCfg> = {};
        await Promise.all(ents.map(async c => {
          const tbl = TM[c.entity_type]; if (!tbl) return;
          const { data } = await sb.from(tbl).select('calisma_saatleri,acik_24_saat,randevu_slot_dk,randevu_bloke,randevu_aktif').eq('id', c.entity_id!).maybeSingle();
          const d = (data as any) || {};
          cm[c.entity_id!] = { name: c.entity_name || '', calisma: String(d.calisma_saatleri || ''), slotDk: Number(d.randevu_slot_dk) || 30, acik24: d.acik_24_saat === true, bloke: Array.isArray(d.randevu_bloke) ? d.randevu_bloke.map(String) : [], aktif: d.randevu_aktif === true };
        }));
        setCfgMap(cm);
        if (ents[0]?.entity_id) setCalEntity(ents[0].entity_id);
      } catch { setTalepler([]); }
      setLoading(false);
    })();
  }, []);

  const fmt = (s: string) => { try { return new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return s; } };
  const DURUM: Record<string, string> = { yeni: 'Yeni', arandi: 'Arandı', tamamlandi: 'Tamamlandı', iptal: 'İptal' };
  const entityNames = Array.from(new Set(talepler.map(t => t.entity_name)));

  // ── Takvim yardımcıları ──
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const isoOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const GUN_ADI = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  function gunSaatleri(cfg: EntCfg | undefined, iso: string): string[] {
    if (!cfg) return [];
    const dt = new Date(iso + 'T00:00:00'); const gun = GUN_ADI[dt.getDay()];
    let o = '09:00', c = '18:00', acikGun = true;
    if (cfg.acik24) { o = '08:00'; c = '22:00'; }
    else {
      let sch: Record<string, { acik?: boolean; baslangic?: string; bitis?: string }> = {};
      try { sch = cfg.calisma ? JSON.parse(cfg.calisma) : {}; } catch { sch = {}; }
      if (sch && sch[gun]) { acikGun = sch[gun].acik !== false; o = sch[gun].baslangic || '09:00'; c = sch[gun].bitis || '18:00'; }
      else if (cfg.calisma) { acikGun = false; } else { acikGun = dt.getDay() !== 0; }
    }
    if (!acikGun) return [];
    let t = (+o.split(':')[0]) * 60 + (+o.split(':')[1]); const end = (+c.split(':')[0]) * 60 + (+c.split(':')[1]); const dk = cfg.slotDk || 30; const out: string[] = [];
    while (t + dk <= end) { out.push(pad2(Math.floor(t / 60)) + ':' + pad2(t % 60)); t += dk; }
    return out;
  }
  async function saveBlokeCal(entityId: string, yeni: string[]) {
    setCfgMap(p => ({ ...p, [entityId]: { ...p[entityId], bloke: yeni } }));   // optimistik
    setCalSaving(true);
    try {
      const ent = approvedClaims.find(c => c.entity_id === entityId);
      await fetch('/api/panel/update-entity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: ent?.entity_type, entityId, fields: { randevu_bloke: yeni } }),
      });
    } catch { /* yoksay */ }
    setCalSaving(false);
  }
  async function addRandevu() {
    if (!addSlot) return;
    if (addAd.trim().length < 2) { setAddMsg('Ad soyad girin.'); return; }
    if (addTel.replace(/\D/g, '').length < 10) { setAddMsg('Geçerli telefon girin.'); return; }
    setAddSaving(true); setAddMsg('');
    try {
      const ent = approvedClaims.find(c => c.entity_id === calEntity);
      const slot = `${addSlot.iso} ${addSlot.time}`;
      const res = await fetch('/api/panel/randevu-ekle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: calEntity, entityType: ent?.entity_type, entityName: cfgMap[calEntity]?.name, ad_soyad: addAd.trim(), tel: addTel.trim(), randevu_slot: slot }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok && d.talep) { setTalepler(p => [d.talep, ...p]); setAddSlot(null); setAddAd(''); setAddTel(''); }
      else setAddMsg(d.error || 'Eklenemedi');
    } catch { setAddMsg('Bağlantı hatası'); }
    setAddSaving(false);
  }

  // Telefona göre benzersiz hastalar
  const hastalar = (() => {
    const map: Record<string, { tel: string; ad: string; email: string | null; entity_id: string; entity_name: string; kayitlar: RandevuTalep[] }> = {};
    talepler.forEach(t => {
      const tel = (t.tel || '').replace(/\D/g, ''); if (!tel) return;
      if (!map[tel]) map[tel] = { tel, ad: t.ad_soyad, email: t.email || null, entity_id: t.entity_id, entity_name: t.entity_name, kayitlar: [] };
      map[tel].kayitlar.push(t);
      // en güncel bilgiyi tut (talepler zaten created_at desc geliyor → ilk gelen en yeni)
      if (!map[tel].email && t.email) map[tel].email = t.email;
    });
    return Object.values(map)
      .map(h => ({ ...h, kayitlar: h.kayitlar.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)), son: h.kayitlar[0]?.created_at }))
      .sort((a, b) => (a.son! < b.son! ? 1 : -1));
  })();

  const filtered = hastalar.filter(h => {
    if (tagFilter) { const tags = notlar[`${h.entity_id}|${h.tel}`]?.etiketler || []; if (!tags.includes(tagFilter)) return false; }
    const s = q.trim().toLowerCase(); if (!s) return true;
    return h.ad.toLowerCase().includes(s) || h.tel.includes(s.replace(/\D/g, ''));
  });

  function disaAktar() {
    const esc = (v: string) => `"${String(v || '').replace(/"/g, '""')}"`;
    const head = ['Ad Soyad', 'Telefon', 'E-posta', 'Randevu sayısı', 'Son ziyaret', 'Etiketler', 'Not'];
    const rows = filtered.map(h => {
      const rec = notlar[`${h.entity_id}|${h.tel}`];
      return [h.ad, h.tel, h.email || '', String(h.kayitlar.length), h.son ? fmt(h.son) : '', (rec?.etiketler || []).join(', '), rec?.notlar || ''].map(esc).join(',');
    });
    const csv = '﻿' + [head.map(esc).join(','), ...rows].join('\r\n');   // BOM → Excel Türkçe
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = `hastalar-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function saveNot(h: { entity_id: string; tel: string; ad: string; email: string | null }) {
    setSaving(true); setSavedMsg('');
    try {
      const res = await fetch('/api/panel/hasta-notu', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: h.entity_id, tel: h.tel, ad: h.ad, email: h.email, notlar: draftNot, etiketler: draftEtiket }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setNotlar(p => ({ ...p, [`${h.entity_id}|${h.tel}`]: { entity_id: h.entity_id, tel: h.tel, notlar: draftNot, etiketler: draftEtiket } }));
        setSavedMsg('Kaydedildi');
      } else setSavedMsg(j.error || 'Kaydedilemedi');
    } catch { setSavedMsg('Bağlantı hatası'); }
    setSaving(false);
  }

  async function addIslem(h: { entity_id: string; tel: string }) {
    if (!isAd.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/panel/hasta-islem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: h.entity_id, tel: h.tel, tarih: isTarih || undefined, islem: isAd.trim(), notlar: isNot.trim() || null, ucret: isUcret }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok && j.islem) {
        const k = `${h.entity_id}|${h.tel}`;
        setIslemler(p => ({ ...p, [k]: [j.islem, ...(p[k] || [])] }));
        setIsAd(''); setIsNot(''); setIsUcret(''); setIsTarih('');
      } else alert(j.error || 'İşlem eklenemedi.');
    } catch { alert('Bağlantı hatası.'); }
    setIsSaving(false);
  }
  async function delIslem(h: { entity_id: string; tel: string }, id: string) {
    try {
      const res = await fetch(`/api/panel/hasta-islem?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) { const k = `${h.entity_id}|${h.tel}`; setIslemler(p => ({ ...p, [k]: (p[k] || []).filter(x => x.id !== id) })); }
    } catch { /* yoksay */ }
  }
  const tl = (n: number | null) => n == null ? '' : n.toLocaleString('tr-TR') + ' ₺';

  // Hastayı sistemden tamamen sil (randevu talepleri + not + işlem + dosyalar). Geri alınamaz.
  async function silHasta(h: { tel: string; ad: string }) {
    if (!window.confirm(`"${h.ad || 'Bu hasta'}" sistemden kalıcı olarak silinsin mi?\n\nRandevu talepleri, notlar, işlem/tedavi geçmişi ve dosyalar dahil TÜM kayıtları silinir. Bu işlem geri alınamaz.`)) return;
    setSilTel(h.tel);
    try {
      const res = await fetch('/api/panel/hasta-sil', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel: h.tel }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        const norm = h.tel.replace(/\D/g, '');
        // Yerel state'i temizle → kart kaybolur
        setTalepler(p => p.filter(t => String(t.tel || '').replace(/\D/g, '') !== norm));
        setNotlar(p => { const n = { ...p }; Object.keys(n).forEach(k => { if (k.endsWith('|' + norm)) delete n[k]; }); return n; });
        setIslemler(p => { const n = { ...p }; Object.keys(n).forEach(k => { if (k.endsWith('|' + norm)) delete n[k]; }); return n; });
        setDosyalar(p => { const n = { ...p }; Object.keys(n).forEach(k => { if (k.endsWith('|' + norm)) delete n[k]; }); return n; });
        if (openTel === h.tel) setOpenTel(null);
      } else alert(j.error || 'Hasta silinemedi.');
    } catch { alert('Bağlantı hatası.'); }
    setSilTel('');
  }

  async function uploadDosya(h: { entity_id: string; tel: string }, file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('entityId', h.entity_id); fd.append('tel', h.tel);
      const res = await fetch('/api/panel/hasta-dosya', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok && j.dosya) { const k = `${h.entity_id}|${h.tel}`; setDosyalar(p => ({ ...p, [k]: [j.dosya, ...(p[k] || [])] })); }
      else alert(j.error || 'Yükleme başarısız.');
    } catch { alert('Bağlantı hatası.'); }
    setUploading(false);
  }
  function pickDosya(h: { entity_id: string; tel: string }) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,application/pdf';
    inp.onchange = () => { const f = inp.files?.[0]; if (f) uploadDosya(h, f); };
    inp.click();
  }
  async function gorDosya(id: string) {
    try {
      const res = await fetch(`/api/panel/hasta-dosya?signed=${encodeURIComponent(id)}`);
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.url) window.open(j.url, '_blank', 'noopener'); else alert(j.error || 'Açılamadı.');
    } catch { alert('Bağlantı hatası.'); }
  }
  async function delDosya(h: { entity_id: string; tel: string }, id: string) {
    if (!confirm('Bu dosyayı kalıcı olarak silmek istiyor musunuz?')) return;
    try {
      const res = await fetch(`/api/panel/hasta-dosya?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) { const k = `${h.entity_id}|${h.tel}`; setDosyalar(p => ({ ...p, [k]: (p[k] || []).filter(x => x.id !== id) })); }
    } catch { /* yoksay */ }
  }

  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 11, border: `1px solid ${A.line}`, fontSize: 14, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none' };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: A.text, margin: 0, letterSpacing: '-0.6px' }}>Hastalarım</h1>
        <p style={{ fontSize: 14, color: A.muted, marginTop: 5 }}>Randevu bırakan hastalarınız telefona göre burada listelenir; her hastaya özel not tutabilirsiniz.</p>
      </div>

      {hasEntities && !loading && (
        <div style={{ display: 'inline-flex', background: A.page, borderRadius: 11, padding: 3, gap: 2, marginBottom: 16 }}>
          {([['hastalar', 'Hastalar'], ['ajanda', 'Randevu Takvimi']] as const).map(([v, lbl]) => {
            const on = view === v;
            return (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 700 : 500, background: on ? A.card : 'transparent', color: on ? A.text : A.muted, boxShadow: on ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
                {lbl}
              </button>
            );
          })}
        </div>
      )}

      {!hasEntities ? (
        <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: '48px 24px', textAlign: 'center', color: A.muted, fontSize: 14 }}>
          Hastalarınızı görebilmek için önce bir işletmenizin sahipliğini onaylatın.
        </div>
      ) : loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: A.muted, fontSize: 14 }}>Yükleniyor…</div>
      ) : view === 'hastalar' ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Hasta ara — isim veya telefon…" style={{ ...inp, flex: 1 }} />
            <button onClick={disaAktar} title="Görünen hastaları CSV/Excel indir"
              style={{ padding: '11px 16px', borderRadius: 11, border: `1px solid ${A.line}`, background: A.card, color: A.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Excel’e aktar</button>
          </div>
          {/* Etiket filtresi */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button onClick={() => setTagFilter('')} style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${tagFilter === '' ? A.accent : A.line}`, background: tagFilter === '' ? 'rgba(27,58,105,.07)' : A.card, color: tagFilter === '' ? A.accent : A.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Tümü</button>
            {TAGS.map(tg => (
              <button key={tg.ad} onClick={() => setTagFilter(tagFilter === tg.ad ? '' : tg.ad)}
                style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${tagFilter === tg.ad ? tg.fg : A.line}`, background: tagFilter === tg.ad ? tg.bg : A.card, color: tagFilter === tg.ad ? tg.fg : A.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{tg.ad}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: '40px 24px', textAlign: 'center', color: A.muted, fontSize: 14 }}>
              {hastalar.length === 0 ? 'Henüz kayıtlı hasta yok. Randevu talepleri geldikçe burada birikir.' : 'Aramanıza uygun hasta yok.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12.5, color: A.muted, marginBottom: 2 }}>{filtered.length} hasta</div>
              {filtered.map(h => {
                const acik = openTel === h.tel;
                const notKey = `${h.entity_id}|${h.tel}`;
                const mevcutNot = notlar[notKey]?.notlar || '';
                return (
                  <div key={h.tel} style={{ background: A.card, borderRadius: 16, border: `1px solid ${A.line}`, boxShadow: '0 1px 2px rgba(0,0,0,.03)', overflow: 'hidden' }}>
                    <button onClick={() => { const willOpen = !acik; setOpenTel(willOpen ? h.tel : null); if (willOpen) { setDraftNot(mevcutNot); setDraftEtiket(notlar[notKey]?.etiketler || []); setSavedMsg(''); setIsAd(''); setIsNot(''); setIsUcret(''); setIsTarih(''); } }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: A.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 700, color: A.accent }}>
                        {(h.ad || '?').trim().charAt(0).toLocaleUpperCase('tr')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15.5, fontWeight: 600, color: A.text, letterSpacing: '-0.2px' }}>{h.ad}</span>
                          {(notlar[notKey]?.etiketler || []).map(et => { const s = tagStil(et); return <span key={et} style={{ fontSize: 10.5, fontWeight: 700, color: s.fg, background: s.bg, borderRadius: 6, padding: '1px 7px' }}>{et}</span>; })}
                        </div>
                        <div style={{ fontSize: 12.5, color: A.muted, marginTop: 1 }}>{h.tel}{h.email ? ' · ' + h.email : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: A.accent }}>{h.kayitlar.length} randevu</div>
                        <div style={{ fontSize: 11.5, color: A.muted }}>son: {fmt(h.son!)}</div>
                      </div>
                      {mevcutNot && !acik && <span title="Not var" style={{ width: 8, height: 8, borderRadius: '50%', background: A.green, flexShrink: 0 }} />}
                    </button>

                    {acik && (
                      <div style={{ borderTop: `1px solid ${A.line}`, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Geçmiş */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: A.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Randevu geçmişi</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {h.kayitlar.map(k => (
                              <div key={k.id} style={{ background: A.page, borderRadius: 10, padding: '9px 12px', fontSize: 13, color: A.text }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                  <span style={{ fontWeight: 600 }}>{k.randevu_slot ? k.randevu_slot : fmt(k.created_at)}</span>
                                  <span style={{ color: A.muted, fontSize: 12 }}>{DURUM[k.status] || k.status}</span>
                                </div>
                                {(k.tercih && !k.randevu_slot) && <div style={{ color: A.muted, fontSize: 12, marginTop: 2 }}>Tercih: {k.tercih}</div>}
                                {k.mesaj && <div style={{ color: A.muted, fontSize: 12, marginTop: 2 }}>Not: {k.mesaj}</div>}
                                {k.sahip_notu && <div style={{ color: A.accent, fontSize: 12, marginTop: 2 }}>Sizin notunuz: {k.sahip_notu}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Etiketler */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: A.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Etiketler</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {TAGS.map(tg => {
                              const on = draftEtiket.includes(tg.ad);
                              return (
                                <button key={tg.ad} onClick={() => { setDraftEtiket(p => p.includes(tg.ad) ? p.filter(x => x !== tg.ad) : [...p, tg.ad]); setSavedMsg(''); }}
                                  style={{ padding: '6px 13px', borderRadius: 999, border: `1.5px solid ${on ? tg.fg : A.line}`, background: on ? tg.bg : A.card, color: on ? tg.fg : A.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                  {on ? '✓ ' : ''}{tg.ad}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 11, color: A.muted, marginTop: 6 }}>Etiketi seçip aşağıdaki “Notu kaydet” ile kaydedin.</div>
                        </div>

                        {/* Kalıcı hasta notu */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: A.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Hasta notu <span style={{ textTransform: 'none', fontWeight: 500 }}>· yalnız siz görürsünüz</span></div>
                          <textarea value={draftNot} onChange={e => { setDraftNot(e.target.value); setSavedMsg(''); }} rows={3}
                            placeholder="Tedavi geçmişi, alerji, yapılan işlemler, önemli notlar…"
                            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <button onClick={() => saveNot(h)} disabled={saving}
                              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: A.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? .6 : 1 }}>
                              {saving ? 'Kaydediliyor…' : 'Notu kaydet'}
                            </button>
                            {h.email && <a href={`mailto:${h.email}`} style={{ fontSize: 13, fontWeight: 600, color: A.accent, textDecoration: 'none' }}>E-posta gönder</a>}
                            <a href={`tel:${h.tel}`} style={{ fontSize: 13, fontWeight: 600, color: A.accent, textDecoration: 'none' }}>Ara</a>
                            {savedMsg && <span style={{ fontSize: 12.5, fontWeight: 600, color: savedMsg === 'Kaydedildi' ? '#1D7A3E' : '#C0392B' }}>{savedMsg}</span>}
                          </div>
                        </div>

                        {/* İşlem / tedavi geçmişi */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: A.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>İşlemler / tedavi geçmişi</div>
                          {(() => {
                            const k = `${h.entity_id}|${h.tel}`;
                            const list = islemler[k] || [];
                            const toplam = list.reduce((s, x) => s + (x.ucret || 0), 0);
                            return (
                              <>
                                {list.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                    {list.map(x => (
                                      <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: A.page, borderRadius: 10, padding: '9px 12px' }}>
                                        <div style={{ fontSize: 12, color: A.muted, minWidth: 66, flexShrink: 0 }}>{x.tarih ? new Date(x.tarih + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: '2-digit' }) : ''}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ fontSize: 13.5, fontWeight: 600, color: A.text }}>{x.islem}</div>
                                          {x.notlar && <div style={{ fontSize: 12, color: A.muted }}>{x.notlar}</div>}
                                        </div>
                                        {x.ucret != null && <div style={{ fontSize: 13, fontWeight: 700, color: A.text, flexShrink: 0 }}>{tl(x.ucret)}</div>}
                                        <button onClick={() => delIslem(h, x.id)} title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontSize: 16, padding: 0, flexShrink: 0 }}>×</button>
                                      </div>
                                    ))}
                                    {toplam > 0 && <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: A.accent, marginTop: 2 }}>Toplam: {tl(toplam)}</div>}
                                  </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <input type="date" value={isTarih} onChange={e => setIsTarih(e.target.value)} style={inp} />
                                  <input value={isUcret} onChange={e => setIsUcret(e.target.value)} type="number" placeholder="Ücret (₺)" style={inp} />
                                  <input value={isAd} onChange={e => setIsAd(e.target.value)} placeholder="İşlem (ör. Dolgu, İmplant)" style={{ ...inp, gridColumn: '1 / -1' }} />
                                  <input value={isNot} onChange={e => setIsNot(e.target.value)} placeholder="Not (isteğe bağlı)" style={{ ...inp, gridColumn: '1 / -1' }} />
                                </div>
                                <button onClick={() => addIslem(h)} disabled={isSaving || !isAd.trim()}
                                  style={{ marginTop: 8, padding: '8px 16px', borderRadius: 10, border: 'none', background: A.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: (isSaving || !isAd.trim()) ? 'default' : 'pointer', fontFamily: 'inherit', opacity: (isSaving || !isAd.trim()) ? .6 : 1 }}>
                                  {isSaving ? 'Ekleniyor…' : 'İşlem ekle'}
                                </button>
                              </>
                            );
                          })()}
                        </div>

                        {/* Hasta dosyaları — röntgen / foto (özel, güvenli) */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: A.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Dosyalar <span style={{ textTransform: 'none', fontWeight: 500 }}>· röntgen, foto, reçete</span></div>
                          {(() => {
                            const k = `${h.entity_id}|${h.tel}`;
                            const list = dosyalar[k] || [];
                            return (
                              <>
                                {list.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                                    {list.map(f => (
                                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: A.page, borderRadius: 10, padding: '9px 12px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ fontSize: 13.5, fontWeight: 600, color: A.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.ad || 'Dosya'}</div>
                                          <div style={{ fontSize: 11.5, color: A.muted }}>{f.tip?.includes('pdf') ? 'PDF' : 'Görsel'}{f.boyut ? ` · ${Math.round(f.boyut / 1024)} KB` : ''}</div>
                                        </div>
                                        <button onClick={() => gorDosya(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.accent, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', flexShrink: 0 }}>Görüntüle</button>
                                        <button onClick={() => delDosya(h, f.id)} title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontSize: 16, padding: 0, flexShrink: 0 }}>×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button onClick={() => pickDosya(h)} disabled={uploading}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 10, border: `1.5px dashed ${A.line}`, background: 'transparent', color: A.accent, fontSize: 13, fontWeight: 600, cursor: uploading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: uploading ? .6 : 1 }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                  {uploading ? 'Yükleniyor…' : 'Dosya ekle (röntgen / foto / PDF)'}
                                </button>
                                <div style={{ fontSize: 11, color: A.muted, marginTop: 7, lineHeight: 1.5 }}>Dosyalar özel/güvenli alanda tutulur; görüntüleme bağlantısı yalnız size ve kısa süre geçerlidir (KVKK — hassas sağlık verisi).</div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Tehlikeli alan — hastayı sistemden sil */}
                        <div style={{ borderTop: `1px solid ${A.line}`, paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 11.5, color: A.muted, lineHeight: 1.5, flex: 1, minWidth: 200 }}>
                            Hastayı sistemden silmek tüm randevu, not, işlem ve dosya kayıtlarını kalıcı olarak kaldırır.
                          </div>
                          <button onClick={() => silHasta(h)} disabled={silTel === h.tel}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', fontSize: 13, fontWeight: 600, cursor: silTel === h.tel ? 'default' : 'pointer', fontFamily: 'inherit', opacity: silTel === h.tel ? .6 : 1, flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 5v6m4-6v6"/></svg>
                            {silTel === h.tel ? 'Siliniyor…' : 'Hastayı sil'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        (() => {
          // HAFTA TAKVİMİ — çalışma saatleri çerçeve; dolu (her kanaldan) + kapalı + boş
          const ents = approvedClaims.filter(c => c.entity_id && c.entity_id !== 'new');
          const cfg = cfgMap[calEntity];
          const todayIso = isoOf(new Date());
          // Haftanın günleri (Pazartesi başlangıç)
          const base = new Date(); base.setHours(0, 0, 0, 0);
          const dow = (base.getDay() + 6) % 7;
          base.setDate(base.getDate() - dow + weekOffset * 7);
          const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
          const dayIsos = days.map(isoOf);
          // Dolu (bu işletme, iptal değil, slotlu)
          const bookedMap: Record<string, string> = {};
          talepler.forEach(t => { if (t.entity_id === calEntity && t.randevu_slot && t.status !== 'iptal') bookedMap[t.randevu_slot] = t.ad_soyad; });
          const blokeSet = new Set(cfg?.bloke || []);
          // Zaman ekseni: haftanın günlerindeki slotların birleşimi
          const daySlots: Record<string, string[]> = {}; const timeSet = new Set<string>();
          dayIsos.forEach(iso => { const s = gunSaatleri(cfg, iso); daySlots[iso] = s; s.forEach(x => timeSet.add(x)); });
          const times = Array.from(timeSet).sort();
          const haftaBaslik = `${days[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} – ${days[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;

          const toggleSlot = (iso: string, time: string) => { const key = iso + ' ' + time; const arr = (cfg?.bloke || []).slice(); const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); else arr.push(key); saveBlokeCal(calEntity, arr); };
          const toggleGun = (iso: string) => { let arr = (cfg?.bloke || []).slice(); arr = arr.includes(iso) ? arr.filter(x => x !== iso) : [...arr.filter(x => !x.startsWith(iso + ' ')), iso]; saveBlokeCal(calEntity, arr); };

          const gunKisa = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

          return (
            <>
              {/* Üst bar: işletme seçici + hafta nav */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                {ents.length > 1 && (
                  <select value={calEntity} onChange={e => setCalEntity(e.target.value)}
                    style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${A.line}`, fontSize: 13.5, fontFamily: 'inherit', color: A.text, background: A.card, outline: 'none' }}>
                    {ents.map(c => <option key={c.id} value={c.entity_id!}>{c.entity_name}</option>)}
                  </select>
                )}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: ents.length > 1 ? 0 : 'auto' }}>
                  <button onClick={() => setWeekOffset(w => w - 1)} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${A.line}`, background: A.card, cursor: 'pointer', color: A.text, fontSize: 15 }}>‹</button>
                  <button onClick={() => setWeekOffset(0)} style={{ padding: '0 12px', height: 32, borderRadius: 9, border: `1px solid ${A.line}`, background: weekOffset === 0 ? 'rgba(27,58,105,.07)' : A.card, cursor: 'pointer', color: A.accent, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Bu hafta</button>
                  <button onClick={() => setWeekOffset(w => w + 1)} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${A.line}`, background: A.card, cursor: 'pointer', color: A.text, fontSize: 15 }}>›</button>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 13.5, fontWeight: 600, color: A.text }}>{haftaBaslik}{calSaving ? ' · kaydediliyor…' : ''}</span>
              </div>

              {/* Açıklama + aktif değilse uyarı */}
              {cfg && !cfg.aktif && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, color: '#9A3412', marginBottom: 12 }}>
                  Slot bazlı randevu bu işletmede kapalı. Açmak için <strong>Randevu Takvimi</strong>’nden takvimi açın; yine de saatleri buradan planlayabilirsiniz.
                </div>
              )}

              {times.length === 0 ? (
                <div style={{ background: A.card, borderRadius: 18, border: `1px solid ${A.line}`, padding: '40px 24px', textAlign: 'center', color: A.muted, fontSize: 14 }}>
                  Bu hafta çalışma saati tanımlı değil. <strong>Profili Düzenle → Çalışma Saatleri</strong>’nden gün/saatlerinizi ayarlayın.
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto', border: `1px solid ${A.line}`, borderRadius: 14, background: A.card }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `48px repeat(7, minmax(78px, 1fr))`, minWidth: 620 }}>
                      {/* Başlık satırı */}
                      <div style={{ borderBottom: `1px solid ${A.line}`, borderRight: `1px solid ${A.line}` }} />
                      {dayIsos.map((iso, i) => {
                        const gunFull = blokeSet.has(iso);
                        return (
                          <div key={iso} onClick={() => toggleGun(iso)} title={gunFull ? 'Tüm gün kapalı — açmak için tıkla' : 'Tüm günü kapat'}
                            style={{ borderBottom: `1px solid ${A.line}`, borderRight: i < 6 ? `1px solid ${A.line}` : 'none', padding: '8px 4px', textAlign: 'center', cursor: 'pointer', background: iso === todayIso ? 'rgba(27,58,105,.05)' : 'transparent' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: iso === todayIso ? A.accent : A.muted }}>{gunKisa[i]}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: gunFull ? '#B91C1C' : A.text }}>{days[i].getDate()}</div>
                            {gunFull && <div style={{ fontSize: 9, fontWeight: 700, color: '#B91C1C' }}>KAPALI</div>}
                          </div>
                        );
                      })}
                      {/* Saat satırları */}
                      {times.map(time => (
                        <React.Fragment key={time}>
                          <div style={{ borderRight: `1px solid ${A.line}`, borderBottom: `1px solid ${A.line}`, padding: '0 4px', fontSize: 10.5, color: A.muted, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 34 }}>{time}</div>
                          {dayIsos.map((iso, i) => {
                            const cellBase: React.CSSProperties = { borderRight: i < 6 ? `1px solid ${A.line}` : 'none', borderBottom: `1px solid ${A.line}`, minHeight: 34, fontSize: 11 };
                            const active = daySlots[iso].includes(time);
                            if (!active) return <div key={iso} style={{ ...cellBase, background: '#FAFAFB' }} />;
                            const slotKey = iso + ' ' + time;
                            const hasta = bookedMap[slotKey];
                            const kapali = blokeSet.has(iso) || blokeSet.has(slotKey);
                            if (hasta) return <div key={iso} title={hasta} style={{ ...cellBase, background: 'rgba(27,58,105,.9)', color: '#fff', padding: '4px 5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{hasta}</div>;
                            if (kapali) return <div key={iso} onClick={() => !blokeSet.has(iso) && toggleSlot(iso, time)} title={blokeSet.has(iso) ? 'Gün kapalı' : 'Kapalı — açmak için tıkla'} style={{ ...cellBase, background: '#F1F1F4', color: '#B0B0B5', cursor: blokeSet.has(iso) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</div>;
                            return <div key={iso} onClick={() => { setAddSlot({ iso, time }); setAddAd(''); setAddTel(''); setAddMsg(''); }} title="Boş — randevu ekle veya kapat" style={{ ...cellBase, background: '#F0FDF4', cursor: 'pointer' }} />;
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, fontSize: 12, color: A.muted }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(27,58,105,.9)' }} />Dolu (randevu)</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#F0FDF4', border: `1px solid ${A.line}` }} />Boş (tıkla → kapat)</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#F1F1F4' }} />Kapalı</span>
                    <span>Gün başlığına tıkla → tüm günü aç/kapat.</span>
                  </div>
                </>
              )}

              {/* Elle randevu ekle (boş slota tıklayınca) */}
              {addSlot && (
                <div onClick={e => { if (e.target === e.currentTarget) setAddSlot(null); }}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: A.text }}>Randevu ekle</div>
                    <div style={{ fontSize: 13, color: A.muted, margin: '3px 0 16px', textTransform: 'capitalize' }}>
                      {new Date(addSlot.iso + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} · {addSlot.time}{cfgMap[calEntity]?.name ? ' · ' + cfgMap[calEntity].name : ''}
                    </div>
                    <input value={addAd} onChange={e => { setAddAd(e.target.value); setAddMsg(''); }} placeholder="Ad Soyad" style={{ ...inp, marginBottom: 8 }} />
                    <input value={addTel} onChange={e => { setAddTel(e.target.value); setAddMsg(''); }} type="tel" placeholder="Telefon" style={inp} />
                    {addMsg && <div style={{ fontSize: 12.5, color: '#C0392B', marginTop: 8 }}>{addMsg}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button onClick={addRandevu} disabled={addSaving}
                        style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: A.accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: addSaving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: addSaving ? .6 : 1 }}>{addSaving ? 'Ekleniyor…' : 'Randevu ekle'}</button>
                      <button onClick={() => setAddSlot(null)} style={{ padding: '11px 16px', borderRadius: 11, border: `1px solid ${A.line}`, background: '#fff', color: A.muted, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Vazgeç</button>
                    </div>
                    <button onClick={() => { toggleSlot(addSlot.iso, addSlot.time); setAddSlot(null); }}
                      style={{ width: '100%', marginTop: 10, padding: '9px', borderRadius: 10, border: 'none', background: 'transparent', color: '#B91C1C', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Randevu yerine bu saati kapat</button>
                  </div>
                </div>
              )}
            </>
          );
        })()
      )}
    </div>
  );
}

function YorumlarTab({ approvedClaims }: { approvedClaims: ClaimRequest[] }) {
  const [yorumlar,       setYorumlar]       = useState<Yorum[]>([]);
  const [loadingY,       setLoadingY]       = useState(true);
  const [replyOpen,      setReplyOpen]      = useState<string | null>(null);
  const [replyText,      setReplyText]      = useState('');
  const [savingId,       setSavingId]       = useState<string | null>(null);
  const [savedIds,       setSavedIds]       = useState<string[]>([]);
  const [errorIds,       setErrorIds]       = useState<Record<string, string>>({});
  const [editId,         setEditId]         = useState<string | null>(null);
  const [filter,         setFilter]         = useState<'all' | 'unanswered' | 'answered'>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');   // 'all' veya entity_id

  const entities = approvedClaims.filter(c => c.entity_id && c.entity_id !== 'new');
  const entityIds = entities.map(c => c.entity_id);

  useEffect(() => {
    if (entityIds.length === 0) { setLoadingY(false); return; }
    const sb = createSupabaseBrowser();
    sb.from('yorumlar').select('*').in('entity_id', entityIds).order('created_at', { ascending: false })
      .then(({ data }) => { setYorumlar((data || []) as Yorum[]); setLoadingY(false); });
  }, [approvedClaims.length]);  // eslint-disable-line react-hooks/exhaustive-deps

  function entityName(eid: string) {
    const c = approvedClaims.find(x => x.entity_id === eid);
    return c?.entity_name || eid;
  }

  async function submitReply(yorum: Yorum) {
    if (!replyText.trim()) return;
    setSavingId(yorum.id);
    setErrorIds(p => { const n = {...p}; delete n[yorum.id]; return n; });
    try {
      const res = await fetch('/api/panel/reply-yorum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yorumId: yorum.id, replyText: replyText.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      setSavingId(null);
      if (res.ok && json.success) {
        setSavedIds(p => [...p, yorum.id]);
        setYorumlar(prev => prev.map(y => y.id === yorum.id ? { ...y, reply_text: replyText.trim(), reply_at: new Date().toISOString() } : y));
        setReplyOpen(null); setEditId(null); setReplyText('');
      } else {
        setErrorIds(p => ({ ...p, [yorum.id]: json.error || `Kayıt başarısız (${res.status})` }));
      }
    } catch {
      setSavingId(null);
      setErrorIds(p => ({ ...p, [yorum.id]: 'Bağlantı hatası. Tekrar deneyin.' }));
    }
  }

  async function deleteReply(yorum: Yorum) {
    try {
      const res = await fetch('/api/panel/reply-yorum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yorumId: yorum.id, deleteReply: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setYorumlar(prev => prev.map(y => y.id === yorum.id ? { ...y, reply_text: null, reply_at: null } : y));
      }
    } catch { /* sessizce geç */ }
  }

  function openEdit(yorum: Yorum) { setEditId(yorum.id); setReplyOpen(yorum.id); setReplyText(yorum.reply_text || ''); }

  const Stars = ({ n }: { n: number }) => (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i<=n?'#D4A843':'none'} stroke={i<=n?'#D4A843':'#D1D5DB'} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
    </div>
  );

  // Önce işletmeye göre filtrele, sonra yanıt durumuna göre
  const byEntity    = selectedEntity === 'all' ? yorumlar : yorumlar.filter(y => y.entity_id === selectedEntity);
  const filtered    = byEntity.filter(y => filter === 'all' ? true : filter === 'answered' ? !!y.reply_text : !y.reply_text);
  const unansweredCount = byEntity.filter(y => !y.reply_text).length;
  const answeredCount   = byEntity.filter(y => !!y.reply_text).length;

  if (entityIds.length === 0) return (
    <div style={{ textAlign:'center', padding:'80px 32px', color:T.muted }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display:'block', margin:'0 auto 16px', opacity:.35 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>Henüz onaylı işletme yok</p>
      <p style={{ fontSize:13 }}>Onaylı işletme sahiplendikten sonra gelen yorumlar burada görünür.</p>
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div style={{ marginBottom:16 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.4px' }}>Yorumlar</h1>
        <p style={{ fontSize:13, color:T.muted, marginTop:3 }}>
          {unansweredCount > 0 && <span style={{ fontWeight:600, color:T.amber }}>{unansweredCount} yanıt bekliyor · </span>}
          {answeredCount} yanıtlandı · {byEntity.length} toplam
        </p>
      </div>

      {/* İşletme seçici — sadece birden fazla işletme varsa göster */}
      {entities.length > 1 && (
        <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
          <button onClick={()=>{ setSelectedEntity('all'); setFilter('all'); }}
            style={{ padding:'7px 14px', borderRadius:9, border:`1.5px solid ${selectedEntity==='all'?T.navy:T.border}`, background:selectedEntity==='all'?T.navy:'white', color:selectedEntity==='all'?'white':T.muted, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Tüm İşletmeler
            <span style={{ background:'rgba(255,255,255,.25)', borderRadius:10, padding:'1px 7px', fontSize:11 }}>{yorumlar.length}</span>
          </button>
          {entities.map(c => {
            const count = yorumlar.filter(y => y.entity_id === c.entity_id).length;
            const unanswered = yorumlar.filter(y => y.entity_id === c.entity_id && !y.reply_text).length;
            const isSelected = selectedEntity === c.entity_id;
            return (
              <button key={c.entity_id} onClick={()=>{ setSelectedEntity(c.entity_id || 'all'); setFilter('all'); }}
                style={{ padding:'7px 14px', borderRadius:9, border:`1.5px solid ${isSelected?T.navy:T.border}`, background:isSelected?T.navy:'white', color:isSelected?'white':T.text, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                {c.entity_name}
                <span style={{ background:isSelected?'rgba(255,255,255,.25)':'#F3F4F6', color:isSelected?'white':T.muted, borderRadius:10, padding:'1px 7px', fontSize:11 }}>{count}</span>
                {unanswered > 0 && (
                  <span style={{ background:'#D97706', color:'white', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>{unanswered}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Yanıt durumu filtre butonları */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {(['all','unanswered','answered'] as const).map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:'7px 14px', borderRadius:9, border:`1.5px solid ${filter===f?T.navy:T.border}`, background:filter===f?T.navy:'white', color:filter===f?'white':T.muted, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            {f==='all'?'Tümü':f==='unanswered'?`Bekleyenler (${unansweredCount})`:`Yanıtlananlar (${answeredCount})`}
          </button>
        ))}
      </div>

      {loadingY ? (
        <div style={{ textAlign:'center', padding:'60px', color:T.muted }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ animation:'spin .9s linear infinite', display:'block', margin:'0 auto 10px' }}><circle cx="16" cy="16" r="13" stroke="#E5E7EB" strokeWidth="3"/><path d="M16 3a13 13 0 0 1 13 13" stroke={T.navy} strokeWidth="3" strokeLinecap="round"/></svg>
          <span style={{ fontSize:13 }}>Yorumlar yükleniyor...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, padding:'60px 32px', textAlign:'center', color:T.muted }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display:'block', margin:'0 auto 14px', opacity:.3 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Yorum bulunamadı</p>
          <p style={{ fontSize:13 }}>Seçili filtreye ait yorum yok.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(yorum => {
            const isOpen   = replyOpen === yorum.id;
            const isSaved  = savedIds.includes(yorum.id);
            const isSaving = savingId === yorum.id;
            const hasReply = !!yorum.reply_text;
            return (
              <div key={yorum.id} style={{ background:T.white, borderRadius:16, border:`1.5px solid ${hasReply?'#86EFAC':T.border}`, overflow:'hidden', transition:'border-color .2s' }}>
                {/* Kart başlığı */}
                <div style={{ padding:'14px 18px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      {/* Avatar */}
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'#E8F0FE', display:'flex', alignItems:'center', justifyContent:'center', color:T.navy, fontWeight:700, fontSize:14, flexShrink:0 }}>
                        {(yorum.author||'?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{yorum.author || 'Anonim'}</div>
                        <div style={{ fontSize:11, color:T.muted }}>{entityName(yorum.entity_id)} · {yorum.created_at ? new Date(yorum.created_at).toLocaleDateString('tr-TR') : ''}</div>
                      </div>
                    </div>
                    <Stars n={yorum.rating || 0} />
                    {yorum.text && <p style={{ fontSize:13, color:'#374151', lineHeight:1.6, margin:'8px 0 0', fontStyle:'italic' }}>"{yorum.text}"</p>}
                  </div>
                  {/* Durum rozeti */}
                  <div style={{ flexShrink:0 }}>
                    {hasReply
                      ? <span style={{ fontSize:11, fontWeight:700, color:'#166534', background:'#DCFCE7', borderRadius:20, padding:'3px 10px', display:'flex', alignItems:'center', gap:4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Yanıtlandı
                        </span>
                      : <span style={{ fontSize:11, fontWeight:700, color:'#92400E', background:'#FEF3C7', borderRadius:20, padding:'3px 10px' }}>Yanıt Bekliyor</span>
                    }
                  </div>
                </div>

                {/* Mevcut yanıt gösterimi */}
                {hasReply && !isOpen && (
                  <div style={{ margin:'0 18px 14px', background:'#F0FDF4', borderRadius:12, padding:'12px 14px', borderLeft:'3px solid #86EFAC' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#166534', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                      İşletme Yanıtı {yorum.reply_at ? `· ${new Date(yorum.reply_at).toLocaleDateString('tr-TR')}` : ''}
                    </div>
                    <p style={{ fontSize:13, color:'#15803D', margin:0, lineHeight:1.6 }}>{yorum.reply_text}</p>
                    <div style={{ display:'flex', gap:8, marginTop:10 }}>
                      <button onClick={()=>openEdit(yorum)}
                        style={{ fontSize:11, fontWeight:600, color:T.navy, background:'white', border:`1px solid ${T.border}`, borderRadius:8, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Düzenle
                      </button>
                      <button onClick={()=>deleteReply(yorum)}
                        style={{ fontSize:11, fontWeight:600, color:'#DC2626', background:'white', border:'1px solid #FCA5A5', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Sil
                      </button>
                    </div>
                  </div>
                )}

                {/* Yanıt formu */}
                {isOpen ? (
                  <div style={{ padding:'0 18px 16px' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.navy, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                      {editId ? 'Yanıtı Düzenle' : 'İşletme Yanıtı Yaz'}
                    </div>
                    <textarea rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} autoFocus
                      placeholder="Bu yorum için resmi yanıtınızı yazın. Yanıtınız herkese açık olarak profilinizde görünecektir."
                      style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:`1.5px solid ${T.navy}`, fontSize:13, lineHeight:1.7, fontFamily:'inherit', resize:'vertical', outline:'none', color:T.text, boxSizing:'border-box' as const }}/>
                    <p style={{ fontSize:11, color:T.muted, margin:'6px 0 10px', lineHeight:1.5 }}>
                      Yanıtınız yorum kartında herkese görünür şekilde yayınlanır.
                    </p>
                    {errorIds[yorum.id] && (
                      <div style={{ display:'flex', gap:8, padding:'10px 12px', background:'#FEF2F2', borderRadius:8, border:'1px solid #FCA5A5', marginBottom:10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ fontSize:12, color:'#991B1B', lineHeight:1.55 }}>{errorIds[yorum.id]}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>submitReply(yorum)} disabled={!replyText.trim()||isSaving}
                        style={{ padding:'9px 20px', borderRadius:10, border:'none', background:(!replyText.trim()||isSaving)?'#9CA3AF':T.navy, color:'white', fontSize:13, fontWeight:700, cursor:(!replyText.trim()||isSaving)?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
                        {isSaving
                          ? <><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Kaydediliyor</>
                          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>{editId?'Güncelle':'Yanıtı Yayınla'}</>
                        }
                      </button>
                      <button onClick={()=>{setReplyOpen(null);setEditId(null);setReplyText('');}}
                        style={{ padding:'9px 16px', borderRadius:10, border:`1.5px solid ${T.border}`, background:'white', color:T.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        İptal
                      </button>
                    </div>
                  </div>
                ) : !hasReply && (
                  <div style={{ padding:'0 18px 14px' }}>
                    {isSaved
                      ? <span style={{ fontSize:12, fontWeight:700, color:'#166534', display:'flex', alignItems:'center', gap:5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Yanıtınız yayınlandı!</span>
                      : <button onClick={()=>{setReplyOpen(yorum.id);setEditId(null);setReplyText('');}}
                          style={{ padding:'8px 18px', borderRadius:10, border:`1.5px solid ${T.navy}`, background:'white', color:T.navy, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>Yanıtla
                        </button>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Konum Seçici ─────────────────────────────────────────────────────────────
function KonumPicker({ lat, lng, adres, il, ilce, name, onLatLng, T, LBL }: {
  lat: number | null; lng: number | null;
  adres: string; il: string; ilce: string; name: string;
  onLatLng: (lat: number, lng: number) => void;
  T: Record<string,string>; LBL: React.CSSProperties;
}) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const markerRef  = useRef<any>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [hint,      setHint]      = useState('');
  const [curLat,    setCurLat]    = useState<number|null>(lat);
  const [curLng,    setCurLng]    = useState<number|null>(lng);

  // Haritayı başlat
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapRef.current) return;

      function addCSS(id: string, href: string) {
        if (document.querySelector(`#${id}`)) return;
        const l = document.createElement('link'); l.id=id; l.rel='stylesheet'; l.href=href;
        document.head.appendChild(l);
      }
      function loadScript(id: string, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
          const existing = document.querySelector(`#${id}`) as HTMLScriptElement | null;
          if (existing) {
            // Tag already in DOM — resolve immediately if L is ready, otherwise wait
            if ((window as any).L) { resolve(); return; }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(), { once: true });
            return;
          }
          const s = document.createElement('script'); s.id=id; s.src=src; s.async=true;
          s.onload=()=>resolve(); s.onerror=()=>reject();
          document.head.appendChild(s);
        });
      }

      addCSS('leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      await loadScript('leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      if (cancelled || !mapRef.current) return;

      const L = (window as any).L;
      if (!L) return; // Leaflet yüklenemedi

      if (mapObjRef.current) { try { mapObjRef.current.remove(); } catch (_) {} }

      const initLat = lat || 39.0;
      const initLng = lng || 35.0;
      const initZoom = (lat && lng) ? 15 : 6;

      const map = L.map(mapRef.current, { scrollWheelZoom: true, zoomControl: true });
      mapObjRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 19,
      }).addTo(map);

      map.setView([initLat, initLng], initZoom);

      // Sürüklenebilir marker
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#1B3A69;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.4);transform:rotate(-45deg);cursor:grab"></div>`,
        iconSize: [28,28], iconAnchor: [14,28], popupAnchor: [0,-32],
      });

      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        markerRef.current = marker;
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setCurLat(pos.lat); setCurLng(pos.lng);
          onLatLng(pos.lat, pos.lng);
        });
      }

      // Haritaya tıklama → marker koy / taşı
      map.on('click', (e: any) => {
        const { lat: cLat, lng: cLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([cLat, cLng]);
        } else {
          const m = L.marker([cLat, cLng], { icon, draggable: true }).addTo(map);
          markerRef.current = m;
          m.on('dragend', () => {
            const pos = m.getLatLng();
            setCurLat(pos.lat); setCurLng(pos.lng);
            onLatLng(pos.lat, pos.lng);
          });
        }
        setCurLat(cLat); setCurLng(cLng);
        onLatLng(cLat, cLng);
      });
    }

    init();
    return () => { cancelled = true; if (mapObjRef.current) { try { mapObjRef.current.remove(); } catch (_) {} mapObjRef.current = null; markerRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adrese göre konuma git — üç kademeli arama
  async function geocodeAddress() {
    if (!il && !ilce && !adres) { setHint('Önce adres bilgisini doldurun.'); return; }
    setGeocoding(true); setHint('');

    // Mahalleyi adresin başından çıkart (Sokak/No detaylarını bırak)
    const mahalleMatch = adres.match(/^([^,]+(?:mah(?:alle)?\.?|köy|site|mh\.?))/i);
    const mahalle = mahalleMatch ? mahalleMatch[1].trim() : '';

    // Deneme sırası: 1) tam adres  2) mahalle+ilçe+il  3) ilçe+il
    const attempts = [
      [adres, ilce, il, 'Türkiye'].filter(Boolean).join(', '),
      mahalle ? [mahalle, ilce, il, 'Türkiye'].filter(Boolean).join(', ') : null,
      [ilce, il, 'Türkiye'].filter(Boolean).join(', '),
    ].filter(Boolean) as string[];

    // Tekrar eden deneme dizilerini temizle
    const uniqueAttempts = attempts.filter((v, i, a) => a.indexOf(v) === i);

    let found = false;
    for (let i = 0; i < uniqueAttempts.length; i++) {
      try {
        const url = 'https://nominatim.openstreetmap.org/search?' +
          new URLSearchParams({ q: uniqueAttempts[i], format: 'json', limit: '1', countrycodes: 'tr' });
        const res  = await fetch(url, { headers: { 'User-Agent': 'Hekimhane/1.0' } });
        const data = await res.json();
        if (data?.[0]) {
          const gLat = parseFloat(data[0].lat);
          const gLng = parseFloat(data[0].lon);
          // Daha geniş bir sorgudan bulunduysa zoom seviyesini düşür
          const zoom = i === 0 ? 17 : i === 1 ? 15 : 13;
          const hint = i === 0
            ? 'Konum bulundu! Noktayı sürükleyerek tam yeri belirtin.'
            : i === 1
            ? 'Mahalle bulundu — noktayı tam adrese sürükleyin.'
            : 'İlçe merkezi bulundu — noktayı tam adrese sürükleyin.';

          const L   = (window as any).L;
          const map = mapObjRef.current;
          if (!map || !L) {
            setCurLat(gLat); setCurLng(gLng);
            onLatLng(gLat, gLng);
            setHint(hint + ' Sayfayı kaydedip yenileyin, haritada görebilirsiniz.');
            setGeocoding(false); return;
          }
          map.flyTo([gLat, gLng], zoom, { duration: 1.2 });
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#1B3A69;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.4);transform:rotate(-45deg);cursor:grab"></div>`,
            iconSize: [28,28], iconAnchor: [14,28],
          });
          if (markerRef.current) {
            markerRef.current.setLatLng([gLat, gLng]);
          } else {
            const m = L.marker([gLat, gLng], { icon, draggable: true }).addTo(map);
            markerRef.current = m;
            m.on('dragend', () => {
              const pos = m.getLatLng();
              setCurLat(pos.lat); setCurLng(pos.lng);
              onLatLng(pos.lat, pos.lng);
            });
          }
          setCurLat(gLat); setCurLng(gLng);
          onLatLng(gLat, gLng);
          setHint(hint);
          found = true;
          break;
        }
      } catch { /* bir sonraki denemeye geç */ }
    }

    if (!found) setHint('Konum bulunamadı. Haritaya tıklayarak manuel belirleyin.');
    setGeocoding(false);
  }

  return (
    <>
      <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Harita Konumu</div>

      {/* Adres bilgisi özeti */}
      <div style={{ display:'flex', gap:10, padding:'10px 13px', background:'#F0F4FF', borderRadius:10, border:'1px solid #C7D7F8', alignItems:'flex-start' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:12, color:T.navy, fontWeight:600, margin:'0 0 2px', overflowWrap:'anywhere' }}>
            {[adres, ilce, il].filter(Boolean).join(' · ') || 'Adres bilgisi yok'}
          </p>
          <p style={{ fontSize:11, color:'#6B7A99', margin:0 }}>
            Adrese göre konumu bulmak için butona tıklayın, ardından noktayı tam yere sürükleyin.
          </p>
        </div>
        <button type="button" onClick={geocodeAddress} disabled={geocoding}
          style={{ flexShrink:0, padding:'7px 14px', background:T.navy, color:'white', border:'none', borderRadius:9, fontSize:12, fontWeight:700, cursor:geocoding?'wait':'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', opacity:geocoding?0.7:1 }}>
          {geocoding
            ? <><svg width="12" height="12" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Aranıyor</>
            : <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Adrese Git
              </>
          }
        </button>
      </div>

      {/* Hint */}
      {hint && (
        <div style={{ padding:'8px 12px', borderRadius:8, background: hint.includes('bulundu') ? '#F0FDF4' : '#FEF3C7', border:`1px solid ${hint.includes('bulundu')?'#BBF7D0':'#FDE68A'}`, fontSize:12, color: hint.includes('bulundu')?'#166534':'#92400E', fontWeight:500 }}>
          {hint}
        </div>
      )}

      {/* Harita */}
      <div style={{ borderRadius:12, overflow:'hidden', border:`1.5px solid ${T.border}`, position:'relative' }}>
        <div ref={mapRef} style={{ height:360, width:'100%' }} />
        <div style={{ position:'absolute', top:8, left:8, zIndex:1000, background:'rgba(255,255,255,.92)', borderRadius:7, padding:'5px 10px', fontSize:11, color:'#374151', fontWeight:500, pointerEvents:'none', boxShadow:'0 1px 4px rgba(0,0,0,.12)' }}>
          Haritaya tıklayın veya noktayı sürükleyin
        </div>
      </div>

      {/* Koordinat gösterimi */}
      {curLat && curLng ? (
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, padding:'9px 13px', background:T.bg, borderRadius:9, border:`1px solid ${T.border}`, fontSize:12 }}>
            <span style={{ color:T.muted, fontWeight:600, marginRight:6 }}>Enlem:</span>
            <span style={{ fontFamily:'monospace', color:T.text, fontWeight:700 }}>{curLat.toFixed(6)}</span>
          </div>
          <div style={{ flex:1, padding:'9px 13px', background:T.bg, borderRadius:9, border:`1px solid ${T.border}`, fontSize:12 }}>
            <span style={{ color:T.muted, fontWeight:600, marginRight:6 }}>Boylam:</span>
            <span style={{ fontFamily:'monospace', color:T.text, fontWeight:700 }}>{curLng.toFixed(6)}</span>
          </div>
          <button type="button" onClick={() => { onLatLng(0, 0); setCurLat(null); setCurLng(null); if (markerRef.current && mapObjRef.current) { mapObjRef.current.removeLayer(markerRef.current); markerRef.current = null; } }}
            style={{ padding:'9px 12px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:9, fontSize:11, fontWeight:700, cursor:'pointer', color:'#DC2626' }}>
            Sıfırla
          </button>
        </div>
      ) : (
        <div style={{ padding:'9px 13px', background:T.bg, borderRadius:9, border:`1px solid ${T.border}`, fontSize:12, color:T.muted, textAlign:'center' }}>
          Henüz konum seçilmedi — haritaya tıklayın veya "Adrese Git" kullanın
        </div>
      )}
    </>
  );
}

function EditProfileTab({ approvedClaims, selectedClaim, onSelectClaim, isMobile }: {
  approvedClaims: ClaimRequest[];
  selectedClaim: ClaimRequest | null;
  onSelectClaim: (c: ClaimRequest | null) => void;
  isMobile?: boolean;
}) {
  type ESection = 'info' | 'details' | 'meslek' | 'photos' | 'konum' | 'tour' | 'embed';
  const [sec,        setSec]      = useState<ESection>('info');
  const [entityData, setED]       = useState<Record<string,any>|null>(null);
  const [formData,   setFormData] = useState<Record<string,any>>({});
  const [loading,    setLoading]  = useState(false);
  const [saving,     setSaving]   = useState(false);
  const [saveMsg,    setSaveMsg]  = useState<{ok:boolean;text:string}|null>(null);
  const [photoEdit,  setPE]       = useState<{slot:'cover'|number}|null>(null);
  const [photoUrl,   setPhotoUrl] = useState('');
  const [uploading,  setUploading] = useState<Record<string, boolean>>({}); // slot → yükleniyor
  const [dragOver,   setDragOver]  = useState<string | null>(null);         // slot → drag aktif
  const [waMode,     setWaMode]    = useState<'off'|'same'|'custom'>('off'); // WhatsApp: yok / telefonla aynı / farklı numara
  const [certUp,     setCertUp]    = useState<number | null>(null);           // sertifika görseli yükleniyor (index)
  const [certDrag,   setCertDrag]  = useState<number | null>(null);           // üzerine dosya sürüklenen slot (index)
  const [embedCopied, setEmbedCopied] = useState(false);                      // randevu embed kodu kopyalandı
  const [dilInput,   setDilInput]  = useState('');                            // yabancı dil ekleme kutusu

  const et = selectedClaim?.entity_type || '';

  useEffect(() => {
    if (selectedClaim?.entity_id && selectedClaim.entity_id !== 'new') loadEntity(selectedClaim);
  }, [selectedClaim]);

  async function loadEntity(claim: ClaimRequest) {
    setLoading(true); setED(null); setFormData({}); setSaveMsg(null);
    const TM: Record<string,string> = { klinik:'klinikler', hastane:'hastaneler', doktor:'doktorlar', eczane:'eczaneler' };
    const table = TM[claim.entity_type];
    if (!table) { setLoading(false); return; }
    const sb = createSupabaseBrowser();
    const { data } = await sb.from(table).select('*').eq('id', claim.entity_id!).single();
    const d = (data || {}) as Record<string,any>;
    const w = String(d.whatsapp || '');
    setWaMode(!w ? 'off' : w === 'same' ? 'same' : 'custom');
    setED(d); setFormData(d); setLoading(false);
  }

  async function handleSave() {
    if (!selectedClaim) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch('/api/panel/update-entity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: et, entityId: selectedClaim.entity_id, fields: formData }),
      });
      const json = await res.json().catch(() => ({}));
      setSaving(false);
      if (res.ok && json.success) {
        setSaveMsg({ ok: true, text: 'Profil başarıyla güncellendi!' });
        setED({...formData});
      } else {
        setSaveMsg({ ok: false, text: json.error || `Kayıt başarısız (${res.status})` });
      }
    } catch (e) {
      setSaving(false);
      setSaveMsg({ ok: false, text: 'Bağlantı hatası. Tekrar deneyin.' });
    }
  }

  const F = (k: string, v: unknown) => setFormData(p => ({ ...p, [k]: v }));

  const profKey = et === 'doktor' ? 'photo' : 'logo';
  const profUrl = String(formData[profKey] || '');
  const gall: string[] = Array.isArray(formData.photos) ? (formData.photos as string[]).filter(Boolean) : [];
  const previewBg = HERO_BACKGROUNDS.find(b => b.key === coverPresetKey(String(formData.cover || ''))) || null;
  const pvLight = !!previewBg?.light; // açık (pearl) tema → önizlemede koyu metin

  function openPE(slot: 'profile' | number) { setPE({ slot: slot === 'profile' ? 'cover' : slot }); setPhotoUrl(slot === 'profile' ? profUrl : (gall[slot as number] || '')); }
  function confirmPE() {
    if (!photoEdit) return;
    if (photoEdit.slot === 'cover') { F(profKey, photoUrl.trim()); }
    else { const a=[...gall]; if (photoUrl.trim()) a[photoEdit.slot as number]=photoUrl.trim(); else a.splice(photoEdit.slot as number,1); F('photos',a.filter(Boolean)); }
    setPE(null); setPhotoUrl('');
  }
  function removePh(slot: 'cover'|number) { if(slot==='cover') F(profKey,''); else F('photos',gall.filter((_,i)=>i!==slot)); }

  // Dosya yükleme (sürükle-bırak veya file picker)
  async function uploadFile(file: File, slot: 'profile' | number) {
    const slotKey = String(slot);
    setUploading(p => ({ ...p, [slotKey]: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/panel/upload-photo', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || 'Yükleme başarısız.');
        return;
      }
      if (slot === 'profile') {
        F(profKey, data.url);
      } else {
        const a = [...gall];
        a[slot as number] = data.url;
        F('photos', a.filter(Boolean));
      }
    } catch {
      alert('Yükleme sırasında hata oluştu.');
    } finally {
      setUploading(p => { const n={...p}; delete n[slotKey]; return n; });
    }
  }

  function handleDrop(e: React.DragEvent, slot: 'profile' | number) {
    e.preventDefault(); setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file, slot);
  }
  function handleFilePick(slot: 'profile' | number) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => { const f = inp.files?.[0]; if (f) uploadFile(f, slot); };
    inp.click();
  }

  // Sertifika görseli yükle → sertifikalar[idx].url güncellenir
  async function uploadCert(file: File, idx: number) {
    setCertUp(idx);
    try {
      const hazir = await dosyayiHazirla(file);   // HEIC/PNG/BMP → JPEG'e çevrilir, küçültülür
      const fd = new FormData(); fd.append('file', hazir);
      const res = await fetch('/api/panel/upload-photo', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { alert(data.error || 'Yükleme başarısız.'); return; }
      const list = Array.isArray(formData.sertifikalar) ? [...(formData.sertifikalar as any[])] : [];
      list[idx] = { ...(list[idx] || { ad: '' }), url: data.url };
      F('sertifikalar', list);
    } catch { alert('Yükleme sırasında hata oluştu.'); }
    finally { setCertUp(null); }
  }
  function pickCert(idx: number) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*,application/pdf,.heic,.heif,.tiff,.bmp';
    inp.onchange = () => { const f = inp.files?.[0]; if (f) uploadCert(f, idx); };
    inp.click();
  }

  const INP: React.CSSProperties = { width:'100%', padding:'10px 13px', borderRadius:10, border:`1.5px solid ${T.border}`, fontSize:13.5, fontFamily:'inherit', color:T.text, outline:'none', background:'white', transition:'border-color .15s', boxSizing:'border-box' };
  const LBL: React.CSSProperties = { display:'block', fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 };
  const onF  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor=T.navy; e.currentTarget.style.boxShadow='0 0 0 3px rgba(27,58,105,.08)'; };
  const offF = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow='none'; };

  // İl/İlçe seçici kutuları — il seçilince ilçe otomatik dolar. Mevcut (listede olmayan) değer korunur.
  const curIl = String(formData.il || '');
  const curIlce = String(formData.ilce || '');
  const ilBox = (
    <div><label style={LBL}>İl</label>
      <select value={curIl} style={{ ...INP, cursor:'pointer' }}
        onChange={e=>{ F('il', e.target.value); F('ilce',''); }} onFocus={onF} onBlur={offF}>
        <option value="">İl seçin…</option>
        {curIl && !IL_LISTE.includes(curIl) && <option value={curIl}>{curIl}</option>}
        {IL_LISTE.map(il => <option key={il} value={il}>{il}</option>)}
      </select>
    </div>
  );
  const ilceBox = (
    <div><label style={LBL}>İlçe</label>
      <select value={curIlce} disabled={!curIl} style={{ ...INP, cursor: curIl ? 'pointer' : 'not-allowed', opacity: curIl ? 1 : 0.6 }}
        onChange={e=>F('ilce', e.target.value)} onFocus={onF} onBlur={offF}>
        <option value="">{curIl ? 'İlçe seçin…' : 'Önce il seçin'}</option>
        {curIlce && !ILCELER(curIl).includes(curIlce) && <option value={curIlce}>{curIlce}</option>}
        {ILCELER(curIl).map(ic => <option key={ic} value={ic}>{ic}</option>)}
      </select>
    </div>
  );

  const specs: string[] = Array.isArray(formData.specs) ? formData.specs as string[]
    : (typeof formData.specs==='string' && formData.specs ? (formData.specs as string).split(',').map((s:string)=>s.trim()) : []);

  const entityDisplayName = et === 'doktor'
    ? `${formData.ad||''} ${formData.soyad||''}`.trim() || (selectedClaim?.entity_name || '')
    : String(formData.name || selectedClaim?.entity_name || '');

  const SECS = [
    { key:'info'    as ESection, label:'Profil Bilgileri', icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11A4 4 0 1 0 12 3a4 4 0 0 0 0 8z' },
    { key:'details' as ESection, label:'Detaylar',          icon:icons.list },
    ...((et==='doktor'||et==='klinik') ? [{ key:'meslek' as ESection, label:'Mesleki', icon:'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 1 2 3 6 3s6-2 6-3v-5' }] : []),
    { key:'photos'  as ESection, label:'Fotoğraflar',       icon:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17A4 4 0 1 0 12 9a4 4 0 0 0 0 8z' },
    { key:'konum'   as ESection, label:'Konum',              icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10A2 2 0 1 0 12 6a2 2 0 0 0 0 4z' },
    { key:'tour'    as ESection, label:'360° Tur',           icon:'M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
    { key:'embed'   as ESection, label:'Siteme Ekle',         icon:'M16 18l6-6-6-6 M8 6l-6 6 6 6' },
  ];

  /* ── EMPTY STATE ── */
  if (approvedClaims.length === 0) return (
    <div>
      <div style={{ marginBottom:28 }}><h1 style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.4px' }}>Profilimi Düzenle</h1><p style={{ fontSize:13, color:T.muted, marginTop:3 }}>Onaylı işletmenizin profil bilgilerini güncelleyin.</p></div>
      <div style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, padding:'52px 32px', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#FFF7ED', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#EA580C' }}><Ic d={icons.info} size={28}/></div>
        <h2 style={{ fontSize:17, fontWeight:800, color:T.text, marginBottom:8 }}>Onaylı işletmeniz yok</h2>
        <p style={{ fontSize:13, color:T.muted, maxWidth:340, margin:'0 auto', lineHeight:1.7 }}>Profil düzenleyebilmek için başvurunuzun onaylanması gerekiyor.</p>
      </div>
    </div>
  );

  /* ── PICKER ── */
  if (!selectedClaim) return (
    <div>
      <div style={{ marginBottom:28 }}><h1 style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.4px' }}>Profilimi Düzenle</h1><p style={{ fontSize:13, color:T.muted, marginTop:3 }}>Onaylı işletmenizin profil bilgilerini güncelleyin.</p></div>
      <div style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, overflow:'hidden' }}>
        <div style={{ padding:'14px 22px', borderBottom:`1px solid ${T.border}` }}><span style={{ fontSize:13, fontWeight:800, color:T.text }}>Düzenlemek İstediğiniz İşletmeyi Seçin</span></div>
        <div style={{ padding:'16px 22px', display:'flex', flexDirection:'column', gap:10 }}>
          {approvedClaims.filter(c=>c.entity_id&&c.entity_id!=='new').map(c=>(
            <button key={c.id} onClick={()=>onSelectClaim(c)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', background:T.bg, borderRadius:14, border:`1.5px solid ${T.border}`, cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .15s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.navy;(e.currentTarget as HTMLButtonElement).style.background='#E8F0FE';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.border;(e.currentTarget as HTMLButtonElement).style.background=T.bg;}}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#E8F0FE', display:'flex', alignItems:'center', justifyContent:'center', color:T.navy, flexShrink:0 }}><Ic d={icons.building} size={20}/></div>
                <div><div style={{ fontWeight:700, fontSize:15, color:T.text, marginBottom:2 }}>{c.entity_name}</div><EntityTypeLabel type={c.entity_type}/></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:T.navy, fontSize:12, fontWeight:600 }}><Ic d={icons.edit} size={15}/>Düzenle</div>
            </button>
          ))}
          {approvedClaims.filter(c=>c.entity_id&&c.entity_id!=='new').length===0&&<p style={{ fontSize:13, color:T.muted, textAlign:'center', padding:'20px 0' }}>Düzenlenebilir onaylı işletme bulunamadı.</p>}
        </div>
      </div>
    </div>
  );

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ textAlign:'center', padding:'80px', color:T.muted }}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ animation:'spin .9s linear infinite', display:'block', margin:'0 auto 12px' }}>
        <circle cx="16" cy="16" r="13" stroke="#E5E7EB" strokeWidth="3"/><path d="M16 3a13 13 0 0 1 13 13" stroke={T.navy} strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize:13 }}>Profil yükleniyor...</span>
    </div>
  );

  /* ══════════════════════════════════════════
     GÖRSEL EDİTÖR — iki sütun
  ══════════════════════════════════════════ */
  return (
    <div>
      {/* Üst bar — sticky */}
      <div style={{ position:'sticky', top: isMobile ? 112 : 64, zIndex:50, background:'rgba(251,248,242,0.95)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', marginBottom:20, marginTop: isMobile ? -28 : -32, marginLeft: isMobile ? -16 : -36, marginRight: isMobile ? -16 : -36, paddingLeft: isMobile ? 16 : 36, paddingRight: isMobile ? 16 : 36 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
          <button onClick={()=>{onSelectClaim(null);setED(null);setSaveMsg(null);}}
            style={{ background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:13, fontFamily:'inherit', padding:'6px 0', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
            <Ic d="M19 12H5 M12 5l-7 7 7 7" size={14}/> Geri
          </button>
          <span style={{ color:T.border, flexShrink:0 }}>|</span>
          <span style={{ fontSize:15, fontWeight:800, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>{selectedClaim.entity_name}</span>
          {!isMobile && <EntityTypeLabel type={et}/>}
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
          {saveMsg && (
            <span style={{ fontSize:12, fontWeight:600, color:saveMsg.ok?T.green:T.red, display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <Ic d={saveMsg.ok?icons.check:icons.info} size={13}/>{!isMobile && saveMsg.text}
            </span>
          )}
          {(()=>{
            const slug = String(entityData?.slug||'');
            const il = tr(String(entityData?.il||'turkiye'));
            const ilce = tr(String(entityData?.ilce||'merkez'));
            // Klinik/hastane detay rotası il/ilçe segmentlidir; doktor/eczane yalnız slug.
            const href =
              et === 'klinik'  ? `/klinikler/${il}/${ilce}/${slug}` :
              et === 'hastane' ? `/hastaneler/${il}/${ilce}/${slug}` :
              et === 'doktor'  ? `/doktorlar/${slug}` :
              et === 'eczane'  ? `/eczaneler/${slug}` : '';
            if (!slug || !href) return null;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer"
                title="Profilinizi yeni sekmede açar (kayıtlı hâli)"
                style={{ padding:'9px 16px', borderRadius:10, border:`1.5px solid ${T.border}`, background:'white', color:T.navy, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
                <Ic d="M15 3h6v6 M10 14 21 3 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" size={13}/>{!isMobile && 'Önizle'}
              </a>
            );
          })()}
          {!isMobile && (
          <button onClick={()=>{setFormData(entityData||{});setSaveMsg(null);}}
            style={{ padding:'9px 18px', borderRadius:10, border:`1.5px solid ${T.border}`, background:'white', color:T.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            Sıfırla
          </button>
          )}
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'9px 22px', borderRadius:10, border:'none', background:saving?'#9CA3AF':T.navy, color:'white', fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:7, fontFamily:'inherit' }}>
            {saving
              ? <><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Kaydediliyor</>
              : <><Ic d={icons.check} size={14}/>Kaydet</>
            }
          </button>
        </div>
      </div>

      {/* İki sütun */}
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '400px 1fr', gap:24, alignItems:'start' }}>

        {/* ── SOL: Bölüm tabları + Form ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Section tabs */}
          <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.border}`, padding:5, display:'flex', gap:3 }}>
            {SECS.map(s=>(
              <button key={s.key} onClick={()=>setSec(s.key)}
                style={{ flex:1, padding:'9px 4px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:sec===s.key?700:500, color:sec===s.key?'white':T.muted, background:sec===s.key?T.navy:'transparent', transition:'all .15s', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <Ic d={s.icon} size={14}/>{s.label}
              </button>
            ))}
          </div>

          {/* Form bölümü — minHeight ile sekme geçişinde yükseklik zıplaması önlenir */}
          <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.border}`, padding:'20px 18px', display:'flex', flexDirection:'column', gap:14, minHeight:460, maxWidth:'100%', overflowX:'hidden' }}>

            {/* ── PROFİL BİLGİLERİ ── */}
            {sec==='info' && (<>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Profil Bilgileri</div>

              {et==='doktor' ? (
                <div><label style={LBL}>Ad — Soyad</label>
                  <div className="panel-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <input value={String(formData.ad||'')} placeholder="Ad" style={INP} onChange={e=>F('ad',e.target.value)} onFocus={onF} onBlur={offF}/>
                    <input value={String(formData.soyad||'')} placeholder="Soyad" style={INP} onChange={e=>F('soyad',e.target.value)} onFocus={onF} onBlur={offF}/>
                  </div>
                </div>
              ) : (
                <div><label style={LBL}>{et==='eczane'?'Eczane Adı':'İşletme Adı'}</label>
                  <input value={String(formData.name||'')} placeholder="İşletme adı" style={INP} onChange={e=>F('name',e.target.value)} onFocus={onF} onBlur={offF}/>
                </div>
              )}

              {/* İşletme adı uyarısı */}
              <div style={{ display:'flex', gap:9, padding:'10px 13px', background:'#FFFBEB', borderRadius:10, border:'1px solid #FDE68A' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ fontSize:12, color:'#92400E', lineHeight:1.55, margin:0 }}>
                  İşletmenizin gerçek adını yazınız — ilk harf büyük, devamı küçük harf kullanın.
                </p>
              </div>

              {et !== 'eczane' && (
                <div className="panel-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {et==='doktor' ? (
                    <div><label style={LBL}>Uzmanlık</label>
                      <input value={String(formData.spec||'')} placeholder="Kardiyoloji" style={INP}
                        onChange={e=>F('spec',e.target.value)} onFocus={onF} onBlur={offF}/>
                    </div>
                  ) : (
                    <div><label style={LBL}>Tür</label>
                      <select value={String(formData.type||'')} style={INP}
                        onChange={e=>F('type',e.target.value)} onFocus={onF} onBlur={offF}>
                        <option value="">Seçiniz…</option>
                        <option value="Özel">Özel</option>
                        <option value="Devlet">Devlet</option>
                        <option value="Üniversite">Üniversite</option>
                        {formData.type && !['Özel','Devlet','Üniversite'].includes(String(formData.type)) && (
                          <option value={String(formData.type)}>{String(formData.type)}</option>
                        )}
                      </select>
                    </div>
                  )}
                  {et==='doktor' && <div><label style={LBL}>Ünvan</label><input value={String(formData.unvan||'')} placeholder="Uzm. Dr." style={INP} onChange={e=>F('unvan',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
                  {et!=='doktor' && ilBox}
                </div>
              )}

              <div className="panel-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {et==='doktor' && ilBox}
                {ilceBox}
                {et==='eczane' && ilBox}
              </div>

              <div><label style={LBL}>Adres</label>
                <input value={String(formData.adres||formData.address||'')} placeholder="Sokak, bina no, kat..." style={INP}
                  onChange={e=>F(et==='eczane'?'address':'adres',e.target.value)} onFocus={onF} onBlur={offF}/>
              </div>

              <div className="panel-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div><label style={LBL}>Telefon</label><input type="tel" value={String(formData.tel||'')} placeholder="05xx xxx xx xx" style={INP} onChange={e=>F('tel',e.target.value)} onFocus={onF} onBlur={offF}/></div>
                {et!=='eczane'&&et!=='doktor'&&<div><label style={LBL}>Website</label><input type="url" value={String(formData.website||'')} placeholder="https://" style={INP} onChange={e=>F('website',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
                {et==='doktor'&&<div><label style={LBL}>Muayene Ücreti (₺)</label><input type="number" value={formData.fee??''} placeholder="500" style={INP} onChange={e=>F('fee',e.target.value===''?null:Number(e.target.value))} onFocus={onF} onBlur={offF}/></div>}
                {et==='eczane'&&<div><label style={LBL}>Eczacı Adı</label><input value={String(formData.pharmacist||'')} placeholder="Ad Soyad" style={INP} onChange={e=>F('pharmacist',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
              </div>

              {/* Doktor — e-posta + iletişim görünürlüğü (hekim kendisi seçer) */}
              {et==='doktor'&&(<>
                <div><label style={LBL}>E-posta <span style={{ textTransform:'none', letterSpacing:0, fontWeight:600, color:T.muted }}>· iletişim için</span></label>
                  <input type="email" value={String(formData.email||'')} placeholder="ornek@mail.com" style={INP} onChange={e=>F('email',e.target.value)} onFocus={onF} onBlur={offF}/>
                </div>
                <div>
                  <label style={LBL}>İletişim Bilgilerim <span style={{ textTransform:'none', letterSpacing:0, fontWeight:600, color:T.muted }}>· telefon ve e-posta</span></label>
                  <div style={{ display:'flex', gap:8 }}>
                    {([[false,'Görünür','Ziyaretçiler telefon ve e-postanızı görebilir','M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9A3 3 0 1 0 12 15a3 3 0 0 0 0-6z'],[true,'Gizli','Profilinizde gösterilmez','M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4']] as const).map(([val,lbl,desc,icon])=>{
                      const active = (formData.contact_hidden===true) === val;
                      return (
                        <button key={String(val)} type="button" onClick={()=>F('contact_hidden', val)}
                          style={{ flex:1, padding:'11px 13px', borderRadius:10, textAlign:'left', cursor:'pointer', fontFamily:'inherit',
                            border:`1.5px solid ${active?T.navy:T.border}`, background: active?'rgba(27,58,105,.06)':'white' }}>
                          <div style={{ fontSize:12.5, fontWeight:700, color: active?T.navy:T.text, display:'flex', alignItems:'center', gap:6 }}>
                            <Ic d={icon} size={13}/> {lbl}
                          </div>
                          <div style={{ fontSize:11, color:T.muted, marginTop:3, lineHeight:1.4 }}>{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize:11, color:T.muted, marginTop:6, lineHeight:1.6 }}>
                    &quot;Gizli&quot; seçerseniz telefon ve e-posta adresiniz profilinizde ziyaretçilere gösterilmez; dilediğiniz zaman &quot;Görünür&quot; yapabilirsiniz.
                  </p>
                </div>
              </>)}

              {/* WhatsApp — işletmeye aktif mi diye sorulur; premium üyelikte profilde görünür */}
              <div>
                <label style={LBL}>WhatsApp <span style={{ textTransform:'none', letterSpacing:0, fontWeight:600, color:T.muted }}>· Premium üyelikte profilde görünür</span></label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {([['off','Yok'],['same','Telefonla aynı'],['custom','Farklı numara']] as const).map(([m,lbl])=>(
                    <button key={m} type="button"
                      onClick={()=>{
                        setWaMode(m);
                        if (m==='off')      F('whatsapp','');
                        else if (m==='same') F('whatsapp','same');
                        else                 F('whatsapp', String(formData.whatsapp||'')==='same' ? '' : String(formData.whatsapp||''));
                      }}
                      style={{ flex:'1 1 100px', padding:'9px 10px', borderRadius:9, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                        border:`1.5px solid ${waMode===m?T.navy:T.border}`, background: waMode===m?'rgba(27,58,105,.06)':'white', color: waMode===m?T.navy:T.muted, transition:'.15s' }}>
                      {lbl}
                    </button>
                  ))}
                </div>
                {waMode==='custom' && (
                  <input type="tel" value={String(formData.whatsapp||'')==='same'?'':String(formData.whatsapp||'')}
                    placeholder="WhatsApp numarası — 05xx xxx xx xx" style={{...INP, marginTop:8}}
                    onChange={e=>F('whatsapp', e.target.value)} onFocus={onF} onBlur={offF}/>
                )}
                <p style={{ fontSize:11, color:T.muted, marginTop:5, lineHeight:1.6 }}>
                  &quot;Telefonla aynı&quot; seçilirse üstteki telefon numaranız WhatsApp butonunda kullanılır. &quot;Yok&quot; ise WhatsApp butonu gösterilmez.
                </p>
              </div>

              {et!=='doktor'&&<div><label style={LBL}>Google Maps Bağlantısı</label><input type="url" value={String(formData.maps_url||'')} placeholder="https://maps.google.com/..." style={INP} onChange={e=>F('maps_url',e.target.value)} onFocus={onF} onBlur={offF}/></div>}

              {et==='doktor'&&<>
                <div><label style={LBL}>Çalıştığı Klinik / Hastane</label><input value={String(formData.clinic_name||'')} placeholder="Özel Xyz Hastanesi" style={INP} onChange={e=>F('clinic_name',e.target.value)} onFocus={onF} onBlur={offF}/></div>
                <div><label style={LBL}>Biyografi</label><textarea rows={3} value={String(formData.bio||'')} placeholder="Doktor hakkında..." style={{...INP,resize:'vertical',lineHeight:1.6}} onChange={e=>F('bio',e.target.value)} onFocus={onF} onBlur={offF}/></div>
              </>}

              {/* ── ÇALIŞMA SAATLERİ ── */}
              {(()=>{
                const GUNLER = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
                const DEF_BITIS = (g:string) => g==='Cumartesi'?'14:00':g==='Pazar'?'18:00':'18:00';
                const SAATLER = Array.from({length:48},(_,i)=>{
                  const h=Math.floor(i/2).toString().padStart(2,'0');
                  const m=i%2===0?'00':'30';
                  return `${h}:${m}`;
                });
                // JSON parse eden yardımcı
                type GunSaati = {acik:boolean;baslangic:string;bitis:string};
                const raw = formData.calisma_saatleri;
                let schedule: Record<string,GunSaati> = {};
                try { if(typeof raw==='string'&&raw.startsWith('{')) schedule=JSON.parse(raw); } catch{}
                const getGun = (g:string): GunSaati =>
                  schedule[g] || { acik: g!=='Pazar', baslangic:'09:00', bitis: DEF_BITIS(g) };
                const setGun = (g:string, patch: Partial<GunSaati>) => {
                  const next = { ...schedule, [g]: { ...getGun(g), ...patch } };
                  F('calisma_saatleri', JSON.stringify(next));
                };
                const selStyle: React.CSSProperties = {
                  padding:'5px 8px', borderRadius:8, border:`1px solid ${T.border}`,
                  background:'white', color:T.text, fontSize:12, fontFamily:'inherit',
                  cursor:'pointer', outline:'none', appearance:'none' as any,
                };
                return (
                  <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
                    <label style={{ ...LBL, marginBottom:10 }}>Çalışma Saatleri</label>
                    {/* 24 saat toggle */}
                    <div onClick={()=>F('acik_24_saat',!formData.acik_24_saat)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', background:T.bg, borderRadius:10, border:`1.5px solid ${formData.acik_24_saat?T.navy:T.border}`, cursor:'pointer', marginBottom:10 }}>
                      <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${formData.acik_24_saat?T.navy:T.border}`, background:formData.acik_24_saat?T.navy:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {formData.acik_24_saat&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:T.text }}>24 Saat Açık</span>
                    </div>
                    {/* Günlük saat seçici */}
                    {!formData.acik_24_saat && (
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {GUNLER.map(g=>{
                          const gun = getGun(g);
                          return (
                            <div key={g} style={{ display:'grid', gridTemplateColumns:'90px 1fr', gap:8, alignItems:'center', padding:'7px 10px', borderRadius:9, background: gun.acik ? T.bg : 'rgba(0,0,0,.02)', border:`1px solid ${gun.acik?T.border:'#E5E7EB'}` }}>
                              {/* Gün adı + açık/kapalı toggle */}
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <div onClick={()=>setGun(g,{acik:!gun.acik})}
                                  style={{ width:34, height:20, borderRadius:10, background:gun.acik?T.navy:'#D1D5DB', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
                                  <div style={{ position:'absolute', top:2, left: gun.acik?16:2, width:16, height:16, borderRadius:'50%', background:'white', boxShadow:'0 1px 3px rgba(0,0,0,.2)', transition:'left .2s' }}/>
                                </div>
                                <span style={{ fontSize:12, fontWeight: gun.acik?600:400, color: gun.acik?T.text:T.muted, whiteSpace:'nowrap' }}>{g.slice(0,3)}</span>
                              </div>
                              {/* Saatler veya kapalı etiketi */}
                              {gun.acik ? (
                                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                  <select value={gun.baslangic} onChange={e=>setGun(g,{baslangic:e.target.value})} style={selStyle}>
                                    {SAATLER.map(s=><option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <span style={{ fontSize:11, color:T.muted }}>–</span>
                                  <select value={gun.bitis} onChange={e=>setGun(g,{bitis:e.target.value})} style={selStyle}>
                                    {SAATLER.map(s=><option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              ) : (
                                <span style={{ fontSize:12, color:T.muted, fontStyle:'italic' }}>Kapalı</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── SOSYAL MEDYA ── */}
              <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
                <label style={{ ...LBL, marginBottom:10 }}>Sosyal Medya</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { key:'instagram_url', label:'Instagram', placeholder:'https://instagram.com/hesap_adi', color:'#E1306C' },
                    { key:'facebook_url',  label:'Facebook',  placeholder:'https://facebook.com/sayfa_adi', color:'#1877F2' },
                    { key:'linkedin_url',  label:'LinkedIn',  placeholder:'https://linkedin.com/in/...', color:'#0A66C2' },
                  ].map(s=>(
                    <div key={s.key} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {s.key==='instagram_url'&&<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                        {s.key==='facebook_url'&&<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>}
                        {s.key==='linkedin_url'&&<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>}
                      </div>
                      <input
                        type="url"
                        value={String((formData as any)[s.key]||'')}
                        placeholder={s.placeholder}
                        style={{...INP, flex:1}}
                        onChange={e=>F(s.key,e.target.value)}
                        onFocus={onF} onBlur={offF}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>)}

            {/* ── DETAYLAR ── */}
            {sec==='details' && (<>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Detaylar & Özellikler</div>

              {et==='hastane'&&<div className="panel-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div><label style={LBL}>Doktor Sayısı</label><input type="number" value={formData.docs??''} placeholder="50" style={INP} onChange={e=>F('docs',e.target.value===''?null:Number(e.target.value))} onFocus={onF} onBlur={offF}/></div>
                <div><label style={LBL}>Yatak Sayısı</label><input type="number" value={formData.beds??''} placeholder="200" style={INP} onChange={e=>F('beds',e.target.value===''?null:Number(e.target.value))} onFocus={onF} onBlur={offF}/></div>
                <div style={{ gridColumn:'1/-1' }}><label style={LBL}>Kuruluş Yılı</label><input type="number" value={formData.founded??''} placeholder="1990" style={INP} onChange={e=>F('founded',e.target.value===''?null:Number(e.target.value))} onFocus={onF} onBlur={offF}/></div>
              </div>}

              {(et==='klinik'||et==='doktor')&&(
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    ...(et==='klinik'?[{key:'online',label:'Online Randevu'},{key:'acil',label:'Acil Servis'}]:[]),
                    ...(et==='doktor'?[{key:'online',label:'Online Konsültasyon'}]:[]),
                  ].map(cb=>(
                    <div key={cb.key} onClick={()=>F(cb.key,!formData[cb.key])}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:T.bg, borderRadius:10, border:`1.5px solid ${formData[cb.key]?T.navy:T.border}`, cursor:'pointer' }}>
                      <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${formData[cb.key]?T.navy:T.border}`, background:formData[cb.key]?T.navy:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {formData[cb.key]&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{cb.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {et==='doktor'&&<div><label style={LBL}>Kabul Edilen Sigortalar</label><input value={String(formData.sigorta||'')} placeholder="SGK, Özel Sigorta..." style={INP} onChange={e=>F('sigorta',e.target.value)} onFocus={onF} onBlur={offF}/></div>}


              {(et==='klinik'||et==='hastane'||et==='doktor')&&(
                <div><label style={{ ...LBL, marginBottom:10 }}>Uzmanlık Alanları</label>
                  <SpecPicker value={specs} onChange={val=>F(et==='doktor'?'tags':'specs',val)} entityType={et}/>
                </div>
              )}

              {/* Yabancı Diller (hastane/eczane — doktor & klinik'te ayrı Mesleki Bilgiler sekmesinde) */}
              {et!=='doktor' && et!=='klinik' && (()=>{
                const diller: string[] = Array.isArray(formData.yabanci_diller) ? formData.yabanci_diller : [];
                const addDil = (v:string) => { const t=v.trim(); if(t && !diller.some(d=>d.toLocaleLowerCase('tr')===t.toLocaleLowerCase('tr'))) F('yabanci_diller',[...diller,t]); setDilInput(''); };
                const delDil = (i:number) => F('yabanci_diller', diller.filter((_,j)=>j!==i));
                const PRESET=['İngilizce','Almanca','Fransızca','Arapça','Rusça','Ukraynaca','Azerice'];
                return (
                  <div>
                    <label style={{ ...LBL, marginBottom:10 }}>Yabancı Diller <span style={{ textTransform:'none', letterSpacing:0, fontWeight:600 }}>· konuşulan diller</span></label>
                    {diller.length>0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                        {diller.map((d,i)=>(
                          <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:13, fontWeight:600, color:T.navy, background:'rgba(27,58,105,.06)', border:`1px solid ${T.border}`, borderRadius:9, padding:'6px 10px' }}>
                            {d}
                            <button type="button" onClick={()=>delDil(i)} title="Kaldır" style={{ border:'none', background:'none', color:T.red, cursor:'pointer', fontSize:15, lineHeight:1, padding:0, fontFamily:'inherit' }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:7, marginBottom:10 }}>
                      <input value={dilInput} placeholder="Dil ekleyin (ör. İtalyanca)" style={{ ...INP, flex:1 }}
                        onChange={e=>setDilInput(e.target.value)} onFocus={onF} onBlur={offF}
                        onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addDil(dilInput); } }}/>
                      <button type="button" onClick={()=>addDil(dilInput)}
                        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 13px', borderRadius:9, border:`1.5px dashed ${T.navy}`, background:'rgba(27,58,105,.04)', color:T.navy, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Ekle</button>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {PRESET.filter(p=>!diller.some(d=>d.toLocaleLowerCase('tr')===p.toLocaleLowerCase('tr'))).map(p=>(
                        <button key={p} type="button" onClick={()=>addDil(p)}
                          style={{ padding:'5px 11px', borderRadius:8, border:`1px dashed ${T.border}`, background:'white', color:T.muted, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>+ {p}</button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>)}

            {/* ── MESLEKİ BİLGİLER (doktor) ── */}
            {sec==='meslek' && (et==='doktor'||et==='klinik') && (()=>{
              const YIL = new Date().getFullYear();
              type Deneyim = { kurum:string; baslangic:string; bitis:string };
              type Sertifika = { ad:string; url:string };
              const deneyimler: Deneyim[] = Array.isArray(formData.deneyimler) ? formData.deneyimler : [];
              const sertifikalar: Sertifika[] = Array.isArray(formData.sertifikalar) ? formData.sertifikalar : [];
              const setDen = (i:number, patch:Partial<Deneyim>) => { const a=[...deneyimler]; a[i]={...a[i],...patch}; F('deneyimler',a); };
              const addDen = () => F('deneyimler',[...deneyimler,{kurum:'',baslangic:'',bitis:''}]);
              const delDen = (i:number) => F('deneyimler',deneyimler.filter((_,j)=>j!==i));
              const setCertItem = (i:number, patch:Partial<Sertifika>) => { const a=[...sertifikalar]; a[i]={...a[i],...patch}; F('sertifikalar',a); };
              const addCert = () => F('sertifikalar',[...sertifikalar,{ad:'',url:''}]);
              const delCert = (i:number) => F('sertifikalar',sertifikalar.filter((_,j)=>j!==i));
              const bas = Number(formData.deneyim_baslangic)||0;
              const yilFarki = bas>=1950 && bas<=YIL ? YIL-bas : 0;
              const miniBtn: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 13px', borderRadius:9, border:`1.5px dashed ${T.navy}`, background:'rgba(27,58,105,.04)', color:T.navy, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' };
              const delBtn: React.CSSProperties = { width:28, height:28, borderRadius:8, border:`1px solid ${T.border}`, background:'white', color:T.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 };
              return (<>
                <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Mesleki Bilgiler</div>

                {/* Deneyim başlangıcı + kurumlar */}
                <div className="panel-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div>
                    <label style={LBL}>Mesleğe Başlangıç Yılı</label>
                    <input type="number" value={formData.deneyim_baslangic??''} placeholder="2013" style={INP}
                      onChange={e=>F('deneyim_baslangic', e.target.value===''?null:Number(e.target.value))} onFocus={onF} onBlur={offF}/>
                    {yilFarki>0 && <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>≈ {yilFarki} yıllık deneyim olarak gösterilir</div>}
                  </div>
                  <div>
                    <label style={LBL}>Diploma Aldığı Kurum</label>
                    <input value={String(formData.okul||'')} placeholder="İstanbul Üniversitesi" style={INP}
                      onChange={e=>F('okul', e.target.value)} onFocus={onF} onBlur={offF}/>
                  </div>
                </div>
                <div>
                  <label style={LBL}>Uzmanlık Aldığı Kurum</label>
                  <input value={String(formData.uzmanlik_kurum||'')} placeholder="Üsküdar Üniversitesi" style={INP}
                    onChange={e=>F('uzmanlik_kurum', e.target.value)} onFocus={onF} onBlur={offF}/>
                </div>

                {/* Deneyimler (iş geçmişi) */}
                <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
                  <label style={{ ...LBL, marginBottom:10 }}>Deneyimler <span style={{ textTransform:'none', letterSpacing:0, fontWeight:600 }}>· çalıştığı yerler</span></label>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {deneyimler.map((d,i)=>(
                      <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'12px', borderRadius:12, background:T.bg, border:`1px solid ${T.border}` }}>
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                          <input value={d.kurum} placeholder="Kurum / klinik adı" style={INP} onChange={e=>setDen(i,{kurum:e.target.value})} onFocus={onF} onBlur={offF}/>
                          <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                            <input value={d.baslangic} placeholder="Başlangıç (2021)" style={{...INP, flex:1}} onChange={e=>setDen(i,{baslangic:e.target.value})} onFocus={onF} onBlur={offF}/>
                            <span style={{ color:T.muted, fontSize:13 }}>–</span>
                            <input value={d.bitis} placeholder="Bitiş (boş = Günümüz)" style={{...INP, flex:1}} onChange={e=>setDen(i,{bitis:e.target.value})} onFocus={onF} onBlur={offF}/>
                          </div>
                        </div>
                        <button type="button" onClick={()=>delDen(i)} style={delBtn} title="Sil">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addDen} style={miniBtn}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      Deneyim ekle
                    </button>
                  </div>
                </div>

                {/* Sertifikalar */}
                <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
                  <label style={{ ...LBL, marginBottom:10 }}>Sertifikalar <span style={{ textTransform:'none', letterSpacing:0, fontWeight:600 }}>· ad + görsel</span></label>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {sertifikalar.map((c,i)=>(
                      <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px', borderRadius:12, background:T.bg, border:`1px solid ${T.border}` }}>
                        <div onClick={()=>certUp===null&&pickCert(i)}
                          onDragOver={e=>{ e.preventDefault(); if(certUp===null) setCertDrag(i); }}
                          onDragLeave={()=>setCertDrag(d=>d===i?null:d)}
                          onDrop={e=>{ e.preventDefault(); setCertDrag(null); const f=e.dataTransfer.files?.[0]; if(f && certUp===null) uploadCert(f,i); }}
                          title="Tıklayın ya da dosyayı buraya sürükleyin (JPEG, PNG, HEIC, PDF…)"
                          style={{ width:56, height:56, borderRadius:10, flexShrink:0, overflow:'hidden', border:`1.5px dashed ${certDrag===i?T.navy:T.border}`, background:certDrag===i?'rgba(27,58,105,.06)':'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:certUp===i?'wait':'pointer', transition:'all .12s' }}>
                          {certUp===i ? (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke={T.border} strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke={T.navy} strokeWidth="2" strokeLinecap="round"/></svg>
                          ) : c.url && /\.pdf(\?|$)/i.test(c.url) ? (
                            <div style={{ fontSize:9, fontWeight:800, color:T.red, letterSpacing:'.5px' }}>PDF</div>
                          ) : c.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          )}
                        </div>
                        <input value={c.ad} placeholder="Sertifika adı (ör. NDT/Bobath)" style={{...INP, flex:1}} onChange={e=>setCertItem(i,{ad:e.target.value})} onFocus={onF} onBlur={offF}/>
                        <button type="button" onClick={()=>delCert(i)} style={delBtn} title="Sil">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addCert} style={miniBtn}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      Sertifika ekle
                    </button>
                  </div>
                </div>

                {/* Yabancı Diller */}
                {(() => {
                  const diller: string[] = Array.isArray(formData.yabanci_diller) ? formData.yabanci_diller : [];
                  const addDil = (v: string) => { const t = v.trim(); if (t && !diller.some(d => d.toLocaleLowerCase('tr') === t.toLocaleLowerCase('tr'))) F('yabanci_diller', [...diller, t]); setDilInput(''); };
                  const delDil = (i: number) => F('yabanci_diller', diller.filter((_, j) => j !== i));
                  const PRESET = ['İngilizce', 'Almanca', 'Fransızca', 'Arapça', 'İspanyolca', 'Rusça'];
                  return (
                    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                      <label style={{ ...LBL, marginBottom: 10 }}>Yabancı Diller <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>· bildiği diller</span></label>
                      {diller.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                          {diller.map((d, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: T.navy, background: 'rgba(27,58,105,.06)', border: `1px solid ${T.border}`, borderRadius: 9, padding: '6px 10px' }}>
                              {d}
                              <button type="button" onClick={() => delDil(i)} title="Kaldır" style={{ border: 'none', background: 'none', color: T.red, cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: 0, fontFamily: 'inherit' }}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
                        <input value={dilInput} placeholder="Dil ekleyin (ör. İtalyanca)" style={{ ...INP, flex: 1 }}
                          onChange={e => setDilInput(e.target.value)} onFocus={onF} onBlur={offF}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDil(dilInput); } }} />
                        <button type="button" onClick={() => addDil(dilInput)} style={miniBtn}>Ekle</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {PRESET.filter(p => !diller.some(d => d.toLocaleLowerCase('tr') === p.toLocaleLowerCase('tr'))).map(p => (
                          <button key={p} type="button" onClick={() => addDil(p)}
                            style={{ padding: '5px 11px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'white', color: T.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ {p}</button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>);
            })()}

            {/* ── SİTEME EKLE (randevu embed) ── */}
            {sec==='embed' && (()=>{
              const SITE = 'https://www.hekimhane.com.tr';
              const src = `${SITE}/embed/randevu?type=${et}&id=${selectedClaim.entity_id}`;
              const iframeKodu = `<iframe src="${src}" width="100%" height="640" style="border:0;max-width:480px" loading="lazy" title="Randevu Al"></iframe>`;
              const kopyala = () => {
                try { navigator.clipboard.writeText(iframeKodu); setEmbedCopied(true); setTimeout(()=>setEmbedCopied(false), 2000); } catch {}
              };
              return (<>
                <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Randevu Modülünü Sitenize Ekleyin</div>
                <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, margin:0 }}>
                  Aşağıdaki kodu kendi web sitenize yapıştırın; ziyaretçileriniz doğrudan sizin sitenizden randevu talebi bıraksın.
                  Talepler yine Hekimhane panelinizdeki <strong style={{ color:T.text }}>Randevu Talepleri</strong> sekmesine düşer ve size e-posta gönderilir.
                </p>

                {/* Kod kutusu */}
                <div>
                  <label style={LBL}>HTML Kodu</label>
                  <textarea readOnly value={iframeKodu} onFocus={e=>e.currentTarget.select()}
                    style={{ ...INP, minHeight:88, fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize:12, lineHeight:1.5, resize:'vertical', background:'#F8FAFF' }} />
                  <button onClick={kopyala}
                    style={{ marginTop:8, padding:'9px 16px', borderRadius:10, border:'none', background: embedCopied ? T.green : T.navy, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:7 }}>
                    {embedCopied
                      ? <><Ic d={icons.check} size={14}/>Kopyalandı</>
                      : <><Ic d="M9 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z M5 15H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" size={14}/>Kodu Kopyala</>}
                  </button>
                </div>

                {/* Canlı önizleme */}
                <div>
                  <label style={LBL}>Önizleme</label>
                  <div style={{ border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden', background:'#fff' }}>
                    <iframe src={src} style={{ width:'100%', height:560, border:0 }} title="Randevu önizleme" />
                  </div>
                </div>

                <div style={{ display:'flex', gap:9, padding:'11px 13px', background:'#F0F9FF', borderRadius:10, border:'1px solid #BAE6FD' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <p style={{ fontSize:12, color:'#075985', lineHeight:1.55, margin:0 }}>
                    Kod her sitede çalışır (WordPress, Wix, kendi siteniz…). Rengi değiştirmek için bağlantının sonuna
                    <code style={{ background:'#E0F2FE', padding:'1px 5px', borderRadius:5, margin:'0 3px' }}>&amp;accent=1B3A69</code> gibi bir renk ekleyebilirsiniz.
                  </p>
                </div>
              </>);
            })()}

            {/* ── FOTOĞRAFLAR ── */}
            {sec==='photos' && (<>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Fotoğraflar</div>

              {/* Profil Fotoğrafı */}
              <div>
                <label style={LBL}>Profil Fotoğrafı</label>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  {/* Kare drag-drop alanı */}
                  <div
                    style={{ position:'relative', width:100, height:100, flexShrink:0, borderRadius:14, overflow:'hidden',
                      border:`2px dashed ${dragOver==='profile'?T.navy:profUrl?'transparent':T.border}`,
                      background: dragOver==='profile'?`rgba(27,58,105,.06)`:profUrl?'transparent':T.bg,
                      cursor: uploading['profile'] ? 'wait' : 'pointer', transition:'border-color .15s,background .15s' }}
                    onClick={() => !uploading['profile'] && handleFilePick('profile')}
                    onDragOver={e=>{e.preventDefault();setDragOver('profile');}}
                    onDragLeave={()=>setDragOver(null)}
                    onDrop={e=>handleDrop(e,'profile')}>
                    {uploading['profile'] ? (
                      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}>
                          <circle cx="9" cy="9" r="7" stroke={T.border} strokeWidth="2"/>
                          <path d="M9 2a7 7 0 0 1 7 7" stroke={T.navy} strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontSize:9, color:T.muted }}>Yükleniyor</span>
                      </div>
                    ) : profUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={profUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0)', transition:'background .2s' }}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,.45)'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,0)'}>
                          <span style={{ color:'white', fontSize:10, fontWeight:700, opacity:0 }}
                            onMouseEnter={e=>(e.currentTarget as HTMLSpanElement).style.opacity='1'}
                            onMouseLeave={e=>(e.currentTarget as HTMLSpanElement).style.opacity='0'}>
                            Değiştir
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dragOver==='profile'?T.navy:T.border} strokeWidth="1.5" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span style={{ fontSize:9, color:dragOver==='profile'?T.navy:T.muted, fontWeight:600, textAlign:'center', lineHeight:1.3 }}>
                          {dragOver==='profile' ? 'Bırak!' : 'Sürükle\nveya tıkla'}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* URL giriş alanı + sil */}
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                    <input value={profUrl} onChange={e=>F(profKey,e.target.value.trim())} placeholder="veya URL yapıştırın..."
                      style={{...INP}} onFocus={onF} onBlur={offF}/>
                    <p style={{ fontSize:11, color:T.muted, margin:0, lineHeight:1.5 }}>
                      Resmi sürükleyip bırakın, tıklayıp seçin veya URL yapıştırın. Maks. 8 MB.
                    </p>
                    {profUrl&&(
                      <button type="button" onClick={()=>F(profKey,'')}
                        style={{ alignSelf:'flex-start', padding:'5px 12px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', color:'#DC2626' }}>
                        Fotoğrafı Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Galeri */}
              <div>
                <label style={LBL}>Galeri Fotoğrafları ({gall.length}/8)</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:8 }}>
                  {Array.from({length:8}).map((_,i)=>{
                    const url      = gall[i]||'';
                    const slotKey  = String(i);
                    const isUp     = !!uploading[slotKey];
                    const isDrag   = dragOver === slotKey;
                    return (
                      <div key={i}>
                        <div
                          style={{ position:'relative', aspectRatio:'1', borderRadius:10, overflow:'hidden',
                            border:`2px dashed ${isDrag?T.navy:url?'transparent':T.border}`,
                            background: isDrag?`rgba(27,58,105,.06)`:url?'transparent':T.bg,
                            cursor: isUp?'wait':'pointer', transition:'border-color .15s,background .15s' }}
                          onClick={() => { if (!isUp) { if (url) { /* tıklama = değiştir */ handleFilePick(i); } else { handleFilePick(i); } } }}
                          onDragOver={e=>{e.preventDefault();setDragOver(slotKey);}}
                          onDragLeave={()=>setDragOver(null)}
                          onDrop={e=>handleDrop(e,i)}>
                          {isUp ? (
                            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, background:T.bg }}>
                              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}>
                                <circle cx="9" cy="9" r="7" stroke={T.border} strokeWidth="2"/>
                                <path d="M9 2a7 7 0 0 1 7 7" stroke={T.navy} strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <span style={{ fontSize:9, color:T.muted }}>Yükleniyor</span>
                            </div>
                          ) : url ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'background .2s' }}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,.5)'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,0)'}>
                                <button type="button" onClick={ev=>{ev.stopPropagation();handleFilePick(i);}}
                                  style={{ background:'rgba(255,255,255,.9)', border:'none', borderRadius:5, padding:'3px 7px', fontSize:10, fontWeight:700, cursor:'pointer', color:T.navy }}>
                                  Değiştir
                                </button>
                                <button type="button" onClick={ev=>{ev.stopPropagation();removePh(i);}}
                                  style={{ background:'rgba(239,68,68,.9)', border:'none', borderRadius:5, padding:'3px 7px', fontSize:10, fontWeight:700, cursor:'pointer', color:'white' }}>✕</button>
                              </div>
                            </>
                          ) : (
                            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDrag?T.navy:T.border} strokeWidth="1.5" strokeLinecap="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                              </svg>
                              <span style={{ fontSize:9, color:isDrag?T.navy:T.muted, fontWeight:600 }}>
                                {isDrag ? 'Bırak!' : `${i+1}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize:11, color:T.muted, marginTop:8, lineHeight:1.6 }}>
                  Slota resim sürükleyin veya tıklayarak seçin. JPEG · PNG · WebP · GIF — Maks. 8 MB.
                </p>
              </div>

              {/* ── Profil Arka Planı (tüm hesaplar) ── */}
              {(et==='klinik' || et==='hastane') && (
                <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${T.border}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <label style={{ ...LBL, margin:0 }}>Profil Arka Planı</label>
                  </div>
                  <p style={{ fontSize:11.5, color:T.muted, marginBottom:12, lineHeight:1.6 }}>
                    Apple tarzı, hafif hareketli arka planlardan birini seçin. Profil sayfanızın üst kısmında görünür; yazılar okunur kalır.
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(104px, 1fr))', gap:12 }}>
                    {/* Varsayılan (preset yok) — gerçekte beyaz arka plan, swatch de beyaz */}
                    {(() => {
                      const sel = !coverPresetKey(String(formData.cover||''));
                      return (
                        <button type="button" onClick={()=>F('cover','')}
                          style={{ aspectRatio:'1 / 1', borderRadius:14, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700,
                            background:'#FFFFFF', border:'none',
                            outline: sel ? `3px solid ${T.gold}` : '1px solid rgba(0,0,0,.10)', outlineOffset: sel ? 2 : -1,
                            boxShadow: sel ? '0 6px 18px rgba(212,168,67,.28)' : '0 1px 5px rgba(0,0,0,.06)',
                            display:'flex', alignItems:'flex-end', justifyContent:'center', padding:8 }}>
                          <span style={{ color:'#1B3A69' }}>Varsayılan</span>
                        </button>
                      );
                    })()}
                    {HERO_BACKGROUNDS.map(b=>{
                      const sel = coverPresetKey(String(formData.cover||'')) === b.key;
                      return (
                        <button key={b.key} type="button" onClick={()=>F('cover',`preset:${b.key}`)}
                          style={{ aspectRatio:'1 / 1', borderRadius:14, cursor:'pointer', fontFamily:'inherit', fontSize:11.5, fontWeight:700,
                            background:b.swatch, border:'none',
                            outline: sel ? `3px solid ${T.gold}` : 'none', outlineOffset: sel ? 2 : 0,
                            boxShadow: sel ? '0 6px 18px rgba(212,168,67,.35)' : '0 1px 5px rgba(0,0,0,.12)',
                            display:'flex', alignItems:'flex-end', justifyContent:'center', padding:8 }}>
                          <span style={{ color:'white', textShadow:'0 1px 3px rgba(0,0,0,.55)' }}>{b.name.split(' (')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>)}

            {/* ── KONUM ── */}
            {sec==='konum' && (
              <KonumPicker
                lat={formData.lat ? Number(formData.lat) : null}
                lng={formData.lng ? Number(formData.lng) : null}
                adres={String(formData.adres || formData.address || '')}
                il={String(formData.il || '')}
                ilce={String(formData.ilce || '')}
                name={entityDisplayName}
                onLatLng={(lat, lng) => { F('lat', lat); F('lng', lng); }}
                T={T} LBL={LBL}
              />
            )}

            {/* ── 360° TUR ── */}
            {sec==='tour' && (<>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>360° Sanal Tur</div>
              <div>
                <label style={LBL}>Sanal Tur — URL veya iframe kodu</label>
                <textarea rows={4} value={String(formData.tour360url||'')}
                  placeholder={'https://my.matterport.com/show/?m=...\nveya\n<iframe src="https://..." allowfullscreen></iframe>'}
                  style={{...INP,resize:'vertical',lineHeight:1.6,fontFamily:'monospace',fontSize:12}}
                  onChange={e=>F('tour360url',e.target.value)} onFocus={onF} onBlur={offF}/>
                <p style={{ fontSize:11, color:T.muted, marginTop:5, lineHeight:1.6 }}>Matterport, Google Street View veya herhangi bir 360° platform desteklenmektedir.</p>
              </div>
              <div>
                <label style={LBL}>360° Panorama Fotoğraf (equirectangular .jpg/.png)</label>
                <textarea rows={3} value={String(formData.photo360||'')}
                  placeholder={'https://ornek.com/foto.jpg\nveya iframe kodu'}
                  style={{...INP,resize:'vertical',lineHeight:1.6,fontFamily:'monospace',fontSize:12}}
                  onChange={e=>F('photo360',e.target.value)} onFocus={onF} onBlur={offF}/>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE`, marginTop:8 }}>Tanıtım Videosu</div>
              <div>
                <label style={LBL}>Video — YouTube / Vimeo linki veya embed kodu</label>
                <textarea rows={4} value={String(formData.video_url||'')}
                  placeholder={'https://youtube.com/watch?v=...\nveya\nhttps://vimeo.com/123456789\nveya\n<iframe src="https://www.youtube.com/embed/..." ...></iframe>'}
                  style={{...INP,resize:'vertical',lineHeight:1.6,fontFamily:'monospace',fontSize:12}}
                  onChange={e=>F('video_url',e.target.value)} onFocus={onF} onBlur={offF}/>
                <p style={{ fontSize:11, color:T.muted, marginTop:5, lineHeight:1.6 }}>YouTube, Vimeo veya diğer platformların video linki ya da embed kodunu yapıştırın.</p>
              </div>
            </>)}

          </div>{/* /form card */}

          {/* Alt kaydet butonu — mobilde mesaj üste, butonlar tam genişlik satır */}
          <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:10, justifyContent:'flex-end', alignItems: isMobile ? 'stretch' : 'center', paddingTop:4 }}>
            {saveMsg && (
              <span style={{ fontSize:12.5, fontWeight:600, color:saveMsg.ok?T.green:T.red, display:'flex', alignItems:'center', gap:5, alignSelf: isMobile ? 'flex-start' : 'center' }}>
                <Ic d={saveMsg.ok?icons.check:icons.info} size={14}/>{saveMsg.text}
              </span>
            )}
            <div style={{ display:'flex', gap:10, width: isMobile ? '100%' : undefined }}>
              <button onClick={()=>{setFormData(entityData||{});setSaveMsg(null);}}
                style={{ padding:'12px 20px', borderRadius:11, border:`1.5px solid ${T.border}`, background:'white', color:T.muted, fontSize:13.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flex: isMobile ? '1 1 0' : undefined, whiteSpace:'nowrap' }}>
                Sıfırla
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding:'12px 24px', borderRadius:11, border:'none', background:saving?'#9CA3AF':T.navy, color:'white', fontSize:13.5, fontWeight:700, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, fontFamily:'inherit', flex: isMobile ? '2 1 0' : undefined, whiteSpace:'nowrap' }}>
                {saving
                  ? <><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Kaydediliyor</>
                  : <><Ic d={icons.check} size={14}/>Değişiklikleri Kaydet</>
                }
              </button>
            </div>
          </div>

        </div>{/* /sol */}

        {/* ── SAĞ: Canlı Önizleme ── */}
        <div style={{ position:'sticky', top:148, display: isMobile ? 'none' : undefined }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ height:1, flex:1, background:T.border }}/>
            <span style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'1.2px' }}>Canlı Önizleme</span>
            <div style={{ height:1, flex:1, background:T.border }}/>
          </div>

          {/* Tarayıcı çerçevesi */}
          <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${T.border}`, boxShadow:'0 8px 32px rgba(0,0,0,.08)' }}>
            {/* Bar */}
            <div style={{ background:'#F3F4F6', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:'flex', gap:5 }}>
                {['#FC5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
              </div>
              <div style={{ flex:1, background:'white', borderRadius:6, padding:'4px 10px', fontSize:10, color:'#6B7280', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                hekimhane.com.tr/{et==='klinik'?'klinikler':et==='hastane'?'hastaneler':et==='doktor'?'doktorlar':'eczaneler'}/...
              </div>
            </div>

            {/* Profil içeriği */}
            <div style={{ background:'#F9FAFB' }}>

              {/* Header — premium arka plan seçiliyse gradient + okunur beyaz yazı */}
              <div style={{ position:'relative', padding:'18px 22px', display:'flex', gap:14, alignItems:'flex-start', borderBottom:`1px solid ${T.border}`,
                background: previewBg ? previewBg.swatch : 'white' }}>
                {previewBg && <div style={{ position:'absolute', inset:0, background: pvLight ? 'linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,253,247,.42))' : 'linear-gradient(180deg,rgba(8,18,34,.25),rgba(8,18,34,.5))', pointerEvents:'none' }} />}
                <div style={{ position:'relative', width:60, height:60, borderRadius:15, background: previewBg ? 'rgba(255,255,255,.9)' : '#E8F0FE', border:`1px solid ${previewBg ? 'rgba(255,255,255,.7)' : '#BFDBFE'}`, flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', color:T.navy }}>
                  {profUrl ? <img src={profUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> /* eslint-disable-line @next/next/no-img-element */
                           : <Ic d={icons.building} size={22}/>}
                </div>
                <div style={{ position:'relative', flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:800, color: previewBg ? (pvLight ? '#132B52' : '#fff') : '#1A2744', textShadow: (previewBg && !pvLight) ? '0 1px 4px rgba(0,0,0,.4)' : 'none', lineHeight:1.2, marginBottom:5 }}>{entityDisplayName||'İşletme Adı'}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
                    {(formData.type||formData.spec)&&<span style={{ fontSize:10, fontWeight:600, background:'#F0F4FF', color:'#1B3A69', padding:'2px 8px', borderRadius:20, border:'1px solid #C7D7F8' }}>{formData.type||formData.spec}</span>}
                    {formData.il&&<span style={{ fontSize:10, color: previewBg ? (pvLight ? 'rgba(19,43,82,.8)' : 'rgba(255,255,255,.9)') : '#6B7A99', textShadow: (previewBg && !pvLight) ? '0 1px 3px rgba(0,0,0,.4)' : 'none', display:'flex', alignItems:'center', gap:3 }}><Ic d={icons.map} size={9}/>{formData.il}{formData.ilce?`, ${formData.ilce}`:''}</span>}
                    {formData.online&&<span style={{ fontSize:10, background:'#F0FDF4', color:'#166534', padding:'2px 7px', borderRadius:10, fontWeight:600 }}>Online</span>}
                  </div>
                  {specs.length>0&&<div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:5 }}>{specs.slice(0,5).map((s:string)=><span key={s} style={{ fontSize:9, background:'#EFF6FF', color:'#1D4ED8', padding:'2px 7px', borderRadius:8 }}>{s}</span>)}{specs.length>5&&<span style={{ fontSize:9, color: previewBg ? 'rgba(255,255,255,.85)' : T.muted }}>+{specs.length-5}</span>}</div>}
                </div>
              </div>

              {/* Tab bar */}
              <div style={{ background:'white', borderBottom:`1px solid ${T.border}`, padding:'0 22px', display:'flex', overflowX:'auto' }}>
                {(['Genel','Konum','Fotoğraflar','360° Tur','Yorumlar'] as const).map((tab,i)=>{
                  const isA=(sec==='info'&&i===0)||(sec==='details'&&i===0)||(sec==='photos'&&i===2)||(sec==='tour'&&i===3);
                  return <div key={tab} style={{ padding:'10px 10px', fontSize:11, fontWeight:isA?700:500, color:isA?T.navy:T.muted, borderBottom:isA?`2px solid ${T.navy}`:'2px solid transparent', whiteSpace:'nowrap', flexShrink:0 }}>{tab}</div>;
                })}
              </div>

              {/* İçerik */}
              <div style={{ padding:'14px 22px', minHeight:180 }}>

                {(sec==='info'||sec==='details')&&(
                  <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                    {(formData.tel||formData.website||formData.adres||formData.address)&&(
                      <div style={{ background:'white', borderRadius:11, border:`1px solid ${T.border}`, padding:'11px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>İletişim</div>
                        {formData.tel&&<div style={{ fontSize:11, color:'#374151', display:'flex', alignItems:'center', gap:6 }}><Ic d={icons.phone} size={10}/>{formData.tel}</div>}
                        {formData.website&&<div style={{ fontSize:11, color:'#3B82F6', display:'flex', alignItems:'center', gap:6 }}><Ic d={icons.eye} size={10}/>{formData.website}</div>}
                        {(formData.adres||formData.address)&&<div style={{ fontSize:11, color:'#374151', display:'flex', alignItems:'flex-start', gap:6 }}><Ic d={icons.map} size={10}/><span style={{ lineHeight:1.5 }}>{formData.adres||formData.address}</span></div>}
                      </div>
                    )}
                    {et==='hastane'&&(formData.docs||formData.beds||formData.founded)&&(
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>
                        {[{l:'Doktor',v:formData.docs},{l:'Yatak',v:formData.beds},{l:'Kuruluş',v:formData.founded}].filter(x=>x.v!=null).map(x=>(
                          <div key={x.l} style={{ background:'white', borderRadius:9, padding:'9px 10px', border:`1px solid ${T.border}`, textAlign:'center' }}>
                            <div style={{ fontSize:16, fontWeight:800, color:T.navy }}>{String(x.v)}</div>
                            <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{x.l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {et==='doktor'&&formData.fee&&<div style={{ background:'white', borderRadius:9, padding:'9px 12px', border:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={{ fontSize:11, color:T.muted }}>Muayene Ücreti</span><span style={{ fontSize:14, fontWeight:800, color:T.navy }}>{formData.fee}₺</span></div>}
                    {et==='doktor'&&formData.bio&&<div style={{ background:'white', borderRadius:9, padding:'10px 12px', border:`1px solid ${T.border}`, fontSize:11, color:'#374151', lineHeight:1.6 }}>{String(formData.bio).slice(0,120)}{String(formData.bio).length>120?'...':''}</div>}
                    {!formData.tel&&!formData.adres&&!formData.address&&!formData.website&&<div style={{ textAlign:'center', padding:'28px 16px', color:T.muted, fontSize:11 }}><Ic d={icons.info} size={18}/><p style={{ marginTop:6 }}>Sol taraftan bilgileri doldurun</p></div>}
                  </div>
                )}

                {sec==='photos'&&(
                  <div>
                    {/* Profil fotoğrafı önizleme */}
                    {profUrl&&<div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'10px 12px', background:'white', borderRadius:10, border:`1px solid ${T.border}` }}>
                      <img src={profUrl} alt="" style={{ width:44, height:44, borderRadius:10, objectFit:'cover', border:`1px solid ${T.border}` }}/> {/* eslint-disable-line @next/next/no-img-element */}
                      <span style={{ fontSize:11, color:T.muted }}>Profil fotoğrafı</span>
                    </div>}
                    {gall.length>0&&<div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>{gall.map((url,i)=><div key={i} style={{ aspectRatio:'1', borderRadius:8, overflow:'hidden', border:`1px solid ${T.border}` }}><img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/></div>)}</div>} {/* eslint-disable-line @next/next/no-img-element */}
                    {!profUrl&&gall.length===0&&<div style={{ textAlign:'center', padding:'36px 16px', color:T.muted, fontSize:11 }}><Ic d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17A4 4 0 1 0 12 9a4 4 0 0 0 0 8z" size={22}/><p style={{ marginTop:6 }}>Fotoğraf ekleyin — solda URL yapıştırın</p></div>}
                  </div>
                )}

                {sec==='tour'&&(()=>{
                  const raw=String(formData.tour360url||formData.photo360||'');
                  const m=raw.match(/src=["']([^"']+)["']/);
                  const src=m?m[1]:raw;
                  if(!src||src.includes('<')||src.includes(' ')) return <div style={{ textAlign:'center', padding:'36px 16px', color:T.muted, fontSize:11 }}><Ic d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" size={22}/><p style={{ marginTop:6 }}>360° tur URL girin — burada görünecek</p></div>;
                  return <div style={{ borderRadius:11, overflow:'hidden', border:`1px solid ${T.border}`, aspectRatio:'16/9' }}><iframe src={src} style={{ width:'100%', height:'100%', border:'none' }} allowFullScreen/></div>;
                })()}

              </div>
            </div>
          </div>

          <p style={{ fontSize:10, color:T.muted, textAlign:'center', marginTop:8, lineHeight:1.6 }}>
            Sol taraftaki alanları düzenledikçe önizleme gerçek zamanlı güncellenir
          </p>
        </div>{/* /sağ */}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HEKİMKART SEKMESİ — çoklu profil + otomatik doldurma
═══════════════════════════════════════════════ */

// KartField: HekimKartTab DIŞINDA tanımlı — her render'da yeniden oluşmaz,
// focus kaybı olmaz.
function KartField({ label, value, onChange, placeholder, type = 'text', half = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; half?: boolean;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5, flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth: half ? 140 : 'auto' }}>
      <label style={{ fontSize:11.5, fontWeight:700, color:T.muted, letterSpacing:'.3px', textTransform:'uppercase' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding:'10px 12px', borderRadius:10, border:`1px solid ${T.border}`, fontSize:13.5, fontFamily:'inherit', color:T.text, outline:'none' }}
        onFocus={e => (e.target.style.borderColor = T.navy)}
        onBlur={e  => (e.target.style.borderColor = T.border)}
      />
    </div>
  );
}
interface HekimKartData {
  id?: string;
  slug: string;
  ad: string; soyad: string; unvan: string; spec: string;
  tel: string; instagram_url: string; facebook_url: string;
  photo_url: string; il: string; ilce: string;
  clinic_name: string; bio: string; iban: string;
  rezervasyon_url: string; website_url: string; maps_url: string; hekimhane_url: string;
  entity_id?: string; entity_type?: string;
}

const EMPTY_KART: HekimKartData = {
  slug: '', ad: '', soyad: '', unvan: '', spec: '', tel: '',
  instagram_url: '', facebook_url: '', photo_url: '',
  il: '', ilce: '', clinic_name: '', bio: '', iban: '',
  rezervasyon_url: '', website_url: '', maps_url: '', hekimhane_url: '',
};

function HekimKartTab({ approvedClaims, profileUrls, user }: {
  approvedClaims: ClaimRequest[];
  profileUrls: Record<string, string>;
  user: User | null;
}) {
  const supa = createSupabaseBrowser();

  // Tüm kayıtlı kartlar — entity_id → kart haritası (ve ham dizi, fallback için)
  const [kartlar,    setKartlar]    = useState<Record<string, HekimKartData>>({});
  const [allKartlar, setAllKartlar] = useState<HekimKartData[]>([]);
  const [loadingK,   setLoadingK]   = useState(true);

  // Aktif düzenleme
  const [activeClaim, setActiveClaim] = useState<ClaimRequest | null>(null);
  const [form,       setForm]       = useState<HekimKartData>(EMPTY_KART);
  const [loadingE,  setLoadingE]  = useState(false); // entity verisi yükleniyor
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');
  const [copied,    setCopied]    = useState(false);
  const [showQr,    setShowQr]    = useState(false);
  const [view,      setView]      = useState<'form'|'preview'>('form');

  // Kartları yükle
  useEffect(() => {
    fetch('/api/kart').then(r => r.json()).then(({ kartlar: ks }) => {
      const arr: HekimKartData[] = ks || [];
      const map: Record<string, HekimKartData> = {};
      arr.forEach((k: HekimKartData) => { if (k.entity_id) map[k.entity_id] = k; });
      setKartlar(map);
      setAllKartlar(arr);
      setLoadingK(false);
    }).catch(() => setLoadingK(false));
  }, []);

  // Tek onaylı profil varsa otomatik seç (seçim ekranını atla); birden fazlaysa kullanıcı seçer.
  useEffect(() => {
    if (!loadingK && approvedClaims.length === 1 && !activeClaim) {
      selectClaim(approvedClaims[0]);
    }
  }, [loadingK, approvedClaims.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Entity verisini çek + form'a doldur
  async function selectClaim(claim: ClaimRequest) {
    setActiveClaim(claim);
    setView('form');
    setError('');
    setSaved(false);

    // Zaten kayıtlı kart varsa onu yükle
    // 1. entity_id ile ara (yeni format)
    // 2. allKartlar içinde entity_id eşleşeni ara (kolon var ama haritada değil)
    // 3. Kullanıcının tek kartı varsa ve entity_id null ise onu kullan (eski format)
    const hekimhaneUrl = profileUrls[claim.id] || '';

    const existing =
      kartlar[claim.entity_id!] ||
      allKartlar.find(k => k.entity_id === claim.entity_id) ||
      (allKartlar.length === 1 && !allKartlar[0].entity_id ? allKartlar[0] : null);
    if (existing) {
      // hekimhane_url'yi her seferinde taze URL ile güncelle
      setForm({ ...EMPTY_KART, ...existing, hekimhane_url: hekimhaneUrl || existing.hekimhane_url });
      return;
    }

    // Yoksa entity'den veri çek
    setLoadingE(true);
    const TABLE: Record<string, string> = {
      doktor: 'doktorlar', klinik: 'klinikler', hastane: 'hastaneler', eczane: 'eczaneler'
    };
    const table = TABLE[claim.entity_type];
    if (!table) { setForm({ ...EMPTY_KART, entity_id: claim.entity_id!, entity_type: claim.entity_type }); setLoadingE(false); return; }

    const { data } = await (supa as any).from(table).select('*').eq('id', claim.entity_id).single();
    setLoadingE(false);
    if (!data) { setForm({ ...EMPTY_KART, entity_id: claim.entity_id!, entity_type: claim.entity_type }); return; }

    // Entity tipine göre alanları eşle
    let mapped: HekimKartData = { ...EMPTY_KART, entity_id: claim.entity_id!, entity_type: claim.entity_type, hekimhane_url: hekimhaneUrl };
    if (claim.entity_type === 'doktor') {
      mapped = { ...mapped,
        ad: data.ad || '', soyad: data.soyad || '', unvan: data.unvan || '',
        spec: data.spec || '', tel: data.tel || '',
        instagram_url: data.instagram_url || '', facebook_url: data.facebook_url || '',
        photo_url: data.photo || '', il: data.il || '', ilce: data.ilce || '',
        clinic_name: data.clinic_name || '', bio: data.bio || '',
      };
    } else if (claim.entity_type === 'klinik' || claim.entity_type === 'hastane') {
      mapped = { ...mapped,
        ad: data.name || '', soyad: '', unvan: '', spec: data.type || '',
        tel: data.tel || '', instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '', photo_url: data.logo || data.photos?.[0] || '',
        il: data.il || '', ilce: data.ilce || '', clinic_name: data.name || '', bio: '',
      };
    } else if (claim.entity_type === 'eczane') {
      mapped = { ...mapped,
        ad: data.name || '', soyad: data.pharmacist || '', unvan: 'Ecz.',
        spec: 'Eczane', tel: data.tel || '',
        instagram_url: data.instagram_url || '', facebook_url: data.facebook_url || '',
        photo_url: data.photos?.[0] || '', il: data.il || '', ilce: data.ilce || '',
        clinic_name: data.name || '', bio: '',
      };
    }
    setForm(mapped);
  }

  async function handleSave() {
    if (!form.ad.trim()) { setError('Ad alanı zorunludur.'); return; }
    setSaving(true); setError('');
    try {
      const r = await fetch('/api/kart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Kayıt başarısız.'); setSaving(false); return; }
      const saved_kart = data.kart as HekimKartData;
      if (saved_kart.entity_id) {
        setKartlar(p => ({ ...p, [saved_kart.entity_id!]: saved_kart }));
      }
      setAllKartlar(prev => {
        const idx = prev.findIndex(k => k.id === saved_kart.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = saved_kart; return next; }
        return [...prev, saved_kart];
      });
      setForm({ ...EMPTY_KART, ...saved_kart });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setView('preview');
    } catch { setError('Bağlantı hatası.'); }
    setSaving(false);
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const siteBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://hekimhane.com';
  const kartUrl  = form.slug ? `${siteBase}/kart/${form.slug}` : '';
  const qrSrc    = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}&color=1B3A69&bgcolor=FFFFFF&margin=14&format=png`;

  // Form field helper
  if (loadingK) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:80 }}>
      <div style={{ width:32, height:32, border:`3px solid ${T.border}`, borderTopColor:T.navy, borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth:1080, margin:0 }}>
      <h2 style={{ fontSize:22, fontWeight:800, color:T.navy, marginBottom:4, letterSpacing:'-0.4px' }}>HekimKart</h2>
      <p style={{ color:T.muted, fontSize:13.5, marginBottom:22 }}>Her profiliniz için ayrı dijital kartvizit oluşturun</p>

      <style>{`
        @media (max-width: 720px) {
          .hk-profiles { flex: 1 1 100% !important; min-width: 0 !important; }
          .hk-right { flex: 1 1 100% !important; min-width: 0 !important; }
          .hk-preview-col { flex: 1 1 100% !important; min-width: 0 !important; }
          .hk-tabbar { width: 100% !important; }
          .hk-tabbar button { flex: 1 !important; }
        }
      `}</style>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-start' }}>

        {/* ── Sol: Profil listesi ── */}
        <div className="hk-profiles" style={{ flex:'0 0 240px', minWidth:220, display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:4 }}>Profillerim</p>

          {approvedClaims.length === 0 ? (
            <div style={{ background:'white', borderRadius:14, border:`1px solid ${T.border}`, padding:'18px 16px', fontSize:13, color:T.muted, lineHeight:1.6, textAlign:'center' }}>
              Onaylı profiliniz yok.<br/>Yeni Başvuru yapın.
            </div>
          ) : approvedClaims.map(claim => {
            const hasKart = !!kartlar[claim.entity_id!] ||
              allKartlar.some(k => k.entity_id === claim.entity_id) ||
              (allKartlar.length === 1 && !allKartlar[0].entity_id);
            const isActive = activeClaim?.id === claim.id;
            const typeColors: Record<string,string> = { doktor:'#1B3A69', klinik:'#065F46', hastane:'#7C3AED', eczane:'#B45309' };
            const typeColor = typeColors[claim.entity_type] || T.navy;
            return (
              <button key={claim.id} onClick={() => selectClaim(claim)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14,
                  background: isActive ? T.navy : 'white',
                  border:`1.5px solid ${isActive ? T.navy : T.border}`,
                  cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .15s',
                  boxShadow: isActive ? `0 4px 16px rgba(27,58,105,.2)` : '0 1px 4px rgba(0,0,0,.05)',
                }}>
                <div style={{ width:36, height:36, borderRadius:10, background: isActive ? 'rgba(255,255,255,.15)' : `${typeColor}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Ic d={icons.profile} size={16} color={isActive ? 'white' : typeColor} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: isActive ? 'white' : T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{claim.entity_name}</div>
                  <div style={{ fontSize:10.5, color: isActive ? 'rgba(255,255,255,.6)' : T.muted, marginTop:1 }}>
                    {claim.entity_type} · {hasKart ? '✓ Kart var' : 'Kart yok'}
                  </div>
                </div>
                {hasKart && !isActive && (
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#059669', flexShrink:0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Sağ: Form / Önizleme ── */}
        <div className="hk-right" style={{ flex:'1 1 400px', minWidth:320 }}>
          {!activeClaim ? (
            <div style={{ background:'white', borderRadius:20, border:`1px solid ${T.border}`, padding:'48px 32px', textAlign:'center' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={T.border} strokeWidth="1.5" strokeLinecap="round" style={{ display:'block', margin:'0 auto 16px' }}>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                <path d="M14 17h.01 M17 14h.01 M20 14h.01 M17 17h.01 M20 20h.01"/>
              </svg>
              <p style={{ color:T.muted, fontSize:14, lineHeight:1.6 }}>
                Soldan bir profil seçin.<br/>Veriler otomatik yüklenecek, eksikleri düzenleyin.
              </p>
            </div>
          ) : loadingE ? (
            <div style={{ background:'white', borderRadius:20, border:`1px solid ${T.border}`, padding:48, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:28, height:28, border:`3px solid ${T.border}`, borderTopColor:T.navy, borderRadius:'50%', animation:'spin 1s linear infinite' }} />
              <span style={{ marginLeft:12, color:T.muted, fontSize:13 }}>Profil verisi yükleniyor…</span>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="hk-tabbar" style={{ display:'flex', gap:2, background:T.bg, borderRadius:14, padding:4, marginBottom:16, width:'fit-content' }}>
                {(['form','preview'] as const).map(t => (
                  <button key={t} onClick={() => setView(t)}
                    style={{ padding:'8px 20px', borderRadius:11, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700,
                      background: view===t ? 'white' : 'transparent',
                      color:      view===t ? T.navy  : T.muted,
                      boxShadow:  view===t ? '0 1px 6px rgba(0,0,0,.08)' : 'none', transition:'all .15s' }}>
                    {t === 'form' ? 'Düzenle' : 'Önizle & Paylaş'}
                  </button>
                ))}
              </div>

              {view === 'form' && (
                <div style={{ background:'white', borderRadius:20, border:`1px solid ${T.border}`, padding:'22px 22px 26px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.navy }}>{activeClaim.entity_name}</div>
                      <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Veriler {activeClaim.entity_type} profilinden yüklendi — istediğinizi değiştirin</div>
                    </div>
                    {kartUrl && (
                      <a href={`/kart/${form.slug}`} target="_blank" rel="noopener"
                        style={{ padding:'7px 12px', background:T.navy, borderRadius:9, color:'white', fontSize:11.5, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                        <Ic d={icons.eye} size={12} color="white"/> Önizle
                      </a>
                    )}
                  </div>

                  {/* Kişisel */}
                  <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Kişisel Bilgiler</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                    <KartField label="Ad *" value={form.ad} onChange={v=>setForm(p=>({...p,ad:v}))} placeholder="Mehmet" half />
                    <KartField label="Soyad" value={form.soyad} onChange={v=>setForm(p=>({...p,soyad:v}))} placeholder="Yılmaz" half />
                    <KartField label="Unvan" value={form.unvan} onChange={v=>setForm(p=>({...p,unvan:v}))} placeholder="Dr., Prof. Dr." half />
                    <KartField label="Uzmanlık / Tür" value={form.spec} onChange={v=>setForm(p=>({...p,spec:v}))} placeholder="Kardiyoloji" half />
                    <KartField label="Kurum Adı" value={form.clinic_name} onChange={v=>setForm(p=>({...p,clinic_name:v}))} placeholder="Özel Klinik" />
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:16 }}>
                    <label style={{ fontSize:11.5, fontWeight:700, color:T.muted, letterSpacing:'.3px', textTransform:'uppercase' }}>Kısa Tanıtım</label>
                    <textarea value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))}
                      placeholder="20 yıllık deneyim ile…" rows={2}
                      style={{ padding:'10px 12px', borderRadius:10, border:`1px solid ${T.border}`, fontSize:13.5, fontFamily:'inherit', color:T.text, resize:'vertical', outline:'none' }}
                      onFocus={e=>(e.target.style.borderColor=T.navy)} onBlur={e=>(e.target.style.borderColor=T.border)} />
                  </div>

                  {/* Konum */}
                  <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Konum</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                    <KartField label="Şehir" value={form.il} onChange={v=>setForm(p=>({...p,il:v}))} placeholder="İstanbul" half />
                    <KartField label="İlçe" value={form.ilce} onChange={v=>setForm(p=>({...p,ilce:v}))} placeholder="Kadıköy" half />
                  </div>

                  {/* İletişim */}
                  <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>İletişim & Sosyal Medya</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                    <KartField label="Telefon" value={form.tel} onChange={v=>setForm(p=>({...p,tel:v}))} type="tel" placeholder="0532 123 45 67" half />
                    <KartField label="Fotoğraf URL" value={form.photo_url} onChange={v=>setForm(p=>({...p,photo_url:v}))} placeholder="https://…/foto.jpg" half />
                    <KartField label="Instagram" value={form.instagram_url} onChange={v=>setForm(p=>({...p,instagram_url:v}))} placeholder="https://instagram.com/…" half />
                    <KartField label="Facebook" value={form.facebook_url} onChange={v=>setForm(p=>({...p,facebook_url:v}))} placeholder="https://facebook.com/…" half />
                  </div>

                  {/* Linkler */}
                  <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Linkler (opsiyonel)</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                    <KartField label="Rezervasyon / Randevu" value={form.rezervasyon_url} onChange={v=>setForm(p=>({...p,rezervasyon_url:v}))} placeholder="https://randevu.example.com" />
                    <KartField label="Web Sitesi" value={form.website_url} onChange={v=>setForm(p=>({...p,website_url:v}))} placeholder="https://www.hekimhane.com.tr" />
                    <KartField label="Google Maps Konumu" value={form.maps_url} onChange={v=>setForm(p=>({...p,maps_url:v}))} placeholder="https://maps.google.com/…" />
                  </div>

                  {/* Ödeme */}
                  <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Ödeme Bilgisi (opsiyonel)</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                    <KartField label="IBAN" value={form.iban} onChange={v=>setForm(p=>({...p,iban:v.toUpperCase().replace(/[^A-Z0-9]/g,'')}))} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                  </div>

                  {/* Kart adresi */}
                  <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Kart Adresi</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:T.bg, borderRadius:12, padding:'10px 14px', marginBottom:4 }}>
                    <span style={{ fontSize:12.5, color:T.muted, whiteSpace:'nowrap' }}>hekimhane.com/kart/</span>
                    <input value={form.slug}
                      onChange={e => setForm(p=>({...p, slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')}))}
                      placeholder="dr-mehmet-yilmaz"
                      style={{ flex:1, border:'none', background:'transparent', fontSize:13, fontFamily:'inherit', color:T.navy, fontWeight:700, outline:'none', minWidth:0 }} />
                  </div>
                  <p style={{ fontSize:11, color:T.muted, marginBottom:18 }}>Boş bırakırsanız adınızdan otomatik oluşturulur.</p>

                  {error && <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:10, padding:'10px 14px', color:'#991B1B', fontSize:13, marginBottom:14 }}>{error}</div>}

                  <button onClick={handleSave} disabled={saving}
                    style={{ width:'100%', padding:'13px', borderRadius:13, background:T.navy, border:'none', color:'white', fontSize:14, fontWeight:800, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:saving?.7:1 }}>
                    {saving
                      ? <><div style={{ width:15, height:15, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite' }}/> Kaydediliyor…</>
                      : saved ? <><Ic d={icons.check} size={15} color="white"/> Kaydedildi!</>
                      : 'Kartı Kaydet'
                    }
                  </button>
                </div>
              )}

              {view === 'preview' && (
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  {/* Kart önizleme */}
                  <div className="hk-preview-col" style={{ flex:'1 1 220px', minWidth:200 }}>
                    <div style={{ background:'linear-gradient(160deg,#0F2A55,#1B3A69)', borderRadius:'20px 20px 0 0', padding:'20px 18px 18px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                      {form.photo_url
                        ? <img src={form.photo_url} alt="" style={{ width:72, height:72, borderRadius:'50%', border:'3px solid #D4A843', objectFit:'cover' }} />
                        : <div style={{ width:72, height:72, borderRadius:'50%', border:'3px solid rgba(212,168,67,.5)', background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:24, fontWeight:700 }}>
                            {form.ad?.[0]?.toUpperCase()||'H'}
                          </div>
                      }
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:800, fontSize:15, color:'white' }}>
                          {[form.unvan,form.ad,form.soyad].filter(Boolean).join(' ') || 'Ad Soyad'}
                        </div>
                        {form.spec && <div style={{ fontSize:11.5, color:'rgba(255,255,255,.7)', marginTop:2 }}>{form.spec}</div>}
                        {form.clinic_name && <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:1 }}>{form.clinic_name}</div>}
                      </div>
                      {(form.il||form.ilce) && <span style={{ fontSize:10.5, color:'rgba(255,255,255,.7)', background:'rgba(255,255,255,.1)', padding:'2px 9px', borderRadius:20 }}>{[form.ilce,form.il].filter(Boolean).join(', ')}</span>}
                    </div>
                    <div style={{ background:'white', borderRadius:'0 0 20px 20px', border:`1px solid ${T.border}`, borderTop:'none', padding:'12px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                      {form.tel && <div style={{ padding:'10px 12px', borderRadius:10, background:'#1B3A69', color:'white', fontSize:12.5, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}><Ic d={icons.phone} size={14} color="white"/>{form.tel}</div>}
                      {form.instagram_url && <div style={{ padding:'10px 12px', borderRadius:10, background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color:'white', fontSize:12.5, fontWeight:600 }}>Instagram</div>}
                      {form.facebook_url  && <div style={{ padding:'10px 12px', borderRadius:10, background:'#1877F2', color:'white', fontSize:12.5, fontWeight:600 }}>Facebook</div>}
                    </div>
                  </div>

                  {/* Paylaşım araçları */}
                  {kartUrl ? (
                    <div className="hk-preview-col" style={{ flex:'1 1 200px', display:'flex', flexDirection:'column', gap:12 }}>
                      <div style={{ background:'white', borderRadius:16, border:`1px solid ${T.border}`, padding:'16px 16px 14px' }}>
                        <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:8 }}>Kart Linkiniz</p>
                        <div style={{ background:T.bg, borderRadius:9, padding:'8px 11px', marginBottom:10, fontSize:12, color:T.navy, fontWeight:600, wordBreak:'break-all' }}>{kartUrl}</div>
                        <div style={{ display:'flex', gap:7 }}>
                          <button onClick={() => handleCopy(kartUrl)}
                            style={{ flex:1, padding:'9px', borderRadius:9, background:copied?'#F0FDF4':'#F0F4FF', border:`1px solid ${copied?'#86EFAC':'#CBD5F0'}`, color:copied?'#166534':T.navy, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            <Ic d={copied?icons.check:icons.link} size={12}/> {copied?'Kopyalandı':'Kopyala'}
                          </button>
                          <a href={`/kart/${form.slug}`} target="_blank" rel="noopener"
                            style={{ flex:1, padding:'9px', borderRadius:9, background:T.navy, color:'white', fontSize:12, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            <Ic d={icons.eye} size={12} color="white"/> Aç
                          </a>
                        </div>
                      </div>

                      <div style={{ background:'white', borderRadius:16, border:`1px solid ${T.border}`, padding:'16px', textAlign:'center' }}>
                        <p style={{ fontSize:10.5, fontWeight:700, color:T.muted, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:12 }}>QR Kod</p>
                        <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                          <div style={{ border:`1px solid ${T.border}`, borderRadius:12, padding:7, display:'inline-flex' }}>
                            <img src={qrSrc(kartUrl)} alt="QR" width={140} height={140} style={{ borderRadius:7 }} />
                          </div>
                        </div>
                        <button onClick={() => setShowQr(true)}
                          style={{ width:'100%', padding:'9px', borderRadius:9, background:T.bg, border:`1px solid ${T.border}`, color:T.navy, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          Büyük Göster
                        </button>
                      </div>

                      <button onClick={() => setView('form')}
                        style={{ padding:'11px', borderRadius:12, background:'white', border:`1px solid ${T.border}`, color:T.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        Kartı Düzenle
                      </button>
                    </div>
                  ) : (
                    <div className="hk-preview-col" style={{ flex:'1 1 200px', background:'white', borderRadius:16, border:`1px solid ${T.border}`, padding:'28px 20px', textAlign:'center' }}>
                      <p style={{ color:T.muted, fontSize:13, lineHeight:1.6 }}>Önce kartı kaydedin.</p>
                      <button onClick={() => setView('form')} style={{ marginTop:12, padding:'9px 18px', borderRadius:9, background:T.navy, border:'none', color:'white', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Düzenlemeye Git</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Büyük Modal */}
      {showQr && kartUrl && (
        <div onClick={() => setShowQr(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:24, padding:'28px 24px 22px', maxWidth:320, width:'100%', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,.4)' }}>
            <h3 style={{ fontSize:17, fontWeight:800, color:T.navy, marginBottom:5 }}>QR Kod</h3>
            <p style={{ fontSize:12, color:T.muted, marginBottom:15, lineHeight:1.5 }}>{[form.unvan,form.ad,form.soyad].filter(Boolean).join(' ')} kartı</p>
            <div style={{ border:`1px solid ${T.border}`, borderRadius:14, padding:10, display:'inline-flex', marginBottom:12 }}>
              <img src={qrSrc(kartUrl)} alt="QR" width={210} height={210} style={{ borderRadius:8, display:'block' }} />
            </div>
            <div style={{ fontSize:10.5, color:'#8B9CC0', marginBottom:14, wordBreak:'break-all' }}>{kartUrl}</div>
            <button onClick={() => setShowQr(false)} style={{ width:'100%', padding:'11px', borderRadius:12, background:T.navy, border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
