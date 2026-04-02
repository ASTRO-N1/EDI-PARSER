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

// Allowed extensions — validated by name, not MIME type.
// iOS Safari / Android Chrome don't reliably set MIME types for custom
// extensions like .edi, so a MIME-based `accept` prop silently rejects
// all files on mobile. Extension-based validation works on every platform.
const ALLOWED_EXTENSIONS = ['.edi', '.txt', '.dat', '.x12', '.zip']

function extensionValidator(file: File) {
  const name = file.name.toLowerCase()
  const isValid = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
  if (!isValid) {
    return {
      code: 'file-invalid-type',
      message: 'Only EDI files are supported (.edi .txt .dat .x12 .zip)',
    }
  }
  return null
}

export default function UploadZone() {
  const navigate = useNavigate()
  const setEdiFile = useAppStore((s) => s.setEdiFile)
  const setFile = useAppStore((s) => s.setFile)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      setLoading(true)
      setEdiFile(file)
      setFile(file)
      setTimeout(() => {
        navigate('/processing')
      }, 300)
    },
    [setEdiFile, setFile, navigate]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (accepted) => accepted[0] && handleFile(accepted[0]),
    // No MIME-based `accept` — iOS/Android don't reliably assign MIME types
    // to custom extensions like .edi, causing silent rejections on mobile.
    // We validate by file extension via `validator` instead.
    validator: extensionValidator,
    multiple: false,
  })

  const rejectionError = fileRejections[0]?.errors[0]?.message ?? null

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
      <div style={{ display: 'flex', justifyContent: 'end', marginBottom: -75, top: -58, left: -85, position: 'relative', zIndex: 2 }}>
        <SittingStickFigure size={75} />
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`upload-zone${isDragActive ? ' drag-over' : ''}${rejectionError ? ' upload-zone-error' : ''}`}
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          borderColor: rejectionError ? '#FF6B6B' : '#4ECDC4',
          borderWidth: isDragActive ? 3 : 2.5,
          borderStyle: 'dashed',
          borderRadius: 16,
          background: isDragActive ? '#F0FFF4' : rejectionError ? '#FFF5F5' : '#FFFFFF',
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
            <UploadCloud
              size={48}
              color={rejectionError ? '#FF6B6B' : '#4ECDC4'}
              style={{ margin: '0 auto 12px' }}
            />
            <p
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                color: rejectionError ? '#FF6B6B' : '#1A1A2E',
                marginBottom: 6,
              }}
            >
              {isDragActive ? 'Drop it here! 🎉' : 'Tap or drag your EDI file here'}
            </p>
            {rejectionError ? (
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#FF6B6B' }}>
                ⚠️ {rejectionError}
              </p>
            ) : (
              <p
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: 'rgba(26,26,46,0.5)',
                }}
              >
                .edi · .txt · .dat · .x12 · .zip
              </p>
            )}
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
    </div>
  )
}
