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

// Cast to any to sidestep prop-type conflicts across different react-resizable-panels versions
const FlexPanelGroup = PanelGroup as any

export default function WorkspacePage() {
  const { session, authLoading } = useAppStore()

  const isLeftSidebarOpen    = useAppStore(s => s.isLeftSidebarOpen)
  const setIsLeftSidebarOpen = useAppStore(s => s.setIsLeftSidebarOpen)
  const isAIPanelOpen        = useAppStore(s => s.isAIPanelOpen)
  const setIsAIPanelOpen     = useAppStore(s => s.setIsAIPanelOpen)

  // Ref to the PanelGroup so we can call setLayout() imperatively
  // const panelGroupRef = useRef<any>(null)

  // // Independently remembered sizes for the left and AI panels.
  // // Center always fills whatever is left. This way toggling one panel
  // // never changes the size of the other.
  // const isToggling = useRef(false)
  // const savedSizes = useRef({ left: 20, ai: 25 })

  // // Called every time the user drags a resize handle — keep saved sizes in sync
  // const handleLayout = (sizes: number[]) => {
  //   if (isToggling.current) return
  //   if (isLeftSidebarOpen && isAIPanelOpen && sizes.length === 3) {
  //     savedSizes.current.left = sizes[0]
  //     savedSizes.current.ai   = sizes[2]
  //   } else if (isLeftSidebarOpen && !isAIPanelOpen && sizes.length === 2) {
  //     savedSizes.current.left = sizes[0]
  //   } else if (!isLeftSidebarOpen && isAIPanelOpen && sizes.length === 2) {
  //     savedSizes.current.ai = sizes[1]
  //   }
  // }

  // After a panel mounts or unmounts, restore the OTHER panels to their saved sizes.
  // setTimeout(0) lets react-resizable-panels finish its initial layout first.
  // useEffect(() => {
  //   isToggling.current = true
  //   const timer = setTimeout(() => {
  //     if (!panelGroupRef.current?.setLayout) return
  //     const { left, ai } = savedSizes.current
  //     // Clamp so center can never go negative
  //     const safeLeft   = Math.min(left, 85 - ai)
  //     const safeAi     = Math.min(ai, 85 - safeLeft)

  //     if (isLeftSidebarOpen && isAIPanelOpen) {
  //       panelGroupRef.current.setLayout([safeLeft, 100 - safeLeft - safeAi, safeAi])
  //     } else if (isLeftSidebarOpen && !isAIPanelOpen) {
  //       panelGroupRef.current.setLayout([safeLeft, 100 - safeLeft])
  //     } else if (!isLeftSidebarOpen && isAIPanelOpen) {
  //       panelGroupRef.current.setLayout([100 - safeAi, safeAi])
  //     }
  //     // if only center panel: no layout call needed
  //   }, 0)
  //   return () => clearTimeout(timer)
  // }, [isLeftSidebarOpen, isAIPanelOpen])

  // ── While auth is initializing ──────────────────────────────────────────────
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

  // ── Route guard ─────────────────────────────────────────────────────────────
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

        {/* Resizable Panel Group */}
        <FlexPanelGroup
          orientation="horizontal"
          autoSaveId="workspace-layout-v1"
        >

          {/* Left Panel: Explorer / History */}
          {isLeftSidebarOpen && (
            <>
              <Panel id="left-sidebar" defaultSize={300} minSize={12} collapsible>
                {/* onMinimize wires the — button inside ExplorerView / HistoryView */}
                <LeftSidebar onMinimize={() => setIsLeftSidebarOpen(false)} />
              </Panel>
              <DoodleResizeHandle />
            </>
          )}

          {/* Center Column: Editor + self-contained resizable Validation Drawer */}
          <Panel id="center-column" minSize={30}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Editor fills all available space */}
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                <EditorArea />
              </div>
              {/* ValidationDrawer is pinned to the bottom and manages its own height/drag */}
              <ValidationDrawer />
            </div>
          </Panel>

          {isAIPanelOpen && <DoodleResizeHandle />}

          {/* Right Panel: AI Co-Pilot Chat */}
          {isAIPanelOpen && (
            <Panel id="ai-panel" defaultSize={320} minSize={15} collapsible>
              <AIPanel />
            </Panel>
          )}

        </FlexPanelGroup>

      </div>

      {/* Floating AI Button when panel is closed */}
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
            e.currentTarget.style.right = '0px'
            e.currentTarget.style.boxShadow = '-5px 5px 0px #1A1A2E'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.right = '-2px'
            e.currentTarget.style.boxShadow = '-3px 3px 0px #1A1A2E'
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
            letterSpacing: '0.05em',
          }}>
            AI Co-Pilot ✨
          </div>
        </button>
      )}
    </div>
  )
}