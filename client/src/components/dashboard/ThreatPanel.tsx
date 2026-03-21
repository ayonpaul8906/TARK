import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Shield, Eye, Clock } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { ThreatGauge } from '../charts/ThreatGauge'
import { ThreatActivityChart } from '../charts/StatsChart'
import { useAppStore, ThreatData, ThreatLevel } from '../../store/useAppStore'

const SEVERITY_STYLES: Record<ThreatLevel, { text: string; border: string; bg: string; dot: string }> = {
  LOW: { text: 'text-cyber-cyan', border: 'border-cyber-cyan/30', bg: 'bg-cyber-cyan/10', dot: 'bg-cyber-cyan' },
  MEDIUM: { text: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  HIGH: { text: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  CRITICAL: { text: 'text-cyber-alert', border: 'border-cyber-alert/30', bg: 'bg-cyber-alert/10', dot: 'bg-cyber-alert' },
}

const STATUS_STYLES = {
  ACTIVE: 'text-cyber-alert',
  INVESTIGATING: 'text-yellow-400',
  MITIGATED: 'text-cyber-cyan',
}

function ThreatRow({ threat }: { threat: ThreatData }) {
  const sev = SEVERITY_STYLES[threat.severity]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-xl border ${sev.border} ${sev.bg} space-y-2`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${sev.dot} ${threat.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-orbitron font-bold text-white truncate">{threat.type}</span>
        </div>
        <span className={`text-[9px] font-orbitron font-black px-2 py-0.5 rounded border shrink-0 ${sev.text} ${sev.border} ${sev.bg}`}>
          {threat.severity}
        </span>
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Eye size={8} />
          {threat.source}
        </span>
        <span className={STATUS_STYLES[threat.status]}>{threat.status}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1 bg-cyber-border/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${threat.confidence}%`,
              background: `linear-gradient(90deg, ${threat.severity === 'CRITICAL' ? '#FF4D4D' : threat.severity === 'HIGH' ? '#FF8C00' : threat.severity === 'MEDIUM' ? '#F59E0B' : '#00F5D4'}, transparent)`,
            }}
          />
        </div>
        <span className="text-[9px] font-mono text-slate-500 ml-2">{threat.confidence}%</span>
      </div>
    </motion.div>
  )
}

export function ThreatPanel() {
  const { threats, threatScore, threatLevel } = useAppStore()

  const activeCritical = threats.filter(t => t.severity === 'CRITICAL' && t.status === 'ACTIVE').length
  const totalActive = threats.filter(t => t.status === 'ACTIVE').length
  const mitigated = threats.filter(t => t.status === 'MITIGATED').length

  const threatScoreColor = {
    LOW: '#00F5D4',
    MEDIUM: '#F59E0B',
    HIGH: '#FF8C00',
    CRITICAL: '#FF4D4D',
  }[threatLevel]

  return (
    <GlassCard className="h-full flex flex-col gap-4 p-5" glowColor="alert">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <AlertTriangle size={16} className="text-cyber-alert" />
            {activeCritical > 0 && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-alert rounded-full animate-ping" />
            )}
          </div>
          <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">THREAT ANALYSIS</h3>
        </div>
        <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
          <Clock size={8} />
          Live
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center py-2">
        <ThreatGauge />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Active', value: totalActive, color: 'text-cyber-alert' },
          { label: 'Critical', value: activeCritical, color: 'text-cyber-alert', pulse: true },
          { label: 'Mitigated', value: mitigated, color: 'text-cyber-cyan' },
        ].map(({ label, value, color, pulse }) => (
          <div key={label} className="text-center p-2 rounded-xl bg-cyber-dark/50 border border-cyber-border/20">
            <div className={`text-xl font-orbitron font-black ${color} ${pulse ? 'animate-pulse' : ''}`}>{value}</div>
            <div className="text-[9px] font-mono text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div>
        <p className="text-[9px] font-orbitron font-semibold tracking-widest text-slate-500 uppercase mb-2">
          24H Activity
        </p>
        <ThreatActivityChart />
      </div>

      {/* Active threats list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        <p className="text-[9px] font-orbitron font-semibold tracking-widest text-slate-500 uppercase">
          Recent Threats ({threats.length})
        </p>
        <AnimatePresence initial={false}>
          {threats.slice(0, 6).map(threat => (
            <ThreatRow key={threat.id} threat={threat} />
          ))}
        </AnimatePresence>
      </div>

      {/* Shield status */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20">
        <Shield size={14} className="text-cyber-cyan" />
        <span className="text-[10px] font-orbitron font-semibold text-cyber-cyan">TARK DEFENSE ACTIVE</span>
        <div className="ml-auto flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-3 bg-cyber-cyan/70 rounded-full" style={{ height: `${8 + i * 3}px` }} />
          ))}
        </div>
      </div>
    </GlassCard>
  )
}