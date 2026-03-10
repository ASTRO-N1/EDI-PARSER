import React from 'react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1A2E', color: '#FDFAF4' }}>
      <div className="text-center">
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 32, color: '#FFE66D' }}>
          Dashboard
        </p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 400, fontSize: 18, color: '#FDFAF4', opacity: 0.7, marginTop: 8 }}>
          Coming soon — upload a file first.
        </p>
      </div>
    </div>
  )
}
