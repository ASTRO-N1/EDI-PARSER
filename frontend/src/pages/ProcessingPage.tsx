export default function ProcessingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDFAF4' }}>
      <div className="text-center">
        <div className="doodle-spinner mx-auto mb-4" />
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 20, color: '#1A1A2E' }}>
          Parsing your EDI file…
        </p>
      </div>
    </div>
  )
}
