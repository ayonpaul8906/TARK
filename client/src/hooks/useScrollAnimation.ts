import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface ScrollAnimationOptions {
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale' | 'stagger'
  delay?: number
  duration?: number
  start?: string
  once?: boolean
  staggerChildren?: number
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  const {
    animation = 'fadeUp',
    delay = 0,
    duration = 0.8,
    start = 'top 80%',
    once = true,
    staggerChildren = 0.1,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const getInitial = () => {
      switch (animation) {
        case 'fadeUp': return { opacity: 0, y: 60 }
        case 'fadeIn': return { opacity: 0 }
        case 'slideLeft': return { opacity: 0, x: -80 }
        case 'slideRight': return { opacity: 0, x: 80 }
        case 'scale': return { opacity: 0, scale: 0.8 }
        case 'stagger': return { opacity: 0, y: 40 }
        default: return { opacity: 0, y: 60 }
      }
    }

    const getTarget = () => {
      switch (animation) {
        case 'fadeUp': return { opacity: 1, y: 0 }
        case 'fadeIn': return { opacity: 1 }
        case 'slideLeft': return { opacity: 1, x: 0 }
        case 'slideRight': return { opacity: 1, x: 0 }
        case 'scale': return { opacity: 1, scale: 1 }
        case 'stagger': return { opacity: 1, y: 0 }
        default: return { opacity: 1, y: 0 }
      }
    }

    gsap.set(el, getInitial())

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      onEnter: () => {
        if (animation === 'stagger') {
          const children = el.children
          gsap.to(children, {
            ...getTarget(),
            duration,
            delay,
            stagger: staggerChildren,
            ease: 'power3.out',
          })
        } else {
          gsap.to(el, {
            ...getTarget(),
            duration,
            delay,
            ease: 'power3.out',
          })
        }
        if (once) trigger.kill()
      },
    })

    return () => {
      trigger.kill()
    }
  }, [animation, delay, duration, start, once, staggerChildren])

  return ref
}

export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress
        const y = (progress - 0.5) * speed * 200
        gsap.set(el, { y })
      },
    })

    return () => trigger.kill()
  }, [speed])

  return ref
}

export function useGsapTimeline() {
  const tl = useRef(gsap.timeline({ paused: true }))
  return tl
}
