import { ReactNode } from 'react'
import { useScrollAnimation, ScrollAnimationOptions } from '../../hooks/useScrollAnimation'

interface ScrollSectionProps extends ScrollAnimationOptions {
  children: ReactNode
  className?: string
}

export function ScrollSection({
  children,
  className = '',
  ...animOptions
}: ScrollSectionProps) {
  const ref = useScrollAnimation(animOptions)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
