import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import * as THREE from 'three'

const AGENT_COLORS: Record<string, string> = {
  SENTINEL: '#00F5D4',
  CIPHER: '#7B61FF',
  PHANTOM: '#FF4D4D',
  NEXUS: '#F59E0B',
  HUB: '#ffffff',
}

const AGENTS = [
  { name: 'TARK', pos: [0, 0, 0], color: '#ffffff', size: 0.18 },
  { name: 'SENTINEL', pos: [2.5, 1, 0.5], color: '#00F5D4', size: 0.12 },
  { name: 'CIPHER', pos: [-2.5, 1, -0.5], color: '#7B61FF', size: 0.12 },
  { name: 'PHANTOM', pos: [0, -2.5, 1], color: '#FF4D4D', size: 0.12 },
  { name: 'NEXUS', pos: [1, 2, -1.5], color: '#F59E0B', size: 0.12 },
]

function AgentNode({ name, pos, color, size }: {
  name: string
  pos: number[]
  color: string
  size: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const t = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    t.current += delta
    if (meshRef.current) {
      meshRef.current.position.y = pos[1] + Math.sin(t.current * 0.8) * 0.1
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5
      const scale = 1 + Math.sin(t.current * 2) * 0.1
      ringRef.current.scale.setScalar(scale)
    }
  })

  const position = new THREE.Vector3(pos[0], pos[1], pos[2])

  return (
    <group position={position}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Orbital ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 1.8, 0.01, 8, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, size + 0.15, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpmIyXjU1pg.woff2"
      >
        {name}
      </Text>
    </group>
  )
}

function NetworkConnections() {
  const connections = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = []
    const hub = new THREE.Vector3(0, 0, 0)

    AGENTS.slice(1).forEach(agent => {
      lines.push({
        start: hub,
        end: new THREE.Vector3(agent.pos[0], agent.pos[1], agent.pos[2]),
        color: agent.color,
      })
    })

    // Cross-connections
    lines.push({
      start: new THREE.Vector3(2.5, 1, 0.5),
      end: new THREE.Vector3(1, 2, -1.5),
      color: '#ffffff',
    })
    lines.push({
      start: new THREE.Vector3(-2.5, 1, -0.5),
      end: new THREE.Vector3(0, -2.5, 1),
      color: '#ffffff',
    })

    return lines
  }, [])

  const pulseRef = useRef(0)

  useFrame((_, delta) => {
    pulseRef.current += delta
  })

  return (
    <>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color={conn.color}
          lineWidth={1}
          transparent
          opacity={0.3 + Math.abs(Math.sin(pulseRef.current + i)) * 0.3}
        />
      ))}
    </>
  )
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {AGENTS.map(agent => (
        <AgentNode key={agent.name} {...agent} />
      ))}
      <NetworkConnections />
    </group>
  )
}

export function AgentNetwork3D({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00F5D4" />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#7B61FF" />
        <pointLight position={[0, -5, 5]} intensity={0.5} color="#FF4D4D" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
