import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Volume2, VolumeX } from 'lucide-react'
import * as THREE from 'three'

// 3D Head component with realistic shading
function Head({ isSpeaking, emotion, headTilt }) {
  const headRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const mouthRef = useRef()

  // Skin material with realistic PBR
  const skinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e8c4a4'),
    roughness: 0.7,
    metalness: 0.1,
    envMapIntensity: 0.5,
  }), [])

  // Hair material
  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2c1e12'),
    roughness: 0.9,
    metalness: 0.0,
  }), [])

  // Eye material
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f8f4f0'),
    roughness: 0.3,
    metalness: 0.0,
  }), [])

  // Iris material
  const irisMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3d2b1f'),
    roughness: 0.2,
    metalness: 0.3,
  }), [])

  // Shirt material
  const shirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1c2836'),
    roughness: 0.8,
    metalness: 0.0,
  }), [])

  // Animate head tilt
  useFrame((state) => {
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.01
    }
  })

  return (
    <group ref={headRef}>
      {/* Head */}
      <mesh position={[0, 0.5, 0]} material={skinMaterial}>
        <sphereGeometry args={[0.35, 32, 32]} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 0.7, -0.05]} material={hairMaterial}>
        <sphereGeometry args={[0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.12, 0.55, 0.28]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.04, 16, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.02]} ref={leftEyeRef} material={irisMaterial}>
          <sphereGeometry args={[0.02, 16, 16]} />
        </mesh>
        <mesh position={[0.005, 0.005, 0.035]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.12, 0.55, 0.28]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.04, 16, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.02]} ref={rightEyeRef} material={irisMaterial}>
          <sphereGeometry args={[0.02, 16, 16]} />
        </mesh>
        <mesh position={[0.005, 0.005, 0.035]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* Nose */}
      <mesh position={[0, 0.45, 0.32]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.02, 0.06, 8]} />
        <meshStandardMaterial color="#c8a088" roughness={0.8} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.35, 0.3]} ref={mouthRef} scale={[1, isSpeaking ? 0.3 + Math.random() * 0.5 : 1, 1]}>
        <boxGeometry args={[0.08, 0.015, 0.02]} />
        <meshStandardMaterial color="#c4756e" roughness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.15, 0]} material={skinMaterial}>
        <cylinderGeometry args={[0.1, 0.12, 0.15, 16]} />
      </mesh>

      {/* Body / Shirt */}
      <mesh position={[0, -0.15, 0]} material={shirtMaterial}>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 16]} />
      </mesh>
    </group>
  )
}

// Main avatar component
const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setSpeaking(isSpeaking)
  }, [isSpeaking])

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80">
        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 1.5], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 3, 5]} intensity={0.8} color="#fff" />
          <pointLight position={[-2, 1, 3]} intensity={0.3} color="#818cf8" />
          <pointLight position={[2, -1, 3]} intensity={0.2} color="#f87171" />

          {/* Head */}
          <Head isSpeaking={speaking} emotion={emotion} />
        </Canvas>

        {/* Name badge */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-white/50">AI Interviewer</p>
            </div>
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,.1)' }}>
              {isMuted ? <VolumeX className="w-4 h-4 text-white/50" /> : <Volume2 className="w-4 h-4 text-white/70" />}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.7)' }}>
            {message.length > 120 ? message.substring(0, 120) + '...' : message}
          </p>
        </div>
      )}
    </div>
  )
}

export default DigitalAvatar
