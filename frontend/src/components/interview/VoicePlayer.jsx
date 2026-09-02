import { useState, useRef, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react'

const VoicePlayer = ({ text, voice = 'en-US-AndrewNeural', rate = 0.9, autoPlay = false, onSpeakingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioSource, setAudioSource] = useState('')

  const audioCtxRef = useRef(null)
  const sourceRef = useRef(null)
  const audioBufferRef = useRef(null)
  const startTimeRef = useRef(0)
  const pausedAtRef = useRef(0)
  const durationRef = useRef(0)
  const animFrameRef = useRef(null)

  const stopAll = useCallback(() => {
    try {
      if (sourceRef.current) {
        sourceRef.current.onended = null
        try { sourceRef.current.stop() } catch (e) { /* already stopped */ }
        try { sourceRef.current.disconnect() } catch (e) { /* already disconnected */ }
        sourceRef.current = null
      }
    } catch (e) { /* ignore */ }
    try { window.speechSynthesis?.cancel() } catch (e) { /* ignore */ }
    try {
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {})
        }
      }
    } catch (e) { /* ignore */ }
    audioCtxRef.current = null
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    audioBufferRef.current = null
    startTimeRef.current = 0
    pausedAtRef.current = 0
    durationRef.current = 0
    animFrameRef.current = null
    setIsPlaying(false)
    setIsLoading(false)
    setProgress(0)
    setAudioSource('')
    onSpeakingChange?.(false)
  }, [onSpeakingChange])

  const playFromBuffer = useCallback((audioCtx, audioBuffer, offset = 0) => {
    if (sourceRef.current) {
      try {
        sourceRef.current.onended = null
        sourceRef.current.stop()
        sourceRef.current.disconnect()
      } catch { /* ignore */ }
    }

    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtx.destination)

    source.onended = () => {
      if (audioCtx.currentTime >= startTimeRef.current + durationRef.current - 0.1) {
        setIsPlaying(false)
        setProgress(100)
        onSpeakingChange?.(false)
      }
    }

    source.start(0, offset)
    sourceRef.current = source
    startTimeRef.current = audioCtx.currentTime - offset
    durationRef.current = audioBuffer.duration
    audioCtxRef.current = audioCtx
    audioBufferRef.current = audioBuffer
    pausedAtRef.current = offset
    setIsPlaying(true)
    setIsLoading(false)
    onSpeakingChange?.(true)

    const updateProgress = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current
      const pct = Math.min((elapsed / durationRef.current) * 100, 100)
      setProgress(pct)
      if (pct < 100) animFrameRef.current = requestAnimationFrame(updateProgress)
    }
    animFrameRef.current = requestAnimationFrame(updateProgress)
  }, [onSpeakingChange])

  // Fallback: browser speechSynthesis
  const speakWithBrowser = useCallback(() => {
    if (!text || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.volume = isMuted ? 0 : 1

    const voices = window.speechSynthesis.getVoices()
    const en = voices.find(v => v.lang.startsWith('en'))
    if (en) u.voice = en

    u.onstart = () => { setIsPlaying(true); setIsLoading(false); onSpeakingChange?.(true) }
    u.onend = () => { setIsPlaying(false); setIsLoading(false); setProgress(100); onSpeakingChange?.(false) }
    u.onerror = () => { setIsPlaying(false); setIsLoading(false); onSpeakingChange?.(false) }

    window.speechSynthesis.speak(u)
  }, [text, rate, isMuted, onSpeakingChange])

  // Main play handler
  const play = useCallback(async () => {
    // Resume from pause
    if (audioBufferRef.current && audioCtxRef.current && pausedAtRef.current > 0) {
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()
      playFromBuffer(ctx, audioBufferRef.current, pausedAtRef.current)
      return
    }

    stopAll()
    setIsLoading(true)

    // Try server TTS first - call ai-service directly (backend proxy returns empty bytes)
    try {
      const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'https://ai-interviewer-ai-service-qpxr.onrender.com'
      console.log('[VoicePlayer] Trying ai-service TTS:', aiServiceUrl)
      if (text) {
        const response = await fetch(`${aiServiceUrl}/ai/synthesize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, voice, rate }),
        })

        console.log('[VoicePlayer] Server response:', response.status, response.headers.get('content-type'))

        if (response.ok) {
          const audioBlob = await response.blob()
          console.log('[VoicePlayer] Audio blob size:', audioBlob.size)
          if (audioBlob.size > 100) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            const audioCtx = new AudioContextClass()
            if (audioCtx.state === 'suspended') await audioCtx.resume()

            const arrayBuffer = await audioBlob.arrayBuffer()
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
            console.log('[VoicePlayer] Playing SERVER audio, duration:', audioBuffer.duration, 'sec')

            setAudioSource('server')
            playFromBuffer(audioCtx, audioBuffer, 0)
            return
          }
        }
      }
    } catch (err) {
      console.warn('[VoicePlayer] Server TTS failed, falling back to browser speech:', err.message)
    }

    console.log('[VoicePlayer] Using BROWSER speechSynthesis fallback')
    setAudioSource('browser')
    speakWithBrowser()
  }, [text, voice, rate, stopAll, playFromBuffer, speakWithBrowser])

  const pause = useCallback(async () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      onSpeakingChange?.(false)
      return
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      pausedAtRef.current = audioCtxRef.current.currentTime - startTimeRef.current
      if (sourceRef.current) {
        sourceRef.current.onended = null
        sourceRef.current.stop()
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      setIsPlaying(false)
      onSpeakingChange?.(false)
    }
  }, [onSpeakingChange])

  const toggleMute = useCallback(() => setIsMuted(p => !p), [])

  useEffect(() => { stopAll() }, [text])
  useEffect(() => () => { stopAll() }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <button
          onClick={isPlaying ? pause : play}
          disabled={!text || isLoading}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 shadow-lg'
              : 'bg-gradient-brand hover:opacity-90 shadow-md'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>

        <button onClick={toggleMute}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-600 transition-colors">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="flex-1">
          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {isPlaying && (
          <div className="flex space-x-0.5 items-end h-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-0.5 bg-primary-500 rounded-full animate-pulse"
                style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-ink-400">
        {isLoading ? 'Loading voice...' : isPlaying ? `AI Interviewer is speaking... (${audioSource})` : 'Click play to hear the question'}
      </p>
    </div>
  )
}

export default VoicePlayer
