// API service for TARK backend integration
// Handles all communication with the Python Flask backend

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'

export interface AnalysisResponse {
  input_text: string
  analysis: {
    osint: string
    psychology: string
    policy: string
  }
  verdict: string
  blockchain: {
    stored: boolean
    tx_id?: string
  }
  hash: string
}

export interface ThreatVerdictData {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  scamType: string
  confidence: number
  reasoning: string
}

/**
 * Parse verdict string to extract threat level, scam type, confidence, and reasoning
 * Example verdict format:
 * "Threat Level: HIGH
 * Scam Type: Phishing/Account Takeover
 * Confidence: 80%
 * Reasoning: The message employs..."
 */
export function parseVerdict(verdictText: string): ThreatVerdictData {
  const threatMatch = verdictText.match(/Threat Level:\s*(\w+)/i)
  const scamMatch = verdictText.match(/Scam Type:\s*([^\n]+)/i)
  const confMatch = verdictText.match(/Confidence:\s*(\d+)%/i)
  const reasoningMatch = verdictText.match(/Reasoning:\s*([\s\S]+)$/i)

  const threatLevel = (threatMatch?.[1]?.toUpperCase() || 'MEDIUM') as
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'
  const scamType = scamMatch?.[1]?.trim() || 'Unknown Threat'
  const confidence = parseInt(confMatch?.[1] || '50', 10)
  const reasoning =
    reasoningMatch?.[1]?.trim() ||
    'No detailed reasoning available'

  return {
    threatLevel,
    scamType,
    confidence,
    reasoning,
  }
}

/**
 * Send text to backend for analysis
 */
export async function analyzeText(
  text: string,
): Promise<AnalysisResponse> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty')
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error ||
        `Backend error: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()
  return data as AnalysisResponse
}

/**
 * Send an image or audio file to backend for analysis via multipart/form-data.
 * The backend reads it from request.files and routes to vision or audio service.
 */
export async function analyzeFile(
  file: File,
): Promise<AnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file, file.name)

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    // Do NOT set Content-Type manually — browser sets it with the boundary
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error ||
        `Backend error: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()
  return data as AnalysisResponse
}

/**
 * Get health status of backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}

// ─── NEW ROUTES ─────────────────────────────────────────────────────────────

export interface LinkSafetyResponse {
  is_safe: boolean
  domain_info: {
    domain: string
    url: string
    is_safe: boolean
    flags: string[]
  }[]
}

export async function checkLinkSafety(text: string): Promise<LinkSafetyResponse> {
  const response = await fetch(`${API_BASE_URL}/link-safety-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to check link safety')
  }
  
  return response.json()
}

export async function generateReportData(data: any): Promise<{ pdf_download: string; gmail_link: string }> {
  const response = await fetch(`${API_BASE_URL}/report-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to generate report')
  }
  
  return response.json()
}

