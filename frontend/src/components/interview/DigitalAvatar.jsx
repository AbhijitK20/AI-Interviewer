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

        {/* Professional avatar using AI-generated face */}
        <div className="relative" style={{
          transform: `rotate(${headTilt}deg) scale(${1 + mouthOpen * 0.02})`,
          filter: `drop-shadow(0 12px 40px rgba(0,0,0,.5))`
        }}>
          {/* Realistic face using CSS gradients and shadows */}
          <div className="w-48 h-60 relative">
            {/* Face base with realistic skin tone */}
            <div className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden" style={{
              background: 'radial-gradient(ellipse at 50% 40%, #f0d0b4 0%, #e8c4a4 50%, #d9b894 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,.4), inset 0 2px 8px rgba(255,255,255,.1)'
            }}>
              {/* Face highlight */}
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,.12), transparent 50%)'
              }}/>
              
              {/* Hair */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-44 h-20 rounded-b-full" style={{
                background: 'linear-gradient(180deg, #2c1e12 0%, #1a1008 100%)',
                clipPath: 'polygon(10% 100%, 0% 30%, 15% 0%, 85% 0%, 100% 30%, 90% 100%)'
              }}/>
              
              {/* Eyes */}
              <div className="absolute top-[35%] left-0 right-0 flex justify-center gap-8">
                <div className="w-5 h-5 rounded-full bg-white relative" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3)' }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3d2b1f]"/>
                  <div className="absolute top-[30%] left-[60%] w-1 h-1 rounded-full bg-white opacity-90"/>
                </div>
                <div className="w-5 h-5 rounded-full bg-white relative" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3)' }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3d2b1f]"/>
                  <div className="absolute top-[30%] left-[60%] w-1 h-1 rounded-full bg-white opacity-90"/>
                </div>
              </div>

              {/* Eyebrows */}
              <div className="absolute top-[28%] left-0 right-0 flex justify-center gap-10">
                <div className="w-5 h-0.5 bg-[#2a1e14] rounded-full -rotate-6"/>
                <div className="w-5 h-0.5 bg-[#2a1e14] rounded-full rotate-6"/>
              </div>

              {/* Nose */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-1.5 h-2 rounded-full" style={{ background: 'rgba(180,150,130,.3)' }}/>

              {/* Mouth */}
              <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2" style={{ transform: `translateX(-50%) scaleY(${1 + mouthOpen * 0.4})` }}>
                <div className="w-6 h-1 rounded-full" style={{ background: '#c4756e' }}/>
              </div>

              {/* Cheeks */}
              <div className="absolute top-[45%] left-[15%] w-4 h-2 rounded-full" style={{ background: '#e8b4a0', opacity: .2 }}/>
              <div className="absolute top-[45%] right-[15%] w-4 h-2 rounded-full" style={{ background: '#e8b4a0', opacity: .2 }}/>
            </div>
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
