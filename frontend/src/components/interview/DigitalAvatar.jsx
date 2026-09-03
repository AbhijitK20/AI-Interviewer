import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Volume2, VolumeX } from 'lucide-react'
import * as THREE from 'three'

function Head({ isSpeaking }) {
  const headRef = useRef()
  const mouthRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const timeRef = useRef(0)

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e8c4a4'),
    roughness: 0.65,
    metalness: 0.05,
  }), [])

  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2c1e12'),
    roughness: 0.85,
    metalness: 0.0,
  }), [])

  const eyeWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f8f4f0'),
    roughness: 0.2,
    metalness: 0.0,
  }), [])

  const irisMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3d2b1f'),
    roughness: 0.15,
    metalness: 0.4,
  }), [])

  const pupilMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0a0a0a'),
    roughness: 0.1,
    metalness: 0.5,
  }), [])

  const shirtMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1c2836'),
    roughness: 0.75,
    metalness: 0.0,
  }), [])

  const lipMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c4756e'),
    roughness: 0.5,
    metalness: 0.0,
  }), [])

  const browMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2a1e14'),
    roughness: 0.9,
    metalness: 0.0,
  }), [])

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.01
    }
    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.005
      leftEyeRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.003
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.005
      rightEyeRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.003
    }
    if (mouthRef.current) {
      mouthRef.current.scale.y = isSpeaking ? 0.3 + Math.random() * 0.7 : 1
    }
  })

  return (
    <group ref={headRef}>
      {/* Body / Shirt */}
      <mesh position={[0, -0.2, 0]} material={shirtMat}>
        <cylinderGeometry args={[0.28, 0.32, 0.45, 32]} />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 0.05, 0.05]} material={shirtMat}>
        <boxGeometry args={[0.3, 0.04, 0.15]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.18, 0]} material={skinMat}>
        <cylinderGeometry args={[0.1, 0.12, 0.12, 24]} />
      </mesh>

      {/* Head - main sphere */}
      <mesh position={[0, 0.55, 0]} material={skinMat}>
        <sphereGeometry args={[0.32, 64, 64]} />
      </mesh>

      {/* Hair - top */}
      <mesh position={[0, 0.75, -0.02]} material={hairMat}>
        <sphereGeometry args={[0.28, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>

      {/* Hair - back */}
      <mesh position={[0, 0.6, -0.25]} material={hairMat}>
        <sphereGeometry args={[0.26, 32, 16]} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.32, 0.5, 0]} material={skinMat}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>
      <mesh position={[0.32, 0.5, 0]} material={skinMat}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.1, 0.55, 0.26]}>
        <mesh material={eyeWhiteMat}>
          <sphereGeometry args={[0.045, 24, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.025]} ref={leftEyeRef} material={irisMat}>
          <sphereGeometry args={[0.025, 24, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={pupilMat}>
          <sphereGeometry args={[0.012, 16, 16]} />
        </mesh>
        <mesh position={[0.008, 0.008, 0.048]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.1, 0.55, 0.26]}>
        <mesh material={eyeWhiteMat}>
          <sphereGeometry args={[0.045, 24, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.025]} ref={rightEyeRef} material={irisMat}>
          <sphereGeometry args={[0.025, 24, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={pupilMat}>
          <sphereGeometry args={[0.012, 16, 16]} />
        </mesh>
        <mesh position={[0.008, 0.008, 0.048]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* Eyebrows */}
      <mesh position={[-0.1, 0.62, 0.28]} rotation={[0, 0, -0.2]} material={browMat}>
        <boxGeometry args={[0.06, 0.008, 0.01]} />
      </mesh>
      <mesh position={[0.1, 0.62, 0.28]} rotation={[0, 0, 0.2]} material={browMat}>
        <boxGeometry args={[0.06, 0.008, 0.01]} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.45, 0.3]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.018, 0.05, 12]} />
        <meshStandardMaterial color="#c8a088" roughness={0.7} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.35, 0.28]} ref={mouthRef} scale={[1, 1, 1]} material={lipMat}>
        <boxGeometry args={[0.07, 0.012, 0.015]} />
      </mesh>

      {/* Chin */}
      <mesh position={[0, 0.28, 0.2]} material={skinMat}>
        <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} color="#ffffff" />
      <pointLight position={[-2, 1, 3]} intensity={0.25} color="#818cf8" />
      <pointLight position={[2, -1, 2]} intensity={0.15} color="#f87171" />
      <pointLight position={[0, 2, 0]} intensity={0.2} color="#fff" />
      <Head isSpeaking={false} />
    </>
  )
}

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80">
        <Canvas
          camera={{ position: [0, 0.3, 1.8], fov: 40 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
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
