// Liste kartlarında kurum türü rozeti — Özel / Devlet / Üniversite.
// Hook yok: server ve client kartlarda ortak.

export type Kurum = 'ozel' | 'devlet' | 'universite';

/** Hekim kaydının etiketlerinden kurum türü. Bilinmiyorsa null (rozet çıkmaz — tahmin yürütülmez). */
export function kurumBul(tags?: string[] | null): Kurum | null {
  const t = tags || [];
  if (t.includes('devlet-dis-hastanesi')) return 'devlet';
  if (t.includes('universite-dis-hastanesi')) return 'universite';
  return null;
}

const STIL: Record<Kurum, { ad: string; zemin: string; yazi: string; kenar: string }> = {
  ozel:       { ad: 'Özel',       zemin: '#EEF2F8', yazi: '#1A335E', kenar: '#D5DEEC' },
  devlet:     { ad: 'Devlet',     zemin: '#E8F5EE', yazi: '#1F7A4F', kenar: '#C6E6D4' },
  universite: { ad: 'Üniversite', zemin: '#F1EEFB', yazi: '#5B3FB8', kenar: '#DCD4F5' },
};

export default function KurumRozeti({ kurum }: { kurum?: string | null }) {
  const s = STIL[(kurum || '') as Kurum];
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', flex: 'none', height: 22, padding: '0 9px', borderRadius: 999,
      background: s.zemin, color: s.yazi, boxShadow: `inset 0 0 0 1px ${s.kenar}`,
      fontSize: 11.5, fontWeight: 700, letterSpacing: '.01em', lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      {s.ad}
    </span>
  );
}
