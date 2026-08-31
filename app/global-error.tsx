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
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FBF8F2', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: 420 }}>
          {/* Düz <img>: hata anında next/image optimizer'ına bağımlı kalmasın */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hata-gorsel.jpg"
            alt="Hekimhane"
            width={340}
            height={227}
            style={{ width: '100%', maxWidth: 340, height: 'auto', borderRadius: 18, border: '1px solid #E5E5EA', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: 24 }}
          />
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
