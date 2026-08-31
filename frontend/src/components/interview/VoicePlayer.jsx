import { useState, useRef, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

const VoicePlayer = ({ text, voice = 'en-US-AndrewNeural', rate = 0.9, autoPlay = false, onSpeakingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  const sourceRef = useRef(null)
  const audioCtxRef = useRef(null)
  const startTimeRef = useRef(0)
  const durationRef = useRef(0)
  const animRef = useRef(null)

  const stopAll = useCallback(() => {
    try { sourceRef.current?.stop() } catch (_e) { /* ignore */ }
    try { audioCtxRef.current?.close() } catch (_e) { /* ignore */ }
    if (animRef.current) cancelAnimationFrame(animRef.current)
    sourceRef.current = null
    audioCtxRef.current = null
    setIsPlaying(false)
    setProgress(0)
    setStatus('')
    onSpeakingChange?.(false)
  }, [onSpeakingChange])

  const playAudioWithWebAudio = useCallback(async (audioBlob) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    audioCtxRef.current = audioCtx

    // Resume context if suspended (autoplay policy)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume()
    }

    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtx.destination)
    sourceRef.current = source

    durationRef.current = audioBuffer.duration
    startTimeRef.current = audioCtx.currentTime

    source.onended = () => {
      setIsPlaying(false)
      setProgress(100)
      setStatus('')
      onSpeakingChange?.(false)
    }

    source.start(0)
    setIsPlaying(true)
    setStatus('neural')
    onSpeakingChange?.(true)

    // Update progress
    const updateProgress = () => {
      if (audioCtx.state === 'closed') return
      const elapsed = audioCtx.currentTime - startTimeRef.current
      const pct = Math.min((elapsed / durationRef.current) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        animRef.current = requestAnimationFrame(updateProgress)
      }
    }
    animRef.current = requestAnimationFrame(updateProgress)
  }, [onSpeakingChange])

  const speakWithServerTTS = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No auth token')

      setStatus('loading...')
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, voice, rate }),
      })

      if (!response.ok) throw new Error('TTS unavailable')

      const audioBlob = await response.blob()
      if (audioBlob.size < 100) throw new Error('Empty audio')

      // Play with Web Audio API (works in Brave, no autoplay issues)
      await playAudioWithWebAudio(audioBlob)
    } catch (err) {
      console.error('TTS failed:', err.message)
      setStatus('TTS failed: ' + err.message)
      // Last resort: try web speech
      tryWebSpeechFallback()
    }
  }, [text, voice, rate, playAudioWithWebAudio, onSpeakingChange])

  const tryWebSpeechFallback = useCallback(() => {
    if (!('speechSynthesis' in window) || !text) return

    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.volume = isMuted ? 0 : 1
    const voices = window.speechSynthesis.getVoices()
    const en = voices.find(v => v.lang.startsWith('en'))
    if (en) u.voice = en

    u.onstart = () => { setIsPlaying(true); setStatus('browser'); onSpeakingChange?.(true) }
    u.onend = () => { setIsPlaying(false); setProgress(100); onSpeakingChange?.(false) }
    u.onerror = () => { setIsPlaying(false); setStatus('Speech not available'); onSpeakingChange?.(false) }

    window.speechSynthesis.speak(u)
  }, [text, rate, isMuted, onSpeakingChange])

  const play = useCallback(() => {
    speakWithServerTTS()
  }, [speakWithServerTTS])

  const pause = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend()
      setIsPlaying(false)
      onSpeakingChange?.(false)
    } else if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
      setIsPlaying(true)
      onSpeakingChange?.(true)
    }
  }, [onSpeakingChange])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  useEffect(() => { stopAll() }, [text])
  useEffect(() => () => { stopAll() }, [])

  useEffect(() => {
    const v = () => window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', v)
    v()
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', v)
  }, [])

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
        {status === 'loading...' && 'Loading neural voice...'}
        {status === 'neural' && isPlaying && 'AI Interviewer is speaking (neural voice)...'}
        {status === 'browser' && isPlaying && 'AI Interviewer is speaking (browser voice)...'}
        {status.startsWith('TTS failed') && 'Click play to retry'}
        {status === 'Speech not available' && 'Speech synthesis not available in this browser'}
        {!isPlaying && !status && 'Click play to hear the question'}
      </p>
    </div>
  )
}

export default VoicePlayer
