import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import useAppStore from '../../../store/useAppStore'
import { useTheme } from '../../../theme/ThemeContext'

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

  // Extract from header array: find ISA and GS segments
  const headerArr = data?.header as Array<Record<string, unknown>> | undefined
  const isaSegRaw = headerArr?.find((s) => s.Segment_ID === 'ISA')
  const gsSegRaw = headerArr?.find((s) => s.Segment_ID === 'GS')

  // ISA raw_data: index 9=date, 10=time, 13=control number
  const isaRaw = isaSegRaw?.raw_data as string[] | undefined
  const controlNumber = isaRaw?.[13] ?? '--'
  const isaDate = isaRaw?.[9] ?? '--'
  const isaTime = isaRaw?.[10] ?? '--'

  // GS raw_data: index 6=group control number
  const gsRaw = gsSegRaw?.raw_data as string[] | undefined
  const functionalGroups = gsRaw?.[6] ?? '--'

  // Sender/receiver from metadata
  const senderId = (metadata?.sender_id as string | undefined)?.trim()
  const receiverId = (metadata?.receiver_id as string | undefined)?.trim()

  // Transaction type and description
  const txType = String(metadata?.transaction_type ?? '--')
  const TX_DESC: Record<string, string> = {
    '837': 'Professional Claim',
    '835': 'Payment Remittance',
    '834': 'Benefit Enrollment',
    '820': 'Payment Order',
    '270': 'Eligibility Inquiry',
    '271': 'Eligibility Response',
  }
  const description = TX_DESC[txType] ?? 'EDI Transaction'

  // Claim info: drill into transactions[0].providers[0].subscribers[0].claims[0]
  const transactions = data?.transactions as Array<Record<string, unknown>> | undefined
  const firstTx = transactions?.[0]
  const providers = firstTx?.providers as Array<Record<string, unknown>> | undefined
  const firstProvider = providers?.[0]
  const subscribers = firstProvider?.subscribers as Array<Record<string, unknown>> | undefined
  const firstSubscriber = subscribers?.[0]
  const claimsArr = firstSubscriber?.claims as Array<Record<string, unknown>> | undefined
  const firstClaim = claimsArr?.[0]
  const claimSummary = firstClaim?.summary as Record<string, unknown> | undefined

  const claimAmount = claimSummary?.Amount as string | undefined

  const patientName = (() => {
    const details = firstSubscriber?.details as Array<Record<string, unknown>> | undefined
    const ilNm1 = details?.find((s) => s.Segment_ID === 'NM1' && s.EntityIdentifierCode_01 === 'IL')
    if (ilNm1) {
      const last = ilNm1.ResponseContactLastorOrganizationName_03 as string | undefined
      const first = ilNm1.ResponseContactFirstName_04 as string | undefined
      if (last || first) return [first, last].filter(Boolean).join(' ')
    }
    return undefined
  })()

  const diagCount = claimSummary?.Diagnoses as number | undefined

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
      <Row label="Control Number" value={controlNumber} mono />
      <Row label="Date" value={isaDate} />
      <Row label="Time" value={isaTime} />
      <Row label="Functional Groups" value={functionalGroups} />
      <Row label="Sender ID" value={senderId} mono />
      <Row label="Receiver ID" value={receiverId} mono />
      {claimAmount && <Row label="Claim Amount" value={claimAmount} />}
      {patientName && <Row label="Patient Name" value={patientName} />}
      {diagCount !== undefined && diagCount > 0 && (
        <Row label="Diagnosis Codes" value={`${diagCount} code(s)`} />
      )}
    </div>
  )
}
