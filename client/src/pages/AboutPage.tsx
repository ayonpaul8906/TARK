import { motion } from 'framer-motion'
import { Shield, Cpu, Globe, Lock, Network, Zap, Terminal, Eye, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../components/motion/PageTransition'
import { LiquidGlassNavbar } from '../components/ui/LiquidGlassNavbar'
import { GlassCard } from '../components/ui/GlassCard'
import { NeoBrutalButton } from '../components/ui/NeoBrutalButton'
import { AgentNetwork3D } from '../components/3d/AgentNetwork3D'
import { ScrollSection } from '../components/motion/ScrollSection'
import { ParticleField } from '../components/3d/ParticleField'

const TIMELINE = [
  { year: '2021', event: 'TARK founded by ex-NSA & CERN researchers', color: '#00F5D4' },
  { year: '2022', event: 'SENTINEL agent deployed — first 1M threats detected', color: '#7B61FF' },
  { year: '2023', event: 'CIPHER & PHANTOM added — dark web coverage achieved', color: '#FF4D4D' },
  { year: '2024', event: 'NEXUS correlation engine released — 99.9% accuracy', color: '#F59E0B' },
  { year: '2025', event: 'v4.2 launched — real-time autonomous response', color: '#00F5D4' },
]

const TEAM = [
  { name: 'Dr. Aria Nexus', role: 'Chief AI Officer', bg: 'bg-cyber-cyan/10', border: 'border-cyber-cyan/20', initials: 'AN' },
  { name: 'Marcus Cipher', role: 'Lead Security Architect', bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/20', initials: 'MC' },
  { name: 'Yuki Phantom', role: 'Dark Web Intelligence Lead', bg: 'bg-cyber-alert/10', border: 'border-cyber-alert/20', initials: 'YP' },
  { name: 'Reza Sentinel', role: 'Head of Network Defense', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', initials: 'RS' },
]

const TECH = [
  { name: 'React + Vite', icon: Cpu, desc: 'Ultra-fast frontend with TypeScript' },
  { name: 'Three.js / R3F', icon: Globe, desc: '3D visualization & cyber globe' },
  { name: 'Framer Motion', icon: Zap, desc: 'Cinematic UI animations' },
  { name: 'Zustand', icon: Network, desc: 'Global state management' },
  { name: 'Mastra AI', icon: Terminal, desc: 'Multi-agent orchestration' },
  { name: 'GSAP', icon: Eye, desc: 'Scroll-based animations' },
]

const VALUES = [
  { icon: Shield, title: 'Defense-First', desc: 'Every design decision starts with security. TARK never compromises on protection.', color: '#00F5D4' },
  { icon: Eye, title: 'Total Visibility', desc: 'No blind spots. Every endpoint, cloud resource, and dark web forum under surveillance.', color: '#7B61FF' },
  { icon: Zap, title: 'Zero Latency', desc: 'Sub-millisecond threat detection and response. Faster than any human team.', color: '#FF4D4D' },
  { icon: Lock, title: 'Zero Trust', desc: 'Every identity verified. Every request authenticated. No exceptions.', color: '#F59E0B' },
]

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="bg-cyber-bg text-white overflow-x-hidden">
        <LiquidGlassNavbar />

        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24 pb-20">
          <ParticleField />
          <div className="absolute inset-0 cyber-grid-bg opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyber-purple/8 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
              className="w-20 h-20 rounded-3xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center mx-auto mb-8 shadow-cyber"
            >
              <Shield size={36} className="text-cyber-cyan" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-orbitron font-black text-5xl sm:text-7xl text-white mb-4"
            >
              ABOUT <span className="text-cyber-cyan text-glow-cyan">TARK</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
            >
              TARK is a next-generation AI cybersecurity platform built by former intelligence
              agency researchers and Silicon Valley engineers to defend against sophisticated,
              coordinated cyber threats.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollSection animation="slideLeft">
              <div className="space-y-6">
                <p className="text-[10px] font-orbitron tracking-widest text-cyber-cyan/60 uppercase">Our Mission</p>
                <h2 className="font-orbitron font-black text-4xl text-white leading-tight">
                  Making the Digital World
                  <span className="block text-cyber-cyan text-glow-cyan">Defensible</span>
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  We believe every organization — from startups to governments — deserves
                  enterprise-grade AI defense. TARK democratizes access to the same intelligence
                  capabilities used by nation-state security agencies.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  By combining four specialized AI agents with a unified correlation engine,
                  TARK delivers threat detection accuracy and response speed that no human
                  SOC team can match.
                </p>
                <Link to="/terminal">
                  <NeoBrutalButton icon={ArrowRight} iconPosition="right">
                    Try the Platform
                  </NeoBrutalButton>
                </Link>
              </div>
            </ScrollSection>

            <ScrollSection animation="slideRight">
              <div className="h-[400px]">
                <AgentNetwork3D />
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-gradient-to-b from-transparent via-cyber-card/10 to-transparent">
          <div className="max-w-6xl mx-auto px-6">
            <ScrollSection animation="fadeUp" className="text-center mb-16">
              <h2 className="font-orbitron font-black text-4xl text-white mb-4">Core <span className="text-cyber-purple text-glow-purple">Principles</span></h2>
            </ScrollSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map((v, i) => (
                <ScrollSection key={v.title} animation="fadeUp" delay={i * 0.1}>
                  <GlassCard className="p-6 text-center h-full" glowColor="none">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
                      style={{ backgroundColor: `${v.color}15`, borderColor: `${v.color}30` }}
                    >
                      <v.icon size={22} style={{ color: v.color }} />
                    </div>
                    <h3 className="font-orbitron font-bold text-sm text-white mb-2">{v.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                  </GlassCard>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 max-w-4xl mx-auto px-6">
          <ScrollSection animation="fadeUp" className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl text-white mb-4">
              Our <span className="text-cyber-cyan text-glow-cyan">Journey</span>
            </h2>
          </ScrollSection>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-cyan/50 via-cyber-purple/30 to-transparent" />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <ScrollSection key={item.year} animation="slideLeft" delay={i * 0.1}>
                  <div className="flex gap-6 items-start pl-0">
                    {/* Dot */}
                    <div className="relative shrink-0 mt-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border font-orbitron font-black text-xs"
                        style={{
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}40`,
                          color: item.color,
                          boxShadow: `0 0 15px ${item.color}20`,
                        }}
                      >
                        {item.year}
                      </div>
                    </div>
                    <GlassCard className="flex-1 p-4" glowColor="none">
                      <p className="text-sm text-slate-300 font-mono">{item.event}</p>
                    </GlassCard>
                  </div>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-gradient-to-b from-transparent via-cyber-card/10 to-transparent">
          <div className="max-w-5xl mx-auto px-6">
            <ScrollSection animation="fadeUp" className="text-center mb-16">
              <h2 className="font-orbitron font-black text-4xl text-white mb-4">
                The <span className="text-cyber-purple">Team</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Built by former NSA, GCHQ, and CERN researchers with a shared mission: outpace the adversary.
              </p>
            </ScrollSection>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((member, i) => (
                <ScrollSection key={member.name} animation="scale" delay={i * 0.1}>
                  <GlassCard className="p-6 text-center" glowColor="none">
                    <div className={`w-16 h-16 rounded-2xl ${member.bg} border ${member.border} flex items-center justify-center mx-auto mb-4`}>
                      <span className="font-orbitron font-black text-xl text-white">{member.initials}</span>
                    </div>
                    <p className="font-orbitron font-bold text-sm text-white mb-1">{member.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{member.role}</p>
                  </GlassCard>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-24 max-w-6xl mx-auto px-6">
          <ScrollSection animation="fadeUp" className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl text-white mb-4">
              Built With <span className="text-cyber-cyan text-glow-cyan">Excellence</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              TARK is built on a bleeding-edge technology stack designed for performance, reliability, and extensibility.
            </p>
          </ScrollSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TECH.map((tech, i) => (
              <ScrollSection key={tech.name} animation="fadeUp" delay={i * 0.08}>
                <GlassCard className="p-5 flex items-center gap-4" glowColor="cyan">
                  <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center shrink-0">
                    <tech.icon size={18} className="text-cyber-cyan" />
                  </div>
                  <div>
                    <p className="font-orbitron font-bold text-sm text-white">{tech.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{tech.desc}</p>
                  </div>
                </GlassCard>
              </ScrollSection>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-bg opacity-20" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <ScrollSection animation="scale">
              <div className="space-y-8">
                <h2 className="font-orbitron font-black text-4xl sm:text-5xl text-white">
                  Ready to <span className="text-cyber-cyan text-glow-cyan">Defend</span>?
                </h2>
                <p className="text-slate-400 text-lg">
                  Join TARK and activate your AI-powered cyber defense command center today.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/signup">
                    <NeoBrutalButton size="lg" icon={Shield}>Get Started</NeoBrutalButton>
                  </Link>
                  <Link to="/terminal">
                    <NeoBrutalButton size="lg" variant="secondary">View Terminal</NeoBrutalButton>
                  </Link>
                </div>
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-cyber-border/30 py-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-cyber-cyan" />
              <span className="font-orbitron font-black text-white tracking-widest">TARK</span>
            </div>
            <p className="text-[10px] font-mono text-slate-600">
              © 2025 TARK Defense Systems. Protecting the digital world.
            </p>
            <div className="flex gap-6 text-[10px] font-mono text-slate-600">
              <Link to="/" className="hover:text-cyber-cyan transition-colors">Home</Link>
              <Link to="/terminal" className="hover:text-cyber-cyan transition-colors">Terminal</Link>
              <Link to="/login" className="hover:text-cyber-cyan transition-colors">Login</Link>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
