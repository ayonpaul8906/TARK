import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, Eye, EyeOff, ArrowRight, Terminal } from 'lucide-react'
import { PageTransition } from '../components/motion/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { SkeuomorphicInput } from '../components/ui/SkeuomorphicInput'
import { NeoBrutalButton } from '../components/ui/NeoBrutalButton'
import { ParticleField } from '../components/3d/ParticleField'
import { useAppStore } from '../store/useAppStore'

// --- FIREBASE IMPORTS ---
import { auth } from '../lib/firebase' // Adjust this path if needed
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const navigate = useNavigate()
  const login = useAppStore(s => s.login)

  const appendLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg])

  // --- FIREBASE EMAIL/PASSWORD LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setLogs([])

    appendLog('> Initiating secure handshake...')
    await new Promise(r => setTimeout(r, 400)) // Artificial delay for aesthetic
    appendLog('> Verifying identity credentials...')

    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      appendLog('> ACCESS GRANTED — Welcome, Operator')
      await new Promise(r => setTimeout(r, 600))
      
      // Update global store
      login({ 
        name: userCredential.user.displayName || 'Operator', 
        email: userCredential.user.email || email, 
        role: 'OPERATOR' 
      })
      navigate('/home')
      
    } catch (err: any) {
      appendLog('> AUTHENTICATION FAILED — Access Denied')
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid credentials. Access denied.')
      } else {
        setError(err.message || 'Authentication failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  // --- FIREBASE GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    setLogs([])
    appendLog('> Initializing Google Uplink...')

    const provider = new GoogleAuthProvider()

    try {
      const result = await signInWithPopup(auth, provider)
      appendLog('> EXTERNAL OAUTH GRANTED')
      await new Promise(r => setTimeout(r, 400))

      login({ 
        name: result.user.displayName || 'Operator', 
        email: result.user.email || '', 
        role: 'OPERATOR' 
      })
      
      navigate('/home')
    } catch (err: any) {
      appendLog('> UPLINK FAILED')
      setError(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative overflow-hidden px-4">
        <ParticleField />
        <div className="absolute inset-0 cyber-grid-bg opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-purple/8 rounded-full blur-[100px]" />

        {/* Logo */}
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 group">
          <Shield size={20} className="text-cyber-cyan" />
          <span className="font-orbitron font-black text-white tracking-widest group-hover:text-cyber-cyan transition-colors">TARK</span>
        </Link>

        <div className="relative z-10 w-full max-w-md">
          {/* Main card */}
          <GlassCard animate className="p-8" glowColor="cyan">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center mx-auto mb-4 shadow-cyber"
              >
                <Shield size={28} className="text-cyber-cyan" />
              </motion.div>
              <h1 className="font-orbitron font-black text-2xl text-white tracking-wider mb-2">
                OPERATOR LOGIN
              </h1>
              <p className="text-xs font-mono text-slate-500">
                Secure access to TARK Command Center
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <SkeuomorphicInput
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="operator@tark.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                error={error && !email ? 'Email required' : undefined}
              />

              <div className="relative">
                <SkeuomorphicInput
                  label="Access Code"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-3 text-slate-500 hover:text-cyber-cyan transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-mono text-cyber-alert flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-cyber-alert rounded-full animate-pulse" />
                  {error}
                </motion.p>
              )}

              {/* Terminal log */}
              {logs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl bg-cyber-dark/70 border border-cyber-border/40 p-3 space-y-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal size={11} className="text-cyber-cyan/60" />
                    <span className="text-[9px] font-orbitron text-cyber-cyan/50 tracking-widest">AUTH LOG</span>
                  </div>
                  {logs.map((log, i) => (
                    <p key={i} className="text-[10px] font-mono text-slate-500">{log}</p>
                  ))}
                </motion.div>
              )}

              <NeoBrutalButton
                type="submit"
                fullWidth
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                loading={loading}
              >
                Authenticate
              </NeoBrutalButton>
            </form>

            {/* Google Login Divider */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-xs font-mono text-slate-500 uppercase">Or bypass with</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full py-3 px-4 bg-transparent border border-slate-700 hover:border-cyber-cyan hover:bg-cyber-cyan/5 rounded text-white font-mono text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Initialize Google Uplink
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs font-mono text-slate-600">
                No account?{' '}
                <Link to="/signup" className="text-cyber-cyan hover:text-cyber-cyan/80 transition-colors font-semibold">
                  Request access
                </Link>
              </p>
            </div>
          </GlassCard>

          {/* Security notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[9px] font-mono text-slate-700 mt-4"
          >
            🔒 End-to-end encrypted • Zero-knowledge auth • SOC 2 Type II certified
          </motion.p>
        </div>
      </div>
    </PageTransition>
  )
}