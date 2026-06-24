'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'kemalonurozman@gmail.com';

/* ═══════════════════════════════════════════════
   Renk & İkon sistemi
═══════════════════════════════════════════════ */
const C = {
  bg:     '#080F1E',
  panel:  '#0D1526',
  card:   '#111B2E',
  border: 'rgba(255,255,255,.07)',
  text:   'rgba(255,255,255,.92)',
  muted:  'rgba(255,255,255,.42)',
  dim:    'rgba(255,255,255,.2)',
  gold:   '#D4A843',
  navy:   '#1B3A69',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  blue:   '#3B82F6',
  cyan:   '#06B6D4',
  purple: '#8B5CF6',
  orange: '#EA580C',
};

function Ic({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const IC = {
  dash:    'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  claims:  'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M9 12h6 M9 16h4',
  klinik:  'M7 7C7 4.5 8.5 2.5 10 2.5Q11 4 12 5Q13 4 14 2.5C15.5 2.5 17 4.5 17 7C17 8.5 16.5 10 16 11.5C15.5 13 15.5 16 16 18.5C16.5 21 16 22 14.5 22C13.5 22 13 20.5 12.5 19L12 17L11.5 19C11 20.5 10.5 22 9.5 22C8 22 7.5 21 8 18.5C8.5 16 8.5 13 8 11.5C7.5 10 7 8.5 7 7Z',
  hastane: 'M3 21h18 M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16 M9 21v-6h6v6 M12 8v4 M10 10h4',
  doktor:  'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11A4 4 0 1 0 12 3a4 4 0 0 0 0 8z',
  eczane:  'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  blog:    'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  check:   'M20 6 9 17l-5-5',
  x:       'M18 6 6 18 M6 6l12 12',
  eye:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9A3 3 0 1 0 12 15a3 3 0 0 0 0-6z',
  logout:  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  link:    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  search:  'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  clock:   'M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M12 6v6l4 2',
  shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  edit:    'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  toggle:  'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
};

/* ═══════════════════════════════════════════════
   Tipler
═══════════════════════════════════════════════ */
interface Stats {
  entities: { klinik: number; hastane: number; doktor: number; eczane: number; klinikClaimed: number; hastaneClaimed: number };
  claims: { pending: number; approved: number; rejected: number; total: number };
  recentClaims: Claim[];
}

interface Claim {
  id: string;
  entity_type: string;
  entity_name: string | null;
  entity_id: string | null;
  ad_soyad: string | null;
  claimant_name: string | null;
  tel: string | null;
  phone: string | null;
  email: string;
  unvan: string | null;
  role: string | null;
  mesaj: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Entity {
  id: string;
  name?: string;
  ad?: string;
  soyad?: string;
  il?: string;
  ilce?: string;
  slug?: string;
  rat?: number;
  rev?: number;
  claimed?: boolean;
  published?: boolean;
  [key: string]: any;
}

/* ═══════════════════════════════════════════════
   Yardımcı bileşenler
═══════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const s = {
    pending:  { label: 'Bekliyor',   bg: 'rgba(245,158,11,.12)',  color: '#F59E0B', border: 'rgba(245,158,11,.25)' },
    approved: { label: 'Onaylandı', bg: 'rgba(16,185,129,.12)',  color: '#10B981', border: 'rgba(16,185,129,.25)' },
    rejected: { label: 'Reddedildi',bg: 'rgba(239,68,68,.12)',   color: '#EF4444', border: 'rgba(239,68,68,.25)' },
  }[status] || { label: status, bg: 'rgba(255,255,255,.06)', color: C.muted, border: C.border };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

const ENTITY_META: Record<string, { label: string; color: string; icon: string }> = {
  klinik:  { label: 'Diş Kliniği', color: C.cyan,   icon: IC.klinik  },
  hastane: { label: 'Hastane',     color: C.purple,  icon: IC.hastane },
  doktor:  { label: 'Doktor',      color: C.green,   icon: IC.doktor  },
  eczane:  { label: 'Eczane',      color: C.orange,  icon: IC.eczane  },
};

function TypeBadge({ type }: { type: string }) {
  const m = ENTITY_META[type] || { label: type, color: C.muted, icon: IC.hastane };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: m.color, background: m.color + '1A', padding: '2px 8px', borderRadius: 8 }}>
      {m.label}
    </span>
  );
}

function getBizName(c: Claim) { return c.ad_soyad || c.claimant_name || '—'; }
function getBizPhone(c: Claim) { return c.tel || c.phone || '—'; }
function getBizRole(c: Claim)  { return c.unvan || c.role || null; }

/* Türkçe → slug */
function tr(s: string) {
  return (s||'').toLowerCase()
    .replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g')
    .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c')
    .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
}

function getProfileUrl(type: string, entity: Entity): string | null {
  if (type === 'klinik'  && entity.slug) return `/klinikler/${tr(entity.il||'turkiye')}/${tr(entity.ilce||'merkez')}/${entity.slug}`;
  if (type === 'hastane' && entity.slug) return `/hastaneler/${tr(entity.il||'turkiye')}/${tr(entity.ilce||'merkez')}/${entity.slug}`;
  if (type === 'doktor'  && entity.slug) return `/doktorlar/${entity.slug}`;
  if (type === 'eczane'  && entity.slug) return `/eczaneler/${entity.slug}`;
  return null;
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
const SIDEBAR_ITEMS = [
  { key: 'dashboard',   label: 'Genel Bakış',      icon: IC.dash    },
  { key: 'claims',      label: 'Talepler',         icon: IC.claims  },
  { key: 'cekim',       label: '360° Çekim Talep', icon: IC.klinik  },
  { key: 'klinikler',   label: 'Klinikler',        icon: IC.klinik  },
  { key: 'hastaneler',  label: 'Hastaneler',       icon: IC.hastane },
  { key: 'doktorlar',   label: 'Doktorlar',        icon: IC.doktor  },
  { key: 'eczaneler',   label: 'Eczaneler',        icon: IC.eczane  },
  { key: 'emailler',    label: 'E-posta Listeleri', icon: IC.users   },
  { key: 'blog',        label: 'Blog',             icon: IC.blog    },
  { key: 'kullanici',   label: 'Kullanıcılar',     icon: IC.users   },
  { key: 'sistem',      label: 'Sistem & DB',      icon: IC.shield  },
  { key: 'geocode',     label: 'Harita Koordinat', icon: IC.dash    },
];

type TabKey = 'dashboard' | 'claims' | 'cekim' | 'emailler' | 'klinikler' | 'hastaneler' | 'doktorlar' | 'eczaneler' | 'blog' | 'kullanici' | 'sistem' | 'geocode';

/* ═══════════════════════════════════════════════
   DASHBOARD SEKMESİ
═══════════════════════════════════════════════ */
function DashboardTab({ stats, onTabChange }: { stats: Stats | null; onTabChange: (t: TabKey) => void }) {
  if (!stats) return (
    <div style={{ textAlign: 'center', padding: 60, color: C.muted, fontSize: 14 }}>İstatistikler yükleniyor...</div>
  );

  const statCards = [
    { label: 'Toplam Klinik',   value: stats.entities.klinik,  sub: `${stats.entities.klinikClaimed} sahiplenilmiş`,  color: C.cyan,   icon: IC.klinik,  tab: 'klinikler' as TabKey },
    { label: 'Toplam Hastane',  value: stats.entities.hastane, sub: `${stats.entities.hastaneClaimed} sahiplenilmiş`, color: C.purple, icon: IC.hastane, tab: 'hastaneler' as TabKey },
    { label: 'Toplam Doktor',   value: stats.entities.doktor,  sub: 'kayıtlı uzman',                                  color: C.green,  icon: IC.doktor,  tab: 'doktorlar' as TabKey },
    { label: 'Toplam Eczane',   value: stats.entities.eczane,  sub: 'ağımızdaki eczane',                              color: C.orange, icon: IC.eczane,  tab: 'eczaneler' as TabKey },
  ];

  const claimCards = [
    { label: 'Bekleyen', value: stats.claims.pending,  color: C.amber,  icon: IC.clock },
    { label: 'Onaylı',   value: stats.claims.approved, color: C.green,  icon: IC.check },
    { label: 'Reddedilen',value: stats.claims.rejected,color: C.red,    icon: IC.x },
    { label: 'Toplam',   value: stats.claims.total,    color: C.blue,   icon: IC.claims },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>Genel Bakış</h2>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Hekimhane veri özeti</p>
      </div>

      {/* Entity istatistikleri */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>İşletmeler</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {statCards.map(s => (
          <button key={s.label} onClick={() => onTabChange(s.tab)} style={{ background: C.card, borderRadius: 14, padding: '20px 20px 16px', border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = s.color + '55')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 14 }}>
              <Ic d={s.icon} size={17} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 5 }}>{s.value.toLocaleString('tr-TR')}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 3 }}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Talep istatistikleri */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Sahiplenme Talepleri</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {claimCards.map(s => (
          <div key={s.label} style={{ background: C.card, borderRadius: 14, padding: '20px', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: s.color }}><Ic d={s.icon} size={16} /></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Son talepler */}
      {stats.recentClaims.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Son Başvurular</div>
            <button onClick={() => onTabChange('claims')} style={{ fontSize: 12, fontWeight: 700, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Tümünü Gör →
            </button>
          </div>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {stats.recentClaims.map((c, i) => (
              <div key={c.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < stats.recentClaims.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: (ENTITY_META[c.entity_type]?.color || C.blue) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ENTITY_META[c.entity_type]?.color || C.blue, flexShrink: 0 }}>
                  <Ic d={ENTITY_META[c.entity_type]?.icon || IC.hastane} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.entity_name || 'Yeni İşletme'}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {c.ad_soyad || c.claimant_name} · {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <TypeBadge type={c.entity_type} />
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TALEPLER SEKMESİ
═══════════════════════════════════════════════ */
function ClaimsTab({ claims, loading, onAction, actionId }: {
  claims: Claim[];
  loading: boolean;
  onAction: (id: string, action: 'approve' | 'reject') => void;
  actionId: string | null;
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = {
    all:      claims.length,
    pending:  claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  const filtered = claims
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => !search || [c.entity_name, c.email, c.ad_soyad, c.claimant_name].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>Sahiplenme Talepleri</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Başvuruları inceleyin, onaylayın veya reddedin</p>
        </div>
      </div>

      {/* Filtre sekmeler */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all','pending','approved','rejected'] as const).map(f => {
          const labels = { all: 'Tümü', pending: 'Bekleyen', approved: 'Onaylı', rejected: 'Reddedilen' };
          const colors = { all: C.blue, pending: C.amber, approved: C.green, rejected: C.red };
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 20, border: active ? 'none' : `1px solid ${C.border}`, background: active ? colors[f] : 'transparent', color: active ? 'white' : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
              {labels[f]}
              <span style={{ background: active ? 'rgba(255,255,255,.25)' : C.border, color: active ? 'white' : C.muted, borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{counts[f]}</span>
            </button>
          );
        })}
        {/* Arama */}
        <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 10, color: C.muted }}><Ic d={IC.search} size={14} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İşletme, e-posta..."
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', minWidth: 200 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '48px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
          Bu kategoride talep bulunamadı.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => {
            const isExpanded = expanded === c.id;
            const isPending = c.status === 'pending';
            const meta = ENTITY_META[c.entity_type] || { color: C.blue, icon: IC.hastane, label: c.entity_type };
            return (
              <div key={c.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${isPending ? 'rgba(245,158,11,.2)' : C.border}`, overflow: 'hidden', transition: 'border-color .15s' }}>
                {/* Başlık satırı */}
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : c.id)}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: meta.color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                    <Ic d={meta.icon} size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{c.entity_name || 'Yeni İşletme'}</span>
                      <TypeBadge type={c.entity_type} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span>{getBizName(c)}</span>
                      <span>{c.email}</span>
                      <span>{new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <StatusBadge status={c.status} />
                    {isPending && (
                      <>
                        <button onClick={e => { e.stopPropagation(); onAction(c.id, 'approve'); }}
                          disabled={actionId === c.id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,.4)', background: 'rgba(16,185,129,.1)', color: C.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s' }}>
                          {actionId === c.id ? '...' : <><Ic d={IC.check} size={12} /> Onayla</>}
                        </button>
                        <button onClick={e => { e.stopPropagation(); onAction(c.id, 'reject'); }}
                          disabled={actionId === c.id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,.35)', background: 'rgba(239,68,68,.08)', color: C.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {actionId === c.id ? '...' : <><Ic d={IC.x} size={12} /> Reddet</>}
                        </button>
                      </>
                    )}
                    <span style={{ color: C.dim, transition: 'transform .15s', display: 'block', transform: isExpanded ? 'rotate(180deg)' : '' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                    </span>
                  </div>
                </div>

                {/* Detay */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 18px', background: 'rgba(0,0,0,.15)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>İşletme</div>
                      <DR label="Ad" value={c.entity_name || '—'} />
                      <DR label="Tür" value={meta.label} />
                      {c.entity_id && <DR label="ID" value={c.entity_id} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Başvuran</div>
                      <DR label="Ad Soyad" value={getBizName(c)} />
                      <DR label="Ünvan"    value={getBizRole(c) || '—'} />
                      <DR label="E-posta"  value={c.email} />
                      <DR label="Telefon"  value={getBizPhone(c)} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Mesaj</div>
                      {c.mesaj ? (
                        <div style={{ fontSize: 12, color: C.text, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 12px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.mesaj}</div>
                      ) : <span style={{ fontSize: 12, color: C.muted }}>—</span>}
                    </div>

                    {/* Alt aksiyon çubuğu */}
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                      {c.status === 'approved' && (
                        <button onClick={() => onAction(c.id, 'reject')}
                          style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)', color: C.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Ic d={IC.x} size={12} /> Onayı Kaldır
                        </button>
                      )}
                      {c.status === 'rejected' && (
                        <button onClick={() => onAction(c.id, 'approve')}
                          style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,.3)', background: 'rgba(16,185,129,.08)', color: C.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Ic d={IC.check} size={12} /> Onaya Al
                        </button>
                      )}
                    </div>
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

function DR({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: C.muted }}>{label}: </span>
      <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADMİN DÜZENLEME MODALI
═══════════════════════════════════════════════ */
interface EditField { key: string; label: string; type?: 'text'|'number'|'textarea'|'select'|'photos'; options?: string[] }

const EDIT_FIELDS: Record<string, EditField[]> = {
  klinik:  [
    { key:'premium',   label:'👑 Premium Hesap (true/false)', type:'select', options:['true','false'] },
    { key:'claimed',   label:'✅ Sahiplenildi (true/false)', type:'select', options:['true','false'] },
    { key:'name',      label:'Klinik Adı' },
    { key:'type',      label:'Tür' },
    { key:'il',        label:'İl' },
    { key:'ilce',      label:'İlçe' },
    { key:'adres',     label:'Adres', type:'textarea' },
    { key:'tel',       label:'Telefon' },
    { key:'website',   label:'Website' },
    { key:'logo',      label:'Logo URL' },
    { key:'cover',     label:'Kapak Fotoğrafı URL' },
    { key:'photos',    label:'Fotoğraflar (her satıra bir URL)', type:'photos' },
    { key:'tour360url', label:'360° Sanal Tur URL / iframe kodu', type:'textarea' },
    { key:'photo360',  label:'360° Panorama Fotoğraf URL' },
  ],
  hastane: [
    { key:'premium',   label:'👑 Premium Hesap (true/false)', type:'select', options:['true','false'] },
    { key:'claimed',   label:'✅ Sahiplenildi (true/false)', type:'select', options:['true','false'] },
    { key:'name',      label:'Hastane Adı' },
    { key:'type',      label:'Tür', type:'select', options:['Devlet','Özel','Üniversite'] },
    { key:'il',        label:'İl' },
    { key:'ilce',      label:'İlçe' },
    { key:'adres',     label:'Adres', type:'textarea' },
    { key:'tel',       label:'Telefon' },
    { key:'docs',      label:'Doktor Sayısı', type:'number' },
    { key:'beds',      label:'Yatak Sayısı', type:'number' },
    { key:'website',   label:'Website' },
    { key:'logo',      label:'Logo URL' },
    { key:'cover',     label:'Kapak Fotoğrafı URL' },
    { key:'photos',    label:'Fotoğraflar (her satıra bir URL)', type:'photos' },
    { key:'tour360url', label:'360° Sanal Tur URL / iframe kodu', type:'textarea' },
    { key:'photo360',  label:'360° Panorama Fotoğraf URL' },
  ],
  doktor: [
    { key:'premium',     label:'👑 Premium Hesap (true/false)', type:'select', options:['true','false'] },
    { key:'ad',          label:'Ad' },
    { key:'soyad',       label:'Soyad' },
    { key:'spec',        label:'Uzmanlık' },
    { key:'unvan',       label:'Ünvan' },
    { key:'il',          label:'İl' },
    { key:'ilce',        label:'İlçe' },
    { key:'clinic_name', label:'Klinik/Hastane' },
    { key:'tel',         label:'Telefon' },
    { key:'fee',         label:'Muayene Ücreti', type:'number' },
    { key:'okul',        label:'Mezun Olduğu Okul' },
    { key:'bio',         label:'Hakkında', type:'textarea' },
    { key:'photo',       label:'Profil Fotoğrafı URL' },
    { key:'photos',      label:'Fotoğraflar (her satıra bir URL)', type:'photos' },
    { key:'tour360url',  label:'360° Sanal Tur URL / iframe kodu', type:'textarea' },
    { key:'photo360',    label:'360° Panorama Fotoğraf URL' },
  ],
  eczane: [
    { key:'premium',    label:'👑 Premium Hesap (true/false)', type:'select', options:['true','false'] },
    { key:'claimed',    label:'✅ Sahiplenildi (true/false)', type:'select', options:['true','false'] },
    { key:'name',       label:'Eczane Adı' },
    { key:'pharmacist', label:'Eczacı Adı' },
    { key:'il',         label:'İl' },
    { key:'ilce',       label:'İlçe' },
    { key:'address',    label:'Adres', type:'textarea' },
    { key:'tel',        label:'Telefon' },
    { key:'cover',      label:'Kapak Fotoğrafı URL' },
    { key:'photos',     label:'Fotoğraflar (her satıra bir URL)', type:'photos' },
    { key:'tour360url', label:'360° Sanal Tur URL / iframe kodu', type:'textarea' },
    { key:'photo360',   label:'360° Panorama Fotoğraf URL' },
  ],
};

function EditModal({ entity, entityType, onClose, onSaved }: {
  entity: Entity;
  entityType: string;
  onClose: () => void;
  onSaved: (updated: Entity) => void;
}) {
  const fields = EDIT_FIELDS[entityType] || [];
  const [form, setForm] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach(f => {
      if (f.type === 'photos') {
        // string[] → her satırda bir URL
        init[f.key] = Array.isArray(entity[f.key]) ? (entity[f.key] as string[]).join('\n') : '';
      } else {
        init[f.key] = entity[f.key] ?? '';
      }
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  async function handleSave() {
    setSaving(true); setErr('');
    // photos → string[], claimed → boolean dönüşümleri
    const payload = { ...form };
    fields.forEach(f => {
      if (f.type === 'photos' && typeof payload[f.key] === 'string') {
        payload[f.key] = payload[f.key].split('\n').map((u: string) => u.trim()).filter(Boolean);
      }
      if (f.key === 'claimed' || f.key === 'premium') {
        payload[f.key] = payload[f.key] === 'true' || payload[f.key] === true;
      }
    });
    const res = await fetch('/api/admin/update-entity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId: entity.id, fields: payload }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved({ ...entity, ...form });
      onClose();
    } else {
      const d = await res.json();
      setErr(d.error || 'Kayıt başarısız.');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)' }} />
      {/* Panel */}
      <div style={{ position: 'relative', width: 440, height: '100vh', background: '#0D1526', borderLeft: `1px solid rgba(255,255,255,.1)`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Başlık */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid rgba(255,255,255,.07)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0D1526', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Kaydı Düzenle</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{entity.name || `${entity.ad||''} ${entity.soyad||''}`.trim()}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: `1px solid rgba(255,255,255,.1)`, color: C.muted, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', flex: 1 }}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{f.label}</label>
              {f.type === 'photos' ? (
                <>
                  <textarea value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={4}
                    placeholder={'https://example.com/foto1.jpg\nhttps://example.com/foto2.jpg'}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid rgba(255,255,255,.12)`, background: 'rgba(255,255,255,.04)', color: C.text, fontSize: 12, fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  {/* Önizleme */}
                  {form[f.key] && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                      {form[f.key].split('\n').filter((u: string) => u.trim()).map((url: string, i: number) => (
                        <div key={i} style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: `1px solid rgba(255,255,255,.12)`, background: 'rgba(255,255,255,.04)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url.trim()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : f.type === 'textarea' ? (
                <textarea value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={3}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid rgba(255,255,255,.12)`, background: 'rgba(255,255,255,.04)', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              ) : f.type === 'select' ? (
                <select value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid rgba(255,255,255,.12)`, background: '#0D1526', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Seçin</option>
                  {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid rgba(255,255,255,.12)`, background: 'rgba(255,255,255,.04)', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}

          {err && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, padding: '9px 12px', fontSize: 12, color: C.red, marginBottom: 12 }}>{err}</div>}
        </div>

        {/* Kaydet */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid rgba(255,255,255,.07)`, position: 'sticky', bottom: 0, background: '#0D1526' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: saving ? 'rgba(212,168,67,.5)' : C.gold, color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? (
              <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin .9s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg> Kaydediliyor...</>
            ) : <><Ic d={IC.check} size={15} /> Kaydet</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   İŞLETME LİSTE SEKMESİ (klinik/hastane/doktor/eczane)
═══════════════════════════════════════════════ */
function EntityTab({ entityType }: { entityType: 'klinikler' | 'hastaneler' | 'doktorlar' | 'eczaneler' }) {
  const [items,        setItems]        = useState<Entity[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(0);
  const [editEntity,   setEditEntity]   = useState<Entity | null>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null); // 1. tık: id
  const [deleting,     setDeleting]     = useState(false);
  const PAGE_SIZE = 20;

  // doktorlar → ad, diğerleri → name
  const orderField = entityType === 'doktorlar' ? 'ad' : 'name';
  const typeKey = entityType.slice(0,-3) as 'klinik' | 'hastane' | 'doktor' | 'eczane';
  const meta = ENTITY_META[typeKey] || { color: C.blue, icon: IC.hastane, label: entityType };

  // Arama değişince sayfa sıfırlanır
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const sb = createSupabaseBrowser();
    const from = page * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;
    let q = (sb as any).from(entityType).select('*').order(orderField, { ascending: true });

    if (debouncedSearch.trim()) {
      const s = `%${debouncedSearch.trim()}%`;
      if (entityType === 'doktorlar') {
        // ad + soyad ya da il üzerinde arama
        q = q.or(`ad.ilike.${s},soyad.ilike.${s},il.ilike.${s}`);
      } else {
        q = q.or(`name.ilike.${s},il.ilike.${s}`);
      }
    }

    const { data } = await q.range(from, to);
    setItems(data || []);
    setLoading(false);
  }, [entityType, page, orderField, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const filtered = items; // Filtreleme artık Supabase tarafında yapılıyor

  async function handleDelete(id: string) {
    if (deleteId !== id) { setDeleteId(id); return; }        // 1. tık: onay bekleniyor
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/delete-entity', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: id, entityType: entityType }),
      });
      if (res.ok) {
        setItems(prev => prev.filter(it => it.id !== id));
      } else {
        const d = await res.json();
        alert('Silinemedi: ' + (d.error || 'Hata'));
      }
    } catch { alert('Bağlantı hatası'); }
    setDeleteId(null);
    setDeleting(false);
  }

  const labels: Record<string, string> = {
    klinikler:  'Klinik', hastaneler: 'Hastane',
    doktorlar:  'Doktor', eczaneler:  'Eczane',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>{labels[entityType]} Listesi</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Tüm kayıtlı {labels[entityType].toLowerCase()}ler</p>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 10, color: C.muted }}><Ic d={IC.search} size={14} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim veya şehir ara..."
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 220 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center', color: C.muted, fontSize: 13 }}>Kayıt bulunamadı.</div>
      ) : (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {/* Tablo başlığı */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px 80px 180px', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,.2)' }}>
            {['İşletme / Ad', 'Şehir', 'Puan', 'Sahiplenilmiş', 'İşlemler'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {filtered.map((e, i) => {
            // Doktorlar: ad + soyad; diğerleri: name — 55 karakterden uzunsa kes
            const rawName = typeKey === 'doktor'
              ? `${e.ad||''} ${e.soyad||''}`.trim()
              : (e.name || '');
            const name     = rawName.length > 55 ? rawName.slice(0, 55) + '…' : rawName;
            const isBadName = rawName.length > 55; // bio metni girilmiş olabilir
            // Doktorlar için alt satır: uzmanlık; diğerleri: il / ilçe
            const subtitle = typeKey === 'doktor'
              ? [e.spec, e.il && e.ilce ? `${e.il} / ${e.ilce}` : e.il].filter(Boolean).join(' · ')
              : (e.il && e.ilce ? `${e.il} / ${e.ilce}` : e.il || e.id);
            const url  = getProfileUrl(typeKey, e);
            const isClaimed = e.claimed === true;
            return (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px 80px 180px', gap: 12, padding: '12px 18px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || <span style={{ color: C.muted, fontStyle: 'italic' }}>İsim yok</span>}</span>
                    {isBadName && <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: 'rgba(239,68,68,.15)', color: '#F87171', border: '1px solid rgba(239,68,68,.3)' }}>Düzelt</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{e.il || '—'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: C.gold }}><Ic d={IC.star} size={12} /></span>
                  <span style={{ fontSize: 12, color: C.text }}>{e.rat?.toFixed(1) || '—'}</span>
                </div>
                <div>
                  {typeKey !== 'doktor' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: isClaimed ? C.green : C.muted, background: isClaimed ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.05)', padding: '2px 9px', borderRadius: 8, border: `1px solid ${isClaimed ? 'rgba(16,185,129,.3)' : C.border}` }}>
                      {isClaimed ? 'Evet' : 'Hayır'}
                    </span>
                  ) : <span style={{ fontSize: 11, color: C.muted }}>—</span>}
                </div>
                {/* İşlemler: Düzenle + Gör + Sil */}
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => setEditEntity(e)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 8, background: 'rgba(212,168,67,.1)', border: `1px solid rgba(212,168,67,.3)`, color: C.gold, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    <Ic d={IC.edit} size={11} /> Düzenle
                  </button>
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: `1px solid ${C.border}`, color: C.dim, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                      <Ic d={IC.eye} size={11} />
                    </a>
                  )}
                  {/* Silme: 1. tık kırmızıya döner + "Eminmisiniz?" yazar, 2. tık siler */}
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={deleting && deleteId === e.id}
                    title={deleteId === e.id ? 'Onaylamak için tekrar tıklayın' : 'Sil'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: deleteId === e.id ? '5px 8px' : '5px 8px',
                      borderRadius: 8,
                      background: deleteId === e.id ? 'rgba(239,68,68,.18)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${deleteId === e.id ? 'rgba(239,68,68,.5)' : C.border}`,
                      color: deleteId === e.id ? '#EF4444' : C.dim,
                      fontSize: 11, fontWeight: deleteId === e.id ? 700 : 600,
                      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      transition: 'all .15s',
                    }}
                    onMouseLeave={() => { if (deleteId === e.id) { /* bekle */ } }}
                  >
                    {deleteId === e.id
                      ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>Eminmisiniz?</>
                      : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    }
                  </button>
                  {/* İptal butonu — 1. tıktan sonra görünür */}
                  {deleteId === e.id && (
                    <button
                      onClick={() => setDeleteId(null)}
                      style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 7px', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                      title="İptal">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sayfalama */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, justifyContent: 'center' }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
          style={{ padding: '7px 16px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: page === 0 ? C.muted : C.text, cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
          ← Önceki
        </button>
        <span style={{ fontSize: 12, color: C.muted }}>Sayfa {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={items.length < PAGE_SIZE}
          style={{ padding: '7px 16px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: items.length < PAGE_SIZE ? C.muted : C.text, cursor: items.length < PAGE_SIZE ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
          Sonraki →
        </button>
      </div>

      {/* Düzenleme Modali */}
      {editEntity && (
        <EditModal
          entity={editEntity}
          entityType={typeKey}
          onClose={() => setEditEntity(null)}
          onSaved={updated => setItems(prev => prev.map(it => it.id === updated.id ? updated : it))}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BLOG SEKMESİ
═══════════════════════════════════════════════ */
function BlogTab() {
  const [posts, setPosts]   = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast]   = useState('');

  useEffect(() => {
    const sb = createSupabaseBrowser();
    (sb as any).from('blog_posts').select('id,title,slug,category,published,views,created_at').order('created_at', { ascending: false })
      .then(({ data }: any) => { setPosts(data || []); setLoading(false); });
  }, []);

  async function togglePublish(id: string, current: boolean) {
    setToggling(id);
    const sb = createSupabaseBrowser();
    await (sb as any).from('blog_posts').update({ published: !current }).eq('id', id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: !current } : p));
    setToggling(null);
    showToast(!current ? 'Yazı yayınlandı' : 'Yazı gizlendi');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>Blog Yazıları</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Yayın durumunu buradan yönetin</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center', color: C.muted }}>Henüz blog yazısı yok.</div>
      ) : (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {/* Tablo başlığı */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 80px 120px', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,.2)' }}>
            {['Başlık', 'Kategori', 'Görüntülenme', 'Durum', 'Aksiyon'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {posts.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 80px 120px', gap: 12, padding: '13px 18px', borderBottom: i < posts.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || '—'}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>/{p.slug}</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{p.category || '—'}</div>
              <div style={{ fontSize: 12, color: C.text }}>{p.views || 0}</div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: p.published ? C.green : C.muted, background: p.published ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.05)', padding: '2px 9px', borderRadius: 8, border: `1px solid ${p.published ? 'rgba(16,185,129,.3)' : C.border}` }}>
                  {p.published ? 'Yayında' : 'Gizli'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => togglePublish(p.id, !!p.published)} disabled={toggling === p.id}
                  style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${p.published ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`, background: p.published ? 'rgba(239,68,68,.08)' : 'rgba(16,185,129,.08)', color: p.published ? C.red : C.green, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                  {toggling === p.id ? '...' : p.published ? 'Gizle' : 'Yayınla'}
                </button>
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"
                  style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 11, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Ic d={IC.eye} size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? '0' : '12px'})`, background: '#1A2744', color: 'white', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 600, opacity: toast ? 1 : 0, transition: 'all .3s', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SİSTEM & DB SEKMESİ
═══════════════════════════════════════════════ */
const MIGRATION_SQL = `-- Eksik kolonları ekle (IF NOT EXISTS — güvenli)
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE klinikler  ADD COLUMN IF NOT EXISTS photos     TEXT[];
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE hastaneler ADD COLUMN IF NOT EXISTS photos     TEXT[];
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE doktorlar  ADD COLUMN IF NOT EXISTS photos     TEXT[];
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS tour360url TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS photo360   TEXT;
ALTER TABLE eczaneler  ADD COLUMN IF NOT EXISTS photos     TEXT[];
ALTER TABLE yorumlar   ADD COLUMN IF NOT EXISTS reply_text TEXT;
ALTER TABLE yorumlar   ADD COLUMN IF NOT EXISTS reply_at   TIMESTAMPTZ;
NOTIFY pgrst, 'reload schema';`;

/* ═══════════════════════════════════════════════
   360° ÇEKİM TALEPLERİ SEKMESİ
═══════════════════════════════════════════════ */
interface CekimTalebi {
  id: string;
  isletme_adi: string;
  isletme_turu: string | null;
  il: string | null;
  ilce: string | null;
  ad_soyad: string;
  tel: string;
  email: string | null;
  notlar: string | null;
  durum: string;
  created_at: string;
}

const DURUM_LABELS: Record<string, { label: string; color: string }> = {
  beklemede:        { label: 'Beklemede',         color: C.amber  },
  iletisime_gecildi:{ label: 'İletişime Geçildi', color: C.blue   },
  tamamlandi:       { label: 'Tamamlandı',        color: C.green  },
  iptal:            { label: 'İptal',             color: C.red    },
};

function CekimTalepleriTab() {
  const [talepler, setTalepler]   = useState<CekimTalebi[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [filter,   setFilter]     = useState<string>('all');
  const [updating, setUpdating]   = useState<string | null>(null);

  const sb = createSupabaseBrowser();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (sb as any).from('cekim_talepleri')
      .select('*')
      .order('created_at', { ascending: false });
    setTalepler((data as CekimTalebi[]) || []);
    setLoading(false);
  }, [sb]);

  useEffect(() => { load(); }, [load]);

  const updateDurum = async (id: string, durum: string) => {
    setUpdating(id);
    await (sb as any).from('cekim_talepleri').update({ durum }).eq('id', id);
    setTalepler(prev => prev.map(t => t.id === id ? { ...t, durum } : t));
    setUpdating(null);
  };

  const shown = filter === 'all' ? talepler : talepler.filter(t => t.durum === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.4px' }}>
            360° Çekim Talepleri
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>
            İşletmelerden gelen profesyonel fotoğraf çekim talepleri
          </p>
        </div>
        <a href="/360-fotograf" target="_blank" rel="noopener"
          style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(212,168,67,.15)', border: '1px solid rgba(212,168,67,.3)', color: C.gold, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Çekim Sayfasını Görüntüle
        </a>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {(['all', 'beklemede', 'iletisime_gecildi', 'tamamlandi'] as const).map(k => {
          const count = k === 'all' ? talepler.length : talepler.filter(t => t.durum === k).length;
          const info  = k === 'all' ? { label: 'Toplam', color: C.text } : DURUM_LABELS[k] || { label: k, color: C.muted };
          return (
            <button key={k} onClick={() => setFilter(k)}
              style={{ background: filter === k ? C.card : C.panel, border: `1px solid ${filter === k ? info.color : C.border}`, borderRadius: 14, padding: '16px 20px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: info.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 600 }}>{info.label}</div>
            </button>
          );
        })}
      </div>

      {/* Tablo */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Yükleniyor…</div>
      ) : shown.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.muted }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 12px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Henüz çekim talebi yok.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map(t => {
            const durum = DURUM_LABELS[t.durum] || { label: t.durum, color: C.muted };
            return (
              <div key={t.id} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  {/* Sol: bilgiler */}
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{t.isletme_adi}</span>
                      {t.isletme_turu && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.25)', borderRadius: 6, padding: '2px 8px', textTransform: 'uppercase' }}>{t.isletme_turu}</span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 700, color: durum.color, background: `${durum.color}18`, border: `1px solid ${durum.color}40`, borderRadius: 6, padding: '2px 8px' }}>
                        {durum.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: C.muted }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {t.ad_soyad}
                      </span>
                      <a href={`tel:${t.tel}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.gold, textDecoration: 'none', fontWeight: 600 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {t.tel}
                      </a>
                      {t.email && (
                        <a href={`mailto:${t.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.blue, textDecoration: 'none' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          {t.email}
                        </a>
                      )}
                      {(t.il || t.ilce) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {[t.ilce, t.il].filter(Boolean).join(', ')}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: C.dim }}>
                        {new Date(t.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {t.notlar && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8, fontSize: 12, color: C.muted, borderLeft: `3px solid ${C.border}` }}>
                        {t.notlar}
                      </div>
                    )}
                  </div>

                  {/* Sağ: durum seçici */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '.5px' }}>Durumu Güncelle</div>
                    {Object.entries(DURUM_LABELS).map(([k, v]) => (
                      <button key={k} onClick={() => updateDurum(t.id, k)} disabled={updating === t.id}
                        style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${t.durum === k ? v.color : C.border}`, background: t.durum === k ? `${v.color}22` : 'transparent', color: t.durum === k ? v.color : C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                        {t.durum === k ? '● ' : '○ '}{v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   E-POSTA LİSTELERİ SEKMESİ
═══════════════════════════════════════════════ */
interface EmailAbone {
  id: string;
  email: string;
  isim: string | null;
  tip: 'isletme' | 'hasta';
  kaynak: string | null;
  entity_id: string | null;
  entity_type: string | null;
  entity_name: string | null;
  aktif: boolean;
  created_at: string;
}

function EmailListesiTab() {
  const sb = createSupabaseBrowser();
  const [aboneler,    setAboneler]    = useState<EmailAbone[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tipFilter,   setTipFilter]   = useState<'hepsi' | 'hasta' | 'isletme'>('hepsi');
  const [search,      setSearch]      = useState('');
  const [entityFilter,setEntityFilter]= useState('');
  const [page,        setPage]        = useState(0);

  const PAGE_SIZE = 50;

  const KAYNAK_LABEL: Record<string, string> = {
    giris: 'Giriş', kayit: 'Kayıt', sahiplenme: 'Sahiplenme',
    profil: 'Profil', form: 'Form',
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    const { data } = await (sb as any).from('email_aboneleri')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000);
    setAboneler(data || []);
    setLoading(false);
  }

  /* Filtreleme */
  const filtered = aboneler.filter(a => {
    if (tipFilter !== 'hepsi' && a.tip !== tipFilter) return false;
    if (entityFilter && a.entity_name && !a.entity_name.toLowerCase().includes(entityFilter.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.email.toLowerCase().includes(q) ||
        (a.isim || '').toLowerCase().includes(q) ||
        (a.entity_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const hasta    = aboneler.filter(a => a.tip === 'hasta');
  const isletme  = aboneler.filter(a => a.tip === 'isletme');
  const paged    = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /* Öne çıkan işletmeler (entity bazlı grupla) */
  const entityGroups: Record<string, { name: string; type: string; count: number }> = {};
  aboneler.filter(a => a.entity_id && a.entity_name).forEach(a => {
    const k = a.entity_id!;
    if (!entityGroups[k]) entityGroups[k] = { name: a.entity_name!, type: a.entity_type || '', count: 0 };
    entityGroups[k].count++;
  });
  const topEntities = Object.values(entityGroups).sort((a, b) => b.count - a.count).slice(0, 5);

  /* CSV Export */
  function exportCSV() {
    const rows = [
      ['E-posta', 'İsim', 'Tip', 'Kaynak', 'İşletme', 'İşletme Tipi', 'Aktif', 'Tarih'],
      ...filtered.map(a => [
        a.email, a.isim || '', a.tip, a.kaynak || '',
        a.entity_name || '', a.entity_type || '',
        a.aktif ? 'Evet' : 'Hayır',
        new Date(a.created_at).toLocaleDateString('tr-TR'),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `hekimhane-aboneler-${tipFilter}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: C.muted, gap: 10 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin .9s linear infinite' }}>
        <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,.15)" strokeWidth="2.5"/>
        <path d="M10 2a8 8 0 0 1 8 8" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 14 }}>Yükleniyor...</span>
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.4px' }}>E-posta Listeleri</h2>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Tüm aboneler — giriş, kayıt, sahiplenme, profil ve form kaynaklarından toplanan</p>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Toplam Abone',   value: aboneler.length,  color: C.blue,   desc: 'tüm segmentler' },
          { label: 'Hasta / Kullanıcı', value: hasta.length,  color: C.green,  desc: 'genel kullanıcı' },
          { label: 'Doktor / İşletme',  value: isletme.length,color: C.gold,   desc: 'işletme sahibi' },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, borderRadius: 14, padding: '20px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value.toLocaleString('tr-TR')}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 2, opacity: .7 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Top işletmeler */}
      {topEntities.length > 0 && (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>En Fazla Abone Toplayan İşletmeler</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {topEntities.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '8px 14px', border: `1px solid ${C.border}` }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: C.navy + '66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.gold }}>{i + 1}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{e.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{e.type} · {e.count} abone</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtre + Arama + Export */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Segment filtre */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 4 }}>
          {(['hepsi', 'hasta', 'isletme'] as const).map(t => (
            <button key={t} onClick={() => { setTipFilter(t); setPage(0); }}
              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: tipFilter === t ? 700 : 500, background: tipFilter === t ? C.navy : 'transparent', color: tipFilter === t ? 'white' : C.muted, transition: 'all .15s' }}>
              {t === 'hepsi' ? 'Hepsi' : t === 'hasta' ? 'Hasta / Kullanıcı' : 'Doktor / İşletme'}
            </button>
          ))}
        </div>

        {/* Arama */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
            <path d={IC.search}/>
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="E-posta veya isim ara..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* İşletme filtre */}
        <input value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(0); }}
          placeholder="İşletme adı filtrele..."
          style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 180 }} />

        {/* Yenile */}
        <button onClick={loadData}
          style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ic d={IC.refresh} size={13} /> Yenile
        </button>

        {/* CSV Export */}
        <button onClick={exportCSV}
          style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: C.gold, color: '#111', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          CSV İndir ({filtered.length})
        </button>
      </div>

      {/* Liste */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 140px 80px', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          <span>E-posta / İsim</span>
          <span>Segment</span>
          <span>Kaynak</span>
          <span>İşletme</span>
          <span>Tarih</span>
          <span>Durum</span>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
            {search || entityFilter ? 'Aramanızla eşleşen kayıt bulunamadı.' : 'Henüz abone yok.'}
          </div>
        ) : paged.map((a, i) => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 140px 80px', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < paged.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background .12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

            {/* E-posta + isim */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
              {a.isim && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{a.isim}</div>}
            </div>

            {/* Segment */}
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
              background: a.tip === 'isletme' ? 'rgba(212,168,67,.12)' : 'rgba(16,185,129,.12)',
              color:      a.tip === 'isletme' ? C.gold : C.green, whiteSpace: 'nowrap' }}>
              {a.tip === 'isletme' ? 'İşletme' : 'Hasta'}
            </span>

            {/* Kaynak */}
            <span style={{ fontSize: 11, color: C.muted }}>
              {KAYNAK_LABEL[a.kaynak || ''] || a.kaynak || '—'}
            </span>

            {/* İşletme */}
            <div style={{ fontSize: 11, color: C.blue, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.entity_name || ''}>
              {a.entity_name ? (
                <span title={`${a.entity_type} · ${a.entity_id}`}>{a.entity_name}</span>
              ) : <span style={{ color: C.muted }}>—</span>}
            </div>

            {/* Tarih */}
            <span style={{ fontSize: 11, color: C.muted }}>
              {new Date(a.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>

            {/* Durum */}
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
              background: a.aktif ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
              color:      a.aktif ? C.green : C.red }}>
              {a.aktif ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: page === 0 ? C.dim : C.text, cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            ← Önceki
          </button>
          <span style={{ fontSize: 12, color: C.muted }}>{page + 1} / {totalPages} · {filtered.length} kayıt</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: page === totalPages - 1 ? C.dim : C.text, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}

function SistemTab() {
  const [checking, setChecking] = useState(false);
  const [result,   setResult]   = useState<{allOk:boolean; missing:{table:string;col:string}[]} | null>(null);
  const [copied,   setCopied]   = useState(false);

  async function checkCols() {
    setChecking(true); setResult(null);
    const res = await fetch('/api/admin/check-columns');
    const json = await res.json();
    setChecking(false);
    setResult(json);
  }

  function copySql() {
    navigator.clipboard.writeText(MIGRATION_SQL).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>Sistem & Veritabanı</h2>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Kolon kontrolü ve migrasyon yönetimi</p>
      </div>

      {/* Kolon Kontrolü */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Veritabanı Kolon Kontrolü</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Gerekli kolonların DB&apos;de mevcut olup olmadığını kontrol eder</div>
          </div>
          <button onClick={checkCols} disabled={checking}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: checking ? C.muted : C.gold, color: 'white', fontSize: 13, fontWeight: 700, cursor: checking ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            {checking
              ? <><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Kontrol ediliyor...</>
              : <><Ic d={IC.refresh} size={13}/>Kontrol Et</>
            }
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 10 }}>
            {result.allOk ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.green }}>
                <Ic d={IC.check} size={14}/> Tüm kolonlar mevcut — migrasyon gerekmiyor!
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.red, marginBottom: 10 }}>
                  <Ic d={IC.x} size={14}/> {result.missing.length} eksik kolon tespit edildi — migrasyon çalıştırılmalı
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.missing.map(m => (
                    <span key={`${m.table}-${m.col}`} style={{ fontSize: 11, fontWeight: 600, color: C.amber, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 6, padding: '3px 9px', fontFamily: 'monospace' }}>
                      {m.table}.{m.col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Migrasyon SQL */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Migrasyon SQL</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              Supabase → SQL Editor&apos;a gidin → Yeni sorgu → Yapıştırın → Çalıştırın
            </div>
          </div>
          <button onClick={copySql}
            style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${copied ? C.green : C.border}`, background: copied ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.05)', color: copied ? C.green : C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s' }}>
            {copied ? <><Ic d={IC.check} size={13}/>Kopyalandı!</> : <><Ic d={IC.link} size={13}/>SQL&apos;i Kopyala</>}
          </button>
        </div>
        <pre style={{ background: 'rgba(0,0,0,.4)', borderRadius: 10, padding: '14px 16px', fontSize: 11.5, color: 'rgba(255,255,255,.7)', fontFamily: 'monospace', lineHeight: 1.7, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {MIGRATION_SQL}
        </pre>

        <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 6 }}>📋 Adım adım:</div>
          <ol style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
            <li><strong style={{ color: C.text }}>Supabase</strong> dashboard&apos;a gidin</li>
            <li>Sol menüden <strong style={{ color: C.text }}>SQL Editor</strong>&apos;ı açın</li>
            <li><strong style={{ color: C.text }}>+ New query</strong> butonuna tıklayın</li>
            <li>Yukarıdaki SQL&apos;i kopyalayıp yapıştırın</li>
            <li><strong style={{ color: C.gold }}>Run</strong> (▶) butonuna basın</li>
            <li>Başarılı olduktan sonra bu sayfadan <strong style={{ color: C.text }}>Kontrol Et</strong>&apos;e basın</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GEOCODİNG SEKMESİ
═══════════════════════════════════════════════ */
function GeocodeTab() {
  type RunKey = 'klinikler' | 'klinikler_dis' | 'hastaneler' | 'doktorlar' | 'eczaneler';

  const [counts,    setCounts]    = useState<Record<string, number> | null>(null);
  const [loadingC,  setLoadingC]  = useState(false);
  const [activeKey, setActiveKey] = useState<RunKey | null>(null);
  const [log,       setLog]       = useState<{ name: string; ok: boolean; lat?: number; lng?: number }[]>([]);
  const [totalDone, setTotalDone] = useState(0);
  const [totalFail, setTotalFail] = useState(0);
  const [totalAll,  setTotalAll]  = useState(0);
  const [batchNum,  setBatchNum]  = useState(0);
  const [error,     setError]     = useState<string | null>(null);
  const [done,      setDone]      = useState(false);
  const stopRef = useCallback(() => {}, []); // stopFlag ref
  const [stopFlag, setStopFlag]   = useState(false);

  useEffect(() => { loadCounts(); }, []);

  async function loadCounts() {
    setLoadingC(true);
    const res  = await fetch('/api/admin/geocode');
    const json = await res.json();
    setCounts(json.counts || null);
    setLoadingC(false);
  }

  async function startGeocode(key: RunKey) {
    const table:      string = key === 'klinikler_dis' ? 'klinikler' : key;
    const typeFilter: string | null = key === 'klinikler_dis' ? 'diş' : null;

    setActiveKey(key);
    setLog([]); setTotalDone(0); setTotalFail(0); setTotalAll(counts?.[key] || 0);
    setBatchNum(0); setError(null); setDone(false); setStopFlag(false);

    let cumDone = 0, cumFail = 0, batch = 0;
    let keepGoing = true;

    while (keepGoing) {
      batch++;
      setBatchNum(batch);

      let res: Response;
      try {
        const body: Record<string, string> = { table };
        if (typeFilter) body.typeFilter = typeFilter;
        res = await fetch('/api/admin/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (e) {
        setError('Ağ hatası — bağlantıyı kontrol edin.');
        break;
      }

      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Sunucu hatası'); break; }

      const results: { name: string; ok: boolean; lat?: number; lng?: number }[] = json.results || [];
      cumDone += json.success || 0;
      cumFail += json.failed  || 0;

      setLog(prev => [...results, ...prev]); // yeni sonuçlar üste
      setTotalDone(cumDone);
      setTotalFail(cumFail);

      // Bitiş koşulları
      if (json.remaining === 0 || results.length === 0) {
        keepGoing = false;
      }
      // Kullanıcı durdurdu mu?
      if (stopFlag) { keepGoing = false; }
    }

    setActiveKey(null);
    setDone(true);
    loadCounts();
  }

  const CARDS: { key: RunKey; label: string; sub?: string; color: string }[] = [
    { key: 'klinikler_dis', label: 'Diş Klinikleri', sub: 'Öncelikli', color: '#0891B2' },
    { key: 'klinikler',     label: 'Tüm Klinikler',  color: C.navy },
    { key: 'hastaneler',    label: 'Hastaneler',      color: '#7C3AED' },
    { key: 'doktorlar',     label: 'Doktorlar',       color: '#059669' },
    { key: 'eczaneler',     label: 'Eczaneler',       color: '#DC2626' },
  ];

  const isRunning = activeKey !== null;
  const progress  = totalAll > 0 ? Math.min(100, Math.round((totalDone + totalFail) / totalAll * 100)) : 0;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Harita Koordinatları</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
        Koordinatı eksik işletmeler OpenStreetMap Nominatim ile otomatik bulunur.
        Butona <strong>bir kez</strong> basın — tüm kayıtlar bitene kadar otomatik çalışır.
      </p>

      {/* Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
        {CARDS.map(card => {
          const cnt   = counts?.[card.key] ?? null;
          const isMe  = activeKey === card.key;
          const isDone = cnt === 0;
          return (
            <div key={card.key} style={{ background: C.card, borderRadius: 14, border: `1px solid ${isMe ? card.color : C.border}`, padding: '16px 18px', transition: 'border-color .2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isMe ? card.color : (isDone ? C.green : C.amber), flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>{card.label}</span>
                {card.sub && <span style={{ fontSize: 9, fontWeight: 800, color: card.color, background: `${card.color}22`, padding: '1px 5px', borderRadius: 4, letterSpacing: 0.5 }}>{card.sub}</span>}
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: isDone ? C.green : C.text, marginBottom: 4 }}>
                {loadingC ? '…' : (cnt ?? '…')}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>koordinatsız kayıt</div>
              <button
                onClick={() => !isRunning && cnt && startGeocode(card.key)}
                disabled={isRunning || !cnt}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 9, border: 'none',
                  background: isMe ? card.color : (isDone ? '#1A2A1A' : card.color),
                  color: 'white', fontSize: 12, fontWeight: 700,
                  cursor: (isRunning || !cnt) ? 'not-allowed' : 'pointer',
                  opacity: (!isRunning && !cnt) ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
                  transition: 'opacity .2s',
                }}>
                {isMe
                  ? <><svg width="12" height="12" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin .9s linear infinite' }}><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.3)" strokeWidth="2"/><path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>İşleniyor…</>
                  : isDone ? '✓ Tamamlandı' : '▶ Tümünü İşle'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Aktif İlerleme */}
      {isRunning && (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
              Batch #{batchNum} işleniyor…
            </span>
            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              <span style={{ color: C.green, fontWeight: 700 }}>✓ {totalDone} eklendi</span>
              {totalFail > 0 && <span style={{ color: C.amber }}>⚠ {totalFail} bulunamadı</span>}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, borderRadius: 6, transition: 'width .4s' }} />
          </div>
          {totalAll > 0 && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{totalDone + totalFail} / {totalAll} kayıt işlendi ({progress}%)</div>
          )}
          <button
            onClick={() => setStopFlag(true)}
            style={{ marginTop: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,.4)', background: 'transparent', color: C.red, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Durdur
          </button>
        </div>
      )}

      {/* Tamamlandı mesajı */}
      {done && !isRunning && (
        <div style={{ padding: '14px 18px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.green, marginBottom: 2 }}>İşlem Tamamlandı!</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              <span style={{ color: C.green, fontWeight: 700 }}>{totalDone} koordinat</span> eklendi
              {totalFail > 0 && <>, <span style={{ color: C.amber, fontWeight: 600 }}>{totalFail} kayıt</span> adres ile bulunamadı</>}.
            </div>
          </div>
        </div>
      )}

      {/* Hata */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, color: C.red, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Canlı Log */}
      {log.length > 0 && (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Sonuçlar</span>
            <span style={{ fontSize: 12, color: C.muted }}>{log.length} kayıt gösteriliyor</span>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', fontFamily: 'monospace' }}>
            {log.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px', borderBottom: `1px solid rgba(255,255,255,.04)`, fontSize: 12 }}>
                <span style={{ color: r.ok ? C.green : C.amber, flexShrink: 0 }}>{r.ok ? '✓' : '✗'}</span>
                <span style={{ flex: 1, color: r.ok ? C.text : C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                {r.ok && r.lat != null && (
                  <span style={{ fontSize: 11, color: C.dim, flexShrink: 0 }}>
                    {r.lat.toFixed(4)}, {r.lng?.toFixed(4)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: C.dim, marginTop: 16, lineHeight: 1.6 }}>
        Nominatim kullanım koşulları: saniyede maksimum 1 istek. Her batch ~60 sn sürer. Sekmeyi açık tutun.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   KULLANICI SEKMESİ
═══════════════════════════════════════════════ */
function UsersTab() {
  const [users, setUsers]   = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    (sb as any).from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }: any) => { setUsers(data || []); setLoading(false); });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>Kayıtlı Kullanıcılar</h2>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Hesap oluşturmuş işletme sahipleri</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Yükleniyor...</div>
      ) : users.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center', color: C.muted }}>Henüz kayıtlı kullanıcı yok.</div>
      ) : (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 100px', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,.2)' }}>
            {['Kullanıcı', 'E-posta', 'İşletme Türü', 'Rol'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 100px', gap: 12, padding: '12px 18px', borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{u.full_name || '—'}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{new Date(u.created_at).toLocaleDateString('tr-TR')}</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '—'}</div>
              <div>
                {u.entity_type ? <TypeBadge type={u.entity_type} /> : <span style={{ fontSize: 11, color: C.muted }}>—</span>}
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: u.role === 'admin' ? C.gold : C.muted, background: u.role === 'admin' ? 'rgba(212,168,67,.12)' : 'rgba(255,255,255,.05)', padding: '2px 9px', borderRadius: 8 }}>
                  {u.role || 'owner'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANA BİLEŞEN
═══════════════════════════════════════════════ */
export default function AdminPage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [tab,     setTab]     = useState<TabKey>('dashboard');

  const [stats,        setStats]        = useState<Stats | null>(null);
  const [claims,       setClaims]       = useState<Claim[]>([]);
  const [claimsLoading,setClaimsLoading]= useState(false);
  const [actionId,     setActionId]     = useState<string | null>(null);
  const [toast,        setToast]        = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/admin/giris';
        return;
      }
      const isAdmin = session.user.email === ADMIN_EMAIL;
      setUser(session.user);
      setAllowed(isAdmin);
      setLoading(false);
      if (isAdmin) {
        loadStats();
        loadClaims();
      }
    });
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data: Stats = await res.json();
        setStats(data);
        setPendingCount(data.claims.pending);
      }
    } catch {}
  }

  const loadClaims = useCallback(async () => {
    setClaimsLoading(true);
    const sb = createSupabaseBrowser();
    const { data } = await (sb as any).from('claim_requests').select('*').order('created_at', { ascending: false });
    setClaims(data || []);
    setClaimsLoading(false);
  }, []);

  async function handleClaimAction(id: string, action: 'approve' | 'reject') {
    setActionId(id);
    try {
      const res = await fetch('/api/admin/claim-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: id, action }),
      });
      if (res.ok) {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
        setPendingCount(prev => action === 'approve' || action === 'reject' ? Math.max(0, prev - 1) : prev);
        showToast(action === 'approve' ? 'Talep onaylandı' : 'Talep reddedildi');
        await loadStats();
      } else {
        showToast('Hata oluştu, tekrar deneyin');
      }
    } catch {
      showToast('Bağlantı hatası');
    }
    setActionId(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = '/admin/giris';
  }

  /* ── Yükleniyor ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ animation: 'spin .9s linear infinite' }}>
          <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,.1)" strokeWidth="3"/>
          <path d="M16 3a13 13 0 0 1 13 13" stroke={C.gold} strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Giriş yok ── */
  if (!user) {
    return null; // useEffect redirect to /admin/giris handles this
  }

  /* ── Yetkisiz ── */
  if (!allowed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px', textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: C.red }}>
            <Ic d={IC.shield} size={24} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>Erişim Reddedildi</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>Bu sayfa yalnızca yetkili yöneticiler içindir.</p>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{user.email}</p>
          <a href="/" style={{ fontSize: 13, color: C.gold, fontWeight: 600, textDecoration: 'none' }}>← Ana Sayfaya Dön</a>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const name   = user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ position: 'fixed', top: 64, left: 0, bottom: 0, width: 224, background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', zIndex: 100 }}>

        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1B3A69,#0F2A55)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 14, color: 'white' }}>H</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.text, letterSpacing: '-0.3px' }}>Hekimhane</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(212,168,67,.1)', border: '1px solid rgba(212,168,67,.2)', borderRadius: 6, padding: '3px 8px' }}>
            <Ic d={IC.shield} size={10} />
            <span style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: '0.5px' }}>ADMİN PANELİ</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {SIDEBAR_ITEMS.map(item => {
            const active = tab === item.key;
            return (
              <button key={item.key} onClick={() => setTab(item.key as TabKey)}
                style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '10px 10px', marginBottom: 2, borderRadius: 10, background: active ? 'rgba(255,255,255,.08)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: active ? C.text : C.muted, fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'inherit', transition: 'all .12s', borderLeft: active ? `3px solid ${C.gold}` : '3px solid transparent' }}>
                <span style={{ flexShrink: 0 }}><Ic d={item.icon} size={15} /></span>
                {item.label}
                {item.key === 'claims' && pendingCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: C.amber, color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profil + Çıkış */}
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            {avatar
              ? <img src={avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
              : <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{name.charAt(0)}</div>
            }
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: C.muted }}>Yönetici</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.red; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}>
            <Ic d={IC.logout} size={13} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 224, flex: 1, padding: '32px 36px', paddingTop: 96, minHeight: '100vh' }}>
        {tab === 'dashboard'  && <DashboardTab stats={stats} onTabChange={setTab} />}
        {tab === 'claims'     && <ClaimsTab claims={claims} loading={claimsLoading} onAction={handleClaimAction} actionId={actionId} />}
        {tab === 'cekim'      && <CekimTalepleriTab />}
        {tab === 'emailler'   && <EmailListesiTab />}
        {tab === 'klinikler'  && <EntityTab entityType="klinikler" />}
        {tab === 'hastaneler' && <EntityTab entityType="hastaneler" />}
        {tab === 'doktorlar'  && <EntityTab entityType="doktorlar" />}
        {tab === 'eczaneler'  && <EntityTab entityType="eczaneler" />}
        {tab === 'blog'       && <BlogTab />}
        {tab === 'kullanici'  && <UsersTab />}
        {tab === 'sistem'     && <SistemTab />}
        {tab === 'geocode'    && <GeocodeTab />}
      </main>

      {/* ── TOAST ── */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? '0' : '12px'})`, background: '#1A2744', color: 'white', padding: '10px 24px', borderRadius: 50, fontSize: 13, fontWeight: 600, opacity: toast ? 1 : 0, transition: 'all .3s', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {toast}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}
