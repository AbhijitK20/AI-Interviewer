import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const DigitalAvatar = ({ isSpeaking, emotion, name = 'AI Interviewer', message, audioDuration = 0 }) => {
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef(null)
  const speakTimeoutRef = useRef(null)

  // Smooth video playback synced with speech
  useEffect(() => {
    if (!videoRef.current) return
    const video = videoRef.current

    if (isSpeaking) {
      // Start video with slight delay to sync with TTS
      speakTimeoutRef.current = setTimeout(() => {
        video.currentTime = 0
        // Adjust playback rate based on audio duration
        if (audioDuration > 0) {
          video.playbackRate = Math.max(0.8, Math.min(1.5, video.duration / audioDuration))
        }
        video.play().catch(() => {})
      }, 150) // Small delay to sync with TTS start
    } else {
      // Smooth fade out - pause and hold last frame
      clearTimeout(speakTimeoutRef.current)
      video.pause()
    }

    return () => clearTimeout(speakTimeoutRef.current)
  }, [isSpeaking, audioDuration])

  // Reset video when not speaking
  useEffect(() => {
    if (!isSpeaking && videoRef.current) {
      videoRef.current.currentTime = 0
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
          opacity: isSpeaking ? 0.5 : 0.2
        }} />

        {/* Realistic talking avatar video */}
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            className="h-full object-contain"
            style={{
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,.5))',
              maxHeight: '100%',
              transition: 'filter 0.3s ease',
            }}
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/talkingavatar.mp4" type="video/mp4" />
          </video>
        </div>

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
