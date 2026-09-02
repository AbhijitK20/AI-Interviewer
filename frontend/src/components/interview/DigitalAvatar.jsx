import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [blinkState, setBlinkState] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)

  useEffect(() => {
    const blink = setInterval(() => {
      setBlinkState(true)
      setTimeout(() => setBlinkState(false), 100)
    }, 2800 + Math.random() * 2500)
    return () => clearInterval(blink)
  }, [])

  useEffect(() => {
    const tilt = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 2200) * 1.5)
    }, 80)
    return () => clearInterval(tilt)
  }, [])

  useEffect(() => {
    if (isSpeaking) {
      const mouth = setInterval(() => {
        setMouthOpen(0.15 + Math.random() * 0.7)
      }, 70)
      return () => clearInterval(mouth)
    } else {
      setMouthOpen(0)
    }
  }, [isSpeaking])

  // Realistic professional male avatar using CSS/SVG hybrid
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(99,102,241,.06), transparent 60%)' }} />

        {/* Realistic avatar container */}
        <div className="relative" style={{ transform: `rotate(${headTilt}deg)`, filter: 'drop-shadow(0 12px 40px rgba(0,0,0,.5))' }}>
          {/* Face base - realistic skin tone with gradient */}
          <svg viewBox="0 0 200 240" className="w-48 h-56">
            <defs>
              <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0d0b4"/>
                <stop offset="50%" stopColor="#e8c4a4"/>
                <stop offset="100%" stopColor="#d9b894"/>
              </linearGradient>
              <linearGradient id="skinShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4a888"/>
                <stop offset="100%" stopColor="#c49878"/>
              </linearGradient>
              <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c1e12"/>
                <stop offset="100%" stopColor="#1a1008"/>
              </linearGradient>
              <linearGradient id="shirt" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1c2836"/>
                <stop offset="100%" stopColor="#101822"/>
              </linearGradient>
              <radialGradient id="highlight" cx="35%" cy="30%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,.12)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
              </radialGradient>
              <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity=".3"/></filter>
            </defs>

            {/* Shadow */}
            <ellipse cx="100" cy="232" rx="50" ry="6" fill="rgba(0,0,0,.3)" filter="url(#shadow)"/>

            {/* Body */}
            <path d="M45 175 Q45 160 65 150 L135 150 Q155 160 155 175 L155 240 L45 240 Z" fill="url(#shirt)"/>
            <path d="M70 155 L85 150 L100 156 L115 150 L130 155" stroke="rgba(255,255,255,.1)" strokeWidth="1" fill="none"/>

            {/* Neck */}
            <rect x="88" y="130" width="24" height="24" rx="4" fill="url(#skin)"/>

            {/* Head */}
            <ellipse cx="100" cy="90" rx="38" ry="46" fill="url(#skin)"/>
            <ellipse cx="100" cy="90" rx="38" ry="46" fill="url(#highlight)"/>

            {/* Hair */}
            <path d="M62 72 Q62 42 100 38 Q138 42 138 72 Q138 55 100 50 Q62 55 62 72 Z" fill="url(#hair)"/>
            <path d="M65 75 Q65 60 100 55 Q135 60 135 75 Q135 65 100 60 Q65 65 65 75 Z" fill="#1a1008" opacity=".5"/>
            <path d="M78 60 Q90 52 110 55" stroke="rgba(255,255,255,.06)" strokeWidth="1.5" fill="none"/>

            {/* Ears */}
            <ellipse cx="62" cy="92" rx="6" ry="10" fill="#d9b894"/>
            <ellipse cx="62" cy="92" rx="4" ry="7" fill="#e0bc98"/>
            <ellipse cx="138" cy="92" rx="6" ry="10" fill="#d9b894"/>
            <ellipse cx="138" cy="92" rx="4" ry="7" fill="#e0bc98"/>

            {/* Eyes */}
            <g transform={`translate(${Math.sin(Date.now() / 3500) * 0.8}, ${Math.cos(Date.now() / 4500) * 0.5})`}>
              <ellipse cx="85" cy="88" rx="9" ry={blinkState ? 1 : 6} fill="#f8f4f0"/>
              <circle cx="85" cy="88" r="4.5" fill="#3d2b1f"/>
              <circle cx="85" cy="88" r="2.2" fill="#0a0a0a"/>
              <circle cx="86.5" cy="86.5" r="1" fill="white" opacity=".9"/>
              <ellipse cx="115" cy="88" rx="9" ry={blinkState ? 1 : 6} fill="#f8f4f0"/>
              <circle cx="115" cy="88" r="4.5" fill="#3d2b1f"/>
              <circle cx="115" cy="88" r="2.2" fill="#0a0a0a"/>
              <circle cx="116.5" cy="86.5" r="1" fill="white" opacity=".9"/>
            </g>

            {/* Eyebrows */}
            <path d="M72 78 Q84 72 98 76" stroke="#2a1e14" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M102 76 Q116 72 128 78" stroke="#2a1e14" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Nose */}
            <path d="M98 100 Q100 108 102 100" stroke="#c8a088" strokeWidth="1.2" fill="none"/>

            {/* Cheeks */}
            <ellipse cx="78" cy="102" rx="8" ry="4" fill="#e8b4a0" opacity=".25"/>
            <ellipse cx="122" cy="102" rx="8" ry="4" fill="#e8b4a0" opacity=".25"/>

            {/* Mouth */}
            <path d={`M88 115 Q100 ${117 + mouthOpen * 3} 112 115`} stroke="#c4756e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

            {/* Chin */}
            <path d="M82 128 Q100 136 118 128" stroke="rgba(180,150,130,.15)" strokeWidth=".8" fill="none"/>
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
