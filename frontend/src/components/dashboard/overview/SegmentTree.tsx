import { useState, useRef, useEffect } from 'react'
import rough from 'roughjs'
import useAppStore from '../../../store/useAppStore'
import { useTheme } from '../../../theme/ThemeContext'

interface SegmentShape {
  id: string
  elements: string[]
}

function resolveSegment(item: unknown): SegmentShape {
  if (Array.isArray(item)) {
    return { id: String(item[0] ?? 'UNK').toUpperCase(), elements: item.slice(1).map(String) }
  }
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>
    const id = String(obj.id ?? obj.segment_id ?? 'UNK').toUpperCase()
    const elements = (obj.elements ?? obj.data ?? []) as unknown[]
    return { id, elements: elements.map(String) }
  }
  return { id: 'UNK', elements: [] }
}

const SEGMENT_DESCRIPTIONS: Record<string, string> = {
  ST: 'Transaction Set Header',
  BHT: 'Beginning of Hierarchical Transaction',
  NM1: 'Name / Entity Identifier',
  HL: 'Hierarchical Level',
  PRV: 'Provider Information',
  SBR: 'Subscriber Information',
  CLM: 'Claim Information',
  LX: 'Service Line Number',
  SV1: 'Professional Service',
  DTP: 'Date or Time or Period',
  REF: 'Reference Information',
  AMT: 'Monetary Amount Information',
  SE: 'Transaction Set Trailer',
  ISA: 'Interchange Control Header',
  IEA: 'Interchange Control Trailer',
  GS: 'Functional Group Header',
  GE: 'Functional Group Trailer',
}

interface SegmentGroupProps {
  id: string
  segments: SegmentShape[]
}

function SegmentGroup({ id, segments }: SegmentGroupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { t, isDark } = useTheme()
  const desc = SEGMENT_DESCRIPTIONS[id] || 'EDI Segment'

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 10,
          background: isHovered ? (isDark ? 'rgba(78,205,196,0.08)' : 'rgba(78,205,196,0.08)') : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: 14,
          color: t.teal,
          display: 'inline-block',
          width: 14,
        }}>
          ▶
        </span>
        <span style={{
          background: isDark ? '#1A1A2E' : t.ink,
          color: t.yellow,
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 600,
          fontSize: 13,
          padding: '4px 8px',
          borderRadius: 6,
        }}>
          {id}
        </span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: t.ink }}>
          {desc}
        </span>
        <span style={{
          marginLeft: 'auto',
          background: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(78,205,196,0.15)',
          color: t.ink,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 999,
        }}>
          {segments.length}
        </span>
      </div>

      {isOpen && (
        <div style={{ paddingLeft: 34, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {seg.elements.map((val, eIdx) => (
                <span
                  key={eIdx}
                  style={{
                    background: t.bgHighlight,
                    border: `1px solid ${t.border}`,
                    color: t.ink,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxWidth: '100%',
                  }}
                  title={`${id}-${(eIdx + 1).toString().padStart(2, '0')}`}
                >
                  <span style={{ color: t.teal, opacity: 0.8, marginRight: 4 }}>{eIdx + 1}&#58;</span>
                  {val || <span style={{ opacity: 0.3 }}>~</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SegmentTree() {
  const { parseResult } = useAppStore()
  const { t, isDark } = useTheme()
  const roughRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const drawBorder = () => {
    if (!roughRef.current || !containerRef.current) return
    const svg = roughRef.current
    svg.innerHTML = ''
    const rc = rough.svg(svg)
    const w = containerRef.current.offsetWidth
    const h = containerRef.current.offsetHeight
    svg.setAttribute('width', String(w))
    svg.setAttribute('height', String(h))
    svg.appendChild(rc.rectangle(2, 2, w - 4, h - 4, {
      roughness: isDark ? 1.2 : 1.8,
      strokeWidth: isDark ? 1.5 : 2,
      stroke: isDark ? 'rgba(240,235,225,0.35)' : t.roughStroke,
      fill: 'none',
    }))
  }

  // Redraw on mount, theme change, and whenever the container is resized
  useEffect(() => {
    drawBorder()
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => drawBorder())
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isDark, t.roughStroke])

  // Group segments
  const rawSegments = (parseResult?.data as Record<string, unknown> | undefined)?.segments as unknown[] | undefined
  const structuredSegments = rawSegments?.map(resolveSegment) ?? []

  const tree: Record<string, SegmentShape[]> = {}
  structuredSegments.forEach(seg => {
    if (!tree[seg.id]) tree[seg.id] = []
    tree[seg.id].push(seg)
  })

  // Order defined segments first, then others
  const orderedKeys = Object.keys(SEGMENT_DESCRIPTIONS).filter(k => tree[k])
  const otherKeys = Object.keys(tree).filter(k => !SEGMENT_DESCRIPTIONS[k])
  const finalKeys = [...orderedKeys, ...otherKeys]

  return (
    <div
      ref={containerRef}
      style={{
        background: t.bgCard,
        borderRadius: 14,
        padding: '24px',
        boxShadow: `4px 4px 0px ${t.shadow}`,
        position: 'relative',
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease',
      }}
    >
      <svg ref={roughRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 18, color: t.ink }}>
          🌲 Segment Explorer
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, color: t.inkMuted }}>
          {structuredSegments.length} Segments
        </div>
      </div>

      <div className="segment-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {finalKeys.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Nunito, sans-serif', color: t.inkFaint, fontSize: 14,
          }}>
            No segments extracted
          </div>
        ) : (
          finalKeys.map(id => <SegmentGroup key={id} id={id} segments={tree[id]} />)
        )}
      </div>
    </div>
  )
}
