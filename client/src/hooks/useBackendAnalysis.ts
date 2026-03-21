// hooks/useBackendAnalysis.ts
// Hook to handle analysis requests to the backend /analyze endpoint

import { useCallback } from 'react'
import { analyzeText, analyzeFile, parseVerdict, AnalysisResponse, ThreatVerdictData } from '../lib/api'
import { useAppStore } from '../store/useAppStore'
import { saveInvestigation, updateUserStats } from '../lib/firestoreService'
import { auth } from '../lib/firebase'

export interface BackendAnalysisState {
  isLoading: boolean
  error: string | null
  result: AnalysisResponse | null
}

export function useBackendAnalysis() {
  const { addLog, setThreatLevel, setThreatScore, addThreat, stopInvestigation, setAnalysisResult } =
    useAppStore()

  const analyzeBackend = useCallback(
    async (text: string): Promise<AnalysisResponse | null> => {
      try {
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'BACKEND',
          message: 'Connecting to analysis backend...',
        })

        const result = await analyzeText(text)

        // Log OSINT results
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'OSINT',
          message: 'OSINT analysis complete',
        })
        addLog({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: (result.analysis.osint || 'No OSINT data').slice(0, 100) + '...',
        })

        // Log Policy results
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'POLICY',
          message: 'Policy analysis complete',
        })

        // Log Psychology results
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'PSYCHOLOGY',
          message: 'Psychological analysis complete',
        })

        // Parse and log verdict
        const verdictData = parseVerdict(result.verdict)

        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'JUDGE',
          message: `Verdict: ${verdictData.scamType}`,
        })

        // Update threat level and score
        setThreatLevel(verdictData.threatLevel)
        setThreatScore(verdictData.confidence)

        // Add threat to threat panel
        addThreat({
          type: verdictData.scamType,
          severity: verdictData.threatLevel,
          source: 'Backend Analysis',
          timestamp: new Date().toISOString(),
          status: 'INVESTIGATING',
          confidence: verdictData.confidence,
        })

        // Store the full analysis result for detail view
        setAnalysisResult({
          inputText: result.input_text,
          osint: result.analysis.osint,
          psychology: result.analysis.psychology,
          policy: result.analysis.policy,
          verdict: result.verdict,
          hash: result.hash,
          blockchainStored: result.blockchain.stored,
          txId: result.blockchain.tx_id,
        })

        // Log blockchain info if stored
        if (result.blockchain.stored) {
          addLog({
            timestamp: new Date().toISOString(),
            level: 'SUCCESS',
            agent: 'BLOCKCHAIN',
            message: `Hash stored on Algorand: ${result.blockchain.tx_id}`,
          })
        }

        // ── Persist to Firestore ────────────────────────────────────────
        const currentUser = auth.currentUser
        if (currentUser) {
          try {
            const investigationId = await saveInvestigation(
              currentUser.uid,
              {
                inputText: result.input_text,
                osint: result.analysis.osint,
                psychology: result.analysis.psychology,
                policy: result.analysis.policy,
                verdict: result.verdict,
                hash: result.hash,
                blockchainStored: result.blockchain.stored,
                txId: result.blockchain.tx_id,
              },
              verdictData.threatLevel,
              verdictData.confidence,
            )
            
            await updateUserStats(currentUser.uid, verdictData.threatLevel, verdictData.confidence)

            addLog({
              timestamp: new Date().toISOString(),
              level: 'SUCCESS',
              agent: 'DATABASE',
              message: `Investigation saved to Firestore [${investigationId}]`,
            })
          } catch (dbErr) {
            // Non-fatal — log but don't throw
            addLog({
              timestamp: new Date().toISOString(),
              level: 'WARN',
              agent: 'DATABASE',
              message: `Firestore save failed: ${dbErr instanceof Error ? dbErr.message : 'Unknown error'}`,
            })
          }
        }

        // Final success message
        addLog({
          timestamp: new Date().toISOString(),
          level: 'SUCCESS',
          message: 'Analysis complete — Threat report ready',
        })

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        addLog({
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          message: `Backend analysis failed: ${errorMessage}`,
        })

        throw error
      } finally {
        stopInvestigation()
      }
    },
    [addLog, setThreatLevel, setThreatScore, addThreat, stopInvestigation, setAnalysisResult],
  )

  /**
   * analyzeFileBackend — sends an image or audio File as multipart/form-data.
   * The backend extracts text via vision_service / audio_service, then runs the
   * same full pipeline as for text input.
   */
  const analyzeFileBackend = useCallback(
    async (file: File): Promise<AnalysisResponse | null> => {
      try {
        const fileType = file.type.startsWith('image') ? 'IMAGE' : 'AUDIO'

        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'BACKEND',
          message: `Uploading ${fileType} file to analysis backend...`,
        })

        const result = await analyzeFile(file)

        // Log what the backend extracted
        addLog({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          agent: fileType === 'IMAGE' ? 'VISION' : 'AUDIO',
          message: `Extracted text: ${(result.input_text || '').slice(0, 120)}...`,
        })

        // Log OSINT results
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'OSINT',
          message: 'OSINT analysis complete',
        })
        addLog({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: (result.analysis.osint || 'No OSINT data').slice(0, 100) + '...',
        })

        // Log Policy & Psychology results
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'POLICY',
          message: 'Policy analysis complete',
        })
        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'PSYCHOLOGY',
          message: 'Psychological analysis complete',
        })

        // Parse verdict
        const verdictData = parseVerdict(result.verdict)

        addLog({
          timestamp: new Date().toISOString(),
          level: 'AGENT',
          agent: 'JUDGE',
          message: `Verdict: ${verdictData.scamType}`,
        })

        // Update threat level and score
        setThreatLevel(verdictData.threatLevel)
        setThreatScore(verdictData.confidence)

        // Add threat to threat panel
        addThreat({
          type: verdictData.scamType,
          severity: verdictData.threatLevel,
          source: `${fileType} Analysis`,
          timestamp: new Date().toISOString(),
          status: 'INVESTIGATING',
          confidence: verdictData.confidence,
        })

        // Store analysis result
        setAnalysisResult({
          inputText: result.input_text,
          osint: result.analysis.osint,
          psychology: result.analysis.psychology,
          policy: result.analysis.policy,
          verdict: result.verdict,
          hash: result.hash,
          blockchainStored: result.blockchain.stored,
          txId: result.blockchain.tx_id,
        })

        // Log blockchain info if stored
        if (result.blockchain.stored) {
          addLog({
            timestamp: new Date().toISOString(),
            level: 'SUCCESS',
            agent: 'BLOCKCHAIN',
            message: `Hash stored on Algorand: ${result.blockchain.tx_id}`,
          })
        }

        // ── Persist to Firestore ────────────────────────────────────────
        const currentUser = auth.currentUser
        if (currentUser) {
          try {
            const investigationId = await saveInvestigation(
              currentUser.uid,
              {
                inputText: `[FILE ANALYSIS] ${file.name}`,
                osint: result.analysis.osint,
                psychology: result.analysis.psychology,
                policy: result.analysis.policy,
                verdict: result.verdict,
                hash: result.hash,
                blockchainStored: result.blockchain.stored,
                txId: result.blockchain.tx_id,
              },
              verdictData.threatLevel,
              verdictData.confidence,
            )
            
            await updateUserStats(currentUser.uid, verdictData.threatLevel, verdictData.confidence)

            addLog({
              timestamp: new Date().toISOString(),
              level: 'SUCCESS',
              agent: 'DATABASE',
              message: `Investigation saved to Firestore [${investigationId}]`,
            })
          } catch (dbErr) {
            addLog({
              timestamp: new Date().toISOString(),
              level: 'WARN',
              agent: 'DATABASE',
              message: `Firestore save failed: ${dbErr instanceof Error ? dbErr.message : 'Unknown error'}`,
            })
          }
        }

        addLog({
          timestamp: new Date().toISOString(),
          level: 'SUCCESS',
          message: 'Analysis complete — Threat report ready',
        })

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        addLog({
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          message: `File analysis failed: ${errorMessage}`,
        })

        throw error
      } finally {
        stopInvestigation()
      }
    },
    [addLog, setThreatLevel, setThreatScore, addThreat, stopInvestigation, setAnalysisResult],
  )

  return { analyzeBackend, analyzeFileBackend }
}
