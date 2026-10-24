'use client';

import { useRouter } from 'next/navigation';

/** "‹ İşletmeye dön" — geldiği sayfaya (genellikle işletme profili) döner; geçmiş yoksa liste sayfasına gider. */
export default function GeriDugme({ fallbackHref, children = 'İşletmeye dön' }: { fallbackHref: string; children?: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="kf-geri"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15 6-6 6 6 6" />
      </svg>
      {children}
    </button>
  );
}
