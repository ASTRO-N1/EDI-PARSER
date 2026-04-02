import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore'

// ── API URL helper ─────────────────────────────────────────────────────────────
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://edi-parser-production.up.railway.app'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ValidationError {
  element?: string
  field?: string
  message?: string
  msg?: string
  code?: string
  type?: 'error' | 'warning'
}

// ── EDI data accessor helpers ─────────────────────────────────────────────────
// Tries multiple common key name patterns to be resilient to different parsers

function getLoop(data: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  for (const key of keys) {
    const val = data[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return val as Record<string, unknown>
    }
  }
  return null
}

function getLoopArray(data: Record<string, unknown>, ...keys: string[]): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return []
  for (const key of keys) {
    const val = data[key]
    if (Array.isArray(val)) return val as Record<string, unknown>[]
    if (val && typeof val === 'object' && !Array.isArray(val)) return [val as Record<string, unknown>]
  }
  return []
}

function getStr(obj: Record<string, unknown> | null, ...keys: string[]): string {
  if (!obj) return ''
  for (const key of keys) {
    const val = obj[key]
    if (val != null && val !== '') return String(val)
  }
  return ''
}

// ── Validation helpers ─────────────────────────────────────────────────────────

function getErrors(errors: ValidationError[], ...elementKeys: string[]): ValidationError[] {
  return errors.filter((e) => {
    const el = (e.element ?? e.field ?? '').toUpperCase()
    return elementKeys.some((k) => el.includes(k.toUpperCase()))
  })
}

// ── Shared styled input ────────────────────────────────────────────────────────

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  errors?: ValidationError[]
  isActive?: boolean
  mono?: boolean
  hint?: string        // kept for call-site compatibility; no longer shown as placeholder
  onAskAI?: () => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

// hint is accepted but intentionally not rendered as a placeholder (Fix 2)
function FormField({ id, label, value, onChange, errors = [], isActive, mono, onAskAI, inputRef }: FieldProps) {
  const hasError = errors.length > 0
  const errorMsg = errors[0]?.message ?? errors[0]?.msg ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label
          htmlFor={id}
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            color: hasError ? '#FF6B6B' : 'rgba(26,26,46,0.6)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {label}
        </label>
        {hasError && (
          <span
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 9,
              fontWeight: 800,
              color: '#FF6B6B',
              background: 'rgba(255,107,107,0.1)',
              border: '1.5px solid #FF6B6B',
              borderRadius: 4,
              padding: '1px 6px',
              letterSpacing: '0.04em',
            }}
          >
            ⚠ ERROR
          </span>
        )}
        {onAskAI && (
          <button
            type="button"
            onClick={onAskAI}
            className="btn-sticker"
            style={{
              marginLeft: 'auto',
              padding: '2px 10px',
              fontSize: 10,
              background: '#FFE66D',
              border: '1.5px solid #1A1A2E',
              borderRadius: 6,
              boxShadow: '2px 2px 0px #1A1A2E',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              color: '#1A1A2E',
              transition: 'all 0.15s ease',
              transform: 'rotate(-0.5deg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(0.5deg) translateY(-1px)'
              e.currentTarget.style.boxShadow = '3px 3px 0px #1A1A2E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(-0.5deg)'
              e.currentTarget.style.boxShadow = '2px 2px 0px #1A1A2E'
            }}
          >
            ✦ Ask AI to Fix
          </button>
        )}
      </div>

      <input
        id={id}
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        style={{
          width: '100%',
          padding: '9px 13px',
          fontFamily: mono ? 'JetBrains Mono, monospace' : 'Nunito, sans-serif',
          fontSize: mono ? 12 : 13,
          color: '#1A1A2E',
          background: hasError ? 'rgba(255,107,107,0.04)' : '#FFFFFF',
          border: hasError
            ? '2px dashed #FF6B6B'
            : isActive
            ? '2px solid #4ECDC4'
            : '2px solid rgba(26,26,46,0.18)',
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          boxShadow: hasError
            ? '3px 3px 0px rgba(255,107,107,0.3)'
            : isActive
            ? '0 0 0 3px rgba(78,205,196,0.2), 3px 3px 0px #4ECDC4'
            : '2px 2px 0px rgba(26,26,46,0.08)',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          if (!hasError && !isActive) {
            e.currentTarget.style.borderColor = '#4ECDC4'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.15), 2px 2px 0px #4ECDC4'
          }
        }}
        onBlur={(e) => {
          if (!hasError && !isActive) {
            e.currentTarget.style.borderColor = 'rgba(26,26,46,0.18)'
            e.currentTarget.style.boxShadow = '2px 2px 0px rgba(26,26,46,0.08)'
          }
        }}
      />

      {hasError && errorMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: 11,
            color: '#FF6B6B',
            fontWeight: 600,
            lineHeight: 1.4,
            paddingLeft: 2,
          }}
        >
          {errorMsg}
        </motion.p>
      )}
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, icon, rotate = 0 }: { title: string; icon: string; rotate?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'left center',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <h2
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 900,
            fontSize: 14,
            color: '#1A1A2E',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div
          style={{
            height: 3,
            width: '100%',
            background: 'linear-gradient(90deg, #4ECDC4, transparent)',
            borderRadius: 999,
            marginTop: 3,
          }}
        />
      </div>
    </div>
  )
}

// ── Form Section Card ─────────────────────────────────────────────────────────

function SectionCard({
  children,
  sectionRef,
  isHighlighted,
}: {
  children: React.ReactNode
  sectionRef?: React.RefObject<HTMLDivElement | null>
  isHighlighted?: boolean
}) {
  return (
    <motion.div
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      animate={
        isHighlighted
          ? { boxShadow: ['4px 4px 0px #4ECDC4', '6px 6px 0px #4ECDC4', '4px 4px 0px #4ECDC4'] }
          : { boxShadow: '4px 4px 0px #1A1A2E' }
      }
      transition={{ duration: 0.6, repeat: isHighlighted ? 2 : 0 }}
      style={{
        background: '#FFFFFF',
        border: isHighlighted ? '2px solid #4ECDC4' : '2px solid #1A1A2E',
        borderRadius: 12,
        padding: '24px 24px 28px',
        position: 'relative',
        transition: 'border-color 0.3s',
      }}
    >
      {children}
    </motion.div>
  )
}

// ── 2-column responsive grid ───────────────────────────────────────────────────

function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '16px 20px',
      }}
      className="form-field-grid"
    >
      {children}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function FormEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 20,
        padding: 40,
      }}
    >
      <div
        style={{
          padding: '44px 60px',
          border: '2.5px dashed rgba(26,26,46,0.2)',
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          background: '#FFFFFF',
          boxShadow: '4px 4px 0px rgba(26,26,46,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          maxWidth: 440,
          textAlign: 'center',
        }}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <rect x="6" y="6" width="40" height="40" rx="6" stroke="rgba(26,26,46,0.2)" strokeWidth="2" strokeDasharray="5 4" />
          <path d="M16 26h20M26 16v20" stroke="rgba(26,26,46,0.3)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="38" cy="14" r="5" fill="#FFE66D" stroke="#1A1A2E" strokeWidth="1.5" />
          <path d="M36 14h4M38 12v4" stroke="#1A1A2E" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 16,
              color: '#1A1A2E',
              marginBottom: 8,
            }}
          >
            No parsed data found.
          </p>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'rgba(26,26,46,0.45)',
              lineHeight: 1.6,
            }}
          >
            Upload a file to begin editing your claim.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── PATH → SECTION mapping ─────────────────────────────────────────────────────

const PATH_TO_SECTION: Array<[RegExp, string]> = [
  [/1000[AB]/i, 'submitter'],
  [/submitter|receiver/i, 'submitter'],
  [/2010AA|billing_provider|billingProvider/i, 'billing'],
  [/2010BA|subscriber/i, 'subscriber'],
  [/2300|claim/i, 'claim'],
  [/2400|service_line|serviceLine/i, 'service'],
]

function resolveSection(path: string | null): string | null {
  if (!path) return null
  for (const [pattern, section] of PATH_TO_SECTION) {
    if (pattern.test(path)) return section
  }
  return null
}

// ── Main FormEditorView ────────────────────────────────────────────────────────

export default function FormEditorView() {
  const parseResult        = useAppStore((s) => s.parseResult)
  const setParseResult     = useAppStore((s) => s.setParseResult)
  const selectedPath       = useAppStore((s) => s.selectedPath)
  const setIsAIPanelOpen   = useAppStore((s) => s.setIsAIPanelOpen)
  const setAiPromptContext  = useAppStore((s) => s.setAiPromptContext)
  const focusFieldId       = useAppStore((s) => s.focusFieldId)
  const setFocusFieldId    = useAppStore((s) => s.setFocusFieldId)
  const isSubmitting       = useAppStore((s) => s.isSubmitting)
  const setIsSubmitting    = useAppStore((s) => s.setIsSubmitting)
  const rawFile            = useAppStore((s) => s.file)

  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Section refs for scrollIntoView
  const sectionRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({
    submitter: { current: null },
    billing:   { current: null },
    subscriber:{ current: null },
    claim:     { current: null },
    service:   { current: null },
  })

  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  const [activeFieldPath, setActiveFieldPath]       = useState<string | null>(null)

  // ── Inbound sync: selectedPath → scroll form section + highlight ──────────
  useEffect(() => {
    if (!selectedPath) return
    const section = resolveSection(selectedPath)
    if (!section) return
    const ref = sectionRefs.current[section]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setHighlightedSection(section)
      setActiveFieldPath(selectedPath)
      const timer = setTimeout(() => {
        setHighlightedSection(null)
        setActiveFieldPath(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [selectedPath])

  // ── Fix 6b: focusFieldId → scroll to input + focus it ────────────────────
  useEffect(() => {
    if (!focusFieldId) return
    const timer = setTimeout(() => {
      const el = document.getElementById(focusFieldId) as HTMLInputElement | null
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      el.focus()
      setFocusFieldId(null)
    }, 120)
    return () => clearTimeout(timer)
  }, [focusFieldId, setFocusFieldId])

  // ── Fix 3b: Commit Changes — re-POST raw file to /api/v1/parse ───────────
  const handleCommit = useCallback(async () => {
    if (!rawFile || isSubmitting) return
    setIsSubmitting(true)
    setSubmitSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', rawFile)
      const res = await fetch(`${API_URL}/api/v1/parse`, {
        method: 'POST',
        headers: { 'X-Internal-Bypass': 'frontend-ui-secret' },
        body: formData,
      })
      if (!res.ok) throw new Error('Re-parse failed')
      const result = await res.json()
      setParseResult(result)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 2500)
    } catch (err) {
      console.error('[Commit]', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [rawFile, isSubmitting, setIsSubmitting, setParseResult])

  // Outbound edit helper — deep-set a value in parseResult
  const handleFieldChange = useCallback(
    (keyPath: string[], value: string) => {
      if (!parseResult) return
      const updated = structuredClone(parseResult) as Record<string, unknown>
      let obj: Record<string, unknown> = updated
      for (let i = 0; i < keyPath.length - 1; i++) {
        if (obj[keyPath[i]] == null) obj[keyPath[i]] = {}
        obj = obj[keyPath[i]] as Record<string, unknown>
      }
      obj[keyPath[keyPath.length - 1]] = value
      setParseResult(updated)
    },
    [parseResult, setParseResult]
  )

  const askAI = useCallback(
    (context: string) => {
      setAiPromptContext(context)
      setIsAIPanelOpen(true)
    },
    [setAiPromptContext, setIsAIPanelOpen]
  )

  if (!parseResult) return <FormEmptyState />

  // ── Parse the result into form section data ────────────────────────────────
  const data = parseResult as Record<string, unknown>
  const errors: ValidationError[] = (
    (data.validation_errors ?? data.errors ?? []) as ValidationError[]
  )

  // Loop 1000A / 1000B — Submitter & Receiver
  const loop1000A = getLoop(data, 'loop_1000A', '1000A', 'submitter', 'submitter_info')
  const loop1000B = getLoop(data, 'loop_1000B', '1000B', 'receiver', 'receiver_info')
  const nm1_1000A = getLoop(loop1000A ?? {}, 'NM1', 'nm1') ?? loop1000A
  const nm1_1000B = getLoop(loop1000B ?? {}, 'NM1', 'nm1') ?? loop1000B

  // Loop 2010AA — Billing Provider
  const loop2010AA = getLoop(
    data,
    'loop_2010AA', '2010AA', 'billing_provider', 'billingProvider',
    ...(getLoop(data, 'loop_2000A', '2000A') ? ['loop_2000A', '2000A'] : [])
  ) ?? getLoop(getLoop(data, 'loop_2000A', '2000A') ?? {}, 'loop_2010AA', '2010AA', 'billing_provider') ?? null
  const nm1_2010AA = getLoop(loop2010AA ?? {}, 'NM1', 'nm1') ?? loop2010AA
  const n3_billing  = getLoop(loop2010AA ?? {}, 'N3', 'n3')
  const n4_billing  = getLoop(loop2010AA ?? {}, 'N4', 'n4')

  // Loop 2010BA — Subscriber
  const loop2000B = getLoop(data, 'loop_2000B', '2000B', 'subscriber_hl', 'subscriber_hierarchical_level')
  const loop2010BA = getLoop(loop2000B ?? data, 'loop_2010BA', '2010BA', 'subscriber', 'subscriber_info')
  const nm1_sub = getLoop(loop2010BA ?? {}, 'NM1', 'nm1') ?? loop2010BA
  const dmg_sub = getLoop(loop2010BA ?? {}, 'DMG', 'dmg')

  // Loop 2300 — Claim Info (could be array)
  const claims = getLoopArray(loop2000B ?? data, 'loop_2300', '2300', 'claims', 'claim_info')
  const claim0 = claims[0] ?? {}
  const clmSeg = getLoop(claim0, 'CLM', 'clm') ?? claim0
  const hiSeg  = getLoop(claim0, 'HI', 'hi')
  const dtpSeg = getLoop(claim0, 'DTP', 'dtp')

  // Loop 2400 — Service Lines (array)
  const serviceLines = getLoopArray(claim0, 'loop_2400', '2400', 'service_lines', 'serviceLines')

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Responsive grid style injected as a style tag */}
      <style>{`
        @media (max-width: 640px) {
          .form-field-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .form-editor-scroll::-webkit-scrollbar { width: 6px; }
        .form-editor-scroll::-webkit-scrollbar-thumb { background: rgba(78,205,196,0.35); border-radius: 3px; }
        .form-editor-scroll::-webkit-scrollbar-track { background: transparent; }
        .form-editor-scroll::-webkit-scrollbar-thumb:hover { background: rgba(78,205,196,0.6); }
      `}</style>

      <div
        className="form-editor-scroll"
        style={{
          height: '100%',
          overflowY: 'auto',
          padding: '0 0 40px',
          background: '#FDFAF4',
        }}
      >
        {/* Page Header */}
        <div
          style={{
            padding: '20px 28px 16px',
            borderBottom: '2px solid rgba(26,26,46,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 2px 0px rgba(26,26,46,0.06)',
          }}
        >
          <div
            style={{
              background: '#4ECDC4',
              border: '2px solid #1A1A2E',
              borderRadius: 8,
              padding: '5px 10px',
              boxShadow: '3px 3px 0px #1A1A2E',
              transform: 'rotate(-0.5deg)',
            }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 11, color: '#1A1A2E' }}>
              837P
            </span>
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 900,
                fontSize: 16,
                color: '#1A1A2E',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Professional Claim Editor
            </h1>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'rgba(26,26,46,0.45)', margin: 0 }}>
              Click any field to edit · Changes sync in real time
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {errors.length > 0 && (
              <span
                style={{
                  background: 'rgba(255,107,107,0.1)',
                  border: '1.5px solid #FF6B6B',
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 800,
                  fontSize: 11,
                  color: '#FF6B6B',
                }}
              >
                🔴 {errors.filter((e) => e.type === 'error' || !e.type).length} error
                {errors.filter((e) => e.type === 'error' || !e.type).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '28px 28px 0', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ── Section 1: Submitter & Receiver ── */}
          <AnimatePresence>
            <motion.div
              key="submitter"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SectionCard
                sectionRef={sectionRefs.current.submitter as React.RefObject<HTMLDivElement | null>}
                isHighlighted={highlightedSection === 'submitter'}
              >
                <SectionHeader title="Submitter & Receiver" icon="📤" rotate={-0.4} />
                <FieldGrid cols={2}>
                  <FormField
                    id="submitter-name"
                    label="Submitter Name"
                    value={getStr(nm1_1000A, 'NM103', 'name', 'submitter_name', 'NM1_03')}
                    onChange={(v) => handleFieldChange(['loop_1000A', 'NM1', 'NM103'], v)}
                    errors={getErrors(errors, 'NM103', 'NM1_03')}
                    isActive={activeFieldPath?.includes('1000A')}
                    hint="ACME Billing Inc."
                  />
                  <FormField
                    id="submitter-id"
                    label="Submitter ID"
                    value={getStr(nm1_1000A, 'NM109', 'id', 'submitter_id', 'NM1_09')}
                    onChange={(v) => handleFieldChange(['loop_1000A', 'NM1', 'NM109'], v)}
                    errors={getErrors(errors, 'NM109')}
                    mono
                    hint="123456789"
                  />
                  <FormField
                    id="receiver-name"
                    label="Receiver Name"
                    value={getStr(nm1_1000B, 'NM103', 'name', 'receiver_name', 'NM1_03')}
                    onChange={(v) => handleFieldChange(['loop_1000B', 'NM1', 'NM103'], v)}
                    errors={getErrors(errors, 'NM103')}
                    hint="BCBS Clearinghouse"
                  />
                  <FormField
                    id="receiver-id"
                    label="Receiver ID"
                    value={getStr(nm1_1000B, 'NM109', 'id', 'receiver_id')}
                    onChange={(v) => handleFieldChange(['loop_1000B', 'NM1', 'NM109'], v)}
                    errors={getErrors(errors, 'NM109')}
                    mono
                    hint="987654321"
                  />
                </FieldGrid>
                <div style={{ position: 'absolute', bottom: 10, right: 14 }} className="corner-tag">
                  Loop 1000A/B
                </div>
              </SectionCard>
            </motion.div>
          </AnimatePresence>

          {/* ── Section 2: Billing Provider ── */}
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <SectionCard
              sectionRef={sectionRefs.current.billing as React.RefObject<HTMLDivElement | null>}
              isHighlighted={highlightedSection === 'billing'}
            >
              <SectionHeader title="Billing Provider" icon="🏥" rotate={0.3} />
              <FieldGrid cols={2}>
                <FormField
                  id="billing-name"
                  label="Provider Name"
                  value={getStr(nm1_2010AA, 'NM103', 'name', 'provider_name', 'NM1_03')}
                  onChange={(v) => handleFieldChange(['loop_2010AA', 'NM1', 'NM103'], v)}
                  errors={getErrors(errors, 'NM103')}
                  isActive={activeFieldPath?.includes('2010AA')}
                  hint="Metro Medical Group"
                />
                <FormField
                  id="billing-npi"
                  label="NPI (National Provider ID)"
                  value={getStr(nm1_2010AA, 'NM109', 'npi', 'NPI', 'NM1_09')}
                  onChange={(v) => handleFieldChange(['loop_2010AA', 'NM1', 'NM109'], v)}
                  errors={getErrors(errors, 'NM109', 'NPI', 'InvalidNPI')}
                  isActive={activeFieldPath?.includes('2010AA')}
                  mono
                  hint="1234567890"
                  onAskAI={() => askAI('The Billing Provider NPI (NM109 in Loop 2010AA) appears to be invalid. A valid NPI is exactly 10 digits. Can you validate and suggest a fix?')}
                />
                <FormField
                  id="billing-address"
                  label="Address"
                  value={getStr(n3_billing, 'N301', 'address', 'address_line')}
                  onChange={(v) => handleFieldChange(['loop_2010AA', 'N3', 'N301'], v)}
                  errors={getErrors(errors, 'N301')}
                  hint="123 Main St"
                />
                <FormField
                  id="billing-taxid"
                  label="Tax ID / EIN"
                  value={getStr(nm1_2010AA, 'REF02', 'tax_id', 'ein', 'REF_02')}
                  onChange={(v) => handleFieldChange(['loop_2010AA', 'REF', 'REF02'], v)}
                  errors={getErrors(errors, 'REF02', 'TaxID')}
                  mono
                  hint="XX-XXXXXXX"
                />
                <FormField
                  id="billing-city"
                  label="City"
                  value={getStr(n4_billing, 'N401', 'city')}
                  onChange={(v) => handleFieldChange(['loop_2010AA', 'N4', 'N401'], v)}
                  errors={getErrors(errors, 'N401')}
                  hint="Chicago"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                  <FormField
                    id="billing-state"
                    label="State"
                    value={getStr(n4_billing, 'N402', 'state')}
                    onChange={(v) => handleFieldChange(['loop_2010AA', 'N4', 'N402'], v)}
                    errors={getErrors(errors, 'N402')}
                    hint="IL"
                  />
                  <FormField
                    id="billing-zip"
                    label="ZIP"
                    value={getStr(n4_billing, 'N403', 'zip', 'postal_code')}
                    onChange={(v) => handleFieldChange(['loop_2010AA', 'N4', 'N403'], v)}
                    errors={getErrors(errors, 'N403')}
                    mono
                    hint="60601"
                  />
                </div>
              </FieldGrid>
              <div style={{ position: 'absolute', bottom: 10, right: 14 }} className="corner-tag">
                Loop 2010AA
              </div>
            </SectionCard>
          </motion.div>

          {/* ── Section 3: Subscriber ── */}
          <motion.div
            key="subscriber"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <SectionCard
              sectionRef={sectionRefs.current.subscriber as React.RefObject<HTMLDivElement | null>}
              isHighlighted={highlightedSection === 'subscriber'}
            >
              <SectionHeader title="Subscriber / Patient" icon="👤" rotate={-0.3} />
              <FieldGrid cols={2}>
                <FormField
                  id="sub-member-id"
                  label="Member ID"
                  value={getStr(nm1_sub, 'NM109', 'member_id', 'MemberID', 'NM1_09')}
                  onChange={(v) => handleFieldChange(['loop_2010BA', 'NM1', 'NM109'], v)}
                  errors={getErrors(errors, 'NM109')}
                  isActive={activeFieldPath?.includes('2010BA')}
                  mono
                  hint="A123456789"
                />
                <FormField
                  id="sub-last-name"
                  label="Last Name"
                  value={getStr(nm1_sub, 'NM103', 'last_name', 'NM1_03')}
                  onChange={(v) => handleFieldChange(['loop_2010BA', 'NM1', 'NM103'], v)}
                  errors={getErrors(errors, 'NM103')}
                  hint="Smith"
                />
                <FormField
                  id="sub-first-name"
                  label="First Name"
                  value={getStr(nm1_sub, 'NM104', 'first_name', 'NM1_04')}
                  onChange={(v) => handleFieldChange(['loop_2010BA', 'NM1', 'NM104'], v)}
                  errors={getErrors(errors, 'NM104')}
                  hint="Jane"
                />
                <FormField
                  id="sub-dob"
                  label="Date of Birth"
                  value={getStr(dmg_sub, 'DMG02', 'dob', 'birth_date')}
                  onChange={(v) => handleFieldChange(['loop_2010BA', 'DMG', 'DMG02'], v)}
                  errors={getErrors(errors, 'DMG02', 'DOB')}
                  mono
                  hint="YYYYMMDD"
                />
                <FormField
                  id="sub-gender"
                  label="Gender Code"
                  value={getStr(dmg_sub, 'DMG03', 'gender', 'sex')}
                  onChange={(v) => handleFieldChange(['loop_2010BA', 'DMG', 'DMG03'], v)}
                  errors={getErrors(errors, 'DMG03')}
                  hint="M / F / U"
                />
                <FormField
                  id="sub-plan"
                  label="Insurance Plan Name"
                  value={getStr(loop2010BA, 'plan_name', 'insurance_plan', 'INS03')}
                  onChange={(v) => handleFieldChange(['loop_2010BA', 'plan_name'], v)}
                  errors={getErrors(errors, 'INS03', 'plan_name')}
                  hint="BlueCross PPO"
                />
              </FieldGrid>
              <div style={{ position: 'absolute', bottom: 10, right: 14 }} className="corner-tag">
                Loop 2010BA
              </div>
            </SectionCard>
          </motion.div>

          {/* ── Section 4: Claim Information ── */}
          <motion.div
            key="claim"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <SectionCard
              sectionRef={sectionRefs.current.claim as React.RefObject<HTMLDivElement | null>}
              isHighlighted={highlightedSection === 'claim'}
            >
              <SectionHeader title="Claim Information" icon="📋" rotate={0.4} />
              <FieldGrid cols={2}>
                <FormField
                  id="clm-id"
                  label="Patient Control Number"
                  value={getStr(clmSeg, 'CLM01', 'claim_id', 'control_number', 'CLM_01')}
                  onChange={(v) => handleFieldChange(['loop_2300', 'CLM', 'CLM01'], v)}
                  errors={getErrors(errors, 'CLM01')}
                  isActive={activeFieldPath?.includes('2300')}
                  mono
                  hint="CLM-2024-001"
                />
                <FormField
                  id="clm-amount"
                  label="Total Charge Amount ($)"
                  value={getStr(clmSeg, 'CLM02', 'total_charge', 'amount', 'CLM_02')}
                  onChange={(v) => handleFieldChange(['loop_2300', 'CLM', 'CLM02'], v)}
                  errors={getErrors(errors, 'CLM02', 'AmountMismatch')}
                  mono
                  hint="1500.00"
                />
                <FormField
                  id="clm-service-date"
                  label="Service Date"
                  value={getStr(dtpSeg, 'DTP03', 'service_date', 'date')}
                  onChange={(v) => handleFieldChange(['loop_2300', 'DTP', 'DTP03'], v)}
                  errors={getErrors(errors, 'DTP03')}
                  mono
                  hint="YYYYMMDD"
                />
                <FormField
                  id="clm-facility"
                  label="Facility Code"
                  value={getStr(clmSeg, 'CLM05_1', 'facility_code', 'place_of_service')}
                  onChange={(v) => handleFieldChange(['loop_2300', 'CLM', 'CLM05_1'], v)}
                  errors={getErrors(errors, 'CLM05')}
                  mono
                  hint="11 (Office)"
                />
              </FieldGrid>

              {/* ICD-10 Diagnosis Codes */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px dashed rgba(26,26,46,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: 'rgba(26,26,46,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Diagnosis Codes (ICD-10)
                  </span>
                  <button
                    type="button"
                    onClick={() => askAI('Please validate the ICD-10-CM diagnosis codes in Loop 2300 (HI segment). Check for correct format (letter followed by alphanumerics, with a decimal in the right place) and flag any unknown or discontinued codes.')}
                    style={{
                      padding: '2px 10px',
                      fontSize: 10,
                      background: '#FFE66D',
                      border: '1.5px solid #1A1A2E',
                      borderRadius: 6,
                      boxShadow: '2px 2px 0px #1A1A2E',
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 800,
                      color: '#1A1A2E',
                      transform: 'rotate(-0.5deg)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'rotate(0.5deg) translateY(-1px)'
                      e.currentTarget.style.boxShadow = '3px 3px 0px #1A1A2E'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'rotate(-0.5deg)'
                      e.currentTarget.style.boxShadow = '2px 2px 0px #1A1A2E'
                    }}
                  >
                    ✦ Ask AI to Fix
                  </button>
                </div>
                <FieldGrid cols={3}>
                  {['HI01_2', 'HI02_2', 'HI03_2', 'HI04_2', 'HI05_2', 'HI06_2'].map((key, i) => {
                    const codeVal = getStr(hiSeg, key, `code_${i + 1}`, i === 0 ? 'primary_dx' : `dx_${i + 1}`)
                    return (
                      <FormField
                        key={key}
                        id={`dx-code-${i + 1}`}
                        label={`Dx Code ${i + 1}${i === 0 ? ' (Primary)' : ''}`}
                        value={codeVal}
                        onChange={(v) => handleFieldChange(['loop_2300', 'HI', key], v)}
                        errors={getErrors(errors, key, 'HI0', 'ICD')}
                        isActive={activeFieldPath?.includes('2300')}
                        mono
                        hint="J18.9"
                      />
                    )
                  })}
                </FieldGrid>
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 14 }} className="corner-tag">
                Loop 2300
              </div>
            </SectionCard>
          </motion.div>

          {/* ── Section 5: Service Lines ── */}
          <motion.div
            key="service"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <div
              ref={sectionRefs.current.service as React.RefObject<HTMLDivElement>}
              style={{
                background: '#FFFFFF',
                border: highlightedSection === 'service' ? '2px solid #4ECDC4' : '2px solid #1A1A2E',
                borderRadius: 12,
                boxShadow: highlightedSection === 'service' ? '4px 4px 0px #4ECDC4' : '4px 4px 0px #1A1A2E',
                padding: '24px 24px 28px',
                position: 'relative',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
            >
              <SectionHeader title="Service Line Items" icon="💊" rotate={-0.4} />

              {serviceLines.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    border: '1.5px dashed rgba(26,26,46,0.2)',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: 13,
                    color: 'rgba(26,26,46,0.4)',
                    fontStyle: 'italic',
                  }}
                >
                  No service lines found in Loop 2400.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {serviceLines.map((line, idx) => {
                    const sv1 = getLoop(line, 'SV1', 'sv1') ?? line
                    const dtpLine = getLoop(line, 'DTP', 'dtp')
                    const isLineActive = activeFieldPath?.includes(`2400[${idx}]`) || activeFieldPath?.includes('2400')

                    return (
                      <div
                        key={idx}
                        style={{
                          border: `1.5px solid ${isLineActive ? '#4ECDC4' : 'rgba(26,26,46,0.1)'}`,
                          borderRadius: 10,
                          padding: '16px 18px',
                          background: idx % 2 === 0 ? '#FDFAF4' : '#FFFFFF',
                          position: 'relative',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        {/* Line number badge */}
                        <span
                          style={{
                            position: 'absolute',
                            top: -10,
                            left: 14,
                            background: '#1A1A2E',
                            color: '#FDFAF4',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 8px',
                            borderRadius: 4,
                            boxShadow: '1px 1px 0px rgba(26,26,46,0.3)',
                          }}
                        >
                          Line {idx + 1}
                        </span>

                        <FieldGrid cols={3}>
                          <FormField
                            id={`svc-${idx}-proc`}
                            label="Procedure Code"
                            value={getStr(sv1, 'SV101', 'procedure_code', 'SV1_01')}
                            onChange={(v) => handleFieldChange([`loop_2400[${idx}]`, 'SV1', 'SV101'], v)}
                            errors={getErrors(errors, 'SV101')}
                            isActive={isLineActive}
                            mono
                            hint="HC:99213"
                          />
                          <FormField
                            id={`svc-${idx}-amount`}
                            label="Charge ($)"
                            value={getStr(sv1, 'SV102', 'charge', 'amount', 'SV1_02')}
                            onChange={(v) => handleFieldChange([`loop_2400[${idx}]`, 'SV1', 'SV102'], v)}
                            errors={getErrors(errors, 'SV102')}
                            mono
                            hint="150.00"
                          />
                          <FormField
                            id={`svc-${idx}-units`}
                            label="Units"
                            value={getStr(sv1, 'SV104', 'units', 'SV1_04')}
                            onChange={(v) => handleFieldChange([`loop_2400[${idx}]`, 'SV1', 'SV104'], v)}
                            errors={getErrors(errors, 'SV104')}
                            mono
                            hint="1"
                          />
                          <FormField
                            id={`svc-${idx}-modifier`}
                            label="Modifier"
                            value={getStr(sv1, 'SV101_2', 'modifier', 'SV1_01_2')}
                            onChange={(v) => handleFieldChange([`loop_2400[${idx}]`, 'SV1', 'SV101_2'], v)}
                            errors={getErrors(errors, 'modifier')}
                            mono
                            hint="25"
                          />
                          <FormField
                            id={`svc-${idx}-date`}
                            label="Service Date"
                            value={getStr(dtpLine, 'DTP03', 'service_date', 'date')}
                            onChange={(v) => handleFieldChange([`loop_2400[${idx}]`, 'DTP', 'DTP03'], v)}
                            errors={getErrors(errors, 'DTP03')}
                            mono
                            hint="YYYYMMDD"
                          />
                          <FormField
                            id={`svc-${idx}-diagptr`}
                            label="Diagnosis Pointer"
                            value={getStr(sv1, 'SV107', 'diagnosis_pointer', 'SV1_07')}
                            onChange={(v) => handleFieldChange([`loop_2400[${idx}]`, 'SV1', 'SV107'], v)}
                            errors={getErrors(errors, 'SV107')}
                            mono
                            hint="1"
                          />
                        </FieldGrid>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ position: 'absolute', bottom: 10, right: 14 }} className="corner-tag">
                Loop 2400
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Sticky Commit Bar ─────────────────────────────────────────── */}
        <div
          style={{
            position: 'sticky',
            bottom: -50,
            zIndex: 20,
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <button
            id="commit-changes-btn"
            onClick={handleCommit}
            disabled={!rawFile || isSubmitting}
            title={!rawFile ? 'No raw file available — commit is disabled for sample or direct loads' : 'Re-validate and save changes'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              background: (!rawFile || isSubmitting) ? 'rgba(26,26,46,0.08)' : submitSuccess ? '#4ECDC4' : '#1A1A2E',
              color: (!rawFile || isSubmitting) ? 'rgba(26,26,46,0.35)' : '#FDFAF4',
              border: '2px solid rgba(26,26,46,0.2)',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              boxShadow: (!rawFile || isSubmitting) ? 'none' : submitSuccess ? '3px 3px 0px rgba(78,205,196,0.4)' : '3px 3px 0px #1A1A2E',
              cursor: (!rawFile || isSubmitting) ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              transition: 'all 0.2s ease',
              opacity: (!rawFile || isSubmitting) ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (rawFile && !isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '5px 5px 0px #1A1A2E'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = (!rawFile || isSubmitting) ? 'none' : '3px 3px 0px #1A1A2E'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="doodle-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Saving…
              </>
            ) : submitSuccess ? (
              <>
                ✅ Saved!
              </>
            ) : (
              <>
                🔄 Commit Changes
              </>
            )}
          </button>

          {!rawFile && (
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 11,
              color: 'rgba(26,26,46,0.4)',
              fontStyle: 'italic',
            }}>
              Commit is disabled — sample file or no raw file in session
            </span>
          )}

          {submitSuccess && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: 12,
                color: '#4ECDC4',
                fontWeight: 700,
              }}
            >
              Re-validation complete ✓
            </motion.span>
          )}
        </div>
      </div>
    </>
  )
}
