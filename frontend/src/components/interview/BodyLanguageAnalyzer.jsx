import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, AlertCircle, Activity, Sparkles } from 'lucide-react'

const BodyLanguageAnalyzer = ({ onAnalysisUpdate, enabled = true }) => {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState({
    posture: 'unknown',
    engagement: 0,
    eyeContact: 0,
    fidgeting: 0,
    confidence: 0,
    presence: 0,
    alerts: [],
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const animationFrameRef = useRef(null)
  const poseHistoryRef = useRef([])
  const lastAnalysisTimeRef = useRef(0)

  const initializePose = useCallback(async () => {
    try {
      const { Pose } = await import('@mediapipe/pose')
      const { Camera } = await import('@mediapipe/camera_utils')
      const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils')

      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        },
      })

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      pose.onResults((results) => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = results.image.width
        canvas.height = results.image.height

        ctx.save()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

        if (results.poseLandmarks) {
          drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
            color: '#6366f1',
            lineWidth: 2,
          })
          drawLandmarks(ctx, results.poseLandmarks, {
            color: '#8b5cf6',
            lineWidth: 1,
            radius: 3,
          })

          analyzePosture(results.poseLandmarks)
        }

        ctx.restore()
      })

      poseRef.current = pose

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current) {
            await poseRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
      })

      cameraRef.current = camera
      return true
    } catch (err) {
      console.error('Error initializing pose detection:', err)
      setError('Failed to initialize body language analysis')
      return false
    }
  }, [])

  const analyzePosture = useCallback((landmarks) => {
    const now = Date.now()
    if (now - lastAnalysisTimeRef.current < 1000) return
    lastAnalysisTimeRef.current = now

    const nose = landmarks[0]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftEar = landmarks[7]
    const rightEar = landmarks[8]
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]
    const leftElbow = landmarks[13]
    const rightElbow = landmarks[14]

    const shoulderCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    }
    const headCenter = { x: nose.x, y: nose.y }

    // Posture
    const headOffset = Math.abs(headCenter.x - shoulderCenter.x)
    const postureScore = headOffset < 0.1 ? 'good' : headOffset < 0.2 ? 'fair' : 'poor'

    // Engagement
    const faceVisible = nose.visibility > 0.5 && leftEar.visibility > 0.3 && rightEar.visibility > 0.3
    const engagementScore = faceVisible ? Math.min(100, 70 + nose.visibility * 30) : 30

    // Eye contact
    const earDiff = Math.abs(leftEar.z - rightEar.z)
    const eyeContactScore = earDiff < 0.05 ? 90 : earDiff < 0.1 ? 70 : 50

    // Hand gesture detection (hands near face = thinking/covering, hands visible = expressive)
    const leftHandVisible = leftWrist.visibility > 0.5
    const rightHandVisible = rightWrist.visibility > 0.5
    const handFaceDistance = Math.min(
      Math.hypot(leftWrist.x - nose.x, leftWrist.y - nose.y),
      Math.hypot(rightWrist.x - nose.x, rightWrist.y - nose.y)
    )
    const handsNearFace = handFaceDistance < 0.25 && (leftHandVisible || rightHandVisible)
    const expressiveGestures = (leftHandVisible && Math.hypot(leftWrist.x - leftElbow.x, leftWrist.y - leftElbow.y) > 0.15) ||
                               (rightHandVisible && Math.hypot(rightWrist.x - rightElbow.x, rightWrist.y - rightElbow.y) > 0.15)

    // Fidgeting
    poseHistoryRef.current.push({
      timestamp: now,
      shoulderY: shoulderCenter.y,
      headX: headCenter.x,
      handY: (leftWrist.y + rightWrist.y) / 2,
    })
    if (poseHistoryRef.current.length > 30) poseHistoryRef.current.shift()

    let fidgetScore = 0
    if (poseHistoryRef.current.length >= 10) {
      const recent = poseHistoryRef.current.slice(-10)
      const shoulderVariance = calculateVariance(recent.map((p) => p.shoulderY))
      const headVariance = calculateVariance(recent.map((p) => p.headX))
      const handVariance = calculateVariance(recent.map((p) => p.handY))
      fidgetScore = Math.min(100, (shoulderVariance + headVariance + handVariance) * 700)
    }

    // Confidence
    const confidenceScore = Math.round(
      (postureScore === 'good' ? 40 : postureScore === 'fair' ? 25 : 10) +
      engagementScore * 0.3 +
      eyeContactScore * 0.2 +
      (100 - fidgetScore) * 0.1
    )

    // Presence score (overall composure)
    const presence = Math.round(
      engagementScore * 0.4 +
      eyeContactScore * 0.3 +
      (100 - fidgetScore) * 0.2 +
      (postureScore === 'good' ? 10 : postureScore === 'fair' ? 5 : 0)
    )

    const alerts = []
    if (postureScore === 'poor') alerts.push({ type: 'warning', message: 'Poor posture - sit up straight' })
    if (engagementScore < 50) alerts.push({ type: 'warning', message: 'Low engagement - face the camera' })
    if (fidgetScore > 60) alerts.push({ type: 'info', message: 'Excessive movement detected' })
    if (handsNearFace) alerts.push({ type: 'info', message: 'Hands near face - possibly nervous' })
    if (expressiveGestures) alerts.push({ type: 'success', message: 'Good expressive gestures' })

    const newAnalysis = {
      posture: postureScore,
      engagement: Math.round(engagementScore),
      eyeContact: Math.round(eyeContactScore),
      fidgeting: Math.round(fidgetScore),
      confidence: confidenceScore,
      presence: presence,
      alerts,
    }

    setAnalysis(newAnalysis)
    onAnalysisUpdate?.(newAnalysis)
  }, [onAnalysisUpdate])

  const calculateVariance = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  const startAnalysis = useCallback(async () => {
    setError(null)
    const success = await initializePose()
    if (success) {
      await cameraRef.current.start()
      setIsActive(true)
    }
  }, [initializePose])

  const stopAnalysis = useCallback(() => {
    if (cameraRef.current) cameraRef.current.stop()
    if (poseRef.current) {
      poseRef.current.close()
      poseRef.current = null
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    setIsActive(false)
  }, [])

  useEffect(() => {
    if (enabled && !isActive) startAnalysis()
    return () => { stopAnalysis() }
  }, [enabled])

  const getPostureColor = (posture) => {
    switch (posture) {
      case 'good': return 'text-emerald-500'
      case 'fair': return 'text-amber-500'
      case 'poor': return 'text-red-500'
      default: return 'text-ink-400'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const ScoreBar = ({ label, value, invert = false }) => {
    const displayValue = invert ? 100 - value : value
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ink-500">{label}</span>
          <span className="font-medium text-ink-700">{value}%</span>
        </div>
        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${displayValue}%`, background: getScoreColor(displayValue) }}
          />
        </div>
      </div>
    )
  }

  if (!enabled) return null

  return (
    <div className="bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden">
      <div className="p-4 border-b border-ink-100 bg-gradient-brand-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-600" />
            Body Language
          </h3>
          <button
            onClick={isActive ? stopAnalysis : startAnalysis}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {isActive ? <CameraOff className="w-3.5 h-3.5 mr-1" /> : <Camera className="w-3.5 h-3.5 mr-1" />}
            {isActive ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="relative bg-ink-900 overflow-hidden">
        <video ref={videoRef} className="w-full h-44 object-cover" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-44 object-cover" />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/80">
            <p className="text-ink-400 text-sm">Camera preview will appear here</p>
          </div>
        )}
      </div>

      {/* Presence score */}
      <div className="p-4 flex items-center gap-4 border-b border-ink-100">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={getScoreColor(analysis.presence)} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(analysis.presence / 100) * 175.9} 175.9`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6" style={{ color: getScoreColor(analysis.presence) }} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: getScoreColor(analysis.presence) }}>{analysis.presence}</p>
          <p className="text-xs text-ink-500">Presence Score</p>
        </div>
        <div className="ml-auto text-right">
          <p className={`font-semibold capitalize ${getPostureColor(analysis.posture)}`}>{analysis.posture}</p>
          <p className="text-xs text-ink-500">Posture</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <ScoreBar label="Engagement" value={analysis.engagement} />
        <ScoreBar label="Eye Contact" value={analysis.eyeContact} />
        <ScoreBar label="Fidgeting" value={analysis.fidgeting} invert />
      </div>

      {analysis.alerts.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {analysis.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-center p-2 rounded-xl text-xs animate-fade-in ${
                alert.type === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : alert.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BodyLanguageAnalyzer
