import { useState, useRef, useEffect, useCallback } from 'react'
import { Smile, Frown, Meh, Angry, Heart, Zap, Loader2 } from 'lucide-react'

const EMOTIONS = {
  neutral: { label: 'Neutral', color: 'text-gray-500', icon: Meh },
  happy: { label: 'Happy', color: 'text-green-500', icon: Smile },
  sad: { label: 'Sad', color: 'text-blue-500', icon: Frown },
  angry: { label: 'Angry', color: 'text-red-500', icon: Angry },
  surprised: { label: 'Surprised', color: 'text-yellow-500', icon: Zap },
  fearful: { label: 'Fearful', color: 'text-purple-500', icon: Frown },
  disgusted: { label: 'Disgusted', color: 'text-orange-500', icon: Frown },
  confident: { label: 'Confident', color: 'text-emerald-500', icon: Heart },
}

const SpeechEmotionAnalyzer = ({ audioStream, onEmotionChange, enabled = true }) => {
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [emotionHistory, setEmotionHistory] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioFeatures, setAudioFeatures] = useState({
    pitch: 0,
    energy: 0,
    speakingRate: 0,
    pauses: 0,
  })

  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastAnalysisTimeRef = useRef(0)

  const analyzeAudioFeatures = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)

    // Calculate audio features
    const data = dataArrayRef.current
    const sum = data.reduce((a, b) => a + b, 0)
    const average = sum / data.length
    const max = Math.max(...data)

    // Pitch estimation (simplified - based on dominant frequency)
    const dominantIndex = data.indexOf(max)
    const pitch = dominantIndex / data.length

    // Energy (volume level)
    const energy = average / 255

    // Update features
    setAudioFeatures({
      pitch: Math.round(pitch * 100),
      energy: Math.round(energy * 100),
      speakingRate: Math.round(energy * 50 + pitch * 50),
      pauses: energy < 0.1 ? 1 : 0,
    })

    // Simple emotion inference based on audio features
    let inferredEmotion = 'neutral'
    let inferredConfidence = 50

    if (energy > 0.6 && pitch > 0.5) {
      inferredEmotion = 'happy'
      inferredConfidence = 75
    } else if (energy > 0.5 && pitch < 0.3) {
      inferredEmotion = 'angry'
      inferredConfidence = 65
    } else if (energy < 0.2 && pitch < 0.3) {
      inferredEmotion = 'sad'
      inferredConfidence = 60
    } else if (energy > 0.4 && pitch > 0.6) {
      inferredEmotion = 'surprised'
      inferredConfidence = 55
    } else if (energy > 0.3 && energy < 0.5 && pitch > 0.4 && pitch < 0.6) {
      inferredEmotion = 'confident'
      inferredConfidence = 70
    }

    setCurrentEmotion(inferredEmotion)
    setConfidence(inferredConfidence)

    // Update history
    setEmotionHistory((prev) => {
      const newHistory = [...prev, { emotion: inferredEmotion, timestamp: Date.now() }]
      return newHistory.slice(-20)
    })

    onEmotionChange?.({
      emotion: inferredEmotion,
      confidence: inferredConfidence,
      features: {
        pitch: Math.round(pitch * 100),
        energy: Math.round(energy * 100),
      },
    })
  }, [onEmotionChange])

  const startAnalysis = useCallback(async () => {
    if (!audioStream) return

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(audioStream)

      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8

      source.connect(analyserRef.current)

      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)

      setIsAnalyzing(true)

      const analyze = () => {
        const now = Date.now()
        if (now - lastAnalysisTimeRef.current >= 500) {
          lastAnalysisTimeRef.current = now
          analyzeAudioFeatures()
        }
        animationFrameRef.current = requestAnimationFrame(analyze)
      }

      analyze()
    } catch (err) {
      console.error('Error starting emotion analysis:', err)
    }
  }, [audioStream, analyzeAudioFeatures])

  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setIsAnalyzing(false)
  }, [])

  useEffect(() => {
    if (enabled && audioStream) {
      startAnalysis()
    }

    return () => {
      stopAnalysis()
    }
  }, [enabled, audioStream, startAnalysis, stopAnalysis])

  const getEmotionDistribution = () => {
    const distribution = {}
    emotionHistory.forEach(({ emotion }) => {
      distribution[emotion] = (distribution[emotion] || 0) + 1
    })
    return distribution
  }

  const EmotionIcon = EMOTIONS[currentEmotion]?.icon || Meh

  if (!enabled) return null

  return (
    <div className="bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden">
      <div className="p-4 border-b border-ink-100 bg-gradient-brand-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-primary-600" />
            Speech Emotion
          </h3>
          {isAnalyzing ? (
            <span className="flex items-center text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
              Analyzing
            </span>
          ) : (
            <span className="text-xs text-ink-400">Waiting for audio...</span>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Current Emotion */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3.5 rounded-2xl bg-ink-50 ${EMOTIONS[currentEmotion]?.color}`}>
            <EmotionIcon className="w-10 h-10" />
          </div>
          <div>
            <p className={`text-lg font-semibold ${EMOTIONS[currentEmotion]?.color}`}>
              {EMOTIONS[currentEmotion]?.label || 'Unknown'}
            </p>
            <p className="text-xs text-ink-500">Confidence: {confidence}%</p>
          </div>
        </div>

        {/* Audio Features */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-ink-50 rounded-xl">
            <p className="text-xs text-ink-500">Pitch</p>
            <p className="font-semibold text-ink-900">{audioFeatures.pitch}%</p>
          </div>
          <div className="p-3 bg-ink-50 rounded-xl">
            <p className="text-xs text-ink-500">Energy</p>
            <p className="font-semibold text-ink-900">{audioFeatures.energy}%</p>
          </div>
          <div className="p-3 bg-ink-50 rounded-xl">
            <p className="text-xs text-ink-500">Speaking Rate</p>
            <p className="font-semibold text-ink-900">{audioFeatures.speakingRate}%</p>
          </div>
          <div className="p-3 bg-ink-50 rounded-xl">
            <p className="text-xs text-ink-500">Pauses</p>
            <p className="font-semibold text-ink-900">{audioFeatures.pauses}</p>
          </div>
        </div>

        {/* Emotion Timeline */}
        {emotionHistory.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-ink-500 mb-2">Emotion Timeline</p>
            <div className="flex space-x-1">
              {emotionHistory.slice(-10).map((item, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    EMOTIONS[item.emotion]?.color || 'text-ink-400'
                  } bg-ink-100`}
                  title={EMOTIONS[item.emotion]?.label}
                >
                  {(() => {
                    const Icon = EMOTIONS[item.emotion]?.icon || Meh
                    return <Icon className="w-4 h-4" />
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotion Distribution */}
        {emotionHistory.length > 5 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-ink-500 mb-2">Session Distribution</p>
            <div className="space-y-1.5">
              {Object.entries(getEmotionDistribution())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([emotion, count]) => (
                  <div key={emotion} className="flex items-center justify-between text-xs">
                    <span className={EMOTIONS[emotion]?.color}>
                      {EMOTIONS[emotion]?.label}
                    </span>
                    <span className="text-ink-500">
                      {Math.round((count / emotionHistory.length) * 100)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpeechEmotionAnalyzer
