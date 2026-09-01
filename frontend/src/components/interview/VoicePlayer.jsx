import { useState, useRef, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

const VoicePlayer = ({ text, voice = 'en-US-AndrewNeural', rate = 0.9, autoPlay = false, onSpeakingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const audioCtxRef = useRef(null)
  const sourceRef = useRef(null)
  const audioBufferRef = useRef(null)
  const startTimeRef = useRef(0)
  const pausedAtRef = useRef(0)
  const durationRef = useRef(0)
  const utteranceRef = useRef(null)

  const stopAll = useCallback(() => {
    try {
      if (sourceRef.current) {
        sourceRef.current.onended = null
        sourceRef.current.stop()
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
    } catch {}
    try { window.speechSynthesis?.cancel() } catch {}
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close() } catch {}
    }
    audioCtxRef.current = null
    audioBufferRef.current = null
    utteranceRef.current = null
    startTimeRef.current = 0
    pausedAtRef.current = 0
    durationRef.current = 0
    setIsPlaying(false)
    setProgress(0)
    onSpeakingChange?.(false)
  }, [onSpeakingChange])

  // Speak immediately using browser speech (preserves user gesture)
  const speakImmediate = useCallback(() => {
    if (!text || !window.speechSynthesis) return false

    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.volume = isMuted ? 0 : 1

    const voices = window.speechSynthesis.getVoices()
    const en = voices.find(v => v.lang.startsWith('en'))
    if (en) u.voice = en

    u.onstart = () => { setIsPlaying(true); onSpeakingChange?.(true) }
    u.onend = () => { setIsPlaying(false); setProgress(100); onSpeakingChange?.(false) }
    u.onerror = () => { setIsPlaying(false); onSpeakingChange?.(false) }

    utteranceRef.current = u
    window.speechSynthesis.speak(u)
    return true
  }, [text, rate, isMuted, onSpeakingChange])

  // Fetch server TTS audio (returns decoded AudioBuffer)
  const fetchServerAudio = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, voice, rate }),
      })

      if (!response.ok) return null

      const audioBlob = await response.blob()
      if (audioBlob.size < 100) return null

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContextClass()
      if (audioCtx.state === 'suspended') await audioCtx.resume()

      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

      return { audioCtx, audioBuffer }
    } catch (err) {
      console.warn('Server audio fetch failed:', err.message)
      return null
    }
  }, [text, voice, rate])

  // Start/resume playing from the AudioContext
  const playFromBuffer = useCallback((audioCtx, audioBuffer, offset = 0) => {
    // Stop any existing source
    if (sourceRef.current) {
      try {
        sourceRef.current.onended = null
        sourceRef.current.stop()
        sourceRef.current.disconnect()
      } catch {}
    }

    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtx.destination)

    source.onended = () => {
      // Only mark as finished if we're actually at the end
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
    onSpeakingChange?.(true)

    // Update progress
    const updateProgress = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current
      const pct = Math.min((elapsed / durationRef.current) * 100, 100)
      setProgress(pct)
      if (pct < 100 && isPlaying) requestAnimationFrame(updateProgress)
    }
    requestAnimationFrame(updateProgress)
  }, [onSpeakingChange, isPlaying])

  // Main play handler - called from user click (preserves gesture)
  const play = useCallback(async () => {
    // If we have a paused buffer, resume from where we left off
    if (audioBufferRef.current && audioCtxRef.current && pausedAtRef.current > 0) {
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()
      playFromBuffer(ctx, audioBufferRef.current, pausedAtRef.current)
      return
    }

    // STEP 1: Speak IMMEDIATELY with browser speech (preserves user gesture)
    speakImmediate()

    // STEP 2: Upgrade to server TTS in background (async, no gesture needed)
    const result = await fetchServerAudio()
    if (result) {
      // Cancel browser speech
      window.speechSynthesis?.cancel()

      // Start playing server audio
      playFromBuffer(result.audioCtx, result.audioBuffer, 0)
    }
  }, [speakImmediate, fetchServerAudio, playFromBuffer])

  const pause = useCallback(async () => {
    // Pause browser speech
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      onSpeakingChange?.(false)
      return
    }

    // Pause Web Audio API
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      // Save current position
      pausedAtRef.current = audioCtxRef.current.currentTime - startTimeRef.current

      // Stop the source node
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
          disabled={!text}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 shadow-lg'
              : 'bg-gradient-brand hover:opacity-90 shadow-md'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
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
        {isPlaying ? 'AI Interviewer is speaking...' : 'Click play to hear the question'}
      </p>
    </div>
  )
}

export default VoicePlayer
