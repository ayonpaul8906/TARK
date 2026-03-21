import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAppStore } from '../../store/useAppStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, login, logout } = useAppStore()
  // Start in a "checking" state so we don't flash a redirect
  // before Firebase has resolved the persisted session.
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // onAuthStateChanged fires once immediately with the current Firebase
    // auth state (from its own IndexedDB/localStorage persistence).
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase has a valid session — make sure Zustand is in sync
        // (handles the case where localStorage was cleared but Firebase wasn't)
        login({
          name: firebaseUser.displayName || 'Operator',
          email: firebaseUser.email || '',
          role: 'OPERATOR',
        })
      } else {
        // Firebase has no session — clear any stale Zustand/localStorage data
        logout()
      }
      setAuthChecked(true)
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // While Firebase is resolving the session, show the TARK boot screen
  // instead of incorrectly redirecting to /login
  if (!authChecked) {
    return (
      <div className="fixed inset-0 bg-cyber-bg flex flex-col items-center justify-center z-50">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-2 border-cyber-cyan/30 rounded-full animate-rotate-ring absolute inset-0" />
          <div className="w-16 h-16 border-t-2 border-cyber-cyan rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-orbitron text-cyber-cyan text-xs font-bold">T</span>
          </div>
        </div>
        <p className="font-mono text-cyber-cyan/60 text-xs tracking-widest">VERIFYING SESSION...</p>
      </div>
    )
  }

  // Auth resolved — gate on user presence
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}