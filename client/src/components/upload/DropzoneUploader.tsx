import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, CheckCircle, X } from 'lucide-react'

interface DropzoneUploaderProps {
  accept?: Record<string, string[]>
  label?: string
  onFileAccepted?: (file: File) => void
  maxSize?: number
}

export function DropzoneUploader({
  accept,
  label = 'Drop files here for analysis',
  onFileAccepted,
  maxSize = 50 * 1024 * 1024, // 50MB
}: DropzoneUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setUploadedFile(file)
    onFileAccepted?.(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [onFileAccepted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
  })

  const clearFile = () => {
    setUploadedFile(null)
    setPreview(null)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...(getRootProps() as any)}
            className={`
              flex-1 min-h-[180px] flex flex-col items-center justify-center gap-4
              rounded-xl border-2 border-dashed cursor-pointer
              transition-all duration-300
              ${isDragActive
                ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_30px_rgba(0,245,212,0.2)]'
                : 'border-cyber-border/40 hover:border-cyber-cyan/40 hover:bg-cyber-cyan/5'
              }
            `}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.1, rotate: 10 } : { scale: 1, rotate: 0 }}
              className="relative"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isDragActive ? 'bg-cyber-cyan/20 border border-cyber-cyan' : 'bg-cyber-border/20 border border-cyber-border/40'
              }`}>
                <Upload size={24} className={isDragActive ? 'text-cyber-cyan' : 'text-slate-500'} />
              </div>
              {isDragActive && (
                <div className="absolute inset-0 rounded-2xl border border-cyber-cyan animate-ping opacity-30" />
              )}
            </motion.div>
            <div className="text-center">
              <p className={`text-sm font-orbitron font-semibold ${isDragActive ? 'text-cyber-cyan' : 'text-slate-400'}`}>
                {isDragActive ? 'Release to analyze' : label}
              </p>
              <p className="text-[10px] font-mono text-slate-600 mt-1">
                or click to browse • max {formatSize(maxSize)}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 relative rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/5 overflow-hidden"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
                  <File size={22} className="text-cyber-cyan" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono text-white truncate max-w-[200px]">{uploadedFile.name}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">{formatSize(uploadedFile.size)}</p>
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/30">
                <CheckCircle size={11} className="text-cyber-cyan" />
                <span className="text-[9px] font-orbitron text-cyber-cyan font-bold">LOADED</span>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 rounded-lg bg-cyber-alert/20 border border-cyber-alert/30 text-cyber-alert hover:bg-cyber-alert/30 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
