'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HastalıkOzet } from './page';

const KATEGORILER = [
  'Tümü', 'Hasta Rehberi', 'Sağlıklı Yaşam', 'Hastalıklar', 'Beslenme', 'Çocuk Sağlığı', 'Kadın Sağlığı', 'Ruh Sağlığı',
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  'Hasta Rehberi':   { bg: '#EEF2FF', color: '#3730A3' },
  'Sağlıklı Yaşam': { bg: '#ECFDF5', color: '#065F46' },
  'Hastalıklar':    { bg: '#FEF2F2', color: '#991B1B' },
  'Beslenme':       { bg: '#FEF3C7', color: '#92400E' },
  'Çocuk Sağlığı':  { bg: '#EFF6FF', color: '#1D4ED8' },
  'Kadın Sağlığı':  { bg: '#FDF4FF', color: '#7E22CE' },
  'Ruh Sağlığı':    { bg: '#F0FDF4', color: '#166534' },
};

function catStyle(cat: string | null) {
  return categoryColors[cat || ''] || { bg: '#F3F4F6', color: '#374151' };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  author: string | null;
  cover_image: string | null;
  views: number | null;
  created_at: string;
}

function BlogCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={post.slug !== '#' ? `/blog/${post.slug}` : '#'} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white', borderRadius: 20, border: '1px solid var(--border)',
          overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
          transition: 'box-shadow .2s, transform .2s',
          boxShadow: hovered ? '0 8px 32px rgba(27,58,105,.1)' : 'none',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}>
        {/* Görsel alanı */}
        <div style={{ height: 140, background: 'linear-gradient(135deg, #F0F4FF, #E8EDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
          {post.cover_image
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '📄'}
        </div>
        <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {post.category && (
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: catStyle(post.category).bg, color: catStyle(post.category).color, marginBottom: 10, alignSelf: 'flex-start' }}>
              {post.category}
            </span>
          )}
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 8, lineHeight: 1.4, flex: 1 }}>{post.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.summary}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto' }}>
            <span>{formatDate(post.created_at)}</span>
            <span>{(post.views || 0).toLocaleString('tr')} görüntülenme</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Ciddiyet renkleri ───────────────────────────────────────────
const CIDDİYET_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  düşük:  { bg: '#ECFDF5', color: '#065F46', label: 'Düşük Risk' },
  orta:   { bg: '#FEF3C7', color: '#92400E', label: 'Orta Risk'  },
  yüksek: { bg: '#FEF2F2', color: '#991B1B', label: 'Yüksek Risk' },
};

// Hastalık kategorisi için basit ikon (SVG path data)
const KAT_IKON: Record<string, string> = {
  kardiyoloji:    'M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z',
  nöroloji:      'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-3.328-6.657a2.5 2.5 0 0 1 1.34-3.328L9 7.5V4.5A2.5 2.5 0 0 1 9.5 2zm5 0A2.5 2.5 0 0 1 17 4.5v3l3.948 2.071a2.5 2.5 0 0 1 1.34 3.328L18.96 19.56A2.5 2.5 0 0 1 14 19.5v-15A2.5 2.5 0 0 1 14.5 2z',
  ortopedi:      'M6 2v6l2 2-2 2v6h2v-5l2-2-2-2V2H6zm8 0v6l-2 2 2 2v6h2v-6l-2-2 2-2V2h-2z',
  gastroloji:    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  endokrinoloji: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  dermatoloji:   'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  solunum:       'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
  romatoloji:    'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
  üroloji:       'M7 2v11h3v9l7-12h-4l4-8z',
  hematoloji:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-13h2v6h-2zm0 8h2v2h-2z',
  onkoloji:      'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  infeksiyon:    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
};

function HastalıkCard({ h }: { h: HastalıkOzet }) {
  const [hovered, setHovered] = useState(false);
  const cStyle = CIDDİYET_STYLE[h.ciddiyeti] || CIDDİYET_STYLE.orta;
  const ikonPath = KAT_IKON[h.kategoriSlug] || KAT_IKON.kardiyoloji;

  return (
    <Link href={`/hastaliklar/${h.kategoriSlug}/${h.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white', borderRadius: 20, border: '1px solid var(--border)',
          overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
          transition: 'box-shadow .2s, transform .2s',
          boxShadow: hovered ? '0 8px 32px rgba(27,58,105,.1)' : 'none',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}>
        {/* Üst renkli alan — tıbbi ikon */}
        <div style={{
          height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
          position: 'relative',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity={0.6}>
            <path d={ikonPath}/>
          </svg>
          {/* Ciddiyet rozeti — sağ üst */}
          <span style={{
            position: 'absolute', top: 10, right: 10,
            padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
            background: cStyle.bg, color: cStyle.color,
          }}>
            {cStyle.label}
          </span>
        </div>

        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Kategori etiketi */}
          <span style={{
            display: 'inline-block', padding: '2px 9px', borderRadius: 20,
            fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#991B1B',
            marginBottom: 8, alignSelf: 'flex-start',
          }}>
            {h.kategoriAd}
          </span>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 7, lineHeight: 1.4, flex: 1 }}>
            {h.ad}
          </h3>
          <p style={{
            fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {h.ozet}
          </p>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)',
            borderTop: '1px solid var(--border)', paddingTop: 11, marginTop: 'auto',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {h.uzmanlik}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {h.gorulmeOrani}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy2))', borderRadius: 24, padding: '40px', textAlign: 'center', marginTop: 48 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
      <h3 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
        Sağlık bültenimize abone olun
      </h3>
      <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginBottom: 20 }}>
        Her hafta seçilmiş sağlık yazıları e-posta kutunuza gelsin.
      </p>
      {done ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 24px', color: 'white', fontWeight: 700, fontSize: 14 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Abone oldunuz, teşekkürler!
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
          <button
            onClick={() => { if (email.includes('@')) setDone(true); }}
            style={{ padding: '12px 22px', background: 'var(--gold)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Abone Ol
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogInteractive({ posts, hastaliklar }: { posts: Post[]; hastaliklar: HastalıkOzet[] }) {
  const [aktifKat, setAktifKat] = useState('Tümü');

  const showHastaliklar = aktifKat === 'Hastalıklar';

  const filtrelenmis = aktifKat === 'Tümü'
    ? posts
    : posts.filter(p => p.category === aktifKat);

  const featured = posts[0];
  const grid     = filtrelenmis.slice(aktifKat === 'Tümü' ? 1 : 0);

  return (
    <>
      {/* Kategoriler */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        {KATEGORILER.map(k => (
          <button key={k} onClick={() => setAktifKat(k)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: '1.5px solid', cursor: 'pointer',
              background: k === aktifKat ? 'var(--navy)' : 'white',
              color:      k === aktifKat ? 'white' : 'var(--navy)',
              borderColor: k === aktifKat ? 'var(--navy)' : 'var(--border)',
              transition: 'all .15s',
            }}>
            {k}
          </button>
        ))}
      </div>

      {/* Featured post — sadece "Tümü" seçiliyken göster */}
      {aktifKat === 'Tümü' && featured && (
        <Link href={featured.slug !== '#' ? `/blog/${featured.slug}` : '#'} style={{ textDecoration: 'none', display: 'block', marginBottom: 36 }}>
          <div className="hastalik-content-grid" style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', minHeight: 260 }}>
            <div style={{ padding: 'clamp(20px, 5vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {featured.category && (
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: catStyle(featured.category).bg, color: catStyle(featured.category).color }}>
                      {featured.category}
                    </span>
                  )}
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(212,168,67,.15)', color: 'var(--gold)' }}>
                    ⭐ Öne Çıkan
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 26, fontWeight: 800, color: 'var(--navy)', marginBottom: 12, lineHeight: 1.3 }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{featured.summary}</p>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
                {featured.author && <span>{featured.author}</span>}
                <span>{formatDate(featured.created_at)}</span>
                <span>{(featured.views || 0).toLocaleString('tr')} görüntülenme</span>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
              {featured.cover_image
                /* eslint-disable-next-line @next/next/no-img-element */
                ? <img src={featured.cover_image} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🏥'}
            </div>
          </div>
        </Link>
      )}

      {/* Hastalıklar sekmesi — statik veri */}
      {showHastaliklar ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              <strong style={{ color: 'var(--navy)' }}>{hastaliklar.length}</strong> hastalık rehberi
            </p>
            <Link href="/hastaliklar" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: 'var(--navy)', color: 'white', textDecoration: 'none',
            }}>
              Tüm Hastalıklar
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="blog-grid-3">
            {hastaliklar.map(h => <HastalıkCard key={h.slug} h={h} />)}
          </div>
        </>
      ) : grid.length > 0 ? (
        /* Blog yazıları grid */
        <div className="blog-grid-3">
          {grid.map(post => <BlogCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Bu kategoride henüz yazı bulunmuyor.</p>
        </div>
      )}

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}
