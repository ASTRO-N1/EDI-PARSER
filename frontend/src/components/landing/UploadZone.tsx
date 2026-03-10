import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { UploadCloud } from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import { SittingStickFigure } from './StickFigure'

const SAMPLE_FILES = [
  { label: '837P Sample', type: '837p' },
  { label: '837I Sample', type: '837i' },
  { label: '835 Sample', type: '835' },
  { label: '834 Sample', type: '834' },
]

const BADGES = [
  '97,572 ICD-10 codes',
  '1,198 RARC codes',
  '407 CARC codes',
  '8,184 HCPCS codes',
]

export default function UploadZone() {
  const navigate = useNavigate()
  const setEdiFile = useAppStore((s) => s.setEdiFile)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      setLoading(true)
      setEdiFile(file)
      setTimeout(() => {
        navigate('/processing', { state: { file } })
      }, 300)
    },
    [setEdiFile, navigate]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFile(files[0]),
    accept: {
      'text/plain': ['.edi', '.txt', '.dat', '.x12'],
      'application/zip': ['.zip'],
      'application/octet-stream': ['.edi', '.dat', '.x12'],
    },
    multiple: false,
  })

  const handleSampleClick = async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/samples/${type}.edi`)
      if (!res.ok) throw new Error('Sample not found')
      const blob = await res.blob()
      const file = new File([blob], `${type}-sample.edi`, { type: 'text/plain' })
      handleFile(file)
    } catch {
      // Sample file not found — just navigate anyway as demo
      const placeholder = new File(['ISA*00*...'], `${type}-sample.edi`, { type: 'text/plain' })
      handleFile(placeholder)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Sitting stick figure above upload box */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -12, position: 'relative', zIndex: 2 }}>
        <SittingStickFigure size={68} />
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`upload-zone${isDragActive ? ' drag-over' : ''}`}
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          borderColor: isDragActive ? '#4ECDC4' : '#4ECDC4',
          borderWidth: isDragActive ? 3 : 2.5,
          borderStyle: 'dashed',
          borderRadius: 16,
          background: isDragActive ? '#F0FFF4' : '#FFFFFF',
          transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.2s ease',
        }}
      >
        <input {...getInputProps()} />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="doodle-spinner" />
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 16, color: '#1A1A2E' }}>
              Reading your file…
            </p>
          </div>
        ) : (
          <>
            <UploadCloud size={48} color="#4ECDC4" style={{ margin: '0 auto 12px' }} />
            <p
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                color: '#1A1A2E',
                marginBottom: 6,
              }}
            >
              {isDragActive ? 'Drop it here! 🎉' : 'Drag your EDI file here'}
            </p>
            <p
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: 'rgba(26,26,46,0.5)',
              }}
            >
              or click to browse · .edi .txt .dat .x12 .zip
            </p>
          </>
        )}
      </div>

      {/* Sample file pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 14,
          justifyContent: 'center',
        }}
      >
        {SAMPLE_FILES.map((s) => (
          <button
            key={s.type}
            className="doodle-pill"
            onClick={() => handleSampleClick(s.type)}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Reference data badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 14,
          justifyContent: 'center',
        }}
      >
        {BADGES.map((b) => (
          <span
            key={b}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(26,26,46,0.55)',
              background: '#F5F0E8',
              border: '1.5px solid rgba(26,26,46,0.15)',
              borderRadius: 6,
              padding: '3px 8px',
              transform: Math.random() > 0.5 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)',
              display: 'inline-block',
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}
