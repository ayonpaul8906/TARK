// hooks/useAgentStream.ts
import { useCallback, useRef, useState } from 'react'
import { mastraClient, TARK_AGENTS } from '../lib/mastraClient'
import { useAppStore } from '../store/useAppStore'

export interface StreamState {
  isStreaming: boolean
  currentAgent: string | null
  currentText: string
  error: string | null
}

export function useAgentStream() {
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    currentAgent: null,
    currentText: '',
    error: null,
  })

  const abortRef = useRef(false)
  const { addLog, setThreatScore, setThreatLevel, addThreat, stopInvestigation } =
    useAppStore()

  const streamAgent = useCallback(
    async (query: string) => {
      abortRef.current = false
      setStreamState({
        isStreaming: true,
        currentAgent: null,
        currentText: '',
        error: null,
      })

      const agents = Object.values(TARK_AGENTS)

      try {
        for (const agent of agents) {
          if (abortRef.current) break

          setStreamState(s => ({
            ...s,
            currentAgent: agent.name,
            currentText: '',
          }))

          addLog({
            timestamp: new Date().toISOString(),
            level: 'AGENT',
            message: `Activating ${agent.name} — ${agent.role}`,
            agent: agent.name,
          })

          await new Promise<void>((resolve, reject) => {
            let done = false

            const resolveOnce = () => {
              if (done) return
              done = true
              resolve()
            }

            mastraClient
              .streamAgent({
                agentId: agent.id,
                messages: [{ role: 'user', content: query }],
                onChunk: (chunk: string) => {
                  if (abortRef.current) {
                    reject(new Error('Aborted'))
                    return
                  }

                  setStreamState(s => ({
                    ...s,
                    currentText: s.currentText + chunk,
                  }))
                },
                onComplete: () => {
                  if (abortRef.current) {
                    reject(new Error('Aborted'))
                    return
                  }

                  addLog({
                    timestamp: new Date().toISOString(),
                    level: 'SUCCESS',
                    message: `${agent.name} analysis complete`,
                    agent: agent.name,
                  })

                  const score = Math.floor(60 + Math.random() * 35)
                  setThreatScore(score)
                  if (score > 90) setThreatLevel('CRITICAL')
                  else if (score > 75) setThreatLevel('HIGH')
                  else if (score > 50) setThreatLevel('MEDIUM')
                  else setThreatLevel('LOW')

                  resolveOnce()
                },
                onError: (err: any) => {
                  if (abortRef.current) {
                    reject(
                      err instanceof Error
                        ? err
                        : new Error(typeof err === 'string' ? err : 'Aborted'),
                    )
                    return
                  }

                  addLog({
                    timestamp: new Date().toISOString(),
                    level: 'ERROR',
                    message: `${agent.name} stream error: ${
                      err?.message ?? String(err)
                    }`,
                    agent: agent.name,
                  })

                  resolveOnce()
                },
              })
              .catch(err => {
                reject(err)
              })
          })

          if (!abortRef.current) {
            await new Promise(r => setTimeout(r, 300))
          }
        }

        if (!abortRef.current) {
          addLog({
            timestamp: new Date().toISOString(),
            level: 'SUCCESS',
            message: 'Investigation complete — Threat intelligence report ready',
          })

          addThreat({
            type: `Analyzed: ${query.slice(0, 40)}`,
            severity: 'HIGH',
            source: 'Multi-vector',
            timestamp: new Date().toISOString(),
            status: 'INVESTIGATING',
            confidence: Math.floor(80 + Math.random() * 20),
          })

          stopInvestigation()
        }
      } catch (err) {
        if (!abortRef.current) {
          setStreamState(s => ({
            ...s,
            error: err instanceof Error ? err.message : 'Stream failed',
          }))
          stopInvestigation()
        }
      } finally {
        setStreamState(s => ({
          ...s,
          isStreaming: false,
          currentAgent: null,
        }))
      }
    },
    [addLog, setThreatScore, setThreatLevel, addThreat, stopInvestigation],
  )

  const stopStream = useCallback(() => {
    abortRef.current = true
    setStreamState(s => ({
      ...s,
      isStreaming: false,
      currentAgent: null,
    }))
    stopInvestigation()
    addLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: 'Investigation manually terminated by operator',
    })
  }, [addLog, stopInvestigation])

  return { streamState, streamAgent, stopStream }
}