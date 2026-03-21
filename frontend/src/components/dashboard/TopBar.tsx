import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'
import { useTheme } from '../../theme/ThemeContext'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/overview': 'Overview',
  '/dashboard/segments': 'Segment Explorer',
  '/dashboard/validation': 'Validation Report',
  '/dashboard/loops': 'Loop Structure',
  '/dashboard/export': 'Export & Reports',
  '/dashboard/ai': 'AI Assistant',
}

export default function TopBar() {
  const location = useLocation()
  const { parseResult, transactionType } = useAppStore()
  const { t } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  const title = PAGE_TITLES[location.pathname] ?? 'Overview'
  const data = parseResult?.data as Record<string, unknown> | undefined
  const metadata = data?.metadata as Record<string, unknown> | undefined
  const validation = data?.validation as Record<string, unknown> | undefined

  const errorCount = (validation?.error_count as number) ?? 0
  const warnCount = (validation?.warning_count as number) ?? 0
  const isValid = errorCount === 0 && warnCount === 0 && validation !== undefined
    ? (validation?.is_valid as boolean ?? true)
    : parseResult === null ? null : errorCount === 0 && warnCount === 0

  const interchangeDate = metadata?.interchange_date as string | undefined
  const txType = (metadata?.transaction_type as string)
    ?? transactionType
    ?? (data?.file_info as Record<string, unknown> | undefined)?.transaction_type as string
    ?? null

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // Removed borderRef use per UI fix 2

  return (
    <div
      ref={containerRef}
      style={{
        height: 64,
        background: t.bg,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >

      <div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 22, color: t.ink, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 400, fontSize: 11, color: t.inkFaint, marginTop: 1 }}>
          EdiFix / {title}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {parseResult !== null && (
          <span style={{
            background: isValid ? (t.mint) : t.coral,
            border: `2px solid ${t.ink}`,
            borderRadius: 999,
            padding: '6px 14px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            color: isValid ? t.ink : 'white',
            boxShadow: `2px 2px 0px ${t.shadow}`,
            whiteSpace: 'nowrap',
          }}>
            {isValid ? '✓ Valid EDI' : '✗ Has Errors'}
          </span>
        )}
        {txType && (
          <span style={{
            background: t.ink,
            color: t.yellow,
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            padding: '6px 14px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}>
            {txType}
          </span>
        )}
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 400,
          fontSize: 12,
          color: t.inkFaint,
          whiteSpace: 'nowrap',
        }}>
          {interchangeDate ?? today}
        </span>
      </div>
    </div>
  )
}
