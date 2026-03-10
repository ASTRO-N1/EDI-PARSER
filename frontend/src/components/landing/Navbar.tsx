import React, { useEffect, useState } from 'react'

function LogoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="EDI Inspector logo icon">
      {/* Document */}
      <rect x="4" y="2" width="22" height="28" rx="3" fill="#FDFAF4" stroke="#1A1A2E" strokeWidth="2" />
      {/* Lines on document */}
      <line x1="9" y1="10" x2="20" y2="10" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="15" x2="18" y2="15" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="20" x2="16" y2="20" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      {/* Magnifying glass */}
      <circle cx="24" cy="24" r="7" fill="#4ECDC4" stroke="#1A1A2E" strokeWidth="2" />
      <circle cx="23" cy="23" r="4" fill="#FDFAF4" stroke="#1A1A2E" strokeWidth="1.5" />
      <line x1="28" y1="28" x2="33" y2="33" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? '#FDFAF4' : 'transparent',
        borderBottom: scrolled ? '2px solid #1A1A2E' : '2px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: '#1A1A2E',
        }}
      >
        <span className="bounce-gentle" style={{ display: 'flex' }}>
          <LogoIcon />
        </span>
        <span
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 20,
            color: '#1A1A2E',
            letterSpacing: '-0.3px',
          }}
        >
          EDI Inspector
        </span>
      </a>

      {/* Right side buttons */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sticker"
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 14,
            color: '#1A1A2E',
            background: 'transparent',
            textDecoration: 'none',
          }}
        >
          View on GitHub
        </a>
        <a
          href="#"
          className="btn-sticker"
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 14,
            color: '#FDFAF4',
            background: '#1A1A2E',
            textDecoration: 'none',
            transform: 'rotate(0.5deg)',
          }}
        >
          Read Docs
        </a>
      </div>
    </nav>
  )
}
