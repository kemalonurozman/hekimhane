'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  { href: '/doktorlar',  label: 'Doktorlar' },
  { href: '/hastaneler', label: 'Hastaneler' },
  { href: '/klinikler',  label: 'Diş Hekimleri' },
  { href: '/eczaneler',  label: 'Eczaneler' },
  { href: '/blog',       label: 'Blog' },
];

// Logo mark — sağlık artı sembolü, SVG
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#1B3A69" />
      <rect x="14" y="7" width="4" height="18" rx="2" fill="white" />
      <rect x="7" y="14" width="18" height="4" rx="2" fill="#D4A843" />
    </svg>
  );
}

function ChevronDown({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function ChevronUp({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
function IconDashboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconFlag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconSignOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconGoogle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Hamburger icon — 3 horizontal lines
function IconHamburger() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// Close (X) icon
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user, setUser]               = useState<User | null>(null);
  const [dropOpen, setDropOpen]       = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setDropOpen(false);
    setMobileOpen(false);
    router.push('/');
    router.refresh();
  }

  const avatar   = user?.user_metadata?.avatar_url;
  const name     = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 64,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,.07)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
      }}>
        <div className="container" style={{
          height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{
              fontSize: 18, fontWeight: 700,
              color: '#1B3A69',
              letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}>
              Hekimhane
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="nav-links-desktop">
            {NAV_LINKS.map(link => {
              const active = pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: '6px 13px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '-.1px',
                  color: active ? '#1B3A69' : '#3A3A3C',
                  background: active ? 'rgba(27,58,105,.07)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background .15s, color .15s',
                }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right section: Auth + Hamburger ──────────────────────── */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {authLoading ? (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F2F7' }} />
            ) : user ? (
              /* Giriş yapılmış */
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px 5px 5px', borderRadius: 50,
                    border: '1px solid rgba(0,0,0,.1)',
                    background: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                  }}
                >
                  {avatar ? (
                    <img src={avatar} alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%' }} />
                  ) : (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: '#1B3A69', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {initials}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.1px' }}>
                    {name.split(' ')[0]}
                  </span>
                  <span style={{ color: '#8E8E93' }}>
                    {dropOpen ? <ChevronUp /> : <ChevronDown />}
                  </span>
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    minWidth: 210,
                    background: 'rgba(255,255,255,.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: 16,
                    border: '1px solid rgba(0,0,0,.08)',
                    boxShadow: '0 12px 40px rgba(0,0,0,.12)',
                    overflow: 'hidden', zIndex: 100,
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F2F2F7' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-.1px' }}>{name}</div>
                      <div style={{ fontSize: 11.5, color: '#8E8E93', marginTop: 2 }}>{user.email}</div>
                    </div>

                    {[
                      { href: '/panel',          icon: <IconDashboard />, label: 'İşletme Paneli' },
                      { href: '/panel/talepler',  icon: <IconFlag />,      label: 'Sahiplenme Taleplerim' },
                      { href: '/panel/yorumlar',  icon: <IconChat />,      label: 'Yorum Gelen Kutusu' },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setDropOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', fontSize: 13,
                          color: '#3A3A3C', fontWeight: 500, textDecoration: 'none',
                          letterSpacing: '-.1px',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F7')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ color: '#1B3A69', display: 'flex' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div style={{ borderTop: '1px solid #F2F2F7' }}>
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', fontSize: 13, color: '#DC2626',
                          fontWeight: 500, background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left', letterSpacing: '-.1px',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#FFF1F0')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                      >
                        <span style={{ display: 'flex' }}><IconSignOut /></span>
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Giriş yapılmamış */
              <>
                <Link href="/giris" style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 15px', borderRadius: 9,
                  border: '1px solid rgba(0,0,0,.1)',
                  background: 'white',
                  fontSize: 13, fontWeight: 600, color: '#3A3A3C',
                  textDecoration: 'none', letterSpacing: '-.1px',
                  boxShadow: '0 1px 3px rgba(0,0,0,.05)',
                }}>
                  Giriş
                </Link>
                <Link href="/katil" className="nav-cta-desktop" style={{
                  display: 'flex', alignItems: 'center',
                  padding: '7px 16px', borderRadius: 9,
                  background: '#D4A843',
                  fontSize: 13, fontWeight: 600, color: 'white',
                  textDecoration: 'none', letterSpacing: '-.1px',
                }}>
                  İşletmenizi Ekleyin
                </Link>
              </>
            )}

            {/* ── Hamburger button — mobile only ───────────────────── */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menüyü aç"
              aria-expanded={mobileOpen}
              style={{
                display: 'none', /* shown via media query */
                alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40,
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,.1)',
                background: 'white',
                cursor: 'pointer',
                color: '#1B3A69',
                boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                flexShrink: 0,
              }}
            >
              {mobileOpen ? <IconClose /> : <IconHamburger />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay ───────────────────────────────── */}
      <div
        className="mobile-menu-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
          // Slide-in from right animation via class
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          opacity: mobileOpen ? 1 : 0,
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease',
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
        aria-hidden={!mobileOpen}
      >
        {/* ── Overlay header ── */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(0,0,0,.07)',
          flexShrink: 0,
        }}>
          {/* Logo inside overlay */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <LogoMark />
            <span style={{
              fontSize: 18, fontWeight: 700, color: '#1B3A69', letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}>
              Hekimhane
            </span>
          </Link>

          {/* Close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Menüyü kapat"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 10,
              border: '1px solid rgba(0,0,0,.1)',
              background: 'white',
              cursor: 'pointer',
              color: '#1B3A69',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)',
            }}
          >
            <IconClose />
          </button>
        </div>

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {NAV_LINKS.map(link => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 52,
                  padding: '0 16px',
                  borderRadius: 12,
                  fontSize: 17,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '-.2px',
                  color: active ? '#1B3A69' : '#1D1D1F',
                  background: active ? 'rgba(27,58,105,.07)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: 4,
                  transition: 'background .15s',
                  borderLeft: active ? '3px solid #1B3A69' : '3px solid transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Auth section at bottom ── */}
        <div style={{
          padding: '16px 16px 32px',
          borderTop: '1px solid rgba(0,0,0,.07)',
          flexShrink: 0,
        }}>
          {authLoading ? (
            <div style={{ height: 48, borderRadius: 12, background: '#F2F2F7' }} />
          ) : user ? (
            /* Logged-in state inside mobile menu */
            <div>
              {/* User identity row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', marginBottom: 8,
                background: '#F5F5F7', borderRadius: 12,
              }}>
                {avatar ? (
                  <img src={avatar} alt="avatar" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: '#1B3A69', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}>
                    {initials}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
              </div>

              {/* Panel links */}
              {[
                { href: '/panel',          icon: <IconDashboard />, label: 'İşletme Paneli' },
                { href: '/panel/talepler',  icon: <IconFlag />,      label: 'Sahiplenme Taleplerim' },
                { href: '/panel/yorumlar',  icon: <IconChat />,      label: 'Yorum Gelen Kutusu' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    minHeight: 48, padding: '0 16px', borderRadius: 10,
                    fontSize: 15, color: '#3A3A3C', fontWeight: 500,
                    textDecoration: 'none', letterSpacing: '-.1px', marginBottom: 2,
                  }}
                >
                  <span style={{ color: '#1B3A69', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', minHeight: 48, padding: '0 16px', borderRadius: 10,
                  fontSize: 15, color: '#DC2626', fontWeight: 500,
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', letterSpacing: '-.1px', marginTop: 4,
                }}
              >
                <span style={{ display: 'flex' }}><IconSignOut /></span>
                Çıkış Yap
              </button>
            </div>
          ) : (
            /* Logged-out state inside mobile menu */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href="/katil"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: 48, borderRadius: 12,
                  background: '#D4A843',
                  fontSize: 15, fontWeight: 600, color: 'white',
                  textDecoration: 'none', letterSpacing: '-.1px',
                }}
              >
                İşletmenizi Ekleyin
              </Link>
              <Link
                href="/giris"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: 48, borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.12)',
                  background: 'white',
                  fontSize: 15, fontWeight: 600, color: '#3A3A3C',
                  textDecoration: 'none', letterSpacing: '-.1px',
                  boxShadow: '0 1px 3px rgba(0,0,0,.05)',
                }}
              >
                Giriş Yap
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Hide desktop nav links on mobile */
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop   { display: none !important; }
          .hamburger-btn     { display: flex !important; }
        }
        /* Ensure hamburger is hidden on desktop */
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
