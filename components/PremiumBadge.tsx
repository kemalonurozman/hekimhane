/**
 * PremiumBadge — Hekimhane Premium onay rozeti
 *
 * variant="photo"  → fotoğraf üzerine konumlanır (position: absolute)
 * variant="inline" → isim yanında satır içi gösterilir
 */

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'photo' | 'inline';
}

export default function PremiumBadge({ size = 'sm', variant = 'photo' }: PremiumBadgeProps) {
  const dim    = size === 'lg' ? 32 : size === 'md' ? 26 : 20;
  const stroke = size === 'lg' ? 2.6 : size === 'md' ? 2.3 : 2.0;
  const bottom = size === 'lg' ? -5 : size === 'md' ? -4 : -3;
  const right  = size === 'lg' ? -5 : size === 'md' ? -4 : -3;

  const badge = (
    <div
      title="Hekimhane Premium"
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        /* Hekimhane lacivert arka plan */
        background: 'linear-gradient(145deg, #1B3A69, #163060)',
        border: '2.5px solid white',
        boxShadow: '0 2px 8px rgba(27,58,105,.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'default',
        /* photo variant için absolute; inline için static */
        ...(variant === 'photo'
          ? { position: 'absolute' as const, bottom, right, zIndex: 3 }
          : {}),
      }}
    >
      {/* Sade beyaz tik — Facebook / Instagram tarzı */}
      <svg
        width={Math.round(dim * 0.52)}
        height={Math.round(dim * 0.52)}
        viewBox="0 0 12 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 5 L4.5 8.5 L11 1.5"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return badge;
}
