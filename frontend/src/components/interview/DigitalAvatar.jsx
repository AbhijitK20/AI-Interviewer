import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const tilt = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 2500) * 1.5)
    }, 80)
    return () => clearInterval(tilt)
  }, [])

  useEffect(() => {
    if (isSpeaking) {
      const mouth = setInterval(() => {
        setMouthOpen(Math.random())
      }, 80)
      return () => clearInterval(mouth)
    } else {
      setMouthOpen(0)
    }
  }, [isSpeaking])

  // Draw realistic avatar on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw base face with realistic skin tone
      const gradient = ctx.createRadialGradient(90, 80, 0, 90, 80, 80)
      gradient.addColorStop(0, '#f0d0b4')
      gradient.addColorStop(0.5, '#e8c4a4')
      gradient.addColorStop(1, '#d9b894')
      
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((headTilt * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
      
      // Face
      ctx.beginPath()
      ctx.ellipse(90, 85, 42, 50, 0, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Hair
      ctx.beginPath()
      ctx.ellipse(90, 55, 38, 25, 0, Math.PI, Math.PI * 2)
      ctx.fillStyle = '#2c1e12'
      ctx.fill()
      
      // Eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(75, 80, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(105, 80, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Pupils
      ctx.fillStyle = '#3d2b1f'
      ctx.beginPath()
      ctx.arc(75, 80, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(105, 80, 3.5, 0, Math.PI * 2)
      ctx.fill()
      
      // Catch lights
      ctx.fillStyle = 'rgba(255,255,255,.9)'
      ctx.beginPath()
      ctx.arc(76.5, 78.5, 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(106.5, 78.5, 1, 0, Math.PI * 2)
      ctx.fill()
      
      // Nose
      ctx.strokeStyle = '#c8a088'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(88, 95)
      ctx.quadraticCurveTo(90, 102, 92, 95)
      ctx.stroke()
      
      // Mouth
      ctx.strokeStyle = '#c4756e'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      const mouthY = 110 + mouthOpen * 3
      ctx.moveTo(76, 110)
      ctx.quadraticCurveTo(90, mouthY, 104, 110)
      ctx.stroke()
      
      // Collar
      ctx.strokeStyle = 'rgba(255,255,255,.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(70, 148)
      ctx.lineTo(85, 143)
      ctx.lineTo(100, 148)
      ctx.lineTo(115, 143)
      ctx.lineTo(130, 148)
      ctx.stroke()
      
      ctx.restore()
    }
    
    draw()
  }, [mouthOpen, headTilt])

  const emotionGlow = {
    neutral: 'rgba(99,102,241,.15)',
    happy: 'rgba(52,211,153,.15)',
    thinking: 'rgba(251,191,36,.12)',
    concerned: 'rgba(248,113,113,.12)',
  }

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #080c14, #0d1525, #080c14)' }}>
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 transition-all duration-500" style={{
          background: `radial-gradient(ellipse at 50% 40%, ${emotionGlow[emotion] || emotionGlow.neutral}, transparent 60%)`
        }} />
        
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className="w-44 h-44"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.4))' }}
        />

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
