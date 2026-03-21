// components/dashboard/InvestigationHistory.tsx
// Slide-over panel showing all past investigations for the current user,
// loaded from Firestore. Each row can be clicked to restore the full
// analysis result to the app store.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History,
  X,
  Trash2,
  ChevronRight,
  Database,
  AlertTriangle,
  Clock,
  Edit2,
  Check,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useInvestigationHistory } from '../../hooks/useInvestigationHistory'
import { useAppStore } from '../../store/useAppStore'
import type { InvestigationRecord } from '../../lib/firestoreService'
import type { ThreatLevel } from '../../store/useAppStore'

// ─── Helpers ────────────────────────────────────────────────────────────────

const THREAT_COLORS: Record<ThreatLevel, { text: string; border: string; bg: string; dot: string }> = {
  LOW:      { text: 'text-cyber-cyan',   border: 'border-cyber-cyan/40',   bg: 'bg-cyber-cyan/10',   dot: 'bg-cyber-cyan'   },
  MEDIUM:   { text: 'text-yellow-400',   border: 'border-yellow-400/40',   bg: 'bg-yellow-400/10',   dot: 'bg-yellow-400'   },
  HIGH:     { text: 'text-orange-400',   border: 'border-orange-400/40',   bg: 'bg-orange-400/10',   dot: 'bg-orange-400'   },
  CRITICAL: { text: 'text-cyber-alert',  border: 'border-cyber-alert/40',  bg: 'bg-cyber-alert/10',  dot: 'bg-cyber-alert'  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function InvestigationRow({
  inv,
  onLoad,
  onDelete,
  onRename,
}: {
  inv: InvestigationRecord
  onLoad: (inv: InvestigationRecord) => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(inv.title)
  const sev = THREAT_COLORS[inv.threatLevel]

  const commitRename = () => {
    if (draft.trim() && draft !== inv.title) onRename(inv.id, draft.trim())
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className={`group relative p-3 rounded-xl border ${sev.border} ${sev.bg} hover:border-opacity-80 transition-all cursor-pointer`}
      onClick={() => !editing && onLoad(inv)}
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${sev.dot}`} />

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false) }}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-transparent border-b border-cyber-cyan/50 focus:outline-none text-[11px] font-mono text-white pb-0.5"
          />
        ) : (
          <span className="flex-1 text-[11px] font-mono text-white leading-snug line-clamp-2">
            {inv.title}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
          {editing ? (
            <button
              onClick={commitRename}
              className="p-1 text-cyber-cyan hover:text-white rounded transition-colors"
              title="Save title"
            >
              <Check size={11} />
            </button>
          ) : (
            <button
              onClick={() => { setEditing(true); setDraft(inv.title) }}
              className="p-1 text-slate-500 hover:text-cyber-cyan rounded transition-colors"
              title="Rename"
            >
              <Edit2 size={11} />
            </button>
          )}
          <button
            onClick={() => onDelete(inv.id)}
            className="p-1 text-slate-500 hover:text-cyber-alert rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={11} />
          </button>
          <ChevronRight size={11} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
          <Clock size={8} />
          {formatDate(inv.createdAt)}
        </div>
        <span className={`text-[8px] font-orbitron font-black tracking-wider px-1.5 py-0.5 rounded border ${sev.text} ${sev.border} ${sev.bg}`}>
          {inv.threatLevel}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mt-2 h-0.5 bg-cyber-border/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${inv.threatScore}%`,
            background: `linear-gradient(90deg, ${
              inv.threatLevel === 'CRITICAL' ? '#FF4D4D' :
              inv.threatLevel === 'HIGH'     ? '#FF8C00' :
              inv.threatLevel === 'MEDIUM'   ? '#F59E0B' : '#00F5D4'
            }, transparent)`,
          }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface InvestigationHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export function InvestigationHistory({ isOpen, onClose }: InvestigationHistoryProps) {
  const { setAnalysisResult, setThreatLevel, setThreatScore } = useAppStore()
  const { investigations, loading, error, fetchInvestigations, removeInvestigation, editTitle } = useInvestigationHistory()
  const [search, setSearch] = useState('')

  const filtered = investigations.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.threatLevel.toLowerCase().includes(search.toLowerCase())
  )

  const handleLoad = (inv: InvestigationRecord) => {
    // Restore the full analysis to the app store so results & terminal panels show it
    setAnalysisResult({
      inputText:        inv.inputText,
      osint:            inv.osint,
      psychology:       inv.psychology,
      policy:           inv.policy,
      verdict:          inv.verdict,
      hash:             inv.hash,
      blockchainStored: inv.blockchainStored,
      txId:             inv.txId,
    })
    setThreatLevel(inv.threatLevel)
    setThreatScore(inv.threatScore)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Side panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[360px] z-50 flex flex-col"
          >
            <GlassCard className="h-full flex flex-col rounded-r-none" glowColor="purple">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyber-purple/20 border border-cyber-purple/30 flex items-center justify-center">
                    <Database size={14} className="text-cyber-purple" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
                      INVESTIGATION HISTORY
                    </h3>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                      {investigations.length} record{investigations.length !== 1 ? 's' : ''} stored
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search + Refresh */}
              <div className="px-4 py-3 flex gap-2 border-b border-cyber-border/20">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-cyber-dark/60 border border-cyber-border/30 focus-within:border-cyber-purple/50 transition-colors">
                  <Search size={11} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Filter investigations…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <button
                  onClick={fetchInvestigations}
                  disabled={loading}
                  className="p-2 text-slate-500 hover:text-cyber-cyan rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin">
                {loading && investigations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div className="w-8 h-8 border-2 border-cyber-purple/40 border-t-cyber-purple rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-slate-500">Loading history…</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-cyber-alert/10 border border-cyber-alert/30">
                    <AlertTriangle size={12} className="text-cyber-alert shrink-0" />
                    <span className="text-[10px] font-mono text-cyber-alert">{error}</span>
                  </div>
                )}

                {!loading && !error && investigations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-56 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyber-dark/60 border border-cyber-border/30 flex items-center justify-center">
                      <Shield size={22} className="text-slate-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-mono text-slate-500">No investigations saved yet</p>
                      <p className="text-[9px] font-mono text-slate-700 mt-1">
                        Run your first analysis to populate history
                      </p>
                    </div>
                  </div>
                )}

                {!loading && filtered.length === 0 && investigations.length > 0 && (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <p className="text-[10px] font-mono text-slate-500">No results match "{search}"</p>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {filtered.map(inv => (
                    <InvestigationRow
                      key={inv.id}
                      inv={inv}
                      onLoad={handleLoad}
                      onDelete={removeInvestigation}
                      onRename={editTitle}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-cyber-border/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                <span className="text-[9px] font-mono text-slate-600">
                  Synced with Firestore · Real-time
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <History size={9} className="text-slate-700" />
                  <span className="text-[9px] font-mono text-slate-700">
                    users/{'{uid}'}/investigations
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}