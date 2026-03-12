import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import OverviewPage from '../components/dashboard/overview/OverviewPage'
import ComingSoon from '../components/dashboard/ComingSoon'
import AIChatPanel from '../components/dashboard/AIChatPanel'
import RoughDivider from '../components/dashboard/RoughDivider'
import { useTheme } from '../theme/ThemeContext'

export default function DashboardPage() {
  const { t } = useTheme()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      overflow: 'hidden',
      background: t.bg,
      transition: 'background 0.2s',
    }}>
      {/* 1. Left Sidebar (Fixed 260px) */}
      <Sidebar />

      {/* Rough vertical divider: Sidebar | Middle */}
      <RoughDivider orientation="vertical" />

      {/* 2. Middle Content Area (Flexible) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <TopBar />

        {/* Rough horizontal divider: TopBar | Main content */}
        <RoughDivider orientation="horizontal" />

        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="segments" element={<ComingSoon feature="Segment Explorer" />} />
            <Route path="validation" element={<ComingSoon feature="Validation Report" />} />
            <Route path="loops" element={<ComingSoon feature="Loop Structure" />} />
            <Route path="export" element={<ComingSoon feature="Export & Reports" />} />
            <Route path="ai" element={<ComingSoon feature="AI Insights Center" />} />
          </Routes>
        </main>
      </div>

      {/* Rough vertical divider: Middle | AI Panel */}
      <RoughDivider orientation="vertical" />

      {/* 3. Right AI Chat Panel (Collapsible 320px / 40px) */}
      <AIChatPanel />
    </div>
  )
}
