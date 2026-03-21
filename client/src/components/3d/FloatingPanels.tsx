import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

const PANELS = [
  { label: 'THREAT LEVEL', value: 'HIGH', color: '#FF4D4D', pos: [-3, 1.5, 0], rot: [0.1, 0.3, 0.05] },
  { label: 'AGENTS ACTIVE', value: '4/4', color: '#00F5D4', pos: [0, 2, -1], rot: [-0.05, 0, 0.1] },
  { label: 'SCANS TODAY', value: '1,247', color: '#7B61FF', pos: [3, 1, 0.5], rot: [0, -0.3, -0.05] },
  { label: 'THREATS BLOCKED', value: '98.3%', color: '#00F5D4', pos: [-2, -1.5, 1], rot: [0.2, 0.2, 0] },
  { label: 'RESPONSE TIME', value: '0.3ms', color: '#F59E0B', pos: [2.5, -1, -0.5], rot: [-0.1, -0.2, 0.05] },
]

function FloatingPanel({
  label,
  value,
  color,
  pos,
  rot,
  index,
}: {
  label: string
  value: string
  color: string
  pos: number[]
  rot: number[]
  index: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const t = useRef(index * 1.3)

  useFrame((_, delta) => {
    t.current += delta
    if (groupRef.current) {
      groupRef.current.position.y = pos[1] + Math.sin(t.current * 0.6 + index) * 0.15
      groupRef.current.rotation.x = rot[0] + Math.sin(t.current * 0.4) * 0.02
      groupRef.current.rotation.y = rot[1] + Math.cos(t.current * 0.3) * 0.02
    }
  })

  return (
    <group
      ref={groupRef}
      position={new THREE.Vector3(pos[0], pos[1], pos[2])}
      rotation={new THREE.Euler(rot[0], rot[1], rot[2])}
    >
      {/* Panel background */}
      <RoundedBox args={[2, 0.9, 0.05]} radius={0.05}>
        <meshStandardMaterial
          color="#0d1424"
          emissive={color}
          emissiveIntensity={0.05}
          transparent
          opacity={0.85}
          metalness={0.3}
          roughness={0.7}
        />
      </RoundedBox>

      {/* Glow border */}
      <RoundedBox args={[2.02, 0.92, 0.04]} radius={0.05}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </RoundedBox>

      {/* Label text */}
      <Text
        position={[0, 0.2, 0.04]}
        fontSize={0.1}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {label}
      </Text>

      {/* Value text */}
      <Text
        position={[0, -0.1, 0.04]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        fontWeight="bold"
      >
        {value}
      </Text>
    </group>
  )
}

export function FloatingPanels({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00F5D4" />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#7B61FF" />

        {PANELS.map((panel, i) => (
          <FloatingPanel key={panel.label} {...panel} index={i} />
        ))}
      </Canvas>
    </div>
  )
}
