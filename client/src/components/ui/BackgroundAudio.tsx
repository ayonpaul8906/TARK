import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'

export function BackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Attempt to autoplay on mount 
    const playAudio = async () => {
      try {
        if (audioRef.current && !isMuted) {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (err) {
        console.log('Autoplay prevented by browser. Waiting for interaction.')
        setIsPlaying(false)
      }
    }

    // A small timeout to give the browser time to process the element
    setTimeout(playAudio, 100)

    // Add a global click listener to start audio if it was prevented
    const handleInteraction = async () => {
      if (!isPlaying && !isMuted && audioRef.current) {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
          // We don't remove the listener immediately in case it fails again, 
          // but if it succeeds, we consider it playing.
        } catch (err) {
          // Expected to fail if still blocked
        }
      }
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)
    document.addEventListener('scroll', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('scroll', handleInteraction)
    }
  }, [isPlaying, isMuted])

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false
        if (!isPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
        }
      } else {
        audioRef.current.muted = true
      }
      setIsMuted(!isMuted)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/background_tune.mp3"
        loop
        preload="auto"
        muted={isMuted}
        autoPlay
      />
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="fixed bottom-8 right-8 z-[99999] p-4 rounded-full bg-[#060912]/90 border-2 border-[#00F5D4] text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.6)] backdrop-blur-xl group hover:bg-[#00F5D4]/20 transition-all duration-300 pointer-events-auto"
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <VolumeX className="w-7 h-7" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-7 h-7" />
            <motion.span 
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(0, 245, 212, 0.6)', '0 0 0 15px rgba(0, 245, 212, 0)'] 
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full"
            />
          </div>
        )}
      </motion.button>
    </>
  )
}
