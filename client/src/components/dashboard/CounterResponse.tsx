import { useEffect, useState } from 'react'
import { FileText, Shield, Link as LinkIcon, AlertCircle, CheckCircle, Loader2, Globe, Mail, Download } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useAppStore } from '../../store/useAppStore'
import { checkLinkSafety, generateReportData, LinkSafetyResponse } from '../../lib/api'
import { buildCyberDostMailto, buildGmailComposeUrl, buildOutlookComposeUrl } from '../../lib/reportEmail'

export function CounterResponse() {
  const { analysisResult, investigationQuery, addLog, user } = useAppStore()
  
  // Try to use analysisResult.inputText, fallback to investigationQuery
  const inputText = analysisResult?.inputText || investigationQuery || ''
  
  // URL regex (basic check to see if a link exists in the text)
  const hasLink = /https?:\/\/[^\s]+/.test(inputText) || /www\.[^\s]+/.test(inputText)
  
  const [checkingLink, setCheckingLink] = useState(false)
  const [linkResult, setLinkResult] = useState<LinkSafetyResponse | null>(null)
  
  const [generatingReport, setGeneratingReport] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    setPdfUrl(null)
  }, [analysisResult?.hash])

  const handleLinkCheck = async () => {
    setCheckingLink(true)
    addLog({
      timestamp: new Date().toISOString(),
      level: 'AGENT',
      agent: 'SAFETY',
      message: 'Running deep link safety analysis...',
    })
    try {
      const res = await checkLinkSafety(inputText)
      setLinkResult(res)
      
      addLog({
        timestamp: new Date().toISOString(),
        level: res.is_safe ? 'SUCCESS' : 'WARN',
        agent: 'SAFETY',
        message: `Link analysis complete. Status: ${res.is_safe ? 'SAFE' : 'MALICIOUS ORIGIN'}`,
      })
    } catch (e) {
      addLog({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        agent: 'SAFETY',
        message: `Link safety check failed: ${e instanceof Error ? e.message : 'Unknown Error'}`,
      })
    } finally {
      setCheckingLink(false)
    }
  }

  const backendBase =
    import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'

  const handleDownloadPdf = async () => {
    if (!analysisResult) return
    setGeneratingReport(true)
    addLog({
      timestamp: new Date().toISOString(),
      level: 'AGENT',
      agent: 'REPORT',
      message: 'Compiling formal PDF report…',
    })
    try {
      await generateReportData(analysisResult)
      const path = '/download-report'
      setPdfUrl(`${backendBase}${path}`)
      addLog({
        timestamp: new Date().toISOString(),
        level: 'SUCCESS',
        agent: 'REPORT',
        message: 'Formal PDF ready for download.',
      })
    } catch (e) {
      addLog({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        agent: 'REPORT',
        message: `PDF generation failed: ${e instanceof Error ? e.message : 'Unknown Error'}`,
      })
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <GlassCard className="p-5" glowColor="none">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-cyber-cyan" />
        <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">RESPONSE & ACTIONS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ACTION 1: Official report — Cyber Dost (MHA) */}
        <div className="p-4 rounded-xl border border-cyber-border/40 bg-cyber-dark/40 flex flex-col justify-between min-h-[140px]">
          <div>
             <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center">
                 <FileText size={14} className="text-cyber-purple" />
               </div>
               <h4 className="font-orbitron font-bold text-sm">Official report</h4>
             </div>
             <p className="text-[10px] text-slate-400 font-mono mb-4">
               Recipient: <span className="text-slate-300">cyberdost@mha.gov.in</span>. Use{' '}
               <span className="text-slate-300">Gmail</span> or <span className="text-slate-300">Outlook</span> for web compose, or{' '}
               <span className="text-slate-300">Mail app</span> for your desktop client. Content matches your last{' '}
               <span className="text-slate-500">/analyze</span> run.
             </p>
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            {analysisResult ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={buildGmailComposeUrl(analysisResult, { signerName: user?.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 rounded-lg border border-[#EA4335]/30 bg-[#EA4335]/10 text-[#EA4335] text-[10px] font-orbitron font-bold flex justify-center items-center gap-2 hover:bg-[#EA4335]/20 transition-all"
                >
                  <Mail size={12} /> Gmail
                </a>
                <a
                  href={buildOutlookComposeUrl(analysisResult, { signerName: user?.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 text-[10px] font-orbitron font-bold flex justify-center items-center gap-2 hover:bg-sky-500/20 transition-all"
                >
                  <Mail size={12} /> Outlook
                </a>
                <a
                  href={buildCyberDostMailto(analysisResult, { signerName: user?.name })}
                  className="py-2 rounded-lg border border-slate-500/40 bg-slate-500/10 text-slate-200 text-[10px] font-orbitron font-bold flex justify-center items-center gap-2 hover:bg-slate-500/20 transition-all"
                >
                  <Mail size={12} /> Mail app
                </a>
              </div>
            ) : (
              <span className="py-2 rounded-lg border border-cyber-border/30 text-slate-500 text-[10px] font-orbitron font-bold flex justify-center items-center gap-2 opacity-40 cursor-not-allowed">
                <Mail size={12} /> Run an analysis to enable email
              </span>
            )}
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-lg border border-cyber-cyan/40 bg-cyber-cyan/15 text-cyber-cyan text-[10px] font-orbitron font-bold flex justify-center items-center gap-2 hover:bg-cyber-cyan/25 transition-all"
              >
                <Download size={12} /> Open PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!analysisResult || generatingReport}
                className="flex-1 py-2 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan text-[10px] font-orbitron font-bold flex justify-center items-center gap-2 hover:bg-cyber-cyan/20 transition-all disabled:opacity-40"
              >
                {generatingReport ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                {generatingReport ? 'Building PDF…' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>

        {/* ACTION 2: Link Safety Check */}
        {hasLink ? (
          <div className="p-4 rounded-xl border border-cyber-border/40 bg-cyber-dark/40 flex flex-col justify-between min-h-[140px]">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
                   <LinkIcon size={14} className="text-cyber-cyan" />
                 </div>
                 <h4 className="font-orbitron font-bold text-sm">Deep Link Inspection</h4>
               </div>
               <p className="text-[10px] text-slate-400 font-mono mb-4">
                 URL detected in payload. Run safe-browsing telemetry check on the domain and extract flags.
               </p>
             </div>

             {linkResult ? (
               <div className={`mt-auto p-3 rounded-lg border text-xs font-mono
                 ${linkResult.is_safe ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}
               `}>
                 <div className="flex items-center gap-2 mb-2">
                   {linkResult.is_safe ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                   <strong>{linkResult.is_safe ? 'VERIFIED SAFE' : 'MALICIOUS URL DETECTED'}</strong>
                 </div>
                 {linkResult.domain_info.map((info, i) => (
                   <div key={i} className="pl-6 space-y-1">
                     <p className="flex items-center gap-1.5"><Globe size={10} /> {info.domain}</p>
                     {info.flags.length > 0 && (
                       <div className="flex gap-1 flex-wrap mt-1">
                         {info.flags.map(f => <span key={f} className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[9px]">{f}</span>)}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             ) : (
               <button
                  onClick={handleLinkCheck}
                  disabled={checkingLink}
                  className="mt-auto w-full py-2 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan text-xs font-orbitron font-bold hover:bg-cyber-cyan/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
               >
                 {checkingLink ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                 {checkingLink ? 'INSPECTING...' : 'MAINTAIN LINK SAFETY CHECK'}
               </button>
             )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-cyber-border/20 bg-cyber-bg/50 flex flex-col items-center justify-center opacity-50 min-h-[140px]">
             <LinkIcon size={24} className="text-slate-600 mb-2" />
             <p className="text-xs font-orbitron text-slate-500">No URL parameters detected.</p>
             <p className="text-[10px] font-mono text-slate-600 mt-1">Link safety check disabled.</p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}