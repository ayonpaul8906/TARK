/// <reference types="vite/client" />

// TARK — Mastra / smolify Agent Client
// This file exposes a stable streaming API for the frontend.
// Right now it uses a local simulator, but you can plug in a real Mastra
// backend later without changing the React code.

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AgentStreamOptions {
  agentId: string
  messages: AgentMessage[]
  onChunk: (chunk: string) => void
  onComplete: (fullResponse: string) => void
  onError: (error: Error) => void
}

export interface MastraConfig {
  baseUrl: string
  apiKey: string
}

// Simulated agent personas for TARK
export const TARK_AGENTS = {
  SENTINEL: {
    id: 'tark-sentinel',
    name: 'SENTINEL',
    role: 'Threat Detection & Analysis',
    color: '#00F5D4',
    description:
      'Primary threat detection agent. Monitors network traffic and identifies anomalies.',
  },
  CIPHER: {
    id: 'tark-cipher',
    name: 'CIPHER',
    role: 'Cryptographic Analysis',
    color: '#7B61FF',
    description:
      'Analyzes encrypted communications and detects steganographic content.',
  },
  PHANTOM: {
    id: 'tark-phantom',
    name: 'PHANTOM',
    role: 'Dark Web Intelligence',
    color: '#FF4D4D',
    description:
      'Crawls dark web sources and tracks threat actor activities.',
  },
  NEXUS: {
    id: 'tark-nexus',
    name: 'NEXUS',
    role: 'Correlation Engine',
    color: '#F59E0B',
    description:
      'Correlates data across all agents and generates unified threat intelligence.',
  },
} as const

class MastraClient {
  private config: MastraConfig

  constructor(config: MastraConfig) {
    this.config = config
  }

  /**
   * Stream an agent response chunk-by-chunk.
   *
   * Right now this uses a local simulator. To plug in real Mastra / smolify:
   * - Replace `simulateAgentResponse` with a fetch to your backend,
   *   and stream SSE / Fetch streaming response into `onChunk`.
   */
  async streamAgent(options: AgentStreamOptions): Promise<void> {
    const { agentId, messages, onChunk, onComplete, onError } = options

    try {
      const lastMessage = messages[messages.length - 1]?.content || ''

      // Local simulator (replace with real backend call later)
      const response = await this.simulateAgentResponse(agentId, lastMessage)

      // Stream in small chunks instead of per character to keep the UI snappy
      const words = response.split(' ')
      let fullResponse = ''

      for (const word of words) {
        // early abort hook if you later add cancellation via a signal
        await this.delay(40 + Math.random() * 60)
        const chunk = (fullResponse ? ' ' : '') + word
        fullResponse += (fullResponse ? ' ' : '') + word
        onChunk(chunk)
      }

      onComplete(fullResponse)
    } catch (err) {
      onError(
        err instanceof Error ? err : new Error('Agent stream failed'),
      )
    }
  }

  // === SIMULATED RESPONSE (placeholder for smolify / Mastra) ===

  private async simulateAgentResponse(
    agentId: string,
    query: string,
  ): Promise<string> {
    await this.delay(400)

    const baseContext = `Investigation input: "${query}"\n\n`

    const responses: Record<string, string[]> = {
      'tark-sentinel': [
        baseContext +
          `[SENTINEL] Deep traffic and IOC analysis\n` +
          `• Network layers 3–7 scanned, anomaly score: 0.84\n` +
          `• Multiple connections to suspicious ASNs and VPS providers\n` +
          `• Pattern matches known multi-stage scam infrastructure\n` +
          `• Likely stage: victim profiling / device takeover setup\n` +
          `→ Forwarding enriched IOCs to NEXUS for correlation.`,
      ],
      'tark-cipher': [
        baseContext +
          `[CIPHER] Cryptographic and payload analysis\n` +
          `• Encoded artifacts detected in URLs / SMS / APK links\n` +
          `• Obfuscation: base64 + custom XOR, possible screen-share trojan\n` +
          `• High risk of remote-control malware used in "digital arrest" scams\n` +
          `• Extracted key IOCs: short URLs, app package names, bank VPA handles\n` +
          `→ Passing decoded indicators to NEXUS and PHANTOM.`,
      ],
      'tark-phantom': [
        baseContext +
          `[PHANTOM] Dark web and OSINT sweep\n` +
          `• Cross-matching phone numbers, UPI IDs, mule accounts\n` +
          `• Overlap with known scam clusters targeting Indian victims\n` +
          `• Actors reusing scripts from "customs parcel" and "courier fraud" playbooks\n` +
          `• Chatter about spoofed law-enforcement numbers and fake FIR portals\n` +
          `→ Sending contextual intel to NEXUS for campaign clustering.`,
      ],
      'tark-nexus': [
        baseContext +
          `[NEXUS] Multi-agent correlation summary\n` +
          `• Aggregated signals from SENTINEL, CIPHER, PHANTOM\n` +
          `• Scenario: multi-stage social engineering + remote-control app + mule funnel\n` +
          `• Victim pressure tactics match "digital arrest" script variants\n` +
          `• Recommended actions: block IOCs, flag mule accounts, notify victim\n` +
          `→ Unified threat report ready for analyst review.`,
      ],
    }

    const agentResponses = responses[agentId] || responses['tark-sentinel']
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Non-streaming helper; not used by the terminal but kept for completeness.
   */
  async sendMessage(
    messages: AgentMessage[],
    agentId: string,
  ): Promise<string> {
    await this.delay(800)
    return `Agent ${agentId} processed request successfully`
  }
}

export const mastraClient = new MastraClient({
  baseUrl: import.meta.env.VITE_MASTRA_BASE_URL || 'http://localhost:4111',
  apiKey: import.meta.env.VITE_MASTRA_API_KEY || 'demo-key',
})

export default mastraClient