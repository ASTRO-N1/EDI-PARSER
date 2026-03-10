import React, { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { WaveTop, WaveBottom } from './DoodleElements'

const STATS = [
  { value: 97572, label: 'ICD-10-CM Codes Validated', formatted: '97,572' },
  { value: 1198, label: 'RARC Remark Codes', formatted: '1,198' },
  { value: 407, label: 'CARC Adjustment Codes', formatted: '407' },
  { value: 8184, label: 'HCPCS Level II Codes', formatted: '8,184' },
]

function useCountUp(target: number, duration = 1800, triggered = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!triggered) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - (1 - progress) ** 3
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, triggered])

  return count
}

function StatItem({ stat, triggered }: { stat: typeof STATS[0]; triggered: boolean }) {
  const count = useCountUp(stat.value, 1800, triggered)

  const formatted = count.toLocaleString()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 160,
      }}
    >
      <span
        className="count-up"
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(36px, 4vw, 52px)',
          color: '#FFE66D',
          lineHeight: 1,
        }}
      >
        {formatted}
      </span>
      <span
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          color: 'rgba(253,250,244,0.8)',
          textAlign: 'center',
          maxWidth: 140,
        }}
      >
        {stat.label}
      </span>
    </div>
  )
}

function SquiggleDivider() {
  return (
    <svg width="3" height="60" viewBox="0 0 3 60" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M1.5 0 C3 8, 0 16, 1.5 24 C3 32, 0 40, 1.5 48 C3 56, 0 60, 1.5 60"
        stroke="rgba(253,250,244,0.3)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} style={{ position: 'relative', backgroundColor: '#1A1A2E' }}>
      <WaveTop fill="#1A1A2E" />

      <div
        style={{
          padding: '48px clamp(24px, 5vw, 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(16px, 3vw, 40px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 900,
          }}
        >
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <StatItem stat={stat} triggered={inView} />
              {i < STATS.length - 1 && <SquiggleDivider />}
            </React.Fragment>
          ))}
        </div>

        {/* Caption */}
        <p
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            color: 'rgba(253,250,244,0.5)',
            textAlign: 'center',
          }}
        >
          Reference data auto-updated quarterly from CMS, CDC, and X12.org
        </p>
      </div>

      <WaveBottom fill="#1A1A2E" />
    </section>
  )
}
