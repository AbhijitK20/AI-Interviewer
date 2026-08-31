import { useState, useRef, useEffect, useCallback } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Eye, Users, Monitor, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'

const VIOLATION_WEIGHTS = {
  noFace: 20,
  multipleFaces: 15,
  gazeAway: 5,
  tabSwitch: 10,
  fullscreenExit: 10,
}

const GAZE_AWAY_THRESHOLD_MS = 3000
const NO_FACE_THRESHOLD_MS = 5000

const ProctoringMonitor = ({ onViolation, enabled = true }) => {
  const [isActive, setIsActive] = useState(false)
  const [violations, setViolations] = useState([])
  const [integrityScore, setIntegrityScore] = useState(100)
  const [status, setStatus] = useState({
    facesDetected: 0,
    gazeDirection: 'center',
    isLookingAway: false,
    expression: 'neutral',
    blinkRate: 0,
    phoneDetected: false,
    multipleFaces: false,
    noFaceDetected: false,
    tabSwitchCount: 0,
    fullscreenExited: false,
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const detectorRef = useRef(null)
  const intervalRef = useRef(null)
  const streamRef = useRef(null)
  const blinkHistoryRef = useRef([])
  const lastBlinkTimeRef = useRef(0)
  const gazeHistoryRef = useRef([])

  const gazeAwayStartRef = useRef(null)
  const gazeViolationLoggedRef = useRef(false)
  const noFaceStartRef = useRef(null)
  const noFaceViolationLoggedRef = useRef(false)
  const multipleFacesViolationLoggedRef = useRef(false)
  const tabSwitchCountRef = useRef(0)
  const fullscreenExitedRef = useRef(false)
  const cleanupListenersRef = useRef(null)

  const addViolation = useCallback((type, message, severity = 'warning') => {
    const violation = {
      id: Date.now(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
    }
    setViolations((prev) => [...prev.slice(-9), violation])
    onViolation?.(violation)
  }, [onViolation])

  const eyeAspectRatio = (eye) => {
    if (!eye || eye.length < 6) return 1
    const [p1, p2, p3, p4, p5, p6] = eye
    const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y)
    const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y)
    const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y)
    return (vertical1 + vertical2) / (2.0 * horizontal)
  }

  const initializeDetector = useCallback(async () => {
    try {
      const faceapi = await import('@vladmandic/face-api')
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])

      detectorRef.current = faceapi
      return true
    } catch (err) {
      console.error('Error initializing face detection:', err)
      return false
    }
  }, [])

  const startMonitoring = useCallback(async () => {
    try {
      const success = await initializeDetector()
      if (!success) return

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current
        await videoRef.current.play()
      }

      setIsActive(true)

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !detectorRef.current) return

        const detections = await detectorRef.current
          .detectAllFaces(videoRef.current, new detectorRef.current.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()

        const faceCount = detections.length
        const now = Date.now()

        let gazeDirection = 'center'
        let isLookingAway = false
        let blinkRate = 0

        if (faceCount === 1) {
          const det = detections[0]
          const landmarks = det.landmarks
          const leftEye = landmarks.getLeftEye()
          const rightEye = landmarks.getRightEye()

          const leftCenter = leftEye.reduce((a, p) => ({ x: a.x + p.x / leftEye.length, y: a.y + p.y / leftEye.length }), { x: 0, y: 0 })
          const rightCenter = rightEye.reduce((a, p) => ({ x: a.x + p.x / rightEye.length, y: a.y + p.y / rightEye.length }), { x: 0, y: 0 })

          const eyeMidX = (leftCenter.x + rightCenter.x) / 2
          const faceBox = det.detection.box
          const faceCenterX = faceBox.x + faceBox.width / 2
          const faceWidth = faceBox.width

          const gazeRatio = (eyeMidX - faceCenterX) / faceWidth

          gazeHistoryRef.current.push(gazeRatio)
          if (gazeHistoryRef.current.length > 5) gazeHistoryRef.current.shift()
          const avgGaze = gazeHistoryRef.current.reduce((a, b) => a + b, 0) / gazeHistoryRef.current.length

          if (avgGaze < -0.12) {
            gazeDirection = 'left'
          } else if (avgGaze > 0.12) {
            gazeDirection = 'right'
          } else {
            gazeDirection = 'center'
          }

          const gazeIsAway = gazeDirection !== 'center'

          if (gazeIsAway) {
            if (gazeAwayStartRef.current === null) {
              gazeAwayStartRef.current = now
              gazeViolationLoggedRef.current = false
            }
            const awayDuration = now - gazeAwayStartRef.current
            if (awayDuration >= GAZE_AWAY_THRESHOLD_MS) {
              isLookingAway = true
              if (!gazeViolationLoggedRef.current) {
                addViolation('gaze_away', `Gaze away for ${Math.round(awayDuration / 1000)}s - candidate may be distracted`, 'warning')
                gazeViolationLoggedRef.current = true
              }
            }
          } else {
            gazeAwayStartRef.current = null
            gazeViolationLoggedRef.current = false
            isLookingAway = false
          }

          const leftEAR = eyeAspectRatio(leftEye)
          const rightEAR = eyeAspectRatio(rightEye)
          const ear = (leftEAR + rightEAR) / 2

          if (ear < 0.2) {
            if (now - lastBlinkTimeRef.current > 400) {
              lastBlinkTimeRef.current = now
              blinkHistoryRef.current.push(now)
              if (blinkHistoryRef.current.length > 60) blinkHistoryRef.current.shift()
            }
          }

          if (blinkHistoryRef.current.length >= 2) {
            const span = blinkHistoryRef.current[blinkHistoryRef.current.length - 1] - blinkHistoryRef.current[0]
            const seconds = span / 1000
            blinkRate = seconds > 0 ? Math.round((blinkHistoryRef.current.length / seconds) * 60) : 0
          }

          multipleFacesViolationLoggedRef.current = false
        } else if (faceCount === 0) {
          if (noFaceStartRef.current === null) {
            noFaceStartRef.current = now
            noFaceViolationLoggedRef.current = false
          }
          const noFaceDuration = now - noFaceStartRef.current
          if (noFaceDuration >= NO_FACE_THRESHOLD_MS && !noFaceViolationLoggedRef.current) {
            addViolation('no_face', `No face detected for ${Math.round(noFaceDuration / 1000)}s - candidate may have left`, 'critical')
            noFaceViolationLoggedRef.current = true
          }
          gazeAwayStartRef.current = null
          gazeViolationLoggedRef.current = false
        } else {
          if (!multipleFacesViolationLoggedRef.current) {
            addViolation('multiple_faces', 'Multiple faces detected - possible assistance', 'critical')
            multipleFacesViolationLoggedRef.current = true
          }
          noFaceStartRef.current = null
          noFaceViolationLoggedRef.current = false
          gazeAwayStartRef.current = null
          gazeViolationLoggedRef.current = false
        }

        if (faceCount > 0 && !multipleFacesViolationLoggedRef.current) {
          noFaceStartRef.current = null
          noFaceViolationLoggedRef.current = false
        }

        let score = 100

        if (faceCount === 0 && noFaceStartRef.current && (now - noFaceStartRef.current) > NO_FACE_THRESHOLD_MS) {
          score -= VIOLATION_WEIGHTS.noFace
        }

        if (faceCount > 1) score -= VIOLATION_WEIGHTS.multipleFaces

        if (faceCount === 1 && gazeAwayStartRef.current && (now - gazeAwayStartRef.current) > GAZE_AWAY_THRESHOLD_MS) {
          score -= VIOLATION_WEIGHTS.gazeAway
        }

        score -= Math.min(30, tabSwitchCountRef.current * VIOLATION_WEIGHTS.tabSwitch)

        if (fullscreenExitedRef.current) score -= VIOLATION_WEIGHTS.fullscreenExit

        score = Math.max(0, Math.min(100, score))

        const activity = score >= 80 ? 'neutral' : score >= 50 ? 'distracted' : 'suspicious'

        setIntegrityScore(score)
        setStatus((prev) => ({
          ...prev,
          facesDetected: faceCount,
          gazeDirection,
          isLookingAway,
          expression: activity,
          blinkRate,
          multipleFaces: faceCount > 1,
          noFaceDetected: faceCount === 0,
          tabSwitchCount: tabSwitchCountRef.current,
          fullscreenExited: fullscreenExitedRef.current,
        }))

        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          detections.forEach((detection) => {
            const box = detection.detection.box
            const isSuspicious = (faceCount === 1 && isLookingAway) || faceCount > 1
            ctx.strokeStyle = isSuspicious ? '#f59e0b' : '#10b981'
            ctx.lineWidth = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)

            if (faceCount === 1) {
              const leftEye = detection.landmarks.getLeftEye()
              const rightEye = detection.landmarks.getRightEye()
              const lCenter = leftEye.reduce((a, p) => ({ x: a.x + p.x / leftEye.length, y: a.y + p.y / leftEye.length }), { x: 0, y: 0 })
              const rCenter = rightEye.reduce((a, p) => ({ x: a.x + p.x / rightEye.length, y: a.y + p.y / rightEye.length }), { x: 0, y: 0 })
              const eyeMid = { x: (lCenter.x + rCenter.x) / 2, y: (lCenter.y + rCenter.y) / 2 }
              ctx.fillStyle = '#6366f1'
              ctx.beginPath()
              ctx.arc(eyeMid.x, eyeMid.y, 3, 0, 2 * Math.PI)
              ctx.fill()
            }
          })
        }
      }, 1000)

      const handleVisibilityChange = () => {
        if (document.hidden) {
          tabSwitchCountRef.current += 1
          addViolation('tab_switch', 'Candidate switched tabs', 'warning')
        }
      }

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          fullscreenExitedRef.current = true
          addViolation('fullscreen_exit', 'Exited fullscreen mode', 'info')
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      document.addEventListener('fullscreenchange', handleFullscreenChange)

      cleanupListenersRef.current = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
    } catch (err) {
      console.error('Error starting proctoring:', err)
    }
  }, [initializeDetector, addViolation])

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    cleanupListenersRef.current?.()
    cleanupListenersRef.current = null
    gazeAwayStartRef.current = null
    gazeViolationLoggedRef.current = false
    noFaceStartRef.current = null
    noFaceViolationLoggedRef.current = false
    multipleFacesViolationLoggedRef.current = false
    setIsActive(false)
  }, [])

  useEffect(() => {
    if (enabled && !isActive) {
      startMonitoring()
    }
    return () => {
      stopMonitoring()
    }
  }, [enabled])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getIntegrityColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const IntegrityIcon = integrityScore >= 80 ? ShieldCheck : integrityScore >= 50 ? ShieldAlert : Shield

  if (!enabled) return null

  return (
    <div className="bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden">
      <div className="p-4 border-b border-ink-100 bg-gradient-brand-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-600" />
            Proctoring Monitor
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500'
          }`}>
            <span className="inline-flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-ink-400'}`} />
              {isActive ? 'Live' : 'Inactive'}
            </span>
          </span>
        </div>
      </div>

      {/* Integrity Score Gauge */}
      <div className="p-4 flex items-center gap-4 border-b border-ink-100">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={getIntegrityColor(integrityScore)} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(integrityScore / 100) * 175.9} 175.9`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <IntegrityIcon className="w-6 h-6" style={{ color: getIntegrityColor(integrityScore) }} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-ink-900" style={{ color: getIntegrityColor(integrityScore) }}>
            {integrityScore}
          </p>
          <p className="text-xs text-ink-500">Integrity Score</p>
        </div>
        <div className="ml-auto text-right">
          <div className="flex items-center justify-end gap-1 text-xs">
            <Eye className="w-3.5 h-3.5 text-ink-400" />
            <span className="text-ink-600 capitalize">{status.gazeDirection}</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-xs mt-1">
            <Activity className="w-3.5 h-3.5 text-ink-400" />
            <span className="text-ink-600 capitalize">{status.expression}</span>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative bg-ink-900 overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-36 object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-36 object-cover"
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/80">
            <p className="text-ink-400 text-xs">Proctoring camera</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            status.isLookingAway ? 'bg-amber-500/90 text-white' : 'bg-emerald-500/90 text-white'
          }`}>
            {status.isLookingAway ? 'Looking away' : 'Focused'}
          </span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <div className={`flex items-center p-2.5 rounded-xl text-xs font-medium ${
          status.facesDetected === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <Users className="w-4 h-4 mr-1.5" />
          {status.facesDetected === 1 ? '1 Person' : `${status.facesDetected} People`}
        </div>
        <div className={`flex items-center p-2.5 rounded-xl text-xs font-medium ${
          status.tabSwitchCount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <Monitor className="w-4 h-4 mr-1.5" />
          {status.tabSwitchCount} Tab {status.tabSwitchCount === 1 ? 'Switch' : 'Switches'}
        </div>
        <div className="flex items-center p-2.5 rounded-xl text-xs font-medium bg-ink-50 text-ink-700">
          <Eye className="w-4 h-4 mr-1.5" />
          {status.blinkRate} blinks/min
        </div>
        <div className={`flex items-center p-2.5 rounded-xl text-xs font-medium ${
          !status.fullscreenExited ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <Monitor className="w-4 h-4 mr-1.5" />
          {status.fullscreenExited ? 'Exited FS' : 'Fullscreen'}
        </div>
      </div>

      {/* Violations Log */}
      <div className="px-4 pb-4">
        {violations.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <p className="text-xs font-semibold text-ink-500">Recent Alerts</p>
            {violations.slice().reverse().map((violation) => (
              <div
                key={violation.id}
                className={`flex items-start p-2 rounded-xl border text-xs animate-fade-in ${getSeverityColor(violation.severity)}`}
              >
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{violation.message}</p>
                  <p className="text-ink-400 mt-0.5">
                    {new Date(violation.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-3 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
            <span className="text-xs text-emerald-700 font-medium">All clear - no violations detected</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProctoringMonitor
