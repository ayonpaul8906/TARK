import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(8px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen ${className}`}
    >
      {/* Transition flash overlay */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 0, originX: 1 }}
        exit={{ scaleX: 1, originX: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 bg-cyber-cyan/10 pointer-events-none z-[100]"
      />
      {children}
    </motion.div>
  )
}