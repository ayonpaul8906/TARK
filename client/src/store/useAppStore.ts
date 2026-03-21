import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface LogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'AGENT'
  message: string
  agent?: string
}

export interface ThreatData {
  id: string
  type: string
  severity: ThreatLevel
  source: string
  timestamp: string
  status: 'ACTIVE' | 'MITIGATED' | 'INVESTIGATING'
  confidence: number
}

export interface AnalysisResult {
  inputText: string
  osint: string
  psychology: string
  policy: string
  verdict: string
  hash: string
  blockchainStored: boolean
  txId?: string
}

export interface AppState {
  // Auth
  isAuthenticated: boolean
  user: { name: string; email: string; role: string } | null

  // Investigation
  isInvestigating: boolean
  investigationQuery: string
  logs: LogEntry[]
  threats: ThreatData[]
  threatLevel: ThreatLevel
  threatScore: number
  analysisResult: AnalysisResult | null

  // UI
  activePanel: string
  sidebarOpen: boolean

  // Actions
  login: (user: { name: string; email: string; role: string }) => void
  logout: () => void
  startInvestigation: (query: string) => void
  stopInvestigation: () => void
  addLog: (log: Omit<LogEntry, 'id'>) => void
  clearLogs: () => void
  addThreat: (threat: Omit<ThreatData, 'id'>) => void
  setThreatLevel: (level: ThreatLevel) => void
  setThreatScore: (score: number) => void
  setAnalysisResult: (result: AnalysisResult | null) => void
  setActivePanel: (panel: string) => void
  toggleSidebar: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isInvestigating: false,
      investigationQuery: '',
      logs: [],
      threats: [
        {
          id: '1',
          type: 'SQL Injection Attempt',
          severity: 'HIGH',
          source: '192.168.1.45',
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
          confidence: 94,
        },
        {
          id: '2',
          type: 'DDoS Pattern Detected',
          severity: 'CRITICAL',
          source: '10.0.0.x/24',
          timestamp: new Date().toISOString(),
          status: 'INVESTIGATING',
          confidence: 87,
        },
        {
          id: '3',
          type: 'Phishing Email Campaign',
          severity: 'MEDIUM',
          source: 'external-smtp-relay',
          timestamp: new Date().toISOString(),
          status: 'MITIGATED',
          confidence: 99,
        },
      ],
      threatLevel: 'LOW',
      threatScore: 0,
      analysisResult: null,
      activePanel: 'input',
      sidebarOpen: true,

      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      startInvestigation: (query) => set({ isInvestigating: true, investigationQuery: query, logs: [] }),
      stopInvestigation: () => set({ isInvestigating: false }),
      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { ...log, id: generateId() },
          ].slice(-200),
        })),
      clearLogs: () => set({ logs: [] }),
      addThreat: (threat) =>
        set((state) => ({
          threats: [{ ...threat, id: generateId() }, ...state.threats],
        })),
      setThreatLevel: (level) => set({ threatLevel: level }),
      setThreatScore: (score) => set({ threatScore: score }),
      setAnalysisResult: (result) => set({ analysisResult: result }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'tark-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist auth state — everything else is session data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
)
