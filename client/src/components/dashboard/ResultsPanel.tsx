// components/dashboard/ResultsPanel.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Shield, Zap, Lock, Globe } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useAppStore } from '../../store/useAppStore'

interface ResultSection {
  title: string
  icon: typeof CheckCircle
  content: string
  color: string
}

export function ResultsPanel() {
  const { analysisResult, threatLevel } = useAppStore()

  if (!analysisResult) {
    return (
      <GlassCard className="p-5 h-full flex items-center justify-center" glowColor="cyan">
        <div className="text-center space-y-3">
          <div className="text-slate-600 text-sm font-mono">
            No analysis results yet
          </div>
          <div className="text-[11px] text-slate-700">
            Submit a query above to see detailed analysis results
          </div>
        </div>
      </GlassCard>
    )
  }

  const threatColor = {
    LOW: '#00F5D4',
    MEDIUM: '#F59E0B',
    HIGH: '#FF8C00',
    CRITICAL: '#FF4D4D',
  }[threatLevel]

  const sections: ResultSection[] = [
    {
      title: 'OSINT Analysis',
      icon: Globe,
      content: analysisResult.osint || 'No OSINT findings',
      color: '#7B61FF',
    },
    {
      title: 'Psychological Analysis',
      icon: AlertCircle,
      content: analysisResult.psychology || 'No psychological patterns detected',
      color: '#F59E0B',
    },
    {
      title: 'Policy Verdict',
      icon: Lock,
      content: analysisResult.policy || 'No policy violations found',
      color: '#00F5D4',
    },
  ]

  return (
    <GlassCard className="p-5 h-full flex flex-col gap-4 overflow-hidden" glowColor="cyan">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={16} style={{ color: threatColor }} />
          <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
            ANALYSIS RESULTS
          </h3>
        </div>
        <div
          className="px-3 py-1 rounded-lg text-[10px] font-orbitron font-black"
          style={{
            color: threatColor,
            borderColor: `${threatColor}40`,
            backgroundColor: `${threatColor}10`,
            border: `1px solid ${threatColor}40`,
          }}
        >
          {threatLevel}
        </div>
      </div>

      {/* Verdict Summary */}
      <AnimatePresence>
        {analysisResult.verdict && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border"
            style={{
              borderColor: `${threatColor}40`,
              backgroundColor: `${threatColor}08`,
            }}
          >
            <div className="space-y-2">
              {analysisResult.verdict.split('\n').map((line, idx) => {
                if (!line.trim()) return null
                const isHeader = line.includes(':')
                return (
                  <div key={idx} className={isHeader ? 'font-semibold' : ''}>
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: isHeader ? `${threatColor}` : '#cbd5e1' }}
                    >
                      {isHeader ? '▸ ' : '  '}
                      {line}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Sections */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {sections.map((section, idx) => {
          const Icon = section.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg border border-cyber-border/30 hover:border-cyber-border/60 transition-colors"
            >
              <div className="flex items-start gap-2 mb-2">
                <Icon size={14} style={{ color: section.color }} className="shrink-0 mt-0.5" />
                <h4
                  className="text-[10px] font-orbitron font-bold uppercase tracking-wider"
                  style={{ color: section.color }}
                >
                  {section.title}
                </h4>
              </div>
              <div className="text-[10px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                {section.content
                  .split('\n')
                  .map((line, i) => (
                    <div key={i}>{line || ' '}</div>
                  ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Blockchain Info */}
      {analysisResult.blockchainStored && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/30"
        >
          <div className="flex items-start gap-2">
            <Zap size={12} className="text-cyber-cyan shrink-0 mt-1" />
            <div className="space-y-1">
              <div className="text-[10px] font-orbitron font-semibold text-cyber-cyan">
                Blockchain Stored
              </div>
              <div className="text-[9px] font-mono text-slate-500 break-all">
                TX: {analysisResult.txId}
              </div>
              <div className="text-[9px] font-mono text-slate-600 mt-1">
                Hash: {analysisResult.hash.slice(0, 16)}...
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </GlassCard>
  )
}