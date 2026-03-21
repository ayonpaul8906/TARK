import type { AnalysisResult } from '../store/useAppStore'

const CYBER_DOST = 'cyberdost@mha.gov.in'

function shortHash(h: string): string {
  if (!h) return 'N/A'
  return h.length > 12 ? `${h.slice(0, 12)}…` : h
}

function extractScamType(verdict: string): string {
  const m = verdict.match(/Scam Type:\s*([^\n]+)/i)
  const s = m?.[1]?.trim() || 'Suspected cyber incident'
  return s.length > 120 ? s.slice(0, 117) + '…' : s
}

/** Same structure as server `build_official_subject_body` for /analyze-aligned context. */
export function buildCyberDostSubjectBody(
  r: AnalysisResult,
  opts?: { signerName?: string },
): { subject: string; body: string } {
  const caseRef = shortHash(r.hash)
  const scam = extractScamType(r.verdict)
  const subject = `Cyber incident report — Case ref ${caseRef} — ${scam}`

  const now = new Date()
  const utc = now.toISOString().slice(0, 16).replace('T', ' ')

  let body = `Dear Sir/Madam,

I am submitting the following matter for your attention through the citizen cybercrime reporting channel.

REFERENCE
Case identifier: ${r.hash || 'N/A'}
Report date (UTC): ${utc}

REPORTED CONTENT OR MATERIAL
${(r.inputText || '').trim()}

ASSESSMENT SUMMARY (TARK / automated analysis pipeline)
Assessment:
${(r.verdict || '').trim()}

Policy and compliance review:
${(r.policy || '').trim()}

Behavioural and psychological indicators:
${(r.psychology || '').trim()}

Open-source intelligence (OSINT):
${(r.osint || '').trim()}

Blockchain attestation:
Recorded: ${r.blockchainStored ? 'Yes' : 'No'}
Transaction or record reference: ${r.txId || 'N/A'}

I respectfully request that this matter be reviewed and that I be advised of any further steps I should take, in line with applicable procedures.

Yours faithfully,
`

  const name = opts?.signerName?.trim()
  if (name) {
    body += `${name}\n`
  }

  return { subject, body }
}

function gmailComposeUrlRaw(subject: string, body: string): string {
  const params: [string, string][] = [
    ['view', 'cm'],
    ['fs', '1'],
    ['tf', 'cm'],
    ['source', 'mailto'],
    ['to', CYBER_DOST],
    ['su', subject],
    ['body', body],
  ]
  const query = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  return `https://mail.google.com/mail/u/0/?${query}`
}

function outlookComposeUrlRaw(subject: string, body: string): string {
  const params: [string, string][] = [
    ['to', CYBER_DOST],
    ['subject', subject],
    ['body', body],
  ]
  const query = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  return `https://outlook.live.com/mail/0/deeplink/compose?${query}`
}

function truncateForLink(subject: string, body: string, maxUrlLen = 2000): [string, string] {
  const suffix =
    '\n\n[... truncated for email link length limits; full text is in the TARK PDF ...]'
  let s = subject
  let b = body
  for (let i = 0; i < 60; i++) {
    const trial = gmailComposeUrlRaw(s, b)
    if (trial.length <= maxUrlLen) return [s, b]
    if (b.length > suffix.length + 300) {
      b = `${b.slice(0, Math.max(b.length - 400, 300)).trimEnd()}${suffix}`
    } else if (s.length > 60) {
      s = `${s.slice(0, 60).trimEnd()}…`
    } else {
      b = b.length > 200 ? `${b.slice(0, 200)}${suffix}` : `${b}${suffix}`
    }
  }
  return [s, `${b.slice(0, 200)}${suffix}`]
}

function mailtoUriRaw(subject: string, body: string): string {
  return `mailto:${CYBER_DOST}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Gmail web — `to` is set explicitly; uses same encoding as server. */
export function buildGmailComposeUrl(
  r: AnalysisResult,
  opts?: { signerName?: string },
): string {
  const { subject, body } = buildCyberDostSubjectBody(r, opts)
  const [s, b] = truncateForLink(subject, body)
  return gmailComposeUrlRaw(s, b)
}

/** Outlook on the web (consumer) compose. */
export function buildOutlookComposeUrl(
  r: AnalysisResult,
  opts?: { signerName?: string },
): string {
  const { subject, body } = buildCyberDostSubjectBody(r, opts)
  const [s, b] = truncateForLink(subject, body)
  return outlookComposeUrlRaw(s, b)
}

/** Default mail app — RFC 6068 `subject` / `body` query params. */
export function buildCyberDostMailto(
  r: AnalysisResult,
  opts?: { signerName?: string },
): string {
  const { subject, body } = buildCyberDostSubjectBody(r, opts)
  const [s, b] = truncateForLink(subject, body)
  return mailtoUriRaw(s, b)
}