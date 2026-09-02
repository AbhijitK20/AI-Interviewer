import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [blinkState, setBlinkState] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)
  const [eyeGaze, setEyeGaze] = useState({ x: 0, y: 0 })
  const [breathCycle, setBreathCycle] = useState(0)

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
    const gaze = setInterval(() => {
      setEyeGaze({
        x: Math.sin(Date.now() / 3500) * 0.4,
        y: Math.cos(Date.now() / 4500) * 0.25
      })
    }, 120)
    return () => clearInterval(gaze)
  }, [])

  useEffect(() => {
    const breath = setInterval(() => {
      setBreathCycle(Math.sin(Date.now() / 3000) * 0.8)
    }, 100)
    return () => clearInterval(breath)
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

  const emotionColors = {
    neutral: { cheek: '#e8b4a0', lip: '#c4756e', iris: '#3d2b1f' },
    happy: { cheek: '#f0c0a0', lip: '#d4857e', iris: '#3d2b1f' },
    thinking: { cheek: '#e0a898', lip: '#b8706a', iris: '#2d1b10' },
    concerned: { cheek: '#d8a090', lip: '#a86060', iris: '#2d1b10' },
  }
  const colors = emotionColors[emotion] || emotionColors.neutral

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(99,102,241,.06), transparent 60%)' }} />

        <svg viewBox="0 0 240 300" className="w-60 h-72" style={{ transform: `rotate(${headTilt}deg)`, filter: 'drop-shadow(0 12px 40px rgba(0,0,0,.5))' }}>
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2d4bc"/><stop offset="40%" stopColor="#e8c4a4"/><stop offset="100%" stopColor="#d9b894"/>
            </linearGradient>
            <linearGradient id="sg2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0d0b4"/><stop offset="100%" stopColor="#dab48c"/>
            </linearGradient>
            <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c1e12"/><stop offset="100%" stopColor="#1a1008"/>
            </linearGradient>
            <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c2836"/><stop offset="100%" stopColor="#101822"/>
            </linearGradient>
            <linearGradient id="tg2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#243447"/><stop offset="100%" stopColor="#152230"/>
            </linearGradient>
            <filter id="ds"><feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity=".35"/></filter>
            <radialGradient id="skinSheen" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stop-color="rgba(255,255,255,.08)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </radialGradient>
            <clipPath id="headClip"><ellipse cx="120" cy="115" rx="42" ry="50"/></clipPath>
          </defs>

          {/* Shadow */}
          <ellipse cx="120" cy="290" rx="55" ry="7" fill="rgba(0,0,0,.35)" filter="url(#ds)"/>

          {/* Body */}
          <path d="M55 210 Q55 195 75 185 L165 185 Q185 195 185 210 L185 300 L55 300 Z" fill="url(#tg)"/>
          <path d="M55 210 Q55 195 75 185 L165 185 Q185 195 185 210" fill="url(#tg2)" opacity=".6"/>
          {/* Shirt details */}
          <path d="M90 190 L100 186 L120 192 L140 186 L150 190" stroke="rgba(255,255,255,.08)" strokeWidth="1" fill="none"/>
          <path d="M95 200 L120 195 L145 200" stroke="rgba(255,255,255,.06)" strokeWidth=".5" fill="none"/>
          {/* Collar */}
          <path d="M88 187 L105 182 L120 188 L135 182 L152 187" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" fill="none"/>
          {/* Buttons */}
          <circle cx="120" cy="200" r="1.5" fill="rgba(255,255,255,.08)"/>
          <circle cx="120" cy="212" r="1.5" fill="rgba(255,255,255,.06)"/>

          {/* Neck */}
          <rect x="107" y="160" width="26" height="28" rx="5" fill="url(#sg)"/>
          <path d="M107 175 Q120 180 133 175" stroke="rgba(180,150,130,.3)" strokeWidth="1" fill="none"/>

          {/* Head */}
          <ellipse cx="120" cy="115" rx="42" ry="50" fill="url(#sg)"/>
          <ellipse cx="120" cy="115" rx="42" ry="50" fill="url(#skinSheen)"/>

          {/* Hair */}
          <path d="M78 92 Q78 58 120 52 Q162 58 162 92 Q162 72 120 66 Q78 72 78 92 Z" fill="url(#hg)"/>
          <path d="M82 96 Q82 78 120 72 Q158 78 158 96 Q158 84 120 78 Q82 84 82 96 Z" fill="#1a1008" opacity=".5"/>
          {/* Hair shine */}
          <path d="M95 75 Q110 68 130 72" stroke="rgba(255,255,255,.06)" strokeWidth="2" fill="none" strokeLinecap="round"/>

          {/* Ears */}
          <ellipse cx="78" cy="115" rx="7" ry="11" fill="#dab48c"/>
          <ellipse cx="78" cy="115" rx="5" ry="8" fill="#e0bc98"/>
          <ellipse cx="162" cy="115" rx="7" ry="11" fill="#dab48c"/>
          <ellipse cx="162" cy="115" rx="5" ry="8" fill="#e0bc98"/>

          {/* Eyes */}
          <g transform={`translate(${eyeGaze.x * 1.5}, ${eyeGaze.y * 1.5})`}>
            {/* Eye whites */}
            <ellipse cx="103" cy="108" rx="11" ry={blinkState ? 1.5 : 7} fill="#f8f4f0"/>
            <ellipse cx="137" cy="108" rx="11" ry={blinkState ? 1.5 : 7} fill="#f8f4f0"/>
            {/* Iris */}
            <circle cx="103" cy="108" r="5" fill={colors.iris}/>
            <circle cx="137" cy="108" r="5" fill={colors.iris}/>
            {/* Pupil */}
            <circle cx="103" cy="108" r="2.5" fill="#0a0a0a"/>
            <circle cx="137" cy="108" r="2.5" fill="#0a0a0a"/>
            {/* Catch lights */}
            <circle cx="104.5" cy="106.5" r="1.2" fill="white" opacity=".9"/>
            <circle cx="138.5" cy="106.5" r="1.2" fill="white" opacity=".9"/>
            <circle cx="102" cy="107" r=".6" fill="white" opacity=".5"/>
            <circle cx="136" cy="107" r=".6" fill="white" opacity=".5"/>
          </g>

          {/* Eyebrows */}
          <path d="M88 96 Q100 89 116 93" stroke="#2a1e14" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M124 93 Q140 89 152 96" stroke="#2a1e14" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

          {/* Nose */}
          <path d="M117 118 Q119 126 121 118" stroke="#c8a088" strokeWidth="1.5" fill="none"/>
          <path d="M118 122 Q120 124 122 122" stroke="#c8a088" strokeWidth=".8" fill="none"/>

          {/* Cheeks */}
          <ellipse cx="92" cy="122" rx="10" ry="5" fill={colors.cheek} opacity=".25"/>
          <ellipse cx="148" cy="122" rx="10" ry="5" fill={colors.cheek} opacity=".25"/>

          {/* Mouth */}
          <path d={`M106 132 Q120 ${134 + mouthOpen * 3} 134 132`} stroke={colors.lip} strokeWidth="2" fill="none" strokeLinecap="round"/>

          {/* Chin */}
          <path d="M100 148 Q120 158 140 148" stroke="rgba(180,150,130,.2)" strokeWidth="1" fill="none"/>
        </svg>

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
