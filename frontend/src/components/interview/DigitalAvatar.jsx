import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import { User, Volume2, VolumeX, Loader2 } from 'lucide-react'
import * as THREE from 'three'

// Simple animated avatar head component
const AvatarHead = ({ isSpeaking, emotion = 'neutral' }) => {
  const headRef = useRef()
  const mouthRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()

  useFrame((state) => {
    if (!headRef.current) return

    // Subtle head movement
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05

    // Mouth animation when speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthOpen = Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.3
        mouthRef.current.scale.y = 0.5 + mouthOpen
      } else {
        mouthRef.current.scale.y = 0.5
      }
    }

    // Blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.98 ? 0.1 : 1
      leftEyeRef.current.scale.y = blink
      rightEyeRef.current.scale.y = blink
    }
  })

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy': return '#fbbf24'
      case 'serious': return '#6b7280'
      case 'encouraging': return '#34d399'
      default: return '#94a3b8'
    }
  }

  return (
    <group ref={headRef}>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#f5d0b0" roughness={0.8} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 0.4, -0.1]}>
        <sphereGeometry args={[1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>

      {/* Left Eye */}
      <mesh ref={leftEyeRef} position={[-0.3, 0.15, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.3, 0.15, 0.95]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Right Eye */}
      <mesh ref={rightEyeRef} position={[0.3, 0.15, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.3, 0.15, 0.95]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Eyebrows */}
      <mesh position={[-0.3, 0.35, 0.9]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0.3, 0.35, 0.9]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 1]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#e8c39e" />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.35, 0.9]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* Ears */}
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.5, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>

      {/* Shoulders */}
      <mesh position={[0, -1.6, 0]}>
        <boxGeometry args={[1.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  )
}

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
      {/* Avatar Canvas */}
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <pointLight position={[-5, 5, 5]} intensity={0.4} color="#3b82f6" />
            <AvatarHead isSpeaking={isSpeaking} emotion={emotion} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Canvas>
        )}
      </div>

      {/* Avatar Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{name}</p>
              <p className="text-gray-400 text-xs">
                {isSpeaking ? 'Speaking...' : 'Listening...'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex justify-center space-x-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-500 rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 16}px`,
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
          <div className="bg-white/95 rounded-lg p-3 shadow-lg max-w-sm">
            <p className="text-sm text-gray-800">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalAvatar
