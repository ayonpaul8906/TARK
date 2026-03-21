import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
  hint?: string
  glowOnFocus?: boolean
}

export const SkeuomorphicInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, hint, className = '', glowOnFocus = true, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-orbitron font-semibold tracking-widest uppercase text-cyber-cyan/60">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              focused ? 'text-cyber-cyan' : 'text-slate-500'
            }`}>
              <Icon size={16} />
            </div>
          )}
          <input
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full
              ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
              font-inter text-sm text-white placeholder:text-slate-600
              skeuomorphic-input
              rounded-xl
              transition-all duration-300
              bg-gradient-to-b from-[#0a1020] to-[#0f1a2e]
              border border-cyber-border/50
              ${focused && glowOnFocus ? 'border-cyber-cyan/50 shadow-[0_0_20px_rgba(0,245,212,0.15),inset_2px_2px_5px_rgba(0,0,0,0.7)]' : 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.7),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'}
              ${error ? 'border-cyber-alert/50' : ''}
              outline-none
              ${className}
            `}
            {...props}
          />
          {/* Focus ring outer glow */}
          {focused && glowOnFocus && (
            <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-cyber-cyan/30 ring-offset-1 ring-offset-cyber-bg" />
          )}
        </div>
        {error && (
          <p className="text-xs font-mono text-cyber-alert flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyber-alert rounded-full animate-pulse" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs font-mono text-slate-500">{hint}</p>
        )}
      </div>
    )
  }
)
SkeuomorphicInput.displayName = 'SkeuomorphicInput'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  icon?: LucideIcon
  error?: string
}

export const SkeuomorphicTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, icon: Icon, error, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-orbitron font-semibold tracking-widest uppercase text-cyber-cyan/60">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className={`absolute left-3 top-3 transition-colors duration-200 ${
              focused ? 'text-cyber-cyan' : 'text-slate-500'
            }`}>
              <Icon size={16} />
            </div>
          )}
          <textarea
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full
              ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
              font-inter text-sm text-white placeholder:text-slate-600
              bg-gradient-to-b from-[#0a1020] to-[#0f1a2e]
              rounded-xl resize-none
              border border-cyber-border/50
              ${focused ? 'border-cyber-cyan/50 shadow-[0_0_20px_rgba(0,245,212,0.15),inset_2px_2px_5px_rgba(0,0,0,0.7)]' : 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.7)]'}
              ${error ? 'border-cyber-alert/50' : ''}
              outline-none
              transition-all duration-300
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-mono text-cyber-alert">{error}</p>
        )}
      </div>
    )
  }
)
SkeuomorphicTextarea.displayName = 'SkeuomorphicTextarea'
