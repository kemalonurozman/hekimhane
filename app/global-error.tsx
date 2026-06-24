'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚕️</div>
          <h2 style={{ color: '#1B3A69', fontSize: 22, marginBottom: 8 }}>Bir hata oluştu</h2>
          <p style={{ color: '#6B7280', marginBottom: 24 }}>Sayfa yüklenirken sorun oluştu. Tekrar deneyin.</p>
          <button
            onClick={reset}
            style={{ background: '#1B3A69', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
