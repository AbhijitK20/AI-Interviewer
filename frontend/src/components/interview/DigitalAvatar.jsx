import { useState, useEffect, useRef } from 'react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [blinkState, setBlinkState] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)
  const [eyeGaze, setEyeGaze] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  // Natural blinking
  useEffect(() => {
    const blink = setInterval(() => {
      setBlinkState(true)
      setTimeout(() => setBlinkState(false), 120)
    }, 2500 + Math.random() * 3000)
    return () => clearInterval(blink)
  }, [])

  // Subtle head movement
  useEffect(() => {
    const tilt = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 2000) * 2)
    }, 100)
    return () => clearInterval(tilt)
  }, [])

  // Eye gaze (subtle random movement)
  useEffect(() => {
    const gaze = setInterval(() => {
      setEyeGaze({
        x: Math.sin(Date.now() / 3000) * 0.5,
        y: Math.cos(Date.now() / 4000) * 0.3
      })
    }, 150)
    return () => clearInterval(gaze)
  }, [])

  // Mouth animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      const mouth = setInterval(() => {
        setMouthOpen(0.2 + Math.random() * 0.6)
      }, 80)
      return () => clearInterval(mouth)
    } else {
      setMouthOpen(0)
    }
  }, [isSpeaking])

  // Emotion-based colors
  const emotionColors = {
    neutral: { cheek: '#e8b4a0', lip: '#c4756e', eye: '#4a3728' },
    happy: { cheek: '#f0c0a0', lip: '#d4857e', eye: '#4a3728' },
    thinking: { cheek: '#e0a898', lip: '#b8706a', eye: '#3a2718' },
    concerned: { cheek: '#d8a090', lip: '#a86060', eye: '#3a2018' },
  }
  const colors = emotionColors[emotion] || emotionColors.neutral

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #0a0f1a, #0d1525, #0a0f1a)' }}>
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,.08), transparent 70%)' }} />

        {/* Professional Avatar SVG */}
        <svg viewBox="0 0 240 280" className="w-56 h-64 drop-shadow-2xl" style={{ transform: `rotate(${headTilt}deg)`, filter: 'drop-shadow(0 8px 32px rgba(0,0,0,.4))' }}>
          <defs>
            {/* Skin gradient */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0d0b0" />
              <stop offset="50%" stopColor="#e8c4a0" />
              <stop offset="100%" stopColor="#dbb890" />
            </linearGradient>
            {/* Hair gradient */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a1f14" />
              <stop offset="100%" stopColor="#1a1008" />
            </linearGradient>
            {/* Shirt gradient */}
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a2332" />
              <stop offset="100%" stopColor="#0f1520" />
            </linearGradient>
            {/* Shadow */}
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
            </filter>
            {/* Lip sync filter */}
            <filter id="lipSync">
              <feMorphology operator="dilate" radius={mouthOpen * 0.3} />
            </filter>
          </defs>

          {/* Shadow ellipse */}
          <ellipse cx="120" cy="270" rx="60" ry="8" fill="rgba(0,0,0,.3)" filter="url(#shadow)" />

          {/* Body / Shirt */}
          <path d="M60 200 Q60 180 80 170 L160 170 Q180 180 180 200 L180 280 L60 280 Z" fill="url(#shirtGrad)" />
          <path d="M75 175 L165 175" stroke="rgba(255,255,255,.1)" strokeWidth="1" />

          {/* Neck */}
          <rect x="105" y="155" width="30" height="20" rx="4" fill="url(#skinGrad)" />

          {/* Head */}
          <ellipse cx="120" cy="110" rx="45" ry="52" fill="url(#skinGrad)" />

          {/* Hair */}
          <path d="M75 90 Q75 60 120 55 Q165 60 165 90 Q165 75 120 70 Q75 75 75 90 Z" fill="url(#hairGrad)" />
          <path d="M78 95 Q78 80 120 75 Q162 80 162 95 Q162 85 120 80 Q78 85 78 95 Z" fill="#1a1008" opacity=".6" />

          {/* Ears */}
          <ellipse cx="75" cy="110" rx="8" ry="12" fill="#dbb890" />
          <ellipse cx="165" cy="110" rx="8" ry="12" fill="#dbb890" />

          {/* Eyes */}
          <g transform={`translate(${eyeGaze.x * 2}, ${eyeGaze.y * 2})`}>
            {/* Left eye */}
            <ellipse cx="102" cy="105" rx="10" ry={blinkState ? 1 : 6} fill="white" />
            <circle cx="102" cy="105" r="4" fill={colors.eye} />
            <circle cx="103" cy="104" r="1.5" fill="white" opacity=".8" />

            {/* Right eye */}
            <ellipse cx="138" cy="105" rx="10" ry={blinkState ? 1 : 6} fill="white" />
            <circle cx="138" cy="105" r="4" fill={colors.eye} />
            <circle cx="139" cy="104" r="1.5" fill="white" opacity=".8" />
          </g>

          {/* Eyebrows */}
          <path d="M88 95 Q100 88 115 92" stroke="#2a1f14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M125 92 Q140 88 152 95" stroke="#2a1f14" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M118 115 Q120 122 122 115" stroke="#c4a080" strokeWidth="1.5" fill="none" />

          {/* Cheeks (blush) */}
          <ellipse cx="95" cy="118" rx="12" ry="6" fill={colors.cheek} opacity=".3" />
          <ellipse cx="145" cy="118" rx="12" ry="6" fill={colors.cheek} opacity=".3" />

          {/* Mouth */}
          <path d={`M105 128 Q120 ${130 + mouthOpen * 4} 135 128`} stroke={colors.lip} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Collar */}
          <path d="M85 170 L105 165 L120 170 L135 165 L155 170" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Name badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-white/50">AI Interviewer</p>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,.1)' }}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white/50" /> : <Volume2 className="w-4 h-4 text-white/70" />}
            </button>
          </div>
        </div>
      </div>

      {/* Message area */}
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
