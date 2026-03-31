import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useAppStore from '../store/useAppStore'

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function SidebarItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '11px 16px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 10,
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: danger ? '#FF6B6B' : 'rgba(253,250,244,0.85)',
        textAlign: 'left',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(255,107,107,0.12)' : 'rgba(78,205,196,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  )
}

export default function WorkspacePage() {
  const navigate = useNavigate()
  const { session, authLoading } = useAppStore()

  // ── While auth is initializing, show nothing (or a tiny spinner) ──
  if (authLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFAF4',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div className="doodle-spinner" style={{ width: 48, height: 48 }} />
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(26,26,46,0.5)' }}>
          Loading your workspace...
        </p>
      </div>
    )
  }

  // ── Route guard: only redirect after we know there's no session ──
  if (!session) {
    return <Navigate to="/auth" replace />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Extract user's first name from session
  const fullName = session.user?.user_metadata?.full_name as string | undefined
  const email = session.user?.email ?? ''
  const displayName = fullName ? fullName.split(' ')[0] : email.split('@')[0]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Left Sidebar ──────────────────────────────────────────── */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          background: '#1A1A2E',
          borderRight: '3px solid #1A1A2E',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 12px',
          gap: 4,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="2" width="22" height="28" rx="3" fill="#FDFAF4" stroke="#4ECDC4" strokeWidth="2" />
            <line x1="9" y1="10" x2="20" y2="10" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="15" x2="18" y2="15" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="20" x2="16" y2="20" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="7" fill="#4ECDC4" stroke="#FDFAF4" strokeWidth="2" />
            <circle cx="23" cy="23" r="4" fill="#1A1A2E" stroke="#4ECDC4" strokeWidth="1.5" />
            <line x1="28" y1="28" x2="33" y2="33" stroke="#FDFAF4" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 16, color: '#FDFAF4' }}>EdiFix</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(78,205,196,0.7)', marginTop: 1 }}>Workspace</div>
          </div>
        </div>

        {/* Nav items */}
        <SidebarItem icon="➕" label="New Parse" onClick={() => navigate('/')} />
        <SidebarItem icon="🗂" label="File History" />
        <SidebarItem icon="⚙️" label="Settings" />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(253,250,244,0.1)', margin: '8px 8px' }} />
        <SidebarItem icon="←" label="Log Out" onClick={handleLogout} danger />
      </div>

      {/* ── Main Canvas ───────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: '#FDFAF4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: 40,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Background decorative doodles */}
        <svg width="60" height="60" style={{ position: 'absolute', top: 80, right: 120, opacity: 0.08 }} viewBox="0 0 60 60" fill="none">
          <path d="M30 6 L35 24 L54 30 L35 36 L30 54 L25 36 L6 30 L25 24 Z" stroke="#FF6B6B" strokeWidth="2" fill="none" />
        </svg>
        <svg width="40" height="40" style={{ position: 'absolute', bottom: 120, left: 80, opacity: 0.08 }} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="#4ECDC4" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        <svg width="32" height="32" style={{ position: 'absolute', top: '30%', left: '15%', opacity: 0.06 }} viewBox="0 0 32 32" fill="none">
          <path d="M16 2 L18 12 L28 16 L18 20 L16 30 L14 20 L4 16 L14 12 Z" stroke="#FFE66D" strokeWidth="2" fill="none" />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ textAlign: 'center', maxWidth: 560 }}
        >
          {/* Hi [Name] greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              background: '#FFE66D',
              border: '2px solid #1A1A2E',
              borderRadius: 999,
              boxShadow: '3px 3px 0px #1A1A2E',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 15,
              color: '#1A1A2E',
              transform: 'rotate(-1deg)',
              marginBottom: 28,
            }}
          >
            👋 Hi, {displayName}!
          </motion.div>

          <h1
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(36px, 4.5vw, 54px)',
              color: '#1A1A2E',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Welcome to your{' '}
            <span style={{ color: '#4ECDC4' }}>Workspace!</span>
          </h1>

          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 16,
              color: 'rgba(26,26,46,0.6)',
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            We're still building the file history feature, but your account is ready to go.
            <br />
            Start by parsing your first EDI file!
          </p>

          <motion.button
            whileHover={{ y: -3, boxShadow: '6px 6px 0px #1A1A2E' }}
            whileTap={{ y: 0, boxShadow: '2px 2px 0px #1A1A2E' }}
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              background: '#4ECDC4',
              border: '2.5px solid #1A1A2E',
              borderRadius: '10px 12px 8px 11px / 11px 8px 12px 10px',
              boxShadow: '4px 4px 0px #1A1A2E',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 16,
              color: '#1A1A2E',
              cursor: 'pointer',
              transform: 'rotate(0.5deg)',
            }}
          >
            Parse a New File
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M10 4l5 5-5 5" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
