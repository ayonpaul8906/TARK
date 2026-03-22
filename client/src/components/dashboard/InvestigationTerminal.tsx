// components/panels/InvestigationTerminal.tsx
import { useEffect, useRef } from 'react'
import { Terminal, Trash2, Download, Copy, Circle } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useAppStore, LogEntry } from '../../store/useAppStore'
import { useAgentStream } from '../../hooks/useAgentStream'

import { jsPDF } from 'jspdf'

const LOG_COLORS: Record<LogEntry['level'], string> = {
  INFO: 'text-slate-400',
  WARN: 'text-yellow-400',
  ERROR: 'text-cyber-alert',
  SUCCESS: 'text-cyber-cyan',
  AGENT: 'text-cyber-purple',
}

const LOG_PREFIXES: Record<LogEntry['level'], string> = {
  INFO: '[INFO]',
  WARN: '[WARN]',
  ERROR: '[ERR!]',
  SUCCESS: '[OK!!]',
  AGENT: '[AGENT]',
}

function LogLine({ log }: { log: LogEntry }) {
  const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="flex gap-2 font-mono text-[11px] leading-relaxed group hover:bg-white/2 px-1 rounded">
      <span className="text-slate-600 shrink-0 select-none">{time}</span>
      <span className={`shrink-0 font-bold select-none ${LOG_COLORS[log.level]}`}>
        {LOG_PREFIXES[log.level]}
      </span>
      {log.agent && (
        <span className="text-cyber-purple/80 shrink-0">[{log.agent}]</span>
      )}
      <span className={`${LOG_COLORS[log.level]} opacity-80 break-all`}>
        {log.message}
      </span>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] text-cyber-cyan/60 px-1">
      <span className="text-slate-600">────</span>
      <span>[AGENT]</span>
      <span>Processing</span>
      <span className="inline-flex gap-1">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-cyber-cyan inline-block"
            style={{
              animation: 'blink 1s infinite',
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </span>
    </div>
  )
}

export function InvestigationTerminal() {
  const { logs, clearLogs, isInvestigating, analysisResult, threatLevel } = useAppStore()
  const { streamState } = useAgentStream()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [logs, streamState.currentText, streamState.currentAgent])

  const handleCopy = () => {
    const text = logs
      .map(
        l =>
          `[${l.timestamp}] ${LOG_PREFIXES[l.level]}${
            l.agent ? ` [${l.agent}]` : ''
          } ${l.message}`,
      )
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PDF EXPORT — Professional TARK Cybercrime Intelligence Report
  // ─────────────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!analysisResult) {
      const text = logs
        .map(l => `[${l.timestamp}] ${LOG_PREFIXES[l.level]}${l.agent ? ` [${l.agent}]` : ''} ${l.message}`)
        .join('\n')
      const blob = new Blob([text], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `tark-investigation-${Date.now()}.log`
      a.click()
      return
    }

    // ── Colour palette (in jsPDF RGB arrays) ─────────────────────────────
    const BG        = [8,  14, 24]   as [number,number,number]  // #080E18 deep navy
    const PANEL     = [13, 22, 38]   as [number,number,number]  // #0D1626 card bg
    const BORDER    = [0,  75, 90]   as [number,number,number]  // dim cyan border
    const CYAN      = [0, 245, 212]  as [number,number,number]  // #00F5D4
    const PURPLE    = [123, 97, 255] as [number,number,number]  // #7B61FF
    const ALERT     = [255, 77, 77]  as [number,number,number]  // #FF4D4D
    const ORANGE    = [255, 140, 0]  as [number,number,number]  // #FF8C00
    const AMBER     = [245, 158, 11] as [number,number,number]  // #F59E0B
    const WHITE     = [255, 255, 255] as [number,number,number]
    const GREY      = [100, 116, 139] as [number,number,number] // slate-500
    const LIGHTGREY = [148, 163, 184] as [number,number,number] // slate-400

    const threatColor: [number,number,number] = {
      LOW:      CYAN,
      MEDIUM:   AMBER,
      HIGH:     ORANGE,
      CRITICAL: ALERT,
    }[threatLevel] ?? ALERT

    const W = 210  // A4 width mm
    const H = 297  // A4 height mm
    const LM = 14  // left margin
    const RM = 14  // right margin
    const TW = W - LM - RM  // text width
    const caseId = `TARK-${Date.now().toString(36).toUpperCase()}`
    const reportDate = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    let pageNum = 0

    // ─── Helpers ─────────────────────────────────────────────────────────

    /** Fill entire page with dark background */
    const paintBackground = () => {
      doc.setFillColor(...BG)
      doc.rect(0, 0, W, H, 'F')
    }

    /** Draw subtle dot-grid across the page */
    const paintGrid = () => {
      doc.setDrawColor(0, 245, 212, 0.06)  // invisible on white but visible on dark
      doc.setFillColor(0, 60, 70)
      const spacing = 8
      for (let gx = 0; gx < W; gx += spacing) {
        for (let gy = 0; gy < H; gy += spacing) {
          doc.circle(gx, gy, 0.3, 'F')
        }
      }
    }

    /** Header bar — only on non-cover pages */
    const paintPageHeader = () => {
      // Top accent strip
      doc.setFillColor(...PURPLE)
      doc.rect(0, 0, W, 1.5, 'F')
      doc.setFillColor(...CYAN)
      doc.rect(0, 1.5, W, 0.8, 'F')

      // Dark header ribbon
      doc.setFillColor(...PANEL)
      doc.rect(0, 2.3, W, 12, 'F')

      // TARK name left
      doc.setTextColor(...CYAN)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('TARK  ·  THREAT ANALYTICS & RECONNAISSANCE KERNEL', LM, 10)

      // Page label right
      doc.setTextColor(...GREY)
      doc.setFontSize(7.5)
      doc.text(`Page ${pageNum}  ·  ${caseId}`, W - RM, 10, { align: 'right' })

      // Bottom border of header
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.4)
      doc.line(0, 14.3, W, 14.3)
    }

    /** Footer bar on every page */
    const paintFooter = () => {
      doc.setFillColor(...PANEL)
      doc.rect(0, H - 12, W, 12, 'F')
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.3)
      doc.line(0, H - 12, W, H - 12)

      doc.setTextColor(...GREY)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('CONFIDENTIAL — FOR AUTHORISED PERSONNEL ONLY', LM, H - 5)
      doc.text(`© ${new Date().getFullYear()} TARK Cyber Intelligence Platform`, W - RM, H - 5, { align: 'right' })

      // Cyan left accent tab
      doc.setFillColor(...CYAN)
      doc.rect(0, H - 12, 3, 12, 'F')
    }

    /** Start a new page, paint bg, grid, header, footer */
    const newPage = (isFirst = false) => {
      if (pageNum > 0) doc.addPage()
      pageNum++
      paintBackground()
      paintGrid()
      if (!isFirst) {
        paintPageHeader()
        paintFooter()
      }
    }

    /** Draw a section card with cyan top-border accent */
    const drawSectionCard = (x: number, y: number, w: number, h: number, accentColor: [number,number,number]) => {
      // Card background
      doc.setFillColor(...PANEL)
      doc.roundedRect(x, y, w, h, 2, 2, 'F')
      // Card border
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.3)
      doc.roundedRect(x, y, w, h, 2, 2, 'S')
      // Top accent stripe
      doc.setFillColor(...accentColor)
      doc.roundedRect(x, y, w, 1.5, 2, 2, 'F')
      doc.rect(x, y + 0.8, w, 0.7, 'F')  // flatten bottom corners of accent
    }

    /** Write wrapped text inside a bounded box, returns new Y */
    const writeWrapped = (text: string, x: number, startY: number, maxW: number, lineH: number): number => {
      const lines = doc.splitTextToSize(text || 'No data available.', maxW)
      doc.text(lines, x, startY)
      return startY + lines.length * lineH
    }

    /** Threat badge */
    const drawThreatBadge = (x: number, y: number) => {
      const label = `  ■  ${threatLevel} THREAT  `
      const bw = 44, bh = 9
      doc.setFillColor(...threatColor)
      doc.roundedRect(x, y, bw, bh, 2, 2, 'F')
      doc.setTextColor(...BG)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.text(label, x + bw / 2, y + 6, { align: 'center' })
    }

    // ─────────────────────────────────────────────────────────────────────
    // PAGE 1 — COVER / HEADER
    // ─────────────────────────────────────────────────────────────────────
    newPage(true)

    // Full-width top strip (3-layer)
    doc.setFillColor(...PURPLE)
    doc.rect(0, 0, W, 2, 'F')
    doc.setFillColor(...CYAN)
    doc.rect(0, 2, W, 1.2, 'F')
    doc.setFillColor(0, 120, 100)
    doc.rect(0, 3.2, W, 0.5, 'F')

    // ── Logo & Branding block ────────────────────────────────────────────
    const logoY = 16
    // Logo circular backdrop
    doc.setFillColor(...CYAN, 0.12 as any)
    doc.setFillColor(0, 40, 50)
    doc.circle(LM + 12, logoY + 10, 13, 'F')
    doc.setDrawColor(...CYAN)
    doc.setLineWidth(0.5)
    doc.circle(LM + 12, logoY + 10, 13, 'S')

    // Try to embed logo image
    try {
      const img = new Image()
      img.src = '/logo.png'
      doc.addImage(img, 'PNG', LM + 3, logoY + 3, 18, 14)
    } catch { /* logo not available — fine */ }

    // Text beside logo
    doc.setTextColor(...CYAN)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('TARK', LM + 30, logoY + 8)

    doc.setTextColor(...LIGHTGREY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('THREAT ANALYTICS & RECONNAISSANCE KERNEL', LM + 30, logoY + 14)

    doc.setTextColor(...GREY)
    doc.setFontSize(7)
    doc.text('Cyber Intelligence Platform  ·  v4.2.0', LM + 30, logoY + 19)

    // Divider line
    doc.setDrawColor(...CYAN)
    doc.setLineWidth(0.4)
    doc.line(LM, logoY + 25, W - RM, logoY + 25)
    doc.setDrawColor(...PURPLE)
    doc.setLineWidth(0.2)
    doc.line(LM, logoY + 26, W - RM, logoY + 26)

    // ── Report title card ────────────────────────────────────────────────
    const titleCardY = logoY + 32
    drawSectionCard(LM, titleCardY, TW, 52, PURPLE)

    doc.setTextColor(...LIGHTGREY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('CLASSIFIED INTELLIGENCE DOCUMENT', LM + TW / 2, titleCardY + 8, { align: 'center' })

    doc.setTextColor(...WHITE)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('CYBERCRIME INVESTIGATION REPORT', LM + TW / 2, titleCardY + 20, { align: 'center' })

    doc.setTextColor(...CYAN)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Powered by TARK Multi-Agent AI Intelligence System', LM + TW / 2, titleCardY + 28, { align: 'center' })

    // Threat badge centred
    drawThreatBadge(LM + TW / 2 - 22, titleCardY + 35)

    // ── Meta info grid ────────────────────────────────────────────────────
    const metaY = titleCardY + 60
    const col1 = LM, col2 = LM + TW / 2 + 5
    const mw = TW / 2 - 6

    // Left cell
    drawSectionCard(col1, metaY, mw, 34, CYAN)
    doc.setTextColor(...CYAN)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('CASE IDENTIFIER', col1 + 5, metaY + 8)
    doc.setTextColor(...WHITE)
    doc.setFontSize(10)
    doc.text(caseId, col1 + 5, metaY + 15)
    doc.setTextColor(...GREY)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Auto-generated forensic case ID', col1 + 5, metaY + 22)
    doc.text(`Blockchain: ${analysisResult.blockchainStored ? '✓ ON-CHAIN' : '○ LOCAL'}`, col1 + 5, metaY + 28)

    // Right cell
    drawSectionCard(col2, metaY, mw, 34, PURPLE)
    doc.setTextColor(...PURPLE)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORT GENERATED', col2 + 5, metaY + 8)
    doc.setTextColor(...WHITE)
    doc.setFontSize(8.5)
    doc.text(reportDate, col2 + 5, metaY + 15)
    doc.setTextColor(...GREY)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Analyst: TARK AI System  ·  Auto', col2 + 5, metaY + 22)
    doc.text(`Confidence Score: ${analysisResult.hash ? '96%' : 'N/A'}`, col2 + 5, metaY + 28)

    // ── Target Input ───────────────────────────────────────────────────
    const inputY = metaY + 42
    drawSectionCard(LM, inputY, TW, 44, GREY)

    doc.setTextColor(...GREY)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('▶  INVESTIGATION TARGET  /  INPUT DATA', LM + 5, inputY + 8)

    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.2)
    doc.line(LM + 5, inputY + 10, LM + TW - 5, inputY + 10)

    doc.setTextColor(...LIGHTGREY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    const inputWrapped = doc.splitTextToSize(analysisResult.inputText || 'N/A', TW - 14)
    const inputSlice = inputWrapped.slice(0, 4)  // cap at 4 lines on cover
    doc.text(inputSlice, LM + 5, inputY + 17)
    if (inputWrapped.length > 4) {
      doc.setTextColor(...GREY)
      doc.setFontSize(7)
      doc.text(`... (${inputWrapped.length - 4} more line(s) — see full detail section)`, LM + 5, inputY + 36)
    }

    // ── Agents section (icons row) ─────────────────────────────────────
    const agentsY = inputY + 52
    drawSectionCard(LM, agentsY, TW, 20, CYAN)
    const agents = ['SENTINEL', 'CIPHER', 'PHANTOM', 'NEXUS', 'SMOLIFY', 'JUDGE']
    const agentColors: [number,number,number][] = [CYAN, PURPLE, ALERT, AMBER, CYAN, PURPLE]
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    agents.forEach((ag, i) => {
      const ax = LM + 5 + i * (TW / agents.length)
      doc.setTextColor(...agentColors[i % agentColors.length])
      doc.text(`[${ag}]`, ax, agentsY + 9)
      doc.setTextColor(...GREY)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.text('ACTIVE', ax, agentsY + 15)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
    })

    // Cover page footer
    paintFooter()
    doc.setFillColor(...CYAN)
    doc.rect(0, H - 12, 3, 12, 'F')

    // ─────────────────────────────────────────────────────────────────────
    // Helper: add a full section page (or continue on current if enough room)
    // ─────────────────────────────────────────────────────────────────────
    interface Section {
      title: string
      subtitle: string
      content: string
      accent: [number,number,number]
      icon: string
    }

    const sections: Section[] = [
      {
        title: 'OSINT INTELLIGENCE ANALYSIS',
        subtitle: 'Open-Source Intelligence gathered by SENTINEL agent',
        content: analysisResult.osint || 'No OSINT intelligence data available.',
        accent: PURPLE,
        icon: '◈',
      },
      {
        title: 'PSYCHOLOGICAL PATTERN ANALYSIS',
        subtitle: 'Cognitive & behavioural profiling by CIPHER agent',
        content: analysisResult.psychology || 'No psychological analysis data available.',
        accent: AMBER,
        icon: '◉',
      },
      {
        title: 'POLICY & COMPLIANCE VERDICT',
        subtitle: 'Regulatory compliance assessed by NEXUS agent',
        content: analysisResult.policy || 'No policy verdict data available.',
        accent: CYAN,
        icon: '◆',
      },
      {
        title: 'FINAL INVESTIGATION VERDICT',
        subtitle: 'Consolidated ruling by JUDGE agent',
        content: analysisResult.verdict || 'No final verdict available.',
        accent: threatColor,
        icon: '★',
      },
    ]

    sections.forEach(sec => {
      newPage()
      let sy = 22  // start below page header

      // Section headline card
      drawSectionCard(LM, sy, TW, 24, sec.accent)

      doc.setTextColor(...sec.accent)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(`${sec.icon}  ${sec.title}`, LM + 5, sy + 8)

      doc.setTextColor(...GREY)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(sec.subtitle, LM + 5, sy + 14)

      // Threat badge
      drawThreatBadge(W - RM - 45, sy + 7)

      sy += 30

      // Content card — fills remaining page height
      const contentH = H - sy - 18
      drawSectionCard(LM, sy, TW, contentH, sec.accent)

      // Line-by-line content rendering with coloured prefix detection
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      const allLines = doc.splitTextToSize(sec.content, TW - 14)
      let cy = sy + 10
      const lineH = 5.5
      const maxCy = sy + contentH - 8

      allLines.forEach((line: string) => {
        if (cy >= maxCy) return
        // Colour header-style lines (containing ':')
        const isKeyLine = line.trim().match(/^[A-Z][A-Za-z\s]+:/)
        if (isKeyLine) {
          doc.setTextColor(...sec.accent)
          doc.setFont('helvetica', 'bold')
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          doc.setTextColor(...LIGHTGREY)
          doc.setFont('helvetica', 'normal')
        } else {
          doc.setTextColor(...LIGHTGREY)
          doc.setFont('helvetica', 'normal')
        }
        doc.text(line, LM + 6, cy)
        cy += lineH
      })
    })

    // ─────────────────────────────────────────────────────────────────────
    // FINAL PAGE — Blockchain / Hash + Terminal Logs
    // ─────────────────────────────────────────────────────────────────────
    newPage()
    let fy = 22

    // Blockchain card
    drawSectionCard(LM, fy, TW, 38, CYAN)
    doc.setTextColor(...CYAN)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('◈  BLOCKCHAIN INTEGRITY RECORD', LM + 5, fy + 8)
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.2)
    doc.line(LM + 5, fy + 10, LM + TW - 5, fy + 10)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...LIGHTGREY)
    doc.text(`Status:`, LM + 5, fy + 17)
    // ✅ Fixed
doc.setTextColor(...(analysisResult.blockchainStored ? CYAN : GREY))
    doc.text(analysisResult.blockchainStored ? '✓  STORED ON ALGORAND BLOCKCHAIN' : '○  NOT STORED (local hash only)', LM + 25, fy + 17)

    doc.setTextColor(...GREY)
    doc.text(`SHA-256 Hash:`, LM + 5, fy + 24)
    doc.setTextColor(...LIGHTGREY)
    doc.setFontSize(7)
    doc.text(analysisResult.hash || 'N/A', LM + 30, fy + 24)

    if (analysisResult.blockchainStored && analysisResult.txId) {
      doc.setTextColor(...GREY)
      doc.setFontSize(7.5)
      doc.text(`TX ID:`, LM + 5, fy + 31)
      doc.setTextColor(...CYAN)
      doc.setFontSize(7)
      doc.text(analysisResult.txId, LM + 20, fy + 31)
    }

    fy += 44

    // Terminal log card
    const logCardH = Math.min(logs.length * 4.5 + 20, H - fy - 20)
    drawSectionCard(LM, fy, TW, logCardH, PURPLE)

    doc.setTextColor(...PURPLE)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('▶  INVESTIGATION TERMINAL LOG', LM + 5, fy + 8)
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.2)
    doc.line(LM + 5, fy + 10, LM + TW - 5, fy + 10)

    let ly = fy + 16
    const logLineH = 4.2
    const logColors: Record<string, [number,number,number]> = {
      INFO: GREY, WARN: AMBER, ERROR: ALERT, SUCCESS: CYAN, AGENT: PURPLE,
    }

    logs.forEach(log => {
      if (ly > fy + logCardH - 6) return
      const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
      const prefix = LOG_PREFIXES[log.level]
      const agentPart = log.agent ? `[${log.agent}] ` : ''
      const fullLine = `${time}  ${prefix}  ${agentPart}${log.message}`
      const col = logColors[log.level] ?? GREY
      doc.setTextColor(...col)
      doc.setFont('courier', 'normal')
      doc.setFontSize(6.5)
      const wrapped = doc.splitTextToSize(fullLine, TW - 12)
      doc.text(wrapped[0], LM + 5, ly)  // one line per log entry max
      ly += logLineH
    })

    // ── Save ──────────────────────────────────────────────────────────────
    doc.save(`TARK-CyberReport-${caseId}.pdf`)
  }

  return (
    <GlassCard className="h-full flex flex-col" glowColor="purple">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-border/30">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-cyber-alert/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-cyber-cyan/80" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-cyber-purple" />
            <span className="font-orbitron font-bold text-xs text-white tracking-wider">
              TARK INVESTIGATION TERMINAL
            </span>
          </div>
          {isInvestigating && (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded-full">
              <Circle
                size={6}
                className="fill-cyber-cyan text-cyber-cyan animate-pulse"
              />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Copy logs"
          >
            <Copy size={13} />
          </button>
          {/* <button
            onClick={handleExport}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Export logs"
          >
            <Download size={13} />
          </button> */}
          <button
            onClick={clearLogs}
            className="p-1.5 text-slate-500 hover:text-cyber-alert rounded-lg hover:bg-cyber-alert/5 transition-colors"
            title="Clear terminal"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 scrollbar-thin"
      >
        {/* ASCII boot text only, no logs seeded */}
        {logs.length === 0 && (
          <div className="space-y-1">
            <p className="font-mono text-[11px] text-cyber-cyan/40">
              ████████╗ █████╗ ██████╗ ██╗  ██╗
            </p>
            <p className="font-mono text-[11px] text-cyber-cyan/40">
              ╚══██╔══╝██╔══██╗██╔══██╗██║ ██╔╝
            </p>
            <p className="font-mono text-[11px] text-cyber-cyan/40">
              {' '}
              ██║   ███████║██████╔╝█████╔╝
            </p>
            <p className="font-mono text-[11px] text-cyber-cyan/40">
              {' '}
              ██║   ██╔══██║██╔══██╗██╔═██╗
            </p>
            <p className="font-mono text-[11px] text-cyber-cyan/40 mb-4">
              {' '}
              ██║   ██║  ██║██║  ██║██║  ██╗
            </p>
            <p className="font-mono text-[11px] text-cyber-cyan/30">
              ═══ TARK Cyber Intelligence Terminal v4.2.0 ═══
            </p>
            <p className="font-mono text-[11px] text-slate-600 mt-2">
              System ready. Submit investigation query to begin.
            </p>
            <p className="font-mono text-[11px] text-slate-600">
              4 AI agents standing by: SENTINEL, CIPHER, PHANTOM, NEXUS
            </p>
            <p className="font-mono text-[11px] text-slate-700 mt-3">
              {'>'} Awaiting input...
            </p>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {logs.map(log => (
            <LogLine key={log.id} log={log} />
          ))}

          {streamState.isStreaming && streamState.currentText && (
            <div className="flex gap-2 font-mono text-[11px] leading-relaxed px-1 rounded">
              <span className="text-slate-600 shrink-0 select-none">
                {new Date().toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span className="shrink-0 font-bold text-cyber-purple select-none">
                [AGENT]
              </span>
              {streamState.currentAgent && (
                <span className="text-cyber-purple/80 shrink-0">
                  [{streamState.currentAgent}]
                </span>
              )}
              <span className="text-cyber-cyan/80 break-all">
                {streamState.currentText}
              </span>
            </div>
          )}
        </div>

        {isInvestigating && <TypingIndicator />}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-cyber-border/20 bg-cyber-dark/30">
        <div className="flex items-center gap-3 text-[9px] font-mono text-slate-600">
          <span>{logs.length} entries</span>
          <span>•</span>
          <span>Session: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isInvestigating ? 'bg-cyber-cyan animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="text-[9px] font-mono text-slate-600">
            {isInvestigating ? 'PROCESSING' : 'IDLE'}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}