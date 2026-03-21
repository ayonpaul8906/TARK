// hooks/useInvestigationHistory.ts
// Manages fetching, loading, and deleting investigation history from Firestore.

import { useState, useEffect, useCallback } from 'react'
import { auth } from '../lib/firebase'
import {
  getInvestigations,
  deleteInvestigation,
  renameInvestigation,
  type InvestigationRecord,
} from '../lib/firestoreService'

export function useInvestigationHistory() {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = auth.currentUser?.uid

  /** Fetch all investigations for the current user */
  const fetchInvestigations = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getInvestigations(userId)
      setInvestigations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [userId])

  /** Delete a single investigation and refresh */
  const removeInvestigation = useCallback(async (investigationId: string) => {
    if (!userId) return
    try {
      await deleteInvestigation(userId, investigationId)
      setInvestigations(prev => prev.filter(i => i.id !== investigationId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }, [userId])

  /** Rename a single investigation optimistically */
  const editTitle = useCallback(async (investigationId: string, newTitle: string) => {
    if (!userId) return
    try {
      // Optimistic update
      setInvestigations(prev =>
        prev.map(i => i.id === investigationId ? { ...i, title: newTitle } : i)
      )
      await renameInvestigation(userId, investigationId, newTitle)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename')
      fetchInvestigations() // revert by re-fetching
    }
  }, [userId, fetchInvestigations])

  // Auto-fetch on mount / when the signed-in user changes
  useEffect(() => {
    fetchInvestigations()
  }, [fetchInvestigations])

  return {
    investigations,
    loading,
    error,
    fetchInvestigations,
    removeInvestigation,
    editTitle,
  }
}
