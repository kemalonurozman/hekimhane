'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';
import { SPEC_GRUPLARI } from '@/lib/uzmanlik-data';

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
};

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
  const [tab,    setTab]    = useState<'dashboard' | 'claims' | 'profile' | 'new' | 'edit' | 'yorumlar' | 'hekimkart'>('dashboard');
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [profileUrls, setProfileUrls] = useState<Record<string, string>>({});
  const [selectedEditClaim, setSelectedEditClaim] = useState<ClaimRequest | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const { data } = await (supabase as any).from('claim_requests')
      .select('*').eq('email', email).order('created_at', { ascending: false });
    const list: ClaimRequest[] = data || [];
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
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace('/giris');
  }

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
    { key: 'edit'       as const, label: 'Profilimi Düzenle', icon: 'edit' },
    { key: 'hekimkart'  as const, label: 'HekimKart',         icon: 'bell' },
    { key: 'yorumlar'   as const, label: 'Yorumlar',          icon: 'star' },
    { key: 'profile'    as const, label: 'Hesabım',           icon: 'profile' },
    { key: 'new'        as const, label: 'Yeni Başvuru',      icon: 'plus' },
  ];

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
      <aside style={{ position: 'fixed', top: isMobile ? 112 : 64, left: 0, bottom: 0, width: 240, background: `linear-gradient(180deg, ${T.navy2} 0%, ${T.navy} 100%)`, display: isMobile ? (mobileMenuOpen ? 'flex' : 'none') : 'flex', flexDirection: 'column', zIndex: isMobile ? 200 : 100 }}>
        <div style={{ padding: '24px 22px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: 'white', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 14, color: T.navy }}>H</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.3px' }}>Hekimhane</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>İşletme Portalı</div>
        </div>

        <div style={{ padding: '14px 22px 12px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,.2)' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Ic d={icons.profile} size={16} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Kullanıcı'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}>
          <div style={{ padding: '6px 22px 4px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.28)', letterSpacing: '1px', textTransform: 'uppercase' }}>Yönetim</div>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '11px 22px', background: tab === item.key ? 'rgba(255,255,255,.12)' : 'none', border: 'none', borderLeft: tab === item.key ? `3px solid ${T.gold}` : '3px solid transparent', cursor: 'pointer', textAlign: 'left', color: tab === item.key ? 'white' : 'rgba(255,255,255,.55)', fontSize: 13, fontWeight: tab === item.key ? 700 : 500, fontFamily: 'inherit', transition: 'all .15s' }}>
              <span style={{ width: 16, flexShrink: 0 }}><Ic d={icons[item.icon as keyof typeof icons]} size={15} /></span>
              {item.label}
              {item.key === 'claims' && pendingClaims.length > 0 && (
                <span style={{ marginLeft: 'auto', background: T.amber, color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pendingClaims.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0, transition: 'color .15s' }}>
            <Ic d={icons.logout} size={14} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: isMobile ? 0 : 240, flex: 1, padding: isMobile ? '124px 16px 80px' : '96px 36px 32px', background: T.bg, minHeight: '100vh' }}>
        {tab === 'dashboard' && <DashboardTab user={user} claims={claims} approvedClaims={approvedClaims} pendingClaims={pendingClaims} claimsLoading={claimsLoading} onTabChange={setTab} profileUrls={profileUrls} onEditClaim={(c) => { setSelectedEditClaim(c); setTab('edit'); }} />}
        {tab === 'claims'    && <ClaimsTab claims={claims} loading={claimsLoading} onNewClaim={() => setTab('new')} profileUrls={profileUrls} />}
        {tab === 'profile'   && <ProfileTab user={user} />}
        {tab === 'new'       && <NewClaimTab user={user} onSuccess={() => { loadClaims(user?.email || ''); setTab('claims'); }} />}
        {tab === 'edit'      && <EditProfileTab approvedClaims={approvedClaims} selectedClaim={selectedEditClaim} onSelectClaim={setSelectedEditClaim} isMobile={isMobile} />}
        {tab === 'hekimkart' && <HekimKartTab approvedClaims={approvedClaims} profileUrls={profileUrls} user={user} />}
        {tab === 'yorumlar'  && <YorumlarTab approvedClaims={approvedClaims} />}
      </main>

      {/* ── MOBİL ALT NAVİGASYON ── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, zIndex: 150,
          background: 'white', borderTop: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'stretch'
        }}>
          {navItems.filter(n => ['dashboard','edit','hekimkart','yorumlar','profile'].includes(n.key)).map(item => (
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; } @media (max-width: 767px) { .panel-grid-2 { flex-direction: column !important; } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function DashboardTab({ user, claims, approvedClaims, pendingClaims, claimsLoading, onTabChange, profileUrls, onEditClaim }: { user: User | null; claims: ClaimRequest[]; approvedClaims: ClaimRequest[]; pendingClaims: ClaimRequest[]; claimsLoading: boolean; onTabChange: (t: any) => void; profileUrls: Record<string, string>; onEditClaim: (c: ClaimRequest) => void }) {
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Kullanıcı';
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>Hoş Geldiniz, {name.split(' ')[0]}</h1>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>İşletme başvurularınızı ve hesap durumunuzu buradan takip edebilirsiniz.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
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
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F0FDF4', borderRadius: 12, marginBottom: 10, border: '1px solid #86EFAC' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 3 }}>{c.entity_name}</div>
                  <EntityTypeLabel type={c.entity_type} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
function ClaimsTab({ claims, loading, onNewClaim, profileUrls }: { claims: ClaimRequest[]; loading: boolean; onNewClaim: () => void; profileUrls: Record<string, string> }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
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
    const supabase = createSupabaseBrowser();

    if (selectedEntity) {
      /* ── Mevcut işletme: doğrudan sahiplenme talebi ── */
      const roleStr = [form.unvan.trim() || null, form.mesaj || null,
        selectedEntity.claimed ? 'SAHİPLENME İTİRAZI' : 'SAHİPLENME TALEBİ',
      ].filter(Boolean).join(' | ');
      const { error } = await (supabase as any).from('claim_requests').insert({
        entity_id:     selectedEntity.id,
        entity_type:   typeVal,
        entity_name:   selectedEntity.name,
        claimant_name: form.ad_soyad.trim(),
        phone:         form.tel.trim(),
        email:         form.email.trim(),
        role:          roleStr || null,
        status:        selectedEntity.claimed ? 'dispute' : 'pending',
      });
      setSaving(false);
      if (error) { setSaveErr(`Hata: ${error.message}`); } else { setStep('done'); onSuccess(); }
    } else {
      /* ── Yeni işletme başvurusu ── */
      const roleStr = [form.unvan.trim() || null, form.il ? (form.ilce ? `${form.il} / ${form.ilce}` : form.il) : null, form.adres ? `Adres: ${form.adres}` : null, form.mesaj || null, 'YENİ İŞLETME BAŞVURUSU'].filter(Boolean).join(' | ');
      const { error } = await (supabase as any).from('claim_requests').insert({
        entity_id:     'new',
        entity_type:   typeVal,
        entity_name:   form.isletme_adi.trim(),
        claimant_name: form.ad_soyad.trim(),
        phone:         form.tel.trim(),
        email:         form.email.trim(),
        role:          roleStr || null,
        status:        'pending',
      });
      setSaving(false);
      if (error) { setSaveErr(`Hata: ${error.message}`); } else { setStep('done'); onSuccess(); }
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
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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
        <div style={{ flex:1 }}>
          <p style={{ fontSize:12, color:T.navy, fontWeight:600, margin:'0 0 2px' }}>
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
  type ESection = 'info' | 'details' | 'photos' | 'konum' | 'tour';
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

  const INP: React.CSSProperties = { width:'100%', padding:'10px 13px', borderRadius:10, border:`1.5px solid ${T.border}`, fontSize:13.5, fontFamily:'inherit', color:T.text, outline:'none', background:'white', transition:'border-color .15s', boxSizing:'border-box' };
  const LBL: React.CSSProperties = { display:'block', fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 };
  const onF  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor=T.navy; e.currentTarget.style.boxShadow='0 0 0 3px rgba(27,58,105,.08)'; };
  const offF = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow='none'; };

  const specs: string[] = Array.isArray(formData.specs) ? formData.specs as string[]
    : (typeof formData.specs==='string' && formData.specs ? (formData.specs as string).split(',').map((s:string)=>s.trim()) : []);

  const entityDisplayName = et === 'doktor'
    ? `${formData.ad||''} ${formData.soyad||''}`.trim() || (selectedClaim?.entity_name || '')
    : String(formData.name || selectedClaim?.entity_name || '');

  const SECS = [
    { key:'info'    as ESection, label:'Profil Bilgileri', icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11A4 4 0 1 0 12 3a4 4 0 0 0 0 8z' },
    { key:'details' as ESection, label:'Detaylar',          icon:icons.list },
    { key:'photos'  as ESection, label:'Fotoğraflar',       icon:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17A4 4 0 1 0 12 9a4 4 0 0 0 0 8z' },
    { key:'konum'   as ESection, label:'Konum',              icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10A2 2 0 1 0 12 6a2 2 0 0 0 0 4z' },
    { key:'tour'    as ESection, label:'360° Tur',           icon:'M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
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
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>{onSelectClaim(null);setED(null);setSaveMsg(null);}}
            style={{ background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:13, fontFamily:'inherit', padding:'6px 0', display:'flex', alignItems:'center', gap:5 }}>
            <Ic d="M19 12H5 M12 5l-7 7 7 7" size={14}/> Geri
          </button>
          <span style={{ color:T.border }}>|</span>
          <span style={{ fontSize:15, fontWeight:800, color:T.text }}>{selectedClaim.entity_name}</span>
          <EntityTypeLabel type={et}/>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {saveMsg && (
            <span style={{ fontSize:12, fontWeight:600, color:saveMsg.ok?T.green:T.red, display:'flex', alignItems:'center', gap:4 }}>
              <Ic d={saveMsg.ok?icons.check:icons.info} size={13}/>{saveMsg.text}
            </span>
          )}
          <button onClick={()=>{setFormData(entityData||{});setSaveMsg(null);}}
            style={{ padding:'9px 18px', borderRadius:10, border:`1.5px solid ${T.border}`, background:'white', color:T.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            Sıfırla
          </button>
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

          {/* Form bölümü */}
          <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.border}`, padding:'20px 18px', display:'flex', flexDirection:'column', gap:14 }}>

            {/* ── PROFİL BİLGİLERİ ── */}
            {sec==='info' && (<>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.6px', paddingBottom:10, borderBottom:`2px solid #E8F0FE` }}>Profil Bilgileri</div>

              {et==='doktor' ? (
                <div><label style={LBL}>Ad — Soyad</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
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
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div><label style={LBL}>{et==='doktor'?'Uzmanlık':'Tür'}</label>
                    <input value={String(et==='doktor'?(formData.spec||''):(formData.type||''))} placeholder={et==='doktor'?'Kardiyoloji':'Özel, Devlet...'} style={INP}
                      onChange={e=>F(et==='doktor'?'spec':'type',e.target.value)} onFocus={onF} onBlur={offF}/>
                  </div>
                  {et==='doktor' && <div><label style={LBL}>Ünvan</label><input value={String(formData.unvan||'')} placeholder="Uzm. Dr." style={INP} onChange={e=>F('unvan',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
                  {et!=='doktor' && <div><label style={LBL}>İl</label><input value={String(formData.il||'')} placeholder="İstanbul" style={INP} onChange={e=>F('il',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {et==='doktor'&&<div><label style={LBL}>İl</label><input value={String(formData.il||'')} placeholder="İstanbul" style={INP} onChange={e=>F('il',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
                <div><label style={LBL}>İlçe</label><input value={String(formData.ilce||'')} placeholder="Kadıköy" style={INP} onChange={e=>F('ilce',e.target.value)} onFocus={onF} onBlur={offF}/></div>
                {et==='eczane'&&<div><label style={LBL}>İl</label><input value={String(formData.il||'')} placeholder="İstanbul" style={INP} onChange={e=>F('il',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
              </div>

              <div><label style={LBL}>Adres</label>
                <input value={String(formData.adres||formData.address||'')} placeholder="Sokak, bina no, kat..." style={INP}
                  onChange={e=>F(et==='eczane'?'address':'adres',e.target.value)} onFocus={onF} onBlur={offF}/>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div><label style={LBL}>Telefon</label><input type="tel" value={String(formData.tel||'')} placeholder="05xx xxx xx xx" style={INP} onChange={e=>F('tel',e.target.value)} onFocus={onF} onBlur={offF}/></div>
                {et!=='eczane'&&et!=='doktor'&&<div><label style={LBL}>Website</label><input type="url" value={String(formData.website||'')} placeholder="https://" style={INP} onChange={e=>F('website',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
                {et==='doktor'&&<div><label style={LBL}>Muayene Ücreti (₺)</label><input type="number" value={formData.fee??''} placeholder="500" style={INP} onChange={e=>F('fee',e.target.value===''?null:Number(e.target.value))} onFocus={onF} onBlur={offF}/></div>}
                {et==='eczane'&&<div><label style={LBL}>Eczacı Adı</label><input value={String(formData.pharmacist||'')} placeholder="Ad Soyad" style={INP} onChange={e=>F('pharmacist',e.target.value)} onFocus={onF} onBlur={offF}/></div>}
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

              {et==='hastane'&&<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
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
            </>)}

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
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
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

          {/* Alt kaydet butonu */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
            {saveMsg && (
              <span style={{ fontSize:12, fontWeight:600, color:saveMsg.ok?T.green:T.red, display:'flex', alignItems:'center', gap:4, alignSelf:'center' }}>
                <Ic d={saveMsg.ok?icons.check:icons.info} size={13}/>{saveMsg.text}
              </span>
            )}
            <button onClick={()=>{setFormData(entityData||{});setSaveMsg(null);}}
              style={{ padding:'10px 20px', borderRadius:10, border:`1.5px solid ${T.border}`, background:'white', color:T.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Sıfırla
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:'10px 26px', borderRadius:10, border:'none', background:saving?'#9CA3AF':T.navy, color:'white', fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:7, fontFamily:'inherit' }}>
              {saving
                ? <><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation:'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Kaydediliyor</>
                : <><Ic d={icons.check} size={14}/>Değişiklikleri Kaydet</>
              }
            </button>
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

              {/* Header */}
              <div style={{ background:'white', padding:'18px 22px', display:'flex', gap:14, alignItems:'flex-start', borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:60, height:60, borderRadius:15, background:'#E8F0FE', border:`1px solid #BFDBFE`, flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', color:T.navy }}>
                  {profUrl ? <img src={profUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> /* eslint-disable-line @next/next/no-img-element */
                           : <Ic d={icons.building} size={22}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#1A2744', lineHeight:1.2, marginBottom:5 }}>{entityDisplayName||'İşletme Adı'}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
                    {(formData.type||formData.spec)&&<span style={{ fontSize:10, fontWeight:600, background:'#F0F4FF', color:'#1B3A69', padding:'2px 8px', borderRadius:20, border:'1px solid #C7D7F8' }}>{formData.type||formData.spec}</span>}
                    {formData.il&&<span style={{ fontSize:10, color:'#6B7A99', display:'flex', alignItems:'center', gap:3 }}><Ic d={icons.map} size={9}/>{formData.il}{formData.ilce?`, ${formData.ilce}`:''}</span>}
                    {formData.online&&<span style={{ fontSize:10, background:'#F0FDF4', color:'#166534', padding:'2px 7px', borderRadius:10, fontWeight:600 }}>Online</span>}
                  </div>
                  {specs.length>0&&<div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:5 }}>{specs.slice(0,5).map((s:string)=><span key={s} style={{ fontSize:9, background:'#EFF6FF', color:'#1D4ED8', padding:'2px 7px', borderRadius:8 }}>{s}</span>)}{specs.length>5&&<span style={{ fontSize:9, color:T.muted }}>+{specs.length-5}</span>}</div>}
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
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <h2 style={{ fontSize:22, fontWeight:800, color:T.navy, marginBottom:4, letterSpacing:'-0.4px' }}>HekimKart</h2>
      <p style={{ color:T.muted, fontSize:13.5, marginBottom:22 }}>Her profiliniz için ayrı dijital kartvizit oluşturun</p>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-start' }}>

        {/* ── Sol: Profil listesi ── */}
        <div style={{ flex:'0 0 240px', minWidth:220, display:'flex', flexDirection:'column', gap:8 }}>
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
        <div style={{ flex:'1 1 400px', minWidth:320 }}>
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
              <div style={{ display:'flex', gap:2, background:T.bg, borderRadius:14, padding:4, marginBottom:16, width:'fit-content' }}>
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
                    <KartField label="Web Sitesi" value={form.website_url} onChange={v=>setForm(p=>({...p,website_url:v}))} placeholder="https://hekimhane.com.tr" />
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
                  <div style={{ flex:'1 1 220px', minWidth:200 }}>
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
                    <div style={{ flex:'1 1 200px', display:'flex', flexDirection:'column', gap:12 }}>
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
                    <div style={{ flex:'1 1 200px', background:'white', borderRadius:16, border:`1px solid ${T.border}`, padding:'28px 20px', textAlign:'center' }}>
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
