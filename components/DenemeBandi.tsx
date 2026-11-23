// Deneme profili / deneme paneli bandı (lib/demo.ts). Hook yok → server ve client ortak.
import Link from 'next/link';
import { DEMO_METIN } from '@/lib/demo';

export default function DenemeBandi({ tur }: { tur: 'profil' | 'panel' }) {
  const profil = tur === 'profil';
  return (
    <div role="note" aria-label={profil ? DEMO_METIN.profilBaslik : DEMO_METIN.panelBaslik}
      style={{
        background: '#FFF8E6', borderBottom: profil ? '1px solid #F1DFAE' : undefined,
        border: profil ? undefined : '1px solid #F1DFAE', borderRadius: profil ? 0 : 14,
        // Profil: sabit üst menünün (ProfilSayfasi paddingTop: 66) altına oturur; alttaki
        // eksi boşluk sayfanın kendi üst boşluğunu yer, içerik bandın hemen altından başlar.
        margin: profil ? '66px 0 -66px' : '0 0 18px',
        position: profil ? 'relative' : undefined, zIndex: profil ? 2 : undefined,
      }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: profil ? '14px 16px' : '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span aria-hidden style={{ flex: '0 0 auto', marginTop: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: '#C9A04A' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16.5h.01" />
          </svg>
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#5C4510', letterSpacing: '-.1px' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', background: '#5C4510', color: '#fff', borderRadius: 6, padding: '2px 7px', marginRight: 8, verticalAlign: '1px' }}>Deneme</span>
            {profil ? DEMO_METIN.profilBaslik : DEMO_METIN.panelBaslik}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.55, color: '#6B5418' }}>
            {profil ? DEMO_METIN.profilGovde : DEMO_METIN.panelGovde}{' '}
            <Link href="/katil" style={{ color: '#1B3A69', fontWeight: 600 }}>
              {profil ? 'Kendi profilinizi ücretsiz oluşturun' : 'Kendi işletmenizi ekleyin'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
