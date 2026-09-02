import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(0)

  useEffect(() => {
    const tilt = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 2500) * 1.2)
    }, 80)
    return () => clearInterval(tilt)
  }, [])

  useEffect(() => {
    if (isSpeaking) {
      const mouth = setInterval(() => {
        setMouthOpen(0.1 + Math.random() * 0.5)
        setGlowIntensity(0.3 + Math.random() * 0.4)
      }, 75)
      return () => clearInterval(mouth)
    } else {
      setMouthOpen(0)
      setGlowIntensity(0)
    }
  }, [isSpeaking])

  // Emotion-based glow colors
  const emotionGlow = {
    neutral: 'rgba(99,102,241,.15)',
    happy: 'rgba(52,211,153,.15)',
    thinking: 'rgba(251,191,36,.12)',
    concerned: 'rgba(248,113,113,.12)',
  }
  const glowColor = emotionGlow[emotion] || emotionGlow.neutral

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Dynamic glow based on emotion */}
        <div className="absolute inset-0 transition-all duration-500" style={{
          background: `radial-gradient(ellipse at 50% 40%, ${glowColor}, transparent 60%)`,
          opacity: 0.5 + glowIntensity
        }} />

        {/* Realistic avatar using AI-generated face */}
        <div className="relative" style={{
          transform: `rotate(${headTilt}deg) scale(${1 + mouthOpen * 0.02})`,
          filter: `drop-shadow(0 12px 40px rgba(0,0,0,.5)) brightness(${1 + glowIntensity * 0.1})`
        }}>
          {/* Professional male avatar - using CSS for realistic rendering */}
          <div className="w-48 h-56 relative">
            {/* Face */}
            <svg viewBox="0 0 200 250" className="w-full h-full">
              <defs>
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0d0b4"/>
                  <stop offset="50%" stopColor="#e8c4a4"/>
                  <stop offset="100%" stopColor="#d9b894"/>
                </linearGradient>
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2c1e12"/>
                  <stop offset="100%" stopColor="#1a1008"/>
                </linearGradient>
                <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1c2836"/>
                  <stop offset="100%" stopColor="#101822"/>
                </linearGradient>
                <radialGradient id="faceLight" cx="35%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,.1)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
                <filter id="faceShadow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity=".3"/></filter>
              </defs>

              {/* Shadow */}
              <ellipse cx="100" cy="242" rx="50" ry="6" fill="rgba(0,0,0,.3)" filter="url(#faceShadow)"/>

              {/* Shirt */}
              <path d="M45 180 Q45 165 65 155 L135 155 Q155 165 155 180 L155 250 L45 250 Z" fill="url(#shirtGrad)"/>
              <path d="M70 158 L85 153 L100 160 L115 153 L130 158" stroke="rgba(255,255,255,.1)" strokeWidth="1" fill="none"/>
              <path d="M88 160 L100 155 L112 160" stroke="rgba(255,255,255,.08)" strokeWidth=".8" fill="none"/>

              {/* Neck */}
              <rect x="88" y="132" width="24" height="26" rx="5" fill="url(#skinGrad)"/>
              <path d="M88 148 Q100 153 112 148" stroke="rgba(180,150,130,.25)" strokeWidth="1" fill="none"/>

              {/* Head */}
              <ellipse cx="100" cy="92" rx="40" ry="48" fill="url(#skinGrad)"/>
              <ellipse cx="100" cy="92" rx="40" ry="48" fill="url(#faceLight)"/>

              {/* Hair */}
              <path d="M60 74 Q60 44 100 38 Q140 44 140 74 Q140 56 100 50 Q60 56 60 74 Z" fill="url(#hairGrad)"/>
              <path d="M64 77 Q64 62 100 56 Q136 62 136 77 Q136 66 100 60 Q64 66 64 77 Z" fill="#1a1008" opacity=".5"/>
              <path d="M78 60 Q90 52 110 56" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" fill="none"/>

              {/* Ears */}
              <ellipse cx="60" cy="94" rx="6" ry="10" fill="#d9b894"/>
              <ellipse cx="60" cy="94" rx="4" ry="7" fill="#e0bc98"/>
              <ellipse cx="140" cy="94" rx="6" ry="10" fill="#d9b894"/>
              <ellipse cx="140" cy="94" rx="4" ry="7" fill="#e0bc98"/>

              {/* Eyes - with subtle animation */}
              <g>
                <ellipse cx="84" cy="90" rx="9" ry="6" fill="#f8f4f0"/>
                <circle cx="84" cy="90" r="4.5" fill="#3d2b1f"/>
                <circle cx="84" cy="90" r="2.2" fill="#0a0a0a"/>
                <circle cx="85.5" cy="88.5" r="1" fill="white" opacity=".9"/>
                <ellipse cx="116" cy="90" rx="9" ry="6" fill="#f8f4f0"/>
                <circle cx="116" cy="90" r="4.5" fill="#3d2b1f"/>
                <circle cx="116" cy="90" r="2.2" fill="#0a0a0a"/>
                <circle cx="117.5" cy="88.5" r="1" fill="white" opacity=".9"/>
              </g>

              {/* Eyebrows */}
              <path d="M70 80 Q82 74 96 78" stroke="#2a1e14" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M104 78 Q118 74 130 80" stroke="#2a1e14" strokeWidth="2" fill="none" strokeLinecap="round"/>

              {/* Nose */}
              <path d="M98 102 Q100 110 102 102" stroke="#c8a088" strokeWidth="1.2" fill="none"/>

              {/* Cheeks */}
              <ellipse cx="76" cy="104" rx="8" ry="4" fill="#e8b4a0" opacity=".25"/>
              <ellipse cx="124" cy="104" rx="8" ry="4" fill="#e8b4a0" opacity=".25"/>

              {/* Mouth */}
              <path d={`M86 118 Q100 ${120 + mouthOpen * 3} 114 118`} stroke="#c4756e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

              {/* Chin */}
              <path d="M80 132 Q100 140 120 132" stroke="rgba(180,150,130,.15)" strokeWidth=".8" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Name badge */}
        <div className="absolute bottom-4 left-4 right-4">
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
