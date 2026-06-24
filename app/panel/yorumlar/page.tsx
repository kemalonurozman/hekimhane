import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServer, getProfile } from '@/lib/supabase-server';
import YorumYanitla from './YorumYanitla';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Yorum Inbox | Hekimhane Panel',
};

async function getReviews(userId: string) {
  const supabase = createSupabaseServer();

  // Onaylı claim'ler üzerinden entity ID'leri bul
  const { data: claims } = await (supabase as any)
    .from('claim_requests')
    .select('entity_id, entity_type, entity_name')
    .eq('user_id', userId)
    .eq('status', 'approved');

  const approved = (claims || []) as { entity_id: string; entity_type: string; entity_name: string }[];
  const entityIds = approved.filter(c => c.entity_id && c.entity_id !== 'new').map(c => c.entity_id);

  // entity_id → isim haritası
  const entityMap: Record<string, string> = {};
  approved.forEach(c => { entityMap[c.entity_id] = c.entity_name; });

  if (entityIds.length === 0) return { reviews: [], entityMap };

  const { data } = await (supabase as any)
    .from('yorumlar')
    .select('*')
    .in('entity_id', entityIds)
    .order('created_at', { ascending: false });

  return { reviews: (data || []) as any[], entityMap };
}

export default async function YorumlarPage() {
  const profile = await getProfile();
  if (!profile) redirect('/giris?redirect=/panel/yorumlar');

  const { reviews, entityMap } = await getReviews((profile as any).id);

  const unanswered = reviews.filter((r: any) => !r.reply_text);
  const answered   = reviews.filter((r: any) =>  r.reply_text);

  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < n ? '#D4A843' : 'none'} stroke={i < n ? '#D4A843' : '#D1D5DB'} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ));

  return (
    <div style={{ paddingTop: '66px', minHeight: '100vh', background: '#F8FAFF' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--muted)', alignItems: 'center' }}>
          <Link href="/panel" style={{ color: 'var(--navy)', fontWeight: 500 }}>Panel</Link>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>Yorum Inbox</span>
        </div>
      </div>

      {/* Başlık */}
      <div style={{ background: 'linear-gradient(135deg, #1B3A69 0%, #163D6E 100%)', padding: '28px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
            Yorum Inbox
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
            {unanswered.length} yanıtlanmamış · {answered.length} yanıtlandı
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px', maxWidth: '860px' }}>

        {reviews.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', padding: '64px 32px', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Henüz yorum yok</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>İşletmelerinize yorum yapıldığında burada görünecek.</p>
          </div>
        ) : (
          <>
            {/* Yanıt bekleyenler */}
            {unanswered.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#D4A843', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '12px' }}>{unanswered.length}</span>
                  Yanıt Bekliyor
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unanswered.map((r: any) => (
                    <div key={r.id} id={r.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      {/* Yorum başlığı */}
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{r.author}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                            {entityMap[r.entity_id] || r.entity_id} · {r.date ? new Date(r.date).toLocaleDateString('tr') : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>{stars(r.rating)}</div>
                      </div>

                      {/* Yorum metni */}
                      {r.text && (
                        <div style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', borderBottom: '1px solid var(--border)' }}>
                          &ldquo;{r.text}&rdquo;
                        </div>
                      )}

                      {/* Yanıt formu */}
                      <YorumYanitla reviewId={r.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yanıtlananlar */}
            {answered.length > 0 && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Yanıtlananlar ({answered.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {answered.map((r: any) => (
                    <div key={r.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 20px', opacity: 0.8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{r.author}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>{stars(r.rating)}</div>
                      </div>
                      {r.text && <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px' }}>&ldquo;{r.text}&rdquo;</p>}
                      <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '10px 14px', borderLeft: '3px solid #86EFAC' }}>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Yanıtınız</div>
                        <p style={{ fontSize: '13px', color: '#15803D', margin: 0, lineHeight: 1.6 }}>{r.reply_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
