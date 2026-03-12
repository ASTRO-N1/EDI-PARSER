import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import useAppStore from '../../../store/useAppStore'
import { useTheme } from '../../../theme/ThemeContext'

// Resolve segment ID and elements from any of the 3 backend shapes
function resolveSegment(item: unknown): { id: string; elements: string[] } {
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

function resolveClaimField(claim: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    if (claim[k] !== undefined && claim[k] !== null) return String(claim[k])
  }
  return '--'
}

const MonoPill = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTheme()
  return (
    <span style={{
      background: t.bgHighlight,
      padding: '3px 8px',
      borderRadius: 6,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 12,
      color: t.ink,
      display: 'inline-block',
    }}>
      {children}
    </span>
  )
}

const Row = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => {
  const { t } = useTheme()
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px dashed ${t.borderDash}`,
    }}>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: t.inkMuted }}>{label}</span>
      {mono ? (
        <MonoPill>{value ?? '--'}</MonoPill>
      ) : (
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: t.ink }}>
          {(value as string) ?? '--'}
        </span>
      )}
    </div>
  )
}

export default function ClaimCard() {
  const { parseResult } = useAppStore()
  const { t, isDark } = useTheme()
  const roughRef = useRef<SVGSVGElement>(null)
  const underlineRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const data = parseResult?.data as Record<string, unknown> | undefined
  const metadata = data?.metadata as Record<string, unknown> | undefined
  const fileInfo = data?.file_info as Record<string, unknown> | undefined
  const segments = data?.segments as unknown[] | undefined
  const claims = data?.claims as Record<string, unknown>[] | undefined

  // Find ISA segment in any shape
  const isaRaw = segments?.find(s => resolveSegment(s).id === 'ISA')
  const isa = isaRaw ? resolveSegment(isaRaw) : null
  // ISA element indices (0-based after segment ID stripped):
  // ISA05=el[4], ISA06=el[5], ISA07=el[6], ISA08=el[7]
  const senderId = (metadata?.sender_id ?? metadata?.interchange_sender_id ?? fileInfo?.sender_id ?? isa?.elements[5])?.toString().trim()
  const receiverId = (metadata?.receiver_id ?? metadata?.interchange_receiver_id ?? fileInfo?.receiver_id ?? isa?.elements[7])?.toString().trim()

  const txType = String(metadata?.transaction_type ?? fileInfo?.transaction_type ?? '--')
  const description = String(fileInfo?.transaction_description ?? metadata?.transaction_description ?? 'Professional Claim')

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
        roughness: isDark ? 1.2 : 1.8,
        strokeWidth: isDark ? 1.5 : 2,
        stroke: isDark ? 'rgba(240,235,225,0.35)' : t.roughStroke,
        fill: 'none',
      }))
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(container)
    return () => ro.disconnect()
  }, [isDark, t.roughStroke])

  useEffect(() => {
    if (!underlineRef.current) return
    const svg = underlineRef.current
    svg.innerHTML = ''
    const rc = rough.svg(svg)
    svg.appendChild(rc.line(0, 3, 120, 3, { roughness: 2, strokeWidth: 2.5, stroke: t.teal }))
  }, [t.teal])

  const firstClaim = claims?.[0]
  const diagCodes: string[] = Array.isArray(firstClaim?.diagnosis_codes) ? firstClaim!.diagnosis_codes as string[]
    : Array.isArray(firstClaim?.diagnoses) ? firstClaim!.diagnoses as string[]
    : Array.isArray(firstClaim?.icd_codes) ? firstClaim!.icd_codes as string[]
    : []

  return (
    <div
      ref={containerRef}
      style={{
        background: t.bgCard,
        borderRadius: 14,
        padding: '20px 24px',
        boxShadow: `4px 4px 0px ${t.shadow}`,
        position: 'relative',
        height: '100%',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease',
      }}
    >
      <svg ref={roughRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 16, color: t.ink }}>
          📋 Claim Details
        </div>
        <svg ref={underlineRef} width={130} height={8} style={{ display: 'block', marginTop: 2 }} />
      </div>

      <Row label="Transaction Type" value={txType} mono />
      <Row label="Description" value={description} />
      <Row label="Control Number" value={metadata?.interchange_control_number?.toString()} mono />
      <Row label="Date" value={metadata?.interchange_date?.toString()} />
      <Row label="Time" value={metadata?.interchange_time?.toString()} />
      <Row label="Functional Groups" value={metadata?.functional_group_count?.toString()} />
      <Row label="Sender ID" value={senderId} mono />
      <Row label="Receiver ID" value={receiverId} mono />

      {firstClaim && (
        <>
          <Row label="Claim Amount" value={`$${resolveClaimField(firstClaim, 'total_charge_amount', 'charge_amount', 'amount')}`} />
          <Row label="Patient Name" value={resolveClaimField(firstClaim, 'patient_name', 'patient.name', 'subscriber_name')} />
          {diagCodes.length > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
            }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: t.inkMuted }}>Diagnosis Codes</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                {diagCodes.map((code, i) => <MonoPill key={i}>{code}</MonoPill>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
