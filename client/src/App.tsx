import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import TerminalPage from './pages/TerminalPage'
import AboutPage from './pages/AboutPage'
import { BackgroundAudio } from './components/ui/BackgroundAudio'
import { ProtectedRoute } from './components/ui/ProtectedRoute'

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
    }

    const handleMouseDown = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = 'translate(-50%, -50%) scale(0.7)'
      }
    }

    const handleMouseUp = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/terminal" 
          element={
            <ProtectedRoute>
              <TerminalPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return p + Math.random() * 15
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <BackgroundAudio />
      {isLoading ? (
        <div className="fixed inset-0 bg-cyber-bg flex flex-col items-center justify-center z-50">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-2 border-cyber-cyan/30 rounded-full animate-rotate-ring absolute inset-0" />
            <div className="w-24 h-24 border-t-2 border-cyber-cyan rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-orbitron text-cyber-cyan text-sm font-bold">T</span>
            </div>
          </div>
          <h1 className="font-orbitron text-cyber-cyan text-3xl font-black tracking-widest mb-2 text-glow-cyan">
            TARK
          </h1>
          <p className="font-mono text-cyber-cyan/60 text-xs tracking-widest mb-8">
            INITIALIZING CYBER DEFENSE SYSTEM
          </p>
          <div className="w-64 h-1 bg-cyber-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all duration-200 rounded-full"
              style={{ width: `${Math.min(loadProgress, 100)}%` }}
            />
          </div>
          <p className="font-mono text-cyber-cyan/40 text-xs mt-3 tracking-wider">
            {Math.min(Math.round(loadProgress), 100)}% LOADED
          </p>
        </div>
      ) : (
        <BrowserRouter>
          <CustomCursor />
          {/* <div className="scan-line" /> */}
          <AnimatedRoutes />
        </BrowserRouter>
      )}
    </>
  )
}
