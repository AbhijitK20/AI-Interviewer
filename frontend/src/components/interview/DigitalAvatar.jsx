import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { User, Volume2, VolumeX } from 'lucide-react'
import * as THREE from 'three'

const AvatarHead = ({ isSpeaking, emotion = 'neutral' }) => {
  const headRef = useRef()
  const mouthRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const leftBrowRef = useRef()
  const rightBrowRef = useRef()
  const blinkTimer = useRef(0)

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy': return '#f59e0b'
      case 'serious': return '#6b7280'
      case 'encouraging': return '#10b981'
      default: return '#94a3b8'
    }
  }

  useFrame((state) => {
    if (!headRef.current) return

    // Subtle head movement
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08
    headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.04

    // Mouth animation when speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthOpen = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.15
        mouthRef.current.scale.y = 0.3 + mouthOpen
        mouthRef.current.scale.x = 1 + mouthOpen * 0.5
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.3, 0.1)
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, 0.1)
      }
    }

    // Natural blinking
    blinkTimer.current += state.clock.getDelta()
    if (blinkTimer.current > 3 + Math.random() * 2) {
      blinkTimer.current = 0
    }
    const blinkProgress = blinkTimer.current < 0.15 ? 1 : 0
    if (leftEyeRef.current) leftEyeRef.current.scale.y = 0.1 + blinkProgress * 0.9
    if (rightEyeRef.current) rightEyeRef.current.scale.y = 0.1 + blinkProgress * 0.9

    // Subtle eyebrow movement
    if (leftBrowRef.current) leftBrowRef.current.position.y = 0.38 + Math.sin(state.clock.elapsedTime * 0.5) * 0.005
    if (rightBrowRef.current) rightBrowRef.current.position.y = 0.38 + Math.sin(state.clock.elapsedTime * 0.5) * 0.005
  })

  return (
    <group ref={headRef}>
      {/* Head - Main sphere with skin material */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshPhysicalMaterial
          color="#e8c4a0"
          roughness={0.7}
          metalness={0.05}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 0.35, -0.1]}>
        <sphereGeometry args={[0.88, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshPhysicalMaterial color="#2c1810" roughness={0.9} metalness={0} />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.28, 0.12, 0.75]}>
        <mesh ref={leftEyeRef}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#1e3a5f" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.28, 0.12, 0.75]}>
        <mesh ref={rightEyeRef}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#1e3a5f" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Eyebrows */}
      <mesh ref={leftBrowRef} position={[-0.28, 0.38, 0.78]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.18, 0.025, 0.02]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      <mesh ref={rightBrowRef} position={[0.28, 0.38, 0.78]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.18, 0.025, 0.02]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 0.85]}>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshPhysicalMaterial color="#d4a574" roughness={0.8} />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.28, 0.8]}>
        <boxGeometry args={[0.25, 0.06, 0.05]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.82, 0.05, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhysicalMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>
      <mesh position={[0.82, 0.05, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhysicalMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.35, 16]} />
        <meshPhysicalMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>

      {/* Shoulders */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[1.4, 0.25, 0.4]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.8} />
      </mesh>

      {/* Collar */}
      <mesh position={[0, -1.05, 0.15]}>
        <boxGeometry args={[0.3, 0.08, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  )
}

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-card">
      {/* Avatar Canvas */}
      <div className="h-72">
        <Canvas camera={{ position: [0, 0, 3.5], fov: 40 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 3, 5]} intensity={0.8} color="#ffffff" />
          <directionalLight position={[-3, 2, 3]} intensity={0.4} color="#e0e7ff" />
          <pointLight position={[0, -1, 3]} intensity={0.3} color="#f59e0b" />
          <AvatarHead isSpeaking={isSpeaking} emotion={emotion} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>

      {/* Avatar Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-white/60 text-xs">
                {isSpeaking ? 'Speaking...' : 'Listening...'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex justify-center space-x-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-400 rounded-full animate-pulse"
                style={{
                  height: `${6 + Math.random() * 14}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Message Bubble */}
      {message && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-ink-100 max-w-sm">
            <p className="text-sm text-ink-800 leading-relaxed">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalAvatar
