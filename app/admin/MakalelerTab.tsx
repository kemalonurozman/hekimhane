'use client';

import { useCallback, useEffect, useState } from 'react';
import { MAKALE_KATEGORILERI, ICERIK_IPUCU, parseGovde, okumaSuresi } from '@/lib/makale-icerik';
import MakaleGorselYukle from '@/components/MakaleGorselYukle';

/* Admin paneli koyu tema — app/admin/page.tsx ile aynı palet */
const C = {
  panel: '#0D1526', card: '#111B2E', border: 'rgba(255,255,255,.07)',
  text: 'rgba(255,255,255,.92)', muted: 'rgba(255,255,255,.42)',
  gold: '#D4A843', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6',
};

export interface AdminMakale {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  content: string | null;
  cover_image: string | null;
  author: string | null;
  author_email: string | null;
  entity_name: string | null;
  website: string | null;
  sponsorlu: boolean | null;
  kaynak: string | null;
  status: string | null;
  published: boolean;
  red_notu: string | null;
  okuma_dk: number | null;
  views: number | null;
  created_at: string;
}

type Filtre = 'pending' | 'published' | 'rejected' | 'all';

const FILTRE_LABEL: Record<Filtre, string> = {
  pending: 'Onay Bekleyen', published: 'Yayında', rejected: 'Reddedilen', all: 'Tümü',
};

const durumu = (m: AdminMakale) => m.status || (m.published ? 'published' : 'pending');

const BOS = { title: '', summary: '', category: MAKALE_KATEGORILERI[0], content: '', cover_image: '', author: 'Hekimhane Editör', website: '', sponsorlu: false, taslak: false };

export default function MakalelerTab({ onCount }: { onCount?: (n: number) => void }) {
  const [makaleler, setMakaleler] = useState<AdminMakale[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filtre,    setFiltre]    = useState<Filtre>('pending');
  const [acik,      setAcik]      = useState<string | null>(null);   // önizleme açık makale
  const [islemId,   setIslemId]   = useState<string | null>(null);
  const [uyari,     setUyari]     = useState('');
  const [toast,     setToast]     = useState('');
  const [mod,       setMod]       = useState<'liste' | 'yeni'>('liste');
  const [form,      setForm]      = useState({ ...BOS });
  const [kaydet,    setKaydet]    = useState(false);
  const [formErr,   setFormErr]   = useState('');

  const bildir = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const F = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const yukle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/makale', { cache: 'no-store' });
      const d = res.ok ? await res.json() : { makaleler: [] };
      const liste: AdminMakale[] = d.makaleler || [];
      setMakaleler(liste);
      setUyari(d.migrationGerekli ? 'Makale kolonları yok — "add_makale_gonderim.sql" migration\'ını Supabase SQL Editor\'da çalıştırın. O zamana kadar yalnızca yayınla/gizle çalışır.' : '');
      onCount?.(liste.filter(m => durumu(m) === 'pending').length);
    } catch { setMakaleler([]); }
    setLoading(false);
  }, [onCount]);

  useEffect(() => { yukle(); }, [yukle]);

  async function islem(id: string, action: 'approve' | 'reject' | 'hide' | 'publish' | 'delete') {
    let not = '';
    if (action === 'reject') {
      const g = window.prompt('Red gerekçesi (yazara e-posta ile iletilir):', '');
      if (g === null) return;
      not = g.trim();
    }
    if (action === 'delete' && !window.confirm('Bu makale kalıcı olarak silinsin mi?')) return;

    setIslemId(id);
    try {
      const res = await fetch('/api/admin/makale', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, not }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { bildir(d?.error || 'İşlem başarısız'); setIslemId(null); return; }

      if (action === 'delete') setMakaleler(p => p.filter(m => m.id !== id));
      else setMakaleler(p => p.map(m => m.id === id ? {
        ...m,
        status: action === 'reject' ? 'rejected' : action === 'hide' ? 'pending' : 'published',
        published: action === 'approve' || action === 'publish',
        red_notu: action === 'reject' ? not : m.red_notu,
      } : m));

      bildir(action === 'approve' || action === 'publish' ? 'Makale yayınlandı' : action === 'reject' ? 'Makale reddedildi' : action === 'hide' ? 'Makale yayından kaldırıldı' : 'Makale silindi');
      setTimeout(() => yukle(), 300);
    } catch { bildir('Bağlantı hatası'); }
    setIslemId(null);
  }

  async function yeniKaydet(e: React.FormEvent) {
    e.preventDefault();
    setKaydet(true); setFormErr('');
    try {
      const res = await fetch('/api/admin/makale', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.error || 'Kaydedilemedi');
      setMod('liste'); setForm({ ...BOS });
      setFiltre(form.taslak ? 'pending' : 'published');
      bildir(form.taslak ? 'Taslak kaydedildi' : 'Makale yayınlandı');
      yukle();
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally { setKaydet(false); }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9, border: `1px solid ${C.border}`,
    background: 'rgba(255,255,255,.03)', color: C.text, fontSize: 13.5, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', resize: 'vertical',
  };
  const lbl: React.CSSProperties = {
    fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 5, display: 'block',
  };
  const btn = (bg: string, fg: string, bd: string): React.CSSProperties => ({
    padding: '6px 13px', borderRadius: 8, border: `1px solid ${bd}`, background: bg, color: fg,
    fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  });

  const sayac = (f: Filtre) => f === 'all' ? makaleler.length : makaleler.filter(m => durumu(m) === f).length;
  const shown = makaleler.filter(m => filtre === 'all' || durumu(m) === filtre);
  const fmt = (s: string) => { try { return new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return s; } };

  /* ── YENİ MAKALE (admin doğrudan yayınlar) ── */
  if (mod === 'yeni') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setMod('liste')} style={btn('transparent', C.muted, C.border)}>← Geri</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.4px' }}>Yeni Makale</h2>
      </div>

      <form onSubmit={yeniKaydet} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 820 }}>
        <div>
          <label style={lbl}>Başlık *</label>
          <input style={inp} value={form.title} onChange={e => F('title', e.target.value)} maxLength={160} placeholder="Makale başlığı" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Kategori</label>
            <select style={inp} value={form.category} onChange={e => F('category', e.target.value)}>
              {MAKALE_KATEGORILERI.map(k => <option key={k} value={k} style={{ background: C.panel }}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Yazar</label>
            <input style={inp} value={form.author} onChange={e => F('author', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={lbl}>Kapak görseli</label>
          <MakaleGorselYukle dark value={form.cover_image} onChange={v => F('cover_image', v)} />
        </div>

        <div>
          <label style={lbl}>Özet *</label>
          <textarea style={inp} rows={2} value={form.summary} onChange={e => F('summary', e.target.value)} maxLength={400} />
        </div>

        <div>
          <label style={lbl}>Metin *</label>
          <textarea style={{ ...inp, minHeight: 300, lineHeight: 1.7 }} value={form.content}
            onChange={e => F('content', e.target.value)}
            placeholder={'Giriş paragrafı…\n\n## Ara başlık\n\n- Madde bir\n- Madde iki'} />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
            {ICERIK_IPUCU} — {form.content.trim().length} karakter · ~{okumaSuresi(form.content)} dk
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={lbl}>İş ortağı bağlantısı (isteğe bağlı)</label>
            <input style={inp} value={form.website} onChange={e => F('website', e.target.value)} placeholder="https://www.klinigim.com" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.text, cursor: 'pointer', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.sponsorlu} onChange={e => F('sponsorlu', e.target.checked)} />
            İş ortağı içeriği
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.text, cursor: 'pointer', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.taslak} onChange={e => F('taslak', e.target.checked)} />
            Taslak olarak kaydet
          </label>
        </div>

        {formErr && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: C.red, fontSize: 12.5, borderRadius: 9, padding: '10px 13px' }}>{formErr}</div>}

        <button type="submit" disabled={kaydet}
          style={{ alignSelf: 'flex-start', padding: '11px 24px', borderRadius: 10, border: 'none', background: C.gold, color: '#1A2744', fontSize: 13.5, fontWeight: 800, cursor: kaydet ? 'default' : 'pointer', fontFamily: 'inherit', opacity: kaydet ? .6 : 1 }}>
          {kaydet ? 'Kaydediliyor…' : form.taslak ? 'Taslağı kaydet' : 'Yayınla'}
        </button>
      </form>
    </div>
  );

  /* ── LİSTE ── */
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px', margin: 0 }}>Makaleler</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Panelden gelen yazıları onaylayın veya kendiniz makale yayınlayın.</p>
        </div>
        <button onClick={() => { setForm({ ...BOS }); setFormErr(''); setMod('yeni'); }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: C.gold, color: '#1A2744', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Yeni Makale
        </button>
      </div>

      {uyari && (
        <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', color: C.amber, fontSize: 12.5, borderRadius: 10, padding: '11px 14px', marginBottom: 14, lineHeight: 1.6 }}>{uyari}</div>
      )}

      {/* Filtreler */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['pending', 'published', 'rejected', 'all'] as Filtre[]).map(f => {
          const aktif = filtre === f;
          return (
            <button key={f} onClick={() => setFiltre(f)}
              style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${aktif ? 'rgba(212,168,67,.4)' : C.border}`, background: aktif ? 'rgba(212,168,67,.14)' : 'transparent', color: aktif ? C.gold : C.muted, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {FILTRE_LABEL[f]} ({sayac(f)})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Yükleniyor…</div>
      ) : shown.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center', color: C.muted }}>
          {filtre === 'pending' ? 'Onay bekleyen makale yok.' : 'Kayıt yok.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map(m => {
            const d = durumu(m);
            const renk = d === 'published' ? C.green : d === 'rejected' ? C.red : C.amber;
            const etiket = d === 'published' ? 'Yayında' : d === 'rejected' ? 'Reddedildi' : 'Onay bekliyor';
            const acikMi = acik === m.id;
            return (
              <div key={m.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: renk, background: `${renk}1A`, border: `1px solid ${renk}4D`, borderRadius: 8, padding: '2px 9px' }}>{etiket}</span>
                      {m.sponsorlu && <span style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 8, padding: '2px 9px' }}>İŞ ORTAĞI</span>}
                      <span style={{ fontSize: 11.5, color: C.muted }}>{m.category || '—'}</span>
                      <span style={{ fontSize: 11.5, color: C.muted }}>· {fmt(m.created_at)}</span>
                      {m.kaynak === 'panel' && <span style={{ fontSize: 11.5, color: C.blue }}>· panelden</span>}
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 4 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {m.entity_name || m.author || '—'}{m.author_email ? ` · ${m.author_email}` : ''} · /{m.slug}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                    <button onClick={() => setAcik(acikMi ? null : m.id)} style={btn('transparent', C.muted, C.border)}>
                      {acikMi ? 'Kapat' : 'Önizle'}
                    </button>
                    {d !== 'published' && (
                      <button onClick={() => islem(m.id, 'approve')} disabled={islemId === m.id}
                        style={btn('rgba(16,185,129,.1)', C.green, 'rgba(16,185,129,.3)')}>
                        {islemId === m.id ? '…' : 'Onayla ve yayınla'}
                      </button>
                    )}
                    {d === 'pending' && (
                      <button onClick={() => islem(m.id, 'reject')} disabled={islemId === m.id}
                        style={btn('rgba(239,68,68,.08)', C.red, 'rgba(239,68,68,.3)')}>Reddet</button>
                    )}
                    {d === 'published' && (
                      <>
                        <a href={`/blog/${m.slug}`} target="_blank" rel="noreferrer" style={{ ...btn('transparent', C.muted, C.border), textDecoration: 'none' }}>Aç</a>
                        <button onClick={() => islem(m.id, 'hide')} disabled={islemId === m.id}
                          style={btn('rgba(245,158,11,.08)', C.amber, 'rgba(245,158,11,.3)')}>Yayından kaldır</button>
                      </>
                    )}
                    <button onClick={() => islem(m.id, 'delete')} disabled={islemId === m.id}
                      style={btn('transparent', C.muted, C.border)}>Sil</button>
                  </div>
                </div>

                {m.red_notu && d === 'rejected' && (
                  <div style={{ marginTop: 10, fontSize: 12, color: C.red, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 9, padding: '9px 12px' }}>
                    Red gerekçesi: {m.red_notu}
                  </div>
                )}

                {acikMi && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontWeight: 600, marginBottom: 12 }}>{m.summary}</div>
                    {m.website && (
                      <div style={{ fontSize: 12, color: C.blue, marginBottom: 12 }}>Bağlantı: {m.website}</div>
                    )}
                    <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 6 }}>
                      {parseGovde(m.content || '').map((b, i) => {
                        if (b.tip === 'h') return <div key={i} style={{ fontSize: 14.5, fontWeight: 800, color: C.text, margin: '16px 0 7px' }}>{b.metin}</div>;
                        if (b.tip === 'liste') return (
                          <ul key={i} style={{ margin: '0 0 12px', paddingLeft: 18 }}>
                            {b.ogeler.map((o, j) => <li key={j} style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{o}</li>)}
                          </ul>
                        );
                        return <p key={i} style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: '0 0 11px' }}>{b.metin}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? '0' : '12px'})`, background: '#1A2744', color: 'white', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 600, opacity: toast ? 1 : 0, transition: 'all .3s', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    </div>
  );
}
