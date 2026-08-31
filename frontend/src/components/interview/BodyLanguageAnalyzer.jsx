import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, AlertCircle, Activity, Sparkles } from 'lucide-react'

const PRESENCE_WINDOW = 30
const EYE_CONTACT_WINDOW = 150
const FIDGET_WINDOW = 30
const ABSENCE_TIMEOUT_MS = 3000
const STILLNESS_TIMEOUT_MS = 5000

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
  const poseHistoryRef = useRef([])
  const lastAnalysisTimeRef = useRef(0)

  const posePresenceWindowRef = useRef([])
  const absenceStartRef = useRef(null)
  const eyeContactHistoryRef = useRef([])
  const prevLandmarksRef = useRef(null)
  const engagementHistoryRef = useRef([])
  const lastMovementTimeRef = useRef(Date.now())
  const analyzePostureRef = useRef(null)

  const resetState = useCallback(() => {
    const blank = {
      posture: 'unknown',
      engagement: 0,
      eyeContact: 0,
      fidgeting: 0,
      confidence: 0,
      presence: 0,
      alerts: [],
    }
    setAnalysis(blank)
    onAnalysisUpdate?.(blank)
    posePresenceWindowRef.current = []
    absenceStartRef.current = null
    eyeContactHistoryRef.current = []
    prevLandmarksRef.current = null
    engagementHistoryRef.current = []
    lastMovementTimeRef.current = Date.now()
    poseHistoryRef.current = []
  }, [onAnalysisUpdate])

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

          analyzePostureRef.current?.(results.poseLandmarks)
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
    if (now - lastAnalysisTimeRef.current < 300) return
    lastAnalysisTimeRef.current = now

    const nose = landmarks[0]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
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
    const hipCenter = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    }
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) || 0.1

    const poseDetected = nose.visibility > 0.5 && leftShoulder.visibility > 0.3 && rightShoulder.visibility > 0.3

    posePresenceWindowRef.current.push(poseDetected)
    if (posePresenceWindowRef.current.length > PRESENCE_WINDOW) posePresenceWindowRef.current.shift()

    const presenceCount = posePresenceWindowRef.current.filter(Boolean).length
    const presenceRatio = posePresenceWindowRef.current.length > 0
      ? presenceCount / posePresenceWindowRef.current.length
      : 0

    let presence = Math.round(presenceRatio * 100)

    if (!poseDetected) {
      if (absenceStartRef.current === null) {
        absenceStartRef.current = now
      }
      const absentDuration = now - absenceStartRef.current
      if (absentDuration > ABSENCE_TIMEOUT_MS) {
        presence = 0
      } else {
        presence = Math.round(presence * Math.max(0, 1 - absentDuration / ABSENCE_TIMEOUT_MS))
      }
    } else {
      absenceStartRef.current = null
    }

    let posture = 'unknown'
    if (poseDetected) {
      const spineDx = shoulderCenter.x - hipCenter.x
      const spineDy = shoulderCenter.y - hipCenter.y
      const spineAngle = Math.abs(Math.atan2(spineDx, spineDy) * (180 / Math.PI))

      const headTilt = (nose.x - shoulderCenter.x) / shoulderWidth

      if (spineAngle < 12 && Math.abs(headTilt) < 0.15) {
        posture = 'upright'
      } else if (spineAngle >= 20) {
        posture = 'slouching'
      } else if (Math.abs(headTilt) >= 0.15) {
        posture = 'leaning'
      } else {
        posture = 'upright'
      }
    }

    const headYaw = (nose.x - (leftEar.x + rightEar.x) / 2) / shoulderWidth
    const headPitch = (nose.y - shoulderCenter.y) / (Math.abs(hipCenter.y - shoulderCenter.y) || 0.1)

    const faceVisible = nose.visibility > 0.5 && leftEar.visibility > 0.3 && rightEar.visibility > 0.3
    const faceOrientation = faceVisible ? Math.max(0, 1 - Math.abs(headYaw) * 2) : 0
    const pitchNormal = headPitch > 0.2 && headPitch < 0.8 ? 1 : 0.5

    const handLeftDisp = leftWrist.visibility > 0.5
      ? Math.hypot(leftWrist.x - leftElbow.x, leftWrist.y - leftElbow.y)
      : 0
    const handRightDisp = rightWrist.visibility > 0.5
      ? Math.hypot(rightWrist.x - rightElbow.x, rightWrist.y - rightElbow.y)
      : 0
    const gestureActivity = Math.min(1, (handLeftDisp + handRightDisp) / 0.4)

    const stillnessPenalty = (now - lastMovementTimeRef.current) > STILLNESS_TIMEOUT_MS ? 0.5 : 1

    const engagementRaw = (faceOrientation * 35 + presenceRatio * 35 + pitchNormal * 15 + gestureActivity * 15) * stillnessPenalty
    const engagement = Math.round(Math.min(100, Math.max(0, engagementRaw)))

    engagementHistoryRef.current.push(engagement)
    if (engagementHistoryRef.current.length > 10) engagementHistoryRef.current.shift()
    const smoothedEngagement = Math.round(
      engagementHistoryRef.current.reduce((a, b) => a + b, 0) / engagementHistoryRef.current.length
    )

    const eyeContactRaw = faceVisible
      ? Math.max(0, Math.min(100, 100 - Math.abs(headYaw) * 300 - Math.abs(headPitch - 0.45) * 100))
      : 0
    eyeContactHistoryRef.current.push(eyeContactRaw)
    if (eyeContactHistoryRef.current.length > EYE_CONTACT_WINDOW) eyeContactHistoryRef.current.shift()
    const eyeContact = Math.round(
      eyeContactHistoryRef.current.reduce((a, b) => a + b, 0) / eyeContactHistoryRef.current.length
    )

    let fidgeting = 0
    if (prevLandmarksRef.current) {
      const prev = prevLandmarksRef.current
      const handDisp = Math.hypot(leftWrist.x - prev.leftWrist.x, leftWrist.y - prev.leftWrist.y)
        + Math.hypot(rightWrist.x - prev.rightWrist.x, rightWrist.y - prev.rightWrist.y)
      const headDisp = Math.hypot(nose.x - prev.nose.x, nose.y - prev.nose.y)
      const shoulderDisp = Math.hypot(shoulderCenter.x - prev.shoulderCenter.x, shoulderCenter.y - prev.shoulderCenter.y)
      const totalDisp = handDisp + headDisp + shoulderDisp

      if (totalDisp > 0.005) {
        lastMovementTimeRef.current = now
      }

      const rawFidget = Math.min(100, totalDisp * 500)
      poseHistoryRef.current.push(rawFidget)
      if (poseHistoryRef.current.length > FIDGET_WINDOW) poseHistoryRef.current.shift()

      fidgeting = Math.round(
        poseHistoryRef.current.reduce((a, b) => a + b, 0) / poseHistoryRef.current.length
      )
    }

    prevLandmarksRef.current = {
      nose: { x: nose.x, y: nose.y },
      leftWrist: { x: leftWrist.x, y: leftWrist.y },
      rightWrist: { x: rightWrist.x, y: rightWrist.y },
      shoulderCenter: { x: shoulderCenter.x, y: shoulderCenter.y },
    }

    const postureScore = posture === 'upright' ? 40 : posture === 'leaning' ? 25 : posture === 'slouching' ? 10 : 0
    const confidenceScore = Math.round(
      postureScore + smoothedEngagement * 0.3 + eyeContact * 0.2 + (100 - fidgeting) * 0.1
    )

    const alerts = []
    if (posture === 'slouching') alerts.push({ type: 'warning', message: 'Slouching detected - sit up straight' })
    if (posture === 'leaning') alerts.push({ type: 'warning', message: 'Leaning - maintain centered posture' })
    if (smoothedEngagement < 50) alerts.push({ type: 'warning', message: 'Low engagement - face the camera' })
    if (fidgeting > 60) alerts.push({ type: 'info', message: 'Excessive movement detected' })
    if (!poseDetected && absenceStartRef.current && (now - absenceStartRef.current) > 2000) {
      alerts.push({ type: 'warning', message: 'No person detected in frame' })
    }

    const newAnalysis = {
      posture,
      engagement: smoothedEngagement,
      eyeContact,
      fidgeting,
      confidence: confidenceScore,
      presence,
      alerts,
    }

    setAnalysis(newAnalysis)
    onAnalysisUpdate?.(newAnalysis)
  }, [onAnalysisUpdate])

  analyzePostureRef.current = analyzePosture

  const startAnalysis = useCallback(async () => {
    setError(null)
    resetState()
    const success = await initializePose()
    if (success) {
      await cameraRef.current.start()
      setIsActive(true)
    }
  }, [initializePose, resetState])

  const stopAnalysis = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop()
      cameraRef.current = null
    }
    if (poseRef.current) {
      poseRef.current.close()
      poseRef.current = null
    }
    prevLandmarksRef.current = null
    resetState()
    setIsActive(false)
  }, [resetState])

  useEffect(() => {
    if (enabled && !isActive) {
      startAnalysis()
    }
    return () => {
      if (cameraRef.current) cameraRef.current.stop()
      if (poseRef.current) poseRef.current.close()
      prevLandmarksRef.current = null
    }
  }, [enabled])

  const getPostureColor = (posture) => {
    switch (posture) {
      case 'upright': return 'text-emerald-500'
      case 'leaning': return 'text-amber-500'
      case 'slouching': return 'text-red-500'
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
