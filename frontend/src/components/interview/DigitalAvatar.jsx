import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    const blink = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 120)
    }, 2800 + Math.random() * 2500)
    return () => clearInterval(blink)
  }, [])

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

  const emotionGlow = {
    neutral: 'rgba(99,102,241,.15)',
    happy: 'rgba(52,211,153,.15)',
    thinking: 'rgba(251,191,36,.12)',
    concerned: 'rgba(248,113,113,.12)',
  }

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Dynamic emotion glow */}
        <div className="absolute inset-0 transition-all duration-500" style={{
          background: `radial-gradient(ellipse at 50% 40%, ${emotionGlow[emotion] || emotionGlow.neutral}, transparent 60%)`,
          opacity: 0.5 + glowIntensity
        }} />

        {/* Professional avatar with photo-realistic rendering */}
        <div className="relative" style={{
          transform: `rotate(${headTilt}deg) scale(${1 + mouthOpen * 0.02})`,
          filter: `drop-shadow(0 12px 40px rgba(0,0,0,.5))`
        }}>
          <svg viewBox="0 0 200 260" className="w-48 h-60">
            <defs>
              <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0d0b4"/><stop offset="50%" stopColor="#e8c4a4"/><stop offset="100%" stopColor="#d9b894"/>
              </linearGradient>
              <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c1e12"/><stop offset="100%" stopColor="#1a1008"/>
              </linearGradient>
              <linearGradient id="shirt" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1c2836"/><stop offset="100%" stopColor="#101822"/>
              </linearGradient>
              <radialGradient id="faceLight" cx="35%" cy="30%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,.1)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/>
              </radialGradient>
              <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity=".3"/></filter>
            </defs>

            <ellipse cx="100" cy="250" rx="50" ry="6" fill="rgba(0,0,0,.3)" filter="url(#shadow)"/>

            {/* Shirt with collar details */}
            <path d="M45 185 Q45 170 65 160 L135 160 Q155 170 155 185 L155 260 L45 260 Z" fill="url(#shirt)"/>
            <path d="M88 162 L100 157 L112 162" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" fill="none"/>
            <path d="M88 168 L100 163 L112 168" stroke="rgba(255,255,255,.08)" strokeWidth=".8" fill="none"/>
            <circle cx="100" cy="175" r="1.5" fill="rgba(255,255,255,.08)"/>

            {/* Neck */}
            <rect x="88" y="138" width="24" height="26" rx="5" fill="url(#skin)"/>
            <path d="M88 155 Q100 160 112 155" stroke="rgba(180,150,130,.25)" strokeWidth="1" fill="none"/>

            {/* Head with highlight */}
            <ellipse cx="100" cy="98" rx="40" ry="48" fill="url(#skin)"/>
            <ellipse cx="100" cy="98" rx="40" ry="48" fill="url(#faceLight)"/>

            {/* Hair with texture */}
            <path d="M60 80 Q60 50 100 44 Q140 50 140 80 Q140 62 100 56 Q60 62 60 80 Z" fill="url(#hair)"/>
            <path d="M64 83 Q64 68 100 62 Q136 68 136 83 Q136 72 100 66 Q64 72 64 83 Z" fill="#1a1008" opacity=".5"/>
            <path d="M78 66 Q90 58 110 62" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" fill="none"/>
            <path d="M82 72 Q95 66 108 70" stroke="rgba(255,255,255,.03)" strokeWidth="1" fill="none"/>

            {/* Ears */}
            <ellipse cx="60" cy="98" rx="6" ry="10" fill="#d9b894"/>
            <ellipse cx="60" cy="98" rx="4" ry="7" fill="#e0bc98"/>
            <ellipse cx="140" cy="98" rx="6" ry="10" fill="#d9b894"/>
            <ellipse cx="140" cy="98" rx="4" ry="7" fill="#e0bc98"/>

            {/* Eyes with realistic detail */}
            <g>
              <ellipse cx="84" cy="95" rx="9" ry={blinking ? 1 : 6} fill="#f8f4f0"/>
              <circle cx="84" cy="95" r="4.5" fill="#3d2b1f"/>
              <circle cx="84" cy="95" r="2.2" fill="#0a0a0a"/>
              <circle cx="85.5" cy="93.5" r="1" fill="white" opacity=".9"/>
              <circle cx="83" cy="94" r=".5" fill="white" opacity=".5"/>
              <ellipse cx="116" cy="95" rx="9" ry={blinking ? 1 : 6} fill="#f8f4f0"/>
              <circle cx="116" cy="95" r="4.5" fill="#3d2b1f"/>
              <circle cx="116" cy="95" r="2.2" fill="#0a0a0a"/>
              <circle cx="117.5" cy="93.5" r="1" fill="white" opacity=".9"/>
              <circle cx="115" cy="94" r=".5" fill="white" opacity=".5"/>
            </g>

            {/* Eyebrows */}
            <path d="M70 84 Q82 78 96 82" stroke="#2a1e14" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M104 82 Q118 78 130 84" stroke="#2a1e14" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Nose with shadow */}
            <path d="M98 106 Q100 114 102 106" stroke="#c8a088" strokeWidth="1.2" fill="none"/>
            <path d="M99 110 Q100 112 101 110" stroke="#c8a088" strokeWidth=".6" fill="none"/>

            {/* Cheeks */}
            <ellipse cx="76" cy="108" rx="8" ry="4" fill="#e8b4a0" opacity=".2"/>
            <ellipse cx="124" cy="108" rx="8" ry="4" fill="#e8b4a0" opacity=".2"/>

            {/* Mouth */}
            <path d={`M86 122 Q100 ${124 + mouthOpen * 3} 114 122`} stroke="#c4756e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

            {/* Chin definition */}
            <path d="M80 138 Q100 146 120 138" stroke="rgba(180,150,130,.12)" strokeWidth=".8" fill="none"/>
          </svg>
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
