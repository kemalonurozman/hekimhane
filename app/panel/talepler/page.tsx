'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

interface ClaimRequest {
  id: string;
  entity_type: string;
  entity_name: string | null;
  entity_id: string | null;
  claimant_name: string;
  email: string;
  phone: string;
  role: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: 'İncelemede', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  approved: { label: 'Onaylandı',  bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
  rejected: { label: 'Reddedildi', bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' },
};

const ENTITY_LABEL: Record<string, string> = {
  klinik:  'Diş Kliniği',
  hastane: 'Hastane',
  eczane:  'Eczane',
  doktor:  'Doktor',
};

const ENTITY_COLOR: Record<string, string> = {
  klinik:  '#0891B2',
  hastane: '#7C3AED',
  doktor:  '#059669',
  eczane:  '#EA580C',
};

function Badge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function IcBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2z"/>
      <path d="M9 22V12h6v10M9 6h1M14 6h1M9 10h1M14 10h1"/>
    </svg>
  );
}
function IcPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
function IcArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

export default function TaleplerPage() {
  const router = useRouter();
  const [claims,  setClaims]  = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/giris?redirect=/panel/talepler');
        return;
      }
      const email = session.user.email!;
      const { data } = await (supabase as any)
        .from('claim_requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });
      setClaims(data || []);
      setLoading(false);
    });
  }, [router]);

  const approved = claims.filter(c => c.status === 'approved');
  const pending  = claims.filter(c => c.status === 'pending');
  const rejected = claims.filter(c => c.status === 'rejected');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F4FF',
      paddingTop: 80,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
    }}>
      <div className="container" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px' }}>

        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Link href="/panel" style={{ fontSize: 13, color: '#6B7A99', textDecoration: 'none', fontWeight: 500 }}>
                ← Panel
              </Link>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2744', letterSpacing: '-0.5px', margin: 0 }}>
              Sahiplenme Taleplerim
            </h1>
            <p style={{ fontSize: 13, color: '#6B7A99', marginTop: 4 }}>
              İşletme sahiplenme başvurularınızın durumu
            </p>
          </div>
          <Link href="/katil" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 11,
            background: '#1B3A69', color: 'white',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            <IcPlus /> Yeni Başvuru
          </Link>
        </div>

        {/* Özet kartlar */}
        {!loading && claims.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Onaylı', count: approved.length, bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
              { label: 'İncelemede', count: pending.length,  bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
              { label: 'Reddedilen', count: rejected.length, bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '60px', textAlign: 'center', border: '1px solid #E2E8F4' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ animation: 'spin .9s linear infinite', display: 'inline-block', marginBottom: 12 }}>
              <circle cx="16" cy="16" r="13" stroke="#E5E7EB" strokeWidth="3"/>
              <path d="M16 3a13 13 0 0 1 13 13" stroke="#1B3A69" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 13, color: '#6B7A99' }}>Talepler yükleniyor...</div>
          </div>
        ) : claims.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F4', padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#1B3A69' }}>
              <IcBuilding />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>Henüz başvurunuz yok</h2>
            <p style={{ fontSize: 13, color: '#6B7A99', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.7 }}>
              İşletmenizi Hekimhane'ye ekleyin veya mevcut profilin sahipliğini talep edin.
            </p>
            <Link href="/katil" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#1B3A69', color: 'white', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              <IcPlus /> Başvuru Oluştur
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {claims.map(c => (
              <div key={c.id} style={{
                background: 'white', borderRadius: 16, border: '1px solid #E2E8F4',
                padding: '18px 22px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  {/* İkon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: (ENTITY_COLOR[c.entity_type] || '#1B3A69') + '18',
                    color: ENTITY_COLOR[c.entity_type] || '#1B3A69',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IcBuilding />
                  </div>
                  {/* Bilgiler */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2744', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.entity_name || 'Yeni İşletme Başvurusu'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ENTITY_COLOR[c.entity_type] || '#6B7A99' }}>
                        {ENTITY_LABEL[c.entity_type] || c.entity_type}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>·</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                        {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {c.role && (
                        <>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>·</span>
                          <span style={{ fontSize: 11, color: '#6B7A99' }}>{c.role}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ: badge + profil linki */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <Badge status={c.status} />
                  {c.status === 'approved' && c.entity_id && c.entity_id !== 'new' && (
                    <Link href="/panel" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '6px 14px', borderRadius: 9,
                      background: '#1B3A69', color: 'white',
                      fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    }}>
                      Panele Git <IcArrow />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
