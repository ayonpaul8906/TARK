// components/panels/InputPanel.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileImage, Mic, StopCircle, Zap } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { SkeuomorphicTextarea } from '../ui/SkeuomorphicInput'
import { NeoBrutalButton } from '../ui/NeoBrutalButton'
import { DropzoneUploader } from '../upload/DropzoneUploader'
import { AudioVisualizer } from '../upload/AudioVisualizer'
import { useAppStore } from '../../store/useAppStore'
import { useAgentStream } from '../../hooks/useAgentStream'
import { useBackendAnalysis } from '../../hooks/useBackendAnalysis'
import { runSmolify } from '../../lib/smolify'

type InputMode = 'text' | 'image' | 'audio'

const EXAMPLE_QUERIES = [
  'Analyze this IP: 192.168.100.45 for malicious activity',
  'Detect phishing patterns in this email header',
  'Perform deep scan on this file hash: a3f2c1...',
  'Identify APT group behind this attack vector',
]

export function InputPanel() {
  const [mode, setMode] = useState<InputMode>('text')
  const [query, setQuery] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { startInvestigation, addLog } = useAppStore()
  const { streamState, stopStream } = useAgentStream()
  const { analyzeBackend, analyzeFileBackend } = useBackendAnalysis()

const handleSubmit = async () => {
  // For file modes, we need an actual uploaded file
  if (mode !== 'text' && !uploadedFile) return
  // For text mode, we need non-empty text
  if (mode === 'text' && !query.trim()) return

  const rawInput =
    mode === 'text'
      ? query
      : `[${mode.toUpperCase()} ANALYSIS] Uploaded file: ${uploadedFile!.name}`

  // 🚀 START INVESTIGATION
  startInvestigation(rawInput)

  addLog({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `Investigation started`,
  })

  // ─── FILE MODES (image / audio) ───────────────────────────────────────────
  // Skip SMOLIFY — there is no client-side text to sanitize.
  // The file goes directly to the backend, which extracts text and runs the pipeline.
  if (mode !== 'text' && uploadedFile) {
    addLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Sending ${mode} file to backend for processing...`,
    })
    try {
      await analyzeFileBackend(uploadedFile)
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: `Analysis failed. Please check backend connection.`,
      })
    }
    setUploadedFile(null)
    return
  }

  // ─── TEXT MODE ────────────────────────────────────────────────────────────
  // 🔐 SMOLIFY — sanitize PII before sending text
  addLog({
    timestamp: new Date().toISOString(),
    level: 'AGENT',
    agent: 'SMOLIFY',
    message: 'Initializing local edge model...',
  })

  await new Promise(res => setTimeout(res, 500))

  addLog({
    timestamp: new Date().toISOString(),
    level: 'AGENT',
    agent: 'SMOLIFY',
    message: 'Scanning for sensitive entities (PII)...',
  })

  await new Promise(res => setTimeout(res, 600))

  const { sanitizedText, mapping } = runSmolify(rawInput)

  if (Object.keys(mapping).length === 0) {
    addLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      agent: 'SMOLIFY',
      message: 'No sensitive data detected.',
    })
  } else {
    Object.entries(mapping).forEach(([tag, value]) => {
      addLog({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        agent: 'SMOLIFY',
        message: `Redacted "${value}" → ${tag}`,
      })
    })
  }

  await new Promise(res => setTimeout(res, 400))

  addLog({
    timestamp: new Date().toISOString(),
    level: 'SUCCESS',
    agent: 'SMOLIFY',
    message: 'Sanitization complete. Secure payload generated.',
  })

  // 🔥 CALL BACKEND ANALYSIS
  try {
    await analyzeBackend(sanitizedText)
  } catch (error) {
    addLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: `Analysis failed. Please check backend connection.`,
    })
  }

  setQuery('')
}

  const modes: { id: InputMode; icon: typeof Search; label: string }[] = [
    { id: 'text', icon: Search, label: 'Text' },
    { id: 'image', icon: FileImage, label: 'Image' },
    { id: 'audio', icon: Mic, label: 'Audio' },
  ]

  return (
    <GlassCard className="p-5 h-100vh flex flex-col gap-4" glowColor="cyan">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
            INVESTIGATION INPUT
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
            Submit threat data for analysis
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          <span className="text-[9px] font-mono text-cyber-cyan/60">READY</span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-1 p-1 bg-cyber-dark/50 rounded-xl border border-cyber-border/30">
        {modes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setUploadedFile(null) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-orbitron font-semibold tracking-wider uppercase transition-all duration-200 ${
              mode === id
                ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <AnimatePresence mode="wait">
        {mode === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col gap-3"
          >
            <SkeuomorphicTextarea
              placeholder="Enter IOC, IP address, domain, file hash, email header, or describe the threat..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={6}
              className="flex-1"
            />
            <div className="space-y-1">
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                Quick Examples
              </p>
              {EXAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(q)}
                  className="w-full text-left text-[10px] font-mono text-slate-500 hover:text-cyber-cyan/80 transition-colors truncate py-0.5 hover:bg-cyber-cyan/5 px-2 rounded"
                >
                  › {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'image' && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1"
          >
            <DropzoneUploader
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
              label="Drop screenshot or image for analysis"
              onFileAccepted={file => {
                setUploadedFile(file)
              }}
            />
          </motion.div>
        )}

        {mode === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1"
          >
            <AudioVisualizer
              onFileLoaded={file => {
                setUploadedFile(file)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Status */}
      {streamState.currentAgent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20"
        >
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animation: 'blink 0.8s infinite',
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-orbitron text-cyber-cyan">
            {streamState.currentAgent} ACTIVE
          </span>
        </motion.div>
      )}

      {/* Submit Button */}
      {!streamState.isStreaming ? (
        <NeoBrutalButton
          onClick={handleSubmit}
          icon={Zap}
          fullWidth
          size="lg"
          disabled={
            (mode === 'text' && !query.trim()) ||
            (mode !== 'text' && !uploadedFile)
          }
        >
          Launch Investigation
        </NeoBrutalButton>
      ) : (
        <NeoBrutalButton
          onClick={stopStream}
          variant="danger"
          icon={StopCircle}
          fullWidth
          size="lg"
        >
          Terminate Investigation
        </NeoBrutalButton>
      )}
    </GlassCard>
  )
}