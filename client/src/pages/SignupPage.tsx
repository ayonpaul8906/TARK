import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Shield, Eye, EyeOff, ArrowRight, Building, CheckCircle, AlertCircle } from 'lucide-react'
import { PageTransition } from '../components/motion/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { SkeuomorphicInput } from '../components/ui/SkeuomorphicInput'
import { NeoBrutalButton } from '../components/ui/NeoBrutalButton'
import { ParticleField } from '../components/3d/ParticleField'
import { useAppStore } from '../store/useAppStore'

// --- FIREBASE IMPORTS ---
import { auth } from '../lib/firebase' 
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth'

const PERKS = [
  'Unlimited threat scans',
  '4 AI agents: SENTINEL, CIPHER, PHANTOM, NEXUS',
  'Real-time streaming intelligence',
  'Counter-response automation',
  'Global threat graph access',
]

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const login = useAppStore(s => s.login)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name required'
    if (!email.trim() || !email.includes('@')) e.email = 'Valid email required'
    if (password.length < 8) e.password = 'Minimum 8 characters'
    if (password !== confirmPw) e.confirmPw = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // --- FIREBASE EMAIL/PASSWORD SIGNUP ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    setErrors({}) // Clear previous errors

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Optional: Update Firebase profile with the provided name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name })
      }

      // Update your local app store
      login({ 
        name: name, 
        email: userCredential.user.email || email, 
        role: 'OPERATOR' 
      })
      
      navigate('/home')
    } catch (err: any) {
      // Handle specific Firebase error codes
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered.' })
      } else if (err.code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak.' })
      } else {
        setErrors({ general: err.message || 'Failed to create account.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // --- FIREBASE GOOGLE SIGNUP ---
  const handleGoogleSignup = async () => {
    setLoading(true)
    setErrors({})
    const provider = new GoogleAuthProvider()
    
    try {
      const result = await signInWithPopup(auth, provider)
      
      login({ 
        name: result.user.displayName || 'Operator', 
        email: result.user.email || '', 
        role: 'OPERATOR' 
      })
      
      navigate('/home')
    } catch (err: any) {
      setErrors({ general: err.message || 'Google sign-in failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative overflow-hidden px-4 py-12">
        <ParticleField />
        <div className="absolute inset-0 cyber-grid-bg opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyber-cyan/6 rounded-full blur-[120px]" />

        <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 group">
          <Shield size={20} className="text-cyber-cyan" />
          <span className="font-orbitron font-black text-white tracking-widest group-hover:text-cyber-cyan transition-colors">TARK</span>
        </Link>

        <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Perks */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <p className="text-[10px] font-orbitron tracking-widest text-cyber-cyan/60 uppercase mb-4">Request Access</p>
            <h2 className="font-orbitron font-black text-4xl text-white leading-tight mb-6">
              Join the <br />
              <span className="text-cyber-cyan text-glow-cyan">Cyber Defense</span>
              <br />Command
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              TARK grants access to enterprise-grade AI cybersecurity infrastructure.
              Every account comes fully loaded.
            </p>
            <div className="space-y-3">
              {PERKS.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle size={16} className="text-cyber-cyan shrink-0" />
                  {perk}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <GlassCard animate className="p-8" glowColor="cyan">
            <div className="text-center mb-6">
              <h1 className="font-orbitron font-black text-xl text-white tracking-wider">
                CREATE ACCOUNT
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-1">Secure access in under 60 seconds</p>
            </div>

            {/* General Error Display */}
            {errors.general && (
              <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 rounded flex items-center gap-2 text-red-400 text-sm font-mono">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
                <SkeuomorphicInput
                  label="Full Name"
                  type="text"
                  icon={User}
                  placeholder="John Cipher"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  error={errors.name}
                />

              <SkeuomorphicInput
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@organization.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
              />

              <div className="relative">
                <SkeuomorphicInput
                  label="Access Code"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-3 text-slate-500 hover:text-cyber-cyan transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <SkeuomorphicInput
                label="Confirm Access Code"
                type="password"
                icon={Lock}
                placeholder="Repeat password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                error={errors.confirmPw}
              />

              {/* Password strength */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all"
                        style={{
                          backgroundColor:
                            password.length > i * 3
                              ? i < 1 ? '#FF4D4D' : i < 2 ? '#F59E0B' : i < 3 ? '#7B61FF' : '#00F5D4'
                              : 'rgba(30,45,69,0.5)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-mono text-slate-600">
                    {password.length < 4 ? 'Weak' : password.length < 8 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              <NeoBrutalButton
                type="submit"
                fullWidth
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                loading={loading}
              >
                Activate Account
              </NeoBrutalButton>
            </form>

            {/* Google Signup Divider */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-xs font-mono text-slate-500 uppercase">Or bypass with</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
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
                Already have access?{' '}
                <Link to="/login" className="text-cyber-cyan hover:opacity-80 transition-opacity font-semibold">
                  Login
                </Link>
              </p>
            </div>

            <p className="text-center text-[9px] font-mono text-slate-700 mt-4">
              By creating an account, you agree to TARK's Security Usage Policy
            </p>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}