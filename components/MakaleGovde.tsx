import type { BlogBlok } from '@/lib/blog-data';

// Satır içi biçimlendirme: **kalın** ve [metin](https://link)
export function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0; let m: RegExpExecArray | null; let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2]) nodes.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[4]) nodes.push(<a key={key++} href={m[5]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'underline' }}>{m[4]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Blog gövdesini (parseGovde çıktısı) render eder — blog sayfası ve editör önizlemesi ortak. */
export default function MakaleGovde({ bloklar }: { bloklar: BlogBlok[] }) {
  return (
    <>
      {bloklar.map((b, i) => {
        if (b.tip === 'h') return <h2 key={i} style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: '30px 0 12px' }}>{renderInline(b.metin)}</h2>;
        if (b.tip === 'liste') return (
          <ul key={i} style={{ margin: '4px 0 18px', paddingLeft: 4, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {b.ogeler.map((o, j) => (
              <li key={j} style={{ display: 'flex', gap: 10, fontSize: 16, lineHeight: 1.6, color: 'var(--text)' }}>
                <span style={{ flexShrink: 0, marginTop: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
                <span>{renderInline(o)}</span>
              </li>
            ))}
          </ul>
        );
        if (b.tip === 'gorsel') return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={b.url} alt={b.alt || ''} style={{ display: 'block', width: '100%', borderRadius: 14, border: '1px solid var(--border)', margin: '18px 0' }} />
        );
        if (b.tip === 'alinti') return (
          <blockquote key={i} style={{ margin: '20px 0', padding: '14px 20px', borderLeft: '4px solid var(--gold)', background: '#FBF7EE', borderRadius: '0 12px 12px 0', fontSize: 16.5, lineHeight: 1.7, color: 'var(--text)', fontStyle: 'italic' }}>{renderInline(b.metin)}</blockquote>
        );
        return <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text)', marginBottom: 16 }}>{renderInline(b.metin)}</p>;
      })}
    </>
  );
}
