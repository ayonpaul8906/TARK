import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import {
  Shield, Terminal, Activity, AlertTriangle, Clock,
  ArrowRight, Network, Eye, Zap, TrendingUp, Cpu
} from 'lucide-react'
import { PageTransition } from '../components/motion/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { LiquidGlassNavbar } from '../components/ui/LiquidGlassNavbar'
import { NeoBrutalButton } from '../components/ui/NeoBrutalButton'
import { StatsChart } from '../components/charts/StatsChart'
import { useAppStore } from '../store/useAppStore'
import { useDashboardStats } from '../hooks/useDashboardStats'

// --- CONSTANTS ---
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500 border-red-500/50 bg-red-500/10',
  HIGH: 'text-orange-500 border-orange-500/50 bg-orange-500/10',
  MEDIUM: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10',
  LOW: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10',
}

const RESULT_COLORS: Record<string, string> = {
  THREAT: 'text-red-500',
  BLOCKED: 'text-orange-500',
  MALWARE: 'text-red-500',
  CLEAN: 'text-emerald-400',
  SUSPICIOUS: 'text-yellow-400',
}

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
}

// --- 3D TILT CARD COMPONENT ---
function StatCard3D({ stat }: { stat: any }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [7, -7])
  const rotateY = useTransform(x, [-100, 100], [-7, 7])

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left - rect.width / 2)
    y.set(event.clientY - rect.top - rect.height / 2)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div variants={itemVariants} style={{ perspective: 1000 }} className="h-full">
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="h-full cursor-crosshair"
      >
        <div className="relative h-full rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent p-[1px] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="h-full rounded-2xl bg-[#080b11]/80 backdrop-blur-xl p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Soft background glow based on stat color */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 transition-opacity duration-500 group-hover:opacity-40"
              style={{ backgroundColor: stat.color }}
            />

            <div className="flex items-start justify-between mb-4" style={{ transform: "translateZ(20px)" }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] transition-colors duration-300"
                  style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}25` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-xs font-orbitron text-slate-400 tracking-wider uppercase">{stat.label}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{stat.sub}</div>
                </div>
              </div>
              <TrendingUp size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
            </div>
            
            <div className="font-orbitron font-black text-4xl text-white tracking-tight" style={{ transform: "translateZ(30px)" }}>
              {stat.value}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- MAIN PAGE ---
export default function HomePage() {
  const { user } = useAppStore()
  const { stats, recentScans, loading } = useDashboardStats()

  const statsData = [
    { label: 'Threat Level', value: stats?.threatLevel || 'LOW', icon: AlertTriangle, color: '#ef4444', sub: `Score: ${stats?.threatScore || 0}%` },
    { label: 'Active Threats', value: String(stats?.activeThreats || 0), icon: Eye, color: '#f97316', sub: 'Detected in DB' },
    { label: 'Scans Today', value: String(stats?.scansToday || 0), icon: Activity, color: '#10b981', sub: 'Reset daily' },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#030509] text-white relative overflow-hidden selection:bg-cyber-cyan/30">
        
        {/* --- Refined Background Environment --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyber-cyan/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <LiquidGlassNavbar />

        <div className="relative z-10 pt-32 pb-12 max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyber-cyan via-cyber-cyan/50 to-transparent" />
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <span className="absolute w-full h-full rounded-full bg-cyber-cyan/30 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-cyber-cyan" />
                </div>
                <p className="text-xs font-mono tracking-widest text-cyber-cyan uppercase">
                  Secure Uplink Established
                </p>
              </div>
              <h1 className="font-orbitron font-black text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                System Overview <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-600 text-2xl lg:text-3xl">
                  Operator: {user?.name || 'GUEST_01'}
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <p className="text-slate-400 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                SYS_TIME: {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </p>
              <Link to="/terminal">
                <NeoBrutalButton icon={Terminal} size="lg">Initialize Terminal</NeoBrutalButton>
              </Link>
            </div>
          </motion.div>

          {/* Top stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {statsData.map((stat) => (
              <StatCard3D key={stat.label} stat={stat} />
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent scans */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="h-full rounded-2xl bg-[#080b11]/80 backdrop-blur-xl border border-white/[0.05] p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
                      <Network size={18} />
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white tracking-widest">NETWORK TELEMETRY</h3>
                      <p className="text-xs font-mono text-slate-500 mt-1">Live security event feed</p>
                    </div>
                  </div>
                  <Link to="/terminal" className="text-xs font-orbitron text-slate-400 hover:text-cyber-cyan flex items-center gap-2 transition-all px-4 py-2 rounded-lg hover:bg-cyber-cyan/10 border border-transparent hover:border-cyber-cyan/20">
                    View Full Log <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-2 h-[320px] overflow-y-auto pr-3 custom-scrollbar">
                  {loading && (
                    <div className="flex items-center justify-center h-full text-sm text-cyber-cyan/50 font-mono animate-pulse">
                      <Cpu size={16} className="mr-2 animate-spin" /> Fetching telemetry packets...
                    </div>
                  )}
                  {!loading && recentScans.length === 0 && (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500 font-mono">
                      No anomalies detected in current session.
                    </div>
                  )}
                  {recentScans.map((scan) => {
                    const isThreat = ['MEDIUM', 'HIGH', 'CRITICAL'].includes(scan.threatLevel)
                    const resultLabel = isThreat ? 'THREAT' : 'CLEAN'
                    const severityClass = SEVERITY_COLORS[scan.threatLevel] || SEVERITY_COLORS.LOW
                    
                    return (
                    <motion.div
                      key={scan.id}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      className="group relative flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.02] transition-all cursor-default overflow-hidden"
                    >
                      {/* Left Accent Bar based on severity */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${severityClass.split(' ')[2]}`} />

                      <div className="flex items-center gap-4 min-w-0 pl-2">
                        <div className="w-9 h-9 rounded-lg bg-[#030509] border border-white/10 flex items-center justify-center shrink-0">
                          <Zap size={16} className={isThreat ? 'text-red-400' : 'text-emerald-400'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-mono text-slate-200 truncate group-hover:text-white transition-colors">{scan.title}</p>
                          <p className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                            <span>ID: {scan.id.substring(0,8)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span>Conf: {scan.threatScore}%</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <span className={`text-[10px] font-orbitron font-bold px-3 py-1.5 rounded-md border ${severityClass}`}>
                          {scan.threatLevel}
                        </span>
                        <div className="text-right w-24">
                          <span className={`block text-xs font-orbitron font-black tracking-wider ${RESULT_COLORS[resultLabel]}`}>
                            {resultLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block mt-1">
                            {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </div>
              </div>
            </motion.div>

            {/* Right column */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="h-full rounded-2xl bg-[#080b11]/80 backdrop-blur-xl border border-white/[0.05] p-6 relative">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-orbitron font-bold text-sm text-white tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-cyber-cyan" />
                    THREAT TRENDS
                  </h3>
                  <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-slate-400">24H RANGE</span>
                </div>
                <div className="h-[250px] w-full">
                  <StatsChart />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}