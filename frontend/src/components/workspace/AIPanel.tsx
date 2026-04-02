import { useState, useRef, useEffect } from 'react'

export default function AIPanel() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hi! I am your AI Co-Pilot. Click on any error or segment in your file and I can explain it.' },
    { id: '2', role: 'user', text: 'What is Loop 2000A?' },
    { id: '3', role: 'assistant', text: 'Loop 2000A represents the Billing Provider. It holds details like the National Provider Identifier (NPI), Address, and Tax ID. If this loop is malformed, the entire claim will be rejected by the clearinghouse.' },
  ])
  const [input, setInput] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#FDFAF4',
      borderLeft: '2.5px solid #1A1A2E',
      overflow: 'hidden',
    }}>
      {/* AI Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '2.5px solid #1A1A2E',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#FFFFFF',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 18 }}>✦</div>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#1A1A2E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          AI Co-Pilot
        </span>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 16 }} className="custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 10,
              color: 'rgba(26,26,46,0.4)',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginLeft: 4, marginRight: 4
            }}>{m.role === 'user' ? 'YOU' : 'EDI EXPERT'}</span>
            <div style={{
              background: m.role === 'user' ? '#1A1A2E' : '#FFFFFF',
              color: m.role === 'user' ? '#FDFAF4' : '#1A1A2E',
              border: m.role === 'user' ? '2px solid #1A1A2E' : '2px solid rgba(26,26,46,0.15)',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '10px 14px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              lineHeight: 1.5,
              boxShadow: m.role === 'user' ? 'none' : '2px 2px 0px rgba(26,26,46,0.08)',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={msgsEndRef} />
      </div>

      {/* Input Box */}
      <div style={{
        padding: '12px',
        borderTop: '2.5px solid #1A1A2E',
        background: '#FFFFFF',
        flexShrink: 0,
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!input.trim()) return
            setMessages(s => [...s, { id: Date.now().toString(), role: 'user', text: input }])
            setInput('')
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '2px solid #1A1A2E',
            borderRadius: 16,
            padding: '4px 6px',
            background: '#FDFAF4',
            boxShadow: 'inset 2px 2px 0px rgba(26,26,46,0.05)',
            transition: 'border-color 0.2s',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about a segment..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 10px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              color: '#1A1A2E',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: input.trim() ? '#4ECDC4' : 'rgba(26,26,46,0.05)',
              border: '1.5px solid',
              borderColor: input.trim() ? '#1A1A2E' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" opacity={input.trim() ? 1 : 0.4}>
              <path d="M1 8L15 2L8 15L7 10L1 8Z" fill={input.trim() ? '#1A1A2E' : 'rgba(26,26,46,0.5)'} stroke={input.trim() ? '#1A1A2E' : 'rgba(26,26,46,0.5)'} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
