import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function FloatingParticles({ count = 200 }) {
  const mesh = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.x = state.clock.elapsedTime * 0.02
    mesh.current.rotation.y = state.clock.elapsedTime * 0.03
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function FloatingRing({ radius = 3, tube = 0.02, color = '#818cf8' }) {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5
    ref.current.rotation.y = state.clock.elapsedTime * 0.2
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 100]} />
      <meshStandardMaterial color={color} transparent opacity={0.3} />
    </mesh>
  )
}

export default function Scene3D({ className = '', particles = true, rings = true }) {
  return (
    <div className={`fixed inset-0 -z-20 ${className}`} style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        {particles && <FloatingParticles />}
        {rings && (
          <>
            <FloatingRing radius={2.5} color="#6366f1" />
            <FloatingRing radius={3.5} color="#818cf8" />
            <FloatingRing radius={4.5} color="#a5b4fc" />
          </>
        )}
      </Canvas>
    </div>
  )
}
