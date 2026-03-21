import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'cyan' | 'purple' | 'alert' | 'none'
  animate?: boolean
  onClick?: () => void
  noBorder?: boolean
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'cyan',
  animate = false,
  onClick,
  noBorder = false,
}: GlassCardProps) {
  const glowStyles = {
    cyan: 'border-cyber-cyan/20 shadow-[0_0_30px_rgba(0,245,212,0.1)]',
    purple: 'border-cyber-purple/20 shadow-[0_0_30px_rgba(123,97,255,0.1)]',
    alert: 'border-cyber-alert/20 shadow-[0_0_30px_rgba(255,77,77,0.1)]',
    none: 'border-cyber-border/30',
  }

  const hoverStyles = {
    cyan: 'hover:border-cyber-cyan/40 hover:shadow-[0_0_40px_rgba(0,245,212,0.2)]',
    purple: 'hover:border-cyber-purple/40 hover:shadow-[0_0_40px_rgba(123,97,255,0.2)]',
    alert: 'hover:border-cyber-alert/40 hover:shadow-[0_0_40px_rgba(255,77,77,0.2)]',
    none: '',
  }

  const Component = animate ? motion.div : 'div'
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' },
      }
    : {}

  return (
    <Component
      {...(animProps as any)}
      onClick={onClick}
      className={`
        relative z-0 overflow-hidden
        bg-gradient-to-br from-[#0d1424]/80 to-[#060912]/60
        backdrop-blur-xl
        ${noBorder ? '' : `border ${glowStyles[glowColor]}`}
        rounded-2xl
        transition-all duration-300
        ${hoverStyles[glowColor]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none -z-10">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br 
          ${glowColor === 'cyan' ? 'from-cyber-cyan/3 to-transparent' : ''}
          ${glowColor === 'purple' ? 'from-cyber-purple/3 to-transparent' : ''}
          ${glowColor === 'alert' ? 'from-cyber-alert/3 to-transparent' : ''}
        `} />
      </div>

      {/* Top reflection line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

      {children}
    </Component>
  )
}
