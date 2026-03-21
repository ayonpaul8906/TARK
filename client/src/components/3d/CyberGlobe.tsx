import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Line, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function GlobeNodes() {
  const nodeCount = 40
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, () => {
      const phi = Math.acos(-1 + (2 * Math.random()))
      const theta = Math.random() * Math.PI * 2
      return new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * 2.05,
        Math.sin(phi) * Math.sin(theta) * 2.05,
        Math.cos(phi) * 2.05,
      )
    })
  }, [])

  const connections = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.5 && lines.length < 60) {
          lines.push([nodes[i], nodes[j]])
        }
      }
    }
    return lines
  }, [nodes])

  const pulseRef = useRef(0)

  useFrame((_, delta) => {
    pulseRef.current += delta
  })

  return (
    <group>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#00F5D4"
            emissive="#00F5D4"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
      {connections.map(([start, end], i) => (
        <Line
          key={i}
          points={[start, end]}
          color="#00F5D4"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}
    </group>
  )
}

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#0B0F19"
          emissive="#00F5D4"
          emissiveIntensity={0.05}
          wireframe={false}
          transparent
          opacity={0.6}
        />
      </Sphere>
      <Sphere args={[2.01, 32, 32]}>
        <meshStandardMaterial
          color="#00F5D4"
          emissive="#00F5D4"
          emissiveIntensity={0.1}
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>
    </mesh>
  )
}

function OrbitRing({ radius, tilt, speed }: { radius: number; tilt: number; speed: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed
  })

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
    }
    return pts
  }, [radius])

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Line points={points} color="#7B61FF" lineWidth={0.8} transparent opacity={0.3} />
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#7B61FF" emissive="#7B61FF" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function ParticleCloud() {
  const count = 800
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 4
      const phi = Math.acos(-1 + Math.random() * 2)
      const theta = Math.random() * Math.PI * 2
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  const pointsRef = useRef<THREE.Points>(null)

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial size={0.015} color="#00F5D4" transparent opacity={0.4} sizeAttenuation />
    </Points>
  )
}

function RotatingGroup() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <GlobeMesh />
      <GlobeNodes />
    </group>
  )
}

interface CyberGlobeProps {
  className?: string
  height?: string
}

export function CyberGlobe({ className = '', height = 'h-full' }: CyberGlobeProps) {
  return (
    <div className={`${height} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00F5D4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7B61FF" />

        <RotatingGroup />
        <OrbitRing radius={2.8} tilt={0.5} speed={0.3} />
        <OrbitRing radius={3.2} tilt={-0.8} speed={-0.2} />
        <ParticleCloud />
      </Canvas>
    </div>
  )
}
