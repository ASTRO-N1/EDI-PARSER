import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

interface EDIFile {
  file: File | null
  fileName: string
  fileType: string
  parseResult: Record<string, unknown> | null
}

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
}

const useAppStore = create<AppState>((set) => ({
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
}))

function detectFileType(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.includes('837')) return '837'
  if (lower.includes('835')) return '835'
  if (lower.includes('834')) return '834'
  return 'unknown'
}

export default useAppStore
