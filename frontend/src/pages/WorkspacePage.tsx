import { useRef, useEffect, useState } from 'react'
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
  
  const isLeftSidebarOpen = useAppStore(s => s.isLeftSidebarOpen)
  const isAIPanelOpen = useAppStore(s => s.isAIPanelOpen)
  const setIsAIPanelOpen = useAppStore(s => s.setIsAIPanelOpen)
  const isValidationDrawerOpen = useAppStore(s => s.isValidationDrawerOpen)

  const validationPanelRef = useRef<any>(null)
  const previousValidationSize = useRef<number>(30)
  const [isAnimatingValidation, setIsAnimatingValidation] = useState(false)

  const PanelComponent = Panel as any

  // Use an effect to properly animate the Validation Drawer and capture its dragged size
  useEffect(() => {
    const panel = validationPanelRef.current
    if (!panel) return

    setIsAnimatingValidation(true)
    if (!isValidationDrawerOpen) {
      previousValidationSize.current = panel.getSize()
      panel.resize(5) // header only approx 5% height
    } else {
      panel.resize(Math.max(previousValidationSize.current, 15))
    }
    
    const timer = setTimeout(() => setIsAnimatingValidation(false), 300)
    return () => clearTimeout(timer)
  }, [isValidationDrawerOpen])

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
          {isLeftSidebarOpen && (
            <>
              <Panel defaultSize={300} minSize={12} collapsible>
                <LeftSidebar />
              </Panel>
              <DoodleResizeHandle />
            </>
          )}

          {/* Center Column: Editor Tabs + Validation Drawer */}
          <Panel minSize={30}>
            <PanelGroup orientation="vertical">
              
              {/* Editor Workspace Area */}
              <Panel minSize={30}>
                <EditorArea />
              </Panel>

              <DoodleResizeHandle direction="vertical" />
              
              {/* Bottom Validation Drawer */}
              <PanelComponent 
                ref={validationPanelRef}
                defaultSize={270} 
                minSize={5} 
                collapsible
                style={{ transition: isAnimatingValidation ? 'flex 0.3s ease-in-out' : 'none' }}
              >
                <ValidationDrawer />
              </PanelComponent>

            </PanelGroup>
          </Panel>

          {isAIPanelOpen && <DoodleResizeHandle />}

          {/* Right Panel: AI Co-Pilot Chat */}
          {isAIPanelOpen && (
            <Panel defaultSize={350} minSize={15} collapsible >
              <AIPanel />
            </Panel>
          )}

        </PanelGroup>

      </div>

      {/* Floating AI Button when minimized */}
      {!isAIPanelOpen && (
        <button
          onClick={() => setIsAIPanelOpen(true)}
          style={{
            position: 'fixed',
            right: -2,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            background: '#4ECDC4',
            border: '2.5px solid #1A1A2E',
            borderRadius: '8px 0 0 8px',
            padding: '16px 6px',
            boxShadow: '-3px 3px 0px #1A1A2E',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, right 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.right = '0px';
            e.currentTarget.style.boxShadow = '-5px 5px 0px #1A1A2E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.right = '-2px';
            e.currentTarget.style.boxShadow = '-3px 3px 0px #1A1A2E';
          }}
        >
          <div style={{ 
            writingMode: 'vertical-rl', 
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontFamily: 'Nunito, sans-serif', 
            fontWeight: 800, 
            fontSize: 14, 
            color: '#1A1A2E',
            letterSpacing: '0.05em'
          }}>
            AI Co-Pilot ✨
          </div>
        </button>
      )}
    </div>
  )
}