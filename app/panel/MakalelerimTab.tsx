'use client';

import { useEffect, useRef, useState } from 'react';
import { MAKALE_KATEGORILERI, ICERIK_IPUCU, okumaSuresi, parseGovde } from '@/lib/makale-icerik';
import MakaleGorselYukle from '@/components/MakaleGorselYukle';
import MakaleGovde from '@/components/MakaleGovde';

const T = {
  navy: '#1B3A69', gold: '#D4A843', white: '#FFFFFF', border: '#E2E8F4',
  muted: '#6B7A99', text: '#1A2744', green: '#059669', amber: '#F59E0B', red: '#EF4444',
};

export interface PanelMakale {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string | null;
  cover_image: string | null;
  content: string;
  status: string | null;
  published: boolean;
  red_notu: string | null;
  entity_name: string | null;
  website: string | null;
  views: number | null;
  created_at: string;
}

const DURUM: Record<string, { label: string; bg: string; fg: string; bd: string }> = {
  pending:   { label: 'İnceleniyor', bg: '#FFFBEB', fg: '#92400E', bd: '#FDE68A' },
  published: { label: 'Yayında',     bg: '#ECFDF5', fg: '#065F46', bd: '#A7F3D0' },
  rejected:  { label: 'Reddedildi',  bg: '#FEF2F2', fg: '#991B1B', bd: '#FECACA' },
};

const BOS = { title: '', summary: '', category: MAKALE_KATEGORILERI[0], content: '', cover_image: '', website: '' };

export default function MakalelerimTab({ hasEntity }: { hasEntity: boolean }) {
  const [makaleler, setMakaleler] = useState<PanelMakale[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [mod,       setMod]       = useState<'liste' | 'form'>('liste');
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...BOS });
  const [sending,   setSending]   = useState(false);
  const [err,       setErr]       = useState('');
  const [toast,     setToast]     = useState('');
  const [silId,     setSilId]     = useState<string | null>(null);
  const [onizle,    setOnizle]    = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const F = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  /* Seçili metni sarmalar (kalın/link) ya da satır başına önek ekler (başlık/madde/alıntı). */
  function bicimle(tur: 'baslik' | 'madde' | 'kalin' | 'link' | 'gorsel' | 'alinti') {
    const ta = contentRef.current;
    if (!ta) return;
    const val = form.content;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const secili = val.slice(s, e);
    let yeni = val, imlecBas = s, imlecSon = e;

    if (tur === 'kalin') {
      const metin = secili || 'kalın metin';
      yeni = val.slice(0, s) + `**${metin}**` + val.slice(e);
      imlecBas = s + 2; imlecSon = s + 2 + metin.length;
    } else if (tur === 'link') {
      const metin = secili || 'bağlantı metni';
      yeni = val.slice(0, s) + `[${metin}](https://)` + val.slice(e);
      imlecBas = s + 1 + metin.length + 2; imlecSon = imlecBas + 8;   // https:// seçili
    } else if (tur === 'gorsel') {
      const ek = `![görsel açıklaması](https://)`;
      yeni = val.slice(0, s) + ek + val.slice(e);
      imlecBas = s + ek.length - 1; imlecSon = imlecBas;
    } else {
      // satır başına önek: başlık / madde / alıntı
      const onek = tur === 'baslik' ? '## ' : tur === 'madde' ? '- ' : '> ';
      const satirBas = val.lastIndexOf('\n', s - 1) + 1;
      yeni = val.slice(0, satirBas) + onek + val.slice(satirBas);
      imlecBas = imlecSon = e + onek.length;
    }

    F('content', yeni);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(imlecBas, imlecSon); });
  }
  const bildir = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3200); };

  async function yukle() {
    setLoading(true);
    try {
      const res = await fetch('/api/panel/makale');
      const d = res.ok ? await res.json() : { makaleler: [] };
      setMakaleler(d.makaleler || []);
      if (d.migrationGerekli) setErr('Makale tablosu henüz hazır değil — yönetici "add_makale_gonderim.sql" migration\'ını çalıştırmalı.');
    } catch { setMakaleler([]); }
    setLoading(false);
  }

  useEffect(() => { yukle(); }, []);

  function yeniAc() { setEditId(null); setForm({ ...BOS }); setErr(''); setOnizle(false); setMod('form'); }
  function duzenleAc(m: PanelMakale) {
    setEditId(m.id); setOnizle(false);
    setForm({
      title: m.title || '', summary: m.summary || '',
      category: m.category || MAKALE_KATEGORILERI[0],
      content: m.content || '', cover_image: m.cover_image || '', website: m.website || '',
    });
    setErr(''); setMod('form');
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setErr('');
    try {
      const res = await fetch('/api/panel/makale', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.error || 'Gönderilemedi');
      setMod('liste'); setEditId(null); setForm({ ...BOS });
      bildir('Makaleniz editör onayına gönderildi.');
      yukle();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally { setSending(false); }
  }

  async function sil(id: string) {
    setSilId(id);
    try {
      const res = await fetch(`/api/panel/makale?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) { setMakaleler(p => p.filter(m => m.id !== id)); bildir('Makale silindi.'); }
    } catch { /* yoksay */ }
    setSilId(null);
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`,
    fontSize: 14, fontFamily: 'inherit', background: T.white, color: T.text, outline: 'none',
    boxSizing: 'border-box', resize: 'vertical',
  };
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 5, display: 'block',
  };
  const card: React.CSSProperties = {
    background: T.white, borderRadius: 16, border: `1px solid ${T.border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,.04)',
  };

  const fmt = (s: string) => { try { return new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return s; } };

  /* ── Sahiplik yoksa ── */
  if (!hasEntity) return (
    <div>
      <Baslik />
      <div style={{ ...card, padding: '40px 24px', textAlign: 'center', color: T.muted, fontSize: 14, lineHeight: 1.7 }}>
        Makale gönderebilmek için önce bir işletmenizin sahipliğini onaylatmanız gerekir.<br />
        Sahiplik onaylandıktan sonra bu sekmeden yazı gönderebilirsiniz.
      </div>
    </div>
  );

  /* ── FORM ── */
  if (mod === 'form') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => { setMod('liste'); setErr(''); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.white, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Geri
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>
          {editId ? 'Makaleyi Düzenle' : 'Yeni Makale'}
        </h1>
      </div>

      <form onSubmit={gonder} style={{ ...card, padding: 26, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 780 }}>
        <div>
          <label style={lbl}>Başlık *</label>
          <input style={inp} value={form.title} onChange={e => F('title', e.target.value)}
            placeholder="Örn. İmplant Tedavisinde İyileşme Süreci Nasıl İlerler?" maxLength={160} />
        </div>

        <div>
          <label style={lbl}>Kategori</label>
          <select style={{ ...inp, maxWidth: 320 }} value={form.category} onChange={e => F('category', e.target.value)}>
            {MAKALE_KATEGORILERI.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Kapak görseli</label>
          <MakaleGorselYukle value={form.cover_image} onChange={v => F('cover_image', v)} />
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5 }}>
            Makalenin başında ve blog listesinde görünür. Yalnızca kullanım hakkına sahip
            olduğunuz görselleri yükleyin; hasta fotoğrafı için yazılı izin gerekir.
          </div>
        </div>

        <div>
          <label style={lbl}>Özet *</label>
          <textarea style={inp} rows={2} value={form.summary} onChange={e => F('summary', e.target.value)}
            placeholder="Yazının 1-2 cümlelik özeti. Liste sayfasında ve arama sonuçlarında görünür." maxLength={400} />
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>{form.summary.length}/400</div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Makale metni *</label>
            <div style={{ display: 'inline-flex', background: '#EEF2FB', borderRadius: 9, padding: 3, gap: 2 }}>
              <button type="button" onClick={() => setOnizle(false)}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, background: onizle ? 'transparent' : T.white, color: onizle ? T.muted : T.navy, boxShadow: onizle ? 'none' : '0 1px 2px rgba(0,0,0,.08)' }}>Yaz</button>
              <button type="button" onClick={() => setOnizle(true)}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, background: onizle ? T.white : 'transparent', color: onizle ? T.navy : T.muted, boxShadow: onizle ? '0 1px 2px rgba(0,0,0,.08)' : 'none' }}>Önizleme</button>
            </div>
          </div>

          {!onizle && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
              {([
                ['baslik', 'Başlık', 'H'],
                ['madde', 'Madde', '•'],
                ['kalin', 'Kalın', 'B'],
                ['link', 'Bağlantı', '🔗'],
                ['gorsel', 'Görsel', '🖼'],
                ['alinti', 'Alıntı', '"'],
              ] as const).map(([t, etiket, sim]) => (
                <button key={t} type="button" onClick={() => bicimle(t)}
                  title={etiket}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600 }}>
                  <span style={{ fontWeight: 800, color: T.navy }}>{sim}</span>{etiket}
                </button>
              ))}
            </div>
          )}

          {onizle ? (
            <div style={{ minHeight: 320, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 22px', background: T.white }}>
              {form.content.trim()
                ? <MakaleGovde bloklar={parseGovde(form.content)} />
                : <div style={{ color: T.muted, fontSize: 14 }}>Önizlenecek içerik yok. “Yaz” sekmesinden metin girin.</div>}
            </div>
          ) : (
            <textarea ref={contentRef} style={{ ...inp, minHeight: 320, lineHeight: 1.7 }} value={form.content}
              onChange={e => F('content', e.target.value)}
              placeholder={'Giriş paragrafı…\n\n## Ara başlık\n\nParagraf metni…\n\n- Madde bir\n- Madde iki'} />
          )}
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6, lineHeight: 1.6 }}>
            {ICERIK_IPUCU} — {form.content.trim().length} karakter · ~{okumaSuresi(form.content)} dk okuma
          </div>
        </div>

        <div>
          <label style={lbl}>Web siteniz (isteğe bağlı)</label>
          <input style={inp} value={form.website} onChange={e => F('website', e.target.value)}
            placeholder="https://www.klinigim.com" />
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>
            Onaylanırsa yazının altında kliniğinizin bağlantısı gösterilir.
          </div>
        </div>

        <div style={{ background: '#F8FAFF', border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 12.5, color: T.muted, lineHeight: 1.65 }}>
          Gönderdiğiniz yazı doğrudan yayına girmez — Hekimhane editör ekibi inceler.
          Sonuç e-posta ile bildirilir ve bu sayfada görünür. Tanıtım ağırlıklı, kaynaksız
          veya yanıltıcı sağlık iddiası içeren yazılar yayınlanmaz.
        </div>

        {err && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 13.5, borderRadius: 10, padding: '11px 14px' }}>{err}</div>
        )}

        <button type="submit" disabled={sending}
          style={{ alignSelf: 'flex-start', padding: '13px 28px', borderRadius: 12, border: 'none', background: T.navy, color: 'white', fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: sending ? 'default' : 'pointer', opacity: sending ? .6 : 1 }}>
          {sending ? 'Gönderiliyor…' : editId ? 'Güncelle ve tekrar gönder' : 'Onaya gönder'}
        </button>
      </form>
    </div>
  );

  /* ── LİSTE ── */
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <Baslik />
        <button onClick={yeniAc}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 11, border: 'none', background: T.navy, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Yeni Makale
        </button>
      </div>

      {err && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: 13, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>{err}</div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Yükleniyor…</div>
      ) : makaleler.length === 0 ? (
        <div style={{ ...card, padding: '44px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>Henüz makaleniz yok</div>
          <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 18px' }}>
            Uzmanlık alanınızla ilgili bir yazı gönderin. Editör onayından sonra Hekimhane
            blogunda kliniğinizin adıyla yayınlanır.
          </div>
          <button onClick={yeniAc}
            style={{ padding: '11px 24px', borderRadius: 11, border: 'none', background: T.navy, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            İlk makaleni yaz
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {makaleler.map(m => {
            const d = DURUM[m.status || (m.published ? 'published' : 'pending')] || DURUM.pending;
            return (
              <div key={m.id} style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: d.fg, background: d.bg, border: `1px solid ${d.bd}`, borderRadius: 20, padding: '3px 10px' }}>{d.label}</span>
                      {m.category && <span style={{ fontSize: 11.5, color: T.muted }}>{m.category}</span>}
                      <span style={{ fontSize: 11.5, color: T.muted }}>· {fmt(m.created_at)}</span>
                      {m.status === 'published' && <span style={{ fontSize: 11.5, color: T.muted }}>· {m.views || 0} görüntülenme</span>}
                    </div>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: T.text, lineHeight: 1.35, marginBottom: 5 }}>{m.title}</div>
                    <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{(m.summary || '').slice(0, 160)}{(m.summary || '').length > 160 ? '…' : ''}</div>

                    {m.status === 'rejected' && m.red_notu && (
                      <div style={{ marginTop: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: '#991B1B', lineHeight: 1.6 }}>
                        <strong>Editör notu:</strong> {m.red_notu}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap' }}>
                    {m.status === 'published' ? (
                      <a href={`/blog/${m.slug}`} target="_blank" rel="noreferrer"
                        style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.white, color: T.navy, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                        Görüntüle
                      </a>
                    ) : (
                      <>
                        <button onClick={() => duzenleAc(m)}
                          style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.white, color: T.navy, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Düzenle
                        </button>
                        <button onClick={() => sil(m.id)} disabled={silId === m.id}
                          style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #FECACA', background: '#FEF2F2', color: T.red, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {silId === m.id ? '…' : 'Sil'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? '0' : '12px'})`, background: T.navy, color: 'white', padding: '11px 22px', borderRadius: 50, fontSize: 13, fontWeight: 600, opacity: toast ? 1 : 0, transition: 'all .3s', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    </div>
  );
}

function Baslik() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Makalelerim</h1>
      <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
        Hekimhane blogunda yayınlanmak üzere yazı gönderin — editör onayından sonra yayına girer.
      </p>
    </div>
  );
}
