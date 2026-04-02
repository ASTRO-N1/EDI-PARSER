import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore'

// ── Types ──────────────────────────────────────────────────────────────────────

interface EdiTreeNode {
  id: string
  label: string
  path: string
  type: 'loop' | 'segment' | 'value'
  children?: EdiTreeNode[]
}

// ── EDI JSON → tree builder ────────────────────────────────────────────────────

function buildTree(
  data: Record<string, unknown>,
  parentPath = '',
  depth = 0
): EdiTreeNode[] {
  if (!data || typeof data !== 'object') return []
  const nodes: EdiTreeNode[] = []

  for (const [key, value] of Object.entries(data)) {
    // Skip internal or metadata keys
    if (['transaction_type', 'file_type', 'raw', 'raw_content'].includes(key)) continue

    const path = parentPath ? `${parentPath}.${key}` : key
    const label = formatKey(key)

    if (Array.isArray(value)) {
      // Array → loop node with indexed children
      const children = value
        .map((item, i) => {
          const itemPath = `${path}[${i}]`
          if (typeof item === 'object' && item !== null) {
            return {
              id: itemPath,
              label: `${label} [${i + 1}]`,
              path: itemPath,
              type: 'loop' as const,
              children: buildTree(item as Record<string, unknown>, itemPath, depth + 1),
            }
          }
          return {
            id: itemPath,
            label: String(item ?? ''),
            path: itemPath,
            type: 'value' as const,
          }
        })
        .filter(Boolean) as EdiTreeNode[]

      nodes.push({ id: path, label, path, type: 'loop', children })
    } else if (typeof value === 'object' && value !== null) {
      // Object → loop node
      const children = buildTree(value as Record<string, unknown>, path, depth + 1)
      nodes.push({ id: path, label, path, type: 'loop', children })
    } else {
      // Leaf value → segment or value node
      const strVal = value != null ? String(value) : ''
      const isSegmentKey = /^[A-Z]{2,3}\d*$/.test(key)
      nodes.push({
        id: path,
        label: strVal ? `${label}: ${strVal}` : label,
        path,
        type: isSegmentKey ? 'segment' : 'value',
      })
    }
  }

  return nodes
}

function formatKey(key: string): string {
  // e.g. "loop_2010AA" → "Loop 2010AA", "billing_provider" → "Billing Provider"
  return key
    .replace(/^loop_/, 'Loop ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── EdiNode (recursive) ────────────────────────────────────────────────────────

function EdiNode({
  node,
  depth = 0,
  defaultOpen = false,
}: {
  node: EdiTreeNode
  depth?: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const setSelectedPath = useAppStore((s) => s.setSelectedPath)
  const selectedPath = useAppStore((s) => s.selectedPath)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedPath === node.path

  const typeColor =
    node.type === 'segment'
      ? 'rgba(26,26,46,0.7)'
      : node.type === 'value'
      ? 'rgba(26,26,46,0.5)'
      : '#1A1A2E'

  const handleClick = () => {
    setSelectedPath(node.path)
    if (hasChildren) setOpen((v) => !v)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        title={node.path}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: `5px 8px 5px ${10 + depth * 13}px`,
          background: isSelected ? 'rgba(78,205,196,0.15)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 5,
          fontFamily: node.type === 'value' ? 'JetBrains Mono, monospace' : 'JetBrains Mono, monospace',
          fontSize: 11,
          color: isSelected ? '#1A1A2E' : typeColor,
          fontWeight: isSelected ? 700 : node.type === 'loop' ? 600 : 400,
          textAlign: 'left',
          transition: 'background 0.12s, color 0.12s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          borderLeft: isSelected ? '2.5px solid #4ECDC4' : '2.5px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'rgba(78,205,196,0.08)'
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent'
        }}
      >
        {/* Chevron or dot indicator */}
        {hasChildren ? (
          <span
            style={{
              fontSize: 8,
              opacity: 0.65,
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              display: 'inline-block',
              transition: 'transform 0.18s ease',
              flexShrink: 0,
              color: '#4ECDC4',
            }}
          >
            ▶
          </span>
        ) : (
          <span
            style={{
              width: 8,
              flexShrink: 0,
              display: 'inline-block',
              color: node.type === 'segment' ? '#4ECDC4' : 'rgba(26,26,46,0.25)',
              fontSize: 10,
            }}
          >
            {node.type === 'segment' ? '—' : '·'}
          </span>
        )}

        {/* Node type badge for loops */}
        {node.type === 'loop' && (
          <span
            style={{
              flexShrink: 0,
              background: '#4ECDC4',
              color: '#1A1A2E',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8,
              fontWeight: 700,
              padding: '1px 4px',
              borderRadius: 3,
              border: '1px solid rgba(26,26,46,0.2)',
              letterSpacing: '0.04em',
            }}
          >
            L
          </span>
        )}
        {node.type === 'segment' && (
          <span
            style={{
              flexShrink: 0,
              background: '#FFE66D',
              color: '#1A1A2E',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8,
              fontWeight: 700,
              padding: '1px 4px',
              borderRadius: 3,
              border: '1px solid rgba(26,26,46,0.2)',
              letterSpacing: '0.04em',
            }}
          >
            S
          </span>
        )}

        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
          {node.label}
        </span>
      </button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                borderLeft: '1.5px dashed rgba(78,205,196,0.3)',
                marginLeft: 10 + depth * 13 + 12,
              }}
            >
              {node.children!.map((child) => (
                <EdiNode key={child.id} node={child} depth={depth + 1} defaultOpen={false} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Empty state for Explorer ───────────────────────────────────────────────────

function ExplorerEmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 14,
        padding: '28px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          border: '2px dashed rgba(26,26,46,0.2)',
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="3" y="3" width="22" height="22" rx="3" stroke="rgba(26,26,46,0.25)" strokeWidth="1.8" strokeDasharray="4 3" />
          <path d="M10 14h8M14 10v8" stroke="rgba(26,26,46,0.3)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <p
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: 12,
          fontStyle: 'italic',
          color: 'rgba(26,26,46,0.4)',
          lineHeight: 1.6,
          maxWidth: 160,
        }}
      >
        No parsed data found.{' '}
        <span style={{ fontWeight: 700 }}>Upload a file</span> to begin.
      </p>
    </div>
  )
}

// ── ExplorerView ───────────────────────────────────────────────────────────────

function ExplorerView({ onMinimize }: { onMinimize?: () => void }) {
  const parseResult = useAppStore((s) => s.parseResult)
  const ediFile = useAppStore((s) => s.ediFile)
  const hasFile = !!(parseResult || ediFile.fileName)

  const tree = useMemo<EdiTreeNode[]>(() => {
    if (!parseResult) return []
    return buildTree(parseResult as Record<string, unknown>)
  }, [parseResult])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '8px 12px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1.5px solid rgba(26,26,46,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 11,
              color: 'rgba(26,26,46,0.45)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Loop Explorer
          </span>
          {hasFile && tree.length > 0 && (
            <span
              style={{
                background: '#4ECDC4',
                color: '#1A1A2E',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 4,
                border: '1px solid rgba(26,26,46,0.15)',
              }}
            >
              {tree.length}
            </span>
          )}
        </div>
        {onMinimize && (
          <button
            onClick={onMinimize}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10" stroke="rgba(26,26,46,0.45)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }} className="custom-scrollbar">
        {!hasFile || tree.length === 0 ? (
          <ExplorerEmptyState />
        ) : (
          <>
            {/* File label */}
            <div
              style={{
                padding: '4px 12px 8px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                color: '#4ECDC4',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderBottom: '1px dashed rgba(78,205,196,0.2)',
                marginBottom: 4,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="#4ECDC4" strokeWidth="1.5" />
                <line x1="4" y1="5" x2="10" y2="5" stroke="#4ECDC4" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="4" y1="8" x2="8" y2="8" stroke="#4ECDC4" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              OPEN FILE
            </div>
            {tree.map((node, i) => (
              <EdiNode key={node.id} node={node} depth={0} defaultOpen={i < 3} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ── HistoryView ────────────────────────────────────────────────────────────────

const PLACEHOLDER_HISTORY = [
  { id: 'h1', name: 'claim_837p_acme.edi', type: '837P', date: '2 hours ago' },
  { id: 'h2', name: 'remittance_835.edi', type: '835', date: 'Yesterday' },
  { id: 'h3', name: 'enrollment_834.edi', type: '834', date: '3 days ago' },
]

function HistoryView({ onMinimize }: { onMinimize?: () => void }) {
  const typeColors: Record<string, string> = { '837P': '#4ECDC4', '835': '#FFE66D', '834': '#FF6B6B' }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          padding: '8px 12px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1.5px solid rgba(26,26,46,0.08)',
        }}
      >
        <span
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: 11,
            color: 'rgba(26,26,46,0.45)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          File History
        </span>
        {onMinimize && (
          <button
            onClick={onMinimize}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10" stroke="rgba(26,26,46,0.45)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="custom-scrollbar">
        {PLACEHOLDER_HISTORY.map((file) => (
          <button
            key={file.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              width: '100%',
              padding: '8px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(26,26,46,0.06)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(78,205,196,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: '#1A1A2E',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </span>
              <span
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#1A1A2E',
                  background: typeColors[file.type] ?? '#e0e0e0',
                  borderRadius: 4,
                  padding: '1px 6px',
                  flexShrink: 0,
                  border: '1.5px solid rgba(26,26,46,0.2)',
                }}
              >
                {file.type}
              </span>
            </div>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'rgba(26,26,46,0.4)' }}>
              {file.date}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main LeftSidebar ───────────────────────────────────────────────────────────

export default function LeftSidebar({ onMinimize }: { onMinimize?: () => void }) {
  const activePanelView = useAppStore((s) => s.activePanelView)

  return (
    <div
      style={{
        height: '100%',
        background: '#FDFAF4',
        borderRight: '2.5px solid #1A1A2E',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {activePanelView === 'explorer' ? (
        <ExplorerView onMinimize={onMinimize} />
      ) : (
        <HistoryView onMinimize={onMinimize} />
      )}
    </div>
  )
}