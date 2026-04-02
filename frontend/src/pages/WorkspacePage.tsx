import { Navigate } from 'react-router-dom'
import { Panel, Group as PanelGroup } from 'react-resizable-panels'
import useAppStore from '../store/useAppStore'

// IDE Components
import WorkspaceTopNav from '../components/workspace/WorkspaceTopNav'
import ActivityBar from '../components/workspace/ActivityBar'
import LeftSidebar from '../components/workspace/LeftSidebar'
import EditorArea from '../components/workspace/EditorArea'
import ValidationDrawer from '../components/workspace/ValidationDrawer'
import AIPanel from '../components/workspace/AIPanel'
import DoodleResizeHandle from '../components/workspace/DoodleResizeHandle'

export default function WorkspacePage() {
  const { session, authLoading } = useAppStore()

  // ── While auth is initializing, show nothing (or a tiny spinner) ──
  if (authLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFAF4',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div className="doodle-spinner" style={{ width: 48, height: 48 }} />
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(26,26,46,0.5)' }}>
          Loading your workspace...
        </p>
      </div>
    )
  }

  // ── Route guard: only redirect after we know there's no session ──
  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#FDFAF4' }}>
      
      {/* Top Navbar */}
      <WorkspaceTopNav />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Fixed Activity Bar */}
        <ActivityBar />

        {/* Resizable Grid Playground */}
        <PanelGroup orientation="horizontal">
          
          {/* Left Panel: Explorer / History */}
          <Panel defaultSize={120} minSize={12} collapsible>
            <LeftSidebar />
          </Panel>

          <DoodleResizeHandle />

          {/* Center Column: Editor Tabs + Validation Drawer */}
          <Panel minSize={30}>
            <PanelGroup orientation="vertical">
              
              {/* Editor Workspace Area */}
              <Panel minSize={30}>
                <EditorArea />
              </Panel>

              <DoodleResizeHandle direction="vertical" />
              
              {/* Bottom Validation Drawer */}
              <Panel defaultSize={28} minSize={15} collapsible>
                <ValidationDrawer />
              </Panel>

            </PanelGroup>
          </Panel>

          <DoodleResizeHandle />

          {/* Right Panel: AI Co-Pilot Chat */}
          <Panel defaultSize={22} minSize={15} collapsible>
            <AIPanel />
          </Panel>

        </PanelGroup>

      </div>
    </div>
  )
}
