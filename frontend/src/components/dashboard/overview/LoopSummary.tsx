import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import useAppStore from '../../../store/useAppStore'
import { useTheme } from '../../../theme/ThemeContext'
import { useIsMobile } from '../../../hooks/useWindowWidth'

export default function LoopSummary() {
  const { parseResult } = useAppStore()
  const { t } = useTheme()
  const isMobile = useIsMobile()
  const roughRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const data = parseResult?.data as Record<string, unknown> | undefined
  const loops = data?.loops as Array<Record<string, unknown>> | undefined

  useEffect(() => {
    if (!roughRef.current || !containerRef.current) return
    const container = containerRef.current
    const draw = () => {
      if (!roughRef.current) return
      const svg = roughRef.current
      svg.innerHTML = ''
      const rc = rough.svg(svg)
      const w = container.offsetWidth
      const h = container.offsetHeight
      if (!w || !h) return
      svg.setAttribute('width', String(w))
      svg.setAttribute('height', String(h))
      svg.appendChild(rc.rectangle(2, 2, w - 4, h - 4, {
        roughness: 1.5, strokeWidth: 2, stroke: t.roughStroke, fill: 'none',
      }))
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(container)
    return () => ro.disconnect()
  }, [t.roughStroke])

  // Simple visual logic if loops exist or not
  const hasLoops = loops && loops.length > 0

  return (
    <div
      ref={containerRef}
      style={{
        background: t.bgCard,
        borderRadius: 14,
        padding: '24px',
        boxShadow: `4px 4px 0px ${t.shadow}`,
        position: 'relative',
        height: isMobile ? 'auto' : 500,
        maxHeight: isMobile ? 340 : undefined,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease',
      }}
    >
      <svg ref={roughRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 18, color: t.ink }}>
          🔄 Loop Structure
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        {hasLoops ? (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: 8 }}>
            {loops.map((loop, idx) => (
              <div key={idx} style={{
                background: t.bgCard, border: `1.5px solid ${t.border}`,
                borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', left: -1, bottom: -16, width: 2, height: 16, borderLeft: `1.5px dashed ${t.border}` }} />
                <div style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: t.ink,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.teal }} />
                  Loop {String(loop.id ?? loop.loop_id ?? 'UNK')}
                </div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: t.inkMuted, marginTop: 4 }}>
                  {loop.description ? String(loop.description) : 'Loop details'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {/* Hand-drawn swirl for empty state */}
            <svg width={60} height={60} viewBox="0 0 60 60" fill="none" stroke={t.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, margin: '0 auto 12px' }}>
              <path d="M30 10 C 50 10, 50 30, 30 30 C 10 30, 10 50, 30 50" />
              <path d="M15 15 L 20 10 L 25 15" />
            </svg>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: t.inkMuted, fontSize: 14 }}>
              Loop structure unavailable
            </div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 400, color: t.inkFaint, fontSize: 12, marginTop: 4 }}>
              Data does not contain explicit loop nesting.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
