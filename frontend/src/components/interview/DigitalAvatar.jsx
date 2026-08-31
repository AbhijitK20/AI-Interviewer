import { useState, useEffect, useRef } from 'react'
import { User, Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [blinkState, setBlinkState] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const animRef = useRef(null)

  // Natural blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true)
      setTimeout(() => setBlinkState(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  // Mouth animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      const mouthInterval = setInterval(() => {
        setMouthOpen(Math.random() * 0.4 + 0.1)
      }, 100)
      return () => clearInterval(mouthInterval)
    } else {
      setMouthOpen(0)
    }
  }, [isSpeaking])

  const getEmotionGradient = () => {
    switch (emotion) {
      case 'happy': return 'from-amber-100 to-orange-100'
      case 'serious': return 'from-slate-100 to-slate-200'
      case 'encouraging': return 'from-emerald-100 to-teal-100'
      default: return 'from-slate-100 to-slate-200'
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 shadow-card">
      {/* Avatar Container */}
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-900/50 to-purple-950/50" />
        
        {/* Professional Avatar SVG */}
        <div className="relative z-10">
          <svg viewBox="0 0 200 240" className="w-48 h-56 drop-shadow-2xl">
            {/* Shoulders */}
            <ellipse cx="100" cy="210" rx="70" ry="30" fill="#1e3a5f" />
            <ellipse cx="100" cy="215" rx="65" ry="25" fill="#1e3a5f" />
            
            {/* Collar */}
            <path d="M 75 195 Q 100 185 125 195 L 120 200 Q 100 192 80 200 Z" fill="white" />
            
            {/* Neck */}
            <rect x="88" y="175" width="24" height="30" rx="10" fill="#e8c4a0" />
            
            {/* Head */}
            <ellipse cx="100" cy="130" rx="45" ry="55" fill="#e8c4a0" />
            
            {/* Hair */}
            <path d="M 55 110 Q 55 70 100 65 Q 145 70 145 110 Q 140 95 100 90 Q 60 95 55 110" fill="#2c1810" />
            <ellipse cx="100" cy="85" rx="42" ry="25" fill="#2c1810" />
            
            {/* Ears */}
            <ellipse cx="55" cy="130" rx="8" ry="12" fill="#e8c4a0" />
            <ellipse cx="145" cy="130" rx="8" ry="12" fill="#e8c4a0" />
            
            {/* Eyebrows */}
            <line x1="72" y1="108" x2="90" y2="106" stroke="#2c1810" strokeWidth="3" strokeLinecap="round" />
            <line x1="110" y1="106" x2="128" y2="108" stroke="#2c1810" strokeWidth="3" strokeLinecap="round" />
            
            {/* Eyes */}
            <g opacity={blinkState ? 0.1 : 1}>
              <ellipse cx="82" cy="118" rx="8" ry="6" fill="white" />
              <circle cx="83" cy="118" r="4" fill="#1e3a5f" />
              <circle cx="84" cy="117" r="1.5" fill="black" />
              <circle cx="85" cy="116" r="0.5" fill="white" />
              
              <ellipse cx="118" cy="118" rx="8" ry="6" fill="white" />
              <circle cx="117" cy="118" r="4" fill="#1e3a5f" />
              <circle cx="116" cy="117" r="1.5" fill="black" />
              <circle cx="115" cy="116" r="0.5" fill="white" />
            </g>
            
            {/* Nose */}
            <path d="M 97 128 Q 100 138 103 128" fill="none" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
            
            {/* Mouth - animated */}
            <ellipse cx="100" cy="148" rx={8 + mouthOpen * 4} ry={1.5 + mouthOpen * 3} fill="#c0392b" />
            
            {/* Chin */}
            <ellipse cx="100" cy="165" rx="25" ry="8" fill="#e8c4a0" opacity="0.5" />
          </svg>
        </div>
        
        {/* Speaking indicator dots */}
        {isSpeaking && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-400 rounded-full animate-pulse"
                style={{
                  height: `${4 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
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
