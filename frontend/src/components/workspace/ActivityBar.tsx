import type { JSX } from 'react'
import useAppStore from '../../store/useAppStore'
import type { ActivePanelView } from '../../store/useAppStore'

// SVG Icons
function ExplorerIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ECDC4' : 'rgba(26,26,46,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h6l2 2h10v14H3z" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="13" y2="14" />
    </svg>
  )
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ECDC4' : 'rgba(26,26,46,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ECDC4' : 'rgba(26,26,46,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  )
}

interface ActivityItem {
  id: ActivePanelView | 'search'
  label: string
  icon: (active: boolean) => JSX.Element
}

const ITEMS: ActivityItem[] = [
  { id: 'explorer', label: 'Explorer', icon: (a) => <ExplorerIcon active={a} /> },
  { id: 'history', label: 'History', icon: (a) => <HistoryIcon active={a} /> },
  { id: 'search', label: 'Search', icon: (a) => <SearchIcon active={a} /> },
]

export default function ActivityBar() {
  const activePanelView = useAppStore((s) => s.activePanelView)
  const setActivePanelView = useAppStore((s) => s.setActivePanelView)
  const isLeftSidebarOpen = useAppStore((s) => s.isLeftSidebarOpen)
  const setIsLeftSidebarOpen = useAppStore((s) => s.setIsLeftSidebarOpen)

  return (
    <div
      style={{
        width: 48,
        flexShrink: 0,
        background: '#FDFAF4',
        borderRight: '2.5px solid #1A1A2E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        gap: 4,
        zIndex: 10,
      }}
    >
      {ITEMS.map((item) => {
        const isActive = activePanelView === item.id
        return (
          <button
            key={item.id}
            title={item.label}
            onClick={() => {
              if (item.id !== 'search') {
                if (isActive) {
                  setIsLeftSidebarOpen(!isLeftSidebarOpen)
                } else {
                  setActivePanelView(item.id as ActivePanelView)
                  setIsLeftSidebarOpen(true)
                }
              }
            }}
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? 'rgba(78,205,196,0.12)' : 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              marginBottom: 2,
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(26,26,46,0.06)' }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
          >
            {/* Active left indicator bar */}
            {isActive && isLeftSidebarOpen && (
              <div style={{
                position: 'absolute',
                left: -4,
                top: 8,
                bottom: 8,
                width: 3,
                background: '#4ECDC4',
                borderRadius: 2,
              }} />
            )}
            {item.icon(isActive)}
          </button>
        )
      })}
    </div>
  )
}