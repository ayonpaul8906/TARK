import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Wireframe } from '@react-three/drei'
import * as THREE from 'three'

function CoreObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = state.clock.getElapsedTime() * -0.1
      wireRef.current.rotation.y = state.clock.getElapsedTime() * -0.4
    }
  })

  return (
    <group>
      {/* Inner Glowing Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#00F5D4" 
          emissive="#00F5D4" 
          emissiveIntensity={2} 
          wireframe 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Outer Wireframe Hull */}
      <mesh ref={wireRef} scale={1.4}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial 
          color="#7B61FF" 
          wireframe 
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Lighting */}
      <pointLight position={[0, 0, 0]} intensity={10} color="#00F5D4" distance={5} />
    </group>
  )
}

export function CyberLoader3D() {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.2} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <CoreObject />
        </Float>
      </Canvas>
    </div>
  )
}
