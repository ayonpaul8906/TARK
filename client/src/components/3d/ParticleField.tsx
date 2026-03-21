import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Particles({ count = 3000, color = '#00F5D4' }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [count])

  const velocities = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002,
    }))
  }, [count])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i].x
      pos[i * 3 + 1] += velocities[i].y
      pos[i * 3 + 2] += velocities[i].z

      // Boundary wrap
      for (let d = 0; d < 3; d++) {
        if (pos[i * 3 + d] > 10) pos[i * 3 + d] = -10
        if (pos[i * 3 + d] < -10) pos[i * 3 + d] = 10
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y += 0.0003
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

function SecondaryParticles() {
  const ref = useRef<THREE.Points>(null)
  const count = 500

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 15
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.03
      ref.current.rotation.z += delta * 0.02
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        size={0.04}
        color="#7B61FF"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

interface ParticleFieldProps {
  className?: string
}

export function ParticleField({ className = '' }: ParticleFieldProps) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
      >
        <Particles count={2000} color="#00F5D4" />
        <SecondaryParticles />
      </Canvas>
    </div>
  )
}
