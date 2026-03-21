import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Mic, Play, Pause, Upload, X } from 'lucide-react'

interface AudioVisualizerProps {
  onFileLoaded?: (file: File) => void
}

export function AudioVisualizer({ onFileLoaded }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [fileName, setFileName] = useState('')
  const [wsError, setWsError] = useState(false)

  const initWavesurfer = useCallback(async (audioFile: File) => {
    if (!containerRef.current) return

    try {
      const WaveSurfer = (await import('wavesurfer.js')).default

      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
      }

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: 'rgba(0, 245, 212, 0.4)',
        progressColor: '#00F5D4',
        cursorColor: '#7B61FF',
        barWidth: 3,
        barRadius: 2,
        barGap: 2,
        height: 80,
        normalize: true,
        backend: 'WebAudio',
      })

      ws.on('ready', () => {
        setIsLoaded(true)
        setDuration(ws.getDuration())
      })

      ws.on('audioprocess', () => {
        setCurrentTime(ws.getCurrentTime())
      })

      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => setIsPlaying(false))

      const url = URL.createObjectURL(audioFile)
      await ws.load(url)
      wavesurferRef.current = ws
    } catch {
      setWsError(true)
    }
  }, [])

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setFileName(file.name)
    setWsError(false)
    onFileLoaded?.(file)
    await initWavesurfer(file)
  }, [initWavesurfer, onFileLoaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'] },
    maxFiles: 1,
  })

  const togglePlay = () => wavesurferRef.current?.playPause()

  const clearAudio = () => {
    wavesurferRef.current?.destroy()
    wavesurferRef.current = null
    setIsLoaded(false)
    setIsPlaying(false)
    setFileName('')
    setCurrentTime(0)
    setDuration(0)
    setWsError(false)
  }

  useEffect(() => {
    return () => { wavesurferRef.current?.destroy() }
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (!isLoaded && !fileName) {
    return (
      <div
        {...getRootProps()}
        className={`
          flex-1 min-h-[180px] flex flex-col items-center justify-center gap-4
          rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? 'border-cyber-purple bg-cyber-purple/10 shadow-[0_0_30px_rgba(123,97,255,0.2)]'
            : 'border-cyber-border/40 hover:border-cyber-purple/40 hover:bg-cyber-purple/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
          isDragActive ? 'bg-cyber-purple/20 border-cyber-purple' : 'bg-cyber-border/20 border-cyber-border/40'
        }`}>
          <Mic size={24} className={isDragActive ? 'text-cyber-purple' : 'text-slate-500'} />
        </div>
        <div className="text-center">
          <p className="text-sm font-orbitron font-semibold text-slate-400">
            {isDragActive ? 'Drop audio file' : 'Drop audio for analysis'}
          </p>
          <p className="text-[10px] font-mono text-slate-600 mt-1">
            MP3, WAV, OGG, FLAC supported
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4 rounded-xl border border-cyber-purple/30 bg-cyber-purple/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic size={13} className="text-cyber-purple" />
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">{fileName}</span>
        </div>
        <button onClick={clearAudio} className="text-slate-500 hover:text-cyber-alert transition-colors">
          <X size={13} />
        </button>
      </div>

      {wsError ? (
        <div className="h-20 flex items-center justify-center">
          {/* Fallback bars visualizer */}
          <div className="flex items-end gap-0.5 h-14">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="w-1.5 bg-cyber-purple/60 rounded-full"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 20}px`,
                  animation: `blink ${0.5 + Math.random() * 0.5}s infinite ${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="rounded-lg overflow-hidden" />
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={togglePlay}
          disabled={!isLoaded && !wsError}
          className="w-9 h-9 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 flex items-center justify-center text-cyber-purple hover:bg-cyber-purple/30 transition-all disabled:opacity-40"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="text-[10px] font-mono text-slate-500">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="flex items-center gap-1">
          <Upload size={10} className="text-cyber-purple/60" />
          <span className="text-[9px] font-mono text-cyber-purple/60">READY</span>
        </div>
      </div>
    </div>
  )
}
