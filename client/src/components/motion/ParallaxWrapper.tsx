import { ReactNode } from 'react'
import { useParallax } from '../../hooks/useScrollAnimation'

interface ParallaxWrapperProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxWrapper({ children, speed = 0.3, className = '' }: ParallaxWrapperProps) {
  const ref = useParallax(speed)

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  )
}
