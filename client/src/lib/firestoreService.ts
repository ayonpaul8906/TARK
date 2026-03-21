// lib/firestoreService.ts
// All Firestore CRUD operations for TARK investigations.
//
// Data model:
//   users/{userId}/investigations/{investigationId}
//     title          : string   (auto-generated first 60 chars of inputText)
//     createdAt      : Timestamp
//     inputText      : string
//     osint          : string
//     psychology     : string
//     policy         : string
//     verdict        : string
//     hash           : string
//     threatLevel    : ThreatLevel
//     threatScore    : number
//     blockchainStored: boolean
//     txId           : string | undefined

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ThreatLevel, AnalysisResult } from '../store/useAppStore'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserStats {
  scansToday: number
  lastScanDate: string
  activeThreats: number
  threatLevel: ThreatLevel
  threatScore: number
}


export interface InvestigationRecord {
  id: string
  title: string
  createdAt: string        // ISO string — converted from Firestore Timestamp
  inputText: string
  osint: string
  psychology: string
  policy: string
  verdict: string
  hash: string
  threatLevel: ThreatLevel
  threatScore: number
  blockchainStored: boolean
  txId?: string
}

// Raw Firestore document shape (before id injection)
interface InvestigationDoc {
  title: string
  createdAt: Timestamp
  inputText: string
  osint: string
  psychology: string
  policy: string
  verdict: string
  hash: string
  threatLevel: ThreatLevel
  threatScore: number
  blockchainStored: boolean
  txId?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build the Firestore collection ref for a user's investigations */
const investigationsRef = (userId: string) =>
  collection(db, 'users', userId, 'investigations')

/** Generate a readable title from the raw input text */
const buildTitle = (inputText: string): string => {
  const clean = inputText.replace(/\s+/g, ' ').trim()
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean || 'Untitled Investigation'
}

/** Convert a Firestore doc snapshot to InvestigationRecord */
const fromSnapshot = (id: string, data: InvestigationDoc): InvestigationRecord => ({
  id,
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
})

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Save a completed investigation to Firestore.
 * Returns the new document ID.
 */
export async function saveInvestigation(
  userId: string,
  result: AnalysisResult,
  threatLevel: ThreatLevel,
  threatScore: number,
): Promise<string> {
  const docData: Omit<InvestigationDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    title: buildTitle(result.inputText),
    createdAt: serverTimestamp() as any,
    inputText: result.inputText,
    osint: result.osint,
    psychology: result.psychology,
    policy: result.policy,
    verdict: result.verdict,
    hash: result.hash,
    threatLevel,
    threatScore,
    blockchainStored: result.blockchainStored,
    txId: result.txId,
  }

  const ref = await addDoc(investigationsRef(userId), docData)
  return ref.id
}

/**
 * Fetch all investigations for a user, sorted newest-first.
 */
export async function getInvestigations(userId: string): Promise<InvestigationRecord[]> {
  const q = query(investigationsRef(userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => fromSnapshot(d.id, d.data() as InvestigationDoc))
}

/**
 * Fetch a single investigation by ID.
 */
export async function getInvestigation(userId: string, investigationId: string): Promise<InvestigationRecord | null> {
  const ref = doc(db, 'users', userId, 'investigations', investigationId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return fromSnapshot(snap.id, snap.data() as InvestigationDoc)
}

/**
 * Delete an investigation.
 */
export async function deleteInvestigation(userId: string, investigationId: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'investigations', investigationId)
  await deleteDoc(ref)
}

/**
 * Rename an investigation's title.
 */
export async function renameInvestigation(userId: string, investigationId: string, newTitle: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'investigations', investigationId)
  await updateDoc(ref, { title: newTitle })
}

/**
 * Update user overview stats (Scans Today, Active Threats, Threat Level)
 */
export async function updateUserStats(
  userId: string,
  resultThreatLevel: ThreatLevel,
  resultThreatScore: number
): Promise<void> {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  
  const today = new Date().toISOString().split('T')[0] // local YYYY-MM-DD

  let scansToday = 1
  let activeThreats = 0
  const isThreat = ['MEDIUM', 'HIGH', 'CRITICAL'].includes(resultThreatLevel)

  if (snap.exists()) {
    const data = snap.data() as Partial<UserStats>

    // Reset scans if it's a new day
    if (data.lastScanDate === today) {
      scansToday = (data.scansToday || 0) + 1
    }

    activeThreats = (data.activeThreats || 0) + (isThreat ? 1 : 0)
  } else {
    activeThreats = isThreat ? 1 : 0
  }

  await setDoc(userRef, {
    scansToday,
    lastScanDate: today,
    activeThreats,
    threatLevel: resultThreatLevel,
    threatScore: resultThreatScore,
  }, { merge: true })
}

