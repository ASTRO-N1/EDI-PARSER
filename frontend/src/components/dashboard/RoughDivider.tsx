import { useEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import { useTheme } from '../../theme/ThemeContext'

interface RoughDividerProps {
  orientation: 'vertical' | 'horizontal'
}

export default function RoughDivider({ orientation }: RoughDividerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { isDark } = useTheme()
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!wrapperRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDims({
          w: Math.round(entry.contentRect.width),
          h: Math.round(entry.contentRect.height),
        })
      }
    })
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current) return
    const { w, h } = dims
    if (w === 0 && h === 0) return
    const svg = svgRef.current
    svg.replaceChildren()
    svg.setAttribute('width', String(w))
    svg.setAttribute('height', String(h))
    const rc = rough.svg(svg)
    const stroke = isDark ? 'rgba(240,235,225,0.18)' : 'rgba(26,26,46,0.18)'

    if (orientation === 'vertical') {
      const x = w / 2
      svg.appendChild(rc.line(x, 2, x, h - 2, {
        roughness: 2,
        strokeWidth: 1.5,
        stroke,
      }))
    } else {
      const y = h / 2
      svg.appendChild(rc.line(2, y, w - 2, y, {
        roughness: 2.5,
        strokeWidth: 1.5,
        stroke,
      }))
    }
  }, [dims, isDark, orientation])

  const style: React.CSSProperties = orientation === 'vertical'
    ? { width: 8, alignSelf: 'stretch', flexShrink: 0, position: 'relative' }
    : { height: 8, width: '100%', flexShrink: 0, position: 'relative' }

  return (
    <div ref={wrapperRef} style={style}>
      <svg
        ref={svgRef}
        style={{ position: 'absolute', top: 0, left: 0, display: 'block', pointerEvents: 'none' }}
      />
    </div>
  )
}
