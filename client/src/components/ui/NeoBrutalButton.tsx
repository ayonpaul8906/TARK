import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface NeoBrutalButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

export function NeoBrutalButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false,
}: NeoBrutalButtonProps) {
  
  const variants = {
    primary: 'bg-cyber-cyan text-[#030509] shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:shadow-[0_0_30px_rgba(0,245,212,0.5)] border border-transparent',
    secondary: 'bg-transparent text-cyber-cyan border border-cyber-cyan/40 shadow-[inset_0_0_15px_rgba(0,245,212,0.1)] hover:bg-cyber-cyan/10 hover:border-cyber-cyan',
    danger: 'bg-transparent text-red-400 border border-red-500/40 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)] hover:bg-red-500/10 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    ghost: 'bg-transparent text-slate-400 border border-white/10 hover:text-white hover:bg-white/5 hover:border-white/20',
  }

  const sizes = {
    sm: 'px-4 py-2 text-[11px]',
    md: 'px-6 py-2.5 text-xs',
    lg: 'px-8 py-3.5 text-sm',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative font-orbitron font-bold tracking-[0.15em] uppercase
        transition-all duration-300 ease-out rounded-xl
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${className}
        overflow-hidden group
      `}
    >
      {/* High-tech sweeping glare effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />

      <span className="relative flex items-center justify-center gap-2.5 z-10">
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
          </>
        )}
      </span>
    </motion.button>
  )
}