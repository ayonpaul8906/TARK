import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, Menu, X, Activity, Terminal, Info, LogIn, LogOut, User, Lock } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAppStore } from '../../store/useAppStore'

const navLinks = [
  { path: '/home', label: 'Home', icon: Shield, protected: true },
  { path: '/terminal', label: 'Terminal', icon: Terminal, protected: true },
  { path: '/about', label: 'About', icon: Info, protected: false },
]

export function LiquidGlassNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { scrollY } = useScroll()

  const { user, logout } = useAppStore()

  const navOpacity = useTransform(scrollY, [0, 100], [0.6, 0.95])
  const navBlur = useTransform(scrollY, [0, 100], [10, 24])

  useEffect(() => {
    const unsub = scrollY.on('change', v => setScrolled(v > 50))
    return unsub
  }, [scrollY])

  const handleLogout = async () => {
    try {
      await signOut(auth) // Clear Firebase session
    } catch (_) {
      // Ignore sign-out errors
    }
    logout()           // Clear Zustand + localStorage
    setIsOpen(false)
    navigate('/')
  }

  return (
    <>
      <motion.nav
        style={{ opacity: navOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="relative mx-4 sm:mx-8 rounded-2xl overflow-hidden">
          {/* Liquid glass background */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0d1424]/80 via-[#0b1320]/85 to-[#0d1424]/80"
            style={{ backdropFilter: `blur(20px)` }}
          />

          {/* Top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-purple/20 to-transparent" />

          {/* Animated gradient orb */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-20 bg-cyber-cyan/5 rounded-full blur-2xl animate-pulse" />

          <div className="relative flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0transition-all" />
                <div className="relative w-14 h-14  flex items-center justify-center">
                  <img src="/logo.png" alt="TARK" className="w-full h-full object-contain" />
                </div>
              </div>
              <span className="font-orbitron font-black text-xl tracking-widest text-white group-hover:text-cyber-cyan transition-colors">
                TARK
              </span>
              <span className="hidden sm:flex items-center gap-1 text-[9px] font-mono text-cyber-cyan/40 border border-cyber-cyan/20 px-2 py-0.5 rounded-full">
                <Activity size={8} />
                LIVE
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon, protected: isProtected }) => {
                const isActive = location.pathname === path
                const isLocked = isProtected && !user

                const navItemContent = (
                  <motion.div
                    whileHover={isLocked ? {} : { scale: 1.05 }}
                    whileTap={isLocked ? {} : { scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                        : isLocked
                        ? 'text-slate-600 opacity-60 cursor-not-allowed'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                    {isLocked && <Lock size={10} className="ml-1 opacity-70" />}
                  </motion.div>
                )

                // If locked, render a div so it's not clickable. Otherwise, render the Link.
                return isLocked ? (
                  <div key={path} title="Authentication required">
                    {navItemContent}
                  </div>
                ) : (
                  <Link key={path} to={path}>
                    {navItemContent}
                  </Link>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-black/20">
                    <User size={14} className="text-cyber-cyan" />
                    <span className="text-xs font-mono text-slate-300">{user.name}</span>
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-orbitron font-bold uppercase tracking-wider text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={12} />
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-orbitron font-bold uppercase tracking-wider text-cyber-cyan border border-cyber-cyan/40 rounded-xl hover:bg-cyber-cyan/10 transition-all"
                    >
                      <LogIn size={12} />
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,245,212,0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-5 py-2 text-xs font-orbitron font-black uppercase tracking-wider text-cyber-bg bg-cyber-cyan rounded-xl hover:bg-cyber-cyan/90 transition-all"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-cyber-cyan p-2"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-2 rounded-2xl glass-panel border border-cyber-cyan/20 p-4 bg-[#0a0f16]/95 backdrop-blur-xl"
          >
            {navLinks.map(({ path, label, icon: Icon, protected: isProtected }) => {
              const isLocked = isProtected && !user

              const mobileNavContent = (
                <div className={`flex items-center gap-3 px-4 py-3 text-sm font-orbitron transition-colors rounded-xl ${
                  isLocked 
                    ? 'text-slate-600 opacity-60 cursor-not-allowed' 
                    : 'text-slate-300 hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                }`}>
                  <Icon size={16} />
                  {label}
                  {isLocked && <Lock size={14} className="ml-auto opacity-70" />}
                </div>
              )

              return isLocked ? (
                <div key={path}>
                  {mobileNavContent}
                </div>
              ) : (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                >
                  {mobileNavContent}
                </Link>
              )
            })}
            
            <div className="flex gap-3 mt-4 pt-4 border-t border-cyber-border/30">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-orbitron font-bold uppercase text-red-400 border border-red-500/30 rounded-xl bg-red-500/5"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-2 text-xs font-orbitron font-bold uppercase text-cyber-cyan border border-cyber-cyan/40 rounded-xl">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-2 text-xs font-orbitron font-black uppercase text-cyber-bg bg-cyber-cyan rounded-xl">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  )
}