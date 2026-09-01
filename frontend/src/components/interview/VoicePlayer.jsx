import { useState, useRef, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

const VoicePlayer = ({ text, voice = 'en-US-AndrewNeural', rate = 0.9, autoPlay = false, onSpeakingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const audioRef = useRef(null)
  const utteranceRef = useRef(null)
  const blobUrlRef = useRef(null)

  const stopAll = useCallback(() => {
    try { audioRef.current?.pause() } catch {}
    try { window.speechSynthesis?.cancel() } catch {}
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    audioRef.current = null
    utteranceRef.current = null
    blobUrlRef.current = null
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

  // Fetch and play server TTS with Web Audio API (background upgrade)
  const upgradeToServerAudio = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, voice, rate }),
      })

      if (!response.ok) return

      const audioBlob = await response.blob()
      if (audioBlob.size < 100) return

      // Stop web speech, play server audio with Web Audio API
      window.speechSynthesis?.cancel()

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      if (audioCtx.state === 'suspended') await audioCtx.resume()

      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

      const source = audioCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioCtx.destination)

      source.onended = () => {
        setIsPlaying(false)
        setProgress(100)
        onSpeakingChange?.(false)
      }

      let startTime = audioCtx.currentTime
      let duration = audioBuffer.duration

      source.start(0)
      audioRef.current = { pause: () => audioCtx.suspend(), currentTime: 0 }

      // Update progress
      const updateProgress = () => {
        if (audioCtx.state === 'closed') return
        const elapsed = audioCtx.currentTime - startTime
        setProgress(Math.min((elapsed / duration) * 100, 100))
        if (elapsed < duration) requestAnimationFrame(updateProgress)
      }
      requestAnimationFrame(updateProgress)
    } catch (err) {
      console.warn('Server audio upgrade failed:', err.message)
    }
  }, [text, voice, rate, onSpeakingChange])

  // Main play handler - called from user click (preserves gesture)
  const play = useCallback(() => {
    // STEP 1: Speak IMMEDIATELY with browser speech (preserves user gesture)
    speakImmediate()

    // STEP 2: Upgrade to server TTS in background (async, no gesture needed)
    setTimeout(() => upgradeToServerAudio(), 100)
  }, [speakImmediate, upgradeToServerAudio])

  const pause = useCallback(() => {
    if (audioRef.current) {
      try { audioRef.current.pause() } catch {}
      setIsPlaying(false)
      onSpeakingChange?.(false)
    } else if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause()
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
