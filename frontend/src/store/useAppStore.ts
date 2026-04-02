import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

interface EDIFile {
  file: File | null
  fileName: string
  fileType: string
  parseResult: Record<string, unknown> | null
}

export interface WorkspaceTab {
  id: string
  label: string
  type: 'form' | 'raw' | 'summary' | 'remittance' | 'roster'
  closable: boolean
}

export type ActivePanelView = 'explorer' | 'history'

interface AppState {
  // Auth state
  session: Session | null
  setSession: (session: Session | null) => void
  authLoading: boolean
  setAuthLoading: (loading: boolean) => void

  // File state
  ediFile: EDIFile
  setEdiFile: (file: File) => void
  clearFile: () => void

  // New Processing Page File State
  file: File | null
  setFile: (file: File) => void

  // Parse result
  parseResult: Record<string, unknown> | null
  setParseResult: (result: Record<string, unknown> | null) => void

  transactionType: string | null
  setTransactionType: (type: string | null) => void

  // Loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // Error state
  error: string | null
  setError: (error: string | null) => void

  // Active section (for dashboard navigation)
  activeSection: string
  setActiveSection: (section: string) => void

  // ── Workspace IDE State ────────────────────────────────

  // Left panel view switcher (explorer tree vs file history)
  activePanelView: ActivePanelView
  setActivePanelView: (view: ActivePanelView) => void

  // Open center tabs
  openTabs: WorkspaceTab[]
  activeTabId: string
  setActiveTabId: (id: string) => void
  setOpenTabs: (tabs: WorkspaceTab[]) => void
  addTab: (tab: WorkspaceTab) => void
  closeTab: (id: string) => void
}

const DEFAULT_TABS: WorkspaceTab[] = [
  { id: 'form', label: 'Form View', type: 'form', closable: false },
  { id: 'raw', label: 'Raw EDI', type: 'raw', closable: true },
  { id: 'summary', label: 'Summary', type: 'summary', closable: true },
]

const useAppStore = create<AppState>((set, get) => ({
  // Auth state
  session: null,
  setSession: (session) => set({ session }),
  authLoading: true,
  setAuthLoading: (loading) => set({ authLoading: loading }),

  // File state
  ediFile: {
    file: null,
    fileName: '',
    fileType: '',
    parseResult: null,
  },
  setEdiFile: (file: File) =>
    set({
      ediFile: {
        file,
        fileName: file.name,
        fileType: detectFileType(file.name),
        parseResult: null,
      },
    }),
  clearFile: () =>
    set({
      ediFile: { file: null, fileName: '', fileType: '', parseResult: null },
      file: null,
      parseResult: null,
    }),

  // New Processing Page File State
  file: null,
  setFile: (file) => set({ file }),

  // Parse result
  parseResult: null,
  setParseResult: (result) => set({ parseResult: result }),

  transactionType: null,
  setTransactionType: (type) => set({ transactionType: type }),

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Error
  error: null,
  setError: (error) => set({ error }),

  // Dashboard navigation
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),

  // ── Workspace IDE State ────────────────────────────────

  activePanelView: 'explorer',
  setActivePanelView: (view) => set({ activePanelView: view }),

  openTabs: DEFAULT_TABS,
  activeTabId: 'form',
  setActiveTabId: (id) => set({ activeTabId: id }),
  setOpenTabs: (tabs) => set({ openTabs: tabs }),
  addTab: (tab) => {
    const existing = get().openTabs.find((t) => t.id === tab.id)
    if (!existing) {
      set((s) => ({ openTabs: [...s.openTabs, tab] }))
    }
    set({ activeTabId: tab.id })
  },
  closeTab: (id) => {
    const tabs = get().openTabs.filter((t) => t.id !== id)
    const activeId = get().activeTabId
    set({
      openTabs: tabs,
      activeTabId: activeId === id ? (tabs[0]?.id ?? '') : activeId,
    })
  },
}))

function detectFileType(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.includes('837')) return '837'
  if (lower.includes('835')) return '835'
  if (lower.includes('834')) return '834'
  return 'unknown'
}

export default useAppStore
