import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { KATEGORILER, HASTALIKLAR } from '@/lib/hastaliklar-data';
import { BLOG_YAZILARI } from '@/lib/blog-data';
import { TREATMENTS } from '@/lib/uzmanlik-data';

export const revalidate = 43200; // 12 saat

export const metadata: Metadata = {
  title: 'Site Haritası',
  description:
    'Hekimhane site haritası — diş klinikleri, diş hekimleri, hastaneler, eczaneler, diş tedavileri, hastalık rehberi ve tüm sayfalara ağaç yapısında erişim.',
  alternates: { canonical: 'https://hekimhane.com.tr/site-haritasi' },
};

interface Branch { title: string; href?: string; links: { label: string; href: string }[]; }

async function getIller(): Promise<{ il: string; n: number }[]> {
  try {
    const PAGE = 1000; const rows: { il: string | null }[] = [];
    for (let f = 0; f < 40000; f += PAGE) {
      const { data, error } = await supabase.from('klinikler').select('il').range(f, f + PAGE - 1);
      if (error || !data || !data.length) break;
      rows.push(...data as { il: string | null }[]);
      if (data.length < PAGE) break;
    }
    const cnt: Record<string, number> = {};
    rows.forEach(r => { if (r.il) cnt[r.il] = (cnt[r.il] || 0) + 1; });
    return Object.entries(cnt).map(([il, n]) => ({ il, n })).sort((a, b) => b.n - a.n || a.il.localeCompare(b.il, 'tr'));
  } catch {
    return [];
  }
}

export default async function SiteHaritasi() {
  const iller = await getIller();
  const disHastaliklar = HASTALIKLAR.filter(h => h.kategoriSlug === 'dis-sagligi');
  const disKategori = KATEGORILER.find(k => k.slug === 'dis-sagligi');

  const branches: Branch[] = [
    {
      title: 'Ana Bölümler',
      links: [
        { label: 'Diş Klinikleri', href: '/klinikler' },
        { label: 'Diş Hekimleri', href: '/dis-hekimleri' },
        { label: 'Hastaneler', href: '/hastaneler' },
        { label: 'Eczaneler', href: '/eczaneler' },
        { label: 'Nöbetçi / Yakın Eczane', href: '/yakin-eczane' },
        { label: 'Ağız & Diş Sağlığı Rehberi', href: '/hastaliklar' },
        { label: 'Blog', href: '/blog' },
        { label: 'Karşılaştır', href: '/karsilastir' },
        { label: 'HekimKart — Dijital Kartvizit', href: '/hekimkart' },
        { label: '360° Fotoğraf', href: '/360-fotograf' },
        { label: 'Kliniğinizi Ekleyin', href: '/katil' },
      ],
    },
    {
      title: 'Şehre Göre Diş Klinikleri',
      href: '/klinikler',
      links: iller.map(({ il, n }) => ({ label: `${il} Diş Klinikleri (${n})`, href: `/klinikler?il=${encodeURIComponent(il)}` })),
    },
    {
      title: 'Diş Tedavileri',
      links: TREATMENTS.map(t => ({ label: t.name, href: `/klinikler?uzmanlik=${encodeURIComponent(t.spec)}` })),
    },
    {
      title: disKategori ? `${disKategori.ad} — Hastalık Rehberi` : 'Ağız & Diş Sağlığı',
      href: '/hastaliklar/dis-sagligi',
      links: disHastaliklar.map(h => ({ label: h.ad, href: `/hastaliklar/dis-sagligi/${h.slug}` })),
    },
    {
      title: 'Blog Yazıları',
      href: '/blog',
      links: BLOG_YAZILARI.map(b => ({ label: b.title, href: `/blog/${b.slug}` })),
    },
    {
      title: 'Kurumsal',
      links: [
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim', href: '/iletisim' },
        { label: 'Kliniğinizi Ekleyin', href: '/katil' },
      ],
    },
    {
      title: 'Yasal',
      links: [
        { label: 'Gizlilik Politikası', href: '/gizlilik' },
        { label: 'Kullanım Şartları', href: '/kullanim' },
        { label: 'KVKK Aydınlatma Metni', href: '/kvkk' },
        { label: 'Çerez Politikası', href: '/cerez' },
      ],
    },
    {
      title: 'Teknik',
      links: [
        { label: 'Sitemap (XML)', href: '/sitemap.xml' },
        { label: 'RSS Akışı', href: '/rss.xml' },
      ],
    },
  ];

  return (
    <div style={{ paddingTop: 64, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', background: '#FBF8F2', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .sh-wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
        .sh-hero { background: linear-gradient(160deg,#0E2D55,#1B3A69); padding: 56px 0 40px; }
        .sh-tree { margin: 40px 0 72px; position: relative; }
        /* Kök düğüm */
        .sh-root { display:inline-flex; align-items:center; gap:10px; background:#1B3A69; color:#fff; font-weight:800; font-size:15px; letter-spacing:-.3px; padding:11px 20px; border-radius:14px; box-shadow:0 6px 20px rgba(27,58,105,.25); }
        .sh-branches { margin-top: 10px; margin-left: 26px; padding-left: 26px; border-left: 2px solid #E2DED2; }
        .sh-branch { position: relative; padding: 22px 0 4px; }
        .sh-branch::before { content:''; position:absolute; left:-26px; top:40px; width:22px; height:2px; background:#E2DED2; }
        .sh-btitle { display:inline-flex; align-items:center; gap:8px; font-size:16px; font-weight:800; color:#1B3A69; letter-spacing:-.3px; }
        .sh-btitle a { color:#1B3A69; text-decoration:none; }
        .sh-btitle .dot { width:9px; height:9px; border-radius:3px; background:#D4A843; flex-shrink:0; }
        .sh-links { margin-top: 12px; display:grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 4px 22px; }
        .sh-link { font-size:13.5px; color:#41526b; text-decoration:none; padding:5px 0 5px 16px; position:relative; border-radius:6px; line-height:1.4; }
        .sh-link::before { content:''; position:absolute; left:2px; top:13px; width:7px; height:1px; background:#C9CFDA; }
        .sh-link:hover { color:#1B3A69; text-decoration:underline; }
      ` }} />

      <section className="sh-hero">
        <div className="sh-wrap">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#D4A843', marginBottom: 12 }}>
            Tüm Sayfalar Tek Ağaçta
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.2px', margin: '0 0 10px' }}>
            Site Haritası
          </h1>
          <p style={{ color: 'rgba(255,255,255,.62)', fontSize: 15, maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            Hekimhane&apos;deki tüm bölümlere ve sayfalara buradan ağaç yapısında ulaşabilirsiniz — {iller.length} il,
            {' '}{TREATMENTS.length} diş tedavisi, {disHastaliklar.length} hastalık rehberi ve daha fazlası.
          </p>
        </div>
      </section>

      <div className="sh-wrap">
        <div className="sh-tree">
          <span className="sh-root">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V7l6-4v18M9 11H3v10M15 11h6v10M9 7h6M12 11v4" /></svg>
            hekimhane.com.tr
          </span>
          <div className="sh-branches">
            {branches.map(b => (
              <div key={b.title} className="sh-branch">
                <div className="sh-btitle">
                  <span className="dot" />
                  {b.href ? <Link href={b.href}>{b.title}</Link> : <span>{b.title}</span>}
                </div>
                <div className="sh-links">
                  {b.links.map(l => (
                    l.href.endsWith('.xml')
                      ? <a key={l.href} href={l.href} className="sh-link">{l.label}</a>
                      : <Link key={l.href} href={l.href} className="sh-link">{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
