import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Terminal, Activity, Settings, Bell, User, LogOut, ChevronLeft, History } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/motion/PageTransition'
import { InputPanel } from '../components/dashboard/InputPanel'
import { InvestigationTerminal } from '../components/dashboard/InvestigationTerminal'
import { ResultsPanel } from '../components/dashboard/ResultsPanel'
import { ThreatPanel } from '../components/dashboard/ThreatPanel'
import { CounterResponse } from '../components/dashboard/CounterResponse'
import { InvestigationHistory } from '../components/dashboard/InvestigationHistory'
import { useAppStore } from '../store/useAppStore'

const AGENT_STATUS = [
  { name: 'SENTINEL', status: 'ACTIVE', color: '#00F5D4' },
  { name: 'CIPHER', status: 'ACTIVE', color: '#7B61FF' },
  { name: 'PHANTOM', status: 'STANDBY', color: '#FF4D4D' },
  { name: 'NEXUS', status: 'ACTIVE', color: '#F59E0B' },
]

export default function DashboardPage() {
  const { user, threatLevel, threatScore } = useAppStore()
  const navigate = useNavigate()
  const [historyOpen, setHistoryOpen] = useState(false)

  const threatLevelColor = {
    LOW: '#00F5D4',
    MEDIUM: '#F59E0B',
    HIGH: '#FF8C00',
    CRITICAL: '#FF4D4D',
  }[threatLevel]

  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-bg text-white flex flex-col overflow-hidden">

        {/* Dashboard Topbar */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-none flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyber-border/30 bg-cyber-dark/80 backdrop-blur-xl z-40"
        >
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link to="/home" className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs font-mono">
              <ChevronLeft size={14} />
              Back
            </Link>
            <div className="w-px h-5 bg-cyber-border/50" />
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9  flex items-center justify-center">
                  <img src="/logo.png" alt="TARK" className="w-full h-full object-contain" />
                </div>
              <span className="font-orbitron font-black text-white text-sm tracking-widest">TARK</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Threat level pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-orbitron font-black"
              style={{
                color: threatLevelColor,
                borderColor: `${threatLevelColor}40`,
                backgroundColor: `${threatLevelColor}10`,
              }}
            >
              <Activity size={10} />
              {threatLevel}
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-cyber-border/30">
              <div className="w-7 h-7 rounded-lg bg-cyber-purple/20 border border-cyber-purple/30 flex items-center justify-center">
                <User size={13} className="text-cyber-purple" />
              </div>
              <span className="text-xs font-mono text-slate-400 hidden sm:block">
                {user?.name || 'Operator'}
              </span>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2 text-slate-500 hover:text-cyber-cyan transition-colors relative group"
              title="Investigation History"
            >
              <History size={15} />
              <span className="absolute -top-8 right-0 bg-cyber-dark border border-cyber-border/40 text-[9px] font-mono text-slate-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Investigation History
              </span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="p-2 text-slate-500 hover:text-cyber-alert transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </motion.header>

        {/* Main 3-column layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-4 p-4 min-h-0 overflow-hidden">

          {/* LEFT: Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="min-h-[500px] lg:min-h-0 overflow-auto"
          >
            <InputPanel />
          </motion.div>

          {/* CENTER: Terminal & Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="min-h-[500px] lg:min-h-0 overflow-hidden flex flex-col gap-4"
          >
            {/* Terminal - Compact fixed height */}
            <div className="h-[280px] shrink-0 overflow-hidden">
              <InvestigationTerminal />
            </div>
            
            {/* Results Panel - Takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ResultsPanel />
            </div>
          </motion.div>

          {/* RIGHT: Threat Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="min-h-[500px] lg:min-h-0 overflow-auto"
          >
            <ThreatPanel />
          </motion.div>
        </div>

        {/* BOTTOM: Counter Response */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-none p-4 pt-0"
        >
          <CounterResponse />
        </motion.div>

        {/* Status bar */}
        <div className="flex-none flex items-center justify-between px-6 py-1.5 border-t border-cyber-border/20 bg-cyber-dark/50">
          <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span>v4.2.0</span>
            <span className="hidden sm:block">Session: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600">
            <span className="hidden sm:block">4 Agents Active</span>
            <span>Threat Index: {threatScore}</span>
            <span
              className="font-orbitron font-black"
              style={{ color: threatLevelColor }}
            >
              {threatLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Investigation History Slide-over */}
      <InvestigationHistory isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </PageTransition>
  )
}