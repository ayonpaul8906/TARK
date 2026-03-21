import { useState, useEffect } from 'react'
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { UserStats, InvestigationRecord } from '../lib/firestoreService'

export function useDashboardStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentScans, setRecentScans] = useState<InvestigationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async (uid: string) => {
      setLoading(true)
      try {
        // Fetch Stats
        const userRef = doc(db, 'users', uid)
        const snap = await getDoc(userRef)
        
        let currentStats: UserStats = {
          scansToday: 0,
          lastScanDate: '',
          activeThreats: 0,
          threatLevel: 'LOW',
          threatScore: 0,
        }

        if (snap.exists()) {
          const data = snap.data() as UserStats
          const today = new Date().toISOString().split('T')[0]
          currentStats = {
            ...currentStats,
            ...data,
            scansToday: data.lastScanDate === today ? data.scansToday || 0 : 0
          }
        }
        setStats(currentStats)

        // Fetch Recent Scans (e.g. top 25 for scrolling)
        const invRef = collection(db, 'users', uid, 'investigations')
        const q = query(invRef, orderBy('createdAt', 'desc'), limit(25))
        const invSnap = await getDocs(q)
        
        const scans = invSnap.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            title: data.title,
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
            inputText: data.inputText,
            osint: data.osint,
            psychology: data.psychology,
            policy: data.policy,
            verdict: data.verdict,
            hash: data.hash,
            threatLevel: data.threatLevel,
            threatScore: data.threatScore,
            blockchainStored: data.blockchainStored,
            txId: data.txId,
          } as InvestigationRecord
        })

        setRecentScans(scans)
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDashboardData(user.uid)
      } else {
        setStats(null)
        setRecentScans([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { stats, recentScans, loading }
}
