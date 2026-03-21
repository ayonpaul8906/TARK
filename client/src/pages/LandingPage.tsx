import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Eye, Network, ChevronDown, ArrowRight, CheckCircle, Globe, Lock, Activity } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CyberGlobe } from '../components/3d/CyberGlobe'
import { ParticleField } from '../components/3d/ParticleField'
import { AgentNetwork3D } from '../components/3d/AgentNetwork3D'
import { FloatingPanels } from '../components/3d/FloatingPanels'
import { LiquidGlassNavbar } from '../components/ui/LiquidGlassNavbar'
import { NeoBrutalButton } from '../components/ui/NeoBrutalButton'
import { MagneticButton } from '../components/motion/MagneticButton'
import { ScrollSection } from '../components/motion/ScrollSection'
import { PageTransition } from '../components/motion/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '99.9%', label: 'Threat Detection Rate', icon: Shield },
  { value: '0.3ms', label: 'Response Latency', icon: Zap },
  { value: '2.4B+', label: 'Threats Analyzed', icon: Eye },
  { value: '4', label: 'AI Agents Active', icon: Network },
]

const FEATURES = [
  {
    icon: Shield,
    title: 'Multi-Vector Defense',
    desc: 'TARK monitors network, endpoint, cloud, and dark web simultaneously using 4 specialized AI agents.',
    color: '#00F5D4',
  },
  {
    icon: Eye,
    title: 'Real-Time Intelligence',
    desc: 'Sub-millisecond threat detection with continuous streaming analysis across all attack surfaces.',
    color: '#7B61FF',
  },
  {
    icon: Zap,
    title: 'Autonomous Response',
    desc: 'Auto-deploy countermeasures, isolate hosts, block IPs, and patch vulnerabilities without human delay.',
    color: '#FF4D4D',
  },
  {
    icon: Globe,
    title: 'Global Threat Graph',
    desc: 'Correlate attacks across 180+ countries with geospatial threat visualization and attribution.',
    color: '#F59E0B',
  },
  {
    icon: Lock,
    title: 'Zero-Trust Architecture',
    desc: 'Every request verified, every identity confirmed. TARK enforces strict access control at every layer.',
    color: '#00F5D4',
  },
  {
    icon: Activity,
    title: 'Forensic Deep Scan',
    desc: 'Cryptographic analysis, steganography detection, and memory forensics across all file types.',
    color: '#7B61FF',
  },
]

const AGENTS = [
  { name: 'SENTINEL', role: 'Threat Detection', color: '#00F5D4', desc: 'Monitors all network traffic with DPI and behavioral analysis.' },
  { name: 'CIPHER', role: 'Crypto Analysis', color: '#7B61FF', desc: 'Decodes encrypted communications and detects hidden payloads.' },
  { name: 'PHANTOM', role: 'Dark Web Intel', color: '#FF4D4D', desc: 'Crawls 847+ dark web sources tracking threat actor TTPs.' },
  { name: 'NEXUS', role: 'Correlation Engine', color: '#F59E0B', desc: 'Unifies all agent feeds into coherent threat intelligence.' },
]

function TypingHero() {
  const phrases = [
    'Detect threats in real time.',
    'Neutralize attacks instantly.',
    'Defend every surface, always.',
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const phrase = phrases[phraseIdx]
    let i = 0
    let timeout: ReturnType<typeof setTimeout>

    if (typing) {
      const interval = setInterval(() => {
        setDisplayed(phrase.slice(0, ++i))
        if (i >= phrase.length) {
          clearInterval(interval)
          timeout = setTimeout(() => setTyping(false), 2000)
        }
      }, 50)
      return () => { clearInterval(interval); clearTimeout(timeout) }
    } else {
      let i = phrase.length
      const interval = setInterval(() => {
        setDisplayed(phrase.slice(0, --i))
        if (i <= 0) {
          clearInterval(interval)
          setPhraseIdx(p => (p + 1) % phrases.length)
          setTyping(true)
        }
      }, 30)
      return () => clearInterval(interval)
    }
  }, [phraseIdx, typing])

  return (
    <span className="text-cyber-cyan text-glow-cyan">
      {displayed}
      <span className="animate-blink text-cyber-cyan">|</span>
    </span>
  )
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const globeScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.6])
  const globeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -80])

  return (
    <PageTransition>
      <div ref={containerRef} className="bg-cyber-bg text-white overflow-x-hidden">
        <LiquidGlassNavbar />

        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Particle background */}
          <ParticleField />

          {/* Grid overlay */}
          <div className="absolute inset-0 cyber-grid-bg opacity-30" />

          {/* Radial glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-cyan/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyber-purple/8 rounded-full blur-[100px] pointer-events-none" />

          {/* Globe */}
          <motion.div
            style={{ scale: globeScale, opacity: globeOpacity }}
            className="absolute inset-0 pointer-events-none"
          >
            <CyberGlobe height="h-full" />
          </motion.div>

          {/* Hero Content */}
          <motion.div
            style={{ y: heroTextY }}
            className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20"
          >
            

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl leading-none mb-6"
            >
              <span className="block text-white">TARK</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-light text-slate-400 tracking-widest mt-3">
                AI CYBER DEFENSE
              </span>
            </motion.h1>

            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-orbitron text-xl sm:text-2xl mb-10 h-10"
            >
              <TypingHero />
            </motion.div> */}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-12"
            >
              Four specialized AI agents working in concert - SENTINEL, CIPHER, PHANTOM, and NEXUS 
              to detect, analyze, and neutralize cyber threats before they breach your perimeter.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <MagneticButton>
                <Link to="/terminal">
                  <NeoBrutalButton size="lg" icon={Zap}>
                    Launch Command Center
                  </NeoBrutalButton>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/signup">
                  <NeoBrutalButton size="lg" variant="secondary">
                    Sign Up
                  </NeoBrutalButton>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/login">
                  <NeoBrutalButton size="lg" variant="ghost">
                    Login
                  </NeoBrutalButton>
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-[10px] font-mono text-slate-600"
            >
              {['SOC 2 TYPE II', 'ISO 27001', 'NIST CSF', 'GDPR COMPLIANT'].map(badge => (
                <div key={badge} className="flex items-center gap-1.5">
                  <CheckCircle size={10} className="text-cyber-cyan/50" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] font-orbitron text-slate-600 tracking-widest">SCROLL</span>
            <ChevronDown size={16} className="text-cyber-cyan/50 animate-bounce" />
          </motion.div>
        </section>

        {/* STATS */}
        <section className="relative py-24 border-y border-cyber-border/30">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-bg via-cyber-card/20 to-cyber-bg" />
          <div className="relative max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <ScrollSection key={stat.label} animation="fadeUp" delay={i * 0.1}>
                  <GlassCard className="p-6 text-center" glowColor="cyan">
                    <stat.icon size={24} className="text-cyber-cyan mx-auto mb-3 opacity-70" />
                    <div className="font-orbitron font-black text-3xl text-white text-glow-cyan mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 tracking-wider">{stat.label}</div>
                  </GlassCard>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <ScrollSection animation="fadeUp" className="text-center mb-20">
            <p className="text-[10px] font-orbitron font-semibold tracking-widest text-cyber-cyan/60 uppercase mb-4">
              Capabilities
            </p>
            <h2 className="font-orbitron font-black text-4xl sm:text-5xl text-white mb-4">
              Cyber Defense, <span className="text-cyber-cyan text-glow-cyan">Evolved</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              TARK brings military-grade AI intelligence to enterprise security.
              Every threat surface covered. Every second.
            </p>
          </ScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <ScrollSection key={f.title} animation="fadeUp" delay={i * 0.1}>
                <GlassCard
                  className="p-6 h-full group hover:scale-[1.02] transition-transform"
                  glowColor={f.color === '#00F5D4' ? 'cyan' : f.color === '#7B61FF' ? 'purple' : 'alert'}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
                    style={{ backgroundColor: `${f.color}15`, borderColor: `${f.color}30` }}
                  >
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-orbitron font-bold text-base text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </GlassCard>
              </ScrollSection>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-32 bg-gradient-to-b from-transparent via-cyber-card/10 to-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollSection animation="fadeUp" className="text-center mb-20">
              <p className="text-[10px] font-orbitron tracking-widest text-cyber-purple/60 uppercase mb-4">How It Works</p>
              <h2 className="font-orbitron font-black text-4xl sm:text-5xl text-white mb-4">
                Threat to <span className="text-cyber-purple text-glow-purple">Neutralized</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                TARK's four-agent system works in concert, each specializing in a different attack dimension.
              </p>
            </ScrollSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="h-[400px]">
                <AgentNetwork3D />
              </div>
              <div className="space-y-4">
                {AGENTS.map((agent, i) => (
                  <ScrollSection key={agent.name} animation="slideRight" delay={i * 0.15}>
                    <GlassCard className="p-5 flex items-start gap-4" glowColor="none">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-orbitron font-black text-sm"
                        style={{
                          backgroundColor: `${agent.color}15`,
                          borderColor: `${agent.color}30`,
                          color: agent.color,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-orbitron font-black text-sm" style={{ color: agent.color }}>
                            {agent.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">
                            {agent.role}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{agent.desc}</p>
                      </div>
                    </GlassCard>
                  </ScrollSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-bg opacity-20" />
          <div className="absolute inset-0 bg-radial-cyan" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <ScrollSection animation="scale">
              <motion.div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan text-xs font-orbitron tracking-widest">
                  <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" />
                  Ready to Deploy
                </div>
                <h2 className="font-orbitron font-black text-4xl sm:text-6xl text-white leading-none">
                  Enter the
                  <span className="block text-cyber-cyan text-glow-cyan">Command Center</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Join 3,000+ security teams using TARK to defend against nation-state attacks,
                  ransomware, and advanced persistent threats.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/signup">
                    <NeoBrutalButton size="lg" icon={ArrowRight} iconPosition="right">
                      Start Free Trial
                    </NeoBrutalButton>
                  </Link>
                  <Link to="/terminal">
                    <NeoBrutalButton size="lg" variant="secondary">
                      View Termianla Demo
                    </NeoBrutalButton>
                  </Link>
                </div>
              </motion.div>
            </ScrollSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-cyber-border/30 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-cyber-cyan" />
                <span className="font-orbitron font-black text-white tracking-widest">TARK</span>
              </div>
              <p className="text-[10px] font-mono text-slate-600">
                © 2025 TARK Defense Systems. All rights reserved.
              </p>
              <div className="flex gap-6 text-[10px] font-mono text-slate-600">
                <a href="#" className="hover:text-cyber-cyan transition-colors">Privacy</a>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Terms</a>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
