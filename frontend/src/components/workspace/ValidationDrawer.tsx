import useAppStore from '../../store/useAppStore'

const PLACEHOLDER_ERRORS = [
  { id: 1, type: 'error', code: 'InvalidNPI', element: 'NM109', loop: '2000A', msg: 'Billing Provider NPI is missing or invalid format (must be 10 digits).' },
  { id: 2, type: 'warning', code: 'AmountMismatch', element: 'CLM02', loop: '2300', msg: 'Total claim charge amount does not equal sum of service lines (SV102).' },
]

export default function ValidationDrawer() {
  const parseResult = useAppStore((s) => s.parseResult)
  const ediFile = useAppStore((s) => s.ediFile)
  const isValidationDrawerOpen = useAppStore((s) => s.isValidationDrawerOpen)
  const hasFile = !!(parseResult || ediFile.fileName)
  const toggleValidation = useAppStore(s => s.toggleValidationDrawer)

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#FDFAF4',
      overflow: 'hidden'
    }}>
      {/* Drawer Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#FF6B6B',
        borderBottom: '2.5px solid #1A1A2E',
        padding: '6px 16px',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8, marginTop: -2 }}>
          <path d="M8 1L15 14H1L8 1Z" stroke="#1A1A2E" strokeWidth="2" strokeLinejoin="round" />
          <line x1="8" y1="6" x2="8" y2="10" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="12.5" r="1" fill="#1A1A2E" />
        </svg>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#1A1A2E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Validation Problems
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={toggleValidation}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            transition: 'transform 0.3s ease',
            transform: isValidationDrawerOpen ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Drawer Body (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }} className="custom-scrollbar">
        {!hasFile ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 12,
            color: 'rgba(26,26,46,0.3)',
            fontStyle: 'italic'
          }}>
            No validation data. Upload a file to see errors.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PLACEHOLDER_ERRORS.map((err) => (
              <div
                key={err.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  padding: '8px 12px',
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(26,26,46,0.1)',
                  borderRadius: 6,
                  boxShadow: '1px 1px 0px rgba(26,26,46,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(78,205,196,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              >
                {/* Indicator icon */}
                <span style={{ fontSize: 13, flexShrink: 0 }}>
                  {err.type === 'error' ? '🔴' : '🟡'}
                </span>

                {/* Error location/code */}
                <div style={{ minWidth: 100, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>
                    {err.code}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(26,26,46,0.45)' }}>
                    Loop {err.loop} · {err.element}
                  </div>
                </div>

                {/* Message */}
                <div style={{
                  flex: 1,
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 13,
                  color: 'rgba(26,26,46,0.7)',
                  lineHeight: 1.4
                }}>
                  {err.msg}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: 0.8 }}>
                  <button style={{
                    padding: '4px 10px',
                    background: '#FFE66D',
                    border: '1.5px solid #1A1A2E',
                    borderRadius: 6,
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    fontSize: 11,
                    color: '#1A1A2E',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0px #1A1A2E',
                  }}>
                    Explain
                  </button>
                  <button style={{
                    padding: '4px 10px',
                    background: '#4ECDC4',
                    border: '1.5px solid #1A1A2E',
                    borderRadius: 6,
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    fontSize: 11,
                    color: '#1A1A2E',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0px #1A1A2E',
                  }}>
                    Ask AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Footer Status */}
      <div style={{
        padding: '4px 16px',
        background: '#FFFFFF',
        borderTop: '1px solid rgba(26,26,46,0.1)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: 'rgba(26,26,46,0.5)',
        display: 'flex',
        gap: 16
      }}>
        {hasFile && (
          <>
            <span>🔴 1 Error</span>
            <span>🟡 1 Warning</span>
          </>
        )}
      </div>
    </div>
  )
}