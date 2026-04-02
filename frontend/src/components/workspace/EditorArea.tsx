import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { UploadCloud } from 'lucide-react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import CenterTabBar from './CenterTabBar'
import FormEditorView from './FormEditorView'

// ── Skeleton placeholder helpers ─────────────────────────────────────────────
function SkeletonLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width,
      height,
      background: 'rgba(26,26,46,0.07)',
      borderRadius: 6,
      flexShrink: 0,
    }} />
  )
}

// ── Tab content placeholders ─────────────────────────────────────────────────
// FormViewContent replaced by <FormEditorView /> which reads live parseResult

function RawEDIContent() {
  const lines = [
    'ISA*00*          *00*          *ZZ*SENDER001      *ZZ*RECEIVER001    *230115*1200*^*00501*000000001*0*P*:~',
    'GS*HC*SENDER001*RECEIVER001*20230115*1200*1*X*005010X222A1~',
    'ST*837*0001*005010X222A1~',
    'BPR*...',
    'NM1*41*2*ACME BILLING*****46*123456789~',
    'CLM*CLM001*1500.00***11:B:1*Y*A*Y*I~',
    'HI*ABK:J18.9~',
    'SV1*HC:99213*150.00*UN*1***1~',
    'SE*...',
  ]
  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }} className="custom-scrollbar">
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'rgba(26,26,46,0.4)', fontStyle: 'italic', marginBottom: 12 }}>
        Raw EDI — Scroll the raw X12 text. Upload a file to see real segments.
      </p>
      <div style={{
        background: '#1A1A2E',
        border: '2.5px solid #1A1A2E',
        borderRadius: 10,
        padding: '16px 20px',
        boxShadow: '4px 4px 0px rgba(26,26,46,0.3)',
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(78,205,196,0.4)', minWidth: 20, userSelect: 'none' }}>{i + 1}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4ECDC4', wordBreak: 'break-all', lineHeight: 1.6 }}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryContent() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'rgba(26,26,46,0.4)', fontStyle: 'italic' }}>
        Summary — High-level file overview. Upload a file to see real stats.
      </p>
      {[
        { label: 'File Type', value: '837P — Professional Claim' },
        { label: 'Transaction Sets', value: '1' },
        { label: 'Total Claim Amount', value: '$1,500.00' },
        { label: 'Validation Status', value: '2 warnings, 1 error' },
      ].map((row) => (
        <div key={row.label} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#FFFFFF',
          border: '2px solid rgba(26,26,46,0.12)',
          borderRadius: 10,
          boxShadow: '3px 3px 0px rgba(26,26,46,0.06)',
        }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: 'rgba(26,26,46,0.55)' }}>{row.label}</span>
          <SkeletonLine width={120} height={12} />
        </div>
      ))}
    </div>
  )
}

// ── Empty / No-file upload placeholder ───────────────────────────────────────
function EmptyDropzone() {
  const navigate = useNavigate()
  const setEdiFile = useAppStore((s) => s.setEdiFile)
  const setFile = useAppStore((s) => s.setFile)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback((file: File) => {
    setLoading(true)
    setEdiFile(file)
    setFile(file)
    setTimeout(() => navigate('/processing'), 300)
  }, [setEdiFile, setFile, navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFile(files[0]),
    accept: {
      'text/plain': ['.edi', '.txt', '.dat', '.x12'],
      'application/octet-stream': ['.edi', '.dat', '.x12'],
    },
    multiple: false,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 24,
      }}
    >
      {/* Big upload zone */}
      <div
        {...getRootProps()}
        style={{
          padding: '48px 64px',
          border: `2.5px dashed ${isDragActive ? '#4ECDC4' : 'rgba(26,26,46,0.2)'}`,
          borderRadius: 16,
          background: isDragActive ? 'rgba(78,205,196,0.05)' : '#FFFFFF',
          boxShadow: isDragActive ? '4px 4px 0px #4ECDC4' : '4px 4px 0px rgba(26,26,46,0.08)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          maxWidth: 480,
          width: '100%',
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="doodle-spinner" style={{ width: 40, height: 40 }} />
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 14, color: '#1A1A2E' }}>Preparing your file…</p>
          </div>
        ) : (
          <>
            <UploadCloud size={44} color="#4ECDC4" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 17, color: '#1A1A2E', marginBottom: 8 }}>
              {isDragActive ? 'Drop it right here! 🎉' : 'Drop your EDI file here'}
            </p>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'rgba(26,26,46,0.45)' }}>
              or click to browse · .edi .txt .dat .x12
            </p>
          </>
        )}
      </div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'rgba(26,26,46,0.35)', textAlign: 'center' }}>
        Supports 837P · 837I · 835 · 834
      </p>
    </motion.div>
  )
}

// ── Main EditorArea ───────────────────────────────────────────────────────────
export default function EditorArea() {
  const parseResult = useAppStore((s) => s.parseResult)
  const ediFile = useAppStore((s) => s.ediFile)
  const activeTabId = useAppStore((s) => s.activeTabId)
  const hasFile = !!(parseResult || ediFile.fileName)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#FDFAF4', overflow: 'hidden' }}>
      <CenterTabBar />
      <div style={{ flex: 1, overflow: 'auto' }} className="custom-scrollbar">
        {!hasFile ? (
          <EmptyDropzone />
        ) : (
          <>
            {activeTabId === 'form' && <FormEditorView />}
            {activeTabId === 'raw' && <RawEDIContent />}
            {activeTabId === 'summary' && <SummaryContent />}
          </>
        )}
      </div>
    </div>
  )
}