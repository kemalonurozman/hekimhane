import Link from 'next/link';
import { LogoMark } from '@/components/Logo';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh', paddingTop: 66, background: 'var(--cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <LogoMark size={56} />
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--navy)', letterSpacing: '-2px', lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: 'var(--font-playfair,serif)', fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '14px 0 10px' }}>
          Sayfa Bulunamadı
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
          Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ padding: '12px 22px', borderRadius: 12, background: 'var(--navy)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ana Sayfa
          </Link>
          <Link href="/klinikler" style={{ padding: '12px 22px', borderRadius: 12, background: 'white', color: 'var(--navy)', fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '1.5px solid var(--border)' }}>
            Diş Klinikleri
          </Link>
          <Link href="/dis-hekimleri" style={{ padding: '12px 22px', borderRadius: 12, background: 'white', color: 'var(--navy)', fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '1.5px solid var(--border)' }}>
            Diş Hekimleri
          </Link>
        </div>
      </div>
    </main>
  );
}
