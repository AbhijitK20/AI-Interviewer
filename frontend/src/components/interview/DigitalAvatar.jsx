import { useState, useEffect } from 'react'
import { User, Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [blinkState, setBlinkState] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)

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

  // Mouth animation
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

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-card">
      <div className="relative h-80 flex items-center justify-center">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
        
        {/* Professional Avatar */}
        <svg viewBox="0 0 240 280" className="w-56 h-64 drop-shadow-2xl" style={{ transform: `rotate(${headTilt}deg)` }}>
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0d0b0" />
              <stop offset="100%" stopColor="#e0b890" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c1810" />
              <stop offset="100%" stopColor="#1a0f0a" />
            </linearGradient>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#152a45" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Shoulders & Suit */}
          <path d="M 40 230 Q 40 210 60 200 L 100 195 L 180 200 Q 200 210 200 230 L 200 280 L 40 280 Z" fill="url(#suitGrad)" filter="url(#shadow)" />
          <path d="M 90 195 L 100 190 L 150 190 L 150 195 Z" fill="white" opacity="0.9" />
          <line x1="120" y1="192" x2="120" y2="230" stroke="#c0392b" strokeWidth="2" />
          
          {/* Neck */}
          <rect x="105" y="170" width="30" height="30" rx="12" fill="url(#skinGrad)" />
          
          {/* Head */}
          <ellipse cx="120" cy="120" rx="50" ry="60" fill="url(#skinGrad)" filter="url(#shadow)" />
          
          {/* Hair */}
          <path d="M 70 100 Q 70 55 120 50 Q 170 55 170 100 Q 165 85 120 80 Q 75 85 70 100" fill="url(#hairGrad)" />
          <ellipse cx="120" cy="72" rx="48" ry="22" fill="url(#hairGrad)" />
          
          {/* Ears */}
          <ellipse cx="68" cy="120" rx="7" ry="10" fill="url(#skinGrad)" stroke="#d4a574" strokeWidth="0.5" />
          <ellipse cx="172" cy="120" rx="7" ry="10" fill="url(#skinGrad)" stroke="#d4a574" strokeWidth="0.5" />
          
          {/* Eyebrows */}
          <path d={blinkState ? "M 85 103 Q 95 101 105 103" : "M 85 100 Q 95 97 105 100"} stroke="#2c1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={blinkState ? "M 135 103 Q 145 101 155 103" : "M 135 100 Q 145 97 155 100"} stroke="#2c1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          
          {/* Eyes */}
          <g opacity={blinkState ? 0.1 : 1}>
            {/* Left eye */}
            <ellipse cx="95" cy="112" rx="10" ry="7" fill="white" stroke="#d4d4d8" strokeWidth="0.5" />
            <circle cx="96" cy="112" r="5" fill="#1e3a5f" />
            <circle cx="97" cy="111" r="2" fill="#0f172a" />
            <circle cx="98" cy="110" r="0.8" fill="white" />
            
            {/* Right eye */}
            <ellipse cx="145" cy="112" rx="10" ry="7" fill="white" stroke="#d4d4d8" strokeWidth="0.5" />
            <circle cx="144" cy="112" r="5" fill="#1e3a5f" />
            <circle cx="143" cy="111" r="2" fill="#0f172a" />
            <circle cx="142" cy="110" r="0.8" fill="white" />
          </g>
          
          {/* Nose */}
          <path d="M 117 125 Q 120 138 123 125" fill="none" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Mouth - animated */}
          <path d={`M 105 ${148 + mouthOpen * 2} Q 120 ${152 + mouthOpen * 6} 135 ${148 + mouthOpen * 2}`} fill="#c0392b" stroke="#a02020" strokeWidth="0.5" />
          
          {/* Chin shadow */}
          <ellipse cx="120" cy="168" rx="28" ry="6" fill="#d4a574" opacity="0.3" />
          
          {/* Shirt collar highlights */}
          <path d="M 92 196 L 100 192 L 108 196" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
          <path d="M 132 196 L 140 192 L 148 196" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
        </svg>
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-400 rounded-full animate-pulse"
                style={{ height: `${4 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-white/60 text-xs">{isSpeaking ? 'Speaking...' : 'Listening...'}</p>
            </div>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Message */}
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
