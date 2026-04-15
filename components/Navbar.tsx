'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/klinikler',  label: '🦷 Klinikler' },
  { href: '/hastaneler', label: '🏥 Hastaneler' },
  { href: '/doktorlar',  label: '👨‍⚕️ Doktorlar' },
  { href: '/eczaneler',  label: '💊 Eczaneler' },
  { href: '/blog',       label: '📝 Blog' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: '66px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 2px 16px rgba(27,58,105,.06)',
    }}>
      <div className="container" style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--navy), var(--navy2))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🦷</div>
          <span style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: '20px', fontWeight: 800, color: 'var(--navy)'
          }}>Hekimhane</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
             className="nav-links-desktop">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '7px 14px',
                borderRadius: '9px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: pathname.startsWith(link.href) ? 'var(--navy)' : 'var(--muted)',
                background: pathname.startsWith(link.href) ? 'rgba(27,58,105,.08)' : 'transparent',
                transition: '0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/isletme-giris" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Giriş
          </Link>
          <Link href="/katil" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            İşletmenizi Ekleyin
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
