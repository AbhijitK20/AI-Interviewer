import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

const VoiceRecorder = ({ onTranscript, onRecordingChange, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const recognitionRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const isRecordingRef = useRef(false)
  const restartTimeoutRef = useRef(null)

  const startRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
        onTranscript?.(finalTranscript, true)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error)
      // Don't restart on 'not-allowed' or 'service-not-available'
      if (event.error === 'not-allowed' || event.error === 'service-not-available') {
        return
      }
      // For other errors (no-speech, aborted, network), restart if still recording
      if (isRecordingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            try { recognition.start() } catch (e) { /* ignore */ }
          }
        }, 300)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still recording (Web Speech API stops after silence)
      if (isRecordingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            try { recognition.start() } catch (e) { /* ignore */ }
          }
        }, 300)
      }
    }

    try {
      recognition.start()
    } catch (e) {
      console.warn('Failed to start speech recognition:', e)
    }

    recognitionRef.current = recognition
  }, [onTranscript])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      streamRef.current = stream

      // Setup audio analyzer for visual feedback
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      const updateAudioLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setAudioLevel(average / 255)
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }
      updateAudioLevel()

      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      chunksRef.current = []
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (audioBlob.size > 100) {
          sendToTranscription(audioBlob)
        }
      }

      mediaRecorderRef.current.start(100)
      isRecordingRef.current = true
      setIsRecording(true)
      onRecordingChange?.(true)

      // Start Web Speech API for real-time transcription
      startRecognition()
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.')
      console.error('Error starting recording:', err)
    }
  }, [onTranscript, onRecordingChange, startRecognition])

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
      recognitionRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch (e) { /* ignore */ }
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch (e) { /* ignore */ }
      audioContextRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
    setAudioLevel(0)
    onRecordingChange?.(false)
  }, [onRecordingChange])

  const sendToTranscription = async (audioBlob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/api/voice/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.transcript) {
          setTranscript(data.transcript)
          onTranscript?.(data.transcript, true)
        }
      }
    } catch (err) {
      console.error('Transcription error:', err)
    }
  }

  useEffect(() => {
    return () => {
      isRecordingRef.current = false
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
      if (recognitionRef.current) try { recognitionRef.current.stop() } catch (_e) { /* ignore */ }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') try { mediaRecorderRef.current.stop() } catch (_e) { /* ignore */ }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) try { audioContextRef.current.close() } catch (_e) { /* ignore */ }
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-glow'
              : 'bg-gradient-brand hover:opacity-90'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}

          {isRecording && (
            <span
              className="absolute inset-0 rounded-full bg-red-400 animate-ping"
              style={{ opacity: Math.min(audioLevel * 0.8, 0.6) }}
            />
          )}
        </button>

        <div className="flex-1">
          {isRecording ? (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 items-end h-8">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(4, audioLevel * 32)}px`,
                      opacity: 0.5 + audioLevel * 0.5,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-ink-600 font-medium">Recording...</span>
            </div>
          ) : (
            <span className="text-sm text-ink-500">
              Click to start speaking
            </span>
          )}
        </div>
      </div>

      {(transcript || interimTranscript) && (
        <div className="p-4 bg-ink-50 rounded-xl border border-ink-200">
          <p className="text-sm font-semibold text-ink-700 mb-1">Your response:</p>
          <p className="text-ink-900">
            {transcript}
            <span className="text-ink-400 italic">{interimTranscript}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
