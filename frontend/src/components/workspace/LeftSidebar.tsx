import { useState } from 'react'
import useAppStore from '../../store/useAppStore'

// ── Tree Node (placeholder skeleton) ─────────────────────────────────────────
interface TreeNode {
  id: string
  label: string
  type: 'file' | 'loop' | 'segment'
  children?: TreeNode[]
}

const PLACEHOLDER_TREE: TreeNode[] = [
  {
    id: 'isa',
    label: 'ISA — Interchange Control',
    type: 'loop',
    children: [
      {
        id: 'gs',
        label: 'GS — Functional Group',
        type: 'loop',
        children: [
          {
            id: 'loop2000a',
            label: 'Loop 2000A — Billing Provider',
            type: 'loop',
            children: [
              { id: 'nm1-85', label: 'NM1 — Billing Provider Name', type: 'segment' },
              { id: 'n3', label: 'N3 — Address', type: 'segment' },
              { id: 'prv', label: 'PRV — Provider Info', type: 'segment' },
              {
                id: 'loop2300',
                label: 'Loop 2300 — Claim Info',
                type: 'loop',
                children: [
                  { id: 'clm', label: 'CLM — Claim', type: 'segment' },
                  { id: 'hi', label: 'HI — Diagnosis Codes', type: 'segment' },
                  { id: 'sv1', label: 'SV1 — Service Line', type: 'segment' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

const PLACEHOLDER_HISTORY = [
  { id: 'h1', name: 'claim_837p_acme.edi', type: '837P', date: '2 hours ago' },
  { id: 'h2', name: 'remittance_835.edi', type: '835', date: 'Yesterday' },
  { id: 'h3', name: 'enrollment_834.edi', type: '834', date: '3 days ago' },
]

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0

  const typeColor = node.type === 'segment'
    ? 'rgba(26,26,46,0.55)'
    : node.type === 'loop'
    ? '#1A1A2E'
    : '#4ECDC4'

  return (
    <div>
      <button
        onClick={() => hasChildren && setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: `5px 8px 5px ${12 + depth * 14}px`,
          background: 'transparent',
          border: 'none',
          cursor: hasChildren ? 'pointer' : 'default',
          borderRadius: 6,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: typeColor,
          textAlign: 'left',
          transition: 'background 0.12s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(78,205,196,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {hasChildren ? (
          <span style={{ fontSize: 9, opacity: 0.6, transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.15s', flexShrink: 0 }}>▶</span>
        ) : (
          <span style={{ width: 9, flexShrink: 0, display: 'inline-block' }}>·</span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
      </button>
      {expanded && hasChildren && (
        <div style={{ borderLeft: '1.5px dashed rgba(26,26,46,0.12)', marginLeft: 12 + depth * 14 + 8 }}>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExplorerView({ hasFile }: { hasFile: boolean }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '8px 12px 6px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 11,
        color: 'rgba(26,26,46,0.45)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        flexShrink: 0,
        borderBottom: '1.5px solid rgba(26,26,46,0.08)',
      }}>
        Explorer
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="custom-scrollbar">
        {hasFile ? (
          <>
            <div style={{
              padding: '4px 12px 8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              color: '#4ECDC4',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#4ECDC4" strokeWidth="1.5" /><line x1="4" y1="5" x2="10" y2="5" stroke="#4ECDC4" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="8" x2="8" y2="8" stroke="#4ECDC4" strokeWidth="1.2" strokeLinecap="round"/></svg>
              OPEN FILE
            </div>
            {PLACEHOLDER_TREE.map((node) => (
              <TreeItem key={node.id} node={node} />
            ))}
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 10,
            padding: 24,
            textAlign: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="4" y="4" width="28" height="28" rx="4" stroke="rgba(26,26,46,0.15)" strokeWidth="2" strokeDasharray="4 3" />
              <path d="M14 18h8M18 14v8" stroke="rgba(26,26,46,0.25)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'rgba(26,26,46,0.35)', lineHeight: 1.5 }}>
              No file open.<br />Upload an EDI file to explore its structure.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryView() {
  const typeColors: Record<string, string> = {
    '837P': '#4ECDC4',
    '835': '#FFE66D',
    '834': '#FF6B6B',
  }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '8px 12px 6px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 11,
        color: 'rgba(26,26,46,0.45)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        flexShrink: 0,
        borderBottom: '1.5px solid rgba(26,26,46,0.08)',
      }}>
        File History
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
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 800,
                color: '#1A1A2E',
                background: typeColors[file.type] ?? '#e0e0e0',
                borderRadius: 4,
                padding: '1px 6px',
                flexShrink: 0,
                border: '1.5px solid rgba(26,26,46,0.2)',
              }}>
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

export default function LeftSidebar() {
  const activePanelView = useAppStore((s) => s.activePanelView)
  const parseResult = useAppStore((s) => s.parseResult)
  const ediFile = useAppStore((s) => s.ediFile)
  const hasFile = !!(parseResult || ediFile.fileName)

  return (
    <div style={{
      height: '100%',
      background: '#FDFAF4',
      borderRight: '2.5px solid #1A1A2E',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {activePanelView === 'explorer' ? (
        <ExplorerView hasFile={hasFile} />
      ) : (
        <HistoryView />
      )}
    </div>
  )
}
